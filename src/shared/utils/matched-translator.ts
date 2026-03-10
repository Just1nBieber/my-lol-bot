import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn' // 引入中文语言包

import type { Team } from '@main/shards/Simple-matched-shard/type'

export const CURRENT_ROTATING_MODE = '海克斯大乱斗'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// ==========================================
// 1. 静态字典映射 (Dictionaries)
// ==========================================

const GAME_MODE_MAP: Record<string, string> = {
  ARAM: '极地大乱斗',
  TFT: '云顶之弈',
  URF: '无限火力',
  CHERRY: '斗魂竞技场',
  KIWI: CURRENT_ROTATING_MODE,
  PRACTICETOOL: '训练模式',
  TUTORIAL: '新手教程',
  CLASSIC: '经典模式' // 提供一个兜底，防备没有 queueId 的极端情况
}

const MAP_ID_MAP: Record<number, string> = {
  11: '召唤师峡谷',
  12: '嚎哭深渊',
  21: '极限闪击',
  22: '斗魂竞技场'
}

// ==========================================
// 2. 动态格式化函数 (Formatters)
// ==========================================

/**
 * 将游戏时长（秒）翻译为 mm:ss
 */
export function translateGameDuration(seconds: number): string {
  if (!seconds) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}分${s.toString().padStart(2, '0')}秒`
}

/**
 * 翻译对局时间戳为友好展示
 */
export function translateGameCreation(timestamp: number): string {
  if (!timestamp) return '未知时间'

  const targetDate = dayjs(timestamp)
  const now = dayjs()
  const diffDays = now.diff(targetDate, 'day')

  if (diffDays < 7) {
    return targetDate.fromNow()
  } else {
    return targetDate.format('MM-DD')
  }
}

// ==========================================
// 3. 统一暴露的翻译接口 (Facade)
// ==========================================

/**
 * 翻译游戏模式，并针对经典模式利用 queueId 细分排位与匹配
 */
export function translateGameMode(
  mode: string,
  queueId: number,
  type: string,
  team: Team[]
): string {
  if (type === 'CUSTOM_GAME') {
    const hasBans = team.some((team) => team.bans && team.bans.length > 0)
    return hasBans ? '自定义(征召)' : '自定义(自选)'
  }

  // 🎯 拦截：如果大类是经典召唤师峡谷，且存在 queueId，则进行精细翻译
  if (mode === 'CLASSIC' && queueId) {
    switch (queueId) {
      case 420:
        return '单排/双排'
      case 430:
        return '匹配模式'
      case 400: // 400也是匹配（征召模式）
        return '征召模式'
      case 440:
        return '灵活排位'
    }
  }

  // 非 CLASSIC 模式，或者没有命中 queueId，走常规字典
  return GAME_MODE_MAP[mode] || mode
}

// 把原来的 translateMap 函数替换成这个超级增强版：
export function translateMap(mapId: number, mutators: string[] = []): string {
  // 🎯 拦截：如果底层是 12 号大乱斗地图，去突变器里找“皮肤”
  if (mapId === 12) {
    if (mutators.includes('mapskin_ha_bilgewater')) {
      return '屠夫之桥'
    }
    if (mutators.includes('mapskin_map12_bloom')) {
      return '莲华栈桥'
    }
    return '嚎哭深渊' // 没有任何皮肤突变，就是原味嚎哭深渊
  }

  // 其他地图走常规字典
  return MAP_ID_MAP[mapId] || `未知地图(${mapId})`
}

/**
 * 综合判定单局对战的最终结果
 * @param endOfGame 基础游戏结束状态
 * @param win 是否胜利
 * @param earlySurrender 是否提前投降 (重开)
 * @param surrender 是否投降
 */
export function translateGameResult(
  endOfGame: string,
  win: boolean,
  earlySurrender: boolean,
  surrender: boolean
): string {
  // 1. 最高优先级：对局被系统或人数不足强行终止
  if (endOfGame.includes('Abort')) {
    return '无效对局'
  }

  // 2. 三分钟重开
  if (earlySurrender) {
    return '重开'
  }

  // 3. 投降判定 (注意细节：只有失败且游戏以投降结束，才叫投降。如果是敌方投降你赢了，那对你来说依然是“胜利”)
  if (surrender && !win) {
    return '投降'
  }

  // 4. 正常推平基地的胜负
  return win ? '胜利' : '失败'
}


// 🛡️ 转换函数 (自带容错防雷)
export const getRarity = (rarity?: string): string => {
  // 核心防御：如果刚开机那零点几秒，后端还没把 rarity 缝合好，它就是 undefined
  if (!rarity) return '加载中...' // 你也可以换成空字符串 '' 保持安静占位
  // 返回对应的中文，如果拳头以后偷偷加了新级别，就兜底显示“未知”
  return rarityTextMap[rarity] || '未知'
}

// 🎯 稀有度文字映射字典
const rarityTextMap: Record<string, string> = {
  kSilver: '白银',
  kGold: '黄金',
  kPrismatic: '棱彩'
}

// 🛡️ 转换函数：获取文字
export const getRarityText = (rarity?: string): string => {
  if (!rarity) return '加载中...'
  return rarityTextMap[rarity] || '未知'
}


