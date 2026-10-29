// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useRoomSession } from './useRoomSession'

const mocks = vi.hoisted(() => ({
  api: vi.fn(), here: vi.fn(), joining: vi.fn(), leaving: vi.fn(), listen: vi.fn(), leave: vi.fn(),
  stop: vi.fn(), offer: vi.fn(), pcs: [] as Array<Record<string, any>>,
}))
vi.mock('#/lib/api/client', () => ({ api: mocks.api }))
vi.mock('react', async () => {
  const { createRequire } = await import('node:module')
  const react = createRequire(import.meta.url)('react')
  return { ...react, default: react }
})
vi.mock('#/modules/auth/context/SessionContext', () => ({ useSession: () => ({ id: 'a' }) }))
vi.mock('#/modules/notifications/api/echo', () => ({}))
vi.mock('@laravel/echo-react', () => ({ echo: () => ({
  join: () => {
    const channel = {
      here: (fn: unknown) => { mocks.here(fn); return channel },
      joining: (fn: unknown) => { mocks.joining(fn); return channel },
      leaving: (fn: unknown) => { mocks.leaving(fn); return channel },
      listen: (_: string, fn: unknown) => { mocks.listen(fn); return channel },
      error: () => channel,
    }
    return channel
  }, leaveChannel: mocks.leave,
}) }))

beforeEach(() => {
  vi.clearAllMocks()
  mocks.pcs.length = 0
  vi.stubGlobal('isSecureContext', true)
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: mocks.stop }], getAudioTracks: () => [], getVideoTracks: () => [],
    }),
  } })
  vi.stubGlobal('RTCPeerConnection', class {
    constructor() { mocks.pcs.push(this) }
    connectionState = 'new'
    signalingState = 'stable'
    addTrack() {}
    createDataChannel() { return { close() {} } }
    createOffer = mocks.offer.mockResolvedValue({ sdp: 'offer-sdp' })
    setLocalDescription = vi.fn().mockResolvedValue(undefined)
    close() {}
  })
  mocks.api.mockImplementation((url: string) => Promise.resolve(url.endsWith('/session')
    ? { data: { channel: 'sessions.room.0', generation: 0, ice_servers: [] } }
    : undefined))
})

afterEach(() => { vi.useRealTimers() })

it('logs signaling metadata without chat text or SDP', async () => {
  const log = vi.spyOn(console, 'info').mockImplementation(() => {})
  const { result, unmount } = renderHook(() => useRoomSession('room'))
  try {
    await waitFor(() => expect(mocks.here).toHaveBeenCalled())
    await act(async () => mocks.here.mock.calls[0][0]([{ id: 'a' }, { id: 'b' }]))
    await act(async () => result.current.sendChat('private message content'))
    const output = JSON.stringify(log.mock.calls)
    expect(output).toContain('presence.snapshot')
    expect(output).toContain('signal.send')
    expect(output).not.toContain('private message content')
    expect(output).not.toContain('offer-sdp')
  } finally {
    unmount()
    log.mockRestore()
  }
})

it('ignores callbacks from a departed room after mounting a new room', async () => {
  const first = renderHook(() => useRoomSession('room'))
  await waitFor(() => expect(mocks.here).toHaveBeenCalledOnce())
  const staleJoin = mocks.joining.mock.calls[0][0]
  const staleHere = mocks.here.mock.calls[0][0]
  first.unmount()
  const second = renderHook(() => useRoomSession('room'))
  await waitFor(() => expect(mocks.here).toHaveBeenCalledTimes(2))
  mocks.api.mockClear()
  await act(async () => {
    staleHere([{ id: 'a' }, { id: 'b' }])
    staleJoin({ id: 'b' })
  })
  expect(mocks.api).not.toHaveBeenCalled()
  expect(second.result.current.participants).toEqual([])
  second.unmount()
})

it('discards an in-flight offer if the peer leaves before it completes', async () => {
  const { unmount } = renderHook(() => useRoomSession('room'))
  await waitFor(() => expect(mocks.here).toHaveBeenCalled())
  let resolveOffer!: (value: { sdp: string }) => void
  mocks.offer.mockImplementationOnce(() => new Promise((resolve) => { resolveOffer = resolve }))
  await act(async () => mocks.here.mock.calls[0][0]([{ id: 'a' }, { id: 'b' }]))
  await act(async () => mocks.leaving.mock.calls[0][0]({ id: 'b' }))
  mocks.api.mockClear()
  await act(async () => resolveOffer({ sdp: 'stale-offer' }))
  expect(mocks.api).not.toHaveBeenCalled()
  await act(async () => mocks.joining.mock.calls[0][0]({ id: 'b', name: 'Returning clinician' }))
  expect(mocks.pcs).toHaveLength(2)
  expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledOnce()
  unmount()
})

