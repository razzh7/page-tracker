import { describe, expect, test, vi, beforeEach } from 'vitest'
import { useParams } from './util'
import Tracker from '../src/core'

// Mock navigator.sendBeacon
Object.assign(navigator, {
  sendBeacon: vi.fn()
})
let tracker: any

describe('use historyTracker option', () => {
  beforeEach(() => {
    tracker = new Tracker({
      requestUrl: 'https://localhost:3001',
      hashTracker: true
    })
    vi.spyOn(window.navigator, 'sendBeacon')
  })

  test('pushState', () => {
    const reportSpy = vi.spyOn(tracker, 'reportTracker')
    // 派发 hashchange 事件
    window.dispatchEvent(
      new HashChangeEvent('hashchange', {
        oldURL: 'http://127.0.0.1:5500/index.html#123',
        newURL: 'http://127.0.0.1:5500/index.html#456'
      })
    )

    expect(reportSpy).toHaveBeenCalled()
    expect(reportSpy).toHaveBeenCalledWith(useParams('hashchange', 'hash-pv'))
  })
})
