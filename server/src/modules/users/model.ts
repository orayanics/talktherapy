import { t } from "elysia";

const _shape = t.Object({
  id: t.String(),
  name: t.Nullable(t.String()),
  email: t.String(),
  password: t.Optional(t.String()),
  account_status: t.String(),
  account_role: t.Nullable(t.String()),
  account_permissions: t.Nullable(t.String()),
  created_at: t.String(),
  updated_at: t.String(),
  created_by: t.Optional(t.Nullable(t.String())),
  updated_by: t.Optional(t.Nullable(t.String())),
  deleted_at: t.Optional(t.Nullable(t.String())),
});

export namespace UserModel {
  export const user = _shape;
  export type user = typeof user.static;

  export const userArray = t.Array(_shape);
  export type userArray = typeof userArray.static;

  export const userInvalid = t.Literal("Invalid user data");
  export type userInvalid = typeof userInvalid.static;
}
