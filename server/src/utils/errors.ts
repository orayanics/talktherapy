import { t } from "elysia";

export const validationError = t.Object({
  message: t.String(),
  errors: t.Record(t.String(), t.Array(t.String())),
});
export type ValidationError = typeof validationError.static;

export const notFoundError = t.Object({
  message: t.String(),
});
export type NotFoundError = typeof notFoundError.static;

export const internalServerError = t.Object({
  message: t.String(),
});
export type InternalServerError = typeof internalServerError.static;

export const customMessages: Record<string, string> = {
  email: "Valid email is required.",
  password: "Password is required.",
  name: "Name must be between 2 and 100 characters long.",
  consent: "Consent must be true to continue.",
  diagnosis_id: "Diagnosis is required.",
  current_password: "Current password is required.",
  new_password:
    "New password must contain uppercase, lowercase, number, and special character",
  new_password_confirmation:
    "Confirmation must contain uppercase, lowercase, number, and special character",
  chief_complaint: "Chief complaint is required.",
  medical_diagnosis: "Medical diagnosis is required.",
  source_referral: "Source referral is required.",
  referral_url: "Referral document is required.",
  otp_code: "OTP code is required.",
};
