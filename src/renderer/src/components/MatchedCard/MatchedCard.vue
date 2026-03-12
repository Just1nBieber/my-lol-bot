<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useLcuStateStore } from '@/store/lcuState'
import { getIconUrl } from '@/lib/getImg'
import { getRarityText } from '../../../../shared/utils/matched-translator'
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

type MatchParticipant = Record<string, unknown>

const getParticipantName = (participant: MatchParticipant): string => {
  const riotIdGameName =
    typeof participant.riotIdGameName === 'string' ? participant.riotIdGameName : ''
  const riotIdTagline =
    typeof participant.riotIdTagline === 'string' ? participant.riotIdTagline : ''
  if (riotIdGameName) return riotIdTagline ? `${riotIdGameName}#${riotIdTagline}` : riotIdGameName

  const summonerName = typeof participant.summonerName === 'string' ? participant.summonerName : ''
  const gameName = typeof participant.gameName === 'string' ? participant.gameName : ''
  return summonerName || gameName || 'Unknown'
}

const getParticipantChampionIcon = (participant: MatchParticipant): string => {
  const championId = typeof participant.championId === 'number' ? participant.championId : 0
  return championId ? getChampionIconPath(championId) : ''
}

const getParticipantsFromDetail = (gameId: number): MatchParticipant[] => {
  const detail = lcuState.matchDetailsDict[gameId]
  if (!detail || typeof detail !== 'object') return []
  const participants = (detail as { participants?: unknown }).participants
  return Array.isArray(participants) ? (participants as MatchParticipant[]) : []
}

const getMatchParticipants = (
  gameId: number
): { left: MatchParticipant[]; right: MatchParticipant[] } => {
  const participants = getParticipantsFromDetail(gameId)
  if (participants.length === 0) return { left: [], right: [] }

  const hasTeamId = participants.some((p) => typeof p.teamId === 'number')
  if (hasTeamId) {
    const left = participants.filter((p) => p.teamId === 100 || p.teamId === 1)
    const right = participants.filter((p) => p.teamId === 200 || p.teamId === 2)
    if (left.length || right.length) return { left, right }
  }

  return { left: participants.slice(0, 5), right: participants.slice(5, 10) }
}

const isAugmentMode = (item: SimpleMatchDTO): boolean => {
  return !!item.augments && item.augments.length > 0 && item.augments[0] !== -1
}

const getPrimaryRuneId = (item: SimpleMatchDTO): number => item.runes?.perks?.[0]?.id ?? 0
const getSubRuneStyleId = (item: SimpleMatchDTO): number => item.runes?.subStyle ?? 0

const isTrinketMode = (item: SimpleMatchDTO): boolean => {
  return item.gameMode === 'CLASSIC'
}

const isSticky = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const selectedHero = ref<number | 'all'>('all')
const selectedMode = ref<'all' | 'CLASSIC' | 'ARAM' | 'CHERRY' | 'PRACTICETOOL'>('all')
const selectedWin = ref<'all' | 'win' | 'lose'>('all')

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  isSticky.value = target.scrollTop > 10
}

const heroOptions = computed(() => {
  const heroes = new Set<number>()
  lcuState.simpleMatchedList.forEach((item) => heroes.add(item.championId))
  return Array.from(heroes).map((id) => ({
    id,
    name: lcuState.championList.find((c) => c.id === id)?.name || `Hero ${id}`,
    icon: championPortraitMap.value[id]
  }))
})

const filteredList = computed(() => {
  return lcuState.simpleMatchedList.filter((item) => {
    if (selectedHero.value !== 'all' && item.championId !== selectedHero.value) return false
    if (selectedMode.value !== 'all' && item.gameMode !== selectedMode.value) return false
    if (selectedWin.value === 'win' && !item.win) return false
    if (selectedWin.value === 'lose' && item.win) return false
    return true
  })
})

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredList.value.slice(start, end)
})

const fetchVisibleMatchDetails = (list: SimpleMatchDTO[]) => {
  list.forEach((item) => {
    void lcuState.fetchMatchDetail(item.gameId)
  })
}

watch(
  paginatedList,
  (list) => {
    fetchVisibleMatchDetails(list)
  },
  { immediate: true }
)

