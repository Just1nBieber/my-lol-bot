// 🎯 核心知识点：LCU 的 Action 结构
export interface LcuAction {
  id: number             // 动作ID (我们发请求就需要这个！)
  actorCellId: number    // 谁在执行这个动作 (对应 localPlayerCellId)
  championId: number     // 当前选了哪个英雄 (0 代表还没选)
  type: 'pick' | 'ban'   // 动作类型：是选人还是Ban人？
  completed: boolean     // 是否已锁定？
  isInProgress: boolean  // 是否轮到当前动作执行？
}

// 定义一个联合类型，这就是最好的“文档”
export type GameflowPhase = 
  | 'None'
  | 'Lobby'
  | 'Matchmaking'
  | 'ReadyCheck'
  | 'ChampSelect'
  | 'GameStart'
  | 'InProgress'
  | 'PreEndOfGame'
  | 'EndOfGame'
  | 'Reconnect'
  | 'TerminatedInError'


 export interface LcuSessionData {
  localPlayerCellId: number
  actions: LcuAction[][] // 二维数组
}


// 英雄资源
export interface ChampionSimple {
  id: number
  name: string
  alias: string // 例如 "Yasuo"
  squarePortraitPath: string // 头像路径
}

// 英雄选择
export interface pickObj {
  championId: number
  completed: boolean
}

