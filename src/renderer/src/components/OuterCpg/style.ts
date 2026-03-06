// OuterCpg.style.ts
export const modalStyles = {
  // 1. 遮罩层 (Backdrop)
  // [重构点]: bg-black/60 -> bg-background/80。白天是白色半透明，黑夜是黑色半透明，配合高斯模糊极其优雅。
  overlay:
    'fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm',

  // 2. 模态框主容器 (Container)
  // [重构点]: bg-zinc-900 彻底切除，换成 bg-background (或 bg-card)。
  // [重构点]: border-white/10 换成全局标准的 border-border。
  container:
    'popover-foreground border  rounded-xl shadow-2xl w-full max-w-5xl h-[100vh] overflow-hidden flex flex-col',

  // 3. 头部区域 (Header)
  // [重构点]: bg-zinc-900/50 换成 bg-muted/30，用来区分头部和主体的层次感。
  header: 'p-4 border flex justify-between items-center bg-muted/30',

  // 4. 标题文字 (Title)
  // [重构点]: text-white -> text-foreground (主文本色)
  title: 'text-lg font-bold text-foreground',

  // 5. 关闭按钮 (Close Button)
  // [重构点]: text-zinc-400 -> text-muted-foreground (次级文本色)
  // [重构点]: hover:text-white -> hover:text-foreground
  closeButton: 'text-muted-foreground hover:text-foreground transition-colors',

  body: 'flex-1 overflow-auto p-4'
}
