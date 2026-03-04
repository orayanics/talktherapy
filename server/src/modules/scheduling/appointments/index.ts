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
  .guard({ isAuth: true, hasRole: ["patient"] }, (app) =>
    app
      // GET: /appointments/my
      .get(
        "/my",
        ({ auth, query }) =>
          AppointmentService.listPatientAppointments(auth!.userId, query),
        { query: AppointmentModel.patientListQuery },
      )
      // GET: /appointments/my/:appointment_id
      .get(
        "/my/:appointment_id",
        ({ auth, params }) =>
          AppointmentService.getPatientAppointment(
            auth!.userId,
            params.appointment_id,
          ),
        { params: AppointmentModel.appointmentParams },
      )
      // PATCH: /appointments/my/:appointment_id/cancel
      .patch(
        "/my/:appointment_id/cancel",
        ({ auth, params, body }) =>
          AppointmentService.cancelAppointmentAsPatient(
            auth!.userId,
            params.appointment_id,
            body,
          ),
        {
          params: AppointmentModel.appointmentParams,
          body: AppointmentModel.patientCancelBody,
        },
      )
      // PATCH: /appointments/my/:appointment_id/reschedule
      .patch(
        "/my/:appointment_id/reschedule",
        ({ auth, params, body }) =>
          AppointmentService.rescheduleAppointmentAsPatient(
            auth!.userId,
            params.appointment_id,
            body,
          ),
        {
          params: AppointmentModel.appointmentParams,
          body: AppointmentModel.rescheduleBody,
        },
      ),
  )
  .guard({ isAuth: true, hasRole: ["clinician"] }, (app) =>
    app
      // GET: /appointments
      .get(
        "/",
        async ({ auth, query }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return AppointmentService.listAppointments(clinician_id, query);
        },
        { query: AppointmentModel.listQuery },
      )

      // GET: /appointments/patients (handled patients with ≥1 completed appointment)
      .get(
        "/patients",
        async ({ auth, query }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return AppointmentService.listHandledPatients(clinician_id, query);
        },
        { query: AppointmentModel.handledPatientsQuery },
      )

      // GET: /appointments/patients/:patient_id (single handled patient + completed appointments)
      .get(
        "/patients/:patient_id",
        async ({ auth, params, query }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return AppointmentService.getHandledPatientAppointments(
            clinician_id,
            params.patient_id,
            query,
          );
        },
        {
          params: AppointmentModel.patientDetailParams,
          query: AppointmentModel.patientDetailQuery,
        },
      )

      // GET: /appointments/:appointment_id
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
        { params: AppointmentModel.appointmentParams },
      )

      // PATCH: /appointments/:appointment_id/confirm
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
        { params: AppointmentModel.appointmentParams },
      )

      // PATCH: /appointments/:appointment_id/cancel
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
        },
      )

      // PATCH: /appointments/:appointment_id/complete
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
        { params: AppointmentModel.appointmentParams },
      )

      // PATCH /appointments/:appointment_id/no-show
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
        },
      )

      // PATCH: /appointments/:appointment_id/reschedule
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
        },
      ),
  );
