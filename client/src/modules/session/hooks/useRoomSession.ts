import { useEffect, useRef, useState } from 'react'
import { api } from '#/lib/api/client'
import { useSession } from '#/modules/auth/context/SessionContext'
import { echo } from '@laravel/echo-react'
import '#/modules/notifications/api/echo'

export function buildWssUrl() {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  const port = location.port ? ':' + location.port : ''
  return protocol + '//' + location.hostname + port
}

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
  iceConnection: '—', iceGathering: '—', pcConnection: '—', signalingState: '—',
  candidatesSent: 0, candidatesRecv: 0, trackCount: 0, polite: null, remotePeerId: null,
}

export type PermissionState = 'prompting' | 'granted' | 'denied' | 'insecure'
type PeerMediaState = { mic: boolean; camera: boolean }
type SessionDescriptor = { channel: string; generation: number; user_id: string; ice_servers: RTCIceServer[] }
type SignalEvent = {
  sender_id: string
  target_peer_id: string | null
  signal: {
    type: 'offer' | 'answer' | 'ice_candidate' | 'ready' | 'media_toggle' | 'chat_message' | 'resync'
    sdp?: string
    candidate?: RTCIceCandidateInit
    kind?: 'mic' | 'camera'
    enabled?: boolean
    text?: string
  }
}

