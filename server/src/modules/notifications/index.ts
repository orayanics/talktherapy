import { Elysia, t } from "elysia";
import { jwtPlugin } from "@/plugins/jwt";
import { NotificationService } from "./service";

export const notificationsModule = new Elysia({
  prefix: "/notifications",
  detail: { tags: ["Notifications"] },
})
  .use(jwtPlugin)
  .guard({ isAuth: true }, (app) =>
    app
      // GET /notifications — paginated list
      .get(
        "/",
        ({ auth, query }) =>
          NotificationService.list(
            auth!.userId,
            query.page ?? 1,
            query.per_page ?? 20,
          ),
        {
          query: t.Object({
            page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
            per_page: t.Optional(
              t.Numeric({ minimum: 1, maximum: 50, default: 20 }),
            ),
          }),
        },
      )

      // GET /notifications/unread — unread count only
      .get("/unread", ({ auth }) =>
        NotificationService.unreadCount(auth!.userId),
      )

      // PATCH /notifications/read — mark all unread as read
      .patch("/read", ({ auth }) =>
        NotificationService.markAllRead(auth!.userId),
      )

      // PATCH /notifications/:id/read — mark single notification as read
      .patch(
        "/:id/read",
        ({ auth, params }) =>
          NotificationService.markRead(auth!.userId, params.id),
        {
          params: t.Object({ id: t.String() }),
        },
      ),
  )
  .ws("/ws", {
    query: t.Optional(
      t.Object({
        token: t.Optional(t.String()),
      }),
    ),

    async beforeHandle({ auth, jwt, query, set }) {
      // Cookie-based auth (jwtPlugin derive) is the primary path.
      // Query-param token is the fallback for environments that can't send
      // the httpOnly cookie on the WS upgrade (e.g. token expired and
      // client passes a fresh bearer token as ?token=).
      if (auth) return; // fast path — cookie auth OK

      if (query?.token) {
        const payload = await jwt.verify(query.token);
        if (
          payload &&
          typeof payload === "object" &&
          typeof (payload as Record<string, unknown>).userId === "string"
        ) {
          return; // token auth OK — open() will re-verify
        }
      }

      set.status = 401;
      return "Unauthorized";
    },

    async open(ws) {
      // Resolve userId — prefer cookie-derived auth, fall back to query token.
      let userId = ws.data.auth?.userId;

      if (!userId && ws.data.query?.token) {
        const payload = await ws.data.jwt.verify(ws.data.query.token);
        if (payload && typeof payload === "object") {
          const p = payload as Record<string, unknown>;
          if (typeof p.userId === "string") userId = p.userId;
        }
      }

      if (!userId) {
        ws.close(4001, "Unauthorized");
        return;
      }

      NotificationService.register(userId, ws);

      // Send unread count immediately on connect
      const unread = await NotificationService.unreadCount(userId);
      ws.send(JSON.stringify({ type: "unread_count", count: unread }));
    },

    close(ws) {
      // Cookie path: auth is populated by jwtPlugin derive.
      // Token path: auth is null — fall back to lookup by WS reference.
      const userId = ws.data.auth?.userId;
      if (userId) {
        NotificationService.unregister(userId);
      } else {
        NotificationService.unregisterByWs(ws);
      }
    },

    // No inbound messages needed — this is server-push only
    message() {},
  });
