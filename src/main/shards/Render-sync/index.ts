import { BrowserWindow, ipcMain } from 'electron'
import type { IpcMainEvent } from 'electron'

import { BaiYueKuiShard } from '@shared/yuekui-shard/interface'
import { Shard } from '@shared/yuekui-shard/decorators'
import { lcuState } from '../Lcu-state/state'
import { autorun, toJS } from 'mobx'
import { createHttp1Request } from 'league-connect'

import type { LcuStateSnapshot, QueryMatchedIndex } from '../Lcu-state/type'

// 鐚浄绗?鐎规矮绠?Action 閻ㄥ嫮绮ㄩ弸鍕剁礉闁灝鍘ら崷?ipcMain.on 闁插奔濞囬悽?implicit any
interface LcuActionPayload {
  type: string
  payload: any
}

const SHARD_ID = 'renderer-sync'

@Shard(SHARD_ID)
export class RendererSyncShard implements BaiYueKuiShard {
  static id = SHARD_ID
  id = SHARD_ID

  private _disposeFn: (() => void) | null = null

  // 鐚浄绗?閺勬儳绱℃竟鐗堟鏉╂柨娲栫猾璇茬€?LcuStateSnapshot
  private _getCleanState(): LcuStateSnapshot {
    const stateSnapShot = toJS(lcuState)
    // 鐚浄绗?娴ｈ法鏁ょ猾璇茬€烽弬顓♀枅閹存牔绶烽棃鐘冲复閸欙絾顥呴弻銉礉绾喕绻?socket: null 閻㈢喐鏅?
    const cleanState: LcuStateSnapshot = {
      ...stateSnapShot,
      socket: null,
      credential: stateSnapShot.credential ? { ...stateSnapShot.credential } : null
    }
    return cleanState
  }

  async onInit(): Promise<void> {
    // 鐚浄绗?娑撱儲鐗稿Ο鈥崇础閿涙矮绨ㄦ禒璺侯嚠鐠烇紕琚崹瀣閿涘本鏆熼幑顔界垼鐠侀璐?unknown
    // ipcRenderer.send() ---> ipcMain.on(): void
    ipcMain.on('lcu-action', (_event: IpcMainEvent, _action: unknown) => {
      // 棣冩礉閿?缁鐎风€瑰牆宕奸敍姘焽鐟封偓 _action 閺勵垱鍨滄禒顒勵暕閺堢喓娈戠紒鎾寸€?
      const action = _action as LcuActionPayload

      console.log('Main received action', action)

      switch (action.type) {
        case 'setTargetChampionId':
          lcuState.setTargetChampionId(action.payload)
          break
        case 'setIsAutoPickEnabled':
          lcuState.setIsAutoPickEnabled(action.payload)
          break
        case 'setQueryMatched':
          lcuState.setQueryMatchedIndex(action.payload as QueryMatchedIndex)
          break
      }
    })

    // 鐚浄绗?娑撱儲鐗稿Ο鈥崇础閿涙碍妯夊蹇氱箲閸?Promise<LcuStateSnapshot> 閹?LcuStateSnapshot
    // ipcRenderer.invoke() --> ipcMain.handle(): void | Promise<void>
    
    // 🟢 新增：获取对局详情
    ipcMain.handle('get-match-detail', async (_event, gameId: number) => {
      const credential = lcuState.credential
      if (!credential) return null

      try {
        const response = await createHttp1Request(
          {
            method: 'GET',
            url: `/lol-match-history/v1/games/${gameId}`
          },
          credential
        )

        if (response.ok) {
          // createHttp1Request 已封装 json()，无需额外 await
          const data = response.json()
          return data
        }
        return null
      } catch (error) {
        console.error(`[RendererSync] Failed to fetch match detail for ${gameId}:`, error)
        return null
      }
    })
    this._disposeFn = autorun(() => {
      const cleanState = this._getCleanState()
      // ipcRenderer.on() ---> win.webContents.send
      BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) {
          win.webContents.send('lcu-state-update', cleanState)
        }
      })
    })
  }

  onDispose(): void {
    if (this._disposeFn) this._disposeFn()
    ipcMain.removeAllListeners('lcu-action')
    ipcMain.removeHandler('lcu-get-state')
    ipcMain.removeHandler('get-match-detail')
  }
}
