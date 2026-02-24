import { status } from "elysia";
import { prisma } from "prisma/db";
import { expandRRule, hasOverlap } from "../rrule.utils";
import type { AvailabilityModel } from "./model";

export abstract class AvailabilityService {
  /**
   * Resolves clinician_id from the authenticated user_id.
   * Throws 404 if the clinician profile does not exist.
   */
  static async resolveClinicianId(user_id: string): Promise<string> {
    const clinician = await prisma.clinician.findUnique({
      where: { user_id },
      select: { id: true },
    });

    if (!clinician) throw status(404, "Clinician profile not found");
    return clinician.id;
  }

  /**
   * Returns all availability rules belonging to the clinician.
   */
  static async listRules(
    clinician_id: string,
    query: AvailabilityModel.listQuery,
  ) {
    const { from, status: slotStatus } = query;

    const UTC_OFFSET_HOURS = 8;

    const slotFilter = from
      ? {
          starts_at: {
            gte: new Date(`${from}T00:00:00+08:00`),
            lte: new Date(`${from}T23:59:59.999+08:00`),
          },
        }
      : {};

    const hasFilter = Object.keys(slotFilter).length > 0;

    return prisma.availabilityRule.findMany({
      where: {
        clinician_id,
        ...(slotStatus && { status: slotStatus }),
        ...(hasFilter && { slots: { some: slotFilter } }),
      },
      include: {
        slots: {
          where: hasFilter ? slotFilter : undefined,
          select: { id: true, starts_at: true, ends_at: true, status: true },
          orderBy: { starts_at: "asc" },
        },
      },
      orderBy: { created_at: "desc" },
    });
  }
  /**
   * Returns a single rule owned by the clinician.
   */
  static async getRule(clinician_id: string, rule_id: string) {
    const rule = await prisma.availabilityRule.findFirst({
      where: { id: rule_id, clinician_id },
      include: {
        slots: {
          select: { id: true, starts_at: true, ends_at: true, status: true },
          orderBy: { starts_at: "asc" },
        },
      },
    });

    if (!rule) throw status(404, "Availability rule not found");
    return rule;
  }

  /**
   * Creates a new availability rule and pre-generates slots.
   * Validates no overlapping slots exist for the same clinician.
   */
  static async createRule(
    clinician_id: string,
    body: AvailabilityModel.createBody,
  ) {
    const starts_at = new Date(body.starts_at);
    const ends_at = new Date(body.ends_at);

    if (ends_at <= starts_at) {
      throw status(400, "ends_at must be after starts_at");
    }

    const occurrences = expandRRule(
      starts_at,
      ends_at,
      body.recurrence_rule ?? null,
      body.horizon_days,
    );

    if (occurrences.length === 0) {
      throw status(400, "Rule produces no slots within the expansion window");
    }

    // Overlap check: fetch existing active slots for this clinician
    const existingSlots = await prisma.slot.findMany({
      where: {
        clinician_id,
        status: { not: "CANCELLED" },
        starts_at: { gte: new Date() },
      },
      select: { starts_at: true, ends_at: true },
    });

    for (const occ of occurrences) {
      for (const existing of existingSlots) {
        if (
          hasOverlap(
            occ.starts_at,
            occ.ends_at,
            existing.starts_at,
            existing.ends_at,
          )
        ) {
          throw status(
            409,
            `Slot overlap detected at ${occ.starts_at.toISOString()}`,
          );
        }
      }
    }

    // Create rule and slots in a transaction
    return prisma.$transaction(async (tx) => {
      const rule = await tx.availabilityRule.create({
        data: {
          clinician_id,
          starts_at,
          ends_at,
          recurrence_rule: body.recurrence_rule ?? null,
        },
      });

      await tx.slot.createMany({
        data: occurrences.map((occ) => ({
          availability_rule_id: rule.id,
          clinician_id,
          starts_at: occ.starts_at,
          ends_at: occ.ends_at,
          status: "AVAILABLE" as const,
        })),
      });

      return tx.availabilityRule.findUnique({
        where: { id: rule.id },
        include: {
          slots: {
            select: { id: true, starts_at: true, ends_at: true, status: true },
            orderBy: { starts_at: "asc" },
          },
        },
      });
    });
  }

