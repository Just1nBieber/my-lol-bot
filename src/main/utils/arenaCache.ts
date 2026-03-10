import { app } from 'electron'
import path from 'path'
import fs from 'fs/promises'
import { lcuState } from '@main/shards/Lcu-state/state'

// 🎯 引入纯净的全局网络客户端
import { netFetch } from './lcuRequest'
import { createHttp1Request } from 'league-connect'

// ==========================================
// 🛡️ 类型定义区 (彻底消灭 any)
// ==========================================
interface CDragonAugment {
  id: number
  name: string
  desc: string
  iconSmall: string
}

interface CDragonResponse {
  augments?: CDragonAugment[]
}

// 联合类型：兼容 CDragon 可能返回的两种 JSON 结构
type CDragonRawData = CDragonResponse | CDragonAugment[]

export interface ArenaAugmentDictItem {
  name: string
  desc: string
  iconPath: string
  rarity?: string
}

export interface InitArenaAugmentsResult {
  dict: Record<number, ArenaAugmentDictItem>
  isFullyCached: boolean
  version: string
}

// ==========================================
// ⚙️ 业务逻辑区
// ==========================================

/**
 * 获取当前 LOL 客户端的版本号 (请求本地 LCU)
 */
async function getCurrentGameVersion(): Promise<string> {
  try {
    const creds = lcuState.credential
    if (!creds || !creds.port || !creds.password) {
      return 'unknown'
    }

    const versionInfo = await createHttp1Request(
      {
        method: 'GET',
        url: '/lol-patch/v1/game-version'
      },
      creds
    )

    const version = versionInfo.json() as string
    console.log('version:', version)
    return version || 'unknown'
  } catch (e) {
    console.warn('[Version Check] 获取游戏版本失败，可能是 LCU 未完全启动', e)
    return 'unknown'
  }
}

export async function saveMergedArenaToDisk(
  mergedDict: Record<number, ArenaAugmentDictItem>,
  version: string
): Promise<void> {
  const userDataPath = app.getPath('userData')
  const cacheFilePath = path.join(userDataPath, 'arena_zh_cn.json')
  const versionFilePath = path.join(userDataPath, 'arena_version.txt')

  try {
    await fs.writeFile(cacheFilePath, JSON.stringify(mergedDict), 'utf-8')
    await fs.writeFile(versionFilePath, version || 'unknown', 'utf-8')
  } catch (error) {
    console.error('[Arena Cache] 写入本地缓存失败', error)
  }
}

/**
 * 初始化斗魂竞技场/海克斯大乱斗字典 (带本地缓存 & 版本强校验)
 */
export async function initArenaAugmentsWithCache(): Promise<InitArenaAugmentsResult> {
  const userDataPath = app.getPath('userData')
  const cacheFilePath = path.join(userDataPath, 'arena_zh_cn.json')
  const versionFilePath = path.join(userDataPath, 'arena_version.txt')

  const currentVersion = await getCurrentGameVersion()
  let isFullyCached = false

  // 1. 守门员：版本与文件校验
  try {
    await fs.access(cacheFilePath)
    await fs.access(versionFilePath)
    const localVersion = (await fs.readFile(versionFilePath, 'utf-8')).trim()

    if (localVersion === currentVersion) {
      isFullyCached = true
      console.log(`[Cache] 海克斯版本一致 (${localVersion})，准备极速读取本地字典。`)
    } else {
      console.log(`[Cache] 版本更新：${localVersion} -> ${currentVersion}`)
    }
  } catch (_e) {
    console.log('[Cache] 未找到本地缓存，准备首次下载。')
  }

  // ==========================================
  // 🚀 轨道 A：命中完美缓存！(读取的是 Dictionary，直接返回，秒开！)
  // ==========================================
  if (isFullyCached) {
    try {
      const cachedText = await fs.readFile(cacheFilePath, 'utf-8')
      // ⚠️ 重点：存进去的是字典，读出来的直接断言为字典！
      const cachedDict = JSON.parse(cachedText) as Record<number, ArenaAugmentDictItem>
      return {
        dict: cachedDict,
        isFullyCached: true,
        version: currentVersion
      }
    } catch (error) {
      console.error('[Cache Error] 读取本地 Arena 缓存失败，回退远端拉取...', error)
      isFullyCached = false // 读取失败，剥夺缓存特权，打入冷宫重新拉取
    }
  }

  // ==========================================
  // 🐌 轨道 B：未命中缓存，苦哈哈地去 CDragon 拉取原始数据
  // ==========================================
  let rawData: CDragonRawData | null = null

  try {
    const externalUrl = 'https://raw.communitydragon.org/latest/cdragon/arena/zh_cn.json'
    rawData = await netFetch.get<CDragonRawData>(externalUrl)
  } catch (error) {
    console.error('[Cache Error] 从 CDragon 下载失败，尝试使用旧版缓存兜底...', error)
    // 即使远端挂了，也尽力抢救一下旧缓存（死马当活马医）
    try {
      const fallback = await fs.readFile(cacheFilePath, 'utf-8')
      const fallbackDict = JSON.parse(fallback) as Record<number, ArenaAugmentDictItem>
      return { dict: fallbackDict, isFullyCached: false, version: currentVersion }
    } catch (_readError) {
      rawData = [] // 彻底没救了，给个空数组
    }
  }

  // ==========================================
  // 🧹 轨道 B 专属：清洗 CDragon 原始数据 (从数组转成字典)
  // ==========================================
  const ultimateAugmentDict: Record<number, ArenaAugmentDictItem> = {}
  let augmentsArray: CDragonAugment[] = []

  if (rawData) {
    if ('augments' in rawData && Array.isArray(rawData.augments)) {
      augmentsArray = rawData.augments
    } else if (Array.isArray(rawData)) {
      augmentsArray = rawData
    }
  }

  for (const item of augmentsArray) {
    if (!item.id || !item.iconSmall) continue

    let localIconPath = item.iconSmall.toLowerCase()
    if (!localIconPath.startsWith('/lol-game-data/assets/')) {
      localIconPath = `/lol-game-data/assets/${localIconPath}`
    }

    ultimateAugmentDict[item.id] = {
      name: item.name,
      desc: item.desc,
      iconPath: localIconPath
      // 注意：这里没有 rarity，因为它是给 Champ-asset 去缝合的半成品
    }
  }

  // 轨道 B 完成，返回半成品，等待后续缝合
  return {
    dict: ultimateAugmentDict,
    isFullyCached: false, // 告诉外面，还需要去缝合！
    version: currentVersion
  }
}
