export type APPOINTMENT_STATUS =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'

export type APPOINTMENT_EVENT_TYPE =
  | 'booked'
  | 'confirmed'
  | 'cancelled'
  | 'rescheduled'
  | 'completed'
  | 'no_show'

export type APPOINTMENT_STATUS_VALUES = {
  [key in APPOINTMENT_STATUS]: string
}

export type APPOINTMENT_EVENT_TYPE_VALUES = {
  [key in APPOINTMENT_EVENT_TYPE]: string
}
