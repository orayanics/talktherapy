import { betterAuthPlugin } from "@/plugin/better-auth";
import Elysia from "elysia";

import { registerAdmin, registerClinician, registerPatient } from "./service";
import {
  RegisterAdminSchema,
  RegisterClinicianSchema,
  RegisterPatientSchema,
} from "./model";
import { ApiSuccess, ApiError, tryOk, ok } from "@/lib/response";
import { logAudit } from "@/lib/audit";

export const registerModule = new Elysia({ prefix: "/register" })
  .use(betterAuthPlugin)
  .post(
    "/admin",
    async ({ user, body, status }) => {
      const result = await tryOk(() => registerAdmin(body));
      if (!result.success) return status(400, result);
      await logAudit({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user?.role ?? "unknown",
        action: "register.admin",
        details: {
          email: body.email,
        },
      });
      return status(200, ok(result.data));
    },
    {
      body: RegisterAdminSchema,
      response: {
        200: ApiSuccess(),
        400: ApiError,
      },
      requireAdmin: true,
    },
  )
  .post(
    "/clinician",
    async ({ user, body, status }) => {
      const result = await tryOk(() => registerClinician(body));
      if (!result.success) return status(400, result);
      await logAudit({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user?.role ?? "unknown",
        action: "register.clinician",
        details: {
          email: body.email,
        },
      });
      return status(200, ok(result.data));
    },
    {
      body: RegisterClinicianSchema,
      response: {
        200: ApiSuccess(),
        400: ApiError,
      },
      requireAdmin: true,
    },
  )
  .post(
    "/patient",
    async ({ body, status }) => {
      const result = await tryOk(() => registerPatient(body));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      body: RegisterPatientSchema,
      response: {
        200: ApiSuccess(),
        400: ApiError,
      },
    },
  );
