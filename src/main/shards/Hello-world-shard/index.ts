import { BaiYueKuiShard, shardFn } from '@shared/yuekui-shard/interface'
import { Shard } from '@shared/yuekui-shard/decorators'

const SHARD_ID = 'hello-world'
@Shard(SHARD_ID)
export class HelloWorldShard implements BaiYueKuiShard {
  static id = SHARD_ID
  id = SHARD_ID

  onInit(): shardFn {
    return console.log('HaloWorld')
  }

  onDispose(): shardFn {
    return console.log('Bye, Bye👋')
  }
}
