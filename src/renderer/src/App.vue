<script setup lang="ts">
import { ref } from 'vue'
import ChampionGrid from './components/ChampionGrid/ChampionGrid.vue'
import UserInfoCard from './components/user-info-card/UserInfoCard.vue'
import OuterCpg from './components/OuterCpg/OuterCpg.vue'
import Navbar from './components/NavBar/Navbar.vue'
import MatchedCard from './components/MatchedCard/MatchedCard.vue'
const showAutoPick = ref(false)
</script>

<template>
  <div
    class="flex flex-col custom-scroll-container w-screen h-screen bg-background/60 text-foreground overflow-auto"
  >
    <Navbar @show="showAutoPick = true" />
    <!-- 用户信息卡片 -->
    <UserInfoCard />
    <MatchedCard/>
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
  /* 🌟 [重构点]：使用 border 变量，白天是浅灰，黑夜是深灰 */
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--border)) transparent;
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
  /* 🌟 [重构点]：同样使用 border 变量作为基础色 */
  background-color: hsl(var(--border)) !important;
  border-radius: 9999px !important;
  /* 去掉黑色边框，保持极致扁平化 */
  border: 1px solid transparent !important;
}

.custom-scroll-container::-webkit-scrollbar-thumb:hover {
  /* 🌟 [重构点]：鼠标悬浮时，使用 muted-foreground 加深颜色，交互反馈更明显 */
  background-color: hsl(var(--muted-foreground)) !important;
}
</style>
