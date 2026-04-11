import { prisma } from "@/lib/client";
import { buildMeta } from "@/lib/paginate";

import { type TUsersListSchema } from "./model";

export async function fetchAllUsers(params: TUsersListSchema) {
  const {
    page = 1,
    per_page = 20,
    search,
    sort_by = "createdAt",
    sort = "desc",
    role,
    account_status,
  } = params;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { email: { contains: search } },
      { name: { contains: search } },
    ];
  }

  if (role && role.length > 0) {
    where.role = { in: role.map((r) => String(r).trim().toLowerCase()) };
  }

  if (account_status && account_status.length > 0) {
    where.status = {
      in: account_status.map((s) => String(s).trim().toLowerCase()),
    };
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [sort_by]: sort },
      skip: (page - 1) * per_page,
      take: per_page,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data,
    meta: buildMeta(total, page, per_page, data.length),
  };
}

export async function fetchUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  return user ?? undefined;
}
