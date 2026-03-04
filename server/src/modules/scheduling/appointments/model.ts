import { t } from "elysia";

export namespace AppointmentModel {
  const _statusUnion = t.Optional(
    t.Union([
      t.Literal("PENDING"),
      t.Literal("CONFIRMED"),
      t.Literal("CANCELLED"),
      t.Literal("COMPLETED"),
      t.Literal("NO_SHOW"),
    ]),
  );

  export const appointmentParams = t.Object({
    appointment_id: t.String(),
  });
  export type appointmentParams = typeof appointmentParams.static;

  export const listQuery = t.Object({
    status: _statusUnion,
    from: t.Optional(t.String({ format: "date-time" })),
    to: t.Optional(t.String({ format: "date-time" })),
  });
  export type listQuery = typeof listQuery.static;

  export const cancelBody = t.Object({
    reason: t.String({ minLength: 1 }),
    keep_blocked: t.Optional(t.Boolean()),
  });
  export type cancelBody = typeof cancelBody.static;

  // shared by clinician and patient reschedule routes
  export const rescheduleBody = t.Object({
    new_slot_id: t.String(),
  });
  export type rescheduleBody = typeof rescheduleBody.static;

  export const noShowBody = t.Object({
    reason: t.String({ minLength: 1 }),
  });
  export type noShowBody = typeof noShowBody.static;

  export const bookBody = t.Object({
    medical_diagnosis: t.String({ minLength: 1 }),
    source_referral: t.String({ minLength: 1 }),
    chief_complaint: t.String({ minLength: 1 }),
    referral_url: t.String({ minLength: 1 }), // TODO: implement file upload
  });
  export type bookBody = typeof bookBody.static;

  export const patientListQuery = t.Object({
    status: _statusUnion,
    from: t.Optional(t.String({ format: "date-time" })),
    to: t.Optional(t.String({ format: "date-time" })),
    page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
    per_page: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 })),
  });
  export type patientListQuery = typeof patientListQuery.static;

  export const patientCancelBody = t.Object({
    reason: t.String({ minLength: 1 }),
  });
  export type patientCancelBody = typeof patientCancelBody.static;

  export const handledPatientsQuery = t.Object({
    search: t.Optional(t.String()),
    page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
    per_page: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 })),
  });
  export type handledPatientsQuery = typeof handledPatientsQuery.static;

  export const patientDetailParams = t.Object({
    patient_id: t.String(),
  });
  export type patientDetailParams = typeof patientDetailParams.static;

  export const patientDetailQuery = t.Object({
    from: t.Optional(t.String({ format: "date-time" })),
    to: t.Optional(t.String({ format: "date-time" })),
    page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
    per_page: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 })),
  });
  export type patientDetailQuery = typeof patientDetailQuery.static;
}
