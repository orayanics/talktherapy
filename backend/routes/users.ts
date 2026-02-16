// routes/users.ts
import { Elysia, t } from "elysia";
import { UserModel } from "../models";

export const userRoutes = new Elysia({ name: "user-routes" }).group(
  "/api/users",
  (app) =>
    app
      // Get current user (requires authentication)
      .get("/me", ({ user }) => user, {
        isAuth: true,
        detail: {
          tags: ["Users"],
          summary: "Get current user",
          description: "Returns the currently authenticated user",
        },
      })

      // Get user by ID (requires authentication)
      .get(
        "/:id",
        ({ params: { id }, error }) => {
          const user = UserModel.findById(id);

          if (!user) {
            return error(404, {
              error: "Not Found",
              message: "User not found",
            });
          }

          return user;
        },
        {
          isAuth: true,
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["Users"],
            summary: "Get user by ID",
          },
        },
      )

      // List all users (requires authentication)
      .get(
        "/",
        ({ query }) => {
          const users = UserModel.findAll();

          // Optional: filter by role
          if (query.role) {
            return users.filter((u) => u.account_role === query.role);
          }

          return users;
        },
        {
          isAuth: true,
          query: t.Object({
            role: t.Optional(t.String()),
          }),
          detail: {
            tags: ["Users"],
            summary: "List all users",
          },
        },
      )

      // Update user (requires authentication)
      .patch(
        "/:id",
        ({ params: { id }, body, user, error }) => {
          // Only allow users to update their own profile or admins
          if (
            user.id !== id &&
            user.account_role !== "admin" &&
            user.account_role !== "sudo"
          ) {
            return error(403, {
              error: "Forbidden",
              message: "You can only update your own profile",
            });
          }

          const updated = UserModel.update(id, body);

          if (!updated) {
            return error(404, {
              error: "Not Found",
              message: "User not found",
            });
          }

          return updated;
        },
        {
          isAuth: true,
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            name: t.Optional(t.String()),
            email: t.Optional(t.String({ format: "email" })),
          }),
          detail: {
            tags: ["Users"],
            summary: "Update user",
          },
        },
      ),
);
