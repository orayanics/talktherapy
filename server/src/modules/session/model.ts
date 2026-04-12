import { t } from "elysia";

export type JoinTokenClaims = {
  appointmentId: string;
  roomId: string;
  userId: string;
  exp: number;
  n: string;
};

export type SocketMeta = {
  roomId: string | null;
  peerId: string;
  user: unknown;
  auth: JoinTokenClaims | null;
};

export interface WSSender {
  send: (data: string | ArrayBuffer | Uint8Array) => void;
}

export type ElysiaWS = {
  raw: WSSender;
  data: Record<string | symbol, any>;
  send: (data: string) => void;
  close: (code?: number, reason?: string) => void;
};

export type ExistingPeer = {
  peerId: string;
  user: unknown;
};

export type Participant = {
  ws: WSSender;
  peerId: string;
  userId: string;
  user: unknown;
};

export const JoinBody = t.Object({
  type: t.Literal("join"),
  room: t.String(),
  user: t.Optional(t.Any()),
});

export const LeaveBody = t.Object({
  type: t.Literal("leave"),
});

export const WebRtcOfferBody = t.Object({
  type: t.Literal("webrtc:offer"),
  sdp: t.Object({
    type: t.String(),
    sdp: t.String(),
  }),
});

export const WebRtcAnswerBody = t.Object({
  type: t.Literal("webrtc:answer"),
  sdp: t.Object({
    type: t.String(),
    sdp: t.String(),
  }),
});

export const WebRtcIceCandidateBody = t.Object({
  type: t.Literal("webrtc:ice-candidate"),
  candidate: t.Object({
    candidate: t.String(),
    sdpMid: t.Optional(t.Nullable(t.String())),
    sdpMLineIndex: t.Optional(t.Nullable(t.Number())),
    usernameFragment: t.Optional(t.Nullable(t.String())),
  }),
});

export const ChatMessageBody = t.Object({
  type: t.Literal("chat:message"),
  text: t.String({ minLength: 1, maxLength: 2000 }),
});

export const MediaToggleBody = t.Object({
  type: t.Literal("media:toggle"),
  kind: t.Union([t.Literal("camera"), t.Literal("mic")]),
  enabled: t.Boolean(),
});

export const PeerReadyBody = t.Object({
  type: t.Literal("peer:ready"),
});

export const InboundMessage = t.Union([
  JoinBody,
  LeaveBody,
  WebRtcOfferBody,
  WebRtcAnswerBody,
  WebRtcIceCandidateBody,
  ChatMessageBody,
  MediaToggleBody,
  PeerReadyBody,
]);

export type InboundMessageType = typeof InboundMessage.static;

export type OutboundMessage =
  | {
      type: "room:joined";
      peerId: string;
      existingPeers: ExistingPeer[];
    }
  | {
      type: "room:peer-joined";
      peerId: string;
      user: unknown;
    }
  | {
      type: "room:peer-left";
      peerId: string;
    }
  | {
      type: "room:resync";
      peerId: string;
      reason: "peer-joined" | "peer-rejoined";
    }
  | {
      type: "room:error";
      message: string;
    }
  | {
      type: "webrtc:offer";
      from: string;
      sdp: { type: string; sdp: string };
    }
  | {
      type: "webrtc:answer";
      from: string;
      sdp: { type: string; sdp: string };
    }
  | {
      type: "webrtc:ice-candidate";
      from: string;
      candidate: {
        candidate: string;
        sdpMid?: string | null;
        sdpMLineIndex?: number | null;
        usernameFragment?: string | null;
      };
    }
  | {
      type: "chat:message";
      from: string;
      user: unknown;
      text: string;
      timestamp: string;
    }
  | {
      type: "media:toggle";
      from: string;
      kind: "camera" | "mic";
      enabled: boolean;
    }
  | {
      type: "peer:ready";
      from: string;
    };
