import { describe, it, expect } from "vitest";
import { booleanEnv } from "../src/config/env.js";

/**
 * Regression test for a real bug: z.coerce.boolean() does `Boolean(value)`,
 * and `Boolean("false")` is `true` in JS (any non-empty string is truthy).
 * That means a literal `.env` line like `SOME_FLAG=false` would have been
 * silently read as `true` — including, in this codebase, both
 * IGNORE_TRADING_CALENDAR and API_KEY_AUTH_ENABLED before this was fixed.
 */
describe("booleanEnv", () => {
  const schema = booleanEnv(false);

  it("parses the string 'false' as boolean false — NOT true", () => {
    expect(schema.parse("false")).toBe(false);
  });

  it("parses the string 'true' as boolean true", () => {
    expect(schema.parse("true")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(schema.parse("FALSE")).toBe(false);
    expect(schema.parse("True")).toBe(true);
  });

  it("accepts '1'/'0' as well", () => {
    expect(booleanEnv(false).parse("1")).toBe(true);
    expect(booleanEnv(true).parse("0")).toBe(false);
  });

  it("falls back to the given default when unset", () => {
    expect(booleanEnv(true).parse(undefined)).toBe(true);
    expect(booleanEnv(false).parse(undefined)).toBe(false);
  });

  it("treats any other non-empty string as false, not true", () => {
    expect(schema.parse("no")).toBe(false);
    expect(schema.parse("off")).toBe(false);
  });
});