import { t } from "elysia";

export namespace UserModel {
  const _userShape = t.Object({
    id: t.String(),
    name: t.Nullable(t.String()),
    email: t.String(),
    account_status: t.String(),
    account_role: t.Nullable(t.String()),
    account_permissions: t.Nullable(t.String()),
    created_at: t.String(),
    updated_at: t.String(),
    created_by: t.Optional(t.Nullable(t.String())),
    updated_by: t.Optional(t.Nullable(t.String())),
    deleted_at: t.Optional(t.Nullable(t.String())),
    last_login: t.Optional(t.Nullable(t.String())),
    diagnosis: t.Optional(t.String()),
  });

  const _statusCountItem = t.Object({
    account_status: t.String(),
    count: t.Number(),
  });

  export const user = _userShape;
  export type user = typeof user.static;

  export const userNotFound = t.Literal("User not found");
  export type userNotFound = typeof userNotFound.static;

  export const userInvalid = t.Literal("Invalid user data");
  export type userInvalid = typeof userInvalid.static;

  export const userCounts = t.Object({
    total: t.Number(),
    patients: t.Number(),
    clinicians: t.Number(),
    admins: t.Number(),
    patientStatusCount: t.Array(_statusCountItem),
    clinicianStatusCount: t.Array(_statusCountItem),
    adminStatusCount: t.Array(_statusCountItem),
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
    data: t.Array(_userShape),
    meta: t.Object({
      total: t.Number(),
      page: t.Number(),
      per_page: t.Number(),
      last_page: t.Number(),
      from: t.Number(),
      to: t.Number(),
    }),
  });
  export type userPaginatedResponse = typeof userPaginatedResponse.static;
}
