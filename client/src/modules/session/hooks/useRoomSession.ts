import { useEffect, useRef, useState } from 'react'
import { api } from '#/lib/api/client'
import { useSession } from '#/modules/auth/context/SessionContext'
import { echo } from '@laravel/echo-react'
import '#/modules/notifications/api/echo'

export interface DiagState {
  iceConnection: RTCIceConnectionState | '—'
  iceGathering: RTCIceGatheringState | '—'
  pcConnection: RTCPeerConnectionState | '—'
  signalingState: RTCSignalingState | '—'
  candidatesSent: number
  candidatesRecv: number
  trackCount: number
  polite: boolean | null
  remotePeerId: string | null
}

const INITIAL_DIAG: DiagState = {
  iceConnection: '—',
  iceGathering: '—',
  pcConnection: '—',
  signalingState: '—',
  candidatesSent: 0,
  candidatesRecv: 0,
  trackCount: 0,
  polite: null,
  remotePeerId: null,
}

export type PermissionState = 'prompting' | 'granted' | 'denied' | 'insecure'
type SessionLog = Record<string, unknown>
type PeerMediaState = { mic: boolean; camera: boolean }
type RoomMember = { id: string; name?: string; role?: string }
type SessionDescriptor = {
  channel: string
  generation: number
  user_id: string
  ice_servers: RTCIceServer[]
}
type SignalEvent = {
  sender_id: string
  target_peer_id: string | null
  signal: {
    type:
      | 'offer'
      | 'answer'
      | 'ice_candidate'
      | 'ready'
      | 'media_toggle'
      | 'chat_message'
      | 'resync'
    sdp?: string
    candidate?: RTCIceCandidateInit
    kind?: 'mic' | 'camera'
    enabled?: boolean
    text?: string
  }
}

const normalizeSdp = (sdp: string) =>
  sdp.replace(/\r\n|\r|\n/g, '\r\n').trimEnd() + '\r\n'

