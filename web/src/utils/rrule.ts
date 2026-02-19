import { Freq } from "~/models/schedule";

export const DAYS = [
  { label: "Mon", value: "MO" },
  { label: "Tue", value: "TU" },
  { label: "Wed", value: "WE" },
  { label: "Thu", value: "TH" },
  { label: "Fri", value: "FR" },
  { label: "Sat", value: "SA" },
  { label: "Sun", value: "SU" },
];

export function buildRRule(
  freq: Freq,
  selectedDays: string[],
): string | undefined {
  if (freq === "none") return undefined;
  if (freq === "WEEKLY" && selectedDays.length > 0) {
    return `FREQ=WEEKLY;BYDAY=${selectedDays.join(",")}`;
  }
  return `FREQ=${freq}`;
}
