<script setup lang="ts">
import { computed } from 'vue'
import { useLcuStateStore } from '@/store/lcuState'
import { getIconUrl } from '@/lib/getImg'
// 💡 净化引入：只保留 UI 所需的稀有度文本翻译，其他的已在后端洗好
import { getRarityText } from '../../../../shared/utils/matched-translator'
// 引入前端专属的 UI 样式
import { getRarityDotClass } from '@/lib/matched-ui-theme'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { SimpleMatchDTO } from '@main/shards/Simple-matched-shard/type.ts'
import { simpleMatchStyle } from './style.js'

const lcuState = useLcuStateStore()

const championPortraitMap = computed<Record<number, string>>(() => {
  return lcuState.championList.reduce<Record<number, string>>((acc, champion) => {
    acc[champion.id] = champion.squarePortraitPath
    return acc
  }, {})
})

// 💡 样式判断：直接使用后端发来的原生 win 布尔值，极其稳健！
const getCardThemeClass = (item: SimpleMatchDTO): string =>
  item.win
    ? 'bg-emerald-100 border-emerald-300 dark:bg-blue-950 dark:border-blue-700'
    : 'bg-rose-100 border-rose-300 dark:bg-red-950 dark:border-red-800'

const getHeroBorderClass = (item: SimpleMatchDTO): string =>
  item.win
    ? 'border border-emerald-400 dark:border-blue-500'
    : 'border border-red-400 dark:border-red-500'

const getWinLoseTextClass = (item: SimpleMatchDTO): string =>
  item.win ? 'text-emerald-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'

const getChampionIconPath = (championId: number): string => {
  const iconPath = championPortraitMap.value[championId]
  return iconPath ? getIconUrl(iconPath) : ''
}

const isClassicModeRune = (item: SimpleMatchDTO): boolean =>
  !item.augments?.length || item.augments[0] === -1

const getPrimaryRuneId = (item: SimpleMatchDTO): number => item.runes?.perks?.[0]?.id ?? 0
const getSubRuneStyleId = (item: SimpleMatchDTO): number => item.runes?.subStyle ?? 0
</script>

