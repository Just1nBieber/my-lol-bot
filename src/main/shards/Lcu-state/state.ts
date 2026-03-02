import type { Credentials, LeagueWebSocket } from 'league-connect'
import type { LcuAction, GameflowPhase, pickObj, ChampionSimple, SummonerInfo } from './type'

import { makeAutoObservable } from 'mobx'

const getDefaultState = () => ({
  phase: 'None' as GameflowPhase,
  credential: null as Credentials | null,
  socket: null as LeagueWebSocket | null,
  localPlayerCellId: -1,
  flatArray: [] as LcuAction[],
  isAutoPickEnabled: false,
  targetChampionObj: {
    championId: 200,
    completed: true
  } as pickObj,
  championList: [] as ChampionSimple[],
  isLoaded: false,
  summonerInfo: null as SummonerInfo | null
})

class LcuState {
  phase = getDefaultState().phase
  credential = getDefaultState().credential
  socket = getDefaultState().socket
  localPlayerCellId = getDefaultState().localPlayerCellId
  flatArray = getDefaultState().flatArray
  isAutoPickEnabled = getDefaultState().isAutoPickEnabled
  targetChampionObj = getDefaultState().targetChampionObj
  championList = getDefaultState().championList
  isLoaded = getDefaultState().isLoaded
  summonerInfo = getDefaultState().summonerInfo

  constructor() {
    makeAutoObservable(this)
  }

  setPhase(newPhase: GameflowPhase): void {
    if (newPhase != this.phase) {
      this.phase = newPhase as GameflowPhase
      console.log(`大脑感知到[Phase]更新`, this.phase)
    }
  }

  setCredentials(Credentials: Credentials): void {
    this.credential = Credentials
  }

  setWebSocket(ws: LeagueWebSocket | null): void {
    this.socket = ws
  }

  // 拿到选择英雄阶段的选取顺序
  setLocalPlayerCellId(id: number): void {
    this.localPlayerCellId = id
  }

  setAutoPickFlatArray(array: LcuAction[]): void {
    this.flatArray = array
  }

  // 拿到英雄列表数据
  setChampionList(list: ChampionSimple[]): void {
    this.championList = list
  }

  setChampionListLoad(bol: boolean): void {
    this.isLoaded = bol
  }

  /**
   * 写入召唤师基础信息与段位信息。
   *
   * @param info - 召唤师信息对象或 null（例如：{ displayName: 'Faker', profileIconId: 1234, puuid: 'xxxx', soloRank: null, flexRank: null }）
   */
  setSummonerInfo(info: SummonerInfo | null): void {
    this.summonerInfo = info
  }

  setTargetChampionId(id: number): void {
    this.targetChampionObj.championId = id
    console.log('Main: targetChampionId set to', id)
  }

  setIsAutoPickEnabled(enabled: boolean): void {
    this.isAutoPickEnabled = enabled
    console.log('Main: isAutoPickEnabled set to', enabled)
  }

  resetState(): void {
    console.log('🧹 开始清理 LCU 全局状态...')

    // 【避坑】物理切断旧的 WebSocket 连接
    if (this.socket) {
      try {
        this.socket.close()
        console.log('✅ 旧的 WebSocket 连接已物理切断')
      } catch (e) {
        console.error('❌ 切断 WebSocket 时发生错误', e)
      }
    }

    // 利用 Object.assign，将所有属性瞬间恢复到出厂状态
    // MobX 会自动感知到这些变化并通知视图更新！
    Object.assign(this, getDefaultState())
    console.log('✨ 状态已全部恢复出厂设置')
  }
}

export const lcuState = new LcuState()
