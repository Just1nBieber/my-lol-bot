export interface BaiYueKuiShard {
  id: string
  onInit(): shardFn
  onDispose(): shardFn
}

export type shardFn = void | Promise<void>

export type YueKuiShardCtor = new () => BaiYueKuiShard