import type { BaiYueKuiShard } from '@shared/yuekui-shard/interface'
import type { Credentials } from 'league-connect'
import type { IReactionDisposer } from 'mobx'
import type { ChampionSimple } from '../Lcu-state/type'
import type {
  ItemAsset,
  ItemsDictionary,
  SummonerSpellAsset,
  SpellsDictionary,
  PerkAsset,
  PerksDictionary
} from './type'

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

  // 🔥 新增：记录四个资源的持久化存储状态
  private _storageStatus = {
    champ: false,
    items: false,
    spells: false,
    perks: false
  }

  onInit(): void {
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
    // 彻底断开时，重置缓存状态，确保下次启动游戏重新拉取最新资源
    this._storageStatus = { champ: false, items: false, spells: false, perks: false }
  }

  async fetchChampionAsset(cred: Credentials): Promise<void> {
    const isLoaded = lcuState.isLoaded
    if (isLoaded) return

    pollUntil(
      async () => {
        const credential = cred
        if (!credential) return true // 没有凭据说明彻底断开了，终止当前轮询

        try {
          // 🔥 动态发车：如果已经存了，就直接发一个空的 Promise 占位，避免重复网络请求
          const champPromise = this._storageStatus.champ
            ? Promise.resolve(null)
            : createHttp1Request(
                { method: 'GET', url: '/lol-game-data/assets/v1/champion-summary.json' },
                credential
              )

          const itemsPromise = this._storageStatus.items
            ? Promise.resolve(null)
            : createHttp1Request(
                { method: 'GET', url: '/lol-game-data/assets/v1/items.json' },
                credential
              )

          const spellsPromise = this._storageStatus.spells
            ? Promise.resolve(null)
            : createHttp1Request(
                { method: 'GET', url: '/lol-game-data/assets/v1/summoner-spells.json' },
                credential
              )

          const perksPromise = this._storageStatus.perks
            ? Promise.resolve(null)
            : createHttp1Request(
                { method: 'GET', url: '/lol-game-data/assets/v1/perks.json' },
                credential
              )

          const results = await Promise.allSettled([
            champPromise,
            itemsPromise,
            spellsPromise,
            perksPromise
          ])
          const [champResult, itemsResult, spellsResult, perksResult] = results

          let isAllSuccess = true

          // ==========================================
          // 🎯 A. 英雄列表
          // ==========================================
          if (this._storageStatus.champ) {
            // 已缓存，跳过处理
          } else if (
            champResult.status === 'fulfilled' &&
            champResult.value &&
            champResult.value.ok
          ) {
            const C_A_DATA = (await champResult.value.json()) as ChampionSimple[]
            const can_pick_champ = C_A_DATA.filter((item) => item.id != -1)
            lcuState.setChampionList(can_pick_champ)
            lcuState.setChampionListLoad(true)
            this._storageStatus.champ = true // 标记成功
          } else {
            console.warn(`❌ 英雄列表拉取失败`)
            isAllSuccess = false
          }

          // ==========================================
          // 🎯 B. 装备字典
          // ==========================================
          if (this._storageStatus.items) {
            // 已缓存，跳过处理
          } else if (
            itemsResult.status === 'fulfilled' &&
            itemsResult.value &&
            itemsResult.value.ok
          ) {
            const rawItemArrayJson = (await itemsResult.value.json()) as ItemAsset[]
            const toItemsDictionary = rawItemArrayJson.reduce((acc, currentItem) => {
              acc[currentItem.id] = {
                id: currentItem.id,
                name: currentItem.name,
                description: currentItem.description,
                price: currentItem.price,
                iconPath: currentItem.iconPath,
                active: currentItem.active,
                inStore: currentItem.inStore,
                from: currentItem.from,
                to: currentItem.to,
                categories: currentItem.categories,
                maxAmmo: currentItem.maxAmmo,
                isEnchantment: currentItem.isEnchantment,
                priceTotal: currentItem.priceTotal
              }
              return acc
            }, {} as ItemsDictionary)
            lcuState.setItemsDictionary(toItemsDictionary)
            this._storageStatus.items = true // 标记成功
          } else {
            console.warn(`❌ 装备字典拉取失败`)
            isAllSuccess = false
          }

          // ==========================================
          // 🎯 C. 召唤师技能字典
          // ==========================================
          if (this._storageStatus.spells) {
            // 已缓存，跳过处理
          } else if (
            spellsResult.status === 'fulfilled' &&
            spellsResult.value &&
            spellsResult.value.ok
          ) {
            const rawSpellArrayJson = (await spellsResult.value.json()) as SummonerSpellAsset[]
            const toSpellsDictionary = rawSpellArrayJson.reduce((acc, currentSpell) => {
              acc[currentSpell.id] = {
                id: currentSpell.id,
                name: currentSpell.name,
                description: currentSpell.description,
                summonerLevel: currentSpell.summonerLevel,
                cooldown: currentSpell.cooldown,
                gameModes: currentSpell.gameModes,
                iconPath: currentSpell.iconPath
              }
              return acc
            }, {} as SpellsDictionary)
            lcuState.setSpellsDictionary(toSpellsDictionary)
            this._storageStatus.spells = true // 标记成功
          } else {
            console.warn(`❌ 召唤师技能字典拉取失败`)
            isAllSuccess = false
          }

          // ==========================================
          // 🎯 D. 符文字典
          // ==========================================
          if (this._storageStatus.perks) {
            // 已缓存，跳过处理
          } else if (
            perksResult.status === 'fulfilled' &&
            perksResult.value &&
            perksResult.value.ok
          ) {
            const rawPerkArrayJson = (await perksResult.value.json()) as PerkAsset[]
            const toPerksDictionary = rawPerkArrayJson.reduce((acc, currentPerk) => {
              acc[currentPerk.id] = {
                id: currentPerk.id,
                name: currentPerk.name,
                shortDesc: currentPerk.shortDesc,
                longDesc: currentPerk.longDesc,
                iconPath: currentPerk.iconPath,
                endOfGameStatDescs: currentPerk.endOfGameStatDescs
              }
              return acc
            }, {} as PerksDictionary)
            lcuState.setPerksDictionary(toPerksDictionary)
            this._storageStatus.perks = true // 标记成功
          } else {
            console.warn(`❌ 符文字典拉取失败`)
            isAllSuccess = false
          }

          // ==========================================
          // 🏆 终极裁决
          // ==========================================
          if (isAllSuccess) {
            console.log(`[${SHARD_ID}] 🎉 所有核心静态资源字典拉取并装载完毕！`)
          } else {
            console.warn(`[${SHARD_ID}] ⚠️ 存在未成功拉取的资源，进入下一轮重试...`)
          }

          return isAllSuccess
        } catch (error) {
          console.error(`[${SHARD_ID}] 资源并发拉取过程发生异常，准备重试`, error)
          return false
        }
      },
      {
        interval: 2000,
        timeout: 60 * 2000
      }
    )
  }
}
