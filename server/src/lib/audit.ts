import { prisma } from "@/lib/client";

interface LogAuditProps {
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  details?: Record<string, unknown>;
}

export async function logAudit(props: LogAuditProps) {
  return prisma.auditLog.create({
    data: {
      actorId: props.actorId,
      actorEmail: props.actorEmail,
      actorRole: props.actorRole,
      action: props.action,
      details: props.details ? JSON.stringify(props.details) : undefined,
    },
  });
}
