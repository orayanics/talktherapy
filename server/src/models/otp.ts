import { t } from "elysia";

export const OtpModel = t.Object({
  id: t.Number(),
  user_id: t.String(),
  otp_code: t.Optional(t.String()),
  purpose: t.Optional(t.String()),
  expires_at: t.Optional(t.String()),
  created_at: t.String(),
  updated_at: t.String(),
});
