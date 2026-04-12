import { z } from "zod";

export const VerifyOtpSchema = z.object({
  email: z.email().min(1, "Email is required"),
  otp_code: z.string().length(6, "OTP code must be 6 digits"),
});

export const ResendOtpSchema = z.object({
  email: z.email().min(1, "Email is required"),
});

export const ActivateAccountSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255),
    email: z.email().min(1, "Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z
      .string()
      .min(8, "Password confirmation must be at least 8 characters"),
    otp_code: z.string().length(6, "OTP code must be 6 digits"),
    diagnosis_id: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export type TVerifyOtpSchema = z.infer<typeof VerifyOtpSchema>;
export type TResendOtpSchema = z.infer<typeof ResendOtpSchema>;
export type TActivateAccountSchema = z.infer<typeof ActivateAccountSchema>;
