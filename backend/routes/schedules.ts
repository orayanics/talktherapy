// routes/schedules.ts
import { Elysia, t } from "elysia";
import {
  ScheduleRuleModel,
  ScheduleInstanceModel,
  ClinicianModel,
} from "../models";

export const scheduleRoutes = new Elysia({ name: "schedule-routes" }).group(
  "/api/schedules",
  (app) =>
    app.guard(
      {
        isAuth: true,
        detail: {
          tags: ["Schedules"],
        },
      },
      (app) =>
        app
          // ==================== Schedule Rules ====================
          .group("/rules", (app) =>
            app
              // Create schedule rule
              .post(
                "/",
                ({ body, user, error }) => {
                  // Only clinicians and admins can create schedule rules
                  if (user.account_role === "patient") {
                    return error(403, {
                      error: "Forbidden",
                      message: "Patients cannot create schedule rules",
                    });
                  }

                  // If user is a clinician, use their clinician ID
                  let clinicianId = body.clinician_id;
                  if (user.account_role === "clinician") {
                    const clinician = ClinicianModel.findByUserId(user.id);
                    if (!clinician) {
                      return error(400, {
                        error: "Bad Request",
                        message: "Clinician record not found",
                      });
                    }
                    clinicianId = clinician.id;
                  }

                  const rule = ScheduleRuleModel.create({
                    clinician_id: clinicianId,
                    start_date: body.start_date,
                    end_date: body.end_date,
                    start_time: body.start_time,
                    end_time: body.end_time,
                    recurrence: body.recurrence,
                    recurrence_meta: body.recurrence_meta,
                    timezone: body.timezone || "UTC",
                    is_active: 1,
                  });

                  return rule;
                },
                {
                  body: t.Object({
                    clinician_id: t.String(),
                    start_date: t.String(),
                    end_date: t.Optional(t.String()),
                    start_time: t.String(),
                    end_time: t.String(),
                    recurrence: t.Optional(t.String()),
                    recurrence_meta: t.Optional(t.String()),
                    timezone: t.Optional(t.String()),
                  }),
                  detail: {
                    summary: "Create schedule rule",
                    description:
                      "Create a recurring schedule rule for a clinician",
                  },
                },
              )

              // Get schedule rules by clinician
              .get(
                "/",
                ({ query, error }) => {
                  if (!query.clinician_id) {
                    return error(400, {
                      error: "Bad Request",
                      message: "clinician_id is required",
                    });
                  }

                  return ScheduleRuleModel.findByClinicianId(
                    query.clinician_id,
                  );
                },
                {
                  query: t.Object({
                    clinician_id: t.String(),
                  }),
                  detail: {
                    summary: "List schedule rules",
                    description: "Get all schedule rules for a clinician",
                  },
                },
              )

              // Get specific schedule rule
              .get(
                "/:id",
                ({ params: { id }, error }) => {
                  const rule = ScheduleRuleModel.findById(id);

                  if (!rule) {
                    return error(404, {
                      error: "Not Found",
                      message: "Schedule rule not found",
                    });
                  }

                  return rule;
                },
                {
                  params: t.Object({
                    id: t.String(),
                  }),
                  detail: {
                    summary: "Get schedule rule by ID",
                  },
                },
              )

              // Toggle schedule rule active status
              .patch(
                "/:id/toggle",
                ({ params: { id }, error }) => {
                  const rule = ScheduleRuleModel.toggleActive(id);

                  if (!rule) {
                    return error(404, {
                      error: "Not Found",
                      message: "Schedule rule not found",
                    });
                  }

                  return rule;
                },
                {
                  params: t.Object({
                    id: t.String(),
                  }),
                  detail: {
                    summary: "Toggle schedule rule",
                    description: "Activate or deactivate a schedule rule",
                  },
                },
              ),
          )

          // ==================== Schedule Instances ====================
          .group("/instances", (app) =>
            app
              // Create schedule instance
              .post(
                "/",
                ({ body }) => {
                  const instance = ScheduleInstanceModel.create({
                    schedule_rule_id: body.schedule_rule_id,
                    clinician_id: body.clinician_id,
                    starts_at: body.starts_at,
                    ends_at: body.ends_at,
                    status: "available",
                  });

                  return instance;
                },
                {
                  body: t.Object({
                    schedule_rule_id: t.String(),
                    clinician_id: t.String(),
                    starts_at: t.String(),
                    ends_at: t.String(),
                  }),
                  detail: {
                    summary: "Create schedule instance",
                    description: "Create a specific time slot instance",
                  },
                },
              )

              // Get available slots for a clinician
              .get(
                "/available",
                ({ query, error }) => {
                  if (!query.clinician_id) {
                    return error(400, {
                      error: "Bad Request",
                      message: "clinician_id is required",
                    });
                  }

                  return ScheduleInstanceModel.findAvailableByClinicianId(
                    query.clinician_id,
                  );
                },
                {
                  query: t.Object({
                    clinician_id: t.String(),
                  }),
                  detail: {
                    summary: "Get available time slots",
                    description:
                      "Get all available schedule instances for a clinician",
                  },
                },
              )

              // Get available slots by date range
              .get(
                "/available/range",
                ({ query, error }) => {
                  if (!query.start_date || !query.end_date) {
                    return error(400, {
                      error: "Bad Request",
                      message: "start_date and end_date are required",
                    });
                  }

                  return ScheduleInstanceModel.findAvailableByDateRange(
                    query.start_date,
                    query.end_date,
                  );
                },
                {
                  query: t.Object({
                    start_date: t.String(),
                    end_date: t.String(),
                  }),
                  detail: {
                    summary: "Get available slots by date range",
                  },
                },
              )

              // Update schedule instance status
              .patch(
                "/:id/status",
                ({ params: { id }, body, error }) => {
                  const instance = ScheduleInstanceModel.updateStatus(
                    id,
                    body.status,
                  );

                  if (!instance) {
                    return error(404, {
                      error: "Not Found",
                      message: "Schedule instance not found",
                    });
                  }

                  return instance;
                },
                {
                  params: t.Object({
                    id: t.String(),
                  }),
                  body: t.Object({
                    status: t.Union([
                      t.Literal("available"),
                      t.Literal("booked"),
                      t.Literal("blocked"),
                    ]),
                  }),
                  detail: {
                    summary: "Update schedule instance status",
                  },
                },
              ),
          ),
    ),
);
