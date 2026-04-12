import Elysia from "elysia";
import { betterAuthPlugin } from "@/plugin/better-auth";
import { tryOk, ok } from "@/lib/response";
import { ApiError, ApiSuccess } from "@/lib/response";

import { LogsListSchema, LogsExportSchema } from "./model";
import { fetchAllLogs } from "./service";

export const logsModule = new Elysia({ prefix: "/logs" })
  .use(betterAuthPlugin)
  .get(
    "/",
    async ({ query, status }) => {
      const result = await tryOk(() => fetchAllLogs(query));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      requireAdmin: true,
      query: LogsListSchema,
      response: {
        200: ApiSuccess(),
        400: ApiError,
      },
    },
  )

  // export endpoint
  .get(
    "/export",
    async ({ query, status }) => {
      try {
        const { exportLogs } = await import("./service");
        const result = await exportLogs(query);
        return new Response(result.content, {
          headers: {
            "Content-Type": result.contentType,
            "Content-Disposition": `attachment; filename="${result.filename}"`,
          },
        });
      } catch (err: unknown) {
        return status(400, {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    },
    {
      requireAdmin: true,
      query: LogsExportSchema,
    },
  );
