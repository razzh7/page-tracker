/**
 * @requestUrl 接口地址
 * @historyTracker history上报
 * @hashTracker hash上报
 * @domTracker 携带Tracker-key 点击事件上报
 * @historyTracker sdkVersion sdk版本
 * @historyTracker extra 透传字段
 * @jsError js 和 promise 报错异常上报
 */

export interface DefaultOptions {
  uuid: string | undefined
  requestUrl: string | undefined
  historyTracker: boolean
  hashTracker: boolean
  domTracker: boolean
  sdkVersion: TrackerConfig.version
  extra: Record<string, any> | undefined
  jsError: boolean
}

export enum TrackerConfig {
  version = '0.1.0'
}

export interface Options extends Partial<DefaultOptions> {
  requestUrl: string
}

export interface reportTracker {
  [key: string]: any
  eventName: string
  targetKey: string
}
