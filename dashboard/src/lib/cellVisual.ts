import { STALE_THRESHOLD_DAYS } from "./geo";
import { SEVERITY_COLOR, UNMONITORED_COLOR } from "./palette";

export function ageInDays(from: Date, now: Date = new Date()): number {
  return Math.floor((now.getTime() - from.getTime()) / 86_400_000);
}

function freshOpacity(ageDays: number): number {
  const t = Math.min(Math.max(ageDays / STALE_THRESHOLD_DAYS, 0), 1);
  return 0.7 - 0.45 * t;
}

export interface CellVisual {
  fillColor: string;
  fillOpacity: number;
  isStale: boolean;
}

export function cellVisual(
  severity: number,
  latestReportAt: Date,
  now: Date = new Date(),
): CellVisual {
  const age = ageInDays(latestReportAt, now);
  if (age > STALE_THRESHOLD_DAYS) {
    return { fillColor: UNMONITORED_COLOR, fillOpacity: 0.35, isStale: true };
  }
  return {
    fillColor: SEVERITY_COLOR[severity] ?? SEVERITY_COLOR[3],
    fillOpacity: freshOpacity(age),
    isStale: false,
  };
}
