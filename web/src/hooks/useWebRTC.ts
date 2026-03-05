import { useCallback, useEffect, useRef, useState } from 'react'
import type { ClientMessage } from '~/models/session'

export type RTCConnectionState = RTCPeerConnectionState | 'idle'

export interface UseWebRTCOptions {
  /**
   * Whether this peer is the "polite" peer in the perfect negotiation pattern.
   * The polite peer offers first and is willing to roll back on collision.
   * Convention: clinician = impolite (false), patient = polite (true).
   */
  polite: boolean
  send: (msg: ClientMessage) => void
}

export interface UseWebRTCReturn {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  connectionState: RTCConnectionState
  cameraEnabled: boolean
  micEnabled: boolean
  toggleCamera: () => void
  toggleMic: () => void
  /** Call when the other peer signals they're ready (peer:ready received) */
  handlePeerReady: () => Promise<void>
  /** Call with the remote SDP offer */
  handleOffer: (sdp: string) => Promise<void>
  /** Call with the remote SDP answer */
  handleAnswer: (sdp: string) => Promise<void>
  /** Call with a remote ICE candidate */
  handleIceCandidate: (
    candidate: string,
    sdpMid: string | null,
    sdpMLineIndex: number | null,
  ) => Promise<void>
}

const ICE_SERVERS: Array<RTCIceServer> = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
]

/**
 * Manages a WebRTC peer connection for a 1-to-1 therapy session.
 *
 * Signaling is delegated back to the caller via the `send` callback,
 * which should forward messages through the session WebSocket.
 */
