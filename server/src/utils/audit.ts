import { prisma } from "prisma/db";

// ─── Action constants ────────────────────────────────────────────────────────

export const AUDIT_ACTION = {
  // Auth
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  CHANGE_PASSWORD: "CHANGE_PASSWORD",
  // Registration
  REGISTER_PATIENT: "REGISTER_PATIENT",
  REGISTER_CLINICIAN: "REGISTER_CLINICIAN",
  REGISTER_ADMIN: "REGISTER_ADMIN",
  // OTP
  OTP_SENT: "OTP_SENT",
  OTP_VERIFIED: "OTP_VERIFIED",
  OTP_RESENT: "OTP_RESENT",
  // Account management
  ACCOUNT_ACTIVATED: "ACCOUNT_ACTIVATED",
  ACCOUNT_DEACTIVATED: "ACCOUNT_DEACTIVATED",
  ACCOUNT_REACTIVATED: "ACCOUNT_REACTIVATED",
  ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED",
  // Content
  CONTENT_CREATED: "CONTENT_CREATED",
  CONTENT_UPDATED: "CONTENT_UPDATED",
  CONTENT_DELETED: "CONTENT_DELETED",
} as const;

export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];

// ─── Entity constants ────────────────────────────────────────────────────────

export const AUDIT_ENTITY = {
  USER: "USER",
  OTP: "OTP",
  ACCOUNT: "ACCOUNT",
  CONTENT: "CONTENT",
  SESSION: "SESSION",
} as const;

export type AuditEntity = (typeof AUDIT_ENTITY)[keyof typeof AUDIT_ENTITY];

// ─── logAction ───────────────────────────────────────────────────────────────

export interface AuditContext {
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: AuditAction;
  entity?: AuditEntity | null;
  entityId?: string | null;
  details?: string | null;
}

/**
 * Fire-and-forget audit log writer. Never throws or blocks a request.
 */
export function logAction(ctx: AuditContext): void {
  prisma.auditLog
    .create({
      data: {
        actor_id: ctx.actorId ?? null,
        actor_email: ctx.actorEmail ?? null,
        actor_role: ctx.actorRole ?? null,
        action: ctx.action,
        entity: ctx.entity ?? null,
        entity_id: ctx.entityId ?? null,
        details: ctx.details ?? null,
      },
    })
    .catch((err: unknown) =>
      console.error(
        "[audit] failed to write log:",
        err instanceof Error ? err.message : err,
      ),
    );
}
