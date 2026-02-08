import { defineStore } from 'pinia'
import { ref } from 'vue'

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

export const useLcuStateStore = defineStore('lcuState', () => {
  const championList = ref<ChampionSimple[]>([])
  const isAutoPickEnabled = ref(false)
  const targetChampionObj = ref<PickObj>({
    championId: 0,
    completed: false
  })
  const isLoaded = ref(false)

  // 更新状态
  const updateState = (newState: any) => {
    if (newState.championList) championList.value = newState.championList
    if (newState.targetChampionObj) targetChampionObj.value = newState.targetChampionObj
    if (newState.isAutoPickEnabled !== undefined)
      isAutoPickEnabled.value = newState.isAutoPickEnabled
    if (newState.isLoaded !== undefined) isLoaded.value = newState.isLoaded
  }

  // 初始化
  const init = async () => {
    try {
      const initialState = await window.electron.ipcRenderer.invoke('lcu-get-state')
      updateState(initialState)
    } catch (e) {
      console.error('Failed to get initial state', e)
    }

    window.electron.ipcRenderer.on('lcu-state-update', (_event, newState) => {
      updateState(newState)
    })
  }

  // Action: 设置目标英雄
  const setTargetChampionId = (id: number) => {
    // 乐观更新
    targetChampionObj.value.championId = id
    window.electron.ipcRenderer.send('lcu-action', { type: 'setTargetChampionId', payload: id })
  }

  // Action: 开启/关闭自动选择
  const setIsAutoPickEnabled = (enabled: boolean) => {
    // 乐观更新
    isAutoPickEnabled.value = enabled
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
    setTargetChampionId,
    setIsAutoPickEnabled
  }
})
