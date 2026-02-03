import type { Credentials } from 'league-connect'

import { makeAutoObservable } from 'mobx'

// 定义一个联合类型，这就是最好的“文档”
export type GameflowPhase = 
  | 'None'
  | 'Lobby'
  | 'Matchmaking'
  | 'ReadyCheck'
  | 'ChampSelect'
  | 'GameStart'
  | 'InProgress'
  | 'PreEndOfGame'
  | 'EndOfGame'
  | 'Reconnect'
  | 'TerminatedInError'

class LcuState {
  phase: GameflowPhase = 'None'
  credential: Credentials | null = null

  constructor() {
    makeAutoObservable(this)
  }

  setPhase(newPhase: GameflowPhase): void {
    if (newPhase != this.phase) {
      this.phase = newPhase as GameflowPhase
      console.log(`大脑感知到[Phase]更新`, this.phase)
    }
  }

  setCredentails(credentails: Credentials): void {
    this.credential = credentails
  }
}

export const lcuState = new LcuState()
