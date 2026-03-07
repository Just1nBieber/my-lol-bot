// utils/tagEngine.ts
import type { Participant, MatchInfo, TeamMaxStats, GeneratedTag, PlayerInfoTag } from './type'
import { TagRules } from './tagsConfig'

/**
 * 提取己方队伍的极值和总和数据
 * @param teamParticipants 本局游戏中同一队伍的5名玩家数组
 */
export function getTeamMaxStats(teamParticipants: Participant[]): TeamMaxStats {
  return {
    damage: Math.max(...teamParticipants.map((p) => p.stats.totalDamageDealtToChampions)),
    mitigated: Math.max(...teamParticipants.map((p) => p.stats.damageSelfMitigated)),
    assists: Math.max(...teamParticipants.map((p) => p.stats.assists)),
    vision: Math.max(...teamParticipants.map((p) => p.stats.visionScore)),
    gold: Math.max(...teamParticipants.map((p) => p.stats.goldEarned)),
    cc: Math.max(...teamParticipants.map((p) => p.stats.totalTimeCrowdControlDealt)),
    totalKills: teamParticipants.reduce((sum, p) => sum + p.stats.kills, 0)
  }
}

/**
 * 核心引擎：获取战绩卡片展示的匹配标签
 * @param player 当前玩家对象
 * @param teamMax 己方全队极值数据 (通过 getTeamMaxStats 获得)
 * @param match 游戏对局基础信息 (包含时长和模式)
 * @returns 按照优先级降序排列的标签数组
 */
export function getSimpleMatchedStat(
  player: Participant,
  teamMax: TeamMaxStats,
  match: MatchInfo
): GeneratedTag[] {
  const resultTags: GeneratedTag[] = []

  TagRules.forEach((rule) => {
    if (rule.check(player, teamMax, match)) {
      resultTags.push({
        id: rule.id,
        text: rule.getText(player, teamMax),
        style: rule.style,
        priority: rule.priority
      })
    }
  })

  // 返回前必须根据 priority 从大到小排序，确保高优标签靠前
  return resultTags.sort((a, b) => b.priority - a.priority)
}

/**
 * 提取专门用于“玩家信息卡片”的数据 (十五投、对位经济差占位、反野占位)
 * 单局解析调用
 */
export function getPlayerInfoTags(player: Participant, match: MatchInfo): PlayerInfoTag {
  // 严格判定 15投：投降结束 + 排除3分钟重开 + 时间在15~20分钟内 + 该玩家输了(己方投的)
  const is15MinSurrender =
    player.stats.gameEndedInSurrender &&
    !player.stats.gameEndedInEarlySurrender &&
    match.gameDuration >= 900 &&
    match.gameDuration <= 1200 &&
    !player.stats.win

  return {
    goldDiffPlaceholder: null, // 预留
    counterJunglePlaceholder: player.stats.neutralMinionsKilledEnemyJungle, // 预留
    is15MinSurrender
  }
}

/**
 * 聚合判定：判断该玩家最近的战绩列表中，是否有过 15 投行为
 * @param recentTags 玩家最近一页 (如 20 局) 解析出来的 PlayerInfoTag 数组
 * @returns boolean 如果有过 15 投，返回 true，供前端渲染红温警告标签
 */
export function checkRecentSurrenderTag(recentTags: PlayerInfoTag[]): boolean {
  return recentTags.some((tag) => tag.is15MinSurrender)
}
