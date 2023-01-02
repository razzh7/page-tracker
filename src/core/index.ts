import { DefaultOptions, Options, TrackerConfig, reportTracker } from '../types/core'
import { createHistoryEvent } from '../util/pv'

const MouseEventList: string[] = [
  'click',
  'dblclick',
  'contextmenu',
  'mouseup',
  'mouseenter',
  'mouseout',
  'mouseover'
]
export default class Tracker {
  public data: Options
  public version: string | undefined
  constructor(options: Options) {
    // 选项合并,并拦截 history 的方法
    this.data = Object.assign(this.initDef(), options)
    // 监听事件
    this.installTracker()
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

  public setUserId(id: string) {
    this.data.uuid = id
  }

  private installTracker() {
    // History API
    if (this.data.historyTracker) {
      this.captureEvents(['popstate'], 'history-pv')
      this.captureEvents(['pushState'], 'history-pv')
      this.captureEvents(['replaceState'], 'history-pv')
    }

    // Hash
    if (this.data.hashTracker) {
      this.captureEvents(['hashchange'], 'hash-pv')
    }

    // DOM Event
    if (this.data.domTracker) {
      this.captureDomEvents()
    }

    // JSError
    if (this.data.jsError) {
      this.jsError()
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
        this.reportTracker({ eventName, targetKey, data })
      })
    })
  }

  // 捕获 DOM 事件，并上报
  private captureDomEvents() {
    MouseEventList.forEach((event) => {
      window.addEventListener(event, (e) => {
        const target = (window.event || e).target as HTMLElement
        const targetKey = target.getAttribute('target-key')

        if (targetKey) {
          this.sendReport({
            eventName: event,
            targetKey
          })
        }
      })
    })
  }

  // 捕获 JS Error 并上报
  private jsError() {
    this.eventError()
    this.promiseError()
  }

  private eventError() {
    window.addEventListener('error', (event) => {
      this.sendReport({
        eventName: 'jsError',
        targetKey: 'message',
        errorContent: event.message
      })
    })
  }

  private promiseError() {
    window.addEventListener('unhandledrejection', (event) => {
      event.promise.catch((error) => {
        this.sendReport({
          targetKey: 'reject',
          eventName: 'promise',
          message: error
        })
      })
    })
  }

  public sendReport(data: reportTracker) {
    this.reportTracker(data)
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
