import { prisma } from "@/lib/client";
import { differenceInHours, startOfDay, addDays } from "date-fns";
import { buildMeta } from "@/lib/paginate";

export async function acceptAppointment(
  appointmentId: string,
  clinicianId: string,
) {
  return prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findUnique({
      where: { id: appointmentId },
      include: { slot: true },
    });
    if (!appointment) throw new Error("Appointment not found");
    if (appointment.status !== "PENDING")
      throw new Error("Only pending appointments can be accepted");

    const roomId =
      typeof crypto !== "undefined" && (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : appointmentId;

    const updated = await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "ACCEPTED",
        confirmedAt: new Date(),
        clinicianId,
        roomId,
      },
    });

    if (appointment.slotId) {
      await tx.slot.update({
        where: { id: appointment.slotId },
        data: { status: "ACCEPTED" },
      });
    }

    await tx.appointmentEvent.create({
      data: {
        appointmentId,
        type: "STATUS_CHANGE",
        actorType: "CLINICIAN",
        actorId: clinicianId,
      },
    });

    return updated;
  });
}

export async function rejectAppointment(
  appointmentId: string,
  clinicianId: string,
  reason = "",
  isHidden = false,
) {
  return prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findUnique({
      where: { id: appointmentId },
      include: { slot: true },
    });
    if (!appointment) throw new Error("Appointment not found");
    if (appointment.status !== "PENDING")
      throw new Error("Only pending appointments can be rejected");

    if (!appointment.slot) throw new Error("Associated slot not found");
    const hoursToStart = differenceInHours(
      new Date(appointment.slot.startAt),
      new Date(),
    );
    if (hoursToStart < 24)
      throw new Error(
        "Cannot reject appointment less than 1 day before start time.",
      );

    const updated = await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: "REJECT", cancelledAt: new Date() },
    });

    if (appointment.slot) {
      if (isHidden) {
        await tx.slot.update({
          where: { id: appointment.slot.id },
          data: { status: "REJECT", isHidden: true },
        });
      } else {
        await tx.slot.update({
          where: { id: appointment.slot.id },
          data: { status: "FREE", isHidden: false },
        });
      }
    }

    await tx.appointmentEvent.create({
      data: {
        appointmentId,
        type: "STATUS_CHANGE",
        actorType: "CLINICIAN",
        actorId: clinicianId,
        reason,
      },
    });

    return updated;
  });
}

export async function cancelAppointment(
  appointmentId: string,
  actorId: string,
  reason = "",
) {
  return prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findUnique({
      where: { id: appointmentId },
      include: { slot: true },
    });
    if (!appointment) throw new Error("Appointment not found");
    if (appointment.status !== "PENDING")
      throw new Error("Only pending appointments can be cancelled");

    if (!appointment.slot) throw new Error("Associated slot not found");
    const hoursToStart = differenceInHours(
      new Date(appointment.slot.startAt),
      new Date(),
    );
    if (hoursToStart < 24)
      throw new Error(
        "Cannot cancel appointment less than 1 day before start time.",
      );

    const updated = await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    if (appointment.slot) {
      await tx.slot.update({
        where: { id: appointment.slot.id },
        data: { status: "CANCELLED" },
      });
    }

    await tx.appointmentEvent.create({
      data: {
        appointmentId,
        type: "STATUS_CHANGE",
        actorType: "PATIENT",
        actorId,
        reason,
      },
    });

    return updated;
  });
}

export async function completeAppointment(
  appointmentId: string,
  clinicianId: string,
) {
  return prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findUnique({
      where: { id: appointmentId },
      include: { slot: true, patient: true },
    });
    if (!appointment) throw new Error("Appointment not found");
    if (appointment.status !== "ACCEPTED")
      throw new Error("Only accepted appointments can be completed");

    const updated = await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    if (appointment.slotId) {
      await tx.slot.update({
        where: { id: appointment.slotId },
        data: { status: "COMPLETED" },
      });
    }

    // record clinician-patient relationship
    const patientUserId =
      (appointment.patient as any)?.id ?? appointment.patientId;
    await tx.clinicianPatient.upsert({
      where: {
        clinicianId_patientId: { clinicianId, patientId: patientUserId },
      },
      update: {
        firstCompletedAt:
          (
            await tx.clinicianPatient.findUnique({
              where: {
                clinicianId_patientId: {
                  clinicianId,
                  patientId: patientUserId,
                },
              },
            })
          )?.firstCompletedAt ?? new Date(),
      },
      create: {
        clinicianId,
        patientId: patientUserId,
        firstCompletedAt: new Date(),
      },
    });

    await tx.appointmentEvent.create({
      data: {
        appointmentId,
        type: "STATUS_CHANGE",
        actorType: "CLINICIAN",
        actorId: clinicianId,
      },
    });

    return updated;
  });
}