const totalPages = computed(() => Math.ceil(filteredList.value.length / itemsPerPage.value))

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
</script>

<template>
  <TooltipProvider :delay-duration="200">
    <div :class="simpleMatchStyle.wrapper" @scroll="handleScroll">
      <div
        :class="[
          simpleMatchStyle.stickyHeaderBase,
          isSticky ? simpleMatchStyle.stickyHeaderActive : simpleMatchStyle.stickyHeaderInactive
        ]"
      >
        <div :class="simpleMatchStyle.headerLayout">
          <div :class="simpleMatchStyle.filterGroup">
            <select v-model="selectedHero" :class="simpleMatchStyle.selectBase">
              <option value="all">全部英雄</option>
              <option v-for="h in heroOptions" :key="h.id" :value="h.id">{{ h.name }}</option>
            </select>

            <select v-model="selectedMode" :class="simpleMatchStyle.selectBase">
              <option value="all">全部模式</option>
              <option value="CLASSIC">经典模式</option>
              <option value="ARAM">极地大乱斗</option>
              <option value="CHERRY">斗魂竞技场</option>
            </select>

            <div :class="simpleMatchStyle.toggleGroup">
              <button
                :class="[
                  simpleMatchStyle.toggleBtnBase,
                  selectedWin === 'all'
                    ? simpleMatchStyle.toggleBtnActiveAll
                    : simpleMatchStyle.toggleBtnInactive
                ]"
                @click="selectedWin = 'all'"
              >
                全部
              </button>
              <button
                :class="[
                  simpleMatchStyle.toggleBtnBase,
                  selectedWin === 'win'
                    ? simpleMatchStyle.toggleBtnActiveWin
                    : simpleMatchStyle.toggleBtnInactiveWin
                ]"
                @click="selectedWin = 'win'"
              >
                胜利
              </button>
              <button
                :class="[
                  simpleMatchStyle.toggleBtnBase,
                  selectedWin === 'lose'
                    ? simpleMatchStyle.toggleBtnActiveLose
                    : simpleMatchStyle.toggleBtnInactiveLose
                ]"
                @click="selectedWin = 'lose'"
              >
                失败
              </button>
            </div>
          </div>

          <div :class="simpleMatchStyle.paginationGroup">
            <span :class="simpleMatchStyle.totalCountText">共 {{ filteredList.length }} 场</span>
            <select v-model="itemsPerPage" :class="simpleMatchStyle.pageSizeSelect">
              <option :value="10">10场</option>
              <option :value="20">20场</option>
              <option :value="50">50场</option>
            </select>
            <div :class="simpleMatchStyle.pageNavGroup">
              <button
                :disabled="currentPage === 1"
                :class="simpleMatchStyle.pageBtn"
                @click="prevPage"
              >
                &lt;
              </button>
              <span :class="simpleMatchStyle.pageIndicator"
                >{{ currentPage }} / {{ totalPages || 1 }}</span
              >
              <button
                :disabled="currentPage === totalPages"
                :class="simpleMatchStyle.pageBtn"
                @click="nextPage"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      <template v-for="(item, key) in paginatedList" :key="item.gameId">
        <div :class="[simpleMatchStyle.card, getCardThemeClass(item)]">
          <div :class="simpleMatchStyle.mainContent">
            <div :class="simpleMatchStyle.leftBlock">
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

            <div :class="simpleMatchStyle.middleBlock">
              <div :class="simpleMatchStyle.dataRow">
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
                        <TooltipContent v-if="lcuState.spellsDictionary[spellId]">
                          <div :class="simpleMatchStyle.tooltipSpellContainer">
                            <span :class="simpleMatchStyle.tooltipTitle">{{
                              lcuState.spellsDictionary[spellId].name
                            }}</span>
                            <span :class="simpleMatchStyle.tooltipText">
                              冷却时间：{{ lcuState.spellsDictionary[spellId].cooldown }}
                            </span>
                            <span :class="simpleMatchStyle.tooltipText">
                              解锁等级：{{ lcuState.spellsDictionary[spellId].summonerLevel }}
                            </span>
                            <span
                              :class="'text-xs matched-rich-html'"
                              v-html="lcuState.spellsDictionary[spellId].description"
                            ></span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </template>
                  </div>

                  <div v-if="isAugmentMode(item)" :class="simpleMatchStyle.kiwiRune">
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
                        <TooltipContent v-if="lcuState.arenaAugments[kiwiId]">
                          <div :class="simpleMatchStyle.tooltipRuneContainer">
                            <div :class="simpleMatchStyle.tooltipRuneHeader">
                              <img
                                :src="getIconUrl(lcuState.arenaAugments[kiwiId].iconPath)"
                                :class="simpleMatchStyle.tooltipRuneIcon"
                              />
                              <span :class="simpleMatchStyle.tooltipTitle">{{
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
                            <span :class="simpleMatchStyle.tooltipText">{{
                              lcuState.arenaAugments[kiwiId].desc
                            }}</span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </template>
                  </div>

                  <div v-else :class="simpleMatchStyle.spellCol">
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
                      <TooltipContent v-if="lcuState.perksDictionary[getPrimaryRuneId(item)]">
                        <div :class="simpleMatchStyle.tooltipRuneContainer">
                          <div :class="simpleMatchStyle.tooltipRuneHeader">
                            <img
                              :src="
                                getIconUrl(
                                  lcuState.perksDictionary[getPrimaryRuneId(item)].iconPath
                                )
                              "
                              :class="simpleMatchStyle.tooltipRuneIcon"
                            />
                            <span :class="simpleMatchStyle.tooltipTitle">
                              {{ lcuState.perksDictionary[getPrimaryRuneId(item)].name }}
                            </span>
                          </div>
                          <span
                            :class="'text-xs matched-rich-html'"
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
                      <TooltipContent v-if="lcuState.perkStylesDictionary[getSubRuneStyleId(item)]">
                        <div :class="simpleMatchStyle.tooltipSpellContainer">
                          <div :class="simpleMatchStyle.tooltipRuneHeader">
                            <img
                              :src="
                                getIconUrl(
                                  lcuState.perkStylesDictionary[getSubRuneStyleId(item)].iconPath
                                )
                              "
                              :class="simpleMatchStyle.tooltipRuneIcon"
                            />
                            <span :class="simpleMatchStyle.tooltipTitle">
                              {{ lcuState.perkStylesDictionary[getSubRuneStyleId(item)].name }}
                            </span>
                          </div>
                          <span :class="simpleMatchStyle.tooltipText">{{
                            lcuState.perkStylesDictionary[getSubRuneStyleId(item)].tooltip
                          }}</span>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <div :class="[simpleMatchStyle.KDA_Card, simpleMatchStyle.statCard]">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <span :class="simpleMatchStyle.damage">
                        <span :class="simpleMatchStyle.kadNumber">
                          {{ item.kills }} /
                          <span :class="simpleMatchStyle.deathNumber">{{ item.deaths }}</span> /
                          {{ item.assists }}
                        </span>
                        <span :class="simpleMatchStyle.subText">{{ item.kda }} (85%)</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span :class="simpleMatchStyle.tooltipText">击杀参与率</span>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div :class="[simpleMatchStyle.DAMAGE_Card, simpleMatchStyle.statCard]">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <span :class="simpleMatchStyle.damage">
                        <span :class="simpleMatchStyle.DamageNumber_Per">24%</span>
                        <span :class="simpleMatchStyle.DamageNumber">
                          {{ item.SimpleTotalDamageDealtToChampions }} 伤害
                        </span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span :class="simpleMatchStyle.tooltipText">对英雄造成的总伤害</span>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div :class="[simpleMatchStyle.CS_Card, simpleMatchStyle.statCard]">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <span :class="simpleMatchStyle.damage">
                        <span :class="simpleMatchStyle.CSNumber">{{ item.cs }} 补刀</span>
                        <span :class="simpleMatchStyle.CSNumber_Per"
                          >{{ item.csPerMinute }} / 分</span
                        >
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span :class="simpleMatchStyle.tooltipText">总补刀数与分均补刀</span>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div :class="simpleMatchStyle.equipRow">
                <div :class="simpleMatchStyle.epicBox">
                  <template
                    v-for="(epicItem, epicKey) in item.items"
                    :key="`${key}-epic-${epicKey}`"
                  >
                    <Tooltip v-if="epicKey !== 7 || isTrinketMode(item)">
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
                      <TooltipContent v-if="lcuState.itemsDictionary[epicItem]">
                        <div :class="simpleMatchStyle.epicCard">
                          <div :class="simpleMatchStyle.epicHead">
                            <div :class="simpleMatchStyle.epicHeadLeft">
                              <img
                                :src="getIconUrl(lcuState.itemsDictionary[epicItem].iconPath)"
                                :class="simpleMatchStyle.epicImageInner"
                              />
                            </div>
                            <div :class="simpleMatchStyle.epicHeadRight">
                              <span :class="simpleMatchStyle.epicName">
                                {{ lcuState.itemsDictionary[epicItem].name }}({{
                                  lcuState.itemsDictionary[epicItem].id
                                }})
                              </span>
                              <span :class="simpleMatchStyle.totalPrice">
                                {{ lcuState.itemsDictionary[epicItem].priceTotal }} (单价
                                {{ lcuState.itemsDictionary[epicItem].price }})
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
                                    :class="simpleMatchStyle.epicImageInner"
                                  />
                                </div>
                              </template>
                            </div>
                            <div :class="simpleMatchStyle.toWhichItem">
                              <template
                                v-for="(toItem, toKey) in lcuState.itemsDictionary[epicItem].to ||
                                []"
                                :key="`${key}-to-${toKey}`"
                              >
                                <div :class="simpleMatchStyle.toItem">
                                  <img
                                    v-if="lcuState.itemsDictionary[toItem]"
                                    :src="getIconUrl(lcuState.itemsDictionary[toItem].iconPath)"
                                    :class="simpleMatchStyle.epicImageInner"
                                  />
                                </div>
                              </template>
                            </div>
                          </div>
                          <div :class="simpleMatchStyle.epicBottom">
                            <div
                              :class="'matched-rich-html'"
                              v-html="lcuState.itemsDictionary[epicItem].description"
                            ></div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </template>
                </div>

                <div :class="simpleMatchStyle.summonerTag">
                  <span :class="simpleMatchStyle.badgeBlue">MVP</span>
                  <span :class="simpleMatchStyle.badgeOrange">SVP</span>
                  <span :class="simpleMatchStyle.badgePink">尽力局</span>
                </div>
              </div>
            </div>

            <div :class="simpleMatchStyle.rightBlock">
              <div :class="simpleMatchStyle.allSummonerCols">
                <div :class="simpleMatchStyle.allSummonerCol">
                  <div
                    v-for="(participant, pIndex) in getMatchParticipants(item.gameId).left"
                    :key="`${item.gameId}-${pIndex}-l`"
                    :class="simpleMatchStyle.allSummonerItem"
                  >
                    <img
                      v-if="getParticipantChampionIcon(participant)"
                      :src="getParticipantChampionIcon(participant)"
                      :class="simpleMatchStyle.tinyAvatar"
                    />
                    <div v-else :class="simpleMatchStyle.tinyAvatarPlaceholder"></div>
                    <span :class="simpleMatchStyle.tinyName">{{
                      getParticipantName(participant)
                    }}</span>
                  </div>
                </div>
                <div :class="simpleMatchStyle.allSummonerCol">
                  <div
                    v-for="(participant, pIndex) in getMatchParticipants(item.gameId).right"
                    :key="`${item.gameId}-${pIndex}-r`"
                    :class="simpleMatchStyle.allSummonerItem"
                  >
                    <img
                      v-if="getParticipantChampionIcon(participant)"
                      :src="getParticipantChampionIcon(participant)"
                      :class="simpleMatchStyle.tinyAvatar"
                    />
                    <div v-else :class="simpleMatchStyle.tinyAvatarPlaceholder"></div>
                    <span :class="simpleMatchStyle.tinyName">{{
                      getParticipantName(participant)
                    }}</span>
                  </div>
                </div>
              </div>
              <span :class="simpleMatchStyle.dropArrow">></span>
            </div>
          </div>

          <div :class="simpleMatchStyle.bottomText">
            {{ item.gameMode }} · {{ item.gameDuration }} · {{ item.gameCreation }} · {{ item.map }}
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
