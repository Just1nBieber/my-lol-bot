// 文件：ChampionGrid.style.ts
export const championSelectStyles = {
  // 1. 页面级布局
  pageWrapper: 'w-full max-w-5xl p-6 mx-auto',

  // 🌟 [重构点]：去掉了 bg-white/10 和 text-white。
  // 使用 bg-background/80 配合 backdrop-blur-md，白天是白底毛玻璃，黑夜是黑底毛玻璃！
  glassPanel:
    'p-6 border shadow-2xl bg-background/80 backdrop-blur-md border-border rounded-xl text-foreground',

  // 2. 顶部控制栏
  headerArea: 'flex flex-col items-center justify-between gap-4 mb-6 md:flex-row',
  pageTitle:
    'text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400',
  controlsWrapper: 'flex flex-col w-full gap-4 sm:flex-row md:w-auto',

  // 3. 搜索框组件 (外层容器留着，输入框本身的样式全删了，交给 shadcn 的 <Input>！)
  searchContainer: 'relative group flex items-center',
  // 🌟 [重构点]：text-gray-400 -> text-muted-foreground (标准的次级文本颜色)
  searchIconWrapper:
    'absolute left-3 flex items-center pointer-events-none text-muted-foreground z-10',
  searchIcon: 'w-4 h-4',
  // searchInput 已经被无情删去，我们直接用 shadcn 的组件！

  // 4. 秒选控制按钮 (业务强相关色，保留红绿配色，因为开/关的红绿语意在白天黑夜都通用)
  autoPickBtnBase:
    'px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 min-w-[140px]',
  autoPickBtnActive:
    'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/50 hover:bg-green-500/30',
  autoPickBtnInactive:
    'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/50 hover:bg-red-500/30',

  indicatorWrapper: 'relative flex w-3 h-3',
  indicatorPing:
    'absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping',
  indicatorCoreBase: 'relative inline-flex w-3 h-3 rounded-full',

  // 5. 英雄列表网格
  championGrid:
    'grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar',

  // 6. 英雄单独卡片
  championCard:
    'relative transition-all duration-300 cursor-pointer group hover:scale-105 hover:z-10',

  // 🌟 [重构点]：bg-black/40 换成 bg-muted，无图时的骨架屏底色白天黑夜自动适应。边框统一用 border-border
  avatarWrapperBase:
    'aspect-square rounded-xl overflow-hidden border-2 border-transparent bg-muted group-hover:border-primary/80 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all',
  avatarWrapperSelected:
    '!border-primary !shadow-[0_0_20px_hsl(var(--primary)/0.5)] ring-2 ring-primary/30',
  avatarImg: 'object-cover w-full h-full transition-transform duration-500 group-hover:scale-110',

  // ⚠️ [破例点]：图片上的文字遮罩必须保留 black 和 white！
  // 因为底图（英雄原画）永远是暗色的，如果你这里用 text-foreground，在白天模式下字会变成黑色，融入底图就看不清了。
  nameOverlay:
    'absolute inset-0 flex items-end justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-xl',
  nameText: 'px-1 pb-2 text-xs font-bold text-white truncate drop-shadow-md',

  pickBadge:
    'absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg',

  // 7. 空数据状态
  emptyStateWrapper: 'flex flex-col items-center justify-center py-12 text-muted-foreground'
}
