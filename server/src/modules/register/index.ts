import { betterAuthPlugin } from "@/plugin/better-auth";
import Elysia from "elysia";

import { registerAdmin, registerClinician, registerPatient } from "./service";
import { RegisterAdminSchema, RegisterUserSchema } from "./model";
import { ApiSuccess, ApiError, tryOk, ok } from "@/lib/response";

export const registerModule = new Elysia({ prefix: "/register" })
  .use(betterAuthPlugin)
  .post(
    "/admin",
    async ({ body, status }) => {
      const result = await tryOk(() => registerAdmin(body));
      if (!result.success) return status(400, result);
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
    async ({ body, status }) => {
      const result = await tryOk(() => registerClinician(body));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      body: RegisterUserSchema,
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
      const result = await tryOk(() => registerClinician(body));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      body: RegisterUserSchema,
      response: {
        200: ApiSuccess(),
        400: ApiError,
      },
    },
  );
