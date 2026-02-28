export const championSelectStyles = {
  // 1. 页面级布局与毛玻璃面板
  pageWrapper: 'w-full max-w-5xl p-6 mx-auto',
  glassPanel:
    'p-6 text-white border shadow-2xl bg-white/10 backdrop-blur-md border-white/20 rounded-xl',

  // 2. 顶部控制栏 (标题、搜索、秒选按钮)
  headerArea: 'flex flex-col items-center justify-between gap-4 mb-6 md:flex-row',
  pageTitle:
    'text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400',
  controlsWrapper: 'flex flex-col w-full gap-4 sm:flex-row md:w-auto',

  // 3. 搜索框组件
  searchContainer: 'relative group',
  searchIconWrapper: 'absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none',
  searchIcon: 'w-5 h-5 text-gray-400',
  searchInput:
    'w-full py-2 pl-10 pr-4 text-white placeholder-gray-400 transition-all border rounded-lg sm:w-64 bg-black/30 border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',

  // 4. 秒选控制按钮 (包含基础样式与两种状态)
  autoPickBtnBase:
    'px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 min-w-[140px]',
  autoPickBtnActive:
    'bg-green-500/20 text-green-300 border border-green-500/50 hover:bg-green-500/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]',
  autoPickBtnInactive:
    'bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]',

  // 4.1 秒选按钮的呼吸灯指示器
  indicatorWrapper: 'relative flex w-3 h-3',
  indicatorPing:
    'absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping',
  indicatorCoreBase: 'relative inline-flex w-3 h-3 rounded-full',

  // 5. 英雄列表网格
  championGrid:
    'grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar',

  // 6. 英雄单独卡片 (包含基础框、选中高光、图片、文字遮罩)
  championCard:
    'relative transition-all duration-300 cursor-pointer group hover:scale-105 hover:z-10',
  avatarWrapperBase:
    'aspect-square rounded-xl overflow-hidden border-2 border-white/5 bg-black/40 group-hover:border-blue-400/80 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all',
  avatarWrapperSelected:
    '!border-yellow-400 !shadow-[0_0_20px_rgba(250,204,21,0.5)] ring-2 ring-yellow-400/30',
  avatarImg: 'object-cover w-full h-full transition-transform duration-500 group-hover:scale-110',

  // 6.1 英雄名称渐变遮罩层
  nameOverlay:
    'absolute inset-0 flex items-end justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-xl',
  nameText: 'px-1 pb-2 text-xs font-bold text-white truncate drop-shadow-md',

  // 6.2 选中状态的角标徽章
  pickBadge:
    'absolute top-1 right-1 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg',

  // 7. 空数据状态
  emptyStateWrapper: 'flex flex-col items-center justify-center py-12 text-gray-400'
}
