import { t } from "elysia";

export namespace SlotModel {
  export const slotParams = t.Object({
    slot_id: t.String(),
  });
  export type slotParams = typeof slotParams.static;

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
    diagnosis: t.Optional(t.Array(t.String())),
    clinician_id: t.Optional(t.String()),
    page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
    per_page: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 })),
  });
  export type listQuery = typeof listQuery.static;
}
