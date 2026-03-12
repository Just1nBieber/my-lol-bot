import { defineStore } from 'pinia'
import { shallowRef, markRaw, ref, reactive } from 'vue'
import localforage from 'localforage'

// 导入类型定义
import type {
  ChampionSimple,
  PickObj,
  SummonerInfo,
  QueryMatchedIndex,
  LcuStateSnapshot,
  ItemsDictionary,
  SpellsDictionary,
  PerksDictionary,
  PerkStylesDictionary,
  StaticCacheMap,
  StaticCacheKey,
  SimpleMatchDTO,
  ArenaAugmentDictItem
} from './type'

/**
 * 英雄联盟段位翻译字典
 */
export const transRanked: Record<string, string> = {
  IRON: '黑铁',
  BRONZE: '青铜',
  SILVER: '白银',
  GOLD: '黄金',
  PLATINUM: '铂金',
  EMERALD: '翡翠',
  DIAMOND: '钻石',
  MASTER: '超凡大师',
  GRANDMASTER: '傲视宗师',
  CHALLENGER: '最强王者',
  NONE: '未定级'
}

export const initialSimpleMatch: SimpleMatchDTO = {
  // === 基础游戏信息 ===
  gameId: 0,
  gameCreation: '',
  gameDuration: '',
  gameMode: '',
  map: '',
  queueId: 0,
  finalGameResult: '',
  gameType: '',
  endOfGameResult: '',
  // === 玩家身份验证与胜负 ===
  puuid: '',
  win: true,
  // === 英雄与召唤师技能 ===
  championId: 0,
  spells: [0, 0],

  // === 符文系统 (结构化后的数据) ===
  runes: {
    primaryStyle: 0,
    subStyle: 0,
    perks: [
      { id: 0, vars: [0, 0, 0] },
      { id: 0, vars: [0, 0, 0] },
      { id: 0, vars: [0, 0, 0] },
      { id: 0, vars: [0, 0, 0] },
      { id: 0, vars: [0, 0, 0] },
      { id: 0, vars: [0, 0, 0] }
    ]
  },
  augments: [],
  // === 经济、伤害与KDA ===
  kills: 0,
  deaths: 0,
  assists: 0,
  goldEarned: 0,
  cs: 0,
  SimpleTotalDamageDealtToChampions: 0,
  kda: '0.00',
  csPerMinute: '0.0',

  // === 装备栏 ===
  items: [0, 0, 0, 0, 0, 0, 0, 0]
}

