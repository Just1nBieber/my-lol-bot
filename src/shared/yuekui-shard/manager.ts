import { BaiYueKuiShard, YueKuiShardCtor } from './interface'

class ShardManager {
  // 1 - 用map保存shard模块.
  private _shards = new Map<string, BaiYueKuiShard>()

  // 2 - 保存注册模块
  private _registerShards: YueKuiShardCtor[] = []

  // 功能--  注册模块
  Register(shard: YueKuiShardCtor): void {
    this._registerShards.push(shard)
  }

  // 功能-- 初始化
  async initAll(): Promise<void> {
    for (const Activator of this._registerShards) {
      const shard = new Activator()
      console.log(`正在启动[白月魁🌙lol-helper]`)
      try {
        shard.onInit()
        this._shards.set(shard.id, shard)
        console.log(`${shard.id}已启动`)
      } catch (e) {
        console.error(`${shard.id}启动失败`, e)
      }
      console.log('所有模块已经启动完毕⭐')
    }
  }

  async disposeAll(): Promise<void> {
    for (const [id, shard] of this._shards) {
      try {
        shard.onDispose()
      } catch (e) {
        console.error(`${id} 销毁失败`, e)
      }
    }
    this._shards.clear()
  }
}

export const shardManager = new ShardManager()
// 强制实现单例模式， 如果把class export出去，会导致不同的地方，使用不同的实例从而无法控制进程。
/* Node.js 的模块缓存机制： Node.js 会缓存 require 或 import 的模块。
 当且仅当 export const instance 时，无论你在项目里 import 多少次，
 拿到的永远是内存里同一个对象引用。 */
