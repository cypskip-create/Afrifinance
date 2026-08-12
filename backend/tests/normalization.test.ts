import { describe, it, expect } from "vitest";
import { normalizePrice } from "../src/normalization/prices/normalizePrice.js";
import { checkBalanceSheetIntegrity, normalizeIncomeStatement } from "../src/normalization/financials/normalizeFinancials.js";
import { normalizeCorporateAction } from "../src/normalization/corporateActions/normalizeCorporateAction.js";
import { canonicalizeSector } from "../src/normalization/companies/normalizeCompany.js";
import type { Quote, CorporateAction } from "../src/types/market.js";

const baseQuote: Quote = {
  securityId: "NSE:TEST", symbol: " test ", exchange: "NSE", lastPrice: 12.851, open: 12.7,
  high: 12.6, low: 12.9, previousClose: 12.70123, change: 999, changePercent: 999, volume: 1000.9,
  currency: "KES", status: "active", timestamp: new Date().toISOString(), source: "live",
};

describe("normalizePrice", () => {
  it("recomputes change/changePercent from lastPrice vs previousClose, ignoring the feed's own delta fields", () => {
    const result = normalizePrice(baseQuote);
    expect(result.change).toBeCloseTo(12.85 - 12.7, 2);
    expect(result.changePercent).toBeCloseTo(((12.85 - 12.7) / 12.7) * 100, 1);
  });

  it("uppercases and trims the symbol", () => {
    expect(normalizePrice(baseQuote).symbol).toBe("TEST");
  });

  it("fixes an inverted high/low by deriving from open/lastPrice", () => {
    const result = normalizePrice(baseQuote); // high(12.6) < low(12.9) in the fixture on purpose
    expect(result.high).toBeGreaterThanOrEqual(result.low);
  });

  it("rounds to 2 decimal places", () => {
    const result = normalizePrice(baseQuote);
    expect(result.lastPrice).toBe(12.85);
  });
});

describe("checkBalanceSheetIntegrity", () => {
  it("passes when assets = liabilities + equity", () => {
    const result = checkBalanceSheetIntegrity({
      periodId: "p1", totalAssets: 100, totalLiabilities: 60, totalEquity: 40,
    });
    expect(result.ok).toBe(true);
    expect(result.deltaPercent).toBe(0);
  });

  it("flags a mismatch beyond 2% tolerance", () => {
    const result = checkBalanceSheetIntegrity({
      periodId: "p1", totalAssets: 100, totalLiabilities: 60, totalEquity: 20, // should be 40
    });
    expect(result.ok).toBe(false);
    expect(result.deltaPercent).toBeGreaterThan(2);
  });

  it("tolerates minor rounding drift under 2%", () => {
    const result = checkBalanceSheetIntegrity({
      periodId: "p1", totalAssets: 100, totalLiabilities: 60, totalEquity: 39, // 1% off
    });
    expect(result.ok).toBe(true);
  });
});

describe("normalizeIncomeStatement", () => {
  it("derives grossProfit from revenue - costOfRevenue when not provided", () => {
    const result = normalizeIncomeStatement({ periodId: "p1", revenue: 100, costOfRevenue: 60, netIncome: 20, eps: 1 });
    expect(result.grossProfit).toBe(40);
  });
});

describe("normalizeCorporateAction", () => {
  it("passes through a valid dividend action", () => {
    const action: CorporateAction = {
      id: "a1", securityId: "NSE:TEST", type: "dividend", announcedAt: "2026-01-01",
      status: "completed", details: { type: "dividend", amountPerShare: 1.5, currency: "KES", dividendType: "final" },
    };
    expect(() => normalizeCorporateAction(action)).not.toThrow();
  });

  it("rejects a negative dividend amount as a mapping bug", () => {
    const action: CorporateAction = {
      id: "a1", securityId: "NSE:TEST", type: "dividend", announcedAt: "2026-01-01",
      status: "completed", details: { type: "dividend", amountPerShare: -1.5, currency: "KES", dividendType: "final" },
    };
    expect(() => normalizeCorporateAction(action)).toThrow();
  });
});

describe("canonicalizeSector", () => {
  it("normalizes casing/whitespace drift to the canonical form", () => {
    expect(canonicalizeSector("  banking ")).toBe("Banking");
    expect(canonicalizeSector("BANKING")).toBe("Banking");
  });

  it("passes through an unrecognized sector unchanged rather than dropping it", () => {
    expect(canonicalizeSector("Some New Sector")).toBe("Some New Sector");
  });
});