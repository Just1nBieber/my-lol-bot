ws!.subscribe('/lol-champ-select/v1/session', (data) => {
  if (!data || !data.actions) return
  const { localPlayerCellId, actions } = data as LcuSessionData
  const flatArray = actions.flat()

  // --- 🔍 调试代码开始 ---
  // 1. 先找到属于你的所有动作（不管是不是进行中）
  const allMyActions = flatArray.filter((item) => item.actorCellId === localPlayerCellId)

  // 2. 打印出来看看状态
  // 这行日志会告诉你，为什么后面的 switch 进不去
  console.log(
    '我的所有动作状态:',
    allMyActions.map((a) => ({
      type: a.type,
      isInProgress: a.isInProgress,
      completed: a.completed
    }))
  )
  // --- 🔍 调试代码结束 ---

  // 你的核心逻辑
  const currentAction = flatArray.find(
    (item) => item.actorCellId === localPlayerCellId && item.isInProgress === true
  )

  if (!currentAction) {
    // 如果这里打印了，说明代码在跑，只是还没轮到你
    // console.log('还没轮到我操作...')
    return
  }

  // 只有真正轮到你的时候，才会进这里
  switch (currentAction.type) {
    case 'ban':
      console.log('🔥 触发：现在是我的 Ban 回合！')
      break
    case 'pick':
      console.log('⚡ 触发：现在是我的 Pick 回合！')
      break
  }
})
