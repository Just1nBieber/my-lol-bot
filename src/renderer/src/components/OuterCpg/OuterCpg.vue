<script setup lang="ts">
// 引入刚刚抽离的字典
import { modalStyles } from './style'

defineEmits(['close'])
</script>

<template>
  <div :class="modalStyles.overlay">
    <div :class="modalStyles.container">
      <div :class="modalStyles.header">
        <h3 :class="modalStyles.title">选择自动锁定的英雄</h3>
        <button @click="$emit('close')" :class="modalStyles.closeButton">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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
      <div :class="modalStyles.body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
