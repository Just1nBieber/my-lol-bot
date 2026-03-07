import { BrowserWindow, ipcMain } from 'electron'
import type { IpcMainEvent } from 'electron'

import { BaiYueKuiShard } from '@shared/yuekui-shard/interface'
import { Shard } from '@shared/yuekui-shard/decorators'
import { lcuState } from '../Lcu-state/state'
import { autorun, toJS } from 'mobx'

import type { LcuStateSnapshot, QueryMatchedIndex } from '../Lcu-state/type'

// ⬇️ 定义 Action 的结构，避免在 ipcMain.on 里使用 implicit any
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

  // ⬇️ 显式声明返回类型 LcuStateSnapshot
  private _getCleanState(): LcuStateSnapshot {
    const stateSnapShot = toJS(lcuState)
    // ⬇️ 使用类型断言或依靠接口检查，确保 socket: null 生效
    const cleanState: LcuStateSnapshot = {
      ...stateSnapShot,
      socket: null,
      credential: stateSnapShot.credential ? { ...stateSnapShot.credential } : null
    }
    return cleanState
  }

  onInit(): void {
    // ⬇️ 严格模式：事件对象类型化，数据标记为 unknown
    // ipcRenderer.send() ---> ipcMain.on(): void
    ipcMain.on('lcu-action', (_event: IpcMainEvent, _action: unknown) => {
      // 🛡️ 类型守卫：断言 _action 是我们预期的结构
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

    // ⬇️ 严格模式：显式返回 Promise<LcuStateSnapshot> 或 LcuStateSnapshot
    // ipcRenderer.invoke() --> ipcMain.handle(): void | Promise<void>
    ipcMain.handle('lcu-get-state', (): LcuStateSnapshot => {
      return this._getCleanState()
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
  }
}
