import { Elysia, t } from "elysia";
import { betterAuthPlugin } from "@/plugin/better-auth";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/client";
import { ApiError, ApiSuccess, error, ok, tryOk } from "@/lib/response";
import { ListNotificationsSchema, CreateNotificationSchema } from "./model";
import { createNotification, listNotifications, markAsRead } from "./service";
import NotificationHub from "./ws";
import { verifyJoinToken, signJoinToken } from "@/lib/joinToken";
import { z } from "zod";
import type { ElysiaWS } from "../session/model";

const META = Symbol("notif-ws-meta");

type NotifMeta = { userId: string | null };

const getMeta = (ws: ElysiaWS) => {
  if (!ws.data[META]) ws.data[META] = { userId: null } as NotifMeta;
  return ws.data[META] as NotifMeta;
};

export const notificationsModule = new Elysia({ prefix: "/notifications" })
  .use(betterAuthPlugin)
  .get("/", () => "Notifications endpoint")

  // WebSocket endpoint for receiving live notifications
  .get("/ws", () => "WebSocket endpoint")
  .ws("/ws", {
    query: t.Object({ token: t.String() }),

    open: async (ws: ElysiaWS) => {
      const meta = getMeta(ws);
      const token = (ws.data.query as Record<string, any>)?.token;
      if (!token) {
        ws.close(4001, "Unauthorized");
        return;
      }

      // Accept either a signed join token or a raw session token
      try {
        if (token.includes(".")) {
          const claims = verifyJoinToken(token);
          meta.userId = (claims as any).userId;
        } else {
          // Validate session token by looking up session record
          const session = await prisma.session.findUnique({
            where: { token },
            include: { user: true },
          });
          if (!session) throw new Error("Unauthorized");
          meta.userId = session.user.id;
        }
      } catch (err) {
        ws.close(4001, "Unauthorized");
        return;
      }

      NotificationHub.add(meta.userId as string, ws.raw);
    },

    message: (ws: ElysiaWS) => {
      // notifications WS is receive-less for now; keep for extensibility
    },

    close: (ws: ElysiaWS) => {
      const meta = getMeta(ws);
      if (meta.userId) NotificationHub.remove(meta.userId, ws.raw);
    },
  })

  // List notifications for authenticated user
  .get(
    "/list",
    async ({ request, status, query }) => {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) return status(401, error("Unauthorized"));
      const data = await listNotifications(session.user.id, {
        limit: Number(query.limit),
        unreadOnly: (query as any).unreadOnly as boolean | undefined,
      });
      return status(200, ok(data));
    },
    {
      auth: true,
      query: ListNotificationsSchema as unknown as any,
      response: { 200: ApiSuccess(), 401: ApiError },
    },
  )

  // Admin/system endpoint to send a notification to a user
  .post(
    "/send",
    async ({ body, status }) => {
      // require admin via macro on route options
      const result = await tryOk(() => createNotification(body));
      if (!result.success) return status(400, result);
      return status(201, ok(result.data));
    },
    {
      requireAdmin: true,
      body: CreateNotificationSchema,
      response: { 201: ApiSuccess(), 400: ApiError, 401: ApiError },
    },
  )

  .post(
    "/join-token",
    async ({ user, status }) => {
      if (!user) return status(401, error("Unauthorized"));
      // Use signJoinToken to mint a short-lived token containing userId
      const token = signJoinToken(
        { appointmentId: user.id, roomId: user.id, userId: user.id } as any,
        60 * 5,
      );
      return status(200, { token });
    },
    {
      auth: true,
      response: { 200: t.Object({ token: t.String() }), 401: ApiError },
    },
  )

  .post(
    "/:id/read",
    async ({ params, request, status }) => {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) return status(401, error("Unauthorized"));
      const okMarked = await markAsRead(params.id, session.user.id);
      if (!okMarked) return status(404, error("Not found"));
      return status(200, ok({ message: "Marked as read" }));
    },
    {
      auth: true,
      params: z.object({ id: z.string() }),
      response: { 200: ApiSuccess(), 401: ApiError, 404: ApiError },
    },
  );
