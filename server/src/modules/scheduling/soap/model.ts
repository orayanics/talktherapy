import { t } from "elysia";

export namespace SoapModel {
  export const soapParams = t.Object({
    soap_id: t.String(),
  });
  export type soapParams = typeof soapParams.static;

  export const patientParams = t.Object({
    patient_id: t.String(),
  });
  export type patientParams = typeof patientParams.static;

  const _information = t.Object({
    activity_plan: t.String({ minLength: 1 }),
    session_type: t.String({ minLength: 1 }),
    subjective_notes: t.String({ minLength: 1 }),
    objective_notes: t.String({ minLength: 1 }),
    assessment: t.String({ minLength: 1 }),
    recommendation: t.String({ minLength: 1 }),
    comments: t.Optional(t.String()),
  });

  export const createBody = _information;
  export type createBody = typeof createBody.static;

  export const updateBody = t.Partial(_information);
  export type updateBody = typeof updateBody.static;

  export const patientListQuery = t.Object({
    from: t.Optional(t.String({ format: "date" })),
    to: t.Optional(t.String({ format: "date" })),
    clinician_name: t.Optional(t.String()),
    page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
    per_page: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 })),
  });
  export type patientListQuery = typeof patientListQuery.static;
}
