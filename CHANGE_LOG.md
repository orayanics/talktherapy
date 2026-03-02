# Change Log

All notable changes from the appointment booking feature development session.

---

## Appointment Booking System

### New Features

#### Patient: Book an Appointment

- **`web/src/api/appointments.ts`** _(new)_ — All appointment-related API calls: `useBookAppointmentSlot`, `patientMyAppointmentsQuery`, `clinicianSlotAppointmentQuery`, `useConfirmAppointmentById`, `useCancelAppointmentById`, `useUnblockSlot`
- **`web/src/modules/appointment/list/ModalBookAppointment.tsx`** _(new)_ — Intake form modal with fields: Medical Diagnosis, Source of Referral, Chief Complaint, Referral Document (link or file upload as base64)
- **`web/src/modules/appointment/list/useBookAppointment.tsx`** _(new)_ — Hook managing booking form state, modal open/close, and submit
- **`web/src/modules/appointment/list/AppointmentCard.tsx`** _(modified)_ — Wired the Book button to open `ModalBookAppointment` with `e.stopPropagation()`

#### Patient: My Appointments

- **`web/src/modules/appointment/my/MyAppointmentList.tsx`** _(new)_ — Table listing patient's own appointments with columns: Status, Date, Time, Clinician, Specialty, Chief Complaint, Room ID
- **`web/src/routes/_private/(patient)/my-appointments/index.tsx`** _(new)_ — Route at `/my-appointments` with status filter, pagination, and `patientMyAppointmentsQuery`
- **`web/src/config/sidebar.tsx`** _(modified)_ — Added "My Appointments" nav item to `PATIENT_NAV_ITEMS`

#### Clinician: Appointment Detail View

- **`web/src/modules/appointment/detail/AppointmentDetail.tsx`** _(new)_ — Full appointment detail component showing status badge, schedule info (Date, Time, Booked On, Patient ID, Room ID), patient intake (diagnosis, chief complaint, referral), and action buttons (Accept / Reject / Cancel Appointment)
- **`web/src/modules/appointment/detail/useAppointmentActions.tsx`** _(new)_ — Hook managing confirm/cancel modal state, `keepBlocked` toggle, and mutation calls
- **`web/src/modules/appointment/detail/ModalCancelAppointment.tsx`** _(new)_ — Cancel/Reject modal with optional reason textarea and "Keep slot blocked" checkbox (shown only when rejecting a PENDING appointment)
- **`web/src/routes/_private/(clinician)/slots/$slotId.tsx`** _(new)_ — Clinician route at `/slots/:slotId` rendering `AppointmentDetail` with loading/error/empty states and an "Unblock Slot" button shown when the appointment is `CANCELLED` and the slot is `BLOCKED`

---

### Server Changes

#### `server/src/modules/scheduling/appointments/model.ts`

- Added `bookBody` schema: `medical_diagnosis`, `source_referral`, `chief_complaint`, `referral_url`
- Added `cancelBody` field: `keep_blocked?: boolean` — controls whether the slot stays blocked after rejection/cancellation (defaults to `true`)
- Added `patientListQuery` schema for paginated `GET /my` endpoint

#### `server/src/modules/scheduling/appointments/service.ts`

- **`bookAppointment`** — Creates `PENDING` appointment + `Encounter` record + `BOOKED` event in a single transaction. Slot validation is performed inside the transaction to handle race conditions
- **`listPatientAppointments`** — Paginated query returning a patient's own appointments with slot (clinician, diagnosis) and encounter data
- **`confirmAppointment`** — Generates and sets `room_id` via `crypto.randomUUID()` on confirmation
- **`cancelAppointment`** — Clears `room_id` on cancellation; sets slot to `BLOCKED` or `AVAILABLE` based on `keep_blocked` flag

#### `server/src/modules/scheduling/appointments/index.ts`

- Added patient guard with `GET /my` route for listing own appointments

#### `server/src/modules/scheduling/slots/service.ts`

- **`listAllSlots`** — Now defaults to `status: "AVAILABLE"` when no filter is passed, preventing `CANCELLED`/`BLOCKED` slots from appearing in the patient-facing availability list
- **`listSlots`** (clinician) — Updated `SLOT_SELECT` and inline include to use `appointments[]` with `status: { not: "CANCELLED" }` filter showing only the active appointment per slot
- **`getSlotAppointment`** — Updated to `findFirst` ordered by `booked_at DESC` to return the most recent appointment (including `CANCELLED`) for the detail view

#### `server/src/modules/scheduling/slots/index.ts`

- Added patient guard: `POST /:slot_id/book`
- Added clinician guard: `GET /:slot_id/appointment`

---

### Schema Changes

#### `server/prisma/schema.prisma`

- Removed `@unique` from `Appointments.slot_id` — a slot can now accumulate appointment history (cancelled + rebooked)
- Changed `Slot.appointment Appointments?` → `Slot.appointments Appointments[]` (one-to-many relation)

#### Migration

- **`20260301053803_slot_appointment_history`** — Drops the unique index on `Appointments.slot_id`

---

### Client Model Updates

#### `web/src/models/schedule.ts`

- Added `BookAppointmentPayload`
- Added `MyAppointmentsParams`
- Added `PatientMyAppointmentDto` (includes `room_id`)
- Added `SlotAppointmentDto` (includes `room_id`)
- Added `SlotAppointmentEncounter`, `SlotAppointmentEvent`
- Added `ServerAppointmentStatus` union type

#### `web/src/config/message.tsx`

- Added `APPOINTMENT.book`, `APPOINTMENT.confirm`, `APPOINTMENT.cancel`, `APPOINTMENT.unblock` message constants

---

### Bug Fixes

| Issue                                                                                      | Fix                                                                                      |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Booking a slot returned `P2002` unique constraint error on re-submission or race condition | Moved slot status check inside the transaction; removed unique constraint from `slot_id` |
| Cancelled slots appeared in the patient availability list                                  | `listAllSlots` now defaults filter to `status: "AVAILABLE"`                              |
| Viewing a cancelled appointment via `/slots/:slotId` returned 404                          | `getSlotAppointment` no longer filters out `CANCELLED` status in the detail query        |
| `room_id` was not cleared when a confirmed appointment was cancelled                       | `cancelAppointment` now sets `room_id: null`                                             |

TODO:
session check for localstorage or token first before firing session call
