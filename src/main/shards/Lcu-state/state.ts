import type { Credentials, LeagueWebSocket } from 'league-connect'
import type {
  LcuAction,
  GameflowPhase,
  pickObj,
  ChampionSimple,
  SummonerInfo,
  QueryMatchedIndex
} from './type'
import type { ItemsDictionary, SpellsDictionary, PerksDictionary } from '../Champ-asset-shard/type'
import type { ArenaAugmentDictItem } from '@main/utils/arenaCache'

import { makeAutoObservable, observable } from 'mobx'
import { SimpleMatchDTO } from '../Simple-matched-shard/type'

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
  summonerInfo: null as SummonerInfo | null,
  simpleMatchedList: [] as SimpleMatchDTO[],
  arenaAugments: {} as Record<number, ArenaAugmentDictItem>,
  queryMatchedIndex: {
    begIndex: 0,
    endIndex: 19
  } as QueryMatchedIndex,
  itemsDictionary: {} as ItemsDictionary,
  spellsDictionary: {} as SpellsDictionary,
  perksDictionary: {} as PerksDictionary
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
  simpleMatchedList = getDefaultState().simpleMatchedList
  arenaAugments = getDefaultState().arenaAugments
  queryMatchedIndex = getDefaultState().queryMatchedIndex
  itemsDictionary = getDefaultState().itemsDictionary
  spellsDictionary = getDefaultState().spellsDictionary
  perksDictionary = getDefaultState().perksDictionary

  constructor() {
    makeAutoObservable(this, {
      // 告诉 MobX：对 socket 属性，只做引用监听（ref），绝对不要深度代理（Proxy）！
      socket: observable.ref
    })
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

  setSimpleMatchedList(payload: SimpleMatchDTO[]): void {
    this.simpleMatchedList = payload
  }

  /**
   * 写入斗魂竞技场海克斯字典。
   *
   * @param dict - 海克斯字典（例如：{ 1234: { name: '镜花水月', desc: '...', iconPath: '/lol-game-data/assets/...' } }）
   */
  setArenaAugments(dict: Record<number, ArenaAugmentDictItem>): void {
    this.arenaAugments = dict
  }

  setQueryMatchedIndex(payload: QueryMatchedIndex): void {
    this.queryMatchedIndex = payload
  }

  setTargetChampionId(id: number): void {
    this.targetChampionObj.championId = id
    console.log('Main: targetChampionId set to', id)
  }

  setIsAutoPickEnabled(enabled: boolean): void {
    this.isAutoPickEnabled = enabled
    console.log('Main: isAutoPickEnabled set to', enabled)
  }

  setItemsDictionary(items: ItemsDictionary): void {
    this.itemsDictionary = items
  }

  setSpellsDictionary(spells: SpellsDictionary): void {
    this.spellsDictionary = spells
  }

  setPerksDictionary(perks: PerksDictionary): void {
    this.perksDictionary = perks
  }

  resetState(): void {
    console.log('🧹 侦测到客户端断开，开始清理 LCU 动态状态...')

    // 1. 物理切断 WebSocket
    if (this.socket) {
      try {
        this.socket.close()
        console.log('✅ 旧的 WebSocket 连接已物理切断')
      } catch (e) {
        console.error('❌ 切断 WebSocket 时发生错误', e)
      } finally {
        this.socket = null
      }
    }

    // 2. 获取干净的默认状态
    const defaultState = getDefaultState()

    // 3. 🎯 精准重置：只清空和玩家/对局相关的动态数据
    this.phase = defaultState.phase
    this.credential = defaultState.credential
    this.localPlayerCellId = defaultState.localPlayerCellId
    this.flatArray = defaultState.flatArray
    this.isAutoPickEnabled = defaultState.isAutoPickEnabled
    this.targetChampionObj = defaultState.targetChampionObj
    this.championList = defaultState.championList
    this.isLoaded = defaultState.isLoaded
    this.summonerInfo = defaultState.summonerInfo
    this.simpleMatchedList = defaultState.simpleMatchedList
    this.queryMatchedIndex = defaultState.queryMatchedIndex
    // 4. 🛡️ 下面这四个静态字典，坚决不清空！让它们留在内存里！
    // this.arenaAugments
    // this.itemsDictionary
    // this.spellsDictionary
    // this.perksDictionary

    console.log(`✨ 动态状态已恢复出厂设置。
🛡️ 静态字典资源 (海克斯/装备/技能等) 依然安全存活于内存中。`)
  }
}

export const lcuState = new LcuState()
