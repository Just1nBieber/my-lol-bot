export const cardStyles = {
  // 1. 整体布局外框 (原 Container 到 TrdContainer)
  panelWrapper:
    'flex-1 min-w-210 min-h-155 relative bg-linear-to-br from-white via-zinc-100 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900',
  mainLayout: 'relative z-10 min-w-210 max-w-full mx-auto flex flex-col gap-6',
  infoSectionWrapper: 'w-full grid gap-4',

  // 2. 召唤师卡片与头部信息 (原 FthContainer, FifthContainer 及未抽离的文字)
  profileCard: 'rounded-xl border p-5 flex flex-col gap-6 background-card',
  profileHeader: 'flex items-center gap-4',
  summonerFlexImgBox: 'w-16 h-16 rounded-xl border relative shadow-inner object-cover',
  summonerLevel: `
    absolute -bottom-0 -right-0 
    px-0.5 py-0.5 
    bg-card/80
    rounded-md
    backdrop-blur-md 
    border border-white/20 
    text-[10px] font-bold tracking-tighter text-foreground 
    shadow-lg
  `,
  summonerFlexContentBox: 'flex flex-col',
  summonerNameText: 'text-base font-semibold text-foreground', // 👈 使用通用前景文字色
  syncStatusText: 'text-xs text-muted-foreground',

  // 3. 排位信息网格 (保持原样)
  rankGrid: 'grid grid-cols-2 gap-4',
  singleRankBox:
    'rounded-xl px-4 py-3 flex items-center gap-4 transition-colors border bg-white border-gray-200 hover:bg-gray-100 dark:bg-black/30 dark:border-white/10 dark:hover:bg-white/5',
  rankIcon:
    'w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] shrink-0 max-[880px]:hidden transition-all duration-300',

  // 4. 右侧文字信息包装盒
  rankInfoWrapper: 'flex flex-col justify-center',

  // 5. 文字排版体系 (保持原样)
  rankTitle: 'text-xs text-foreground',
  rankStats: 'text-xs text-muted-foreground mt-0.5',
  rankName: 'text-lg font-semibold text-foreground mt-1 leading-none', // 👈 使用通用前景文字色

  // 6. 骨架屏/加载状态 (新增抽离)
  loadingStateCard:
    'h-32 background-card rounded-xl border border-white/5 flex items-center justify-center text-muted-foreground'
}
