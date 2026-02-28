<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLcuStateStore } from '../../store/lcuState'
// 记得引入刚刚抽离的样式对象
import { championSelectStyles } from './style'

const lcuStateStore = useLcuStateStore()
const searchQuery = ref('')

const filteredChampions = computed(() => {
  const query = searchQuery.value.toLowerCase()
  const list = lcuStateStore.championList
  return list.filter(
    (c) => c.name.toLowerCase().includes(query) || c.alias.toLowerCase().includes(query)
  )
})

const getIconUrl = (path: string): string => {
  if (path.startsWith('/')) {
    return `lcu-img:/${path}`
  }
  return `lcu-img://${path}`
}

const toggleAutoPick = (): void => {
  lcuStateStore.setIsAutoPickEnabled(!lcuStateStore.isAutoPickEnabled)
}

const selectChampion = (id: number): void => {
  lcuStateStore.setTargetChampionId(id)
  console.log('哈哈')
}
</script>

<template>
  <div :class="championSelectStyles.pageWrapper">
    <div :class="championSelectStyles.glassPanel">
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
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search champion..."
              :class="championSelectStyles.searchInput"
            />
          </div>

          <button
            @click="toggleAutoPick"
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
          </button>
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
              loading="eager"
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
    </div>
  </div>
</template>

<style scoped>
/* Custom Scrollbar for the grid */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
