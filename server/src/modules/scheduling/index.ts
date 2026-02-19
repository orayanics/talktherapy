import { Elysia } from "elysia";
import { availabilityController } from "./availability";
import { slotController } from "./slots";
import { appointmentController } from "./appointments";

/**
 * Scheduling module for account_role: clinician
 *
 * Mounts under /scheduling (or wherever the parent app prefixes it).
 *
 * Sub-routes:
 *   /scheduling/availability   - CRUD for AvailabilityRule + slot generation
 *   /scheduling/slots          - View slots, block/unblock
 *   /scheduling/appointments   - Confirm, cancel, complete, no-show, reschedule
 *
 * Patient scheduling interface:
 *   AppointmentService.performReschedule() is intentionally exported for reuse
 *   in a future patient scheduling module without duplicating transaction logic.
 */
export const schedulingModule = new Elysia({ prefix: "/scheduling" })
  .use(availabilityController)
  .use(slotController)
  .use(appointmentController);
