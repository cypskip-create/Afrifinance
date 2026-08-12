/**
 * Per-exchange trading hours/days, so workers can stop polling a closed
 * market instead of ticking pointlessly (or, in mock mode, generating
 * unrealistic overnight/weekend "trading"). Uses Node's built-in Intl API
 * for timezone conversion rather than adding a date library dependency.
 *
 * The holiday list is a starting point, not a maintained data feed — NSE's
 * actual holiday calendar shifts (some Kenyan public holidays are declared
 * close to the date). Treat this as good-enough for dev/demo and revisit
 * before this matters for real trading decisions: either update it
 * annually, or move holidays into a `market.exchange_holidays` table fed
 * by the exchange adapter (the same way corporate actions already are).
 */
import type { ExchangeCode } from "./index.js";
import { env } from "./index.js";

export interface TradingCalendar {
  timezone: string;
  tradingWeekdays: Set<string>; // Intl short weekday names: "Mon".."Fri"
  openMinutes: number;          // minutes since midnight, exchange-local time
  closeMinutes: number;
  holidays: Set<string>;        // "YYYY-MM-DD", exchange-local date
}

const CALENDARS: Partial<Record<ExchangeCode, TradingCalendar>> = {
  NSE: {
    timezone: "Africa/Nairobi",
    tradingWeekdays: new Set(["Mon", "Tue", "Wed", "Thu", "Fri"]),
    openMinutes: 9 * 60 + 30,   // 09:30 EAT
    closeMinutes: 15 * 60,      // 15:00 EAT
    holidays: new Set([
      // Kenyan public holidays — representative set, needs annual upkeep.
      "2026-01-01", "2026-04-03", "2026-04-06", "2026-05-01",
      "2026-06-01", "2026-10-20", "2026-12-12", "2026-12-25", "2026-12-26",
    ]),
  },
};

function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", weekday: "short",
  }).formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return {
    dateStr: `${map.year}-${map.month}-${map.day}`,
    minutesSinceMidnight: Number(map.hour) * 60 + Number(map.minute),
    weekday: map.weekday!,
  };
}

export function isTradingDay(exchange: ExchangeCode, at: Date = new Date()): boolean {
  const cal = CALENDARS[exchange];
  if (!cal) return true; // unknown exchange — don't block on a missing calendar
  const { dateStr, weekday } = zonedParts(at, cal.timezone);
  return cal.tradingWeekdays.has(weekday) && !cal.holidays.has(dateStr);
}

export function isMarketOpen(exchange: ExchangeCode, at: Date = new Date()): boolean {
  if (env.IGNORE_TRADING_CALENDAR) return true;
  const cal = CALENDARS[exchange];
  if (!cal) return true;
  if (!isTradingDay(exchange, at)) return false;
  const { minutesSinceMidnight } = zonedParts(at, cal.timezone);
  return minutesSinceMidnight >= cal.openMinutes && minutesSinceMidnight < cal.closeMinutes;
}