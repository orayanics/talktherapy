import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'

import type { ClientMessage, SessionParticipant } from '~/models/session'
import { useSession } from '~/context/SessionContext'
import { useWebRTC } from '~/hooks/useWebRTC'
import { useSessionSocket } from '~/hooks/useSessionSocket'

export interface SessionRoomState {
  // Media & RTC
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  connectionState: string
  cameraEnabled: boolean
  micEnabled: boolean
  toggleCamera: () => void
  toggleMic: () => void

  // Socket
  wsStatus: string
  participants: Array<SessionParticipant>
  chatMessages: ReturnType<typeof useSessionSocket>['chatMessages']
  peerMediaState: ReturnType<typeof useSessionSocket>['peerMediaState']

  // Chat
  sendChat: (text: string) => void

  // Call control
  endCall: () => void

  // Derived display info
  hasPeer: boolean
  peerLabel: string
  localLabel: string
  isPatient: boolean
}

export function useSessionRoom(roomId: string): SessionRoomState {
  const session = useSession()
  const navigate = useNavigate()

  const isPatient = session.account_role === 'patient'

  // A stable thunk that forwards to whichever `socketSend` function is current.
  // This breaks the circular dependency between useWebRTC (needs to send SDP /
  // ICE messages) and useSessionSocket (provides the send function) without
  // either hook directly importing the other.
  const sendRef = useRef<((msg: ClientMessage) => void) | null>(null)
  const sendStable = useCallback(
    (msg: ClientMessage) => sendRef.current?.(msg),
    [],
  )

  // WebRTC management: local/remote streams, connection state, toggles, and
  // handlers for incoming signaling messages.
  const {
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
  } = useWebRTC({ polite: isPatient, send: sendStable })

  // Session socket: connection status, participants, chat messages, peer media state,
  // and the send function for signaling and chat messages.
  const {
    status: wsStatus,
    participants,
    chatMessages,
    peerMediaState,
    send: socketSend,
  } = useSessionSocket({
    roomId,
    userId: session.id,
    onPeerReady: handlePeerReady,
    onOffer: handleOffer,
    onAnswer: handleAnswer,
    onIceCandidate: handleIceCandidate,
  })

  // Keep the stable send ref pointing at the latest socket send function.
  useEffect(() => {
    sendRef.current = socketSend
  }, [socketSend])

  // Signal readiness once the WebSocket is open AND local media has been
  // acquired.  Waiting for localStream ensures the RTCPeerConnection is fully
  // initialised, so the remote peer can safely respond with an offer/answer.
  useEffect(() => {
    if (wsStatus === 'open' && localStream) {
      socketSend({ type: 'peer:ready' })
    }
  }, [wsStatus, localStream, socketSend])

  const sendChat = useCallback(
    (text: string) => socketSend({ type: 'chat:message', text }),
    [socketSend],
  )

  const endCall = useCallback(() => {
    localStream?.getTracks().forEach((track) => track.stop())
    void navigate({ to: '/dashboard' })
  }, [localStream, navigate])

  const peer: SessionParticipant | undefined = participants.find(
    (p) => p.userId !== session.id,
  )
  const hasPeer = peer !== undefined
  const peerLabel = peer
    ? peer.role === 'clinician'
      ? 'Clinician'
      : 'Patient'
    : 'Participant'
  const localLabel = isPatient ? 'You (Patient)' : 'You (Clinician)'

  return {
    localStream,
    remoteStream,
    connectionState,
    cameraEnabled,
    micEnabled,
    toggleCamera,
    toggleMic,
    wsStatus,
    participants,
    chatMessages,
    peerMediaState,
    sendChat,
    endCall,
    hasPeer,
    peerLabel,
    localLabel,
    isPatient,
  }
}
