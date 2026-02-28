import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

/**
 * 召唤师段位信息（单队列）。
 */
export interface RankInfo {
  queueType: string
  tier: string
  division?: string
  leaguePoints?: number
  wins?: number
  losses?: number
}

/**
 * 召唤师基础信息 + 段位信息。
 */
export interface SummonerInfo {
  gameName: string
  tagLine: string
  profileIconId: number
  puuid: string
  soloRank: RankInfo | null
  flexRank: RankInfo | null
}

export interface ChampionSimple {
  id: number
  name: string
  alias: string
  squarePortraitPath: string
}

export interface PickObj {
  championId: number
  completed: boolean
}

export interface LcuStateSnapshot {
  championList: ChampionSimple[]
  isAutoPickEnabled: boolean
  targetChampionObj: PickObj
  isLoaded: boolean
  summonerInfo: SummonerInfo | null
}

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

export const useLcuStateStore = defineStore('lcuState', () => {
  const championList = ref<ChampionSimple[]>([])
  const isAutoPickEnabled = ref(false)
  const targetChampionObj = reactive<PickObj>({
    championId: 0,
    completed: false
  })
  const isLoaded = ref(false)
  const summonerInfo = ref<SummonerInfo | null>(null)

  // 更新状态
  const updateState = (newState: Partial<LcuStateSnapshot>) => {
    if (newState.championList) championList.value = newState.championList
    if (newState.targetChampionObj) Object.assign(targetChampionObj, newState.targetChampionObj)
    if (newState.isAutoPickEnabled !== undefined)
      isAutoPickEnabled.value = newState.isAutoPickEnabled
    if (newState.isLoaded !== undefined) isLoaded.value = newState.isLoaded
    if (newState.summonerInfo !== undefined) summonerInfo.value = newState.summonerInfo
  }

  // 初始化
  const init = async () => {
    try {
      // ipcRenderer.invoke： 双向通信，等待Promise返回 ---> ipcMain.handle()
      const initialState = (await window.electron.ipcRenderer.invoke(
        'lcu-get-state'
      )) as Partial<LcuStateSnapshot>
      updateState(initialState)
    } catch (e) {
      console.error('Failed to get initial state', e)
    }
    // on监听事件 ----> 后端主动推送
    window.electron.ipcRenderer.on(
      'lcu-state-update',
      (_event, newState: Partial<LcuStateSnapshot>) => {
        updateState(newState)
      }
    )
  }

  // Action: 设置目标英雄
  const setTargetChampionId = (id: number) => {
    // 乐观更新
    targetChampionObj.championId = id
    window.electron.ipcRenderer.send('lcu-action', { type: 'setTargetChampionId', payload: id })
  }

  // Action: 开启/关闭自动选择
  const setIsAutoPickEnabled = (enabled: boolean) => {
    // 乐观更新
    isAutoPickEnabled.value = enabled
    // send 单向发送，不用等待回复
    window.electron.ipcRenderer.send('lcu-action', {
      type: 'setIsAutoPickEnabled',
      payload: enabled
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
    setTargetChampionId,
    setIsAutoPickEnabled
  }
})
