import { prisma } from "@/lib/client";

export async function getSlotById(id: string) {
  const slot = await prisma.slot.findUnique({
    where: { id },
    include: {
      availabilityRule: {
        include: {
          clinician: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
  if (!slot) throw new Error("Slot not found");
  return slot;
}

export async function bookSlot(
  slotId: string,
  patientId: string,
  payload: any,
) {
  return prisma.$transaction(async (tx) => {
    const slot = await tx.slot.findUnique({ where: { id: slotId } });
    if (!slot) throw new Error("Slot not found");
    if (slot.status !== "FREE")
      throw new Error("Slot not available for booking");

    await tx.slot.update({
      where: { id: slotId },
      data: { status: "PENDING" },
    });

    const appointment = await tx.appointment.create({
      data: {
        slotId,
        patientId,
        clinicianId: slot.clinicianId,
        status: "PENDING",
        bookedAt: new Date(),
      },
    });

    await tx.appointmentEvent.create({
      data: {
        appointmentId: appointment.id,
        type: "STATUS_CHANGE",
        actorType: "PATIENT",
        actorId: patientId,
        reason: payload?.reason ?? null,
      },
    });

    const enc = payload?.encounter;
    if (!enc || typeof enc !== "object")
      throw new Error("Encounter payload is required");

    await tx.encounter.create({
      data: {
        appointmentId: appointment.id,
        diagnosis: enc.diagnosis,
        chiefComplaint: enc.chief_complaint,
        referralSource: enc.referral_source,
        referralUrl: enc.referral_url,
      },
    });
    return appointment;
  });
}
