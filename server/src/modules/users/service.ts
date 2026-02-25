import { status } from "elysia";
import { prisma } from "prisma/db";
import { Prisma } from "prisma/generated/browser";

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
    } = params || {};
    const where: Prisma.UserWhereInput = {
      // admins can't see other admins or sudo
      ...(role === "admin" && {
        NOT: { account_role: { in: ["admin", "sudo"] } },
      }),
      // search across name and email
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
      data: users,
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
    const where: Prisma.UserWhereUniqueInput = { id };
    const user = await prisma.user.findUnique({
      where: where,
      omit: { password: true },
    });
    if (!user) {
      throw status(404, "User not found");
    }
    return user;
  }

  static async getUserCounts() {
    // get total (no sudo), patients, clinicians, admins
    // get each account status count: active, pending, suspended, deactivated
    const total = await prisma.user.count({
      where: {
        account_role: {
          not: "sudo",
        },
      },
    });
    const patients = await prisma.user.count({
      where: {
        account_role: "patient",
      },
    });
    // count patients per status
    const patientStatusCount = await prisma.user.groupBy({
      by: ["account_status"],
      where: {
        account_role: "patient",
      },
      _count: {
        account_status: true,
      },
    });
    const formattedPatientStatusCount = patientStatusCount.map((item) => ({
      account_status: item.account_status,
      count: item._count.account_status,
    }));

    const clinicians = await prisma.user.count({
      where: {
        account_role: "clinician",
      },
    });
    const cliniciansStatusCount = await prisma.user.groupBy({
      by: ["account_status"],
      where: {
        account_role: "clinician",
      },
      _count: {
        account_status: true,
      },
    });
    const formattedCliniciansStatusCount = cliniciansStatusCount.map(
      (item) => ({
        account_status: item.account_status,
        count: item._count.account_status,
      }),
    );

    const admins = await prisma.user.count({
      where: {
        account_role: "admin",
      },
    });
    const adminStatusCount = await prisma.user.groupBy({
      by: ["account_status"],
      where: {
        account_role: "admin",
      },
      _count: {
        account_status: true,
      },
    });
    const formattedAdminStatusCount = adminStatusCount.map((item) => ({
      account_status: item.account_status,
      count: item._count.account_status,
    }));

    return {
      total,
      patients,
      clinicians,
      admins,
      patientStatusCount: formattedPatientStatusCount,
      clinicianStatusCount: formattedCliniciansStatusCount,
      adminStatusCount: formattedAdminStatusCount,
    };
  }
}
