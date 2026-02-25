<script setup lang="ts">
import { ref } from 'vue'
import ChampionGrid from './components/ChampionGrid.vue'
import Navbar from './components/Navbar.vue'

const showAutoPick = ref(false)

const summonerName = '召唤师名称'
const summonerTag = '#TAG'

const soloRank = '钻石 I'
const soloRecord = { win: 120, lose: 80 }

const flexRank = '铂金 II'
const flexRecord = { win: 60, lose: 40 }

const toggleShowAutoPick = () => {
  showAutoPick.value = !showAutoPick.value
}
</script>

<template>
  <div class="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden">
    <Navbar />

    <div
      class="flex-1 overflow-auto bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 relative"
    >
      <div class="relative z-10 max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">
        <div class="h-[20vh]">
          <div
            class="h-full bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl px-6 py-4 flex items-center"
          >
            <div class="grid grid-cols-3 gap-6 w-full">
              <div class="flex items-center gap-4">
                <div
                  class="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 border border-white/40 shadow-lg"
                ></div>
                <div class="flex flex-col">
                  <span class="text-lg font-semibold tracking-wide">{{ summonerName }}</span>
                  <span class="text-xs text-gray-300">{{ summonerTag }}</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div
                  class="bg-black/30 rounded-xl border border-white/10 px-4 py-3 flex flex-col justify-between"
                >
                  <div class="text-xs text-gray-300">单双排</div>
                  <div class="text-xl font-semibold mt-1">{{ soloRank }}</div>
                  <div class="mt-2 text-[11px] text-gray-400 text-right">
                    胜 {{ soloRecord.win }} · 负 {{ soloRecord.lose }}
                  </div>
                </div>
                <div
                  class="bg-black/30 rounded-xl border border-white/10 px-4 py-3 flex flex-col justify-between"
                >
                  <div class="text-xs text-gray-300">灵活组排</div>
                  <div class="text-xl font-semibold mt-1">{{ flexRank }}</div>
                  <div class="mt-2 text-[11px] text-gray-400 text-right">
                    胜 {{ flexRecord.win }} · 负 {{ flexRecord.lose }}
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-end">
                <button
                  @click="toggleShowAutoPick"
                  class="px-5 py-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 hover:border-blue-400 text-sm font-medium tracking-wide shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                  <span
                    class="w-2 h-2 rounded-full"
                    :class="showAutoPick ? 'bg-emerald-400' : 'bg-gray-400'"
                  ></span>
                  <span>{{ showAutoPick ? '关闭自动选英雄' : '打开自动选英雄' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 战绩列表 (占位) -->
        <div class="grid gap-4">
          <div
            class="h-32 bg-zinc-900/30 rounded-xl border border-white/5 flex items-center justify-center text-zinc-500"
          >
            这里是未来的战绩大厅
          </div>
        </div>
      </div>
    </div>

    <!-- 自动选人模态框 -->
    <div
      v-if="showAutoPick"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div
        class="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] overflow-hidden flex flex-col"
      >
        <div class="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
          <h3 class="text-lg font-bold text-white">选择自动锁定的英雄</h3>
          <button
            @click="showAutoPick = false"
            class="text-zinc-400 hover:text-white transition-colors"
          >
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
          <ChampionGrid />
        </div>
      </div>
    </div>
  </div>
</template>
