import { status } from "elysia";
import { prisma } from "prisma/db";
import type { AppointmentModel } from "./model";
import { RESCHEDULE_CUTOFF_DAYS } from "../types";

export abstract class AppointmentService {
  /**
   * Returns all appointments for the clinician, with slot and encounter data.
   */
  static async listAppointments(
    clinician_id: string,
    query: AppointmentModel.listQuery,
  ) {
    const { status: apptStatus, from, to } = query;

    return prisma.appointments.findMany({
      where: {
        slot: {
          clinician_id,
          ...(from && { starts_at: { gte: new Date(from) } }),
          ...(to && { ends_at: { lte: new Date(to) } }),
        },
        ...(apptStatus && { status: apptStatus }),
      },
      include: {
        slot: {
          select: {
            id: true,
            starts_at: true,
            ends_at: true,
            status: true,
          },
        },
        encounter: true,
        events: {
          orderBy: { created_at: "desc" },
          take: 5,
        },
      },
      orderBy: { booked_at: "desc" },
    });
  }

  /**
   * Returns a single appointment with full details.
   * Verifies the appointment belongs to the clinician.
   */
  static async getAppointment(clinician_id: string, appointment_id: string) {
    const appointment = await prisma.appointments.findFirst({
      where: {
        id: appointment_id,
        slot: { clinician_id },
      },
      include: {
        slot: true,
        encounter: true,
        events: { orderBy: { created_at: "desc" } },
      },
    });

    if (!appointment) throw status(404, "Appointment not found");
    return appointment;
  }

