import type { BaiYueKuiShard } from '@shared/yuekui-shard/interface'
import type { IReactionDisposer } from 'mobx'
import type { RankInfo, SummonerInfo } from '../Lcu-state/type'

import { reaction } from 'mobx'
import { createHttp1Request } from 'league-connect'
import { Shard } from '@shared/yuekui-shard/decorators'
import { lcuState } from '../Lcu-state/state'
import { pollUntil } from '../../utils/scheduler'

interface CurrentSummonerDto {
  gameName: string
  privacy: boolean
  summonerId: number
  summonerLevel: number
  tagLine: string
  profileIconId: number
  puuid: string
}

interface RankedQueueDto {
  queueMap: QueueType
}

interface QueueType {
  RANKED_FLEX_SR: RankInfo
  RANKED_SOLO_5x5: RankInfo
}

/**
 * 将 LCU 的排位队列对象清洗为 RankInfo。
 *
 * @param q - LCU 队列对象（例如：{ RANKED_FLEX_SR: 'RANKED_SOLO_5x5', tier: 'DIAMOND', division: 'I', leaguePoints: 75 }）
 */
const normalizeRank = (q: RankInfo | undefined): RankInfo | null => {
  if (!q) {
    console.log('对象为空')
    return null
  }

  const tier = q.tier ?? 'NONE'
  const division = q.division

  if (tier === 'NONE') {
    return {
      queueType: q.queueType,
      tier: 'NONE'
    }
  }

  if (!division) {
    return {
      queueType: q.queueType,
      tier
    }
  }

  return {
    queueType: q.queueType,
    tier,
    division,
    leaguePoints: q.leaguePoints,
    wins: q.wins,
    losses: q.losses
  }
}

const SHARD_ID = 'user-info'

@Shard(SHARD_ID)
export class UserInfoShard implements BaiYueKuiShard {
  id: string = SHARD_ID
  static id = SHARD_ID
  private _cleanupFns: IReactionDisposer[] = []
  private _isPolling = false
  private _isDisposed = false

  async onInit(): Promise<void> {
    const disposeFn = reaction(
      () => lcuState.credential,
      (creds) => {
        if (!creds) return
        if (lcuState.summonerInfo) return
        if (this._isPolling) return
        this._isPolling = true
        void this.fetchAndStore()
      }
    )
    this._cleanupFns.push(disposeFn)
  }

  onDispose(): void {
    this._isDisposed = true
    this._cleanupFns.forEach((d) => d())
    this._cleanupFns = []
    this._isPolling = false
  }

  /**
   * 轮询拉取召唤师基础信息与段位信息，并写入全局状态。
   */
  private async fetchAndStore(): Promise<void> {
    await pollUntil(
      async () => {
        if (this._isDisposed) return true
        if (lcuState.summonerInfo) return true
        const currentCred = lcuState.credential
        if (!currentCred) return false

        try {
          const [summRes, rankRes] = await Promise.all([
            createHttp1Request(
              {
                method: 'GET',
                url: '/lol-summoner/v1/current-summoner'
              },
              currentCred
            ),
            createHttp1Request(
              {
                method: 'GET',
                url: '/lol-ranked/v1/current-ranked-stats'
              },
              currentCred
            )
          ])

          if (!summRes.ok || !rankRes.ok) return false

          const summData = summRes.json() as CurrentSummonerDto

          const rankData = rankRes.json() as RankedQueueDto

          const queues = (rankData.queueMap || {}) as Record<string, any>

          const solo = queues?.RANKED_SOLO_5x5

          const flex = queues?.RANKED_FLEX_SR

          const summonerInfo: SummonerInfo = {
            gameName: summData.gameName,
            profileIconId: summData.profileIconId,
            privacy: summData.privacy,
            summonerLevel: summData.summonerLevel,
            tagLine: summData.tagLine,
            puuid: summData.puuid,
            soloRank: normalizeRank(solo),
            flexRank: normalizeRank(flex)
          }

          lcuState.setSummonerInfo(summonerInfo)
          return true
        } catch {
          return false
        }
      },
      {
        interval: 2000,
        timeout: 60 * 2000
      }
    )
    this._isPolling = false
  }
}
