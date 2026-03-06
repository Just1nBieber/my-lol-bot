import type { BaiYueKuiShard } from '@shared/yuekui-shard/interface'
import type { IReactionDisposer } from 'mobx'
import type {
  SimpleMatchDTO,
  SimpleMatchedInterface
} from '@main/shards/Simple-matched-shard/type.ts'

import { reaction } from 'mobx'
import { createHttp1Request } from 'league-connect'
import { Shard } from '@shared/yuekui-shard/decorators'
import { pollUntil } from '@main/utils/scheduler'
import { getKdaRatio } from '@main/utils/kda'
import { getCsPerMinute } from '@main/utils/cs-per-minute'
import { lcuState } from '../Lcu-state/state'
import {
  translateGameResult,
  translateMap,
  translateGameMode,
  translateGameCreation,
  translateGameDuration
} from '@main/utils/matched-translator'

const SHARD_ID = 'simple-matched'

@Shard(SHARD_ID)
export class SimpleMatched implements BaiYueKuiShard {
  id: string = SHARD_ID
  static id = SHARD_ID
  private _cleanupFns: IReactionDisposer[] = []
  private _isDisposed = false

  onInit(): void {
    const disposeFn = reaction(
      () => [lcuState.credential, lcuState.queryMatchedIndex.begIndex] as const,
      ([credential]) => {
        if (!credential) return
        void this.fetchSimpleMatched()
      }
    )

    this._cleanupFns.push(disposeFn)
  }

  onDispose(): void {
    this._cleanupFns.forEach((d) => d())
    this._cleanupFns = []
  }

  async fetchSimpleMatched(): Promise<void> {
    if (this._isDisposed) return

    await pollUntil(
      async () => {
        const credential = lcuState.credential
        const puuid = lcuState.summonerInfo?.puuid

        // 修改点：返回 false 以便让 pollUntil 继续轮询等待 puuid 准备好
        if (!credential || !puuid) return false

        const { begIndex, endIndex } = lcuState.queryMatchedIndex

        try {
          const S_M_RES = await createHttp1Request(
            {
              method: 'GET',
              url: `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=${begIndex}&endIndex=${endIndex}`
            },
            credential
          )
          const S_M_RES_DATA = S_M_RES.json() as SimpleMatchedInterface

          // 🎯 注意这里：我们直接用 .map()，产出一个纯粹的数组 SimpleMatchDTO[]
          const filter_S_M_DATA: SimpleMatchDTO[] = S_M_RES_DATA.games.games.map((currentItem) => {
            // 1. 精准定位当前唯一的玩家数据
            const myPlayerInfo = currentItem.participantIdentities[0].player
            const myParticipantObj = currentItem.participants[0]
            const myStats = myParticipantObj.stats

            // 2. 提前计算派生数据
            const totalCS = myStats.totalMinionsKilled + myStats.neutralMinionsKilled

            // 3. 🔪 暴力拍平，直接返回单局战绩 DTO
            return {
              // === 基础信息 ===
              gameId: currentItem.gameId,
              gameType: currentItem.gameType,
              gameCreation: translateGameCreation(currentItem.gameCreation),
              gameDuration: translateGameDuration(currentItem.gameDuration),
              gameMode: String(
                translateGameMode(
                  currentItem.gameMode,
                  currentItem.queueId,
                  currentItem.gameType,
                  currentItem.teams
                )
              ),
              map: String(translateMap(currentItem.mapId, currentItem.gameModeMutators)),
              queueId: currentItem.queueId,
              endOfGameResult: currentItem.endOfGameResult,
              // === 玩家身份 ===
              puuid: myPlayerInfo.puuid,

              // === 胜负 or 重开 or 投降 ===
              finalGameResult: String(
                translateGameResult(
                  currentItem.endOfGameResult,
                  myStats.win,
                  myStats.gameEndedInEarlySurrender,
                  myStats.gameEndedInSurrender
                )
              ),

              // === 英雄与召唤师技能 ===
              championId: myParticipantObj.championId,
              spells: [myParticipantObj.spell1Id, myParticipantObj.spell2Id],

              // === 符文与海克斯 (Perks & Augments) ===
              perkKeystone: myStats.perk0,
              perkPrimaryStyle: myStats.perkPrimaryStyle,
              perkSubStyle: myStats.perkSubStyle,
              augments: [
                myStats.playerAugment1,
                myStats.playerAugment2,
                myStats.playerAugment3,
                myStats.playerAugment4,
                myStats.playerAugment5,
                myStats.playerAugment6
              ].filter((id) => id !== 0),

              // === 核心战斗数据 ===
              kills: myStats.kills,
              deaths: myStats.deaths,
              assists: myStats.assists,
              goldEarned: myStats.goldEarned,
              cs: totalCS,
              kda: getKdaRatio(myStats.kills, myStats.deaths, myStats.assists),
              csPerMinute: getCsPerMinute(totalCS, currentItem.gameDuration),

              // === 装备与专属道具 ===
              items: [
                myStats.item0,
                myStats.item1,
                myStats.item2,
                myStats.item3,
                myStats.item4,
                myStats.item5,
                myStats.item6,
                myStats.roleBoundItem || 0
              ]
            }
          })

          // ⚡️ 把这个纯净的数组同步给前端 Vue
          lcuState.setSimpleMatchedList(filter_S_M_DATA)

          return true
        } catch (error) {
          console.error(`[${SHARD_ID}] fetchSimpleMatched error`, error)
          return false
        }
      },
      {
        interval: 2000,
        timeout: 60 * 2000
      }
    )

    this._isDisposed = false
  }
}
