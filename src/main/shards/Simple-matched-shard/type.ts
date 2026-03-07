export interface SimpleMatchedInterface {
  accountId: number
  games: GamePagination
}

export interface AllPersonMatched {
  accountId: number
  games: GamePagination
}

export interface GamePagination {
  gameBeginDate: string // 游戏开始日期字符串
  gameCount: number // 当前拉取的游戏总数
  gameEndDate: string // 游戏结束日期字符串
  gameIndexBegin: number // 本次查询的起始索引（如：40）
  gameIndexEnd: number // 本次查询的结束索引（如：69）
  games: MatchDetail[]
}

export interface MatchDetail {
  endOfGameResult: string
  gameCreation: number
  gameCreationDate: string
  gameDuration: number
  gameId: number
  gameMode: string
  gameModeMutators: string[]
  gameType: string
  gameVersion: string
  mapId: number
  participantIdentities: ParticipantIdentity[]
  participants: Participant[]
  platformId: string
  queueId: number
  seasonId: number
  teams: Team[]
}

export interface ParticipantIdentity {
  participantId: number
  player: Player
}

export interface Player {
  accountId: number
  currentAccountId: number
  currentPlatformId: string
  gameName: string
  matchHistoryUri: string
  platformId: string
  profileIcon: number
  puuid: string
  summonerId: number
  summonerName: string
  tagLine: string
}

export interface Participant {
  championId: number
  highestAchievedSeasonTier: string
  participantId: number
  spell1Id: number
  spell2Id: number
  stats: ParticipantStats
  teamId: number
  timeline: ParticipantTimeline
}

export interface ParticipantStats {
  assists: number
  causedEarlySurrender: boolean
  champLevel: number
  combatPlayerScore: number
  damageDealtToObjectives: number
  damageDealtToTurrets: number
  damageSelfMitigated: number
  deaths: number
  doubleKills: number
  earlySurrenderAccomplice: boolean
  firstBloodAssist: boolean
  firstBloodKill: boolean
  firstInhibitorAssist: boolean
  firstInhibitorKill: boolean
  firstTowerAssist: boolean
  firstTowerKill: boolean
  gameEndedInEarlySurrender: boolean
  gameEndedInSurrender: boolean
  goldEarned: number
  goldSpent: number
  inhibitorKills: number
  item0: number
  item1: number
  item2: number
  item3: number
  item4: number
  item5: number
  item6: number
  killingSprees: number
  kills: number
  largestCriticalStrike: number
  largestKillingSpree: number
  largestMultiKill: number
  longestTimeSpentLiving: number
  magicDamageDealt: number
  magicDamageDealtToChampions: number
  magicalDamageTaken: number
  neutralMinionsKilled: number
  neutralMinionsKilledEnemyJungle: number
  neutralMinionsKilledTeamJungle: number
  objectivePlayerScore: number
  participantId: number
  pentaKills: number
  perk0: number
  perk0Var1: number
  perk0Var2: number
  perk0Var3: number
  perk1: number
  perk1Var1: number
  perk1Var2: number
  perk1Var3: number
  perk2: number
  perk2Var1: number
  perk2Var2: number
  perk2Var3: number
  perk3: number
  perk3Var1: number
  perk3Var2: number
  perk3Var3: number
  perk4: number
  perk4Var1: number
  perk4Var2: number
  perk4Var3: number
  perk5: number
  perk5Var1: number
  perk5Var2: number
  perk5Var3: number
  perkPrimaryStyle: number
  perkSubStyle: number
  physicalDamageDealt: number
  physicalDamageDealtToChampions: number
  physicalDamageTaken: number
  playerAugment1: number
  playerAugment2: number
  playerAugment3: number
  playerAugment4: number
  playerAugment5: number
  playerAugment6: number
  playerScore0: number
  playerScore1: number
  playerScore2: number
  playerScore3: number
  playerScore4: number
  playerScore5: number
  playerScore6: number
  playerScore7: number
  playerScore8: number
  playerScore9: number
  playerSubteamId: number
  quadraKills: number
  roleBoundItem: number
  sightWardsBoughtInGame: number
  subteamPlacement: number
  teamEarlySurrendered: boolean
  timeCCingOthers: number
  totalDamageDealt: number
  totalDamageDealtToChampions: number
  totalDamageTaken: number
  totalHeal: number
  totalMinionsKilled: number
  totalPlayerScore: number
  totalScoreRank: number
  totalTimeCrowdControlDealt: number
  totalUnitsHealed: number
  tripleKills: number
  trueDamageDealt: number
  trueDamageDealtToChampions: number
  trueDamageTaken: number
  turretKills: number
  unrealKills: number
  visionScore: number
  visionWardsBoughtInGame: number
  wardsKilled: number
  wardsPlaced: number
  win: boolean
}

