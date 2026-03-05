// ── Session room types (mirrors server/src/modules/session/model.ts) ──────────

export type SessionRole = 'clinician' | 'patient'

export interface SessionParticipant {
  userId: string
  role: SessionRole
}

// ── Outbound (client → server) ────────────────────────────────────────────────

export interface SendChatMessage {
  type: 'chat:message'
  text: string
}

export interface SendWebRtcOffer {
  type: 'webrtc:offer'
  sdp: string
}

export interface SendWebRtcAnswer {
  type: 'webrtc:answer'
  sdp: string
}

export interface SendWebRtcIceCandidate {
  type: 'webrtc:ice-candidate'
  candidate: string
  sdpMid: string | null
  sdpMLineIndex: number | null
}

export interface SendMediaToggle {
  type: 'media:toggle'
  kind: 'camera' | 'mic'
  enabled: boolean
}

export interface SendPeerReady {
  type: 'peer:ready'
}

export type ClientMessage =
  | SendChatMessage
  | SendWebRtcOffer
  | SendWebRtcAnswer
  | SendWebRtcIceCandidate
  | SendMediaToggle
  | SendPeerReady

// ── Inbound (server → client) ─────────────────────────────────────────────────

export interface ServerRoomJoined {
  type: 'room:joined'
  userId: string
  role: SessionRole
  participants: Array<SessionParticipant>
}

export interface ServerRoomLeft {
  type: 'room:left'
  userId: string
}

export interface ServerRoomError {
  type: 'room:error'
  message: string
}

export interface ServerChatMessage {
  type: 'chat:message'
  from: string
  role: SessionRole
  text: string
  timestamp: string
}

export interface ServerWebRtcOffer {
  type: 'webrtc:offer'
  from: string
  sdp: string
}

export interface ServerWebRtcAnswer {
  type: 'webrtc:answer'
  from: string
  sdp: string
}

export interface ServerWebRtcIceCandidate {
  type: 'webrtc:ice-candidate'
  from: string
  candidate: string
  sdpMid: string | null
  sdpMLineIndex: number | null
}

export interface ServerMediaToggle {
  type: 'media:toggle'
  from: string
  kind: 'camera' | 'mic'
  enabled: boolean
}

export interface ServerPeerReady {
  type: 'peer:ready'
  from: string
}

export type ServerMessage =
  | ServerRoomJoined
  | ServerRoomLeft
  | ServerRoomError
  | ServerChatMessage
  | ServerWebRtcOffer
  | ServerWebRtcAnswer
  | ServerWebRtcIceCandidate
  | ServerMediaToggle
  | ServerPeerReady

// ── Chat display model ─────────────────────────────────────────────────────────

export interface ChatEntry {
  id: string
  from: string
  role: SessionRole
  text: string
  timestamp: string
  isSelf: boolean
}

// ── Peer media state (what the remote peer has toggled) ───────────────────────

export interface PeerMediaState {
  camera: boolean
  mic: boolean
}
