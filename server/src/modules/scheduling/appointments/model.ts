import { t } from "elysia";

export namespace AppointmentModel {
  export const appointmentParams = t.Object({
    appointment_id: t.String(),
  });
  export type appointmentParams = typeof appointmentParams.static;

  export const listQuery = t.Object({
    status: t.Optional(
      t.Union([
        t.Literal("PENDING"),
        t.Literal("CONFIRMED"),
        t.Literal("CANCELLED"),
        t.Literal("COMPLETED"),
        t.Literal("NO_SHOW"),
      ])
    ),
    from: t.Optional(t.String({ format: "date-time" })),
    to: t.Optional(t.String({ format: "date-time" })),
  });
  export type listQuery = typeof listQuery.static;

  export const cancelBody = t.Object({
    reason: t.Optional(t.String()),
  });
  export type cancelBody = typeof cancelBody.static;

  export const rescheduleBody = t.Object({
    new_slot_id: t.String(),
  });
  export type rescheduleBody = typeof rescheduleBody.static;

  export const noShowBody = t.Object({
    reason: t.Optional(t.String()),
  });
  export type noShowBody = typeof noShowBody.static;
}
