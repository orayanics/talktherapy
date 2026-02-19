import { status } from "elysia";
import { prisma } from "prisma/db";
import type { SlotModel } from "./model";
import { AvailabilityService } from "../availability/service";

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
        appointment: {
          select: {
            id: true,
            patient_id: true,
            status: true,
          },
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
}
