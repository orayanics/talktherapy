import { Elysia } from "elysia";
import { jwtPlugin } from "@/plugins/jwt";
import { SlotService } from "./service";
import { SlotModel } from "./model";
import { AvailabilityService } from "../availability/service";

export const slotController = new Elysia({
  prefix: "/slots",
  detail: { tags: ["Clinician / Slots"] },
})
  .use(jwtPlugin)
  .guard({ isAuth: true, hasRole: ["patient"] }, (app) =>
    app
      // ── GET /slots ──────────────────────────────────────────────
      .get(
        "/available",
        async ({ query }) => {
          return SlotService.listAllSlots(query);
        },
        {
          query: SlotModel.listQuery,
          detail: {
            summary: "List all slots with optional filters (admin only)",
          },
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
