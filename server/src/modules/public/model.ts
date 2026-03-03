import { t } from "elysia";

export namespace DiagnosisModel {
  const _shape = t.Object({
    id: t.String(),
    value: t.String(),
    label: t.String(),
  });

  export const diagnosisArray = t.Array(_shape);
  export type diagnosisArray = typeof diagnosisArray.static;

  export const diagnosisInvalid = t.Literal("Invalid diagnosis data");
  export type diagnosisInvalid = typeof diagnosisInvalid.static;
}
