import { Elysia, t } from "elysia";
import { verifyJoinToken } from "@/lib/joinToken";
import { InboundMessage } from "./model";
import type { ElysiaWS, InboundMessageType, SocketMeta } from "./model";
import { SessionService } from "./service";

const META = Symbol("ws-meta");

const getMeta = (ws: ElysiaWS): SocketMeta => {
  if (!ws.data[META]) {
    ws.data[META] = {
      roomId: null,
      peerId: crypto.randomUUID(),
      user: null,
      auth: null,
    } satisfies SocketMeta;
  }
  return ws.data[META] as SocketMeta;
};

const leaveRoom = (ws: ElysiaWS) => {
  const meta = getMeta(ws);
  if (!meta.roomId) return;

  SessionService.leave(meta.roomId, meta.peerId);
  SessionService.broadcast(meta.roomId, {
    type: "room:peer-left",
    peerId: meta.peerId,
  });

  meta.roomId = null;
};

const requireJoinedAndAuthorized = async (meta: SocketMeta) => {
  if (!meta.roomId || !meta.auth) return false;
  return SessionService.authorizeRoom(meta.roomId, meta.auth.userId);
};

export const sessionModule = new Elysia({ prefix: "/session" })
  .get("/ws", () => "WebSocket endpoint")
  .ws("/ws", {
    query: t.Object({
      token: t.String(),
    }),
    body: InboundMessage,

    open: (ws) => {
      const meta = getMeta(ws);
      try {
        const claims = verifyJoinToken(ws.data.query.token);
        meta.auth = claims;
      } catch {
        ws.close(4001, "Unauthorized");
        return;
      }
      console.log("ws open:", meta.peerId);
    },

    message: async (ws, body: InboundMessageType) => {
      const meta = getMeta(ws as unknown as ElysiaWS);

      if (!meta.auth) {
        ws.close(4001, "Unauthorized");
        return;
      }

      switch (body.type) {
        case "join": {
          if (body.room !== meta.auth.roomId) {
            SessionService.send(ws.raw, {
              type: "room:error",
              message: "Room mismatch",
            });
            ws.close(4003, "Forbidden");
            return;
          }

          const allowed = await SessionService.authorizeRoom(
            body.room,
            meta.auth.userId,
          );
          if (!allowed) {
            SessionService.send(ws.raw, {
              type: "room:error",
              message: "Not allowed",
            });
            ws.close(4003, "Forbidden");
            return;
          }

          if (meta.roomId) leaveRoom(ws as unknown as ElysiaWS);
          meta.roomId = body.room;
          meta.user = {
            ...(typeof body.user === "object" && body.user ? body.user : {}),
            id: meta.auth.userId,
          };

          const { existingPeers } = SessionService.join(body.room, {
            ws: ws.raw,
            peerId: meta.peerId,
            userId: meta.auth.userId,
            user: meta.user,
          });

          SessionService.broadcastExcept(body.room, meta.peerId, {
            type: "room:peer-joined",
            peerId: meta.peerId,
            user: meta.user,
          });

          // Safeguard for stale client-side RTC state after refresh/rejoin.
          SessionService.broadcastExcept(body.room, meta.peerId, {
            type: "room:resync",
            peerId: meta.peerId,
            reason: existingPeers.length > 0 ? "peer-rejoined" : "peer-joined",
          });

          SessionService.send(ws.raw, {
            type: "room:joined",
            peerId: meta.peerId,
            existingPeers,
          });
          break;
        }

        case "leave": {
          leaveRoom(ws as unknown as ElysiaWS);
          break;
        }

        case "webrtc:offer": {
          if (!(await requireJoinedAndAuthorized(meta))) {
            ws.close(4003, "Forbidden");
            return;
          }
          const peer = SessionService.getPeer(meta.roomId!, meta.peerId);
          if (!peer) return;
          SessionService.send(peer.ws, {
            type: "webrtc:offer",
            from: meta.peerId,
            sdp: body.sdp,
          });
          break;
        }

        case "webrtc:answer": {
          if (!(await requireJoinedAndAuthorized(meta))) {
            ws.close(4003, "Forbidden");
            return;
          }
          const peer = SessionService.getPeer(meta.roomId!, meta.peerId);
          if (!peer) return;
          SessionService.send(peer.ws, {
            type: "webrtc:answer",
            from: meta.peerId,
            sdp: body.sdp,
          });
          break;
        }

        case "webrtc:ice-candidate": {
          if (!(await requireJoinedAndAuthorized(meta))) {
            ws.close(4003, "Forbidden");
            return;
          }
          const peer = SessionService.getPeer(meta.roomId!, meta.peerId);
          if (!peer) return;
          SessionService.send(peer.ws, {
            type: "webrtc:ice-candidate",
            from: meta.peerId,
            candidate: {
              candidate: body.candidate.candidate,
              sdpMid: body.candidate.sdpMid ?? null,
              sdpMLineIndex: body.candidate.sdpMLineIndex ?? null,
              usernameFragment: body.candidate.usernameFragment ?? null,
            },
          });
          break;
        }

        case "chat:message": {
          if (!(await requireJoinedAndAuthorized(meta))) {
            ws.close(4003, "Forbidden");
            return;
          }
          SessionService.broadcastExcept(meta.roomId!, meta.peerId, {
            type: "chat:message",
            from: meta.peerId,
            user: meta.user,
            text: body.text,
            timestamp: new Date().toISOString(),
          });
          break;
        }

        case "media:toggle": {
          if (!(await requireJoinedAndAuthorized(meta))) {
            ws.close(4003, "Forbidden");
            return;
          }
          SessionService.broadcastExcept(meta.roomId!, meta.peerId, {
            type: "media:toggle",
            from: meta.peerId,
            kind: body.kind,
            enabled: body.enabled,
          });
          break;
        }

        case "peer:ready": {
          if (!(await requireJoinedAndAuthorized(meta))) {
            ws.close(4003, "Forbidden");
            return;
          }
          const peer = SessionService.getPeer(meta.roomId!, meta.peerId);
          if (!peer) return;
          SessionService.send(peer.ws, {
            type: "peer:ready",
            from: meta.peerId,
          });
          break;
        }
      }
    },

    close: (ws) => {
      leaveRoom(ws as unknown as ElysiaWS);
    },
  });
