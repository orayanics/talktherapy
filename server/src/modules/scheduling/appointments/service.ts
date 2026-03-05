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
          room_id: crypto.randomUUID(),
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

    await AppointmentService.assertRescheduleCutoff(appointment.slot.starts_at);

    // For rescheduled appointments the current slot was patient-chosen, so
    // default to AVAILABLE on cancel. For original bookings default to BLOCKED.
    // An explicit keep_blocked in the body always takes precedence.
    const defaultBlock = appointment.rescheduled_at == null;
    const shouldBlock =
      body.keep_blocked !== undefined ? body.keep_blocked : defaultBlock;

    return prisma.$transaction(async (tx) => {
      await tx.slot.update({
        where: { id: appointment.slot_id },
        data: { status: shouldBlock ? "BLOCKED" : "AVAILABLE" },
      });

      const updated = await tx.appointments.update({
        where: { id: appointment_id },
        data: {
          status: "CANCELLED",
          cancelled_at: new Date(),
          room_id: null,
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
      await tx.slot.update({
        where: { id: appointment.slot_id },
        data: { status: "COMPLETED" },
        select: { availability_rule_id: true },
      });

      const updated = await tx.appointments.update({
        where: { id: appointment_id },
        data: {
          status: "COMPLETED",
          completed_at: new Date(),
          room_id: null,
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

      // Record the patient as handled by this clinician (upsert — idempotent)
      await tx.clinicianPatient.upsert({
        where: {
          clinician_id_patient_id: {
            clinician_id,
            patient_id: appointment.patient_id,
          },
        },
        create: {
          clinician_id,
          patient_id: appointment.patient_id,
          first_completed_at: new Date(),
        },
        update: {},
      });

      return updated;
    });
  }

  /**
   * Returns a specific handled patient's profile + their appointment history
   * with this clinician. Date-filtered, paginated.
   */
  static async getHandledPatientAppointments(
    clinician_id: string,
    patient_id: string,
    query: AppointmentModel.patientDetailQuery,
  ) {
    // Verify the patient is in the clinician's handled list
    const link = await prisma.clinicianPatient.findUnique({
      where: { clinician_id_patient_id: { clinician_id, patient_id } },
      include: {
        patient: {
          include: {
            user: {
              select: { id: true, name: true, email: true, last_login: true },
            },
            diagnosis: { select: { label: true } },
          },
        },
      },
    });

    if (!link)
      throw status(404, "Patient not found or not handled by this clinician");

    const { from, to, page = 1, per_page = 10 } = query;
    const skip = (page - 1) * per_page;

    const where = {
      patient_id,
      slot: {
        clinician_id,
        ...(from && { starts_at: { gte: new Date(from) } }),
        ...(to && { ends_at: { lte: new Date(to) } }),
      },
      status: "COMPLETED" as const,
    };

    const [appointments, total] = await prisma.$transaction([
      prisma.appointments.findMany({
        where,
        include: {
          slot: {
            select: { id: true, starts_at: true, ends_at: true, status: true },
          },
          encounter: true,
        },
        orderBy: { completed_at: "desc" },
        skip,
        take: per_page,
      }),
      prisma.appointments.count({ where }),
    ]);

    const { patient, first_completed_at } = link;

    return {
      patient: {
        id: patient.id,
        user_id: patient.user_id,
        name: patient.user.name,
        email: patient.user.email,
        last_login: patient.user.last_login,
        diagnosis: patient.diagnosis?.label ?? null,
        first_completed_at,
      },
      appointments: {
        data: appointments,
        meta: {
          total,
          page,
          page_size: per_page,
          page_count: Math.ceil(total / per_page),
          from: skip + 1,
          to: skip + appointments.length,
        },
      },
    };
  }

  /**
   * Returns all patients the clinician has handled (≥1 completed appointment).
   * Records are created atomically when an appointment is marked COMPLETED.
   */
  static async listHandledPatients(
    clinician_id: string,
    query: AppointmentModel.handledPatientsQuery,
  ) {
    const { search, page = 1, per_page = 10 } = query;
    const skip = (page - 1) * per_page;

    const where = {
      clinician_id,
      ...(search && {
        patient: {
          user: {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          },
        },
      }),
    };

    const [records, total] = await prisma.$transaction([
      prisma.clinicianPatient.findMany({
        where,
        include: {
          patient: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  last_login: true,
                },
              },
              diagnosis: {
                select: { label: true },
              },
            },
          },
        },
        orderBy: { first_completed_at: "desc" },
        skip,
        take: per_page,
      }),
      prisma.clinicianPatient.count({ where }),
    ]);

    return {
      data: records.map(({ patient, first_completed_at }) => ({
        id: patient.id,
        user_id: patient.user_id,
        name: patient.user.name,
        email: patient.user.email,
        // last_login: patient.user.last_login,
        diagnosis: patient.diagnosis?.label ?? null,
        first_completed_at,
      })),
      meta: {
        total,
        page,
        page_size: per_page,
        page_count: Math.ceil(total / per_page),
        from: skip + 1,
        to: skip + records.length,
      },
    };
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
      // Free the old slot — it's no longer held by this appointment
      await tx.slot.update({
        where: { id: old_slot_id },
        data: { status: "AVAILABLE" },
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
        },
      });

      return updated;
    });
  }

  /**
   * Returns all appointments for a patient (their own), paginated.
   * Resolves the patient profile from user_id.
   */
  static async listPatientAppointments(
    user_id: string,
    query: AppointmentModel.patientListQuery,
  ) {
    const patient = await prisma.patient.findUnique({
      where: { user_id },
      select: { id: true },
    });

    if (!patient) throw status(404, "Patient profile not found");

    const { status: apptStatus, from, to, page = 1, per_page = 10 } = query;
    const skip = (page - 1) * per_page;

    const where = {
      patient_id: patient.id,
      ...(apptStatus && { status: apptStatus }),
      ...(from && { slot: { starts_at: { gte: new Date(from) } } }),
      ...(to && { slot: { ends_at: { lte: new Date(to) } } }),
    };

    const [data, total] = await prisma.$transaction([
      prisma.appointments.findMany({
        where,
        include: {
          slot: {
            select: {
              id: true,
              starts_at: true,
              ends_at: true,
              status: true,
              clinician: {
                select: {
                  id: true,
                  user: { select: { name: true } },
                  diagnosis: { select: { label: true } },
                },
              },
            },
          },
          encounter: {
            select: {
              id: true,
              chief_complaint: true,
              diagnosis: true,
              referral_source: true,
            },
          },
          events: {
            orderBy: { created_at: "desc" },
          },
        },
        orderBy: { booked_at: "desc" },
        skip,
        take: per_page,
      }),
      prisma.appointments.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        page_size: per_page,
        page_count: Math.ceil(total / per_page),
        from: skip + 1,
        to: skip + data.length,
      },
    };
  }

  /**
   * Returns a single appointment that belongs to the given patient (by user_id).
   * Throws 404 if not found or the appointment does not belong to this patient.
   */
  static async getPatientAppointment(user_id: string, appointment_id: string) {
    const patient = await prisma.patient.findUnique({
      where: { user_id },
      select: { id: true },
    });

    if (!patient) throw status(404, "Patient profile not found");

    const appointment = await prisma.appointments.findFirst({
      where: { id: appointment_id, patient_id: patient.id },
      include: {
        slot: {
          select: {
            id: true,
            starts_at: true,
            ends_at: true,
            status: true,
            clinician: {
              select: {
                id: true,
                user: { select: { name: true } },
                diagnosis: { select: { label: true, value: true } },
              },
            },
          },
        },
        encounter: true,
        events: { orderBy: { created_at: "desc" } },
      },
    });

    if (!appointment) throw status(404, "Appointment not found");
    return appointment;
  }

  /**
   * Cancels a patient's own PENDING or CONFIRMED appointment.
   * Slot is returned to AVAILABLE (voluntary patient withdrawal).
   */
  static async cancelAppointmentAsPatient(
    user_id: string,
    appointment_id: string,
    body: AppointmentModel.patientCancelBody,
  ) {
    const appointment = await AppointmentService.getPatientAppointment(
      user_id,
      appointment_id,
    );

    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      throw status(
        409,
        `Cannot cancel appointment with status: ${appointment.status}`,
      );
    }

    await AppointmentService.assertRescheduleCutoff(appointment.slot.starts_at);

    return prisma.$transaction(async (tx) => {
      await tx.slot.update({
        where: { id: appointment.slot_id },
        data: { status: "AVAILABLE" },
      });

      const updated = await tx.appointments.update({
        where: { id: appointment_id },
        data: {
          status: "CANCELLED",
          cancelled_at: new Date(),
          room_id: null,
        },
      });

      await tx.appointmentEvent.create({
        data: {
          appointment_id,
          type: "CANCELLED",
          actor_type: "PATIENT",
          actor_id: user_id,
          reason: body.reason,
        },
      });

      return updated;
    });
  }

  /**
   * Reschedules a patient's own PENDING or CONFIRMED appointment.
   *
   * Rules:
   * - Appointment must be >= RESCHEDULE_CUTOFF_DAYS away
   * - New slot must be AVAILABLE and belong to the SAME clinician
   * - Old slot is BLOCKED; new slot is BOOKED
   */
  static async rescheduleAppointmentAsPatient(
    user_id: string,
    appointment_id: string,
    body: AppointmentModel.rescheduleBody,
  ) {
    const appointment = await AppointmentService.getPatientAppointment(
      user_id,
      appointment_id,
    );

    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      throw status(
        409,
        `Cannot reschedule appointment with status: ${appointment.status}`,
      );
    }

    const newSlot = await prisma.slot.findFirst({
      where: {
        id: body.new_slot_id,
        clinician_id: appointment.slot.clinician.id,
        status: "AVAILABLE",
      },
    });

    if (!newSlot) {
      throw status(
        404,
        "New slot not found, not available, or belongs to a different clinician",
      );
    }

    await AppointmentService.assertRescheduleCutoff(newSlot.starts_at);

    return AppointmentService.performReschedule({
      appointment_id,
      old_slot_id: appointment.slot_id,
      new_slot_id: body.new_slot_id,
      actor_id: user_id,
      actor_type: "PATIENT",
    });
  }

  /**
   * Books a slot for a patient. Creates a PENDING appointment.
   * Verifies the slot is AVAILABLE and resolves the patient profile.
   */
  static async bookAppointment(
    user_id: string,
    slot_id: string,
    body: AppointmentModel.bookBody,
  ) {
    const patient = await prisma.patient.findUnique({
      where: { user_id },
      select: { id: true },
    });

    if (!patient) throw status(404, "Patient profile not found");

    return prisma.$transaction(async (tx) => {
      const slot = await tx.slot.findUnique({
        where: { id: slot_id },
      });

      if (!slot) throw status(404, "Slot not found");
      if (slot.status !== "AVAILABLE") {
        throw status(409, `Slot is not available for booking: ${slot.status}`);
      }

      await tx.slot.update({
        where: { id: slot_id },
        data: { status: "BOOKED" },
      });

      const appointment = await tx.appointments.create({
        data: {
          slot_id,
          patient_id: patient.id,
          status: "PENDING",
          booked_at: new Date(),
        },
      });

      await tx.appointmentEvent.create({
        data: {
          appointment_id: appointment.id,
          type: "BOOKED",
          actor_type: "PATIENT",
          actor_id: user_id,
        },
      });

      await tx.encounter.create({
        data: {
          appointment_id: appointment.id,
          diagnosis: body.medical_diagnosis,
          referral_source: body.source_referral,
          chief_complaint: body.chief_complaint,
          referral_url: body.referral_url,
        },
      });

      return appointment;
    });
  }

  /**
   * Throws 409 if the appointment slot is less than RESCHEDULE_CUTOFF_DAYS away.
   * Comparison is UTC date-only (time stripped) so that an appointment on exactly
   * today + N days is always allowed regardless of the time of day or server timezone.
   */
  static assertRescheduleCutoff(slotStartsAt: Date) {
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    const slotDayUTC = new Date(slotStartsAt);
    slotDayUTC.setUTCHours(0, 0, 0, 0);

    const cutoff = new Date(todayUTC);
    cutoff.setUTCDate(todayUTC.getUTCDate() + RESCHEDULE_CUTOFF_DAYS);

    if (slotDayUTC < cutoff) {
      throw status(
        409,
        `Rescheduling is not allowed within ${RESCHEDULE_CUTOFF_DAYS} days of the appointment`,
      );
    }
  }
}
