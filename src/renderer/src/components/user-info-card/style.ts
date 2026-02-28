export const cardStyles = {
  // 1. 整体布局外框 (原 Container 到 TrdContainer)
  panelWrapper:
    'flex-1 min-w-210 min-h-155 bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 relative',
  mainLayout: 'relative z-10 min-w-210 max-w-full mx-auto flex flex-col gap-6',
  infoSectionWrapper: 'w-full grid gap-4',

  // 2. 召唤师卡片与头部信息 (原 FthContainer, FifthContainer 及未抽离的文字)
  profileCard: 'bg-zinc-900/30 rounded-xl border border-white/5 p-5 flex flex-col gap-6',
  profileHeader: 'flex items-center gap-4',
  summonerFlexImgBox: 'w-8 h-8 rounded-full border border-white/10',
  summonerFlexContentBox: 'flex flex-col',
  summonerNameText: 'text-base font-semibold text-white',
  syncStatusText: 'text-xs text-zinc-400',

  // 3. 排位信息网格 (保持原样)
  rankGrid: 'grid grid-cols-2 gap-4',
  singleRankBox:
    'bg-black/30 rounded-xl border border-white/10 px-4 py-3 flex items-center gap-4 transition-colors hover:bg-white/5',
  rankIcon:
    'w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] shrink-0 max-[880px]:hidden transition-all duration-300',

  // 4. 右侧文字信息包装盒
  rankInfoWrapper: 'flex flex-col justify-center',

  // 5. 文字排版体系 (保持原样)
  rankTitle: 'text-xs text-gray-400',
  rankStats: 'text-xs text-gray-300 mt-0.5', 
  rankName: 'text-lg font-semibold text-white mt-1 leading-none',

  // 6. 骨架屏/加载状态 (新增抽离)
  loadingStateCard: 'h-32 bg-zinc-900/30 rounded-xl border border-white/5 flex items-center justify-center text-zinc-500'
}