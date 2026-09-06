/**
 * Every active exchange adapter, keyed by exchange code. This is the single
 * place that knows "which exchanges exist". Ingestion, workers, and the API
 * layer all resolve adapters through this registry — never by importing
 * NseAdapter/MansaAdapter directly.
 *
 * Two independent flags control this, and their both containing the word
 * "live" is a genuine footgun — noting it explicitly rather than letting
 * it stay a silent trap:
 *   - env.ADAPTER_MODE ("mock" | "live"): top-level switch for THIS
 *     registry. "live" = every exchange in ACTIVE_EXCHANGES goes to
 *     MansaAdapter by default.
 *   - env.NSE_CLIENT_MODE ("mock" | "live" | "afx"): an INNER switch,
 *     read by NseAdapter/createNseClient() (nse/nseClient.ts) to choose
 *     ITS OWN transport — the seeded mock, a licensed feed once one
 *     exists, or the afx.kwayisi.org scrape client. It has no effect
 *     unless something actually routes NSE to NseAdapter in the first
 *     place, which is what NSE_ADAPTER_SOURCE below controls.
 *
 * Before this, ADAPTER_MODE=live routed NSE through MansaAdapter
 * unconditionally — same as every other exchange — so NSE_CLIENT_MODE
 * (and therefore AfxClient) was unreachable in live mode. NSE_ADAPTER_SOURCE
 * decouples "where does NSE data come from" from "where does every OTHER
 * exchange's data come from", since NSE is the one exchange this project
 * has a from-scratch alternative for. Defaults to "mansa" so existing
 * deployments' behavior doesn't silently change — set NSE_ADAPTER_SOURCE=
 * nse_client (and NSE_CLIENT_MODE=afx) to actually route NSE through
 * AfxClient in a live deployment.
 */
import type { IExchangeAdapter } from "./types.js";
import { ACTIVE_EXCHANGES, env, type ExchangeCode } from "../config/index.js";
import { NseAdapter } from "./nse/nseAdapter.js";
import { MansaAdapter } from "./mansa/mansaAdapter.js";

function buildRegistry(): Map<ExchangeCode, IExchangeAdapter> {
  if (env.ADAPTER_MODE === "mock") {
    // mock mode: NSE only, on the existing synthetic client.
    return new Map<ExchangeCode, IExchangeAdapter>([["NSE", new NseAdapter()]]);
  }

  const registry = new Map<ExchangeCode, IExchangeAdapter>(
    ACTIVE_EXCHANGES.map((exchange) => [exchange, new MansaAdapter(exchange)]),
  );

  if (env.NSE_ADAPTER_SOURCE === "nse_client") {
    registry.set("NSE", new NseAdapter());
  }

  return registry;
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