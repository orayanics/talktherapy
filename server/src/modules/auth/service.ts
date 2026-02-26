// Service handle business logic, decoupled from Elysia controller
import { status } from "elysia";
import type { AuthModel } from "./model";
import type { JwtPayload } from "@/utils/jwt";
import { prisma } from "prisma/db";

// If the class doesn't need to store a property,
// you may use `abstract class` to avoid class allocation
export abstract class Auth {
  static async signIn({ email, password }: AuthModel.signInBody) {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        email: true,
        password: true,
        account_role: true,
      },
    });

    const isValid =
      user &&
      user.account_role &&
      (await Bun.password.verify(password, user.password ?? ""));

    if (!isValid) {
      throw status(
        400,
        "Invalid email or password" satisfies AuthModel.signInInvalid,
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
      throw status(
        400,
        "Invalid input data" satisfies AuthModel.signUpPatientInvalid,
      );
    }

    if (!diagnosis) {
      throw status(
        400,
        "Invalid input data" satisfies AuthModel.signUpPatientInvalid,
      );
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

  static async signUpClinician(data: AuthModel.signUpClinicianBody) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw status(
        400,
        "Invalid input data" satisfies AuthModel.signUpClinicianInvalid,
      );
    }

    if (data.diagnosis_id) {
      const diagnosis = await prisma.diagnosis.findUnique({
        where: { id: data.diagnosis_id },
        select: { id: true },
      });

      if (!diagnosis) {
        throw status(
          400,
          "Invalid input data" satisfies AuthModel.signUpClinicianInvalid,
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          account_status: "active",
          account_role: "clinician",
          account_permissions: "content:read",
          created_by: data.created_by,
        },
      });

      await tx.clinician.create({
        data: {
          user_id: user.id,
          diagnosis_id: data.diagnosis_id ?? null,
        },
      });
    });

    return {
      message: "Clinician account created successfully.",
    };
  }

  static async signUpAdmin(data: AuthModel.signUpAdminBody) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw status(
        400,
        "Invalid input data" satisfies AuthModel.signUpAdminInvalid,
      );
    }

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          account_status: "active",
          account_role: "admin",
          account_permissions: data.account_permissions
            ? data.account_permissions
            : "content:read",
          created_by: data.created_by,
        },
      });

      await tx.admin.create({
        data: {
          user_id: user.id,
        },
      });
    });

    return {
      message: "Admin account created successfully.",
    };
  }

  static async getSession(payload: JwtPayload) {
    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      omit: {
        password: true,
      },
    });

    if (!user) {
      throw status(404, "User not found");
    }

    return {
      user,
    };
  }

  static async updateUserInfo(data: AuthModel.updateProfileBody) {
    const user = await prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
      },
      omit: {
        password: true,
      },
    });

    if (!user) {
      throw status(404, "User not found");
    }

    return {
      message: "Profile updated successfully",
    };
  }
}
