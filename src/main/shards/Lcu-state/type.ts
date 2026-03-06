import { LeagueWebSocket, Credentials } from 'league-connect'
import type { SimpleMatchDTO } from '@main/shards/Simple-matched-shard/type.ts'
import type { ArenaAugmentDictItem } from '@main/utils/arenaCache'
// 🎯 核心知识点：LCU 的 Action 结构
export interface LcuAction {
  id: number // 动作ID (我们发请求就需要这个！)
  actorCellId: number // 谁在执行这个动作 (对应 localPlayerCellId)
  championId: number // 当前选了哪个英雄 (0 代表还没选)
  type: 'pick' | 'ban' // 动作类型：是选人还是Ban人？
  completed: boolean // 是否已锁定？
  isInProgress: boolean // 是否轮到当前动作执行？
}

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

export interface LcuSessionData {
  localPlayerCellId: number
  actions: LcuAction[][] // 二维数组
}

// 英雄资源
export interface ChampionSimple {
  id: number
  name: string
  alias: string // 例如 "Yasuo"
  squarePortraitPath: string // 头像路径
}

/**
 * 召唤师段位信息（单队列）。
 */
export interface RankInfo {
  climbingIndicatorActive?: boolean //正在攀登，隐藏分高
  queueType: string // 排位模式类型
  tier?: string // 大段位
  division?: string // 小段位
  leaguePoints?: number // 胜点
  wins?: number // 胜场
  losses?: number // 负场
  highestDivision?: string // 最高小段
  highestTier?: string //最高大段
  previousSeasonHighestTier?: string
  previousSeasonHighestDivision?: string
  previousSeasonEndTier?: string
  previousSeasonEndDivision?: string
}

/**
 * 召唤师基础信息 + 段位信息。
 */
export interface SummonerInfo {
  gameName: string
  privacy: boolean
  summonerId?: number
  summonerLevel: number
  tagLine: string
  profileIconId: number
  puuid?: string
  soloRank: RankInfo | null
  flexRank: RankInfo | null
}

// 英雄选择
export interface pickObj {
  championId: number
  completed: boolean
}

export interface QueryMatchedIndex {
  begIndex: number
  endIndex: number
}
// ../Lcu-state/type.ts

export interface LcuStateSnapshot {
  /** 当前游戏流程阶段 */
  phase: GameflowPhase

  /** LCU 连接凭证（端口、密码等） */
  credential: Credentials | null

  /** LCU 的 WebSocket 实例，在纯净快照中通常被置为 null */
  socket: LeagueWebSocket | null

  /** 本地玩家在英雄选择房间中的座位号 (Cell ID) */
  localPlayerCellId: number

  /** 英雄选择/禁用阶段的动作列表（通常是由 2D 数组展平而来） */
  flatArray: LcuAction[]

  /** 是否开启了自动秒选功能 */
  isAutoPickEnabled: boolean

  /** 自动秒选的目标英雄配置 */
  targetChampionObj: pickObj

  /** 获取到的英雄列表概览 */
  championList: ChampionSimple[]

  /** 召唤师基础信息与段位 */
  summonerInfo: SummonerInfo | null

  /** 简单匹配信息 */
  simpleMatchedList: SimpleMatchDTO[]

  /** 斗魂竞技场海克斯字典 */
  arenaAugments: Record<number, ArenaAugmentDictItem>

  queryMatchedIndex: QueryMatchedIndex

  /** 基础数据是否已经加载完毕 */
  isLoaded: boolean
}
