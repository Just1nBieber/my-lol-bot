import type { Credentials, LeagueWebSocket } from 'league-connect'
import type { LcuAction, GameflowPhase, pickObj, ChampionSimple, SummonerInfo } from './type'

import { makeAutoObservable } from 'mobx'

class LcuState {
  phase: GameflowPhase = 'None'
  credential: Credentials | null = null
  socket: LeagueWebSocket | null = null
  localPlayerCellId: number = -1
  flatArray: LcuAction[] = []
  isAutoPickEnabled: boolean = false
  targetChampionObj: pickObj = {
    championId: 200,
    completed: true
  }
  championList: ChampionSimple[] = []
  isLoaded: boolean = false
  summonerInfo: SummonerInfo | null = null

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
}

export const lcuState = new LcuState()
