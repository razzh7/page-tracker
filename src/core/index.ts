import { DefaultOptions, Options, TrackerConfig } from '../types/core'
import { createHistoryEvent } from '../util/pv'

export default class Tracker {
  public data: Options
  public version: string | undefined
  constructor(options: Options) {
    // 选项合并,并拦截 history 的方法
    this.data = Object.assign(this.initDef(), options)
    // 监听事件
    this.installTracker()
    console.log('执行')
  }

  private initDef(): DefaultOptions {
    // 指定版本
    this.version = TrackerConfig.version
    // 拦截 pushState 和 repalceState 方法
    // history 无法通过 popstate 监听 pushState 和 replaceState
    // Detail See: https://developer.mozilla.org/zh-CN/docs/Web/API/Window/popstate_event
    window.history['pushState'] = createHistoryEvent('pushState')
    window.history['replaceState'] = createHistoryEvent('replaceState')

    return <DefaultOptions>{
      sdkVersion: this.version,
      historyTracker: false,
      hashTracker: false,
      domTracker: false,
      jsError: false
    }
  }

  private installTracker() {
    if (this.data.historyTracker) {
      this.captureEvents(['popstate'], 'history-pv')
      this.captureEvents(['pushState'], 'history-pv')
      this.captureEvents(['replaceState'], 'history-pv')
    }

    if (this.data.hashTracker) {
      this.captureEvents(['hashchange'], 'hash-pv')
    }
  }

  /**
   *
   * @param MouseEventList 需要监听的鼠标事件类型数组
   * @param targetKey 监听的行为类型
   * @param data 额外的数据
   */
  private captureEvents<T>(MouseEventList: string[], targetKey: string, data?: T) {
    MouseEventList.forEach((eventName) => {
      window.addEventListener(eventName, () => {
        console.log('cur event', eventName)
        this.reportTracker({ eventName, targetKey, data })
      })
    })
  }

  private reportTracker<T>(data: T) {
    const params = Object.assign(this.data, data, { time: new Date().getTime() })
    let headers = {
      type: 'application/x-www-form-urlencoded'
    }
    // Blob 用法：https://developer.mozilla.org/zh-CN/docs/Web/API/Blob
    let blob = new Blob([JSON.stringify(params)], headers)

    // 在浏览器关闭的情况下 navigator.sendBeacon 也能将数据送达至后端
    // Detail See：https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/sendBeacon
    navigator.sendBeacon(this.data.requestUrl, blob)
  }
}
