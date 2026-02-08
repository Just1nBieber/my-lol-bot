import type { BaiYueKuiShard, shardFn } from '@shared/yuekui-shard/interface'
import type { IReactionDisposer } from 'mobx'
import type { LcuAction, LcuSessionData } from '../Lcu-state/type'

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
          if (lcuState.isAutoPickEnabled) {
            console.log('🤖 自动选人已开启，准备执行...')
            this.toPickChamp(IhaveCurrentActionOrNot.id)
          } else {
            console.log('🛑 自动选人未开启，跳过操作')
          }
          break
        default:
          console.log('未知任务类型:', IhaveCurrentActionOrNot.type)
      }
    })
  }

  async toPickChamp(actionId: number): Promise<void> {
    // 改为 async
    const credential = lcuState.credential
    const targetId = lcuState.targetChampionObj.championId // 🔥 修复点 2：从 State 读取目标ID
    if (!credential || targetId === 0) {
      console.warn('❌ 无法选人：凭据丢失 或 未设定目标英雄')
      return
    }

    try {
      console.log(`🎯 尝试秒选英雄 ID: ${targetId}, ActionID: ${actionId}`)

      const res = await createHttp1Request(
        {
          method: 'PATCH',
          url: `/lol-champ-select/v1/session/actions/${actionId}`,
          body: {
            championId: targetId,
            completed: true // 🔥 修复点 3：直接锁定！(如果只想亮头像不锁定，设为 false)
          }
        },
        credential
      )

      if (res.ok) {
        console.log('✅ 秒选成功！')
      } else {
        console.error('❌ 秒选请求失败:', res.status)
      }
    } catch (e) {
      console.error('❌ 秒选过程出错:', e)
    }
  }
}