export function useWebRTC({ polite, send }: UseWebRTCOptions): UseWebRTCReturn {
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const makingOffer = useRef(false)
  const ignoreOffer = useRef(false)
  const hasPeer = useRef(false)
  const sendRef = useRef(send)

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [connectionState, setConnectionState] =
    useState<RTCConnectionState>('idle')
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)

  // Keep send ref fresh
  useEffect(() => {
    sendRef.current = send
  }, [send])

  // ── Bootstrap: get user media and create RTCPeerConnection ─────────────────
  useEffect(() => {
    let cancelled = false

    const setup = async () => {
      // Acquire local media
      // navigator.mediaDevices is undefined on insecure (non-HTTPS) origins.
      // eslint-disable-next-line
      if (!navigator.mediaDevices?.getUserMedia) {
        console.error(
          '[webrtc] getUserMedia unavailable — page must be served over HTTPS or localhost',
        )
        return
      }
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
      } catch (err) {
        console.error('[webrtc] getUserMedia failed:', err)
        // Try audio-only fallback
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          })
          setCameraEnabled(false)
        } catch {
          console.error('[webrtc] audio fallback also failed')
          return
        }
      }

      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }

      setLocalStream(stream)

      // Create peer connection
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
      pcRef.current = pc

      // Add local tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      // ── Remote track handler ───────────────────────────────────────────────
      const remoteMediaStream = new MediaStream()
      setRemoteStream(remoteMediaStream)

      pc.ontrack = ({ track }) => {
        remoteMediaStream.addTrack(track)
        setRemoteStream(new MediaStream(remoteMediaStream.getTracks()))
      }

      // ── ICE candidate handler ──────────────────────────────────────────────
      pc.onicecandidate = ({ candidate }) => {
        if (!candidate) return
        sendRef.current({
          type: 'webrtc:ice-candidate',
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid ?? null,
          sdpMLineIndex: candidate.sdpMLineIndex ?? null,
        })
      }

      // ── Negotiation needed (re-offer on track changes after peer joins) ──────
      pc.onnegotiationneeded = async () => {
        if (!hasPeer.current) return // no peer yet, skip
        try {
          makingOffer.current = true
          await pc.setLocalDescription()
          sendRef.current({
            type: 'webrtc:offer',
            sdp: pc.localDescription!.sdp,
          })
        } catch (err) {
          console.error('[webrtc] onnegotiationneeded error:', err)
        } finally {
          makingOffer.current = false
        }
      }

      // ── Connection state ───────────────────────────────────────────────────
      pc.onconnectionstatechange = () => {
        setConnectionState(pc.connectionState)
      }
    }

    setup()

    return () => {
      cancelled = true
      pcRef.current?.close()
      pcRef.current = null
    }
  }, [])

  // ── Signaling handlers ─────────────────────────────────────────────────────

  /** Called when the peer signals they're ready — we initiate the offer */
  const handlePeerReady = useCallback(async () => {
    // Set hasPeer BEFORE the null check so that if the PC isn't created yet
    // (getUserMedia still running), onnegotiationneeded will see it as true
    // when it fires after tracks are added, and will send the offer then.
    hasPeer.current = true
    const pc = pcRef.current
    if (!pc) return // onnegotiationneeded will handle offer creation once PC is ready
    try {
      makingOffer.current = true
      await pc.setLocalDescription()
      sendRef.current({ type: 'webrtc:offer', sdp: pc.localDescription!.sdp })
    } catch (err) {
      console.error('[webrtc] handlePeerReady error:', err)
    } finally {
      makingOffer.current = false
    }
  }, [])

  /** Process a received offer. Creates an answer and sends it back. */
  const handleOffer = useCallback(
    async (sdp: string) => {
      const pc = pcRef.current
      if (!pc) return

      hasPeer.current = true
      const offerCollision =
        makingOffer.current || pc.signalingState !== 'stable'
      ignoreOffer.current = !polite && offerCollision
      if (ignoreOffer.current) return

      await pc.setRemoteDescription({ type: 'offer', sdp })
      await pc.setLocalDescription()
      sendRef.current({ type: 'webrtc:answer', sdp: pc.localDescription!.sdp })
    },
    [polite],
  )

  /** Process a received answer. */
  const handleAnswer = useCallback(async (sdp: string) => {
    const pc = pcRef.current
    if (!pc || ignoreOffer.current) return
    try {
      await pc.setRemoteDescription({ type: 'answer', sdp })
    } catch (err) {
      console.error('[webrtc] handleAnswer error:', err)
    }
  }, [])

  /** Add a remote ICE candidate. */
  const handleIceCandidate = useCallback(
    async (
      candidate: string,
      sdpMid: string | null,
      sdpMLineIndex: number | null,
    ) => {
      const pc = pcRef.current
      if (!pc) return
      try {
        await pc.addIceCandidate(
          new RTCIceCandidate({
            candidate,
            sdpMid: sdpMid ?? undefined,
            sdpMLineIndex: sdpMLineIndex ?? undefined,
          }),
        )
      } catch (err) {
        if (!ignoreOffer.current) {
          console.error('[webrtc] addIceCandidate error:', err)
        }
      }
    },
    [],
  )

  // ── Media toggles ──────────────────────────────────────────────────────────

  const toggleCamera = useCallback(() => {
    const stream = localStream
    if (!stream) return
    const enabled = !cameraEnabled
    stream.getVideoTracks().forEach((t) => {
      t.enabled = enabled
    })
    setCameraEnabled(enabled)
    sendRef.current({ type: 'media:toggle', kind: 'camera', enabled })
  }, [localStream, cameraEnabled])

  const toggleMic = useCallback(() => {
    const stream = localStream
    if (!stream) return
    const enabled = !micEnabled
    stream.getAudioTracks().forEach((t) => {
      t.enabled = enabled
    })
    setMicEnabled(enabled)
    sendRef.current({ type: 'media:toggle', kind: 'mic', enabled })
  }, [localStream, micEnabled])

  return {
    localStream,
    remoteStream,
    connectionState,
    cameraEnabled,
    micEnabled,
    toggleCamera,
    toggleMic,
    handlePeerReady,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
  }
}
