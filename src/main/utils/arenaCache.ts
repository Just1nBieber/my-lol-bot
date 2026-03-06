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

    const versionInfo = createHttp1Request(
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

/**
 * 初始化斗魂竞技场/海克斯大乱斗字典 (带本地缓存 & 版本强校验)
 */
export async function initArenaAugmentsWithCache(): Promise<Record<number, ArenaAugmentDictItem>> {
  const userDataPath = app.getPath('userData')
  const cacheFilePath = path.join(userDataPath, 'arena_zh_cn.json')
  const versionFilePath = path.join(userDataPath, 'arena_version.txt')

  const currentVersion = await getCurrentGameVersion()
  let needDownload = true

  // 1. 缓存校验逻辑 (The Gatekeeper)
  try {
    await fs.access(cacheFilePath)
    await fs.access(versionFilePath)
    const localVersion = await fs.readFile(versionFilePath, 'utf-8')

    if (localVersion === currentVersion || currentVersion === 'unknown') {
      needDownload = false
      console.log(`[Cache] 海克斯版本一致 (${localVersion})，跳过下载。`)
    } else {
      console.log(`[Cache] 版本更新：${localVersion} -> ${currentVersion}`)
    }
  } catch (e) {
    console.log('[Cache] 未找到本地缓存，准备首次下载。')
  }

  // 严格定义原始数据类型
  let rawData: CDragonRawData | null = null

  // 2. 执行下载 (或读取本地)
  if (needDownload) {
    try {
      const externalUrl = 'https://raw.communitydragon.org/latest/cdragon/arena/zh_cn.json'

      // 🚀 降维打击：直接用纯净版 netFetch 请求外部链接，极其清爽！
      rawData = await netFetch.get<CDragonRawData>(externalUrl)

      // 📥 写入本地硬盘持久化
      await fs.writeFile(cacheFilePath, JSON.stringify(rawData), 'utf-8')
      if (currentVersion !== 'unknown') {
        await fs.writeFile(versionFilePath, currentVersion, 'utf-8')
      }
      console.log('[Cache] 新版海克斯数据已成功持久化到硬盘！')
    } catch (error) {
      console.error('[Cache Error] 从 CDragon 下载失败，尝试使用旧版缓存兜底...', error)
      const fallback = await fs.readFile(cacheFilePath, 'utf-8').catch(() => '[]')
      rawData = JSON.parse(fallback) as CDragonRawData
    }
  } else {
    // 极速读取本地缓存
    rawData = JSON.parse(await fs.readFile(cacheFilePath, 'utf-8')) as CDragonRawData
  }

  // 3. 内存洗数据：适配真实的 JSON 结构
  const ultimateAugmentDict: Record<number, ArenaAugmentDictItem> = {}

  // 🛡️ 类型守卫：安全提取数组
  let augmentsArray: CDragonAugment[] = []

  if (rawData) {
    if ('augments' in rawData && Array.isArray(rawData.augments)) {
      augmentsArray = rawData.augments
    } else if (Array.isArray(rawData)) {
      augmentsArray = rawData
    }
  }

  // 遍历并清洗数据
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
    }
  }

  return ultimateAugmentDict
}
