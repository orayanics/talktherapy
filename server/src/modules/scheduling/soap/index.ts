import { Elysia } from "elysia";
import { jwtPlugin } from "@/plugins/jwt";
import { AvailabilityService } from "../availability/service";
import { SoapService } from "./service";
import { SoapModel } from "./model";

export const soapController = new Elysia({
  prefix: "/soaps",
  detail: { tags: ["Scheduling / SOAP"] },
})
  .use(jwtPlugin)

  // ── Patient routes ───────────────────────────────────────────────
  .guard({ isAuth: true, hasRole: ["patient"] }, (app) =>
    app
      // GET /soaps
      .get(
        "/",
        ({ auth, query }) => SoapService.listPatientSoaps(auth!.userId, query),
        { query: SoapModel.patientListQuery },
      )

      // GET /soaps/:soap_id
      .get(
        "/:soap_id",
        ({ auth, params }) =>
          SoapService.getPatientSoap(auth!.userId, params.soap_id),
        { params: SoapModel.soapParams },
      ),
  )

  // ── Clinician routes ─────────────────────────────────────────────
  .guard({ isAuth: true, hasRole: ["clinician"] }, (app) =>
    app
      // GET /soaps/patients/:patient_id — list SOAPs for a handled patient
      .get(
        "/patients/:patient_id",
        async ({ auth, params, query }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return SoapService.listSoapsByPatient(
            clinician_id,
            params.patient_id,
            query,
          );
        },
        {
          params: SoapModel.patientParams,
          query: SoapModel.clinicianListQuery,
        },
      )

      // POST /soaps/patients/:patient_id — create SOAP for a handled patient
      .post(
        "/patients/:patient_id",
        async ({ auth, params, body }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return SoapService.createSoap(clinician_id, params.patient_id, body);
        },
        {
          params: SoapModel.patientParams,
          body: SoapModel.createBody,
        },
      )

      // GET /soaps/:soap_id — get single SOAP (must own)
      .get(
        "/:soap_id",
        async ({ auth, params }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return SoapService.getSoap(clinician_id, params.soap_id);
        },
        { params: SoapModel.soapParams },
      )

      // PATCH /soaps/:soap_id — update SOAP (must own)
      .patch(
        "/:soap_id",
        async ({ auth, params, body }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return SoapService.updateSoap(clinician_id, params.soap_id, body);
        },
        {
          params: SoapModel.soapParams,
          body: SoapModel.updateBody,
        },
      ),
  );
