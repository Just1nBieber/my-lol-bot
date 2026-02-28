import type { BaiYueKuiShard } from '@shared/yuekui-shard/interface'
import type { Credentials } from 'league-connect'
import type { IReactionDisposer } from 'mobx'
import type { ChampionSimple } from '../Lcu-state/type'

import { reaction } from 'mobx'
import { lcuState } from '../Lcu-state/state'
import { Shard } from '@shared/yuekui-shard/decorators'
import { createHttp1Request } from 'league-connect'
import { pollUntil } from '../../utils/scheduler'

const SHARD_ID = 'champ-asset'

@Shard(SHARD_ID)
export class ChampAssetShard implements BaiYueKuiShard {
  id: string = SHARD_ID
  static id = SHARD_ID
  private _cleanupFns: IReactionDisposer[] = []

  async onInit(): Promise<void> {
    console.log('启动Champion资源模块')
    const disposeFunction = reaction(
      () => lcuState.credential,
      (creds) => {
        if (creds && !lcuState.isLoaded) {
          console.log(`[${SHARD_ID}] 拿到凭据，开始拉取英雄列表...`)
          this.fetchChampionAsset(creds)
        }
      }
    )
    this._cleanupFns.push(disposeFunction)
  }

  onDispose(): void {
    console.log(`[${SHARD_ID}] LCU 连接断开，重置加载状态`)
    this._cleanupFns.forEach((d) => d())
  }

  async fetchChampionAsset(cred: Credentials): Promise<void> {
    const isLoaded = lcuState.isLoaded
    if (isLoaded) return

    pollUntil(
      async () => {
        const credential = cred
        if (!credential) return true
        const C_A_RES = await createHttp1Request(
          {
            method: 'GET',
            url: '/lol-game-data/assets/v1/champion-summary.json'
          },
          credential
        )

        if (!C_A_RES.ok) return false

        const C_A_DATA = C_A_RES.json() as ChampionSimple[]

        const can_pick_champ = C_A_DATA.filter((item) => {
          return item.id != -1
        })
        // console.log(can_pick_champ)
        lcuState.setChampionList(can_pick_champ)
        lcuState.setChampionListLoad(true)
        console.log(`成功加载${can_pick_champ.length}个英雄`)
        return true
      },
      {
        interval: 2000,
        timeout: 60 * 2000
      }
    )
  }
}
