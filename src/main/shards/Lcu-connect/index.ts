import type { LeagueWebSocket } from 'league-connect'
import type { GameflowPhase } from '../Lcu-state/type'
import type { BaiYueKuiShard } from '@shared/yuekui-shard/interface'
import { authenticate, createWebSocketConnection } from 'league-connect'
import { Shard } from '@shared/yuekui-shard/decorators'
import { lcuState } from '../Lcu-state/state'
import { sleep } from '../../utils/scheduler'
import { initArenaAugmentsWithCache } from '../../utils/arenaCache'
const SHARD_ID = 'lcu-connect'
@Shard(SHARD_ID)
export class LcuConnectShard implements BaiYueKuiShard {
  static id = SHARD_ID
  id = SHARD_ID

  private _ws: LeagueWebSocket | null = null
  private _isDispose = false

  async onInit(): Promise<void> {
    console.log(`[${this.id}] 启动 LCU 守护监听...`)
    this.connectionLoop() // 🔥 注意：这里没有 await，让它在后台跑
  }

  private async connectionLoop(): Promise<void> {
    while (!this._isDispose) {
      try {
        // 0.start
        console.log(`[${this.id}] 正在寻找 LOL 客户端...`)

        // 1.获取凭证
        const credential = await authenticate({ awaitConnection: true, pollInterval: 5000 })

        // 2. 写入状态
        lcuState.setCredentials(credential)

        if (lcuState.credential) {
          console.log(
            'port',
            lcuState.credential.port,
            'password',
            lcuState.credential.password,
            'pid',
            lcuState.credential.pid
          )
        }
        // 4.建立websocket连接，监听游戏流，保持与客户端的连接
        this._ws = await createWebSocketConnection({
          authenticationOptions: { awaitConnection: true, pollInterval: 5000 }
        })

        lcuState.setWebSocket(this._ws)

        this._ws!.subscribe('/lol-gameflow/v1/gameflow-phase', (data) => {
          lcuState.setPhase(data as GameflowPhase)
        })

        console.log(`[${this.id}] WebSocket 连接成功，开始监听状态`)
        const { dict, isFullyCached, version } = await initArenaAugmentsWithCache()
        lcuState.setArenaAugments(dict)
        lcuState.setIsArenaFullyCached(isFullyCached)
        lcuState.setGameVersion(version)
        // 5. 设置Promise管理this._isDispose
        await new Promise<void>((resolve) => {
          this._ws!.on('close', () => {
            resolve()
          })
          this._ws!.on('error', () => {
            resolve()
          })
        })

        // 6. 清理ws
        this._ws = null
        lcuState.resetState()

        // 👇这个catch 是和最大的try一起的
      } catch (e) {
        console.error(e)
        await sleep(5000)
      }
    }
  }

  onDispose(): void {
    this._isDispose = true // 暂停循环
    if (this._ws) {
      this._ws.close()
      this._ws = null
    }
  }
}
