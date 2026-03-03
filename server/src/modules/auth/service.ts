import { status } from "elysia";
import type { AuthModel } from "./model";
import type { JwtPayload } from "@/utils/jwt";
import { prisma } from "prisma/db";
import {
  createActivationOtp,
  verifyActivationOtp,
  checkActivationOtp,
} from "./helper";
import { sendActivationEmail } from "@/utils/email";

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
      throw status(
        403,
        "Account is not active" satisfies AuthModel.accountInactive,
      );
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.account_role ?? "",
    };

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
          account_status: "inactive",
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
          account_status: "inactive",
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

    return {
      message:
        "Admin account created. An activation OTP has been sent to the provided email.",
    };
  }

  static async resendOtp(data: AuthModel.resendOtpBody) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        account_status: true,
        account_role: true,
      },
    });

    if (
      !user ||
      user.account_status !== "inactive" ||
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

    return { message: "A new OTP has been sent to the provided email." };
  }

  static async verifyOtp(data: AuthModel.verifyOtpBody) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, account_status: true, account_role: true },
    });

    if (
      !user ||
      user.account_status !== "inactive" ||
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
      user.account_status !== "inactive" ||
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

    return { message: "Account activated successfully." };
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

    return { message: "Password changed successfully" };
  }
}
