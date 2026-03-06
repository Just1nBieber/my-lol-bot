<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLcuStateStore } from '../../store/lcuState'
import { championSelectStyles } from './style'

// 🌟 引入 shadcn 的标准零件
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { getIconUrl } from '../../lib/getImg'

const lcuStateStore = useLcuStateStore()
const searchQuery = ref('')

const filteredChampions = computed(() => {
  const query = searchQuery.value.toLowerCase()
  const list = lcuStateStore.championList
  return list.filter(
    (c) => c.name.toLowerCase().includes(query) || c.alias.toLowerCase().includes(query)
  )
})



const toggleAutoPick = (): void => {
  lcuStateStore.setIsAutoPickEnabled(!lcuStateStore.isAutoPickEnabled)
}

const selectChampion = (id: number): void => {
  lcuStateStore.setTargetChampionId(id)
}
</script>

<template>
  <div :class="championSelectStyles.pageWrapper">
    <Card :class="championSelectStyles.glassPanel">
      <div :class="championSelectStyles.headerArea">
        <h2 :class="championSelectStyles.pageTitle">Champion Select</h2>

        <div :class="championSelectStyles.controlsWrapper">
          <div :class="championSelectStyles.searchContainer">
            <div :class="championSelectStyles.searchIconWrapper">
              <svg
                :class="championSelectStyles.searchIcon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <Input
              v-model="searchQuery"
              placeholder="Search champion..."
              class="pl-9 w-full sm:w-64 bg-background/10 border-border"
            />
          </div>

          <Button
            @click="toggleAutoPick"
            variant="outline"
            :class="[
              championSelectStyles.autoPickBtnBase,
              lcuStateStore.isAutoPickEnabled
                ? championSelectStyles.autoPickBtnActive
                : championSelectStyles.autoPickBtnInactive
            ]"
          >
            <span :class="championSelectStyles.indicatorWrapper">
              <span
                v-if="lcuStateStore.isAutoPickEnabled"
                :class="championSelectStyles.indicatorPing"
              ></span>
              <span
                :class="[
                  championSelectStyles.indicatorCoreBase,
                  lcuStateStore.isAutoPickEnabled ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></span>
            </span>
            {{ lcuStateStore.isAutoPickEnabled ? 'Auto Pick ON' : 'Auto Pick OFF' }}
          </Button>
        </div>
      </div>

      <div :class="championSelectStyles.championGrid">
        <div
          v-for="champ in filteredChampions"
          :key="champ.id"
          @click="selectChampion(champ.id)"
          :class="championSelectStyles.championCard"
        >
          <div
            :class="[
              championSelectStyles.avatarWrapperBase,
              {
                [championSelectStyles.avatarWrapperSelected]:
                  lcuStateStore.targetChampionObj.championId === champ.id
              }
            ]"
          >
            <img
              :src="getIconUrl(champ.squarePortraitPath)"
              :alt="champ.name"
              :class="championSelectStyles.avatarImg"
              loading="lazy"
            />
          </div>
          <div :class="championSelectStyles.nameOverlay">
            <span :class="championSelectStyles.nameText">{{ champ.name }}</span>
          </div>
          <div
            v-if="lcuStateStore.targetChampionObj.championId === champ.id"
            :class="championSelectStyles.pickBadge"
          >
            PICK
          </div>
        </div>
      </div>

      <div v-if="filteredChampions.length === 0" :class="championSelectStyles.emptyStateWrapper">
        <p>No champions found.</p>
      </div>
    </Card>
  </div>
</template>

<style scoped>
/* 滚动条稍微适配一下双端模式的颜色 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: hsl(var(--border)); /* 使用变量！ */
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground));
}
</style>