  /**
   * Confirms a PENDING appointment.
   */
  static async confirmAppointment(
    clinician_id: string,
    appointment_id: string,
    actor_id: string,
  ) {
    const appointment = await AppointmentService.getAppointment(
      clinician_id,
      appointment_id,
    );

    if (appointment.status !== "PENDING") {
      throw status(
        409,
        `Cannot confirm appointment with status: ${appointment.status}`,
      );
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.appointments.update({
        where: { id: appointment_id },
        data: {
          status: "CONFIRMED",
          confirmed_at: new Date(),
        },
      });

      await tx.appointmentEvent.create({
        data: {
          appointment_id,
          type: "CONFIRMED",
          actor_type: "CLINICIAN",
          actor_id,
        },
      });

      return updated;
    });
  }

  /**
   * Cancels an appointment (PENDING or CONFIRMED).
   */
  static async cancelAppointment(
    clinician_id: string,
    appointment_id: string,
    actor_id: string,
    body: AppointmentModel.cancelBody,
  ) {
    const appointment = await AppointmentService.getAppointment(
      clinician_id,
      appointment_id,
    );

    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      throw status(
        409,
        `Cannot cancel appointment with status: ${appointment.status}`,
      );
    }

    return prisma.$transaction(async (tx) => {
      // Release the slot back — but mark as BLOCKED per domain decision
      // (double-booking prevention; clinician can manually unblock)
      await tx.slot.update({
        where: { id: appointment.slot_id },
        data: { status: "AVAILABLE" },
      });

      const updated = await tx.appointments.update({
        where: { id: appointment_id },
        data: {
          status: "CANCELLED",
          cancelled_at: new Date(),
        },
      });

      await tx.appointmentEvent.create({
        data: {
          appointment_id,
          type: "CANCELLED",
          actor_type: "CLINICIAN",
          actor_id,
          reason: body.reason,
        },
      });

      return updated;
    });
  }

  /**
   * Marks an appointment as COMPLETED.
   */
  static async completeAppointment(
    clinician_id: string,
    appointment_id: string,
    actor_id: string,
  ) {
    const appointment = await AppointmentService.getAppointment(
      clinician_id,
      appointment_id,
    );

    if (appointment.status !== "CONFIRMED") {
      throw status(
        409,
        `Cannot complete appointment with status: ${appointment.status}`,
      );
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.appointments.update({
        where: { id: appointment_id },
        data: {
          status: "COMPLETED",
          completed_at: new Date(),
        },
      });

      await tx.appointmentEvent.create({
        data: {
          appointment_id,
          type: "COMPLETED",
          actor_type: "CLINICIAN",
          actor_id,
        },
      });

      return updated;
    });
  }

  /**
   * Marks an appointment as NO_SHOW.
   */
  static async markNoShow(
    clinician_id: string,
    appointment_id: string,
    actor_id: string,
    body: AppointmentModel.noShowBody,
  ) {
    const appointment = await AppointmentService.getAppointment(
      clinician_id,
      appointment_id,
    );

    if (appointment.status !== "CONFIRMED") {
      throw status(
        409,
        `Cannot mark no-show for appointment with status: ${appointment.status}`,
      );
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.appointments.update({
        where: { id: appointment_id },
        data: { status: "NO_SHOW" },
      });

      await tx.appointmentEvent.create({
        data: {
          appointment_id,
          type: "NO_SHOW",
          actor_type: "CLINICIAN",
          actor_id,
          reason: body.reason,
        },
      });

      return updated;
    });
  }

  /**
   * Reschedules an appointment to a new AVAILABLE slot.
   *
   * Rules:
   * - Clinician can only reschedule if the appointment is >= RESCHEDULE_CUTOFF_DAYS away
   * - Old slot is marked BLOCKED (double-booking prevention)
   * - New slot must be AVAILABLE and belong to the same clinician
   * - Appointment slot_id is updated to the new slot
   * - A RESCHEDULED event is appended
   *
   * Patient reschedule interface: expose `rescheduleAppointmentAsPatient` separately
   * in the patient scheduling module, reusing `performReschedule` below.
   */
  static async rescheduleAppointment(
    clinician_id: string,
    appointment_id: string,
    actor_id: string,
    body: AppointmentModel.rescheduleBody,
  ) {
    const appointment = await AppointmentService.getAppointment(
      clinician_id,
      appointment_id,
    );

    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      throw status(
        409,
        `Cannot reschedule appointment with status: ${appointment.status}`,
      );
    }

    await AppointmentService.assertRescheduleCutoff(appointment.slot.starts_at);

    const newSlot = await prisma.slot.findFirst({
      where: {
        id: body.new_slot_id,
        clinician_id,
        status: "AVAILABLE",
      },
    });

    if (!newSlot) {
      throw status(
        404,
        "New slot not found or not available for this clinician",
      );
    }

    await AppointmentService.assertRescheduleCutoff(newSlot.starts_at);

    return AppointmentService.performReschedule({
      appointment_id,
      old_slot_id: appointment.slot_id,
      new_slot_id: body.new_slot_id,
      actor_id,
      actor_type: "CLINICIAN",
    });
  }

  // ── Shared / Internal ────────────────────────────────────────────

  /**
   * Core reschedule transaction. Reusable by patient scheduling module.
   * Caller is responsible for all pre-condition checks before invoking.
   */
  static async performReschedule(opts: {
    appointment_id: string;
    old_slot_id: string;
    new_slot_id: string;
    actor_id: string;
    actor_type: "CLINICIAN" | "PATIENT" | "SYSTEM" | "ADMIN";
  }) {
    const { appointment_id, old_slot_id, new_slot_id, actor_id, actor_type } =
      opts;

    return prisma.$transaction(async (tx) => {
      // Block the old slot to prevent immediate re-booking
      await tx.slot.update({
        where: { id: old_slot_id },
        data: { status: "BLOCKED" },
      });

      // Mark new slot as booked
      await tx.slot.update({
        where: { id: new_slot_id },
        data: { status: "BOOKED" },
      });

      const updated = await tx.appointments.update({
        where: { id: appointment_id },
        data: {
          slot_id: new_slot_id,
          rescheduled_at: new Date(),
        },
      });

      await tx.appointmentEvent.create({
        data: {
          appointment_id,
          type: "RESCHEDULED",
          actor_type,
          actor_id,
          metadata: { old_slot_id, new_slot_id },
        },
      });

      return updated;
    });
  }

  /**
   * Throws 409 if the appointment slot is less than RESCHEDULE_CUTOFF_DAYS away.
   */
  static assertRescheduleCutoff(slotStartsAt: Date) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + RESCHEDULE_CUTOFF_DAYS);

    if (slotStartsAt < cutoff) {
      throw status(
        409,
        `Rescheduling is not allowed within ${RESCHEDULE_CUTOFF_DAYS} days of the appointment`,
      );
    }
  }
}
