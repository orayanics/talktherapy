import { prisma } from "@/lib/client";
import { RRule, rrulestr } from "rrule";
import { addYears, isAfter } from "date-fns";

export async function createSchedule(payload: any) {
  return prisma.$transaction(async (tx) => {
    const rule = await tx.availabilityRule.create({
      data: {
        clinicianId: payload.clinician_id,
        startAt: new Date(payload.start_at),
        endAt: new Date(payload.end_at),
        recurrenceRule: payload.recurrence_rule ?? null,
      },
    });
    await generateSlots(tx, rule);
    return rule;
  });
}

async function generateSlots(tx: any, rule: any) {
  const start = new Date(rule.startAt);
  const end = new Date(rule.endAt);
  const durationMs = end.getTime() - start.getTime();

  const rruleStr = rule.recurrenceRule;
  if (!rruleStr) {
    await createSlot(tx, rule, start, durationMs);
    return;
  }

  try {
    const horizon = addYears(start, 1);
    const parsed = rrulestr(rruleStr, { dtstart: start });
    let count = 0;
    const maxOccurrences = 365;
    for (const occ of parsed.all()) {
      if (count >= maxOccurrences) break;
      if (isAfter(occ, horizon)) break;
      await createSlot(tx, rule, occ, durationMs);
      count++;
    }
    if (count === 0) {
      await createSlot(tx, rule, start, durationMs);
    }
  } catch (err) {
    await createSlot(tx, rule, start, durationMs);
  }
}

async function createSlot(
  tx: any,
  rule: any,
  startAt: Date,
  durationMs: number,
) {
  const endAt = new Date(startAt.getTime() + durationMs);
  await tx.slot.create({
    data: {
      availabilityRuleId: rule.id,
      clinicianId: rule.clinicianId,
      startAt,
      endAt,
      status: "FREE",
    },
  });
}
