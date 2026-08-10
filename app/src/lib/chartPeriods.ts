/**
 * Period helpers for research charts.
 *
 * Moomoo's fundamentals charts show a short, readable window:
 *   • Annual    → last 3 fiscal years
 *   • Quarterly → last 5 quarters
 * These constants are the single source of truth for every bar chart.
 */
export const ANNUAL_PERIODS = 3;
export const QUARTERLY_PERIODS = 5;

export type ChartPeriod = "annual" | "quarterly";

/** Last N annual rows (default 3). */
export function lastAnnual<T>(rows: T[], n = ANNUAL_PERIODS): T[] {
  return rows.slice(-n);
}

/**
 * Derive the last N quarters from annual rows.
 * Deterministic: each quarter is the annual figure split four ways with a
 * stable seasonal weighting, so the numbers never jump between renders.
 */
const SEASONAL = [0.235, 0.245, 0.255, 0.265];

export function toQuarterly<T extends Record<string, any>>(
  rows: T[],
  numericKeys: string[],
  labelKey: string,
  n = QUARTERLY_PERIODS,
): T[] {
  const out: any[] = [];
  const source = rows.filter(r => !r.forecast);
  const years = source.slice(-Math.ceil((n + 1) / 4) - 1);

  years.forEach((row) => {
    const yearLabel = String(row[labelKey]).replace(/[^0-9]/g, "");
    const short = yearLabel.slice(-2);
    for (let q = 0; q < 4; q++) {
      const next: any = { ...row, [labelKey]: `Q${q + 1} '${short}` };
      numericKeys.forEach((k) => {
        const v = row[k];
        if (typeof v === "number") next[k] = +(v * SEASONAL[q]).toFixed(v > 1000 ? 0 : 2);
      });
      out.push(next);
    }
  });

  return out.slice(-n) as T[];
}
