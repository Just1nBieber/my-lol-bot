import { defineStore } from 'pinia'
import { shallowRef, markRaw, ref, reactive } from 'vue'
// 💡 注意：请根据你的实际目录结构调整这里的引入路径
import type {
  ChampionSimple,
  PickObj,
  SummonerInfo,
  QueryMatchedIndex,
  LcuStateSnapshot,
  ItemsDictionary,
  SpellsDictionary,
  PerksDictionary,
  PerkStylesDictionary
} from './type'

import type { SimpleMatchDTO } from '@main/shards/Simple-matched-shard/type.ts'
import type { ArenaAugmentDictItem } from './type'

/**
 * 段位映射字典。
 */
export const transRanked: Record<string, string> = {
  IRON: '坚韧黑铁',
  BRONZE: '不屈青铜',
  SILVER: '荣耀白银',
  GOLD: '荣耀黄金',
  PLATINUM: '华贵铂金',
  EMERALD: '流光翡翠',
  DIAMOND: '璀璨钻石',
  MASTER: '超凡大师',
  GRANDMASTER: '傲世宗师',
  CHALLENGER: '最强王者',
  NONE: '未定级'
}
export const initialSimpleMatch: SimpleMatchDTO = {
  // === 基础对局信息 ===
  gameId: 0,
  gameCreation: '',
  gameDuration: '',
  gameMode: '',
  map: '',
  queueId: 0,
  finalGameResult: '',
  gameType: '',
  endOfGameResult: '',
  // === 玩家身份 ===
  puuid: '',
  win: true,
  // === 英雄与召唤师技能 ===
  championId: 0,
  spells: [0, 0], // 固定长度为 2

  // === 符文与海克斯 ===
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
  augments: [], // 非斗魂模式为空数组

  // === 核心战斗数据 ===
  kills: 0,
  deaths: 0,
  assists: 0,
  goldEarned: 0,
  cs: 0,
  SimpleTotalDamageDealtToChampions: 0,
  kda: '0.00',
  csPerMinute: '0.0',

  // === 装备 ===
  items: [0, 0, 0, 0, 0, 0, 0, 0] // 固定长度为 8
}

export const useLcuStateStore = defineStore('lcuState', () => {
  const championList = shallowRef<ChampionSimple[]>([])
  const isAutoPickEnabled = ref(false)
  const targetChampionObj = reactive<PickObj>({
    championId: 0,
    completed: false
  })
  const isLoaded = ref(false)
  const summonerInfo = shallowRef<SummonerInfo | null>(null)
  // 初始默认值
  // 在 Pinia 或 MobX 中使用
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

  // 更新状态
  const updateState = (newState: Partial<LcuStateSnapshot>) => {
    // 1. 庞大静态数据/快照列表：用 .value 整体替换 + markRaw 彻底物理隔绝深度劫持！
    if (newState.championList) championList.value = markRaw(newState.championList)

    if (newState.simpleMatchedList !== undefined)
      simpleMatchedList.value = markRaw(newState.simpleMatchedList)

    if (newState.arenaAugments !== undefined) arenaAugments.value = markRaw(newState.arenaAugments)

    if (newState.itemsDictionary !== undefined)
      itemsDictionary.value = markRaw(newState.itemsDictionary)

    if (newState.spellsDictionary !== undefined)
      spellsDictionary.value = markRaw(newState.spellsDictionary)

    if (newState.perksDictionary !== undefined)
      perksDictionary.value = markRaw(newState.perksDictionary)

    if (newState.perkStylesDictionary !== undefined)
      perkStylesDictionary.value = markRaw(newState.perkStylesDictionary)

    // 2. 依然需要深度响应式的小型对象：保持原来的 Object.assign
    if (newState.targetChampionObj) Object.assign(targetChampionObj, newState.targetChampionObj)

    if (newState.queryMatchedIndex !== undefined)
      Object.assign(queryMatchedIndex, newState.queryMatchedIndex)

    // 3. 基础类型（布尔、字符串）
    if (newState.isAutoPickEnabled !== undefined)
      isAutoPickEnabled.value = newState.isAutoPickEnabled

    if (newState.isLoaded !== undefined) isLoaded.value = newState.isLoaded

    if (newState.summonerInfo !== undefined) summonerInfo.value = newState.summonerInfo
  }
  // 初始化
  const init = async () => {
    try {
      // 通过 IPC 从主进程获取初始状态
      const initialState = (await window.electron.ipcRenderer.invoke(
        'lcu-get-state'
      )) as Partial<LcuStateSnapshot>
      updateState(initialState)
    } catch (e) {
      console.error('Failed to get initial state', e)
    }

    // 监听主进程的主动推送
    window.electron.ipcRenderer.on(
      'lcu-state-update',
      (_event, newState: Partial<LcuStateSnapshot>) => {
        updateState(newState)
      }
    )
  }

  // Action: 设置目标英雄（乐观更新 + IPC 通信）
  const setTargetChampionId = (id: number) => {
    targetChampionObj.championId = id
    window.electron.ipcRenderer.send('lcu-action', { type: 'setTargetChampionId', payload: id })
  }

  // Action: 开启/关闭自动选择
  const setIsAutoPickEnabled = (enabled: boolean) => {
    isAutoPickEnabled.value = enabled
    window.electron.ipcRenderer.send('lcu-action', {
      type: 'setIsAutoPickEnabled',
      payload: enabled
    })
  }

  // Action: 设置战绩查询的分页索引
  const setQueryMatchedIndex = (payload: QueryMatchedIndex) => {
    Object.assign(queryMatchedIndex, payload)
    window.electron.ipcRenderer.send('lcu-action', {
      type: 'setQueryMatched',
      payload
    })
  }

  // 立即初始化
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
    setTargetChampionId,
    setIsAutoPickEnabled,
    setQueryMatchedIndex
  }
})
