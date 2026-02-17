import { t } from "elysia";
const _shape = t.Object({
  id: t.String(),
  value: t.String(),
  label: t.String(),
  created_at: t.String(),
  updated_at: t.String(),
});

export namespace DiagnosisModel {
  export const diagnosis = _shape;
  export type diagnosis = typeof diagnosis.static;

  export const diagnosisArray = t.Array(
    t.Pick(_shape, ["id", "value", "label"]),
  );
  export type diagnosisArray = typeof diagnosisArray.static;

  export const diagnosisInvalid = t.Literal("Invalid diagnosis data");
  export type diagnosisInvalid = typeof diagnosisInvalid.static;
}
