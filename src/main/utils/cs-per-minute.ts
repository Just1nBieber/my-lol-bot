/**
 * 计算并格式化分均补兵（保留一位小数）。
 *
 * @param totalCS - 总补兵（线上小兵 + 野怪）(例如: 215)
 * @param gameDurationInSeconds - 对局总时长（秒）(例如: 1800)
 */
export const getCsPerMinute = (totalCS: number, gameDurationInSeconds: number): string => {
  if (gameDurationInSeconds <= 0) {
    return '0.0'
  }
  const minutes = gameDurationInSeconds / 60
  return (totalCS / minutes).toFixed(1)
}