export function useRoomSession(appointmentId: string) {
  const { id: currentUserId } = useSession()
  const localRef = useRef<HTMLVideoElement | null>(null)
  const remoteRef = useRef<HTMLVideoElement | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const sendSignalRef = useRef<(payload: Record<string, unknown>) => void>(
    () => {},
  )
  const [messages, setMessages] = useState<string[]>([])
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [participants, setParticipants] = useState<RoomMember[]>([])
  const [playbackBlocked, setPlaybackBlocked] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('Connecting')
  const [connected, setConnected] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const sessionLogsRef = useRef<SessionLog[]>([])
  const [diag, setDiag] = useState<DiagState>(INITIAL_DIAG)
  const [permission, setPermission] = useState<PermissionState>('prompting')
  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [peerMedia, setPeerMedia] = useState<PeerMediaState>({
    mic: true,
    camera: true,
  })

  const playRemote = () => {
    const video = remoteRef.current
    if (!video) return
    void video
      .play()
      .then(() => setPlaybackBlocked(false))
      .catch(() => setPlaybackBlocked(true))
  }

  useEffect(() => {
    const video = localRef.current
    if (!video || video.srcObject === localStream) return
    video.srcObject = localStream
  })

  useEffect(() => {
    const video = remoteRef.current
    if (!video || video.srcObject === remoteStream) return
    video.srcObject = remoteStream
    if (remoteStream) playRemote()
  })

  useEffect(() => {
    const echoInstance = echo()
    let disposed = false
    const isDisposed = () => disposed
    let descriptor: SessionDescriptor | null = null
    let channelName: string | null = null
    let pc: RTCPeerConnection | null = null
    let remotePeerId: string | null = null
    let polite = false
    let makingOffer = false
    let pendingCandidates: RTCIceCandidateInit[] = []
    let signalQueue = Promise.resolve()
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let subscribed = false
    let recoveryAttempts = 0
    const runId = Math.random().toString(36).slice(2, 8)
    const trace = (event: string, details: Record<string, unknown> = {}) => {
      const entry = {
        time: new Date().toISOString(),
        runId,
        event,
        subscribed,
        hasPeer: Boolean(remotePeerId),
        polite,
        makingOffer,
        connection: pc?.connectionState,
        ice: pc?.iceConnectionState,
        signaling: pc?.signalingState,
        queuedCandidates: pendingCandidates.length,
        localDescription: pc?.localDescription?.type,
        remoteDescription: pc?.remoteDescription?.type,
        generation: descriptor?.generation,
        ...details,
      }
      sessionLogsRef.current.push(entry)
      if (sessionLogsRef.current.length > 200) sessionLogsRef.current.shift()
    }
    const errorDetails = (error: unknown) => {
      const failure = error as
        | {
            name?: string
            response?: {
              status?: number
              data?: {
                code?: string
                request_id?: string
                errors?: Record<string, unknown>
              }
            }
          }
        | undefined
      return {
        errorName: failure?.name,
        errorMessage: failure instanceof Error ? failure.message : undefined,
        httpStatus: failure?.response?.status,
        code: failure?.response?.data?.code,
        requestId: failure?.response?.data?.request_id,
        invalidFields: Object.keys(failure?.response?.data?.errors ?? {}),
      }
    }
    trace('session.start')
    const scheduleRetry = (reason = 'retry-backoff') => {
      if (disposed || retryTimer || !remotePeerId || recoveryAttempts >= 5)
        return
      trace('retry.scheduled', {
        reason,
        attempt: recoveryAttempts + 1,
        delayMs: Math.min(5000 * 2 ** recoveryAttempts, 30000),
      })
      setConnectionStatus('Reconnecting')
      retryTimer = setTimeout(
        () => {
          retryTimer = undefined
          if (disposed || !remotePeerId || pc?.connectionState === 'connected')
            return
          recoveryAttempts += 1
          trace('retry.started', { attempt: recoveryAttempts })
          signalQueue = signalQueue
            .then(async () => {
              if (!polite) await negotiate(true)
              else sendSignal({ type: 'resync', target_peer_id: remotePeerId })
            })
            .catch(reportError)
          if (recoveryAttempts >= 5) {
            trace('retry.exhausted')
            setConnectionStatus('Unable to connect')
            setSessionError(
              'Unable to establish audio/video. Check your network and rejoin the room.',
            )
          } else scheduleRetry()
        },
        Math.min(5000 * 2 ** recoveryAttempts, 30000),
      )
    }
    setSessionError(null)
    setParticipants([])
    setDiag(INITIAL_DIAG)
    setConnectionStatus('Connecting')

    const reportError = (error?: unknown) => {
      if (disposed) return
      trace('session.error', errorDetails(error))
      setSessionError(
        'Session connection failed. Check your connection and rejoin the room.',
      )
      scheduleRetry('session-error')
    }
    const watchdog = setInterval(() => {
      if (
        localStreamRef.current &&
        (!subscribed || (remotePeerId && pc?.connectionState !== 'connected'))
      ) {
        trace('watchdog.media-not-connected')
        scheduleRetry('watchdog-media-not-connected')
      }
    }, 15000)

    const sendSignal = (payload: Record<string, unknown>) => {
      if (!descriptor || disposed) return
      trace('signal.send', { type: payload.type })
      void api('/api/v1/appointments/' + appointmentId + '/signals', {
        method: 'POST',
        data: { ...payload, generation: descriptor.generation },
      })
        .then(() => trace('signal.sent', { type: payload.type }))
        .catch((error: unknown) => {
          trace('signal.failed', { type: payload.type, ...errorDetails(error) })
          reportError(error)
        })
    }
    sendSignalRef.current = sendSignal

    const patchDiag = (patch: Partial<DiagState>) =>
      setDiag((previous) => ({ ...previous, ...patch }))

    const bindDataChannel = (next: RTCDataChannel) => {
      dcRef.current = next
      next.onopen = () => trace('data-channel.open')
      next.onmessage = (event: MessageEvent<string>) =>
        setMessages((previous) => [...previous, 'Peer: ' + event.data])
      next.onclose = () => {
        trace('data-channel.closed')
        if (dcRef.current === next) dcRef.current = null
      }
    }

    const negotiate = async (restart = false) => {
      trace('negotiation.requested', { restart })
      if (disposed || !pc || !remotePeerId || !subscribed || makingOffer) return
      const peer = pc
      const target = remotePeerId
      if (pc.signalingState === 'have-local-offer') {
        if (restart && pc.localDescription)
          sendSignal({
            type: 'offer',
            target_peer_id: remotePeerId,
            sdp: normalizeSdp(pc.localDescription.sdp),
          })
        return
      }
      if (
        pc.signalingState !== 'stable' ||
        (!restart && pc.connectionState === 'connected')
      )
        return
      makingOffer = true
      try {
        if (!dcRef.current) bindDataChannel(pc.createDataChannel('chat'))
        const offer = await pc.createOffer({ iceRestart: restart })
        if (isDisposed() || pc !== peer || remotePeerId !== target) return
        await peer.setLocalDescription(offer)
        if (isDisposed() || pc !== peer || remotePeerId !== target) return
        sendSignal({
          type: 'offer',
          target_peer_id: remotePeerId,
          sdp: normalizeSdp(peer.localDescription?.sdp ?? offer.sdp ?? ''),
        })
      } finally {
        makingOffer = false
      }
    }

    const applyCandidate = async (candidate: RTCIceCandidateInit) => {
      if (!pc) return
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
        trace('ice.applied')
      } catch (error) {
        trace('ice.rejected', errorDetails(error))
      }
    }

    const flushCandidates = async () => {
      if (!pc) return
      const candidates = pendingCandidates
      pendingCandidates = []
      for (const candidate of candidates) {
        await applyCandidate(candidate)
      }
    }

    const handleSignal = async (event: SignalEvent) => {
      trace('signal.received', {
        type: event.signal.type,
        fromExpectedPeer: event.sender_id === remotePeerId,
        forThisUser:
          !event.target_peer_id || event.target_peer_id === currentUserId,
      })
      if (
        !pc ||
        disposed ||
        event.sender_id !== remotePeerId ||
        (event.target_peer_id && event.target_peer_id !== currentUserId)
      )
        return
      const peer = pc
      const isCurrentPeer = () =>
        !disposed && pc === peer && event.sender_id === remotePeerId
      const signal = event.signal
      let operation = 'dispatch-' + signal.type
      try {
        if (signal.type === 'offer' && signal.sdp) {
          if (!polite && (makingOffer || pc.signalingState !== 'stable')) {
            trace('offer.ignored-collision')
            return
          }
          operation = 'set-remote-offer'
          await pc.setRemoteDescription({
            type: 'offer',
            sdp: normalizeSdp(signal.sdp),
          })
          if (!isCurrentPeer()) return
          operation = 'flush-ice-after-offer'
          await flushCandidates()
          if (!isCurrentPeer()) return
          operation = 'create-answer'
          const answer = await peer.createAnswer()
          if (!isCurrentPeer()) return
          operation = 'set-local-answer'
          await peer.setLocalDescription(answer)
          if (!isCurrentPeer()) return
          sendSignal({
            type: 'answer',
            target_peer_id: remotePeerId,
            sdp: normalizeSdp(peer.localDescription?.sdp ?? answer.sdp ?? ''),
          })
        } else if (signal.type === 'answer' && signal.sdp) {
          if (pc.signalingState !== 'have-local-offer') return
          operation = 'set-remote-answer'
          await pc.setRemoteDescription({
            type: 'answer',
            sdp: normalizeSdp(signal.sdp),
          })
          if (!isCurrentPeer()) return
          operation = 'flush-ice-after-answer'
          await flushCandidates()
        } else if (signal.type === 'ice_candidate' && signal.candidate) {
          setDiag((previous) => ({
            ...previous,
            candidatesRecv: previous.candidatesRecv + 1,
          }))
          if (pc.remoteDescription) {
            await applyCandidate(signal.candidate)
          } else pendingCandidates.push(signal.candidate)
        } else if (signal.type === 'ready' || signal.type === 'resync') {
          if (!polite) await negotiate(signal.type === 'resync')
        } else if (signal.type === 'chat_message' && signal.text) {
          setMessages((previous) => [...previous, 'Peer: ' + signal.text])
        } else if (signal.type === 'media_toggle' && signal.kind) {
          setPeerMedia((previous) => ({
            ...previous,
            [signal.kind as 'mic' | 'camera']: Boolean(signal.enabled),
          }))
        }
      } catch (error) {
        trace('negotiation.failed', {
          operation,
          signalType: signal.type,
          ...errorDetails(error),
        })
        throw error
      }
    }

    const start = async () => {
      try {
        if (!window.isSecureContext) {
          setPermission('insecure')
          return
        }
        descriptor = (
          await api<{ data: SessionDescriptor }>(
            '/api/v1/appointments/' + appointmentId + '/session',
            { method: 'POST' },
          )
        ).data
        trace('descriptor.received', {
          iceServerCount: descriptor.ice_servers.length,
        })
        if (!Number.isInteger(descriptor.generation)) {
          reportError()
          return
        }
        if (isDisposed()) return
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        })
        if (disposed) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        localStreamRef.current = stream
        trace('media.local-ready', {
          audioTracks: stream.getAudioTracks().length,
          videoTracks: stream.getVideoTracks().length,
        })
        setLocalStream(stream)
        setPermission('granted')
        setMicEnabled(stream.getAudioTracks().every((track) => track.enabled))
        setCameraEnabled(
          stream.getVideoTracks().every((track) => track.enabled),
        )
        const iceServers = descriptor.ice_servers
        const createPeer = () => {
          pc = new RTCPeerConnection({ iceServers })
          const peer = pc
          pcRef.current = pc
          stream.getTracks().forEach((track) => pc?.addTrack(track, stream))
          pc.onconnectionstatechange = () => {
            if (disposed || pc !== peer) return
            trace('peer.state')
            patchDiag({ pcConnection: peer.connectionState })
            if (peer.connectionState === 'connected') {
              if (retryTimer) clearTimeout(retryTimer)
              retryTimer = undefined
              recoveryAttempts = 0
              setConnectionStatus('Connected')
              setSessionError(null)
            } else if (
              peer.connectionState === 'failed' ||
              peer.connectionState === 'disconnected'
            )
              scheduleRetry('peer-' + peer.connectionState)
          }
          pc.onsignalingstatechange = () => {
            trace('signaling.state')
            patchDiag({ signalingState: peer.signalingState })
          }
          pc.oniceconnectionstatechange = () => {
            trace('ice.state')
            patchDiag({ iceConnection: peer.iceConnectionState })
          }
          pc.onicegatheringstatechange = () => {
            trace('ice.gathering')
            patchDiag({ iceGathering: peer.iceGatheringState })
          }
          pc.onicecandidate = (event) => {
            if (disposed || pc !== peer || !event.candidate) return
            trace('ice.local-candidate', {
              candidateType: event.candidate.type,
              protocol: event.candidate.protocol,
            })
            setDiag((previous) => ({
              ...previous,
              candidatesSent: previous.candidatesSent + 1,
            }))
            sendSignal({
              type: 'ice_candidate',
              target_peer_id: remotePeerId,
              candidate: event.candidate.toJSON(),
            })
          }
          pc.ontrack = (event) => {
            if (disposed || pc !== peer) return
            trace('media.remote-track', {
              kind: event.track.kind,
              muted: event.track.muted,
              readyState: event.track.readyState,
            })
            setRemoteStream((previous) => {
              const tracks =
                previous
                  ?.getTracks()
                  .filter((track) => track.kind !== event.track.kind) ?? []
              return new MediaStream([...tracks, event.track])
            })
            setDiag((previous) => ({
              ...previous,
              trackCount: previous.trackCount + 1,
            }))
          }
          pc.ondatachannel = (event) => bindDataChannel(event.channel)
        }
        createPeer()

        channelName = descriptor.channel
        const channel = echoInstance.join(channelName)
        channel
          .here((members: RoomMember[]) => {
            if (disposed) return
            subscribed = true
            trace('presence.snapshot', {
              memberCount: members.length,
              includesSelf: members.some(
                (member) => member.id === currentUserId,
              ),
            })
            setConnected(true)
            setParticipants(members)
            const peer = members.find((member) => member.id !== currentUserId)
            remotePeerId = peer?.id ?? null
            polite = Boolean(remotePeerId && currentUserId > remotePeerId)
            patchDiag({ polite, remotePeerId })
            if (remotePeerId) {
              if (!pc) createPeer()
              sendSignal({ type: 'ready', target_peer_id: remotePeerId })
              if (!polite)
                signalQueue = signalQueue
                  .then(() => negotiate())
                  .catch(reportError)
            } else setConnectionStatus('Waiting for participant')
          })
          .joining((member: RoomMember) => {
            if (disposed) return
            trace('presence.join', { isSelf: member.id === currentUserId })
            setParticipants((members) => [
              ...members.filter((entry) => entry.id !== member.id),
              member,
            ])
            if (member.id === currentUserId) return
            remotePeerId = member.id
            if (!pc) createPeer()
            polite = currentUserId > remotePeerId
            patchDiag({ remotePeerId })
            sendSignal({ type: 'ready', target_peer_id: remotePeerId })
            if (!polite)
              signalQueue = signalQueue
                .then(() => negotiate())
                .catch(reportError)
          })
          .leaving((member: RoomMember) => {
            if (disposed) return
            trace('presence.leave', { isPeer: member.id === remotePeerId })
            setParticipants((members) =>
              members.filter((entry) => entry.id !== member.id),
            )
            if (member.id !== remotePeerId) return
            remotePeerId = null
            if (retryTimer) clearTimeout(retryTimer)
            retryTimer = undefined
            recoveryAttempts = 0
            pendingCandidates = []
            if (pc) {
              pc.onconnectionstatechange = null
              pc.onicecandidate = null
              pc.ontrack = null
              pc.close()
            }
            pc = null
            pcRef.current = null
            dcRef.current?.close()
            dcRef.current = null
            setRemoteStream(null)
            setConnectionStatus('Waiting for participant')
            setPeerMedia({ mic: true, camera: true })
            patchDiag({ remotePeerId: null })
            if (remoteRef.current) remoteRef.current.srcObject = null
          })
          .listen('.SessionSignal', (event: SignalEvent) => {
            signalQueue = signalQueue
              .then(() => handleSignal(event))
              .catch(reportError)
          })
          .error(reportError)
      } catch (error) {
        trace('startup.failed', errorDetails(error))
        if (!disposed) setPermission('denied')
      }
    }

    void start()
    return () => {
      trace('session.cleanup')
      disposed = true
      clearInterval(watchdog)
      if (retryTimer) clearTimeout(retryTimer)
      sendSignalRef.current = () => {}
      if (channelName) echoInstance.leaveChannel('presence-' + channelName)
      localStreamRef.current?.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
      dcRef.current?.close()
      dcRef.current = null
      pcRef.current?.close()
      pcRef.current = null
      setLocalStream(null)
      setRemoteStream(null)
      setConnected(false)
    }
  }, [appointmentId, currentUserId])

  const sendMediaToggle = (kind: 'mic' | 'camera', enabled: boolean) =>
    sendSignalRef.current({
      type: 'media_toggle',
      target_peer_id: diag.remotePeerId,
      kind,
      enabled,
    })

  const toggleMic = () => {
    const next = !micEnabled
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = next
    })
    setMicEnabled(next)
    sendMediaToggle('mic', next)
  }

  const toggleCamera = () => {
    const next = !cameraEnabled
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = next
    })
    setCameraEnabled(next)
    sendMediaToggle('camera', next)
  }

  const sendChat = (text: string) => {
    if (!text.trim()) return
    if (dcRef.current?.readyState === 'open') dcRef.current.send(text)
    else
      sendSignalRef.current({
        type: 'chat_message',
        target_peer_id: diag.remotePeerId,
        text,
      })
    setMessages((previous) => [...previous, 'You: ' + text])
  }

  return {
    localRef,
    remoteRef,
    messages,
    connected,
    sessionError,
    participants,
    connectionStatus,
    playbackBlocked,
    playRemote,
    diag,
    permission,
    hasPeer: Boolean(diag.remotePeerId),
    micEnabled,
    cameraEnabled,
    peerMedia,
    toggleMic,
    toggleCamera,
    sendChat,
  }
}
