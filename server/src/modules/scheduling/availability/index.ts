import { Elysia } from "elysia";
import { jwtPlugin } from "@/plugins/jwt";
import { AvailabilityService } from "./service";
import { AvailabilityModel } from "./model";

export const availabilityController = new Elysia({
  prefix: "/availability",
  detail: { tags: ["Clinician / Availability"] },
})
  .use(jwtPlugin)
  .guard({ isAuth: true, hasRole: ["clinician", "admin"] }, (app) =>
    app
      // ── GET /availability ───────────────────────────────────────
      .get(
        "/",
        async ({ auth, query }) => {
          if (auth!.role !== "clinician") {
            return AvailabilityService.listAllRules(query);
          }

          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return AvailabilityService.listRules(clinician_id, query);
        },
        {
          query: AvailabilityModel.listQuery,
          detail: { summary: "List own availability rules" },
        },
      )
      // ── GET /availability/:rule_id ──────────────────────────────
      .get(
        "/:rule_id",
        async ({ auth, params }) => {
          if (auth!.role !== "clinician") {
            return AvailabilityService.getRuleById(params.rule_id);
          }

          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return AvailabilityService.getRule(clinician_id, params.rule_id);
        },
        {
          params: AvailabilityModel.ruleParams,
          detail: { summary: "Get a single availability rule with its slots" },
        },
      ),
  )
  .guard({ isAuth: true, hasRole: ["clinician"] }, (app) =>
    app

      // ── POST /availability ──────────────────────────────────────
      .post(
        "/",
        async ({ auth, body }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return AvailabilityService.createRule(clinician_id, body);
        },
        {
          body: AvailabilityModel.createBody,
          detail: {
            summary: "Create an availability rule and pre-generate slots",
          },
        },
      )

      // ── PATCH /availability/:rule_id ────────────────────────────
      .patch(
        "/:rule_id",
        async ({ auth, params, body }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return AvailabilityService.updateRule(
            clinician_id,
            params.rule_id,
            body,
          );
        },
        {
          params: AvailabilityModel.ruleParams,
          body: AvailabilityModel.updateBody,
          detail: {
            summary: "Update rule (regenerates slots if timing changes)",
          },
        },
      )

      // ── DELETE /availability/:rule_id ───────────────────────────
      .delete(
        "/:rule_id",
        async ({ auth, params }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return AvailabilityService.deleteRule(clinician_id, params.rule_id);
        },
        {
          params: AvailabilityModel.ruleParams,
          detail: { summary: "Delete a rule (blocked if booked slots exist)" },
        },
      ),
  );
