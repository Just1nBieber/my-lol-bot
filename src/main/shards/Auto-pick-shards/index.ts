import type { BaiYueKuiShard, shardFn } from '@shared/yuekui-shard/interface'
import type { IReactionDisposer } from 'mobx'

import { reaction } from 'mobx'
import { lcuState } from '../Lcu-state/state'
import { Shard } from '@shared/yuekui-shard/decorators'
import { createHttp1Request } from 'league-connect'

const SHARD_ID = 'auto-pick'

@Shard(SHARD_ID)
export class AutoPickShard implements BaiYueKuiShard {
  id: string = SHARD_ID
  static id = SHARD_ID
  private _cleanupFns: IReactionDisposer[] = []

  onInit(): void {
    console.log('启动自动选择英雄模块')
    const disposeFunction = reaction(
      () => lcuState.phase,
      (phase) => {
        if (phase === 'ChampSelect') {
          console.log('进入选人阶段...正在调用相应函数')
          this.tryAutoPick()
        }
      }
    )
    this._cleanupFns.push(disposeFunction)
  }

  onDispose(): void {
    this._cleanupFns.forEach((d) => d())
  }

  async tryAutoPick(): Promise<void> {
    // 1. 提取快照（解决报错的核心！）
    const creds = lcuState.credential

    // 2. 判空
    if (!creds) {
      console.warn('无凭据')
      return
    }

    // 3. 此时 TS 知道 creds 绝对安全
    if (lcuState.phase === 'ChampSelect') {
      const res = await createHttp1Request(
        {
          method: 'GET',
          url: '/lol-champ-select/v1/session'
        },
        creds // 👈 传入快照
      )

      // 4. 这里的 await 报错现在应该消失了！
      const data = res.json()
      console.log('📦 数据:', data)
    }
  }
}