export async function fetchAppointmentById(id: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      slot: {
        include: {
          availabilityRule: {
            include: {
              clinician: { select: { id: true, name: true, email: true } },
            },
          },
        },
      },
      patient: { select: { id: true, name: true, email: true } },
      clinician: {
        select: {
          id: true,
          name: true,
          diagnosis: { select: { id: true, value: true, label: true } },
        },
      },
      events: true,
      encounter: true,
    },
  });
  if (!appointment) throw new Error("Not found");
  return appointment;
}

export async function fetchAppointmentsByClinician(
  clinicianId: string,
  query: any,
) {
  const page = Number(query?.page ?? 1);
  const per_page = Number(query?.per_page ?? 15);
  const sort = query?.sort;

  const where: any = { clinicianId };

  const total = await prisma.appointment.count({ where });

  const orderBy: any = query?.sort
    ? { slot: { startAt: query.sort === "asc" ? "asc" : "desc" } }
    : { bookedAt: "desc" };

  const data = await prisma.appointment.findMany({
    where,
    orderBy,
    skip: (page - 1) * per_page,
    take: per_page,
    include: {
      slot: true,
      patient: {
        select: {
          name: true,
        },
      },
      clinician: {
        select: {
          name: true,
        },
      },
      events: true,
      encounter: true,
    },
  });

  return { data, meta: buildMeta(total, page, per_page, data.length) };
}

export async function fetchAppointmentsByPatient(
  patientId: string,
  query: any,
) {
  const page = Number(query?.page ?? 1);
  const per_page = Number(query?.per_page ?? 15);
  const sort = query?.sort;

  const where: any = { patientId };

  const total = await prisma.appointment.count({ where });

  const orderBy: any = query?.sort
    ? { slot: { startAt: query.sort === "asc" ? "asc" : "desc" } }
    : { bookedAt: "desc" };

  const data = await prisma.appointment.findMany({
    where,
    orderBy,
    skip: (page - 1) * per_page,
    take: per_page,
    include: {
      slot: true,
      patient: {
        select: {
          name: true,
        },
      },
      clinician: {
        select: {
          name: true,
        },
      },
      events: true,
      encounter: true,
    },
  });

  return { data, meta: buildMeta(total, page, per_page, data.length) };
}

export async function listSlotsByClinician(clinicianId: string, query: any) {
  const page = Number(query?.page ?? 1);
  const per_page = Number(query?.per_page ?? 15);
  const sort = query?.sort === "desc" ? "desc" : "asc";

  const where: any = { clinicianId };
  if (query?.date_from) {
    const start = startOfDay(new Date(query.date_from));
    const end = addDays(start, 1);
    where.startAt = { gte: start, lt: end };
  }

  const total = await prisma.slot.count({ where });
  const data = await prisma.slot.findMany({
    where,
    orderBy: { startAt: sort },
    skip: (page - 1) * per_page,
    take: per_page,
    include: {
      availabilityRule: true,
      //   clinician: { select: { id: true, name: true, email: true } },
    },
  });

  return { data, meta: buildMeta(total, page, per_page, data.length) };
}

export async function slotsForPatients(query: any) {
  const page = Number(query?.page ?? 1);
  const per_page = Number(query?.per_page ?? 15);
  const sort = query?.sort === "desc" ? "desc" : "asc";

  const where: any = { isHidden: false, status: "FREE" };
  if (query?.clinician_id) where.clinicianId = query.clinician_id;
  if (query?.date_from) {
    const start = startOfDay(new Date(query.date_from));
    const end = addDays(start, 1);
    where.startAt = { gte: start, lt: end };
  }

  if (query?.diagnosis) {
    const diag = Array.isArray(query.diagnosis)
      ? query.diagnosis
      : [query.diagnosis];
    where.clinician = { diagnosis: { value: { in: diag } } };
  }

  const total = await prisma.slot.count({ where });
  const data = await prisma.slot.findMany({
    where,
    orderBy: { startAt: sort },
    skip: (page - 1) * per_page,
    take: per_page,
    include: {
      user: {
        select: {
          diagnosis: { select: { id: true, value: true, label: true } },
        },
      },
    },
  });

  return { data, meta: buildMeta(total, page, per_page, data.length) };
}
