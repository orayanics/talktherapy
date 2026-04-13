import { prisma } from "@/lib/client";
import { buildMeta } from "@/lib/paginate";
import type { TLogsListSchema, TLogsExportSchema } from "./model";

export async function fetchAllLogs(params: TLogsListSchema) {
  const {
    page = 1,
    per_page = 20,
    search,
    date_from,
    date_to,
    sort_by = "createdAt",
    sort = "desc",
  } = params;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { actorEmail: { contains: search } },
      { actorId: { contains: search } },
      { action: { contains: search } },
    ];
  }

  if (date_from || date_to) {
    const createdAt: Record<string, unknown> = {};
    if (date_from) createdAt.gte = new Date(String(date_from));
    if (date_to) createdAt.lte = new Date(String(date_to));
    where.createdAt = createdAt;
  }

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { [sort_by]: sort },
      skip: (page - 1) * per_page,
      take: per_page,
    }),
    prisma.auditLog.count({ where }),
  ]);

  // parse JSON details field
  const parsed = data.map((d) => ({
    ...d,
    details: d.details ? JSON.parse(d.details) : undefined,
  }));

  return {
    data: parsed,
    meta: buildMeta(total, page, per_page, parsed.length),
  };
}

function csvEscape(val: unknown) {
  if (val === null || val === undefined) return "";
  const s = typeof val === "string" ? val : String(val);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function exportLogs(params: TLogsExportSchema) {
  const {
    format = "csv",
    batch_size = 1000,
    sort_by = "createdAt",
    sort = "desc",
  } = params as TLogsExportSchema;

  // reuse fetch filters logic (rebuild where)
  const where: any = {};
  const { search, date_from, date_to } = params as any;

  if (search) {
    where.OR = [
      { actorEmail: { contains: search } },
      { actorId: { contains: search } },
      { action: { contains: search } },
    ];
  }

  if (date_from || date_to) {
    const createdAt: Record<string, unknown> = {};
    if (date_from) createdAt.gte = new Date(String(date_from));
    if (date_to) createdAt.lte = new Date(String(date_to));
    where.createdAt = createdAt;
  }

  // stream in batches using skip/take
  let offset = 0;
  const take = Number(batch_size) || 1000;

  const chunks: string[] = [];

  if (format === "csv") {
    // header
    chunks.push(
      [
        "id",
        "actorId",
        "actorEmail",
        "actorRole",
        "action",
        "details",
        "createdAt",
      ]
        .map(csvEscape)
        .join(","),
    );
  }

  while (true) {
    const rows = await prisma.auditLog.findMany({
      where,
      orderBy: { [sort_by]: sort },
      skip: offset,
      take,
    });

    if (!rows || rows.length === 0) break;

    for (const r of rows) {
      const parsedDetails = r.details ? JSON.parse(r.details) : undefined;
      if (format === "jsonl") {
        const out = {
          id: r.id,
          actorId: r.actorId,
          actorEmail: r.actorEmail,
          actorRole: r.actorRole,
          action: r.action,
          details: parsedDetails,
          createdAt: r.createdAt,
        };
        chunks.push(JSON.stringify(out));
      } else {
        const row = [
          r.id,
          r.actorId,
          r.actorEmail,
          r.actorRole,
          r.action,
          parsedDetails ? JSON.stringify(parsedDetails) : "",
          r.createdAt.toISOString(),
        ].map(csvEscape);
        chunks.push(row.join(","));
      }
    }

    if (rows.length < take) break;
    offset += rows.length;
  }

  const content =
    format === "jsonl" ? chunks.join("\n") + "\n" : chunks.join("\n") + "\n";

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `audit_logs_${timestamp}.${format === "jsonl" ? "json" : "csv"}`;
  const contentType = format === "jsonl" ? "application/x-ndjson" : "text/csv";

  return { content: Buffer.from(content), filename, contentType };
}
