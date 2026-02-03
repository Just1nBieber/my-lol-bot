import type { Credentials } from 'league-connect'

import { makeAutoObservable } from 'mobx'

class LcuState {
  phase: string = 'None'
  credential: Credentials | null = null

  constructor() {
    makeAutoObservable(this)
  }

  setPhase(newPhase: string): void {
    if (newPhase != this.phase) {
      this.phase = newPhase
      console.log(`大脑感知到[Phase]更新`, this.phase)
    }
  }

  setCredentails(credentails: Credentials): void {
    this.credential = credentails
  }
}

export const lcuState = new LcuState()
