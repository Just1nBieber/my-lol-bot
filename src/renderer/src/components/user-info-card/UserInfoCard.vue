<script setup lang="ts">
import { computed } from 'vue'
import { transRanked, useLcuStateStore, type RankInfo } from '../../store/lcuState'
import { cardStyles } from './style'

const lcuStateStore = useLcuStateStore()
/**
 * 格式化段位显示文本。
 *
 * @param rank - 段位对象（例如：{ tier: 'DIAMOND', division: 'I', queueType: 'RANKED_SOLO_5x5' }）
 */
const formatRank = (rank: RankInfo | null, isTrans: boolean): string => {
  let fullString = ''
  if (isTrans) {
    if (!rank || rank.tier === 'NONE') return '未定级'
    const tierName = transRanked[rank.tier] ?? rank.tier
    if (!rank.division) return tierName
    fullString = `${tierName} ${rank.division}`
  } else {
    fullString = rank?.tier ?? 'UNRANKED'
  }
  return fullString
}

const rankIcons = import.meta.glob('../../assets/images/ranked-icons-large/*.png', {
  eager: true,
  import: 'default'
})

const getRankImageUrl = (tier: string | undefined | null): string => {
  let safeTier = 'unranked'
  if (tier && tier !== 'NONE' && tier !== 'UNRANKED') {
    safeTier = tier.toLowerCase()
  }
  const targetKey = `../../assets/images/ranked-icons-large/${safeTier}.png`
  const fallbackKey = `../../assets/images/ranked-icons-large/unranked.png`
  return (rankIcons[targetKey] as string) || (rankIcons[fallbackKey] as string)
}

const summonerName = computed(() => lcuStateStore.summonerInfo?.gameName ?? '召唤师名称')
const summonerTag = computed(() => '#' + (lcuStateStore.summonerInfo?.tagLine ?? 'NUMBER'))

const soloRank = computed(() =>
  lcuStateStore.summonerInfo?.soloRank
    ? formatRank(lcuStateStore.summonerInfo.soloRank, true)
    : '钻石 I'
)

const soloPic = computed(() => {
  if (!lcuStateStore.summonerInfo?.soloRank) {
    return 'NONE'
  }
  return formatRank(lcuStateStore.summonerInfo.soloRank, false)
})

const soloRecord = computed(() =>
  lcuStateStore.summonerInfo?.soloRank?.wins && lcuStateStore.summonerInfo.soloRank?.losses
    ? {
        win: lcuStateStore.summonerInfo.soloRank.wins,
        lose: lcuStateStore.summonerInfo.soloRank?.losses
      }
    : { win: 120, lose: 80 }
)

const flexRank = computed(() =>
  lcuStateStore.summonerInfo?.flexRank
    ? formatRank(lcuStateStore.summonerInfo.flexRank, true)
    : '铂金 II'
)

const flexPic = computed(() => {
  if (!lcuStateStore.summonerInfo?.flexRank) {
    return 'NONE'
  }
  return formatRank(lcuStateStore.summonerInfo.flexRank, false)
})

const flexRecord = computed(() =>
  lcuStateStore.summonerInfo?.flexRank?.wins && lcuStateStore.summonerInfo.flexRank?.losses
    ? {
        win: lcuStateStore.summonerInfo.flexRank.wins,
        lose: lcuStateStore.summonerInfo.flexRank?.losses
      }
    : { win: 0, lose: 0 }
)

const SoloLp = computed(() =>
  lcuStateStore.summonerInfo?.soloRank?.leaguePoints
    ? lcuStateStore.summonerInfo?.soloRank?.leaguePoints
    : '1'
)

const FlexLp = computed(() =>
  lcuStateStore.summonerInfo?.flexRank?.leaguePoints
    ? lcuStateStore.summonerInfo?.flexRank?.leaguePoints
    : '0'
)
</script>

<template>
  <div :class="cardStyles.panelWrapper">
    <div :class="cardStyles.mainLayout">
      <div :class="cardStyles.infoSectionWrapper">
        <div v-if="lcuStateStore.summonerInfo" :class="cardStyles.profileCard">
          <div :class="cardStyles.profileHeader">
            <img
              :class="cardStyles.summonerFlexImgBox"
              :src="`lcu-img://lol-game-data/assets/v1/profile-icons/${lcuStateStore.summonerInfo.profileIconId}.jpg`"
            />
            <div :class="cardStyles.summonerFlexContentBox">
              <div :class="cardStyles.summonerNameText">{{ summonerName }}{{ summonerTag }}</div>
              <div :class="cardStyles.syncStatusText">召唤师信息已同步</div>
            </div>
          </div>

          <div :class="cardStyles.rankGrid">
            <div :class="cardStyles.singleRankBox">
              <img :class="cardStyles.rankIcon" :src="getRankImageUrl(soloPic)" alt="" />
              <div :class="cardStyles.rankInfoWrapper">
                <div :class="cardStyles.rankTitle">单双排</div>
                <div :class="cardStyles.rankStats">{{ soloRecord.win }}胜 | {{ SoloLp }}LP</div>
                <div :class="cardStyles.rankName">
                  {{ soloRank }}
                </div>
              </div>
            </div>
            <div :class="cardStyles.singleRankBox">
              <img :class="cardStyles.rankIcon" :src="getRankImageUrl(flexPic)" alt="" />
              <div :class="cardStyles.rankInfoWrapper">
                <div :class="cardStyles.rankTitle">灵活组排</div>
                <div :class="cardStyles.rankStats">{{ flexRecord.win }}胜 | {{ FlexLp }}LP</div>
                <div :class="cardStyles.rankName">
                  {{ flexRank }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else :class="cardStyles.loadingStateCard">等待召唤师信息…</div>
      </div>
    </div>
  </div>
</template>
