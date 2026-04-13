import { prisma } from "@/lib/client";
import { buildMeta } from "@/lib/paginate";
import {
  notifySafe,
  NotificationTemplates,
} from "@/modules/notifications/service";

export async function listSoapsByPatient(patientUserId: string, query: any) {
  const page = Number(query?.page ?? 1);
  const per_page = Number(query?.per_page ?? 15);
  const sort = query?.sort ?? "desc";

  const where: any = { patientId: patientUserId };

  const total = await prisma.soap.count({ where });
  const data = await prisma.soap.findMany({
    where,
    orderBy: { createdAt: sort === "asc" ? "asc" : "desc" },
    skip: (page - 1) * per_page,
    take: per_page,
    include: {
      clinician: { select: { id: true, name: true, email: true } },
      patient: { select: { id: true, name: true, email: true } },
    },
  });

  return { data, meta: buildMeta(total, page, per_page, data.length) };
}

export async function fetchSoapById(id: string) {
  const soap = await prisma.soap.findUnique({
    where: { id },
    include: {
      clinician: { select: { id: true, name: true, email: true } },
      patient: { select: { id: true, name: true, email: true } },
    },
  });
  if (!soap) throw new Error("Not found");
  return soap;
}

export async function createSoap(
  patientUserId: string,
  clinicianId: string,
  payload: any,
) {
  const created = await prisma.soap.create({
    data: {
      patientId: patientUserId,
      clinicianId,
      activity_plan: payload.activity_plan,
      session_type: payload.session_type ?? null,
      subjective_notes: payload.subjective_notes ?? null,
      objective_notes: payload.objective_notes ?? null,
      assessment: payload.assessment ?? null,
      recommendation: payload.recommendation ?? null,
      comments: payload.comments ?? null,
    },
  });
  try {
    const full = await prisma.soap.findUnique({
      where: { id: created.id },
      include: { clinician: { select: { id: true, name: true } } },
    });
    await notifySafe(
      NotificationTemplates.soapCreatedPatient({
        userId: created.patientId,
        clinicianName: full?.clinician?.name,
        id: created.id,
      }),
    );
  } catch (e) {
    // best-effort
  }
  return created;
}

export async function updateSoap(
  id: string,
  clinicianId: string,
  payload: any,
) {
  const soap = await prisma.soap.findUnique({ where: { id } });
  if (!soap) throw new Error("Not found");
  if (soap.clinicianId !== clinicianId) throw new Error("Forbidden");

  const updated = await prisma.soap.update({
    where: { id },
    data: {
      activity_plan: payload.activity_plan ?? soap.activity_plan,
      session_type: payload.session_type ?? soap.session_type,
      subjective_notes: payload.subjective_notes ?? soap.subjective_notes,
      objective_notes: payload.objective_notes ?? soap.objective_notes,
      assessment: payload.assessment ?? soap.assessment,
      recommendation: payload.recommendation ?? soap.recommendation,
      comments: payload.comments ?? soap.comments,
    },
  });

  try {
    const full = await prisma.soap.findUnique({
      where: { id: updated.id },
      include: { clinician: { select: { id: true, name: true } } },
    });
    await notifySafe(
      NotificationTemplates.soapUpdatedPatient({
        userId: updated.patientId,
        clinicianName: full?.clinician?.name,
        id: updated.id,
      }),
    );
  } catch (e) {
    // best-effort
  }

  return updated;
}