export interface ParticipantTimeline {
  // 英雄联盟 API 中的 Deltas 通常是键值对，例如 {"10-20": 4.5}
  creepsPerMinDeltas: Record<string, number>
  csDiffPerMinDeltas: Record<string, number>
  damageTakenDiffPerMinDeltas: Record<string, number>
  damageTakenPerMinDeltas: Record<string, number>
  goldPerMinDeltas: Record<string, number>
  lane: string
  participantId: number
  role: string
  xpDiffPerMinDeltas: Record<string, number>
  xpPerMinDeltas: Record<string, number>
}

export interface Team {
  // bans 在排位赛中通常包含数据，这里我为你补充了标准结构
  bans: Ban[]
  baronKills: number
  dominionVictoryScore: number
  dragonKills: number
  firstBaron: boolean
  firstBlood: boolean
  firstDargon: boolean // 注意：这是 Riot API 存在多年的一个经典拼写错误 (Dragon 拼成了 Dargon)
  firstInhibitor: boolean
  firstTower: boolean
  hordeKills: number
  inhibitorKills: number
  riftHeraldKills: number
  teamId: number
  towerKills: number
  vilemawKills: number
  win: 'Win' | 'Fail' // 队伍胜负状态通常只有这两个固定字符串
}

export interface Ban {
  championId: number
  pickTurn: number
}

/**
 * 极简版单人战绩 DTO (Data Transfer Object)
 * 专为前端左侧 70% 的单人战绩卡片渲染而设计，已极致扁平化。
 */
export interface SimpleMatchDTO {
  // === 基础对局信息 ===
  /** 对局唯一 ID */
  gameId: number
  /** 开局时间（已格式化文本） */
  gameCreation: string
  /** 对局时长（已格式化文本） */
  gameDuration: string
  /** 游戏模式（已翻译文本） */
  gameMode: string
  /** 地图名称（已翻译文本） */
  map: string
  /** 队列 ID (如: 420 单双排, 450 大乱斗) */
  queueId: number
  /** 游戏结束状态（已翻译文本） */
  finalGameResult: string
  /** 原始游戏类型 */
  gameType: string
  /** 原始结束状态 */
  endOfGameResult: string
  // === 玩家身份 ===
  /** 当前玩家的唯一标识符，用于在右侧多人详情中做身份比对高亮 */
  puuid: string

  // === 英雄与召唤师技能 ===
  /** 英雄头像 ID */
  championId: number
  /** 召唤师技能数组，固定长度为 2 [spell1Id, spell2Id] */
  spells: number[]

  // === 符文与海克斯 ===
  runes: {
    primaryStyle: number
    subStyle: number
    perks: Array<{
      id: number
      vars: number[]
    }>
  }
  /** 斗魂竞技场专属：海克斯强化数组。非斗魂模式下为空数组 [] */
  augments: number[]

  // === 核心战斗数据 ===
  /** 击杀数 */
  kills: number
  /** 死亡数 */
  deaths: number
  /** 助攻数 */
  assists: number
  /** 赚取的总金币 */
  goldEarned: number
  /** 总补兵数 (线上小兵 + 野怪) */
  cs: number
  /** KDA 比值（字符串，保留两位小数） */
  kda: string
  /** 分均补兵（字符串，保留一位小数） */
  csPerMinute: string

  // === 装备 ===
  /** * 装备栏数组，固定长度为 8。
   * 前 7 格为常规装备与饰品眼，第 8 格为 S16 分路任务专属装备 (roleBoundItem)。
   * 如果某个格子没有装备，该位置的值为 0。
   */
  items: number[]
}

/**
 * 简报表字典映射 (键为 gameId，值为极简战绩对象)
 * 用于 Vue (Pinia) 状态管理中，实现 O(1) 极速查表
 */
export type SimpleMatchMap = Record<number, SimpleMatchDTO>
