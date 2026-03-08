import { Elysia } from "elysia";
import { Users } from "./service";
import { UserModel } from "./model";
import { jwtPlugin } from "@/plugins/jwt";

export const usersModule = new Elysia({ prefix: "/users" })
  .use(jwtPlugin)
  .guard({ isAuth: true, hasRole: ["admin", "sudo"] }, (app) =>
    app
      // GET: /users
      .get(
        "/",
        async ({ auth, query }) =>
          Users.getAllUsers(auth!.role, {
            search: query.search,
            account_status: query.account_status,
            account_role: query.account_role,
            page: query.page,
            perPage: query.per_page,
          }),
        {
          query: UserModel.userQueryParams,
          response: {
            200: UserModel.userPaginatedResponse,
            400: UserModel.userInvalid,
          },
        },
      )
      // GET: /users/count
      .get("/count", () => Users.getUserCounts(), {
        response: {
          200: UserModel.userCounts,
          400: UserModel.userCountsInvalid,
        },
      })
      // GET: /users/:id
      .get("/:id", ({ params }) => Users.getUserById(params.id), {
        response: {
          200: UserModel.user,
          404: UserModel.userNotFound,
        },
      }),
  );
