import { Elysia } from "elysia";
import { jwtPlugin } from "@/plugins/jwt";
import { AvailabilityService } from "../availability/service";
import { SoapService } from "./service";
import { SoapModel } from "./model";

export const soapController = new Elysia({
  prefix: "/soap",
  detail: { tags: ["Scheduling / SOAP"] },
})
  .use(jwtPlugin)

  // ── Patient routes ───────────────────────────────────────────────
  .guard({ isAuth: true, hasRole: ["patient"] }, (app) =>
    app
      // GET /soap/my
      .get("/my", ({ auth }) => SoapService.listPatientSoaps(auth!.userId))

      // GET /soap/my/:soap_id
      .get(
        "/my/:soap_id",
        ({ auth, params }) =>
          SoapService.getPatientSoap(auth!.userId, params.soap_id),
        { params: SoapModel.soapParams },
      ),
  )

  // ── Clinician routes ─────────────────────────────────────────────
  .guard({ isAuth: true, hasRole: ["clinician"] }, (app) =>
    app
      // GET /soap/patients/:patient_id — list SOAPs for a handled patient
      .get(
        "/patients/:patient_id",
        async ({ auth, params }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return SoapService.listSoapsByPatient(
            clinician_id,
            params.patient_id,
          );
        },
        { params: SoapModel.patientParams },
      )

      // POST /soap/patients/:patient_id — create SOAP for a handled patient
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

      // GET /soap/:soap_id — get single SOAP (must own)
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

      // PATCH /soap/:soap_id — update SOAP (must own)
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
