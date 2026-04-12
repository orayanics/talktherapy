import Elysia from "elysia";
import { betterAuthPlugin } from "@/plugin/better-auth";
import { z } from "zod";
import { ApiError, ApiSuccess, ok, tryOk } from "@/lib/response";
import { getSlotById, bookSlot } from "./service";
import { StoreSlotBookingSchema } from "./model";

import { logAudit } from "@/lib/audit";

export const slotsModule = new Elysia({ prefix: "/slots" })
  .use(betterAuthPlugin)
  .get(
    "/:id",
    async ({ params, status }) => {
      const result = await tryOk(() => getSlotById(params.id));
      if (!result.success) return status(404, result);
      return status(200, ok(result.data));
    },
    {
      params: z.object({ id: z.string() }),
      response: { 200: ApiSuccess(), 404: ApiError },
    },
  )

  .post(
    "/:id/book",
    async ({ user, params, body, status }) => {
      const patientId = user.id;

      if (!patientId)
        return status(403, { success: false, error: "patient_id required" });

      const result = await tryOk(() => bookSlot(params.id, patientId, body));
      if (!result.success) return status(400, result);

      await logAudit({
        action: "book.slot",
        actorId: user.id,
        actorEmail: user.email ?? null,
        actorRole: user.role ?? "",
        details: {
          slotId: params.id,
          patientId,
        },
      });
      return status(201, ok(result.data));
    },
    {
      params: z.object({ id: z.string() }),
      body: StoreSlotBookingSchema,
      response: {
        201: ApiSuccess(),
        400: ApiError,
        401: ApiError,
        403: ApiError,
      },
      auth: true,
    },
  );
