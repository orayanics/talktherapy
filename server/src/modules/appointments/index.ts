import Elysia from "elysia";
import { betterAuthPlugin } from "@/plugin/better-auth";
import { z } from "zod";
import { ApiError, ApiSuccess, ok, tryOk } from "@/lib/response";
import {
  acceptAppointment,
  rejectAppointment,
  cancelAppointment,
  completeAppointment,
  fetchAppointmentById,
} from "./service";
import {
  listSlotsByClinician,
  slotsForPatients,
  fetchAppointmentsByClinician,
  fetchAppointmentsByPatient,
} from "./service";
import { ClinicianDecisionSchema, AppointmentQuerySchema } from "./model";

export const appointmentsModule = new Elysia({ prefix: "/appointments" })
  .use(betterAuthPlugin)

  .post(
    "/:id/accept",
    async ({ user, params, status }) => {
      const clinicianId = user.id;
      const result = await tryOk(() =>
        acceptAppointment(params.id, clinicianId),
      );
      if (!result.success) return status(400, result);
      return status(204, ok(result.data));
    },
    {
      requireClinician: true,
      params: z.object({ id: z.string() }),
      response: { 400: ApiError, 204: ApiSuccess() },
    },
  )

  .post(
    "/:id/reject",
    async ({ params, body, status, user }) => {
      const clinicianId = user.id;
      const { reason, is_hidden } = body as {
        reason: string;
        is_hidden?: boolean;
      };
      const result = await tryOk(() =>
        rejectAppointment(
          params.id,
          clinicianId,
          reason ?? "",
          is_hidden ?? false,
        ),
      );
      if (!result.success) return status(400, result);
      return status(204, ok(result.data));
    },
    {
      requireClinician: true,
      params: z.object({ id: z.string() }),
      body: ClinicianDecisionSchema,
      response: { 400: ApiError, 204: ApiSuccess() },
    },
  )

  .post(
    "/:id/cancel",
    async ({ params, body, status, user }) => {
      const actorId = user.id;
      const reason = (body as any)?.reason ?? "";
      const result = await tryOk(() =>
        cancelAppointment(params.id, actorId, reason),
      );
      if (!result.success) return status(400, result);
      return status(204, ok(result.data));
    },
    {
      auth: true,
      params: z.object({ id: z.string() }),
      body: z.object({ reason: z.string().optional() }).optional(),
      response: { 400: ApiError, 204: ApiSuccess() },
    },
  )

  .post(
    "/:id/complete",
    async ({ params, status, user }) => {
      const clinicianId = user.id;
      const result = await tryOk(() =>
        completeAppointment(params.id, clinicianId),
      );
      if (!result.success) return status(400, result);
      return status(204, ok(result.data));
    },
    {
      requireClinician: true,
      params: z.object({ id: z.string() }),
      response: { 400: ApiError, 204: ApiSuccess() },
    },
  )

  .get(
    "/:id",
    async ({ params, status }) => {
      const result = await tryOk(() => fetchAppointmentById(params.id));
      if (!result.success) return status(404, result);
      return status(200, ok(result.data));
    },
    {
      auth: true,
      params: z.object({ id: z.string() }),
      response: { 200: ApiSuccess(), 404: ApiError },
    },
  );

// GET /me/slots
appointmentsModule.get(
  "/me/slots",
  async ({ user, query, status }) => {
    const role = user.role;

    if (role === "patient") {
      const result = await tryOk(() => slotsForPatients(query));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    } else {
      const result = await tryOk(() => listSlotsByClinician(user.id, query));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    }
  },
  {
    auth: true,
    query: AppointmentQuerySchema,
    response: { 200: ApiSuccess(), 400: ApiError, 401: ApiError },
  },
);

// GET /slots (for patients)
appointmentsModule.get(
  "/slots",
  async ({ query, status }) => {
    const result = await tryOk(() => slotsForPatients(query));
    if (!result.success) return status(400, result);
    return status(200, ok(result.data));
  },
  {
    query: AppointmentQuerySchema,
    response: { 200: ApiSuccess(), 400: ApiError },
  },
);

// GET /me/appointments
appointmentsModule.get(
  "/me",
  async ({ query, status, user }) => {
    const role = user.role;

    if (role === "clinician") {
      const result = await tryOk(() =>
        fetchAppointmentsByClinician(user.id, query),
      );
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    } else {
      const result = await tryOk(() =>
        fetchAppointmentsByPatient(user.id, query),
      );
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    }
  },
  {
    auth: true,
    query: AppointmentQuerySchema,
    response: {
      200: ApiSuccess(),
      400: ApiError,
    },
  },
);
