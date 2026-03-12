export const simpleMatchStyle = {
  // --- 📦 最外层与滚动容器 ---
  wrapper: 'w-full flex flex-col gap-3 px-3 pb-3 h-full overflow-y-auto relative scroll-smooth',

  // --- 🛠️ 顶部操作栏 (吸顶与筛选) ---
  stickyHeaderBase: 'sticky top-0 z-40 w-full transition-all duration-300',
  stickyHeaderActive:
    'py-2 px-3 shadow-lg backdrop-blur-md bg-white/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800',
  stickyHeaderInactive: 'py-4 px-1 bg-transparent',
  headerLayout: 'flex items-center justify-between gap-4',
  filterGroup: 'flex items-center gap-3',
  selectBase:
    'h-8 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',

  // 胜负状态 Toggle 按钮组
  toggleGroup: 'flex items-center bg-muted rounded-md p-1 h-8',
  toggleBtnBase: 'px-3 py-0.5 text-xs rounded-sm transition-all',
  toggleBtnActiveAll: 'bg-background shadow-sm text-foreground font-medium',
  toggleBtnInactive: 'text-muted-foreground hover:text-foreground',
  toggleBtnActiveWin: 'bg-emerald-500/10 text-emerald-600 font-medium',
  toggleBtnInactiveWin: 'text-muted-foreground hover:text-emerald-600',
  toggleBtnActiveLose: 'bg-rose-500/10 text-rose-600 font-medium',
  toggleBtnInactiveLose: 'text-muted-foreground hover:text-rose-600',

  // --- 📄 分页器 ---
  paginationGroup: 'flex items-center gap-2',
  totalCountText: 'text-xs text-muted-foreground',
  pageSizeSelect: 'h-8 w-16 rounded-md border border-input bg-background px-2 py-1 text-xs',
  pageNavGroup: 'flex items-center gap-1',
  pageBtn:
    'h-8 w-8 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent disabled:opacity-50',
  pageIndicator: 'text-xs min-w-[3rem] text-center',

  // --- 🃏 战绩卡片基础布局 ---
  card: 'w-[1120px] min-w-[1120px] min-h-[115px] shrink-0 flex flex-col p-3 px-4 gap-2 relative rounded-md border',
  mainContent: 'flex gap-4 items-stretch',

  // --- 🛡️ 左侧区块 (英雄头像与胜负结果) ---
  leftBlock: 'flex flex-col items-center justify-center w-[60px] shrink-0',
  heroIconWrap: 'w-12 h-12 rounded-lg p-[1px]',
  heroIcon: 'w-full h-full rounded-lg object-cover',
  winOrLose: 'text-[15px] font-bold mt-1.5 leading-none',

  // --- ⚔️ 中间区块 (数据、技能、装备) ---
  middleBlock: 'flex flex-col justify-between flex-1 py-0.5 gap-2 min-w-0',
  dataRow: 'flex items-center gap-8',

  // 召唤师技能与符文
  spellAndRune: 'flex items-center gap-2 shrink-0',
  spellCol: 'grid grid-cols-1 gap-1',
  spellIcon: 'w-6 h-6 rounded-md object-cover bg-black/20',
  classicRune: 'grid grid-cols-2 gap-1',
  kiwiRune: 'grid grid-cols-3 gap-1',
  runeIcon: 'w-6 h-6 rounded-md object-cover bg-black/20',
  kiwiIcon: 'w-6 h-6 rounded-md object-cover bg-black/20',
  kiwiPlaceholder:
    'w-6 h-6 rounded-md bg-black/20 dark:bg-black/40 border border-black/10 dark:border-white/10',

  // 统计数据 (KDA, 伤害, 补刀)
  statCard: 'flex flex-col leading-none',
  KDA_Card: 'min-w-[125px]',
  DAMAGE_Card: 'min-w-[95px]',
  CS_Card: 'min-w-[95px]',
  kadNumber: 'text-[14px] font-extrabold leading-none tracking-tight',
  deathNumber: 'text-red-500',
  subText: 'text-[12px] font-semibold mt-1 text-foreground/90',
  damage: 'flex flex-col leading-none',
  DamageNumber_Per: 'text-[14px] font-extrabold leading-none tracking-tight',
  DamageNumber: 'text-[12px] font-semibold mt-1 text-foreground/90',
  CSNumber: 'text-[14px] font-extrabold leading-none tracking-tight',
  CSNumber_Per: 'text-[12px] font-semibold mt-1 text-foreground/90',
  rowHint: 'text-[11px] text-muted-foreground/80 mt-1',

  // 装备栏与评价标签
  equipRow: 'flex items-center gap-3',
  epicBox: 'flex gap-1',
  epicIcon: 'w-7 h-7 rounded-md object-cover',
  placeHolder:
    'w-7 h-7 rounded-md bg-black/20 dark:bg-black/40 border border-black/10 dark:border-white/10',
  summonerTag: 'flex flex-wrap gap-1.5',
  badgeBlue: 'px-2 py-0.5 rounded-full text-[11px] text-white bg-cyan-600',
  badgeOrange: 'px-2 py-0.5 rounded-full text-[11px] text-white bg-amber-500',
  badgePink: 'px-2 py-0.5 rounded-full text-[11px] text-white bg-fuchsia-600',

  // --- 👥 右侧区块 (十名召唤师列表) ---
  rightBlock: 'flex gap-2 w-[180px] shrink-0 border-l border-white/10 pl-4 items-center',
  allSummonerCols: 'flex gap-2 flex-1',
  allSummonerCol: 'flex flex-col gap-1.5',
  allSummonerItem: 'flex items-center gap-1.5',
  tinyAvatar: 'w-4 h-4 rounded object-cover',
  tinyAvatarPlaceholder:
    'w-4 h-4 rounded bg-black/20 dark:bg-black/40 border border-black/10 dark:border-white/10',
  tinyName: 'truncate w-16 text-[11px] text-foreground/85',
  dropArrow: 'text-lg text-foreground/70 leading-none',

  // --- 📅 底部对局元信息 ---
  bottomText: 'text-[11px] text-black dark:text-white mt-1',

  // --- 💬 悬浮提示框 (Tooltip) 容器 ---
  tooltipSpellContainer: 'flex flex-col gap-1 max-w-[260px]',
  tooltipRuneContainer: 'flex flex-col gap-2 max-w-[280px]',
  tooltipRuneHeader: 'flex items-center gap-2',
  tooltipRuneIcon: 'w-7 h-7 rounded',
  tooltipTitle: 'font-semibold',
  tooltipText: 'text-xs',
  rarityBadge: 'inline-flex items-center gap-1.5 text-xs',
  rarityDot: 'inline-block w-2.5 h-2.5 rounded-full',

  // 装备专属 Tooltip
  epicCard: 'w-[340px] p-2 rounded-lg border border-border bg-popover text-popover-foreground',
  epicHead: 'w-full flex items-start gap-2',
  epicHeadLeft: 'w-10 h-10 rounded-md overflow-hidden shrink-0',
  epicImageInner: 'w-full h-full object-cover',
  epicHeadRight: 'flex flex-col gap-1',
  epicName: 'text-sm font-semibold',
  totalPrice: 'text-xs text-muted-foreground',
  epicHeadBottom: 'mt-2 flex items-start justify-between gap-3',
  fromWhichItem: 'flex flex-wrap gap-1',
  fromItem: 'w-6 h-6 rounded overflow-hidden',
  toWhichItem: 'flex flex-wrap gap-1',
  toItem: 'w-6 h-6 rounded overflow-hidden',
  epicBottom: 'mt-2 text-xs leading-4'
}
