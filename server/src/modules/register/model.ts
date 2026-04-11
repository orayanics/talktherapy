import { z } from "zod";

export const RegisterAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email().min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const RegisterUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email().min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  diagnosis_id: z.string().min(1, "Diagnosis ID is required"),
});

export type TRegisterAdminSchema = z.infer<typeof RegisterAdminSchema>;
export type TRegisterUserSchema = z.infer<typeof RegisterUserSchema>;
