import Elysia from "elysia";
import { fetchAllDiagnoses } from "./service";
import { ApiSuccess, ApiError, tryOk, ok } from "@/lib/response";

export const publicModule = new Elysia({ prefix: "/public" }).get(
  "/diagnoses",
  async ({ status }) => {
    const result = await tryOk(() => fetchAllDiagnoses());
    if (!result.success) return status(500, result);
    return status(200, ok(result.data));
  },
  {
    response: {
      200: ApiSuccess(),
      500: ApiError,
    },
  },
);
