// 装备数据接口
export interface ItemAsset {
  id: number
  name: string
  description: string // 包含 HTML 标签的属性描述（如：<mainText><stats>10 攻击力...</stats></mainText>）
  active: boolean // 是否有主动技能
  inStore: boolean // 是否在商店中出售（有些特殊模式装备或废弃装备为 false）
  from: number[] // 合成来源的装备 ID 数组
  to: number[] // 可合成的上一级装备 ID 数组
  categories: string[] // 商店分类（如：["Damage", "LifeSteal"]）
  maxAmmo: number // 最大充能数（比如药水）
  isEnchantment: boolean // 是否是附魔
  price: number // 合成价格
  priceTotal: number // 总价格（Tooltip 里通常显示这个）
  iconPath: string // 本地图片相对路径
}

// 召唤师技能接口
export interface SummonerSpellAsset {
  id: number
  name: string
  description: string // 技能描述
  summonerLevel: number // 解锁需要的召唤师等级
  cooldown: number // 冷却时间（秒）
  gameModes: string[] // 允许使用的游戏模式（如：["CLASSIC", "ARAM"]）
  iconPath: string // 本地图片相对路径
}

// 符文与海克斯强化接口
export interface PerkAsset {
  id: number
  name: string
  shortDesc: string // 简短描述（推荐在普通战绩列表中使用，排版更干净）
  longDesc: string // 包含具体伤害数值、CD的详细描述（自带大量 HTML 标签）
  iconPath: string // 本地图片相对路径
  endOfGameStatDescs?: string[] // 游戏结算时的统计维度说明（可选）
}

/**
 * 符文系（主系/副系）资源项。
 */
export interface PerkStyleItem {
  id: number
  name: string
  tooltip: string
  iconPath: string
}

// 结合 TypeScript 的内置泛型 Record<KeyType, ValueType>
// 定义以 ID 为 Key，以具体数据为 Value 的字典模型

export type ItemsDictionary = Record<number, ItemAsset>
export type SpellsDictionary = Record<number, SummonerSpellAsset>
export type PerksDictionary = Record<number, PerkAsset>
export type PerkStylesDictionary = Record<number, PerkStyleItem>
