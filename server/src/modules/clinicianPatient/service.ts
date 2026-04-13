import { prisma } from "@/lib/client";

export async function fetchClinicianPatients(query: any, clincianId: string) {
  const per_page = Number(query?.per_page ?? 15);
  const page = Number(query?.page ?? 1);
  const search = query?.search ?? null;

  const where: any = { clinicianId: clincianId };
  if (search) {
    where.patient = { name: { contains: String(search) } };
  }

  const total = await prisma.clinicianPatient.count({ where });
  const items = await prisma.clinicianPatient.findMany({
    where,
    include: {
      clinician: { select: { id: true, name: true, email: true } },
      patient: { select: { id: true, name: true, email: true } },
    },
    skip: (page - 1) * per_page,
    take: per_page,
    orderBy: { firstCompletedAt: "desc" },
  });

  return { data: items, meta: { total, page, per_page, count: items.length } };
}
