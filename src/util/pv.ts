export const createHistoryEvent = <T extends keyof History>(type: T): (() => any) => {
  const origin = history[type]

  return function (this: any) {
    const res = origin.apply(this, arguments)
    // 创建一个 pushState 和 repalceState 事件
    const e = new Event(type)
    window.dispatchEvent(e)

    return res
  }
}
