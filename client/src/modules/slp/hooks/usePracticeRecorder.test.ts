/** @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import usePracticeRecorder from './usePracticeRecorder'

let stopTrack = vi.fn()
let getUserMedia = vi.fn()
class FakeRecorder {
  static isTypeSupported = () => true
  static latest: FakeRecorder
  state = 'inactive'
  mimeType = 'audio/webm'
  ondataavailable: ((event: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor() {
    FakeRecorder.latest = this
  }
  start() {
    this.state = 'recording'
  }
  stop() {
    this.state = 'inactive'
    this.ondataavailable?.({ data: new Blob(['voice']) })
    this.onstop?.()
  }
}
beforeEach(() => {
  stopTrack = vi.fn()
  getUserMedia = vi
    .fn()
    .mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] })
  vi.stubGlobal('MediaRecorder', FakeRecorder)
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  })
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:practice'),
    revokeObjectURL: vi.fn(),
  })
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

it('records, releases the microphone and revokes replay URLs on clear', async () => {
  const { result } = renderHook(usePracticeRecorder)
  await act(() => result.current.start())
  expect(result.current.state).toBe('recording')
  act(() => result.current.stop())
  expect(result.current.state).toBe('reviewing')
  expect(result.current.audio?.size).toBeGreaterThan(0)
  expect(stopTrack).toHaveBeenCalled()
  act(() => result.current.clear())
  expect(result.current.audio).toBeNull()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:practice')
})

it('cancels a pending permission request and releases its eventual stream', async () => {
  let allow!: (stream: unknown) => void
  getUserMedia.mockImplementation(
    () =>
      new Promise((resolve) => {
        allow = resolve
      }),
  )
  const { result } = renderHook(usePracticeRecorder)
  let pending!: Promise<void>
  act(() => {
    pending = result.current.start()
  })
  act(() => result.current.clear())
  await act(async () => {
    allow({ getTracks: () => [{ stop: stopTrack }] })
    await pending
  })
  expect(stopTrack).toHaveBeenCalledOnce()
  expect(result.current.state).toBe('idle')
  expect(result.current.audio).toBeNull()
})

it('prevents duplicate permission requests and releases capture on unmount', async () => {
  const { result, unmount } = renderHook(usePracticeRecorder)
  await act(async () => {
    await Promise.all([result.current.start(), result.current.start()])
  })
  expect(getUserMedia).toHaveBeenCalledOnce()
  unmount()
  expect(stopTrack).toHaveBeenCalled()
})

it('automatically stops at the supported duration', async () => {
  vi.useFakeTimers()
  const { result } = renderHook(usePracticeRecorder)
  await act(() => result.current.start())
  act(() => vi.advanceTimersByTime(60_000))
  expect(result.current.state).toBe('reviewing')
  expect(stopTrack).toHaveBeenCalled()
})
