// navBarStyles.ts (或放入你的 style.ts 中)
export const navBarStyles = {
  // 0. 英雄icon
  heroIcon:
    'w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] shrink-0 transition-all duration-300',

  // 1. 顶层标题栏容器
  navContainer: 'flex items-center justify-between h-8 px-2 select-none background drag',

  // 2. 左侧标题区域
  titleWrapper: 'flex items-center gap-2 px-2 text-xs font-medium text-foreground',
  statusDot: 'w-3 h-3 border rounded-full bg-blue-500/20 border-blue-500/50',

  // 3. 右侧窗口控制区域
  windowControls: 'flex h-full no-drag',

  // 4. 功能性按钮组件
  heroButton: 'flex items-center justify-center w-10 h-full transition-colors hover:bg-yellow-200',
  windowButton:
    'flex items-center justify-center w-10 h-full text-foreground transition-colors hover:bg-white/10 hover:text-white',
}
