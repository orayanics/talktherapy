import { prisma } from "prisma/db";
import type { LogsModel } from "./model";

function serializeLog(log: {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  details: string | null;
  created_at: Date;
}) {
  return { ...log, created_at: log.created_at.toISOString() };
}

export abstract class LogsService {
  static async getLogs(params: LogsModel.listQuery) {
    const {
      page = 1,
      per_page = 10,
      search,
      action,
      date_from,
      date_to,
    } = params;

    const where = {
      ...(search && {
        OR: [
          { actor_email: { contains: search } },
          { action: { contains: search } },
          { details: { contains: search } },
        ],
      }),
      ...(action && { action }),
      ...((date_from || date_to) && {
        created_at: {
          ...(date_from && { gte: new Date(date_from + "T00:00:00.000Z") }),
          ...(date_to && { lte: new Date(date_to + "T23:59:59.999Z") }),
        },
      }),
    };

    const [logs, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * per_page,
        take: per_page,
        orderBy: { created_at: "desc" },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const last_page = Math.max(1, Math.ceil(total / per_page));
    const from = total === 0 ? 0 : (page - 1) * per_page + 1;
    const to = Math.min(page * per_page, total);

    return {
      data: logs.map(serializeLog),
      meta: { total, page, per_page, last_page, from, to },
    };
  }

  // fetch logs in chunks (100 maximum per chunk)
  // returns single json or zip
  static async exportLogs(date?: string): Promise<{
    filename: string;
    buffer: Buffer;
    contentType: string;
  }> {
    const where = date
      ? {
          created_at: {
            gte: new Date(date + "T00:00:00.000Z"),
            lte: new Date(date + "T23:59:59.999Z"),
          },
        }
      : {};

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    const CHUNK_SIZE = 100;
    const dateStr = date ?? new Date().toISOString().slice(0, 10);
    const baseName = `logs-${dateStr}`;

    // No logs → reject so the WebSocket handler sends an error frame
    if (logs.length === 0) {
      const label = date ? `for ${date}` : "for all time";
      throw new Error(`No logs found ${label}.`);
    }

    // Build chunks
    const chunks: (typeof logs)[] = [];
    for (let i = 0; i < logs.length; i += CHUNK_SIZE) {
      chunks.push(logs.slice(i, i + CHUNK_SIZE));
    }

    const serialized = chunks.map((chunk) => chunk.map(serializeLog));

    // Single chunk → plain JSON file
    if (serialized.length === 1) {
      return {
        filename: `${baseName}.json`,
        buffer: Buffer.from(JSON.stringify(serialized[0], null, 2)),
        contentType: "application/json",
      };
    }

    // Multiple chunks → ZIP
    const { zipSync } = await import("fflate");
    const files: Record<string, Uint8Array> = {};
    serialized.forEach((chunk, idx) => {
      files[`${baseName}-${String(idx + 1).padStart(3, "0")}.json`] =
        new TextEncoder().encode(JSON.stringify(chunk, null, 2));
    });

    const zipped = zipSync(files);
    return {
      filename: `${baseName}.zip`,
      buffer: Buffer.from(zipped),
      contentType: "application/zip",
    };
  }
}