  /**
   * Updates a rule. If time fields change, cancels old AVAILABLE slots
   * and regenerates from the new values. BOOKED slots prevent rescheduling
   * unless they fall outside the new occurrences.
   */
  static async updateRule(
    clinician_id: string,
    rule_id: string,
    body: AvailabilityModel.updateBody,
  ) {
    const rule = await prisma.availabilityRule.findFirst({
      where: { id: rule_id, clinician_id },
      include: { slots: true },
    });

    if (!rule) throw status(404, "Availability rule not found");

    const timeChanged =
      body.starts_at !== undefined ||
      body.ends_at !== undefined ||
      body.recurrence_rule !== undefined;

    if (timeChanged) {
      const bookedCount = rule.slots.filter(
        (s) => s.status === "BOOKED",
      ).length;
      if (bookedCount > 0) {
        throw status(
          409,
          `Cannot modify rule timing: ${bookedCount} booked slot(s) exist`,
        );
      }
    }

    return prisma.$transaction(async (tx) => {
      const starts_at = body.starts_at
        ? new Date(body.starts_at)
        : rule.starts_at;
      const ends_at = body.ends_at ? new Date(body.ends_at) : rule.ends_at;
      const recurrence_rule =
        body.recurrence_rule !== undefined
          ? body.recurrence_rule
          : rule.recurrence_rule;

      if (timeChanged) {
        if (ends_at <= starts_at) {
          throw status(400, "ends_at must be after starts_at");
        }

        // Cancel all existing AVAILABLE/BLOCKED slots for this rule
        await tx.slot.updateMany({
          where: {
            availability_rule_id: rule_id,
            status: { in: ["AVAILABLE", "BLOCKED"] },
          },
          data: { status: "CANCELLED" },
        });

        const occurrences = expandRRule(
          starts_at,
          ends_at,
          recurrence_rule,
          body.horizon_days,
        );

        if (occurrences.length === 0) {
          throw status(
            400,
            "Updated rule produces no slots within the expansion window",
          );
        }

        // Overlap check against other rules' slots
        const existingSlots = await tx.slot.findMany({
          where: {
            clinician_id,
            availability_rule_id: { not: rule_id },
            status: { not: "CANCELLED" },
            starts_at: { gte: new Date() },
          },
          select: { starts_at: true, ends_at: true },
        });

        for (const occ of occurrences) {
          for (const existing of existingSlots) {
            if (
              hasOverlap(
                occ.starts_at,
                occ.ends_at,
                existing.starts_at,
                existing.ends_at,
              )
            ) {
              throw status(
                409,
                `Slot overlap detected at ${occ.starts_at.toISOString()}`,
              );
            }
          }
        }

        await tx.slot.createMany({
          data: occurrences.map((occ) => ({
            availability_rule_id: rule_id,
            clinician_id,
            starts_at: occ.starts_at,
            ends_at: occ.ends_at,
            status: "AVAILABLE" as const,
          })),
        });
      }

      await tx.availabilityRule.update({
        where: { id: rule_id },
        data: {
          starts_at: body.starts_at ? new Date(body.starts_at) : undefined,
          ends_at: body.ends_at ? new Date(body.ends_at) : undefined,
          recurrence_rule:
            body.recurrence_rule !== undefined
              ? body.recurrence_rule
              : undefined,
          is_active: body.is_active,
        },
      });

      return tx.availabilityRule.findUnique({
        where: { id: rule_id },
        include: {
          slots: {
            select: { id: true, starts_at: true, ends_at: true, status: true },
            orderBy: { starts_at: "asc" },
          },
        },
      });
    });
  }

  /**
   * Deletes a rule. Blocked if any BOOKED slots exist.
   */
  static async deleteRule(clinician_id: string, rule_id: string) {
    const rule = await prisma.availabilityRule.findFirst({
      where: { id: rule_id, clinician_id },
      include: {
        slots: { where: { status: "BOOKED" }, select: { id: true } },
      },
    });

    if (!rule) throw status(404, "Availability rule not found");

    if (rule.slots.length > 0) {
      throw status(409, "Cannot delete rule with existing booked slots");
    }

    await prisma.availabilityRule.delete({ where: { id: rule_id } });
    return { deleted: true };
  }
}
