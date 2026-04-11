import { betterAuthPlugin } from "@/plugin/better-auth";
import Elysia from "elysia";

import { fetchAllUsers, fetchUserById } from "./service";

export const usersModule = new Elysia({ prefix: "/users" })
  .use(betterAuthPlugin)
  .get("/", () => fetchAllUsers({}), {
    requireAdmin: true,
  })
  .get(
    "/:id",
    ({ params }) => {
      return fetchUserById(params.id);
    },
    {
      requireAdmin: true,
    },
  );
