import { Elysia } from "elysia";
import { availabilityController } from "./availability";
import { slotController } from "./slots";
import { appointmentController } from "./appointments";
import { soapController } from "./soap";

/**
 * Scheduling module
 *
 * Mounts under /scheduling (or wherever the parent app prefixes it).
 *
 * Sub-routes:
 *   /scheduling/availability   - CRUD for AvailabilityRule + slot generation
 *   /scheduling/slots          - View slots, block/unblock, book (patient)
 *   /scheduling/appointments   - Confirm, cancel, complete, no-show, reschedule
 *   /scheduling/soap           - SOAP notes (clinician write, patient read)
 */
export const schedulingModule = new Elysia({ prefix: "/scheduling" })
  .use(availabilityController)
  .use(slotController)
  .use(appointmentController)
  .use(soapController);
