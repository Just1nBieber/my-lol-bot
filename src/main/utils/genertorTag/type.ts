// types/match.ts

export interface MatchInfo {
  gameDuration: number // 游戏时长(秒)
  gameMode: string // 游戏模式(CLASSIC, ARAM, 等)
}

export interface ParticipantStats {
  // 击杀/连杀数据
  kills: number
  deaths: number
  assists: number
  pentaKills: number
  quadraKills: number
  tripleKills: number

  // 伤害与承伤
  totalDamageDealtToChampions: number
  damageSelfMitigated: number
  totalTimeCrowdControlDealt: number
  totalHeal: number

  // 运营与推塔
  visionScore: number
  turretKills: number
  damageDealtToTurrets: number
  goldEarned: number
  totalMinionsKilled: number
  neutralMinionsKilled: number
  neutralMinionsKilledEnemyJungle: number

  // 胜负与投降
  win: boolean
  gameEndedInSurrender: boolean
  gameEndedInEarlySurrender: boolean
}

export interface ParticipantTimeline {
  role: string
  lane: string
}

export interface Participant {
  participantId: number
  teamId: number
  stats: ParticipantStats
  timeline: ParticipantTimeline
}

export interface TeamMaxStats {
  damage: number
  mitigated: number
  assists: number
  vision: number
  gold: number
  cc: number
  totalKills: number
}

export interface GeneratedTag {
  id: string
  text: string
  style: string
  priority: number
}

export interface TagRule {
  id: string
  getText: (p: Participant, teamMax: TeamMaxStats) => string
  style: string
  priority: number
  check: (p: Participant, teamMax: TeamMaxStats, match: MatchInfo) => boolean
}

export interface PlayerInfoTag {
  goldDiffPlaceholder: number | null // 对位经济差(占位)
  counterJunglePlaceholder: number | null // 反野数量(占位)
  is15MinSurrender: boolean // 是否在这局触发了15投
}
