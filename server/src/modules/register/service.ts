import { auth } from "@/lib/auth";
import type {
  TRegisterAdminSchema,
  TRegisterClinicianSchema,
  TRegisterPatientSchema,
} from "./model";
import { prisma } from "@/lib/client";

export async function registerAdmin(body: TRegisterAdminSchema) {
  const newUser = await auth.api.createUser({
    body: {
      email: body.email,
      password: body.password,
      name: body.name,
      role: "admin",
    },
  });
  return newUser;
}

export async function registerPatient(body: TRegisterPatientSchema) {
  const newUser = await auth.api.createUser({
    body: {
      email: body.email,
      password: body.password,
      name: body.name,
      role: "patient",
      data: {
        diagnosis_id: body.diagnosis_id,
      },
    },
  });
  await prisma.user.update({
    where: { email: body.email },
    data: {
      diagnosis_id: body.diagnosis_id,
    },
  });
  return newUser;
}

export async function registerClinician(body: TRegisterClinicianSchema) {
  const newUser = await auth.api.createUser({
    body: {
      email: body.email,
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
  return newUser;
}