export function useRoomSession(appointmentId: string) {
  const { id: currentUserId } = useSession()
  const localRef = useRef<HTMLVideoElement | null>(null)
  const remoteRef = useRef<HTMLVideoElement | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const sendSignalRef = useRef<(payload: Record<string, unknown>) => void>(() => {})
  const [messages, setMessages] = useState<string[]>([])
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [connected, setConnected] = useState(false)
  const [diag, setDiag] = useState<DiagState>(INITIAL_DIAG)
  const [permission, setPermission] = useState<PermissionState>('prompting')
  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [peerMedia, setPeerMedia] = useState<PeerMediaState>({ mic: true, camera: true })

  useEffect(() => {
    if (localRef.current) localRef.current.srcObject = localStream
  }, [localStream])

  useEffect(() => {
    const echoInstance = echo()
    let disposed = false
    let descriptor: SessionDescriptor | null = null
    let channelName: string | null = null
    let channel: ReturnType<typeof echoInstance.join> | null = null
    let pc: RTCPeerConnection | null = null
    let remotePeerId: string | null = null
    let polite = false
    let makingOffer = false
    let pendingCandidates: RTCIceCandidateInit[] = []

    const sendSignal = (payload: Record<string, unknown>) => {
      if (!descriptor || disposed) return
      void api('/api/v1/appointments/' + appointmentId + '/signals', {
        method: 'POST',
        data: { ...payload, generation: descriptor.generation },
      }).catch(() => {})
    }
    sendSignalRef.current = sendSignal

    const patchDiag = (patch: Partial<DiagState>) =>
      setDiag((previous) => ({ ...previous, ...patch }))

    const bindDataChannel = (next: RTCDataChannel) => {
      dcRef.current = next
      next.onmessage = (event: MessageEvent<string>) =>
        setMessages((previous) => [...previous, 'Peer: ' + event.data])
      next.onclose = () => { if (dcRef.current === next) dcRef.current = null }
    }

    const negotiate = async () => {
      if (!pc || !remotePeerId || makingOffer || pc.signalingState !== 'stable') return
      makingOffer = true
      try {
        if (!dcRef.current) bindDataChannel(pc.createDataChannel('chat'))
        const offer = await pc.createOffer({ iceRestart: true })
        await pc.setLocalDescription(offer)
        sendSignal({ type: 'offer', target_peer_id: remotePeerId, sdp: offer.sdp })
      } finally {
        makingOffer = false
      }
    }

    const flushCandidates = async () => {
      if (!pc) return
      const candidates = pendingCandidates
      pendingCandidates = []
      for (const candidate of candidates) {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)) } catch {}
      }
    }

    const handleSignal = async (event: SignalEvent) => {
      if (!pc || event.sender_id === currentUserId || (event.target_peer_id && event.target_peer_id !== currentUserId)) return
      if (event.sender_id !== remotePeerId) {
        remotePeerId = event.sender_id
        patchDiag({ remotePeerId })
      }
      const signal = event.signal
      if (signal.type === 'offer' && signal.sdp) {
        if (!polite && (makingOffer || pc.signalingState !== 'stable')) return
        await pc.setRemoteDescription({ type: 'offer', sdp: signal.sdp })
        await flushCandidates()
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        sendSignal({ type: 'answer', target_peer_id: remotePeerId, sdp: answer.sdp })
      } else if (signal.type === 'answer' && signal.sdp) {
        await pc.setRemoteDescription({ type: 'answer', sdp: signal.sdp })
        await flushCandidates()
      } else if (signal.type === 'ice_candidate' && signal.candidate) {
          setDiag((previous) => ({ ...previous, candidatesRecv: previous.candidatesRecv + 1 }))
        if (pc.remoteDescription) {
          try { await pc.addIceCandidate(new RTCIceCandidate(signal.candidate)) } catch {}
        } else pendingCandidates.push(signal.candidate)
      } else if (signal.type === 'ready' || signal.type === 'resync') {
        if (!polite) void negotiate()
      } else if (signal.type === 'chat_message' && signal.text) {
        setMessages((previous) => [...previous, 'Peer: ' + signal.text])
      } else if (signal.type === 'media_toggle' && signal.kind) {
        setPeerMedia((previous) => ({ ...previous, [signal.kind as 'mic' | 'camera']: Boolean(signal.enabled) }))
      }
    }

    const start = async () => {
      try {
        if (!window.isSecureContext) {
          setPermission('insecure')
          return
        }
        descriptor = (await api<{ data: SessionDescriptor }>('/api/v1/appointments/' + appointmentId + '/session', { method: 'POST' })).data
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        if (disposed) return
        localStreamRef.current = stream
        setLocalStream(stream)
        setPermission('granted')
        setMicEnabled(stream.getAudioTracks().every((track) => track.enabled))
        setCameraEnabled(stream.getVideoTracks().every((track) => track.enabled))
        pc = new RTCPeerConnection({ iceServers: descriptor.ice_servers })
        pcRef.current = pc
        stream.getTracks().forEach((track) => pc?.addTrack(track, stream))
        pc.onconnectionstatechange = () => patchDiag({ pcConnection: pc?.connectionState ?? '—' })
        pc.onsignalingstatechange = () => patchDiag({ signalingState: pc?.signalingState ?? '—' })
        pc.oniceconnectionstatechange = () => patchDiag({ iceConnection: pc?.iceConnectionState ?? '—' })
        pc.onicegatheringstatechange = () => patchDiag({ iceGathering: pc?.iceGatheringState ?? '—' })
        pc.onicecandidate = (event) => {
          if (!event.candidate) return
          setDiag((previous) => ({ ...previous, candidatesSent: previous.candidatesSent + 1 }))
          sendSignal({ type: 'ice_candidate', target_peer_id: remotePeerId, candidate: event.candidate.toJSON() })
        }
        pc.ontrack = (event) => {
          const video = remoteRef.current
          if (!video) return
          video.srcObject = event.streams[0] ?? video.srcObject
          void video.play().catch(() => {})
        }
        pc.ondatachannel = (event) => bindDataChannel(event.channel)

        channelName = descriptor.channel
        channel = echoInstance.join(channelName)
        channel.here((members: Array<{ id: string }>) => {
          setConnected(true)
          const peer = members.find((member) => member.id !== currentUserId)
          remotePeerId = peer?.id ?? null
          polite = Boolean(remotePeerId)
          patchDiag({ polite, remotePeerId })
          if (remotePeerId && !polite) void negotiate()
        }).joining((member: { id: string }) => {
          if (member.id === currentUserId) return
          remotePeerId = member.id
          patchDiag({ remotePeerId })
          sendSignal({ type: 'ready', target_peer_id: remotePeerId })
          if (!polite) void negotiate()
        }).leaving((member: { id: string }) => {
          if (member.id !== remotePeerId) return
          remotePeerId = null
          setPeerMedia({ mic: true, camera: true })
          patchDiag({ remotePeerId: null })
          if (remoteRef.current) remoteRef.current.srcObject = null
        }).listen('.SessionSignal', (event: SignalEvent) => { void handleSignal(event) })
        sendSignal({ type: 'ready', target_peer_id: remotePeerId })
      } catch {
        if (!disposed) setPermission('denied')
      }
    }

    void start()
    return () => {
      disposed = true
      sendSignalRef.current = () => {}
      if (channelName) echoInstance.leaveChannel(channelName)
      localStreamRef.current?.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
      dcRef.current?.close()
      pcRef.current?.close()
      setLocalStream(null)
      setConnected(false)
    }
  }, [appointmentId, currentUserId])

  const sendMediaToggle = (kind: 'mic' | 'camera', enabled: boolean) =>
    sendSignalRef.current({ type: 'media_toggle', target_peer_id: diag.remotePeerId, kind, enabled })

  const toggleMic = () => {
    const next = !micEnabled
    localStreamRef.current?.getAudioTracks().forEach((track) => { track.enabled = next })
    setMicEnabled(next)
    sendMediaToggle('mic', next)
  }

  const toggleCamera = () => {
    const next = !cameraEnabled
    localStreamRef.current?.getVideoTracks().forEach((track) => { track.enabled = next })
    setCameraEnabled(next)
    sendMediaToggle('camera', next)
  }

  const sendChat = (text: string) => {
    if (!text.trim()) return
    if (dcRef.current?.readyState === 'open') dcRef.current.send(text)
    else sendSignalRef.current({ type: 'chat_message', target_peer_id: diag.remotePeerId, text })
    setMessages((previous) => [...previous, 'You: ' + text])
  }

  return { localRef, remoteRef, messages, connected, diag, permission, hasPeer: Boolean(diag.remotePeerId), micEnabled, cameraEnabled, peerMedia, toggleMic, toggleCamera, sendChat }
}
