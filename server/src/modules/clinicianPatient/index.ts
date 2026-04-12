import Elysia from "elysia";
import { betterAuthPlugin } from "@/plugin/better-auth";
import { z } from "zod";
import { ApiError, ApiSuccess, ok, tryOk } from "@/lib/response";
import { fetchClinicianPatients } from "./service";

export const clinicianPatientModule = new Elysia({
  prefix: "/clinician-patient",
})
  .use(betterAuthPlugin)
  .get(
    "/",
    async ({ query, status }) => {
      const result = await tryOk(() => fetchClinicianPatients(query));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      query: z
        .object({
          per_page: z.coerce.number().optional(),
          page: z.coerce.number().optional(),
          search: z.string().optional(),
          sort: z.enum(["asc", "desc"]).optional(),
        })
        .optional(),
      response: { 200: ApiSuccess(), 400: ApiError },
      auth: true,
    },
  );
