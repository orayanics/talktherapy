// routes/appointments.ts
import { Elysia, t } from "elysia";
import {
  AppointmentModel,
  ScheduleInstanceModel,
  PatientModel,
} from "../models";

export const appointmentRoutes = new Elysia({
  name: "appointment-routes",
}).group("/api/appointments", (app) =>
  app.guard(
    {
      isAuth: true,
      detail: {
        tags: ["Appointments"],
      },
    },
    (app) =>
      app
        // Create appointment
        .post(
          "/",
          ({ body, user, error }) => {
            // Patients can only create appointments for themselves
            if (user.account_role === "patient") {
              // Find patient record
              const patientRecord = PatientModel.findByUserId(user.id);
              if (!patientRecord) {
                return error(403, {
                  error: "Forbidden",
                  message: "Patient record not found",
                });
              }

              // Override patient_id with their own
              body.patient_id = patientRecord.id;
            }

            const appointment = AppointmentModel.create({
              clinician_id: body.clinician_id,
              patient_id: body.patient_id,
              schedule_instance_id: body.schedule_instance_id,
              starts_at: body.starts_at,
              ends_at: body.ends_at,
              status: "scheduled",
            });

            // Update schedule instance to booked
            if (body.schedule_instance_id) {
              ScheduleInstanceModel.updateStatus(
                body.schedule_instance_id,
                "booked",
              );
            }

            return appointment;
          },
          {
            body: t.Object({
              clinician_id: t.String(),
              patient_id: t.String(),
              schedule_instance_id: t.Optional(t.String()),
              starts_at: t.String(),
              ends_at: t.String(),
            }),
            detail: {
              summary: "Create new appointment",
            },
          },
        )

        // Get appointment by ID
        .get(
          "/:id",
          ({ params: { id }, error }) => {
            const appointment = AppointmentModel.findById(id);

            if (!appointment) {
              return error(404, {
                error: "Not Found",
                message: "Appointment not found",
              });
            }

            return appointment;
          },
          {
            params: t.Object({
              id: t.String(),
            }),
            detail: {
              summary: "Get appointment by ID",
            },
          },
        )

        // List appointments with filters
        .get(
          "/",
          ({ query }) => {
            // Filter by clinician
            if (query.clinician_id) {
              return AppointmentModel.findByClinicianId(query.clinician_id);
            }

            // Filter by patient
            if (query.patient_id) {
              return AppointmentModel.findByPatientId(query.patient_id);
            }

            // Filter by status
            if (query.status) {
              return AppointmentModel.findByStatus(query.status);
            }

            // Default: return upcoming appointments
            return AppointmentModel.findUpcoming(20);
          },
          {
            query: t.Object({
              clinician_id: t.Optional(t.String()),
              patient_id: t.Optional(t.String()),
              status: t.Optional(t.String()),
            }),
            detail: {
              summary: "List appointments",
              description:
                "Filter by clinician_id, patient_id, or status. Returns upcoming appointments by default.",
            },
          },
        )

        // Update appointment status
        .patch(
          "/:id/status",
          ({ params: { id }, body, error }) => {
            const appointment = AppointmentModel.updateStatus(
              id,
              body.status,
              body.reason,
            );

            if (!appointment) {
              return error(404, {
                error: "Not Found",
                message: "Appointment not found",
              });
            }

            return appointment;
          },
          {
            params: t.Object({
              id: t.String(),
            }),
            body: t.Object({
              status: t.Union([
                t.Literal("scheduled"),
                t.Literal("confirmed"),
                t.Literal("completed"),
                t.Literal("cancelled"),
                t.Literal("rescheduled"),
              ]),
              reason: t.Optional(t.String()),
            }),
            detail: {
              summary: "Update appointment status",
            },
          },
        )

        // Delete appointment
        .delete(
          "/:id",
          ({ params: { id }, user, error }) => {
            // Only admins can delete
            if (user.account_role !== "admin" && user.account_role !== "sudo") {
              return error(403, {
                error: "Forbidden",
                message: "Only admins can delete appointments",
              });
            }

            AppointmentModel.delete(id);

            return {
              success: true,
              message: "Appointment deleted",
            };
          },
          {
            params: t.Object({
              id: t.String(),
            }),
            detail: {
              summary: "Delete appointment",
            },
          },
        ),
  ),
);
