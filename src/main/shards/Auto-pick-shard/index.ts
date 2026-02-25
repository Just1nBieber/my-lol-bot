import type { BaiYueKuiShard } from '@shared/yuekui-shard/interface'
import type { IReactionDisposer } from 'mobx'
import type { LcuSessionData } from '../Lcu-state/type'

import { reaction } from 'mobx'
import { lcuState } from '../Lcu-state/state'
import { Shard } from '@shared/yuekui-shard/decorators'
import { LeagueWebSocket, createHttp1Request } from 'league-connect'

const SHARD_ID = 'auto-pick'

@Shard(SHARD_ID)
export class AutoPickShard implements BaiYueKuiShard {
  id: string = SHARD_ID
  static id = SHARD_ID
  private _cleanupFns: IReactionDisposer[] = []

  onInit(): void {
    console.log('启动自动选择英雄模块')
    const disposeFunction = reaction(
      () => lcuState.socket,
      (socket) => {
        console.log('🔌 WebSocket 就绪，开始监听选人会话')
        if (socket) this.subscribeToSession(socket)
      }
    )
    this._cleanupFns.push(disposeFunction)
  }

  onDispose(): void {
    this._cleanupFns.forEach((d) => d())
  }

  subscribeToSession(socket: LeagueWebSocket): void {
    const ws = socket

    if (!ws) {
      console.warn(`${this.id}没有建立起websocket`)
      return
    }

    ws!.subscribe('/lol-champ-select/v1/session', (data) => {
      if (!data || !data.actions) return
      const { localPlayerCellId, actions } = data as LcuSessionData
      const flatArray = actions.flat()

      const allMyActions = flatArray.filter((item) => item.actorCellId === localPlayerCellId)

      console.log(
        '我的所有动作状态',
        allMyActions.map((a) => ({
          type: a.type,
          isInProgress: a.isInProgress,
          completed: a.completed
        }))
      )

      const IhaveCurrentActionOrNot = flatArray.find(
        (item) => item.actorCellId === localPlayerCellId && item.isInProgress === true
      )

      if (!IhaveCurrentActionOrNot) {
        console.log('没有当前动作的相关顺序')
        return
      } else if (IhaveCurrentActionOrNot.completed) {
        console.log(`${IhaveCurrentActionOrNot.type}已是完成状态，正在退出逻辑`)
        return
      }

      switch (IhaveCurrentActionOrNot.type) {
        case 'ban':
          console.log('正在进行ban阶段')
          break
        case 'pick':
          console.log('正在进行pick阶段')
          this.toPickChamp(IhaveCurrentActionOrNot.id)
          break
        default:
          console.log('未知任务类型:', IhaveCurrentActionOrNot.type)
      }
    })
  }

  toPickChamp(actionId: number): void {
    const credential = lcuState.credential
    if (credential) {
      void createHttp1Request(
        {
          method: 'PATCH',
          url: `/lol-champ-select/v1/session/actions/${actionId}`,
          body: lcuState.targetChampionObj
        },
        credential
      ).catch((error) => {
        // 在这里拦截错误，防止系统崩溃
        console.error(`❌ [AutoPick] 发送选人指令失败 (ActionID: ${actionId}):`, error)
      })
    }
    return
  }
}
