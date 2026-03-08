import { t } from "elysia";

export namespace LogsModel {
  const _logShape = t.Object({
    id: t.String(),
    actor_id: t.Nullable(t.String()),
    actor_email: t.Nullable(t.String()),
    actor_role: t.Nullable(t.String()),
    action: t.String(),
    entity: t.Nullable(t.String()),
    entity_id: t.Nullable(t.String()),
    details: t.Nullable(t.String()),
    created_at: t.String(),
  });

  export const listQuery = t.Object({
    page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
    per_page: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 })),
    search: t.Optional(t.String()),
    action: t.Optional(t.String()),
    date_from: t.Optional(t.String()),
    date_to: t.Optional(t.String()),
  });
  export type listQuery = typeof listQuery.static;

  export const log = _logShape;
  export type log = typeof log.static;

  export const paginatedLogs = t.Object({
    data: t.Array(_logShape),
    meta: t.Object({
      total: t.Number(),
      page: t.Number(),
      per_page: t.Number(),
      last_page: t.Number(),
      from: t.Number(),
      to: t.Number(),
    }),
  });
  export type paginatedLogs = typeof paginatedLogs.static;

  export const exportQuery = t.Object({
    token: t.Optional(t.String()),
    date: t.Optional(t.String()),
  });
  export type exportQuery = typeof exportQuery.static;

  export const wsInbound = t.Object({
    type: t.Literal("start"),
    date: t.Optional(t.String()),
  });
  export type wsInbound = typeof wsInbound.static;
}
