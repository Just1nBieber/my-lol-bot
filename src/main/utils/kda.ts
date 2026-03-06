/**
 * 计算并格式化 KDA（保留两位小数）。
 *
 * @param kills - 击杀数 (例如: 12)
 * @param deaths - 死亡数 (例如: 3；当为 0 时按 1 处理分母)
 * @param assists - 助攻数 (例如: 8)
 */
export const getKdaRatio = (kills: number, deaths: number, assists: number): string => {
  if (deaths === 0) {
    return ((kills + assists) / 1).toFixed(2)
  }
  return ((kills + assists) / deaths).toFixed(2)
}
