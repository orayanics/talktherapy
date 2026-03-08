import { t } from "elysia";

// ── Inbound message schemas ──────────────────────────────────────────────────

export const ChatMessageBody = t.Object({
  type: t.Literal("chat:message"),
  text: t.String({ minLength: 1, maxLength: 2000 }),
});

export const WebRtcOfferBody = t.Object({
  type: t.Literal("webrtc:offer"),
  sdp: t.String(),
});

export const WebRtcAnswerBody = t.Object({
  type: t.Literal("webrtc:answer"),
  sdp: t.String(),
});

export const WebRtcIceCandidateBody = t.Object({
  type: t.Literal("webrtc:ice-candidate"),
  candidate: t.String(),
  sdpMid: t.Optional(t.Nullable(t.String())),
  sdpMLineIndex: t.Optional(t.Nullable(t.Number())),
});

export const MediaToggleBody = t.Object({
  type: t.Literal("media:toggle"),
  kind: t.Union([t.Literal("camera"), t.Literal("mic")]),
  enabled: t.Boolean(),
});

export const PeerReadyBody = t.Object({
  type: t.Literal("peer:ready"),
});

/** Union of all valid client → server message shapes */
export const InboundMessage = t.Union([
  ChatMessageBody,
  WebRtcOfferBody,
  WebRtcAnswerBody,
  WebRtcIceCandidateBody,
  MediaToggleBody,
  PeerReadyBody,
]);

// ── Outbound message types (sent from server to clients) ─────────────────────
// These are plain TS types — serialised as JSON on the wire.

export interface OutboundRoomJoined {
  type: "room:joined";
  userId: string;
  role: "clinician" | "patient";
  participants: Array<{ userId: string; role: "clinician" | "patient" }>;
}

export interface OutboundRoomLeft {
  type: "room:left";
  userId: string;
}

export interface OutboundRoomError {
  type: "room:error";
  message: string;
}

export interface OutboundChatMessage {
  type: "chat:message";
  from: string;
  role: "clinician" | "patient";
  text: string;
  timestamp: string;
}

export interface OutboundWebRtcOffer {
  type: "webrtc:offer";
  from: string;
  sdp: string;
}

export interface OutboundWebRtcAnswer {
  type: "webrtc:answer";
  from: string;
  sdp: string;
}

export interface OutboundWebRtcIceCandidate {
  type: "webrtc:ice-candidate";
  from: string;
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
}

export interface OutboundMediaToggle {
  type: "media:toggle";
  from: string;
  kind: "camera" | "mic";
  enabled: boolean;
}

export interface OutboundPeerReady {
  type: "peer:ready";
  from: string;
}

export type OutboundMessage =
  | OutboundRoomJoined
  | OutboundRoomLeft
  | OutboundRoomError
  | OutboundChatMessage
  | OutboundWebRtcOffer
  | OutboundWebRtcAnswer
  | OutboundWebRtcIceCandidate
  | OutboundMediaToggle
  | OutboundPeerReady;
