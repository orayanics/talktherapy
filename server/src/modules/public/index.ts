import { Elysia } from "elysia";
import { Public } from "./service";
import { DiagnosisModel } from "./model";
import { globalRateLimit } from "@/plugins/rateLimit";

// all public routes and resources
export const publicModule = new Elysia({ prefix: "/public" })
  .use(globalRateLimit)
  .get("/diagnoses", () => Public.getDiagnoses(), {
    response: {
      200: DiagnosisModel.diagnosisArray,
      500: DiagnosisModel.diagnosisInvalid,
    },
  });
