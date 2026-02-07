import type { Credentials, LeagueWebSocket } from 'league-connect'
import type { LcuAction, GameflowPhase, pickObj, ChampionSimple } from './type'

import { makeAutoObservable } from 'mobx'

class LcuState {
  phase: GameflowPhase = 'None'
  credential: Credentials | null = null
  socket: LeagueWebSocket | null = null
  localPlayerCellId: number = -1
  flatArray: LcuAction[] = []
  isAutoPickEnable: boolean = false
  targetChampionObj: pickObj = {
    championId: 200,
    completed: true
  }
  championList: ChampionSimple[] = []
  isLoaded: boolean = false

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
}

export const lcuState = new LcuState()
