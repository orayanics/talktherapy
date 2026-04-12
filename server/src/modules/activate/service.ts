import {
  issueEmailVerificationOtp,
  verifyEmailVerificationOtp,
} from "@/lib/auth";
import { prisma } from "@/lib/client";
import type {
  TActivateAccountSchema,
  TResendOtpSchema,
  TVerifyOtpSchema,
} from "./model";

const toClientRole = (role: string) => role.toUpperCase();

export async function resendOtp(body: TResendOtpSchema) {
  const email = body.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  await issueEmailVerificationOtp(email);
  return { resent: true };
}

export async function verifyOtp(body: TVerifyOtpSchema) {
  const email = body.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      role: true,
      email: true,
      status: true,
      emailVerified: true,
    },
  });

  if (!user) throw new Error("User not found");

  await verifyEmailVerificationOtp(email, body.otp_code);

  return {
    email: user.email,
    role: toClientRole(user.role),
    status: user.status,
    emailVerified: user.emailVerified,
  };
}

export async function activateAccount(body: TActivateAccountSchema) {
  const email = body.email.trim().toLowerCase();
  const verification = await verifyEmailVerificationOtp(email, body.otp_code);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) throw new Error("User not found");
  const diagnosisId = body.diagnosis_id?.trim();

  if (user.role === "clinician" && !diagnosisId) {
    throw new Error("Diagnosis is required for clinician account");
  }

  const hashedPassword = await Bun.password.hash(body.password);

  const userUpdateData: {
    name: string;
    emailVerified: true;
    status: "active";
    diagnosis_id?: string;
  } = {
    name: body.name,
    emailVerified: true,
    status: "active",
  };

  if (user.role === "clinician" && diagnosisId) {
    userUpdateData.diagnosis_id = diagnosisId;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: userUpdateData,
    }),
    prisma.account.updateMany({
      where: { userId: user.id },
      data: {
        password: hashedPassword,
      },
    }),
    prisma.verification.delete({
      where: { id: verification.id },
    }),
  ]);

  return {
    email,
    role: toClientRole(user.role),
    activated: true,
  };
}
