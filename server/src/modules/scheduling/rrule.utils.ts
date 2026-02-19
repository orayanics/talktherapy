import { RRule, RRuleSet } from "rrule";
import type { ExpandedOccurrence } from "./types";
import { SLOT_EXPANSION_DAYS } from "./types";

/**
 * Expands an RRULE string into concrete DateTime occurrences within
 * the expansion window (up to SLOT_EXPANSION_DAYS from now).
 *
 * For a rule without RRULE (single slot), returns [{ starts_at, ends_at }].
 *
 * @param starts_at  - The DTSTART of the rule (first occurrence start)
 * @param ends_at    - The end time of a single occurrence (duration derived)
 * @param rrule      - RFC5545 RRULE string, e.g. "FREQ=WEEKLY;BYDAY=MO,WE"
 * @param horizonDays - Override the default expansion horizon (max capped at 30)
 */
export function expandRRule(
  starts_at: Date,
  ends_at: Date,
  rrule: string | null,
  horizonDays?: number
): ExpandedOccurrence[] {
  const cappedHorizon = Math.min(horizonDays ?? SLOT_EXPANSION_DAYS, SLOT_EXPANSION_DAYS);
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + cappedHorizon);

  // Duration in milliseconds between start and end of a single occurrence
  const durationMs = ends_at.getTime() - starts_at.getTime();

  if (!rrule) {
    // Single non-recurring slot
    if (starts_at > horizon) return [];
    return [{ starts_at, ends_at }];
  }

  let rule: RRule;
  try {
    rule = RRule.fromString(`DTSTART:${formatDTSTART(starts_at)}\n${rrule}`);
  } catch {
    throw new Error(`Invalid RRULE string: ${rrule}`);
  }

  const occurrences = rule.between(new Date(), horizon, true);

  return occurrences.map((occ) => ({
    starts_at: occ,
    ends_at: new Date(occ.getTime() + durationMs),
  }));
}

/**
 * Checks whether two time ranges overlap (exclusive boundary check)
 */
export function hasOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

function formatDTSTART(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}
