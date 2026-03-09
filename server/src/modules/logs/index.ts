import { Elysia } from "elysia";
import { jwtPlugin } from "@/plugins/jwt";
import { LogsModel } from "./model";
import { LogsService } from "./service";
import { NotificationService } from "@/modules/notifications/service";
import { NOTIFICATION_TYPE } from "@/config/notifications";
import { globalRateLimit } from "@/plugins/rateLimit";

export const logsModule = new Elysia({ prefix: "/logs" })
  .use(jwtPlugin)
  .use(globalRateLimit)
  .guard({ isAuth: true, hasRole: ["sudo"] }, (app) =>
    // GET: /logs
    app.get("/", ({ query }) => LogsService.getLogs(query), {
      query: LogsModel.listQuery,
      response: {
        200: LogsModel.paginatedLogs,
      },
    }),
  )
  // WS: /logs/export
  // uses jwt for verification for access
  // client sends { type: "start", date?: "YYYY-MM-DD" }
  // server responds with progress updates and final data (base64-encoded JSON or ZIP)
  // { type: "progress", current: N, total: N }   (every 100 logs queued)
  // { type: "done", filename: "logs-YYYY-MM-DD.json|.zip", contentType: "...", data: "<base64>" }
  // { type: "error", message: "..." }

  .ws("/export", {
    query: LogsModel.exportQuery,
    body: LogsModel.wsInbound,

    // Verify JWT (cookie preferred; query-param token as fallback)
    async beforeHandle({ auth, jwt, query, set }) {
      let resolved = auth;

      if (!resolved && query?.token) {
        const payload = await jwt.verify(query.token);
        if (payload && typeof payload === "object") {
          const p = payload as Record<string, unknown>;
          if (typeof p.userId === "string" && typeof p.role === "string") {
            resolved = {
              userId: p.userId,
              email: typeof p.email === "string" ? p.email : "",
              role: p.role,
              iat: typeof p.iat === "number" ? p.iat : undefined,
              exp: typeof p.exp === "number" ? p.exp : undefined,
            };
          }
        }
      }

      if (!resolved) {
        set.status = 401;
        return "Unauthorized";
      }
      if (resolved.role !== "sudo") {
        set.status = 403;
        return "Forbidden";
      }
    },

    async message(ws, msg) {
      if (msg.type !== "start") return;

      try {
        // Progress: signal start
        ws.send(JSON.stringify({ type: "progress", current: 0, total: null }));

        const result = await LogsService.exportLogs(msg.date);

        // Base64-encode the buffer for safe wire transfer
        const base64 = result.buffer.toString("base64");

        ws.send(
          JSON.stringify({
            type: "done",
            filename: result.filename,
            contentType: result.contentType,
            data: base64,
          }),
        );

        // Notify the requesting admin that the export is ready
        const userId = ws.data.auth?.userId;
        if (userId) {
          NotificationService.notify(
            userId,
            NOTIFICATION_TYPE.EXPORT_COMPLETE,
          ).catch(console.error);
        }
      } catch (err) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: err instanceof Error ? err.message : "Export failed",
          }),
        );
      } finally {
        ws.close();
      }
    },
  });
