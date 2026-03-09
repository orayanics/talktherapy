import { Elysia, status, t } from "elysia";
import { jwtPlugin } from "@/plugins/jwt";
import { SessionService } from "./service";
import { InboundMessage } from "./model";
import { globalRateLimit } from "@/plugins/rateLimit";

/**
 * Session module — WebSocket-based therapy session rooms.
 *
 * Endpoint: GET /session/:roomId  (upgraded to WS)
 *
 * Lifecycle:
 *   1. beforeHandle — verify JWT (auth) and appointment membership
 *   2. open         — add participant, notify room
 *   3. message      — relay chat / WebRTC signaling / media toggles
 *   4. close        — remove participant, notify room
 *
 * Auth note:
 *   The browser sends the httpOnly `session` cookie on the WS handshake
 *   automatically, so the jwtPlugin.derive() runs and populates `auth`.
 *   A query-param token (`?token=`) is also supported as a fallback for
 *   clients that cannot set cookies (e.g. native apps).
 */
export const sessionModule = new Elysia({
  prefix: "/session",
  detail: { tags: ["Session"] },
})
  .use(jwtPlugin)
  .use(globalRateLimit)

  .ws("/:roomId", {
    body: InboundMessage,
    query: t.Optional(
      t.Object({
        token: t.Optional(t.String()),
      }),
    ),
    params: t.Object({
      roomId: t.String(),
    }),

    // check auth before ws connection
    // if fail return 401 and no ws connection
    async beforeHandle({ auth, jwt, query, params, set }) {
      // Allow query-param token as a fallback (cookie is preferred).
      if (!auth && query?.token) {
        const payload = await jwt.verify(query.token);
        if (
          payload &&
          typeof payload === "object" &&
          typeof (payload as Record<string, unknown>).userId === "string"
        ) {
          const p = payload as Record<string, unknown>;
          // Temporarily attach — will be re-read from ws.data inside open/message
          (this as unknown as Record<string, unknown>)._tokenAuth = {
            userId: p.userId as string,
            role: p.role as string,
          };
        }
      }

      if (!auth) {
        set.status = 401;
        return "Unauthorized";
      }

      try {
        await SessionService.authorizeRoom(params.roomId, auth.userId);
      } catch (err) {
        // Elysia status objects have a `status` and `response` property
        if (
          err &&
          typeof err === "object" &&
          "status" in err &&
          "response" in err
        ) {
          const e = err as { status: number; response: unknown };
          set.status = e.status;
          return e.response;
        }
        set.status = 500;
        return "Internal Server Error";
      }
    },

    async open(ws) {
      const { auth, params } = ws.data;
      if (!auth) {
        ws.close(4001, "Unauthorized");
        return;
      }

      const roomId = params.roomId;
      const { userId, role } = auth;

      // Authorize and resolve role from DB (source of truth)
      let resolvedRole: "clinician" | "patient";
      try {
        const result = await SessionService.authorizeRoom(roomId, userId);
        resolvedRole = result.role;
      } catch {
        ws.close(4001, "Unauthorized");
        return;
      }

      // Register participant in memory
      SessionService.join(roomId, ws.raw, userId, resolvedRole);

      // Tell the joining user about current participants
      const participants = SessionService.getParticipants(roomId);
      SessionService.send(ws.raw, {
        type: "room:joined",
        userId,
        role: resolvedRole,
        participants,
      });

      // Notify everyone else that a new participant joined
      SessionService.broadcastExcept(roomId, userId, {
        type: "room:joined",
        userId,
        role: resolvedRole,
        participants,
      });

      console.log(
        `[session] ${role} ${userId} joined room ${roomId} (${participants.length} participants)`,
      );
    },

    async message(ws, body) {
      const { auth, params } = ws.data;
      if (!auth) return;

      const roomId = params.roomId;
      const { userId } = auth;

      // Resolve role from in-memory participant map (populated in open)
      const participant = SessionService.getParticipant(roomId, userId);
      if (!participant) {
        ws.close(4003, "Not in room");
        return;
      }
      const senderRole = participant.role;

      switch (body.type) {
        case "chat:message":
          SessionService.broadcastExcept(roomId, userId, {
            type: "chat:message",
            from: userId,
            role: senderRole,
            text: body.text,
            timestamp: new Date().toISOString(),
          });
          // Echo back to sender with metadata
          SessionService.send(ws.raw, {
            type: "chat:message",
            from: userId,
            role: senderRole,
            text: body.text,
            timestamp: new Date().toISOString(),
          });
          break;

        case "webrtc:offer": {
          const peer = SessionService.getPeer(roomId, userId);
          if (peer) {
            SessionService.send(peer.ws, {
              type: "webrtc:offer",
              from: userId,
              sdp: body.sdp,
            });
          }
          break;
        }

        case "webrtc:answer": {
          const peer = SessionService.getPeer(roomId, userId);
          if (peer) {
            SessionService.send(peer.ws, {
              type: "webrtc:answer",
              from: userId,
              sdp: body.sdp,
            });
          }
          break;
        }

        case "webrtc:ice-candidate": {
          const peer = SessionService.getPeer(roomId, userId);
          if (peer) {
            SessionService.send(peer.ws, {
              type: "webrtc:ice-candidate",
              from: userId,
              candidate: body.candidate,
              sdpMid: body.sdpMid ?? null,
              sdpMLineIndex: body.sdpMLineIndex ?? null,
            });
          }
          break;
        }

        case "media:toggle":
          SessionService.broadcastExcept(roomId, userId, {
            type: "media:toggle",
            from: userId,
            kind: body.kind,
            enabled: body.enabled,
          });
          break;

        case "peer:ready": {
          const peer = SessionService.getPeer(roomId, userId);
          if (peer) {
            SessionService.send(peer.ws, {
              type: "peer:ready",
              from: userId,
            });
          }
          break;
        }
      }
    },

    close(ws) {
      const { auth, params } = ws.data;
      if (!auth) return;

      const roomId = params.roomId;
      const { userId } = auth;

      SessionService.leave(roomId, userId);

      SessionService.broadcast(roomId, {
        type: "room:left",
        userId,
      });

      console.log(`[session] ${userId} left room ${roomId}`);
    },
  });
