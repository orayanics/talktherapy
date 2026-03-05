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
      // GET: /availability
      .get(
        "/",
        async ({ auth, query }) => {
          const clinician_id =
            auth!.role !== "clinician"
              ? undefined
              : await AvailabilityService.resolveClinicianId(auth!.userId);
          return AvailabilityService.listRules(query, clinician_id);
        },
        { query: AvailabilityModel.listQuery },
      )
      // GET: /availability/:rule_id
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
        { params: AvailabilityModel.ruleParams },
      ),
  )
  .guard({ isAuth: true, hasRole: ["clinician"] }, (app) =>
    app

      // POST: /availability
      .post(
        "/",
        async ({ auth, body }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return AvailabilityService.createRule(clinician_id, body);
        },
        { body: AvailabilityModel.createBody },
      )

      // PATCH: /availability/:rule_id
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
        },
      )

      // DELETE: /availability/:rule_id
      .delete(
        "/:rule_id",
        async ({ auth, params }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return AvailabilityService.deleteRule(clinician_id, params.rule_id);
        },
        { params: AvailabilityModel.ruleParams },
      )
      // PATCH: /availability/:rule_id/status
      .patch(
        "/:rule_id/status",
        async ({ auth, params }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return AvailabilityService.updateRuleStatus(
            clinician_id,
            params.rule_id,
          );
        },
        {
          params: AvailabilityModel.updateStatusParams,
        },
      ),
  );
