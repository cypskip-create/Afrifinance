/**
 * Every active exchange adapter, keyed by exchange code. This is the single
 * place that knows "which exchanges exist". Ingestion, workers, and the API
 * layer all resolve adapters through this registry — never by importing
 * NseAdapter/MansaAdapter directly.
 *
 * Two modes, controlled by env.ADAPTER_MODE:
 *   - "mock" (default): only "NSE" is registered, backed by the seeded
 *     synthetic client in adapters/nse/. Zero external dependency — the
 *     whole system (ingestion → storage → API → app) works today without
 *     any API key. getAllAdapters()-based workers naturally only process
 *     NSE in this mode; nothing needs updating in mock mode.
 *   - "live": every exchange in ACTIVE_EXCHANGES (config/index.ts) is
 *     registered against MansaAdapter — one generic adapter class that
 *     serves all of them, since Mansa's API is already exchange-generic.
 *     Requires MANSA_API_KEY. Adding another Mansa-covered exchange later
 *     is one line here plus one line in ACTIVE_EXCHANGES — no new adapter.
 */
import type { IExchangeAdapter } from "./types.js";
import { ACTIVE_EXCHANGES, env, type ExchangeCode } from "../config/index.js";
import { NseAdapter } from "./nse/nseAdapter.js";
import { MansaAdapter } from "./mansa/mansaAdapter.js";

function buildRegistry(): Map<ExchangeCode, IExchangeAdapter> {
  if (env.ADAPTER_MODE === "live") {
    return new Map(ACTIVE_EXCHANGES.map((exchange) => [exchange, new MansaAdapter(exchange)]));
  }
  // mock mode: NSE only, on the existing synthetic client.
  return new Map<ExchangeCode, IExchangeAdapter>([["NSE", new NseAdapter()]]);
}

const registry = buildRegistry();

export function getAdapter(exchange: ExchangeCode): IExchangeAdapter {
  const adapter = registry.get(exchange);
  if (!adapter) {
    const hint =
      env.ADAPTER_MODE === "mock"
        ? ` (ADAPTER_MODE=mock only registers NSE — set ADAPTER_MODE=live and MANSA_API_KEY to enable the rest of ACTIVE_EXCHANGES)`
        : "";
    throw new Error(`No adapter registered for exchange "${exchange}"${hint}`);
  }
  return adapter;
}

export function getAllAdapters(): IExchangeAdapter[] {
  return Array.from(registry.values());
}