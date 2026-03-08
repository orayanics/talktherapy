/**
 * Notification type constants and message templates.
 *
 * Each entry defines:
 *  - title   – short heading shown in the notification bell
 *  - message – human-readable body; supports {placeholders}
 *  - entity_type – the related entity (for deep-links on the frontend)
 */

export const NOTIFICATION_TYPE = {
  // ── Appointment ──────────────────────────────────────────────────────────
  /** Clinician receives: a patient booked a slot */
  APPOINTMENT_BOOKED: "APPOINTMENT_BOOKED",
  /** Patient receives: clinician accepted their request */
  APPOINTMENT_CONFIRMED: "APPOINTMENT_CONFIRMED",
  /** Patient receives: clinician cancelled their appointment */
  APPOINTMENT_CANCELLED_BY_CLINICIAN: "APPOINTMENT_CANCELLED_BY_CLINICIAN",
  /** Clinician receives: patient cancelled their appointment */
  APPOINTMENT_CANCELLED_BY_PATIENT: "APPOINTMENT_CANCELLED_BY_PATIENT",
  /** Patient receives: appointment was marked completed */
  APPOINTMENT_COMPLETED: "APPOINTMENT_COMPLETED",
  /** Patient receives: marked as no-show */
  APPOINTMENT_NO_SHOW: "APPOINTMENT_NO_SHOW",
  /** Patient receives: clinician rescheduled their appointment */
  APPOINTMENT_RESCHEDULED_BY_CLINICIAN: "APPOINTMENT_RESCHEDULED_BY_CLINICIAN",
  /** Clinician receives: patient rescheduled their appointment */
  APPOINTMENT_RESCHEDULED_BY_PATIENT: "APPOINTMENT_RESCHEDULED_BY_PATIENT",

  // ── Export ────────────────────────────────────────────────────────────────
  /** Admin receives: system log export is complete */
  EXPORT_COMPLETE: "EXPORT_COMPLETE",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export interface NotificationTemplate {
  title: string;
  /** Message with optional {placeholder} tokens */
  message: string;
  entity_type: "appointment" | "export" | null;
}

export const NOTIFICATION_TEMPLATES: Record<
  NotificationType,
  NotificationTemplate
> = {
  [NOTIFICATION_TYPE.APPOINTMENT_BOOKED]: {
    title: "New Appointment Request",
    message: "A patient has requested an appointment on {date} at {time}.",
    entity_type: "appointment",
  },
  [NOTIFICATION_TYPE.APPOINTMENT_CONFIRMED]: {
    title: "Appointment Confirmed",
    message: "Your appointment on {date} at {time} has been confirmed.",
    entity_type: "appointment",
  },
  [NOTIFICATION_TYPE.APPOINTMENT_CANCELLED_BY_CLINICIAN]: {
    title: "Appointment Cancelled",
    message: "Your appointment on {date} at {time} has been cancelled.",
    entity_type: "appointment",
  },
  [NOTIFICATION_TYPE.APPOINTMENT_CANCELLED_BY_PATIENT]: {
    title: "Appointment Cancelled by Patient",
    message: "A patient has cancelled their appointment on {date} at {time}.",
    entity_type: "appointment",
  },
  [NOTIFICATION_TYPE.APPOINTMENT_COMPLETED]: {
    title: "Appointment Completed",
    message:
      "Your appointment on {date} at {time} has been marked as completed.",
    entity_type: "appointment",
  },
  [NOTIFICATION_TYPE.APPOINTMENT_NO_SHOW]: {
    title: "Appointment No Show",
    message:
      "You were marked as no-show for your appointment on {date} at {time}.",
    entity_type: "appointment",
  },
  [NOTIFICATION_TYPE.APPOINTMENT_RESCHEDULED_BY_CLINICIAN]: {
    title: "Appointment Rescheduled",
    message: "Your appointment has been rescheduled to {date} at {time}.",
    entity_type: "appointment",
  },
  [NOTIFICATION_TYPE.APPOINTMENT_RESCHEDULED_BY_PATIENT]: {
    title: "Appointment Rescheduled by Patient",
    message: "A patient has rescheduled their appointment to {date} at {time}.",
    entity_type: "appointment",
  },
  [NOTIFICATION_TYPE.EXPORT_COMPLETE]: {
    title: "Export Ready",
    message: "Your system log export is ready to download.",
    entity_type: "export",
  },
};

/**
 * Interpolates {placeholder} tokens in a template message.
 *
 * @example
 * buildMessage("Appointment on {date} at {time}", { date: "Jan 1", time: "9am" })
 * // → "Appointment on Jan 1 at 9am"
 */
export function buildMessage(
  template: string,
  context: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => context[key] ?? `{${key}}`);
}
