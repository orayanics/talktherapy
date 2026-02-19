import type {
  AppointmentStatus,
  SlotStatus,
  AppointmentEventType,
  ActorType,
} from "prisma/generated/enums";
export const SLOT_EXPANSION_DAYS = 30;
export const RESCHEDULE_CUTOFF_DAYS = 3;

export interface ExpandedOccurrence {
  starts_at: Date;
  ends_at: Date;
}

export interface ClinicianContext {
  clinician_id: string;
  user_id: string;
}

export { AppointmentStatus, SlotStatus, AppointmentEventType, ActorType };
