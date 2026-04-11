import { prisma } from "@/lib/client";
import { buildMeta } from "@/lib/paginate";

export interface UsersQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort?: "asc" | "desc";
  role?: string[];
  account_status?: string[];
}

export async function fetchAllUsers(params: UsersQueryParams) {
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
    where.role = { in: role };
  }

  if (account_status && account_status.length > 0) {
    where.account_status = { in: account_status };
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
