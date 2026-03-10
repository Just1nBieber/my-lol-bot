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

# 更新日志

## [v1.0.4] - 2026-02-28

- **修复**: 通过 `pollUntil`工具函数解决了前后端数据拉取时间不一致的问题。
- **架构搭建** 构建了`userInfoShard`模块，用于存储用户信息，如等级、排名、头像等。
- **前端重构** 将之前凌乱的代码细分为一个个组件
- **样式重构** 将Tailwind 样式至独立字典，复杂状态用对象或数组与对象结合表示，方便管理与维护。

# 更新日志

## [v1.0.5] - 2026-3-02

- **优化**： 完善了后端`LcuState`模块，在监听到应用关闭时，会重置储存状态。

# 更新日志
## [v2.0.5] - 2026-03-07
### ✨ Feature (新增特性)
- **现代化 UI 基建**：引入 Shadcn-ui 组件库，并攻克 Tailwind CSS 浅/深色模式切换的样式冲突，为战绩卡片奠定视图基础。
- **单人战绩流打通**：搭建 Simple-matched-shard 模块，自研基于 pollUntil 的轮询机制，实现当前用户单人对局详情的精准获取。
- **海克斯缓存服务**：在 Lcu-connect 初始化阶段，新增 CDragon 静态数据（arena_zh_cn.json）的后台静默拉取、版本强校验与本地硬盘持久化落盘。
- **多维标签生成器**：新增 generatorTag 算法文件夹，为后续召唤师信息卡片的个性化标签（如 KDA、表现评估）提供底层函数支持。
- **IPC 分页预载**：在渲染进程落地分页 IPC 调用方法与响应式存储，为海量历史战绩的无感分页加载做好数据通道预案。

### 🛠️ Refactor (底层重构)
- **网络引擎解耦与 SSL 突破**：彻底剥离 LCU 网络层，抽离 lcuRequest.ts 与纯净版 netFetch。利用 Node.js 原生 fetch 成功绕过 Chromium 底层自签名证书拦截，并实现 Zero Any 类型安全。

### 🔧 Fix (修复)
- **系统级图片协议重塑**：重构 System-protocol-shard 模块，修复路径解析漏洞，并复用底层网络工具，完美实现 lcu-img:// 对本地游戏静态资源的无缝跨域代理。

### ♻️ Refactor (底层重构)
- **主进程状态管理分离**：重构 LcuState 的内存清理逻辑，严格区分“对局动态数据”与“全局静态字典”。在客户端断开时实现精准销毁，确保字典资源常驻内存，杜绝重复 I/O 损耗。

### 🚀 Optimize (性能与数据优化)
- **并发拉取提速**：重构 ChampAssetShard 模块，引入 Promise.allSettled 对 LCU 核心静态资源进行高并发一次性拉取，大幅缩短冷启动耗时。
- **数据清洗管道**：建立 matched-translator.ts、kda.ts、cs-per-minute.ts 工具链，配合 Array.prototype.reduce 高效收敛并清洗原始冗余对局数据。


# 更新日志
## [v2.0.6] - 2026-03-07
-**优化**： 完善了后端`ChampAssetShard`模块，增加了状态布尔值，用于记录该数据是否已被加载，防止了数据被再次拉取消耗性能。
-**优新增**： 完善了后端`ChampAssetShard`模块，增加了经典模式下符文的主系(如：精密)，副系（如：启迪）的静态数据拉取。
-**优化**- `System-protocol-shard`模块，增加了对`postman`暴露credential的接口地址，方便调试
-**修复**- 修复了`arenaCache.ts` 中，因为疏忽漏掉`await` 导致每次都要重新下载新文件的`bug`

# 更新日志
# [v2.0.7] - 2026-03-08

## ✨ Feature (新增特性)
- **符文树大类资源集成**: 在 Champ-asset-shard 的并发拉取队列中新增 `perkstyles.json` 静态数据拉取，彻底补全了符文主系（Primary Style）与副系（Sub Style）的大图标资源。

- **全链路状态闭环**: 将新拉取的符文树字典接入主进程 `LcuState` 的持久化白名单，并打通前后端（Node.js → Vue）的响应式状态同步，确保 UI 渲染与内存数据绝对一致。

## 🛠️ Refactor (底层重构)
- **战绩数据清洗管道升级**: 重构 `SimpleMatched` 的战绩映射逻辑，将 LCU 原始返回中冗余、杂乱的扁平化符文字段（如 `perk0`、`perkSubStyle` 等）在底层优雅组装为结构化的 `runes` 对象。

- **类型推导严谨化**: 同步更新 `SimpleMatchDTO` 及相关 TS 接口定义，持续贯彻 Zero Any 规范，保障了前端调用 `runes` 对象时的绝对类型安全。

# 更新日志
# [v2.1.7] - 2026-03-010

## ✨ Feature (新增特性)
- **初步绘制了**: `MatchedCard`页面的基础布局，包含了玩家信息、符文树、KDA、CS/分等基本信息。