<script setup lang="ts">
defineEmits(['close'])
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div
      class="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] overflow-hidden flex flex-col"
    >
      <div class="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
        <h3 class="text-lg font-bold text-white">选择自动锁定的英雄</h3>
        <button @click="$emit('close')" class="text-zinc-400 hover:text-white transition-colors">
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
      <div class="flex-1 overflow-auto p-4">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
