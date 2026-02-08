import { BrowserWindow, ipcMain } from 'electron'
import { lcuState } from '../Lcu-state/state'
import { autorun, toJS } from 'mobx'
import { Shard } from '@shared/yuekui-shard/decorators'
import { BaiYueKuiShard } from '@shared/yuekui-shard/interface'

const SHARD_ID = 'renderer-sync'

@Shard(SHARD_ID)
export class RendererSyncShard implements BaiYueKuiShard {
  id: string = SHARD_ID
  static id = SHARD_ID
  private _dispose: (() => void) | null = null

  async onInit(): Promise<void> {
    console.log('启动渲染进程同步模块')

    // 1. 监听来自渲染进程的 Action
    ipcMain.on('lcu-action', (event, action) => {
      console.log('Main received action:', action)
      switch (action.type) {
        case 'setTargetChampionId':
          lcuState.setTargetChampionId(action.payload)
          break
        case 'setIsAutoPickEnabled':
          lcuState.setIsAutoPickEnabled(action.payload)
          break
      }
    })

    // 2. 监听来自渲染进程的 State 请求 (初始加载)
    ipcMain.handle('lcu-get-state', () => {
      return toJS(lcuState)
    })

    // 3. 自动同步 State 变化到所有渲染进程
    this._dispose = autorun(() => {
      const stateSnapshot = toJS(lcuState)
      // 深拷贝去除 socket 等不可序列化对象
      const cleanState = {
        ...stateSnapshot,
        socket: undefined,
        credential: stateSnapshot.credential ? { ...stateSnapshot.credential } : null
      }
      
      BrowserWindow.getAllWindows().forEach(win => {
        if (!win.isDestroyed()) {
          win.webContents.send('lcu-state-update', cleanState)
        }
      })
    })
  }

  onDispose(): void {
    if (this._dispose) {
      this._dispose()
    }
    ipcMain.removeHandler('lcu-get-state')
    ipcMain.removeAllListeners('lcu-action')
  }
}
