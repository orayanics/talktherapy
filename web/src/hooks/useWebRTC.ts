import { useCallback, useEffect, useRef, useState } from 'react'
import type { ClientMessage } from '~/models/session'

export type RTCConnectionState = RTCPeerConnectionState | 'idle'

export interface UseWebRTCOptions {
  // Polite: offers first, rolls back on collision. Impolite: answers first, ignores offers during collision.
  // Improvements: could potentially infer this from the signaling flow instead of hardcoding roles.
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
  handlePeerReady: () => Promise<void> // Call when peer signals is ready
  handleOffer: (sdp: string) => Promise<void> // Call with the remote SDP offer
  handleAnswer: (sdp: string) => Promise<void> // Call with the remote SDP answer
  handleIceCandidate: (
    candidate: string,
    sdpMid: string | null,
    sdpMLineIndex: number | null,
  ) => Promise<void> // Call with a remote ICE candidate
}

const ICE_SERVERS: Array<RTCIceServer> = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
]

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

  // Initial: get user media, create peer connection, set up handlers. Cleanup on unmount.
  useEffect(() => {
    let cancelled = false

    const setup = async () => {
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

      // Remote stream and track
      const remoteMediaStream = new MediaStream()
      setRemoteStream(remoteMediaStream)

      pc.ontrack = ({ track }) => {
        remoteMediaStream.addTrack(track)
        setRemoteStream(new MediaStream(remoteMediaStream.getTracks()))
      }

      // ICE candidates: send to peer when found
      pc.onicecandidate = ({ candidate }) => {
        if (!candidate) return
        sendRef.current({
          type: 'webrtc:ice-candidate',
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid ?? null,
          sdpMLineIndex: candidate.sdpMLineIndex ?? null,
        })
      }

      // Polite: negotiation needed to send initial offer when peer joins, and to renegotiate if tracks change
      // Impolite: only needed to renegotiate on track changes, since we wait for peer's offer before sending ours
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
  // Signaling flow: peer joins -> signals ready -> polite peer offers -> answer -> ICE candidates

  // handlePeerReady
  // -> polite peer create and send offer
  // -> offer collision check
  // -> set hasPeer true so future onnegotiationneeded will send offers
  const handlePeerReady = useCallback(async () => {
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

  // handleOffer
  // -> offer collision check (if we're already making an offer or not stable, we might be in a collision)
  // -> if impolite and collision, ignore the offer (wait for peer to resend after their negotiation completes)
  // -> otherwise, set remote description, create and send answer
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

  // handleAnswer
  // -> set remote description
  const handleAnswer = useCallback(async (sdp: string) => {
    const pc = pcRef.current
    if (!pc || ignoreOffer.current) return
    try {
      await pc.setRemoteDescription({ type: 'answer', sdp })
    } catch (err) {
      console.error('[webrtc] handleAnswer error:', err)
    }
  }, [])

  // If we're ignoring offers (in an offer collision as the impolite peer),
  // ignore candidates too since they may be from the discarded offer
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
