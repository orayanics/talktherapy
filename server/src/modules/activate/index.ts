import Elysia from "elysia";
import { ApiError, ApiSuccess, ok, tryOk } from "@/lib/response";
import {
  ActivateAccountSchema,
  ResendOtpSchema,
  VerifyOtpSchema,
} from "./model";
import { activateAccount, resendOtp, verifyOtp } from "./service";

export const activateModule = new Elysia()
  .post(
    "/otp/resend",
    async ({ body, status }) => {
      const result = await tryOk(() => resendOtp(body));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      body: ResendOtpSchema,
      response: {
        200: ApiSuccess(),
        400: ApiError,
      },
    },
  )
  .post(
    "/otp/verify",
    async ({ body, status }) => {
      const result = await tryOk(() => verifyOtp(body));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      body: VerifyOtpSchema,
      response: {
        200: ApiSuccess(),
        400: ApiError,
      },
    },
  )
  .post(
    "/activate",
    async ({ body, status }) => {
      const result = await tryOk(() => activateAccount(body));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      body: ActivateAccountSchema,
      response: {
        200: ApiSuccess(),
        400: ApiError,
      },
    },
  );