it('announces readiness only after subscribing and negotiates with the existing peer', async () => {
  const { unmount } = renderHook(() => useRoomSession('room'))
  await waitFor(() => expect(mocks.here).toHaveBeenCalled())
  expect(mocks.api).toHaveBeenCalledTimes(1)
  await act(async () => mocks.here.mock.calls[0][0]([{ id: 'a' }, { id: 'b' }]))
  expect(mocks.offer).toHaveBeenCalledOnce()
  expect(mocks.api).toHaveBeenCalledWith('/api/v1/appointments/room/signals', expect.objectContaining({
    data: expect.objectContaining({ type: 'ready', target_peer_id: 'b' }),
  }))
  unmount()
  expect(mocks.stop).toHaveBeenCalledOnce()
  expect(mocks.leave).toHaveBeenCalledWith('presence-sessions.room.0')
})

it('surfaces failed chat signaling instead of silently swallowing it', async () => {
  const { result, unmount } = renderHook(() => useRoomSession('room'))
  await waitFor(() => expect(mocks.here).toHaveBeenCalled())
  mocks.api.mockRejectedValueOnce(new Error('Broadcast failed'))
  await act(async () => result.current.sendChat('hello'))
  expect(result.current.sessionError).toContain('Session connection failed')
  unmount()
})

it('rejects a descriptor with a missing generation before capturing media', async () => {
  mocks.api.mockResolvedValueOnce({ data: { channel: 'sessions.room.', ice_servers: [] } })
  const { result, unmount } = renderHook(() => useRoomSession('room'))
  await waitFor(() => expect(result.current.sessionError).not.toBeNull())
  expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled()
  unmount()
})

it('retains streamless remote tracks and lists presence members', async () => {
  vi.stubGlobal('MediaStream', class {
    constructor(public tracks: unknown[]) {}
    getTracks() { return this.tracks }
  })
  const { result, unmount } = renderHook(() => useRoomSession('room'))
  await waitFor(() => expect(mocks.here).toHaveBeenCalled())
  const video = { srcObject: null, play: vi.fn().mockResolvedValue(undefined) }
  result.current.remoteRef.current = video as unknown as HTMLVideoElement
  await act(async () => {
    mocks.here.mock.calls[0][0]([{ id: 'a', name: 'Patient' }, { id: 'b', name: 'Clinician' }])
    mocks.pcs[0].ontrack({ streams: [], track: { id: 'video-track' } })
  })
  expect(result.current.participants).toHaveLength(2)
  expect((video.srcObject as unknown as MediaStream).getTracks()).toHaveLength(1)
  expect(video.play).toHaveBeenCalled()
  unmount()
})

it('retries a failed peer connection and cancels timers on exit', async () => {
  const { result, unmount } = renderHook(() => useRoomSession('room'))
  await waitFor(() => expect(mocks.here).toHaveBeenCalled())
  vi.useFakeTimers()
  await act(async () => {
    mocks.here.mock.calls[0][0]([{ id: 'a' }, { id: 'b' }])
    mocks.pcs[0].connectionState = 'failed'
    mocks.pcs[0].onconnectionstatechange()
  })
  expect(result.current.connectionStatus).toBe('Reconnecting')
  await act(async () => vi.advanceTimersByTimeAsync(5000))
  expect(mocks.pcs).toHaveLength(1)
  expect(mocks.offer).toHaveBeenLastCalledWith({ iceRestart: true })
  expect(mocks.stop).not.toHaveBeenCalled()
  expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledOnce()
  unmount()
  expect(vi.getTimerCount()).toBe(0)
})

it('does not renegotiate a healthy call on repeated ready signals', async () => {
  const { unmount } = renderHook(() => useRoomSession('room'))
  await waitFor(() => expect(mocks.here).toHaveBeenCalled())
  await act(async () => mocks.here.mock.calls[0][0]([{ id: 'a' }, { id: 'b' }]))
  mocks.offer.mockClear()
  mocks.pcs[0].connectionState = 'connected'
  await act(async () => mocks.listen.mock.calls[0][0]({ sender_id: 'b', target_peer_id: 'a', signal: { type: 'ready' } }))
  expect(mocks.offer).not.toHaveBeenCalled()
  unmount()
})
