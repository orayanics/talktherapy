import { Elysia } from "elysia";
import { Users } from "./service";
import { UserModel } from "./model";
import { jwtPlugin } from "@/plugins/jwt";

export const users = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)
  // get all users
  .get(
    "/users",
    async ({ auth, query }) => {
      const result = await Users.getAllUsers(auth!.role, {
        search: query.search,
        account_status: query.account_status,
        account_role: query.account_role,
        page: query.page ?? 1,
        perPage: query.per_page ?? 10,
      });

      return {
        ...result,
        data: result.data.map((user) => ({
          ...user,
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString(),
          deleted_at: user.deleted_at?.toISOString() ?? null,
        })),
      };
    },
    {
      query: UserModel.userQueryParams,
      response: {
        200: UserModel.getUsersResponse,
        400: UserModel.userInvalid,
      },
      isAuth: true,
      hasRole: ["admin", "sudo"],
    },
  )
  // get users count by: all, patients, clinicians, admins
  .get(
    "/users/count",
    async () => {
      const counts = await Users.getUserCounts();
      return counts;
    },
    {
      response: {
        200: UserModel.userCounts,
        400: UserModel.userCountsInvalid,
      },
      isAuth: true,
      hasRole: ["admin", "sudo"],
    },
  );
