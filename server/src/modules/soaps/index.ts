import Elysia from "elysia";
import { betterAuthPlugin } from "@/plugin/better-auth";
import { z } from "zod";
import { ApiError, ApiSuccess, error, ok, tryOk } from "@/lib/response";
import {
  listSoapsByPatient,
  fetchSoapById,
  createSoap,
  updateSoap,
} from "./service";
import { StoreSoapSchema, UpdateSoapSchema, SoapQuerySchema } from "./model";
import { logAudit } from "@/lib/audit";

export const soapsModule = new Elysia({ prefix: "/soaps" })
  .use(betterAuthPlugin)
  .get(
    "/patient/:patientId",
    async ({ params, query, user, status }) => {
      const role = user.role;
      const patientId = params.patientId as string;

      if (role === "patient") {
        if (user.id !== patientId) return status(403, error("Forbidden"));
      }

      const result = await tryOk(() => listSoapsByPatient(patientId, query));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      auth: true,
      params: z.object({ patientId: z.string() }),
      query: SoapQuerySchema,
      response: {
        200: ApiSuccess(),
        400: ApiError,
        401: ApiError,
        403: ApiError,
      },
    },
  )

  .post(
    "/:patientId",
    async ({ params, body, user, status }) => {
      const clinicianId = user.id;
      const patientId = params.patientId as string;
      const result = await tryOk(() =>
        createSoap(patientId, clinicianId, body),
      );
      if (!result.success) return status(400, result);
      await logAudit({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user?.role ?? "unknown",
        action: "soap.create",
        details: {
          id: result.data.id,
          session: body.session_type,
        },
      });
      return status(201, ok(result.data));
    },
    {
      requireClinician: true,
      params: z.object({ patientId: z.string() }),
      body: StoreSoapSchema,
      response: { 400: ApiError, 201: ApiSuccess() },
    },
  )

  .get(
    "/:id",
    async ({ params, user, status }) => {
      const soapId = params.id as string;
      const result = await tryOk(() => fetchSoapById(soapId));
      if (!result.success) return status(404, result);

      // if patient role, ensure ownership
      if (user.role === "patient") {
        if (result.data.patientId !== user.id)
          return status(403, error("Forbidden"));
      }

      return status(200, ok(result.data));
    },
    {
      auth: true,
      params: z
        .object({ id: z.string(), patientId: z.string() })
        .partial()
        .optional(),
      response: { 200: ApiSuccess(), 403: ApiError, 404: ApiError },
    },
  )

  .patch(
    "/:id",
    async ({ params, body, user, status }) => {
      const soapId = params.id as string;
      const clinicianId = user.id;
      const result = await tryOk(() => updateSoap(soapId, clinicianId, body));
      if (!result.success) return status(400, result);
      await logAudit({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user?.role ?? "unknown",
        action: "soap.update",
        details: {
          id: result.data.id,
          session: body.session_type,
        },
      });
      return status(200, ok(result.data));
    },
    {
      requireClinician: true,
      params: z.object({ id: z.string() }),
      body: UpdateSoapSchema,
      response: {
        400: ApiError,
        200: ApiSuccess(),
        403: ApiError,
        404: ApiError,
      },
    },
  );
