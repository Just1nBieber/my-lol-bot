import type { BaiYueKuiShard } from '@shared/yuekui-shard/interface'
import type { Credentials } from 'league-connect'
import type { IReactionDisposer } from 'mobx'
import type { ChampionSimple } from '../Lcu-state/type'

import { reaction } from 'mobx'
import { lcuState } from '../Lcu-state/state'
import { Shard } from '@shared/yuekui-shard/decorators'
import { createHttp1Request } from 'league-connect'
import { protocol, net } from 'electron'

const SHARD_ID = 'champ-asset'

@Shard(SHARD_ID)
export class ChampAssetShard implements BaiYueKuiShard {
  id: string = SHARD_ID
  static id = SHARD_ID
  private _cleanupFns: IReactionDisposer[] = []

  async onInit(): Promise<void> {
    console.log('启动Champion资源模块')
    // 🔥在模块初始化时，注册自定义图片协议
    this.registerImgProtocol()
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
    lcuState.setChampionListLoad(false)
    this._cleanupFns.forEach((d) => d())
  }

  async fetchChampionAsset(cred: Credentials): Promise<void> {
    const isLoaded = lcuState.isLoaded
    if (!!isLoaded === false) {
      const credential = cred
      const C_A_RES = await createHttp1Request(
        {
          method: 'GET',
          url: '/lol-game-data/assets/v1/champion-summary.json'
        },
        credential
      )
      const C_A_DATA = C_A_RES.json()

      const can_pick_champ = C_A_DATA.filter((item: ChampionSimple) => {
        return item.id != -1
      })

      // 🕵️‍♂️【侦探模式】打印第一条数据看看路径到底长啥样
      if (can_pick_champ.length > 0) {
          const firstChamp = can_pick_champ[0] // 通常是 Annie (ID: 1)
          console.log('📦 [Debug] 第一位英雄数据:', {
              name: firstChamp.name,
              id: firstChamp.id,
              path: firstChamp.squarePortraitPath // 看看这里到底是 1.png 还是 Annie.png
          })
      }
      lcuState.setChampionList(can_pick_champ)
      lcuState.setChampionListLoad(true)
      console.log(`成功加载${can_pick_champ.length}个英雄`)
    }
  }

  registerImgProtocol(): void {
    // 防御性检查：防止热重载时重复注册报错
    if (protocol.isProtocolHandled('lcu-img')) {
      console.log('⚠️ [ChampAsset] lcu-img 协议已注册，跳过')
      return
    }

    protocol.handle('lcu-img', async (request) => {
      let url = request.url.replace('lcu-img://', '')
      const creds = lcuState.credential
      // 如果还没连上 LCU，直接返回错误
      if (!creds) {
        return new Response('LCU Not Connected', { status: 503 })
      }

      while (url.startsWith('/')) {
        url = url.slice(1)
      }

      // 构造 Basic Auth 头
      const authHeader = `Basic ${Buffer.from(`riot:${creds.password}`).toString('base64')}`

      try {
        // 使用 electron 的 net 模块去请求本地 LCU
        const response = await net.fetch(`https://127.0.0.1:${creds.port}/${url}`, {
          headers: {
            Authorization: authHeader
          },
          bypassCustomProtocolHandlers: true
        })

        return response
      } catch (error) {
        console.error('Image Proxy Error:', error)
        return new Response('Image Load Failed', { status: 404 })
      }
    })

    console.log('✅ [ChampAsset] 自定义图片协议 lcu-img:// 已激活')
  }
}
