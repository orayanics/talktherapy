import { status } from "elysia";
import { prisma } from "prisma/db";
import { Prisma } from "prisma/generated/browser";

// prisma returns date object however in our api schema it is defined as string
function serializeUser<
  T extends {
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
    last_login: Date | null;
  },
>(user: T) {
  return {
    ...user,
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
    deleted_at: user.deleted_at?.toISOString() ?? null,
    last_login: user.last_login?.toISOString() ?? null,
  };
}

// return format result for groupBy count
function formatStatusCount(
  rows: { account_status: string; _count: { account_status: number } }[],
) {
  return rows.map((row) => ({
    account_status: row.account_status,
    count: row._count.account_status,
  }));
}

export abstract class Users {
  static async getAllUsers(
    role: string,
    params?: {
      search?: string;
      account_status?: string[];
      account_role?: string[];
      page?: number;
      perPage?: number;
    },
  ) {
    const {
      search,
      account_status,
      account_role,
      page = 1,
      perPage = 10,
    } = params ?? {};

    const where: Prisma.UserWhereInput = {
      // admins cannot see other admins or sudo accounts
      ...(role === "admin" && {
        NOT: { account_role: { in: ["admin", "sudo"] } },
      }),
      ...(search && {
        OR: [{ name: { contains: search } }, { email: { contains: search } }],
      }),
      ...(account_status?.length && { account_status: { in: account_status } }),
      ...(account_role?.length && { account_role: { in: account_role } }),
    };

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        omit: { password: true },
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { created_at: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    const last_page = Math.ceil(total / perPage);

    return {
      data: users.map(serializeUser),
      meta: {
        total,
        page,
        per_page: perPage,
        last_page,
        from: total === 0 ? 0 : (page - 1) * perPage + 1,
        to: Math.min(page * perPage, total),
      },
    };
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      omit: { password: true },
      include: {
        clinician: {
          include: { diagnosis: true },
        },
      },
    });
    if (!user) {
      throw status(404, "User not found");
    }
    const { clinician, ...rest } = user;
    return {
      ...serializeUser(rest),
      ...(clinician?.diagnosis && { diagnosis: clinician.diagnosis.label }),
    };
  }

  static async getUserCounts() {
    const countByRole = (role: string) =>
      prisma.user.count({ where: { account_role: role } });

    const statusByRole = (role: string) =>
      prisma.user.groupBy({
        by: ["account_status"],
        where: { account_role: role },
        _count: { account_status: true },
      });

    const [
      total,
      patients,
      clinicians,
      admins,
      patientStatusRows,
      clinicianStatusRows,
      adminStatusRows,
    ] = await Promise.all([
      prisma.user.count({ where: { account_role: { not: "sudo" } } }),
      countByRole("patient"),
      countByRole("clinician"),
      countByRole("admin"),
      statusByRole("patient"),
      statusByRole("clinician"),
      statusByRole("admin"),
    ]);

    return {
      data: {
        total,
        patients,
        clinicians,
        admins,
        patientStatusCount: formatStatusCount(patientStatusRows),
        clinicianStatusCount: formatStatusCount(clinicianStatusRows),
        adminStatusCount: formatStatusCount(adminStatusRows),
      },
    };
  }
}
