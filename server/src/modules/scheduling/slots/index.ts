import { Elysia } from "elysia";
import { jwtPlugin } from "@/plugins/jwt";
import { SlotService } from "./service";
import { SlotModel } from "./model";
import { AvailabilityService } from "../availability/service";
import { AppointmentService } from "../appointments/service";
import { AppointmentModel } from "../appointments/model";

export const slotController = new Elysia({
  prefix: "/slots",
  detail: { tags: ["Clinician / Slots"] },
})
  .use(jwtPlugin)
  .guard({ isAuth: true, hasRole: ["clinician", "admin"] }, (app) =>
    app
      // ── GET /slots/:slot_id/appointment ─────────────────────────
      .get(
        "/:slot_id/appointment",
        async ({ auth, params }) => {
          if (auth!.role !== "clinician") {
            return SlotService.getAnySlotAppointment(params.slot_id);
          }

          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return SlotService.getSlotAppointment(clinician_id, params.slot_id);
        },
        {
          params: SlotModel.slotParams,
          detail: { summary: "Get appointment details for a clinician's slot" },
        },
      ),
  )
  .guard({ isAuth: true, hasRole: ["patient"] }, (app) =>
    app
      // ── GET /slots/available ────────────────────────────────────
      .get(
        "/available",
        async ({ query }) => {
          return SlotService.listAllSlots(query);
        },
        {
          query: SlotModel.listQuery,
          detail: {
            summary: "List all available slots with optional filters",
          },
        },
      )

      // ── POST /slots/:slot_id/book ───────────────────────────────
      .post(
        "/:slot_id/book",
        async ({ auth, params, body }) => {
          return AppointmentService.bookAppointment(
            auth!.userId,
            params.slot_id,
            body,
          );
        },
        {
          params: SlotModel.slotParams,
          body: AppointmentModel.bookBody,
          detail: { summary: "Book an available slot as a patient" },
        },
      ),
  )
  .guard({ isAuth: true, hasRole: ["clinician"] }, (app) =>
    app
      // ── GET /slots ──────────────────────────────────────────────
      .get(
        "/",
        async ({ auth, query }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return SlotService.listSlots(clinician_id, query);
        },
        {
          query: SlotModel.listQuery,
          detail: { summary: "List own slots with optional filters" },
        },
      )

      // ── PATCH /slots/:slot_id/block ─────────────────────────────
      .patch(
        "/:slot_id/block",
        async ({ auth, params }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return SlotService.blockSlot(clinician_id, params.slot_id);
        },
        {
          params: SlotModel.slotParams,
          detail: { summary: "Block an available slot" },
        },
      )

      // ── PATCH /slots/:slot_id/unblock ───────────────────────────
      .patch(
        "/:slot_id/unblock",
        async ({ auth, params }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return SlotService.unblockSlot(clinician_id, params.slot_id);
        },
        {
          params: SlotModel.slotParams,
          detail: { summary: "Unblock a blocked slot" },
        },
      )

      // ── DELETE /slots/:slot_id ──────────────────────────────────
      .delete(
        "/:slot_id",
        async ({ auth, params }) => {
          const clinician_id = await AvailabilityService.resolveClinicianId(
            auth!.userId,
          );
          return SlotService.deleteSlot(clinician_id, params.slot_id);
        },
        {
          params: SlotModel.slotParams,
          detail: { summary: "Delete a slot" },
        },
      ),
  );
