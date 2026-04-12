import { z } from "zod";

export const RegisterAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email().min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const RegisterClinicianSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email().min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  diagnosis_id: z.string().min(1, "Diagnosis ID is required"),
});

export const RegisterPatientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email().min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  diagnosis_id: z.string().min(1, "Diagnosis ID is required"),
  consent: z.boolean().refine((val) => val === true, {
    message: "Consent must be given",
  }),
});

export type TRegisterAdminSchema = z.infer<typeof RegisterAdminSchema>;
export type TRegisterPatientSchema = z.infer<typeof RegisterPatientSchema>;
export type TRegisterClinicianSchema = z.infer<typeof RegisterClinicianSchema>;
