import { status } from "elysia";
import type { AuthModel } from "./model";
import type { JwtPayload } from "@/utils/jwt";
import { prisma } from "prisma/db";
import { nowUtc } from "@/utils/date";
import {
  createActivationOtp,
  verifyActivationOtp,
  checkActivationOtp,
} from "./helper";
import { sendActivationEmail } from "@/utils/email";
import { logAction, AUDIT_ACTION, AUDIT_ENTITY } from "@/utils/audit";

export abstract class Auth {
  static async signIn({ email, password }: AuthModel.signInBody) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        account_role: true,
        account_status: true,
      },
    });

    if (
      !user ||
      !user.account_role ||
      !(await Bun.password.verify(password, user.password ?? ""))
    ) {
      throw status(
        400,
        "Invalid email or password" satisfies AuthModel.signInInvalid,
      );
    }

    if (user.account_status !== "active") {
      // if suspended or deactivated
      if (
        user.account_status === "suspended" ||
        user.account_status === "deactivated"
      ) {
        throw status(
          403,
          "Account is not active. Contact support for assistance" satisfies AuthModel.accountInactive,
        );
      }

      throw status(
        403,
        "Account is pending activation" satisfies AuthModel.accountPending,
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: nowUtc() },
    });

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.account_role ?? "",
    };

    logAction({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.account_role ?? null,
      action: AUDIT_ACTION.LOGIN,
      entity: AUDIT_ENTITY.SESSION,
      details: "User logged in successfully",
    });

    return {
      email: user.email,
      role: user.account_role,
      payload,
    };
  }

  static async signUpPatient(data: AuthModel.signUpPatientBody) {
    const hashedPassword = await Bun.password.hash(data.password);

    const [existingUser, diagnosis] = await Promise.all([
      prisma.user.findUnique({ where: { email: data.email } }),
      prisma.diagnosis.findUnique({
        where: { id: data.diagnosis_id },
        select: { id: true },
      }),
    ]);

    if (existingUser) {
      throw status(400, "Invalid input data" satisfies AuthModel.InvalidInput);
    }

    if (!diagnosis) {
      throw status(400, "Invalid input data" satisfies AuthModel.InvalidInput);
    }

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          account_status: "active",
          account_role: "patient",
          account_permissions: "content:read",
        },
      });

      await tx.patient.create({
        data: {
          user_id: user.id,
          diagnosis_id: diagnosis.id,
        },
      });
    });

    logAction({
      actorEmail: data.email,
      actorRole: "patient",
      action: AUDIT_ACTION.REGISTER_PATIENT,
      entity: AUDIT_ENTITY.USER,
      details: `Patient registered: ${data.email}`,
    });

    return {
      message: "Patient account created successfully.",
    };
  }

  static async signUpClinician(
    data: AuthModel.signUpClinicianBody,
    createdBy?: string,
  ) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw status(400, "Invalid input data" satisfies AuthModel.InvalidInput);
    }

    if (data.diagnosis_id) {
      const diagnosis = await prisma.diagnosis.findUnique({
        where: { id: data.diagnosis_id },
        select: { id: true },
      });

      if (!diagnosis) {
        throw status(
          400,
          "Invalid input data" satisfies AuthModel.InvalidInput,
        );
      }
    }

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          account_status: "pending",
          account_role: "clinician",
          account_permissions: "content:read",
          created_by: createdBy,
        },
      });

      await tx.clinician.create({
        data: {
          user_id: user.id,
          diagnosis_id: data.diagnosis_id ?? null,
        },
      });

      return user;
    });

    const otpCode = await createActivationOtp(newUser.id);
    await sendActivationEmail(newUser.email, otpCode);

    logAction({
      actorId: createdBy,
      actorEmail: data.email,
      actorRole: "clinician",
      action: AUDIT_ACTION.REGISTER_CLINICIAN,
      entity: AUDIT_ENTITY.USER,
      entityId: newUser.id,
      details: `Clinician account created: ${data.email}`,
    });
    logAction({
      actorEmail: data.email,
      action: AUDIT_ACTION.OTP_SENT,
      entity: AUDIT_ENTITY.OTP,
      entityId: newUser.id,
      details: "Activation OTP sent to clinician",
    });

    return {
      message:
        "Clinician account created. An activation OTP has been sent to the provided email.",
    };
  }

  static async signUpAdmin(
    data: AuthModel.signUpAdminBody,
    createdBy?: string,
  ) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw status(400, "Invalid input data" satisfies AuthModel.InvalidInput);
    }

    const newUser = await prisma.$transaction(async (tx) => {
      const permissions =
        data.abilities && data.abilities.length > 0
          ? data.abilities.join(",")
          : "content:read";

      const user = await tx.user.create({
        data: {
          email: data.email,
          account_status: "pending",
          account_role: "admin",
          account_permissions: permissions,
          created_by: createdBy,
        },
      });

      await tx.admin.create({
        data: {
          user_id: user.id,
        },
      });

      return user;
    });

    const otpCode = await createActivationOtp(newUser.id);
    await sendActivationEmail(newUser.email, otpCode);

    logAction({
      actorId: createdBy,
      actorEmail: data.email,
      actorRole: "admin",
      action: AUDIT_ACTION.REGISTER_ADMIN,
      entity: AUDIT_ENTITY.USER,
      entityId: newUser.id,
      details: `Admin account created: ${data.email}`,
    });
    logAction({
      actorEmail: data.email,
      action: AUDIT_ACTION.OTP_SENT,
      entity: AUDIT_ENTITY.OTP,
      entityId: newUser.id,
      details: "Activation OTP sent to admin",
    });

    return {
      message:
        "Admin account created. An activation OTP has been sent to the provided email.",
    };
  }

  static async resendOtp(data: AuthModel.resendOtpBody) {
    const user = await prisma.user.findUnique({
      where: { id: data.id },
      select: {
        id: true,
        email: true,
        account_status: true,
        account_role: true,
      },
    });

    if (
      !user ||
      user.account_status !== "pending" ||
      !(user.account_role === "admin" || user.account_role === "clinician")
    ) {
      throw status(400, "Invalid request" satisfies AuthModel.resendOtpInvalid);
    }

    // Clear all existing activation OTPs before issuing a fresh one
    await prisma.otp.deleteMany({
      where: { user_id: user.id, purpose: "account_activation" },
    });

    const otpCode = await createActivationOtp(user.id);
    await sendActivationEmail(user.email, otpCode);

    logAction({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.account_role,
      action: AUDIT_ACTION.OTP_RESENT,
      entity: AUDIT_ENTITY.OTP,
      entityId: user.id,
      details: "Activation OTP resent",
    });

    return { message: "A new OTP has been sent to the provided email." };
  }

  static async verifyOtp(data: AuthModel.verifyOtpBody) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, account_status: true, account_role: true },
    });

    if (
      !user ||
      user.account_status !== "pending" ||
      !(user.account_role === "admin" || user.account_role === "clinician")
    ) {
      throw status(
        400,
        "Invalid email or OTP" satisfies AuthModel.verifyOtpInvalid,
      );
    }

    const valid = await checkActivationOtp(user.id, data.otp_code);
    if (!valid) {
      throw status(
        400,
        "Invalid or expired OTP" satisfies AuthModel.verifyOtpInvalid,
      );
    }

    logAction({
      actorId: user.id,
      actorRole: user.account_role,
      action: AUDIT_ACTION.OTP_VERIFIED,
      entity: AUDIT_ENTITY.OTP,
      entityId: user.id,
      details: "Activation OTP verified",
    });

    return { message: "OTP verified", account_role: user.account_role };
  }

  static async activateAccount(data: AuthModel.activateBody) {
    if (data.password !== data.password_confirmation) {
      throw status(
        400,
        "Passwords do not match" satisfies AuthModel.activateInvalid,
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, account_status: true, account_role: true },
    });

    if (
      !user ||
      user.account_status !== "pending" ||
      !(user.account_role === "admin" || user.account_role === "clinician")
    ) {
      throw status(400, "Invalid request" satisfies AuthModel.activateInvalid);
    }

    const valid = await verifyActivationOtp(user.id, data.otp_code);
    if (!valid) {
      throw status(
        400,
        "Invalid or expired OTP" satisfies AuthModel.activateInvalid,
      );
    }

    const hashedPassword = await Bun.password.hash(data.password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        password: hashedPassword,
        account_status: "active",
      },
    });

    if (user.account_role === "clinician" && data.diagnosis_id) {
      const diagnosis = await prisma.diagnosis.findUnique({
        where: { id: data.diagnosis_id },
        select: { id: true },
      });
      if (diagnosis) {
        await prisma.clinician.update({
          where: { user_id: user.id },
          data: { diagnosis_id: diagnosis.id },
        });
      }
    }

    logAction({
      actorId: user.id,
      actorRole: user.account_role,
      action: AUDIT_ACTION.ACCOUNT_ACTIVATED,
      entity: AUDIT_ENTITY.ACCOUNT,
      entityId: user.id,
      details: "Account activated",
    });

    return { message: "Account activated successfully." };
  }

  static async deactivateAccount(data: AuthModel.deactivateBody) {
    const user = await prisma.user.findUnique({
      where: { id: data.id },
      select: { id: true, account_status: true, account_role: true },
    });

    // Deactivation is only allowed for account status: active
    if (!user || user.account_status !== "active") {
      throw status(
        400,
        "Account is not valid for deactivation" satisfies AuthModel.deactivateInvalid,
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { account_status: "deactivated" },
      }),
      prisma.refreshToken.updateMany({
        where: { user_id: user.id, revoked_at: null },
        data: { revoked_at: nowUtc() },
      }),
    ]);

    logAction({
      actorId: user.id,
      actorRole: user.account_role,
      action: AUDIT_ACTION.ACCOUNT_DEACTIVATED,
      entity: AUDIT_ENTITY.ACCOUNT,
      entityId: user.id,
      details: "Account deactivated",
    });

    return { message: "Account deactivated successfully." };
  }

  // Reactivation is only allowed for account status: deactivated or suspended
  static async reactivateAccount(data: AuthModel.reactivateBody) {
    const user = await prisma.user.findUnique({
      where: { id: data.id },
      select: { id: true, account_status: true, account_role: true },
    });

    if (
      !user ||
      (user.account_status !== "deactivated" &&
        user.account_status !== "suspended")
    ) {
      throw status(
        400,
        "Account is not valid for reactivation" satisfies AuthModel.reactivateInvalid,
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { account_status: "active" },
    });

    logAction({
      actorId: user.id,
      actorRole: user.account_role,
      action: AUDIT_ACTION.ACCOUNT_REACTIVATED,
      entity: AUDIT_ENTITY.ACCOUNT,
      entityId: user.id,
      details: "Account reactivated",
    });

    return { message: "Account reactivated successfully." };
  }

  static async suspendAccount(data: AuthModel.suspendBody) {
    const user = await prisma.user.findUnique({
      where: { id: data.id },
      select: { id: true, account_status: true, account_role: true },
    });

    // Suspension is only allowed for account status: active
    if (!user || user.account_status !== "active") {
      throw status(
        400,
        "Account is not valid for suspension" satisfies AuthModel.suspendInvalid,
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { account_status: "suspended" },
      }),
      prisma.refreshToken.updateMany({
        where: { user_id: user.id, revoked_at: null },
        data: { revoked_at: nowUtc() },
      }),
    ]);

    logAction({
      actorId: user.id,
      actorRole: user.account_role,
      action: AUDIT_ACTION.ACCOUNT_SUSPENDED,
      entity: AUDIT_ENTITY.ACCOUNT,
      entityId: user.id,
      details: "Account suspended",
    });

    return { message: "Account suspended successfully." };
  }

  static async getSession(payload: JwtPayload) {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      omit: { password: true },
      include: {
        clinician: {
          select: {
            diagnosis: {
              select: { label: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw status(404, "User not found");
    }

    const { clinician, ...rest } = user;

    return {
      user: {
        ...rest,
        ...(clinician && { diagnosis: clinician.diagnosis?.label ?? null }),
      },
    };
  }

  static async updateUserInfo(
    userId: string,
    data: AuthModel.updateProfileBody,
  ) {
    await prisma.user.update({
      where: { id: userId },
      data: { name: data.name },
    });

    return { message: "Profile updated successfully" };
  }

  static async changePassword(
    userId: string,
    data: AuthModel.changePasswordBody,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw status(404, "User not found");
    }

    const isCurrentValid = await Bun.password.verify(
      data.current_password,
      user.password ?? "",
    );

    if (!isCurrentValid) {
      throw status(400, "Current password is incorrect.");
    }

    const isSamePassword = await Bun.password.verify(
      data.new_password,
      user.password ?? "",
    );

    if (isSamePassword) {
      throw status(
        400,
        "New password must not be the same as current password.",
      );
    }

    if (data.new_password !== data.new_password_confirmation) {
      throw status(400, "New password and confirmation do not match.");
    }

    const hashedPassword = await Bun.password.hash(data.new_password);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    logAction({
      actorId: userId,
      action: AUDIT_ACTION.CHANGE_PASSWORD,
      entity: AUDIT_ENTITY.USER,
      entityId: userId,
      details: "Password changed successfully",
    });

    return { message: "Password changed successfully" };
  }
}
