import Elysia, { t } from "elysia";
import { z } from "zod";

import { betterAuthPlugin } from "@/plugin/better-auth";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { ApiError, ApiSuccess, ok, tryOk } from "@/lib/response";
import { prisma } from "@/lib/client";

const BanUserSchema = z.object({
  userId: z.string(),
});

export const authModule = new Elysia({ prefix: "/auth" })
  .use(betterAuthPlugin)
  .post(
    "/ban",
    async ({ user, body, request, status }) => {
      const result = await tryOk(() =>
        auth.api.banUser({
          headers: request.headers,
          body: {
            userId: body.userId,
          },
        }),
      );

      if (!result.success) return status(400, result);

      await prisma.user.update({
        where: { id: body.userId },
        data: { status: "suspended" },
      });

      await logAudit({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role ?? "unknown",
        action: "auth.ban-user",
        details: {
          userId: body.userId,
        },
      });

      return status(200, ok(result.data));
    },
    {
      requireAdmin: true,
      body: BanUserSchema,
      response: {
        200: ApiSuccess(t.Any()),
        400: ApiError,
      },
    },
  )
  .post(
    "/unban",
    async ({ user, body, request, status }) => {
      const result = await tryOk(() =>
        auth.api.unbanUser({
          headers: request.headers,
          body: {
            userId: body.userId,
          },
        }),
      );

      if (!result.success) return status(400, result);

      await prisma.user.update({
        where: { id: body.userId },
        data: { status: "active" },
      });

      await logAudit({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role ?? "unknown",
        action: "auth.unban-user",
        details: {
          userId: body.userId,
        },
      });

      return status(200, ok(result.data));
    },
    {
      requireAdmin: true,
      body: BanUserSchema,
      response: {
        200: ApiSuccess(t.Any()),
        400: ApiError,
      },
    },
  );