export const useLcuStateStore = defineStore('lcuState', () => {
  const staticCacheKeys: Record<StaticCacheKey, string> = {
    championList: 'lcu-cache:championList',
    arenaAugments: 'lcu-cache:arenaAugments',
    itemsDictionary: 'lcu-cache:itemsDictionary',
    spellsDictionary: 'lcu-cache:spellsDictionary',
    perksDictionary: 'lcu-cache:perksDictionary',
    perkStylesDictionary: 'lcu-cache:perkStylesDictionary'
  }

  const championList = shallowRef<ChampionSimple[]>([])
  const isAutoPickEnabled = ref(false)
  const targetChampionObj = reactive<PickObj>({
    championId: 0,
    completed: false
  })
  const isLoaded = ref(false)
  const summonerInfo = shallowRef<SummonerInfo | null>(null)

  // 核心业务数据列表
  const simpleMatchedList = shallowRef<SimpleMatchDTO[]>([])
  const arenaAugments = shallowRef<Record<number, ArenaAugmentDictItem>>({})
  const queryMatchedIndex = reactive<QueryMatchedIndex>({
    begIndex: 0,
    endIndex: 19
  })
  const itemsDictionary = shallowRef<ItemsDictionary>({})
  const spellsDictionary = shallowRef<SpellsDictionary>({})
  const perksDictionary = shallowRef<PerksDictionary>({})
  const perkStylesDictionary = shallowRef<PerkStylesDictionary>({})
  const matchDetailsDict = shallowRef<Record<number, any>>({})

  // 写入本地持久化缓存
  const saveStaticCache = <K extends StaticCacheKey>(key: K, value: StaticCacheMap[K]) => {
    void localforage.setItem(staticCacheKeys[key], value).catch((error: unknown) => {
      console.warn(`[lcuState] 保存静态缓存失败: ${String(key)}`, error)
    })
  }

  // 初始化本地缓存
  const initLocalCache = async (): Promise<void> => {
    try {
      const [
        cachedChampionList,
        cachedArenaAugments,
        cachedItemsDictionary,
        cachedSpellsDictionary,
        cachedPerksDictionary,
        cachedPerkStylesDictionary
      ] = await Promise.all([
        localforage.getItem<StaticCacheMap['championList']>(staticCacheKeys.championList),
        localforage.getItem<StaticCacheMap['arenaAugments']>(staticCacheKeys.arenaAugments),
        localforage.getItem<StaticCacheMap['itemsDictionary']>(staticCacheKeys.itemsDictionary),
        localforage.getItem<StaticCacheMap['spellsDictionary']>(staticCacheKeys.spellsDictionary),
        localforage.getItem<StaticCacheMap['perksDictionary']>(staticCacheKeys.perksDictionary),
        localforage.getItem<StaticCacheMap['perkStylesDictionary']>(
          staticCacheKeys.perkStylesDictionary
        )
      ])

      if (cachedChampionList !== null) championList.value = markRaw(cachedChampionList)
      if (cachedArenaAugments !== null) arenaAugments.value = markRaw(cachedArenaAugments)
      if (cachedItemsDictionary !== null) itemsDictionary.value = markRaw(cachedItemsDictionary)
      if (cachedSpellsDictionary !== null) spellsDictionary.value = markRaw(cachedSpellsDictionary)
      if (cachedPerksDictionary !== null) perksDictionary.value = markRaw(cachedPerksDictionary)
      if (cachedPerkStylesDictionary !== null)
        perkStylesDictionary.value = markRaw(cachedPerkStylesDictionary)
    } catch (error) {
      console.warn('[lcuState] 初始化本地缓存失败', error)
    }
  }

  /**
   * 懒加载对局详情（内存优先 -> 本地缓存 -> IPC）
   *
   * @param gameId - 对局 ID (例如: 1234567890)
   */
  const fetchMatchDetail = async (gameId: number): Promise<any | null> => {
    if (!gameId) return null

    // 1. 内存命中
    const inMemory = matchDetailsDict.value[gameId]
    if (inMemory) return inMemory

    const cacheKey = `lcu-cache:matchDetail:${gameId}`

    // 2. 本地硬盘缓存命中
    try {
      const cached = await localforage.getItem<any>(cacheKey)
      if (cached) {
        matchDetailsDict.value[gameId] = markRaw(cached)
        matchDetailsDict.value = { ...matchDetailsDict.value }
        return cached
      }
    } catch (error) {
      console.warn(`[lcuState] 读取对局缓存失败:`, error)
    }

    // 3. 走 IPC 请求 LCU 接口
    try {
      const detail = (await window.api.invoke('get-match-detail', gameId)) as any
      if (detail) {
        matchDetailsDict.value[gameId] = markRaw(detail)
        void localforage.setItem(cacheKey, detail).catch((error: unknown) => {
          console.warn(`[lcuState] 写入对局缓存失败:`, error)
        })
        matchDetailsDict.value = { ...matchDetailsDict.value }
        return detail
      }
    } catch (error) {
      console.error(`[lcuState] 获取对局详情失败:`, error)
    }

    return null
  }

  // 同步主进程下发的状态
  const updateState = (newState: Partial<LcuStateSnapshot>) => {
    // 1. 处理静态/重负载对象，使用 markRaw 避免 Vue 深度响应式的性能损耗
    if (newState.championList !== undefined) {
      championList.value = markRaw(newState.championList)
      saveStaticCache('championList', newState.championList)
    }

    if (newState.simpleMatchedList !== undefined)
      simpleMatchedList.value = markRaw(newState.simpleMatchedList)

    if (newState.arenaAugments !== undefined) {
      arenaAugments.value = markRaw(newState.arenaAugments)
      saveStaticCache('arenaAugments', newState.arenaAugments)
    }

    if (newState.itemsDictionary !== undefined) {
      itemsDictionary.value = markRaw(newState.itemsDictionary)
      saveStaticCache('itemsDictionary', newState.itemsDictionary)
    }

    if (newState.spellsDictionary !== undefined) {
      spellsDictionary.value = markRaw(newState.spellsDictionary)
      saveStaticCache('spellsDictionary', newState.spellsDictionary)
    }

    if (newState.perksDictionary !== undefined) {
      perksDictionary.value = markRaw(newState.perksDictionary)
      saveStaticCache('perksDictionary', newState.perksDictionary)
    }

    if (newState.perkStylesDictionary !== undefined) {
      perkStylesDictionary.value = markRaw(newState.perkStylesDictionary)
      saveStaticCache('perkStylesDictionary', newState.perkStylesDictionary)
    }

    // 2. 处理需要保持响应式的对象属性合并 (使用 Object.assign)
    if (newState.targetChampionObj) Object.assign(targetChampionObj, newState.targetChampionObj)

    if (newState.queryMatchedIndex !== undefined)
      Object.assign(queryMatchedIndex, newState.queryMatchedIndex)

    // 3. 处理基础类型的状态
    if (newState.isAutoPickEnabled !== undefined)
      isAutoPickEnabled.value = newState.isAutoPickEnabled

    if (newState.isLoaded !== undefined) isLoaded.value = newState.isLoaded

    if (newState.summonerInfo !== undefined) summonerInfo.value = newState.summonerInfo
  }

  // 初始化入口
  const init = async () => {
    await initLocalCache()

    try {
      // 首次加载，向主进程请求全量状态
      const initialState = (await window.api.invoke('lcu-get-state')) as Partial<LcuStateSnapshot>
      updateState(initialState)
    } catch (e) {
      console.error('Failed to get initial state', e)
    }

    // 监听主进程的实时状态更新
    window.api.on('lcu-state-update', (newState: Partial<LcuStateSnapshot>) => {
      updateState(newState)
    })
  }

  // Action: 设置目标英雄 (同步至主进程)
  const setTargetChampionId = (id: number) => {
    targetChampionObj.championId = id
    window.api.send('lcu-action', { type: 'setTargetChampionId', payload: id })
  }

  // Action: 设置是否开启自动选人 (同步至主进程)
  const setIsAutoPickEnabled = (enabled: boolean) => {
    isAutoPickEnabled.value = enabled
    window.api.send('lcu-action', {
      type: 'setIsAutoPickEnabled',
      payload: enabled
    })
  }

  // Action: 设置对局查询分页参数 (同步至主进程)
  const setQueryMatchedIndex = (payload: QueryMatchedIndex) => {
    Object.assign(queryMatchedIndex, payload)
    window.api.send('lcu-action', {
      type: 'setQueryMatched',
      payload
    })
  }

  // 执行初始化
  init()

  return {
    championList,
    isAutoPickEnabled,
    targetChampionObj,
    isLoaded,
    summonerInfo,
    simpleMatchedList,
    arenaAugments,
    queryMatchedIndex,
    itemsDictionary,
    spellsDictionary,
    perksDictionary,
    perkStylesDictionary,
    matchDetailsDict,
    fetchMatchDetail,
    setTargetChampionId,
    setIsAutoPickEnabled,
    setQueryMatchedIndex
  }
})
