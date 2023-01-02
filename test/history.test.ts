import { describe, expect, test, vi, beforeEach } from 'vitest'
import Tracker from '../src/core'

// Mock navigator.sendBeacon
Object.assign(navigator, {
  sendBeacon: vi.fn()
})
let tracker: any
const useParams = <T>(eventName: string, targetKey: string, data?: T) => {
  return {
    eventName,
    targetKey,
    data
  }
}
describe('use historyTracker option', () => {
  beforeEach(() => {
    tracker = new Tracker({
      requestUrl: 'https://localhost:3001',
      historyTracker: true
    })
    vi.spyOn(window.navigator, 'sendBeacon')
  })

  test('pushState', () => {
    const reportSpy = vi.spyOn(tracker, 'reportTracker')
    history.pushState('', '', '/foo')

    expect(reportSpy).toHaveBeenCalled()
    expect(reportSpy).toHaveBeenCalledWith(useParams('pushState', 'history-pv'))
  })

  test('replaceState', () => {
    const reportSpy = vi.spyOn(tracker, 'reportTracker')
    history.replaceState('', '', '/foo')

    expect(reportSpy).toHaveBeenCalled()
    expect(reportSpy).toHaveBeenCalledWith(useParams('replaceState', 'history-pv'))
  })

  test('popstate', () => {
    const reportSpy = vi.spyOn(tracker, 'reportTracker')
    history.pushState('', '', '/foo')

    expect(reportSpy).toHaveBeenCalledWith(useParams('pushState', 'history-pv'))

    // 手动触发 popstate 事件
    const popStateEvent = new PopStateEvent('popstate')
    dispatchEvent(popStateEvent)

    expect(reportSpy).toHaveBeenCalledWith(useParams('popstate', 'history-pv'))
  })
})
