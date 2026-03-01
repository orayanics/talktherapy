import { status } from "elysia";
import { prisma } from "prisma/db";
import type { SlotModel } from "./model";

export abstract class SlotService {
  /**
   * Returns all slots for the authenticated clinician, with optional filters.
   */
  static async listSlots(clinician_id: string, query: SlotModel.listQuery) {
    const { from, to, status: slotStatus } = query;

    return prisma.slot.findMany({
      where: {
        clinician_id,
        ...(slotStatus && { status: slotStatus }),
        ...(from && { starts_at: { gte: new Date(from) } }),
        ...(to && { ends_at: { lte: new Date(to) } }),
      },
      include: {
        availability_rule: {
          select: { id: true, recurrence_rule: true },
        },
        appointments: {
          where: { status: { not: "CANCELLED" } },
          select: { id: true, patient_id: true, status: true },
          take: 1,
        },
      },
      orderBy: { starts_at: "asc" },
    });
  }

  /**
   * Blocks an AVAILABLE slot. Used by the clinician to manually
   * prevent a slot from being booked.
   */
  static async blockSlot(clinician_id: string, slot_id: string) {
    const slot = await prisma.slot.findFirst({
      where: { id: slot_id, clinician_id },
    });

    if (!slot) throw status(404, "Slot not found");
    if (slot.status !== "AVAILABLE") {
      throw status(409, `Cannot block a slot with status: ${slot.status}`);
    }

    return prisma.slot.update({
      where: { id: slot_id },
      data: { status: "BLOCKED" },
    });
  }

  /**
   * Unblocks a BLOCKED slot, returning it to AVAILABLE.
   */
  static async unblockSlot(clinician_id: string, slot_id: string) {
    const slot = await prisma.slot.findFirst({
      where: { id: slot_id, clinician_id },
    });

    if (!slot) throw status(404, "Slot not found");
    if (slot.status !== "BLOCKED") {
      throw status(409, `Cannot unblock a slot with status: ${slot.status}`);
    }

    return prisma.slot.update({
      where: { id: slot_id },
      data: { status: "AVAILABLE" },
    });
  }

  /**
   * Lists all slots in the system, with optional filters. For patient users, this will only return slots that are AVAILABLE and in the future.
   * Default: return slots of current date
   */

  static async listAllSlots(query: SlotModel.listQuery) {
    const {
      from,
      to,
      status: slotStatus,
      diagnosis,
      page = 1,
      per_page = 20,
    } = query;

    const fromDate = from ? new Date(`${from}T00:00:00`) : null;
    const toDate = from
      ? new Date(`${from}T23:59:59.999`)
      : to
        ? new Date(`${to}T23:59:59.999`)
        : null;

    const where = {
      status: slotStatus ?? "AVAILABLE",
      ...(fromDate && { starts_at: { gte: fromDate, lte: toDate! } }),
      ...(diagnosis && {
        clinician: {
          diagnosis: { value: { in: diagnosis } },
        },
      }),
    };

    const skip = (page - 1) * per_page;

    const [data, total] = await prisma.$transaction([
      prisma.slot.findMany({
        where,
        ...SLOT_SELECT,
        orderBy: { starts_at: "asc" },
        skip,
        take: per_page,
      }),
      prisma.slot.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        page_size: per_page,
        page_count: Math.ceil(total / per_page),
        to: skip + data.length,
        from: skip + 1,
      },
    };
  }

  static async deleteSlot(clinician_id: string, slot_id: string) {
    const slot = await prisma.slot.findFirst({
      where: { id: slot_id, clinician_id },
    });

    if (!slot) throw status(404, "Slot not found");
    if (slot.status === "BOOKED") {
      throw status(409, "Cannot delete a booked slot");
    }

    await prisma.slot.delete({ where: { id: slot_id } });
  }

  /**
   * Returns the appointment (with encounter, patient and events) for a slot
   * that belongs to the given clinician.
   */
  static async getSlotAppointment(clinician_id: string, slot_id: string) {
    const slot = await prisma.slot.findFirst({
      where: { id: slot_id, clinician_id },
    });

    if (!slot) throw status(404, "Slot not found");

    const appointment = await prisma.appointments.findFirst({
      where: { slot_id },
      orderBy: { booked_at: "desc" },
      include: {
        slot: {
          select: { id: true, starts_at: true, ends_at: true, status: true },
        },
        encounter: true,
        events: { orderBy: { created_at: "desc" } },
      },
    });

    if (!appointment) throw status(404, "No appointment found for this slot");
    return appointment;
  }
}

const SLOT_SELECT = {
  omit: {
    clinician_id: true,
    created_at: true,
    updated_at: true,
    availability_rule_id: true,
  },
  include: {
    appointments: {
      where: { status: { not: "CANCELLED" } },
      select: { id: true, patient_id: true, status: true },
      take: 1,
    },
    clinician: {
      select: {
        id: true,
        user: { select: { name: true } },
        diagnosis: { select: { value: true, label: true } },
      },
    },
  },
} as const;
