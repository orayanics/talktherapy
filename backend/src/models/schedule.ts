export interface ScheduleRule {
  id: string;
  clinician_id: string;
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  recurrence?: string;
  recurrence_meta?: string;
  timezone: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}
export interface ScheduleInstance {
  id: string;
  schedule_rule_id: string;
  clinician_id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  created_at: string;
  updated_at: string;
}
