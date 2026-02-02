import { YueKuiShardCtor } from './interface'
import { shardManager } from './manager'

/**
 * 🎩 Shard 装饰器工厂
 * * @param id 这个模块的唯一身份证号 (比如 'auto-pick')
 */

export function Shard(id: string) {
  return function (target: Function) {
    target.prototype.id = id
    console.log(`发现模块，正在注册${id}`)
    shardManager.Register(target as unknown as YueKuiShardCtor)
  }
}
