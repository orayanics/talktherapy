import { Elysia } from "elysia";
import { Public } from "./service";
import { DiagnosisModel } from "./model";

export const publicModule = new Elysia({ prefix: "/public" }).get(
  "/diagnoses",
  async () => {
    const diagnoses = await Public.getDiagnoses();
    return diagnoses;
  },
  {
    response: {
      200: DiagnosisModel.diagnosisArray,
      400: DiagnosisModel.diagnosisInvalid,
    },
  },
);
