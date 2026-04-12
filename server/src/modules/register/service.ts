import { auth, issueEmailVerificationOtp } from "@/lib/auth";
import type {
  TRegisterAdminSchema,
  TRegisterClinicianSchema,
  TRegisterPatientSchema,
} from "./model";
import { prisma } from "@/lib/client";

export async function registerAdmin(body: TRegisterAdminSchema) {
  const normalizedEmail = body.email.trim().toLowerCase();
  const newUser = await auth.api.createUser({
    body: {
      email: normalizedEmail,
      password: body.password,
      name: body.name,
      role: "admin",
    },
  });
  await issueEmailVerificationOtp(normalizedEmail);
  return newUser;
}

export async function registerPatient(body: TRegisterPatientSchema) {
  const normalizedEmail = body.email.trim().toLowerCase();
  const newUser = await auth.api.createUser({
    body: {
      email: normalizedEmail,
      password: body.password,
      name: body.name,
      role: "patient",
      data: {
        diagnosis_id: body.diagnosis_id,
      },
    },
  });
  await prisma.user.update({
    where: { email: normalizedEmail },
    data: {
      diagnosis_id: body.diagnosis_id,
    },
  });
  await issueEmailVerificationOtp(normalizedEmail);
  return newUser;
}

export async function registerClinician(body: TRegisterClinicianSchema) {
  const normalizedEmail = body.email.trim().toLowerCase();
  const newUser = await auth.api.createUser({
    body: {
      email: normalizedEmail,
      password: body.password,
      name: body.name,
      role: "clinician",
    },
  });
  await prisma.user.update({
    where: { email: body.email },
    data: {
      diagnosis_id: body.diagnosis_id,
    },
  });
  await issueEmailVerificationOtp(normalizedEmail);
  return newUser;
}
