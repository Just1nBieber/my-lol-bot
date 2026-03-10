// 🎨 稀有度质感圆点样式字典 (Tailwind CSS)
// 核心技巧归档：bg-gradient-to-br 制造受光面，inset shadow 制造 3D 凸起的高光球体感
const rarityDotTheme: Record<string, string> = {
  // 白银：冷色调灰白渐变 + 细腻的金属反光边框
  kSilver:
    'bg-gradient-to-br from-slate-100 to-slate-400 border border-slate-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.2)]',

  // 黄金：从浅黄到琥珀色的渐变 + 金色边框
  kGold:
    'bg-gradient-to-br from-yellow-100 via-yellow-400 to-amber-600 border border-yellow-500 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.2)]',

  // 棱彩：粉紫蓝三色渐变 + 纯白半透明高光 + 外部霓虹发光晕染
  kPrismatic:
    'bg-gradient-to-br from-fuchsia-400 via-violet-400 to-cyan-400 border border-white/60 shadow-[inset_0_1px_3px_rgba(255,255,255,0.9),0_0_8px_rgba(192,132,252,0.6)]',

  // 异步加载时的默认占位（暗淡无光）
  default: 'bg-gray-700 border border-gray-600'
}

// 🛡️ 转换函数：获取圆点 CSS 类名
export const getRarityDotClass = (rarity?: string): string => {
  if (!rarity) return rarityDotTheme.default
  return rarityDotTheme[rarity] || rarityDotTheme.default
}
