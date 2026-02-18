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

const _countShape = t.Object({
  total: t.Number(),
  patients: t.Number(),
  clinicians: t.Number(),
  admins: t.Number(),
});

export namespace UserModel {
  export const user = _shape;
  export type user = typeof user.static;

  export const userArray = t.Array(_shape);
  export type userArray = typeof userArray.static;

  export const userInvalid = t.Literal("Invalid user data");
  export type userInvalid = typeof userInvalid.static;

  export const userNotFound = t.Literal("User not found");
  export type userNotFound = typeof userNotFound.static;

  // user counts by: all, patients, clinicians, admins
  // also include counts by account status for each role
  export const userCounts = t.Object({
    ..._countShape.properties,
    patientStatusCount: t.Array(
      t.Object({
        account_status: t.String(),
        count: t.Number(),
      }),
    ),
    clinicianStatusCount: t.Array(
      t.Object({
        account_status: t.String(),
        count: t.Number(),
      }),
    ),
    adminStatusCount: t.Array(
      t.Object({
        account_status: t.String(),
        count: t.Number(),
      }),
    ),
  });

  export type userCounts = typeof userCounts.static;
  export const userCountsInvalid = t.Literal("Invalid user counts data");
  export type userCountsInvalid = typeof userCountsInvalid.static;

  export const userQueryParams = t.Object({
    search: t.Optional(t.String()),
    account_status: t.Optional(t.Array(t.String())),
    account_role: t.Optional(t.Array(t.String())),
    page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
    per_page: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 })),
  });

  export const userPaginatedResponse = t.Object({
    data: userArray,
    total: t.Number(),
    page: t.Number(),
    per_page: t.Number(),
    last_page: t.Number(),
    from: t.Number(),
    to: t.Number(),
  });

  export const getUsersResponse = userPaginatedResponse;
  export type getUsersResponse = typeof getUsersResponse.static;
}
