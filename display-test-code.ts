import { BaiYueKuiShard } from '@shared/yuekui-shard/interface'
import { Shard } from '@shared/yuekui-shard/decorators'
import { authenticate, createWebSocketConnection, LeagueWebSocket, Credentials } from 'league-connect'
import { lcuState } from '../Lcu-state/state'

const SHARD_ID = 'lcu-connect'

@Shard(SHARD_ID)
export class LcuConnectShard implements BaiYueKuiShard {
  id = SHARD_ID
  private _ws: LeagueWebSocket | null = null
  private _isDisposing = false // 用于控制循环退出的标志位

  // ✅ onInit 只负责“启动”监控，不要 await 它！
  // 这样无论游戏开没开，App 窗口都能秒开
  onInit(): void {
    console.log(`[${this.id}] 启动 LCU 守护监听...`)
    this.connectionLoop() // 🔥 注意：这里没有 await，让它在后台跑
  }

  // 🔄 核心：死循环连接逻辑
  private async connectionLoop(): Promise<void> {
    while (!this._isDisposing) {
      try {
        console.log(`[${this.id}] 正在寻找 LOL 客户端...`)

        // 1. 等待游戏启动 (如果游戏没开，会卡在这里等待，不会报错)
        const credential = await authenticate({ awaitConnection: true, pollInterval: 2000 })
        
        // 2. 写入状态
        // lcuState.setCredentials(credential) // 以后记得加上
        console.log(`[${this.id}] 客户端已连接: Port ${credential.port}`)

        // 3. 建立 WebSocket
        const ws = await createWebSocketConnection({
          authenticationOptions: { awaitConnection: true }
        })
        this._ws = ws

        // 4. 订阅事件
        ws.subscribe('/lol-gameflow/v1/gameflow-phase', (data: string) => {
          lcuState.setPhase(data)
        })

        // 5. 🔥 关键：阻塞在这里，直到连接断开
        // 我们创建一个 Promise，只有当 'close' 事件触发时才 resolve
        await new Promise<void>((resolve) => {
          ws.on('close', () => {
            console.log(`[${this.id}] 客户端连接断开，准备重连...`)
            resolve() // 结束当前的 Promise，让 while 循环进入下一次
          })
          
          // 也可以监听 error 防止异常退出
          ws.on('error', () => resolve())
        })

        // 6. 清理工作 (断开后执行)
        this._ws = null
        lcuState.setPhase('None') // 重置状态
        // lcuState.setCredentials(null)

      } catch (e) {
        // 如果发生未知错误（比如权限问题），等待 1 秒后再试，防止 CPU 爆炸
        console.error(`[${this.id}] 连接过程出错，1秒后重试`, e)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }

  async onDispose(): Promise<void> {
    this._isDisposing = true // 告诉循环该停了
    if (this._ws) {
      this._ws.close()
      this._ws = null
    }
  }
}