import { t } from "elysia";

export namespace AvailabilityModel {
  // ── Request Bodies ──────────────────────────────────────────────

  export const createBody = t.Object({
    starts_at: t.String({ format: "date-time" }),
    ends_at: t.String({ format: "date-time" }),
    recurrence_rule: t.Optional(t.String()),
    horizon_days: t.Optional(
      t.Number({ minimum: 1, maximum: 365, default: 30 }),
    ),
  });
  export type createBody = typeof createBody.static;

  export const updateBody = t.Object({
    starts_at: t.Optional(t.String({ format: "date-time" })),
    ends_at: t.Optional(t.String({ format: "date-time" })),
    recurrence_rule: t.Optional(t.Nullable(t.String())),
    is_active: t.Optional(t.Boolean()),
    horizon_days: t.Optional(
      t.Number({ minimum: 1, maximum: 365, default: 30 }),
    ),
  });
  export type updateBody = typeof updateBody.static;

  export const ruleParams = t.Object({
    rule_id: t.String(),
  });
  export type ruleParams = typeof ruleParams.static;

  export const updateStatusParams = t.Object({
    rule_id: t.String(),
  });
  export type updateStatusParams = typeof updateStatusParams.static;

  // ── Response Shapes ─────────────────────────────────────────────

  export const ruleResponse = t.Object({
    id: t.String(),
    clinician_id: t.String(),
    starts_at: t.String(),
    ends_at: t.String(),
    recurrence_rule: t.Nullable(t.String()),
    is_active: t.Boolean(),
    created_at: t.String(),
    updated_at: t.String(),
    slots: t.Array(
      t.Object({
        id: t.String(),
        starts_at: t.String(),
        ends_at: t.String(),
        status: t.String(),
      }),
    ),
  });
  export type ruleResponse = typeof ruleResponse.static;

  export const listQuery = t.Object({
    from: t.Optional(t.String({ format: "date" })),
    to: t.Optional(t.String({ format: "date" })),
    status: t.Optional(
      t.Union([
        t.Literal("AVAILABLE"),
        t.Literal("BOOKED"),
        t.Literal("BLOCKED"),
        t.Literal("CANCELLED"),
      ]),
    ),
    page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
    per_page: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 })),
  });
  export type listQuery = typeof listQuery.static;
}
