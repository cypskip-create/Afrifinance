/**
 * Every active exchange adapter, keyed by exchange code. This is the single
 * place that knows "which exchanges exist". Ingestion, workers, and the API
 * layer all resolve adapters through this registry — never by importing
 * NseAdapter directly. Adding NGX later means:
 *   1. Build backend/src/adapters/future/ngx/{ngxClient,ngxMapper,ngxAdapter}.ts
 *      following the exact same pattern as nse/.
 *   2. Move it out of future/ into adapters/ngx/.
 *   3. Register it below.
 *   4. Add "NGX" to ACTIVE_EXCHANGES in config/index.ts.
 * Nothing in ingestion/, storage/, services/, or api/ needs to change.
 */
import type { IExchangeAdapter } from "./types.js";
import type { ExchangeCode } from "../config/index.js";
import { NseAdapter } from "./nse/nseAdapter.js";

const registry = new Map<ExchangeCode, IExchangeAdapter>([
  ["NSE", new NseAdapter()],
  // ["NGX", new NgxAdapter()],  ← future
  // ["JSE", new JseAdapter()],  ← future
  // ["EGX", new EgxAdapter()],  ← future
  // ["GSE", new GseAdapter()],  ← future
  // ["BRVM", new BrvmAdapter()], ← future
]);

export function getAdapter(exchange: ExchangeCode): IExchangeAdapter {
  const adapter = registry.get(exchange);
  if (!adapter) throw new Error(`No adapter registered for exchange "${exchange}"`);
  return adapter;
}

export function getAllAdapters(): IExchangeAdapter[] {
  return Array.from(registry.values());
}