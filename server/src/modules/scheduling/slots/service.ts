import { status } from "elysia";
import { prisma } from "prisma/db";
import type { SlotModel } from "./model";
import { parseISO, toUtcEndOfDay } from "@/utils/date";

// Strip internal FKs from appointment sub-objects
const EVENT_SELECT = {
  id: true,
  type: true,
  actor_type: true,
  reason: true,
  created_at: true,
} as const;

const ENCOUNTER_SELECT = {
  id: true,
  chief_complaint: true,
  diagnosis: true,
  referral_source: true,
  referral_url: true,
} as const;

const APPOINTMENT_INCLUDE = {
  slot: { select: { id: true, starts_at: true, ends_at: true, status: true } },
  encounter: { select: ENCOUNTER_SELECT },
  events: {
    select: EVENT_SELECT,
    orderBy: { created_at: "desc" as const },
  },
} as const;

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

export abstract class SlotService {
  /**
   * Returns all slots for the authenticated clinician, with optional filters.
   */
  static async listSlots(clinician_id: string, query: SlotModel.listQuery) {
    const {
      from,
      to,
      status: slotStatus,
      appointment_status,
      page = 1,
      per_page = 10,
    } = query;

    const toDate = to ? toUtcEndOfDay(to) : undefined;

    const skip = (page - 1) * per_page;

    const apptStatuses = appointment_status
      ? Array.isArray(appointment_status)
        ? appointment_status
        : [appointment_status]
      : undefined;

    const where = {
      clinician_id,
      ...(slotStatus && { status: slotStatus }),
      ...(from && { starts_at: { gte: parseISO(from) } }),
      ...(toDate && { ends_at: { lte: toDate } }),
      ...(apptStatuses?.length && {
        appointments: { some: { status: { in: apptStatuses } } },
      }),
    };

    const [data, total] = await prisma.$transaction([
      prisma.slot.findMany({
        where,
        include: {
          availability_rule: {
            select: { id: true, recurrence_rule: true },
          },
          appointments: {
            where: apptStatuses?.length
              ? { status: { in: apptStatuses } }
              : { status: { not: "CANCELLED" } },
            select: {
              id: true,
              status: true,
              patient: {
                select: {
                  id: true,
                  user: { select: { name: true } },
                },
              },
            },
            take: 1,
          },
        },
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
        per_page,
        last_page: Math.ceil(total / per_page),
        from: skip + 1,
        to: skip + data.length,
      },
    };
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
      select: { id: true, status: true },
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
      select: { id: true, status: true },
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
      clinician_id,
      page = 1,
      per_page = 10,
    } = query;

    const fromDate = from ? parseISO(`${from}T00:00:00.000Z`) : null;
    const toDate = from
      ? parseISO(`${from}T23:59:59.999Z`)
      : to
        ? parseISO(`${to}T23:59:59.999Z`)
        : null;

    const where = {
      status: slotStatus ?? "AVAILABLE",
      ...(fromDate && { starts_at: { gte: fromDate, lte: toDate! } }),
      ...(clinician_id && { clinician_id }),
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
        per_page,
        last_page: Math.ceil(total / per_page),
        from: skip + 1,
        to: skip + data.length,
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

    return prisma.appointments.findFirst({
      where: { slot_id },
      orderBy: { booked_at: "desc" },
      include: APPOINTMENT_INCLUDE,
    });
  }

  // Returns the appointment (with encounter and events) for any slot.
  // Used by admin/sudo to view any slot's appointment.
  static async getAnySlotAppointment(slot_id: string) {
    return prisma.appointments.findFirst({
      where: { slot_id },
      orderBy: { booked_at: "desc" },
      include: APPOINTMENT_INCLUDE,
    });
  }
}
