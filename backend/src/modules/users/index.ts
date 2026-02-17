import { Elysia } from "elysia";
import { Users } from "./service";
import { UserModel } from "./model";

export const users = new Elysia({ prefix: "/auth" }).get(
  "/users",
  async () => {
    const users = await Users.getAllUsers();
    return users.map((user) => ({
      ...user,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
      deleted_at: user.deleted_at?.toISOString() ?? null,
    }));
  },
  {
    response: {
      200: UserModel.userArray,
      400: UserModel.userInvalid,
    },
  },
);
