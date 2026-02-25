<script setup lang="ts">
const handleMinimize = (): void => {
  window.api.minimize()
}

const handleClose = (): void => {
  window.api.close()
}
</script>

<template>
  <nav class="h-8 bg-zinc-900 flex items-center justify-between px-2 select-none drag">
    <!-- 左侧标题/Logo -->
    <div class="text-xs text-gray-400 font-medium px-2 flex items-center gap-2">
      <span class="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500/50"></span>
      My LoL Bot
    </div>

    <!-- 右侧控制按钮 -->
    <div class="flex h-full no-drag">
      <button 
        class="w-10 h-full flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        @click="handleMinimize"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      
      <button 
        class="w-10 h-full flex items-center justify-center hover:bg-red-500 text-gray-400 hover:text-white transition-colors"
        @click="handleClose"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </nav>
</template>

<style scoped>
/* 允许拖拽 */
.drag {
  -webkit-app-region: drag;
}

/* 禁止拖拽（用于按钮等交互元素） */
.no-drag {
  -webkit-app-region: no-drag;
}
</style>
