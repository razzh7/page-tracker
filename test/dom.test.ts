import { describe, expect, test, vi, beforeEach } from 'vitest'
import { useParams } from './util'
import Tracker from '../src/core'

let tracker: any
// Mock navigator.sendBeacon
Object.assign(navigator, {
  sendBeacon: vi.fn()
})
describe('use dom option', () => {
  beforeEach(() => {
    tracker = new Tracker({
      requestUrl: 'https://localhost:3001',
      domTracker: true
    })
    vi.spyOn(window.navigator, 'sendBeacon')
  })

  test('dom', () => {
    document.body.innerHTML = `
    <button id="button" target-key="btn">BUTTON</button>
  `
    const btn = document.getElementById('button')
    const reportSpy = vi.spyOn(tracker, 'reportTracker')

    if (btn) {
      btn.click()
    }

    expect(reportSpy).toHaveBeenCalled()
    expect(reportSpy).toHaveBeenCalledWith(useParams('click', 'btn'))
  })
})
