import type { BaiYueKuiShard } from '@shared/yuekui-shard/interface'
import type { Credentials } from 'league-connect'
import type { IReactionDisposer } from 'mobx'
import type { ChampionSimple } from '../Lcu-state/type'
import type { ArenaAugmentDictItem } from '@main/utils/arenaCache'
import type {
  ItemAsset,
  ItemsDictionary,
  SummonerSpellAsset,
  SpellsDictionary,
  PerkAsset,
  PerksDictionary,
  PerkStyleItem,
  PerkStylesDictionary
} from './type'

import { reaction, toJS } from 'mobx'
import { lcuState } from '../Lcu-state/state'
import { Shard } from '@shared/yuekui-shard/decorators'
import { createHttp1Request } from 'league-connect'
import { pollUntil } from '../../utils/scheduler'
import { saveMergedArenaToDisk } from '../../utils/arenaCache'

const SHARD_ID = 'champ-asset'

@Shard(SHARD_ID)
export class ChampAssetShard implements BaiYueKuiShard {
  id: string = SHARD_ID
  static id = SHARD_ID
  private _cleanupFns: IReactionDisposer[] = []

  // 🔥 新增：记录五个资源的持久化存储状态 (加入 perkStyles)
  private _storageStatus = {
    champ: false,
    items: false,
    spells: false,
    perks: false,
    perkStyles: false,
    cherry: false
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
    this._storageStatus = {
      champ: false,
      items: false,
      spells: false,
      perks: false,
      perkStyles: false,
      cherry: false
    }
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

          // 🎯 新增并发请求：符文树/主副系
          const perkStylesPromise = this._storageStatus.perkStyles
            ? Promise.resolve(null)
            : createHttp1Request(
                { method: 'GET', url: '/lol-game-data/assets/v1/perkstyles.json' },
                credential
              )

          const cherryAugmentsPromise =
            this._storageStatus.cherry || lcuState.isArenaFullyCached
              ? Promise.resolve(null)
              : createHttp1Request(
                  { method: 'GET', url: '/lol-game-data/assets/v1/cherry-augments.json' },
                  credential
                )

          const results = await Promise.allSettled([
            champPromise,
            itemsPromise,
            spellsPromise,
            perksPromise,
            perkStylesPromise,
            cherryAugmentsPromise
          ])
          const [
            champResult,
            itemsResult,
            spellsResult,
            perksResult,
            perkStylesResult,
            cherryResult
          ] = results

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
            const C_A_DATA = champResult.value.json() as ChampionSimple[]
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
            const rawItemArrayJson = itemsResult.value.json() as ItemAsset[]
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
            const rawSpellArrayJson = spellsResult.value.json() as SummonerSpellAsset[]
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
          // 🎯 D. 符文字典 (具体小符文)
          // ==========================================
          if (this._storageStatus.perks) {
            // 已缓存，跳过处理
          } else if (
            perksResult.status === 'fulfilled' &&
            perksResult.value &&
            perksResult.value.ok
          ) {
            const rawPerkArrayJson = perksResult.value.json() as PerkAsset[]
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
          // 🎯 E. 符文系字典 (主系/副系大类)
          // ==========================================
          if (this._storageStatus.perkStyles) {
            // 已缓存，跳过处理
          } else if (
            perkStylesResult.status === 'fulfilled' &&
            perkStylesResult.value &&
            perkStylesResult.value.ok
          ) {
            // 1. 先用 unknown 接住未知的 JSON 结构
            const responseData = (await perkStylesResult.value.json()) as
              | { styles?: PerkStyleItem[] }
              | PerkStyleItem[]
            // 2. 极其安全的类型守卫脱壳：如果外面包了 styles 就扒掉，如果是纯数组就直接用
            const rawPerkStylesArrayJson: PerkStyleItem[] = Array.isArray(responseData)
              ? responseData
              : responseData.styles || []
            const toPerkStylesDictionary = rawPerkStylesArrayJson.reduce((acc, currentStyle) => {
              acc[currentStyle.id] = {
                id: currentStyle.id,
                name: currentStyle.name,
                tooltip: currentStyle.tooltip,
                // 必须转小写，配合 lcu-img 协议无缝渲染
                iconPath: currentStyle.iconPath.toLowerCase()
              }
              return acc
            }, {} as PerkStylesDictionary)
            lcuState.setPerkStylesDictionary(toPerkStylesDictionary)
            this._storageStatus.perkStyles = true // 标记成功
          } else {
            console.warn(`❌ 符文系字典拉取失败`)
            isAllSuccess = false
          }

          if (this._storageStatus.cherry) {
          } else if (lcuState.isArenaFullyCached) {
            this._storageStatus.cherry = true
          } else if (
            cherryResult.status === 'fulfilled' &&
            cherryResult.value &&
            cherryResult.value.ok
          ) {
            if (Object.keys(lcuState.arenaAugments).length === 0) {
              console.warn('[Champ-asset] ⚠️ 基础海克斯字典尚未就绪，延迟缝合 cherry 数据...')
              isAllSuccess = false // 返回 false 让轮询继续等
            } else {
              const responseData = cherryResult.value.json() as
                | Array<{ id: number; rarity: string }>
                | { augments?: Array<{ id: number; rarity: string }> }
              const cherryAugments = Array.isArray(responseData)
                ? responseData
                : responseData.augments || []

              const mergedDict: Record<number, ArenaAugmentDictItem> = { ...lcuState.arenaAugments }
              // 注： ...lcS.aAug 是对象，浅拷贝是对它本身属性的指针复制 
              for (const item of cherryAugments) {
                const target = mergedDict[item.id] // mergedDict 
                if (!target) continue
                mergedDict[item.id] = {
                  ...target,          // 如name: '战争交响乐'，这类基本类型，都有着一个物理性质：绝对不可变。一但在堆内存中开辟，就无法改变
                  rarity: item.rarity
                }
              }
              lcuState.setArenaAugments(mergedDict)
              const pureDict = toJS(lcuState.arenaAugments)
              await saveMergedArenaToDisk(pureDict, lcuState.gameVersion)
              lcuState.setIsArenaFullyCached(true)
              this._storageStatus.cherry = true
            }
          } else {
            console.warn(`❌ cherry 海克斯稀有度拉取失败`)
            isAllSuccess = false
          }

          // ==========================================
          // 🏆 终极裁决
          // ==========================================
          if (isAllSuccess) {
            console.log(`[${SHARD_ID}] 🎉 所有核心静态资源字典 (含符文主副系) 拉取并装载完毕！`)
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
