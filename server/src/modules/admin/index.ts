import Elysia from "elysia";
import { betterAuthPlugin } from "@/plugin/better-auth";
import { prisma } from "@/lib/client";
import { ApiError, ApiSuccess, ok } from "@/lib/response";

export const adminModule = new Elysia({ prefix: "/admin" })
  .use(betterAuthPlugin)
  .get(
    "/stats",
    async ({ status }) => {
      try {
        const [totalUsers, usersByRole, appointmentsByStatus, slotsByStatus] =
          await Promise.all([
            prisma.user.count(),
            // counts per role
            (async () => {
              const roles = ["superadmin", "admin", "clinician", "patient"];
              const map: Record<string, number> = {};
              await Promise.all(
                roles.map(async (r) => {
                  map[r] = await prisma.user.count({
                    where: { role: r as any },
                  });
                }),
              );
              return map;
            })(),
            (async () => {
              const statuses = [
                "PENDING",
                "ACCEPTED",
                "REJECT",
                "CANCELLED",
                "COMPLETED",
              ];
              const map: Record<string, number> = {};
              await Promise.all(
                statuses.map(async (s) => {
                  map[s] = await prisma.appointment.count({
                    where: { status: s },
                  });
                }),
              );
              return map;
            })(),
            (async () => {
              const statuses = [
                "FREE",
                "PENDING",
                "ACCEPTED",
                "REJECT",
                "CANCELLED",
                "COMPLETED",
              ];
              const map: Record<string, number> = {};
              await Promise.all(
                statuses.map(async (s) => {
                  map[s] = await prisma.slot.count({
                    where: { status: s as any },
                  });
                }),
              );
              return map;
            })(),
          ]);

        return status(
          200,
          ok({
            totalUsers,
            usersByRole,
            appointmentsByStatus,
            slotsByStatus,
          }),
        );
      } catch (err: unknown) {
        return status(500, {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    },
    {
      requireAdmin: true,
      response: { 200: ApiSuccess(), 500: ApiError },
    },
  );
