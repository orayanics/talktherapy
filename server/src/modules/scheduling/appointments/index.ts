import { Elysia } from "elysia";
import { jwtPlugin } from "@/plugins/jwt";
import { AppointmentService } from "./service";
import { AppointmentModel } from "./model";
import { AvailabilityService } from "../availability/service";

export const appointmentController = new Elysia({
  prefix: "/appointments",
  detail: { tags: ["Clinician / Appointments"] },
})
  .use(jwtPlugin)
  .guard({ isAuth: true, hasRole: ["clinician"] }, (app) =>
    app
      // ── GET /appointments ───────────────────────────────────────
      .get(
        "/",
        async ({ auth, query }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return AppointmentService.listAppointments(clinician_id, query);
        },
        {
          query: AppointmentModel.listQuery,
          detail: { summary: "List own appointments with optional filters" },
        },
      )

      // ── GET /appointments/:appointment_id ───────────────────────
      .get(
        "/:appointment_id",
        async ({ auth, params }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return AppointmentService.getAppointment(
            clinician_id,
            params.appointment_id,
          );
        },
        {
          params: AppointmentModel.appointmentParams,
          detail: {
            summary: "Get a single appointment with encounter and events",
          },
        },
      )

      // ── PATCH /appointments/:appointment_id/confirm ─────────────
      .patch(
        "/:appointment_id/confirm",
        async ({ auth, params }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return AppointmentService.confirmAppointment(
            clinician_id,
            params.appointment_id,
            auth!.userId,
          );
        },
        {
          params: AppointmentModel.appointmentParams,
          detail: { summary: "Confirm a pending appointment" },
        },
      )

      // ── PATCH /appointments/:appointment_id/cancel ──────────────
      .patch(
        "/:appointment_id/cancel",
        async ({ auth, params, body }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return AppointmentService.cancelAppointment(
            clinician_id,
            params.appointment_id,
            auth!.userId,
            body,
          );
        },
        {
          params: AppointmentModel.appointmentParams,
          body: AppointmentModel.cancelBody,
          detail: { summary: "Cancel a pending or confirmed appointment" },
        },
      )

      // ── PATCH /appointments/:appointment_id/complete ────────────
      .patch(
        "/:appointment_id/complete",
        async ({ auth, params }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return AppointmentService.completeAppointment(
            clinician_id,
            params.appointment_id,
            auth!.userId,
          );
        },
        {
          params: AppointmentModel.appointmentParams,
          detail: { summary: "Mark a confirmed appointment as completed" },
        },
      )

      // ── PATCH /appointments/:appointment_id/no-show ─────────────
      .patch(
        "/:appointment_id/no-show",
        async ({ auth, params, body }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return AppointmentService.markNoShow(
            clinician_id,
            params.appointment_id,
            auth!.userId,
            body,
          );
        },
        {
          params: AppointmentModel.appointmentParams,
          body: AppointmentModel.noShowBody,
          detail: { summary: "Mark a confirmed appointment as no-show" },
        },
      )

      // ── PATCH /appointments/:appointment_id/reschedule ──────────
      .patch(
        "/:appointment_id/reschedule",
        async ({ auth, params, body }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return AppointmentService.rescheduleAppointment(
            clinician_id,
            params.appointment_id,
            auth!.userId,
            body,
          );
        },
        {
          params: AppointmentModel.appointmentParams,
          body: AppointmentModel.rescheduleBody,
          detail: {
            summary:
              "Reschedule to a new available slot (>3 days before appointment)",
          },
        },
      ),
  );
