interface pollOptions {
  interval?: number
  timeout?: number
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

export async function pollUntil(
  fn: () => Promise<boolean>,
  options: pollOptions = {}
): Promise<void> {
  const { interval = 1000, timeout = 60 * 2000 } = options
  const startTime = Date.now()
  while (true) {
    try {
      const isDone = await fn()
      if (isDone) return
      const timeInterval = Date.now() - startTime

      if (timeInterval > timeout) {
        throw new Error('Polling timed out')
      }

      await sleep(interval)
    } catch (e) {
      console.log(e, '连接错误')
    }
  }
}
