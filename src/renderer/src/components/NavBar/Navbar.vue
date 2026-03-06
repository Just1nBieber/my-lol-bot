<script setup lang="ts">
// 记得引入刚刚抽离的样式对象
import { navBarStyles } from './style'
import { isDark, toggleDark } from '@/composables/useTheme'
import { Button } from '@/components/ui/button'

import { Sun, Moon } from 'lucide-vue-next'

const handleMinimize = (): void => {
  window.api.minimize()
}

const handleClose = (): void => {
  window.api.close()
}

defineEmits(['show'])
</script>

<template>
  <nav :class="navBarStyles.navContainer">
    <div :class="navBarStyles.titleWrapper">
      <span :class="navBarStyles.statusDot"></span>
      My LoL Bot
    </div>

    <div :class="navBarStyles.windowControls">
      <button @click="$emit('show')" :class="navBarStyles.heroButton">
        <img
          :class="navBarStyles.heroIcon"
          src="../../assets/images/nav-bar-icon/hero.png"
          alt=""
        />
      </button>
      <Button
        :class="navBarStyles.windowButton"
        variant="ghost"
        size="icon"
        @click="toggleDark()"
      >
        <Sun v-if="!isDark" class="h-5 w-5 text-yellow-400" />
        <Moon v-else class="h-5 w-5 text-slate-700" />
      </Button>
      <button :class="navBarStyles.windowButton" @click="handleMinimize">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <button :class="navBarStyles.windowButton" @click="handleClose">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
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
