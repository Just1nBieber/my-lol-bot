<script setup lang="ts">
import { ref } from 'vue'
import ChampionGrid from './components/ChampionGrid/ChampionGrid.vue'
import UserInfoCard from './components/user-info-card/UserInfoCard.vue'
import OuterCpg from './components/OuterCpg/OuterCpg.vue'
import Navbar from './components/NavBar/Navbar.vue'

const showAutoPick = ref(false)
</script>

<template>
  <div
    class="flex flex-col custom-scroll-container w-screen h-screen bg-zinc-950 text-white overflow-auto"
  >
    <Navbar @show="showAutoPick = true" />
    <!-- 用户信息卡片 -->
    <UserInfoCard />
    <!-- 自动选人模态框 -->
    <OuterCpg v-if="showAutoPick" @close="showAutoPick = false">
      <ChampionGrid />
    </OuterCpg>
  </div>
</template>

<style>
/* 1. 彻底封杀系统最外层的隐形滚动条 */
html,
body {
  overflow: hidden !important;
  margin: 0;
  padding: 0;
}

/* 2. 精准狙击我们自己的滚动容器 */
.custom-scroll-container {
  /* 强制兼容最新的火狐/Chrome标准规则 */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

/* 3. 精准狙击 Webkit 内核 (Electron) */
.custom-scroll-container::-webkit-scrollbar {
  width: 8px !important;
  height: 8px !important;
}

.custom-scroll-container::-webkit-scrollbar-track {
  background: transparent !important;
}

.custom-scroll-container::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border-radius: 9999px !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
}

.custom-scroll-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.4) !important;
}
</style>
