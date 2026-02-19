export type Freq = "none" | "DAILY" | "WEEKLY" | "MONTHLY";

export interface CreateAvailabilityPayload {
  starts_at: string;
  ends_at: string;
  recurrence_rule?: string;
  horizon_days?: number;
}

export interface CreateSchedulePayload {
  date: string;
  start_time: string;
  end_time: string;
  freq: Freq;
  selected_days: string[];
  horizon_days: number;
}
