import Elysia from "elysia";
import { betterAuthPlugin } from "@/plugin/better-auth";
import { ApiError, ApiSuccess, ok, tryOk } from "@/lib/response";
import { z } from "zod";
import { createSchedule } from "./service";

export const scheduleModule = new Elysia({ prefix: "/schedule" })
  .use(betterAuthPlugin)
  .post(
    "/",
    async ({ user, body, status }) => {
      const payload = {
        ...(body as any),
        clinician_id: user.id,
      };
      const result = await tryOk(() => createSchedule(payload));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      requireClinician: true,
      body: z.object({
        start_at: z.string(),
        end_at: z.string(),
        recurrence_rule: z.string().nullable().optional(),
      }),
      response: { 200: ApiSuccess(), 400: ApiError, 403: ApiError },
    },
  );
