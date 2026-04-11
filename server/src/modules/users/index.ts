import Elysia from "elysia";
import { betterAuthPlugin } from "@/plugin/better-auth";

import { z } from "zod";
import { fetchAllUsers, fetchUserById } from "./service";
import { UsersListSchema } from "./model";
import { ApiError, ApiSuccess, ok, tryOk } from "@/lib/response";

export const usersModule = new Elysia({ prefix: "/users" })
  .use(betterAuthPlugin)
  .get(
    "/",
    async ({ query, status }) => {
      const result = await tryOk(() => fetchAllUsers(query));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      requireAdmin: true,
      query: UsersListSchema,
      response: {
        200: ApiSuccess(),
        400: ApiError,
      },
    },
  )
  .get(
    "/:id",
    async ({ params, status }) => {
      const result = await tryOk(() => fetchUserById(params.id));
      if (!result.success) return status(404, result);
      return status(200, ok(result.data));
    },
    {
      requireAdmin: true,
      params: z.object({ id: z.string() }),
      response: {
        200: ApiSuccess(),
        404: ApiError,
      },
    },
  );
