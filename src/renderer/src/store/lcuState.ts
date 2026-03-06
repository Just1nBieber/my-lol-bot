import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
// 💡 注意：请根据你的实际目录结构调整这里的引入路径
import type {
  ChampionSimple,
  PickObj,
  SummonerInfo,
  QueryMatchedIndex,
  LcuStateSnapshot,
  ItemsDictionary,
  SpellsDictionary,
  PerksDictionary
} from './type'

import type { SimpleMatchDTO } from '@main/shards/Simple-matched-shard/type.ts'
import type { ArenaAugmentDictItem } from '@main/utils/arenaCache'

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
  gameCreation: 0,
  gameDuration: 0,
  gameMode: '',
  map: '',
  queueId: 0,
  finalGameResult: '',
  gameType: '',
  endOfGameResult: '',
  // === 玩家身份 ===
  puuid: '',

  // === 英雄与召唤师技能 ===
  championId: 0,
  spells: [0, 0], // 固定长度为 2

  // === 符文与海克斯 ===
  perkKeystone: 0,
  perkPrimaryStyle: 0,
  perkSubStyle: 0,
  augments: [], // 非斗魂模式为空数组

  // === 核心战斗数据 ===
  kills: 0,
  deaths: 0,
  assists: 0,
  goldEarned: 0,
  cs: 0,
  kda: '0.00',
  csPerMinute: '0.0',

  // === 装备 ===
  items: [0, 0, 0, 0, 0, 0, 0, 0] // 固定长度为 8
}

export const useLcuStateStore = defineStore('lcuState', () => {
  const championList = ref<ChampionSimple[]>([])
  const isAutoPickEnabled = ref(false)
  const targetChampionObj = reactive<PickObj>({
    championId: 0,
    completed: false
  })
  const isLoaded = ref(false)
  const summonerInfo = ref<SummonerInfo | null>(null)
  // 初始默认值
  // 在 Pinia 或 MobX 中使用
  const simpleMatchedList = ref<SimpleMatchDTO[]>([])
  const arenaAugments = ref<Record<number, ArenaAugmentDictItem>>({})
  const queryMatchedIndex = reactive<QueryMatchedIndex>({
    begIndex: 0,
    endIndex: 19
  })
  const itemsDictionary = reactive<ItemsDictionary>({})
  const spellsDictionary = reactive<SpellsDictionary>({})
  const perksDictionary = reactive<PerksDictionary>({})

  // 更新状态
  const updateState = (newState: Partial<LcuStateSnapshot>) => {
    if (newState.championList) championList.value = newState.championList
    if (newState.targetChampionObj) Object.assign(targetChampionObj, newState.targetChampionObj)
    if (newState.isAutoPickEnabled !== undefined)
      isAutoPickEnabled.value = newState.isAutoPickEnabled
    if (newState.isLoaded !== undefined) isLoaded.value = newState.isLoaded
    if (newState.summonerInfo !== undefined) summonerInfo.value = newState.summonerInfo
    if (newState.simpleMatchedList !== undefined)
      simpleMatchedList.value = newState.simpleMatchedList
    if (newState.arenaAugments !== undefined) arenaAugments.value = newState.arenaAugments
    if (newState.queryMatchedIndex !== undefined)
      Object.assign(queryMatchedIndex, newState.queryMatchedIndex)
    if (newState.itemsDictionary !== undefined)
      Object.assign(itemsDictionary, newState.itemsDictionary)
    if (newState.spellsDictionary !== undefined)
      Object.assign(spellsDictionary, newState.spellsDictionary)
    if (newState.perksDictionary !== undefined)
      Object.assign(perksDictionary, newState.perksDictionary)
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
    setTargetChampionId,
    setIsAutoPickEnabled,
    setQueryMatchedIndex
  }
})
