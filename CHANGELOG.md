# 更新日志

## [v0.0.1] - 2026-02-02

### ✨ 核心功能

- 落地 **Shard (碎片化)** 架构，实现业务逻辑解耦。
- 实现 `@Shard` 装饰器，支持模块自动扫描与注册。
- 构建单例 `ShardManager` 统一管理生命周期。

### 🛠️ 模块实现

- 完成 `HelloWorldShard` 模块，验证自动加载机制。
- 规范化 `BaiYueKuiShard` 接口，支持异步初始化。

# 更新日志

## [v0.0.2] -2026-02-03

### ✨ 新增功能

- 实现 `Lcu-connect-shard`模块，连接本地与客户端
- 落地 `LCU进程守护功能`，通过`connectionLoop`在软件未关闭的情况下，实时监听客户端状态
- 全局状态 `Lcu-state(基于mobx)`的初步架构，用于自动管理后端响应式数据，存储数据。

### ♻️ 代码优化

- **生命周期完善**: 在主进程 (`main.ts`) 增加 `will-quit` 钩子，确保应用退出时优雅销毁所有 Shard 资源。
- **类型安全**: 完善 `LeagueWebSocket` 的 TypeScript 类型定义，修复空值引用风险。

#  更新日志
## [v0.0.3] - 2026-02-03

### ✨ 新增功能 (Features)
- **架构搭建**: 初始化 `AutoPickShard` 模块，完成依赖注入与生命周期挂载。
- **状态监听**: 集成 MobX `reaction` 机制，实现对 LCU 游戏流程 (`GameflowPhase`) 的响应式监听。
- **资源管理**: 通过`this._cleanupFns`与 `onDispose`结合完善清理机制，自动销毁 reaction 监听器，杜绝内存泄漏。


#  更新日志
## [v0.0.4] - 2026-02-07

### ✨ 新增功能 (Features)
- **资源模块**: 初始化 `ChampAssetShard` 模块，完成英雄列表与头像数据的获取与入库，为前端 UI 提供数据支撑。
- **通信重构**: 弃用 HTTP 轮询，全面迁移至 WebSocket 长连接模式，实现对游戏阶段 (GamePhase) 的毫秒级实时响应。
- **状态管理**: 重构 `LcuState` 为单一数据源 (Single Source of Truth)，实现 Socket 实例、凭据 (Credential) 及英雄列表 (ChampionList) 的全局共享。
- **类型定义**: 补全 LCU 核心接口的 TypeScript 类型定义，提升开发体验与代码健壮性。
