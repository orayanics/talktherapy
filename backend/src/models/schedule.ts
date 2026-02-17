import { t } from "elysia";

export const ScheduleRuleModel = t.Object({
  id: t.String(),
  clinician_id: t.String(),
  start_date: t.String(),
  end_date: t.Optional(t.String()),
  start_time: t.String(),
  end_time: t.String(),
  recurrence: t.Optional(t.String()),
  recurrence_meta: t.Optional(t.String()),
  timezone: t.String(),
  is_active: t.Number(),
  created_at: t.String(),
  updated_at: t.String(),
});
export const ScheduleInstanceModel = t.Object({
  id: t.String(),
  schedule_rule_id: t.String(),
  clinician_id: t.String(),
  starts_at: t.String(),
  ends_at: t.String(),
  status: t.String(),
  created_at: t.String(),
  updated_at: t.String(),
});