<template>
  <TooltipProvider :delay-duration="200">
    <div :class="simpleMatchStyle.wrapper">
      <template v-for="(item, key) in lcuState.simpleMatchedList" :key="item.gameId">
        <div :class="[simpleMatchStyle.card, getCardThemeClass(item)]">
          <div class="w-full h-full flex">
            <div :class="simpleMatchStyle.leftCard">
              <div :class="simpleMatchStyle.singleHead">
                <div :class="simpleMatchStyle.leftHead">
                  <div :class="[simpleMatchStyle.heroIconWrap, getHeroBorderClass(item)]">
                    <img
                      :src="getChampionIconPath(item.championId)"
                      :class="simpleMatchStyle.heroIcon"
                    />
                  </div>
                  <span :class="[simpleMatchStyle.winOrLose, getWinLoseTextClass(item)]">
                    {{ item.win ? '胜利' : '失败' }}
                  </span>
                </div>
                <div :class="simpleMatchStyle.rightHead">
                  <div :class="simpleMatchStyle.spellAndRune">
                    <div :class="simpleMatchStyle.spellCol">
                      <template
                        v-for="(spellId, spellKey) in item.spells"
                        :key="`${key}-spell-${spellKey}`"
                      >
                        <Tooltip>
                          <TooltipTrigger as-child>
                            <img
                              v-if="lcuState.spellsDictionary[spellId]"
                              :src="getIconUrl(lcuState.spellsDictionary[spellId].iconPath)"
                              :class="simpleMatchStyle.spellIcon"
                            />
                            <div v-else :class="simpleMatchStyle.placeHolder"></div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div
                              v-if="lcuState.spellsDictionary[spellId]"
                              class="flex flex-col gap-1 max-w-[260px]"
                            >
                              <span class="font-semibold">{{
                                lcuState.spellsDictionary[spellId].name
                              }}</span>
                              <span class="text-xs"
                                >冷却时间：{{ lcuState.spellsDictionary[spellId].cooldown }}</span
                              >
                              <span class="text-xs"
                                >所需等级：{{
                                  lcuState.spellsDictionary[spellId].summonerLevel
                                }}</span
                              >
                              <span
                                class="text-xs matched-rich-html"
                                v-html="lcuState.spellsDictionary[spellId].description"
                              ></span>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </template>
                    </div>
                    <div v-if="isClassicModeRune(item)" :class="simpleMatchStyle.classicRune">
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <img
                            v-if="lcuState.perksDictionary[getPrimaryRuneId(item)]"
                            :src="
                              getIconUrl(lcuState.perksDictionary[getPrimaryRuneId(item)].iconPath)
                            "
                            :class="simpleMatchStyle.runeIcon"
                          />
                          <div v-else :class="simpleMatchStyle.placeHolder"></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div
                            v-if="lcuState.perksDictionary[getPrimaryRuneId(item)]"
                            class="flex flex-col gap-2 max-w-[280px]"
                          >
                            <div class="flex items-center gap-2">
                              <img
                                :src="
                                  getIconUrl(
                                    lcuState.perksDictionary[getPrimaryRuneId(item)].iconPath
                                  )
                                "
                                class="w-7 h-7 rounded"
                              />
                              <span class="font-semibold">
                                {{ lcuState.perksDictionary[getPrimaryRuneId(item)].name }}
                              </span>
                            </div>
                            <span
                              class="text-xs matched-rich-html"
                              v-html="lcuState.perksDictionary[getPrimaryRuneId(item)].longDesc"
                            ></span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <img
                            v-if="lcuState.perkStylesDictionary[getSubRuneStyleId(item)]"
                            :src="
                              getIconUrl(
                                lcuState.perkStylesDictionary[getSubRuneStyleId(item)].iconPath
                              )
                            "
                            :class="simpleMatchStyle.runeIcon"
                          />
                          <div v-else :class="simpleMatchStyle.placeHolder"></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div
                            v-if="lcuState.perkStylesDictionary[getSubRuneStyleId(item)]"
                            class="flex flex-col gap-2 max-w-[260px]"
                          >
                            <div class="flex items-center gap-2">
                              <img
                                :src="
                                  getIconUrl(
                                    lcuState.perkStylesDictionary[getSubRuneStyleId(item)].iconPath
                                  )
                                "
                                class="w-7 h-7 rounded"
                              />
                              <span class="font-semibold">
                                {{ lcuState.perkStylesDictionary[getSubRuneStyleId(item)].name }}
                              </span>
                            </div>
                            <span class="text-xs">{{
                              lcuState.perkStylesDictionary[getSubRuneStyleId(item)].tooltip
                            }}</span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div v-else :class="simpleMatchStyle.kiwiRune">
                      <template
                        v-for="(kiwiId, kiwiKey) in item.augments"
                        :key="`${key}-kiwi-${kiwiKey}`"
                      >
                        <Tooltip>
                          <TooltipTrigger as-child>
                            <div>
                              <div
                                v-if="!lcuState.arenaAugments[kiwiId]"
                                :class="simpleMatchStyle.kiwiPlaceholder"
                              ></div>
                              <img
                                v-else
                                :src="getIconUrl(lcuState.arenaAugments[kiwiId].iconPath)"
                                :class="simpleMatchStyle.kiwiIcon"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div
                              v-if="lcuState.arenaAugments[kiwiId]"
                              class="flex flex-col gap-2 max-w-[280px]"
                            >
                              <div class="flex items-center gap-2">
                                <img
                                  :src="getIconUrl(lcuState.arenaAugments[kiwiId].iconPath)"
                                  class="w-7 h-7 rounded"
                                />
                                <span class="font-semibold">{{
                                  lcuState.arenaAugments[kiwiId].name
                                }}</span>
                              </div>
                              <span :class="simpleMatchStyle.rarityBadge">
                                <span
                                  :class="[
                                    simpleMatchStyle.rarityDot,
                                    getRarityDotClass(lcuState.arenaAugments[kiwiId].rarity)
                                  ]"
                                ></span>
                                {{ getRarityText(lcuState.arenaAugments[kiwiId].rarity) }}
                              </span>
                              <span class="text-xs">{{ lcuState.arenaAugments[kiwiId].desc }}</span>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </template>
                    </div>
                  </div>
                  <div :class="simpleMatchStyle.KDA_Card">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <span :class="simpleMatchStyle.kad">
                          <span :class="simpleMatchStyle.kadNumber"
                            >{{ item.kills }}/{{ item.deaths }}/{{ item.assists }}</span
                          >
                          <span :class="simpleMatchStyle.subText">{{ item.kda }}</span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span class="text-xs">预留：后续补充全队对位与时序图表</span>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div :class="simpleMatchStyle.DAMAGE_Card">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <span :class="simpleMatchStyle.damage">
                          <span :class="simpleMatchStyle.DamageNumber_Per">22%</span>
                          <span :class="simpleMatchStyle.DamageNumber">
                            {{ item.SimpleTotalDamageDealtToChampions }}
                          </span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span class="text-xs">预留：后续补充全队伤害占比计算</span>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div :class="simpleMatchStyle.CS_Card">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <span :class="simpleMatchStyle.damage">
                          <span :class="simpleMatchStyle.CSNumber">{{ item.cs }}</span>
                          <span :class="simpleMatchStyle.CSNumber_Per"
                            >{{ item.csPerMinute }}/分钟</span
                          >
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span class="text-xs">预留：后续补充分时补刀趋势</span>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <div :class="simpleMatchStyle.singleBottom">
                {{ item.gameMode }} ·
                {{ item.gameDuration }}
                {{ item.gameCreation }}
              </div>
            </div>
            <div :class="simpleMatchStyle.rightCard">
              <div :class="simpleMatchStyle.epicBox">
                <template v-for="(epicItem, epicKey) in item.items" :key="`${key}-epic-${epicKey}`">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <div
                        v-if="!lcuState.itemsDictionary[epicItem]"
                        :class="simpleMatchStyle.placeHolder"
                      ></div>
                      <img
                        v-else
                        :src="getIconUrl(lcuState.itemsDictionary[epicItem].iconPath)"
                        :class="simpleMatchStyle.epicIcon"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div
                        v-if="lcuState.itemsDictionary[epicItem]"
                        :class="simpleMatchStyle.epicCard"
                      >
                        <div :class="simpleMatchStyle.epicHead">
                          <div :class="simpleMatchStyle.epicHeadLeft">
                            <img
                              :src="getIconUrl(lcuState.itemsDictionary[epicItem].iconPath)"
                              class="w-full h-full object-cover"
                            />
                          </div>
                          <div :class="simpleMatchStyle.epicHeadRight">
                            <span :class="simpleMatchStyle.epicName">
                              {{ lcuState.itemsDictionary[epicItem].name }}({{
                                lcuState.itemsDictionary[epicItem].id
                              }})
                            </span>
                            <span :class="simpleMatchStyle.totalPrice">
                              {{ lcuState.itemsDictionary[epicItem].priceTotal }}(合成{{
                                lcuState.itemsDictionary[epicItem].price
                              }})
                            </span>
                          </div>
                        </div>
                        <div :class="simpleMatchStyle.epicHeadBottom">
                          <div :class="simpleMatchStyle.fromWhichItem">
                            <template
                              v-for="(fromItem, fromKey) in lcuState.itemsDictionary[epicItem]
                                .from || []"
                              :key="`${key}-from-${fromKey}`"
                            >
                              <div :class="simpleMatchStyle.fromItem">
                                <img
                                  v-if="lcuState.itemsDictionary[fromItem]"
                                  :src="getIconUrl(lcuState.itemsDictionary[fromItem].iconPath)"
                                  class="w-full h-full object-cover"
                                />
                              </div>
                            </template>
                          </div>
                          <div :class="simpleMatchStyle.toWhichItem">
                            <template
                              v-for="(toItem, toKey) in lcuState.itemsDictionary[epicItem].to || []"
                              :key="`${key}-to-${toKey}`"
                            >
                              <div :class="simpleMatchStyle.toItem">
                                <img
                                  v-if="lcuState.itemsDictionary[toItem]"
                                  :src="getIconUrl(lcuState.itemsDictionary[toItem].iconPath)"
                                  class="w-full h-full object-cover"
                                />
                              </div>
                            </template>
                          </div>
                        </div>
                        <div :class="simpleMatchStyle.epicBottom">
                          <div
                            class="matched-rich-html"
                            v-html="lcuState.itemsDictionary[epicItem].description"
                          ></div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </template>
              </div>
              <div :class="simpleMatchStyle.summonerTag">summonerTag 占位</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </TooltipProvider>
</template>

<style scoped>
.matched-rich-html b,
.matched-rich-html strong {
  font-weight: 600;
}

.matched-rich-html br {
  display: block;
  content: '';
  margin-top: 4px;
}
</style>