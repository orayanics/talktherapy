import { t } from "elysia";

export namespace SlotModel {
  export const slotParams = t.Object({
    slot_id: t.String(),
  });
  export type slotParams = typeof slotParams.static;

  export const listQuery = t.Object({
    from: t.Optional(t.String({ format: "date-time" })),
    to: t.Optional(t.String({ format: "date-time" })),
    status: t.Optional(
      t.Union([
        t.Literal("AVAILABLE"),
        t.Literal("BOOKED"),
        t.Literal("BLOCKED"),
        t.Literal("CANCELLED"),
      ])
    ),
  });
  export type listQuery = typeof listQuery.static;

  export const blockBody = t.Object({
    reason: t.Optional(t.String()),
  });
  export type blockBody = typeof blockBody.static;
}
