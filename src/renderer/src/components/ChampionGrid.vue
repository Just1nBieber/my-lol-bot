<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLcuStateStore } from '../store/lcuState'

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
  // If path is "/lol-game-data/assets/v1/champion-icons/1.png"
  // Render as: "lcu-img://lol-game-data/assets/v1/champion-icons/1.png"
  if (path.startsWith('/')) {
    return `lcu-img:/${path}`
  }
  return `lcu-img://${path}`
}

const toggleAutoPick = () => {
  lcuStateStore.setIsAutoPickEnabled(!lcuStateStore.isAutoPickEnabled)
}

const selectChampion = (id: number) => {
  lcuStateStore.setTargetChampionId(id)

  console.log('哈哈')
}
</script>

<template>
  <div class="p-6 w-full max-w-5xl mx-auto">
    <!-- Glass Container -->
    <div
      class="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-2xl text-white"
    >
      <!-- Header / Controls -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2
          class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
        >
          Champion Select
        </h2>

        <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <!-- Filter Input -->
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                class="h-5 w-5 text-gray-400"
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
              class="w-full sm:w-64 bg-black/30 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-white placeholder-gray-400"
            />
          </div>

          <!-- Toggle Auto Pick -->
          <button
            @click="toggleAutoPick"
            class="px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 min-w-[140px]"
            :class="
              lcuStateStore.isAutoPickEnabled
                ? 'bg-green-500/20 text-green-300 border border-green-500/50 hover:bg-green-500/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                : 'bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]'
            "
          >
            <span class="relative flex h-3 w-3">
              <span
                v-if="lcuStateStore.isAutoPickEnabled"
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
              ></span>
              <span
                class="relative inline-flex rounded-full h-3 w-3"
                :class="lcuStateStore.isAutoPickEnabled ? 'bg-green-500' : 'bg-red-500'"
              ></span>
            </span>
            {{ lcuStateStore.isAutoPickEnabled ? 'Auto Pick ON' : 'Auto Pick OFF' }}
          </button>
        </div>
      </div>

      <!-- Grid -->
      <div
        class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar"
      >
        <div
          v-for="champ in filteredChampions"
          :key="champ.id"
          @click="selectChampion(champ.id)"
          class="group relative cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
        >
          <!-- Avatar -->
          <div
            class="aspect-square rounded-xl overflow-hidden border-2 border-white/5 bg-black/40 group-hover:border-blue-400/80 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
            :class="{
              '!border-yellow-400 !shadow-[0_0_20px_rgba(250,204,21,0.5)] ring-2 ring-yellow-400/30':
                lcuStateStore.targetChampionObj.championId === champ.id
            }"
          >
            <img
              :src="getIconUrl(champ.squarePortraitPath)"
              :alt="champ.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="eager"
            />
          </div>

          <!-- Name Tooltip/Overlay -->
          <div
            class="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-xl"
          >
            <span class="text-xs font-bold pb-2 text-white drop-shadow-md truncate px-1">{{
              champ.name
            }}</span>
          </div>

          <!-- Selected Indicator -->
          <div
            v-if="lcuStateStore.targetChampionObj.championId === champ.id"
            class="absolute top-1 right-1 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg"
          >
            PICK
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredChampions.length === 0"
        class="flex flex-col items-center justify-center py-12 text-gray-400"
      >
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
