import { Elysia } from "elysia";
import { Public } from "./service";
import { DiagnosisModel } from "./model";

// all public routes and resources
export const publicModule = new Elysia({ prefix: "/public" }).get(
  "/diagnoses",
  () => Public.getDiagnoses(),
  {
    response: {
      200: DiagnosisModel.diagnosisArray,
      500: DiagnosisModel.diagnosisInvalid,
    },
  },
);
