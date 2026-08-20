export { env } from "./env.js";

/** Which exchanges are active in this deployment. Every code below is
 *  live through the Mansa adapter (adapters/mansa/) once ADAPTER_MODE=live
 *  and MANSA_API_KEY are set — see backend/src/adapters/registry.ts. This
 *  list matches Mansa Markets' full-coverage tier: Nigeria, Ghana, Kenya,
 *  South Africa, Zambia, Tanzania, and Côte d'Ivoire (BRVM is the shared
 *  regional exchange for the WAEMU countries, Côte d'Ivoire included).
 *  Adding another Mansa-covered exchange later (EGX, CSE, USE, ZSE, SEM,
 *  BSE, ...) is a one-line addition here plus one line in registry.ts —
 *  the adapter itself needs no code change, since Mansa's API is already
 *  generic across exchanges. */
export const ACTIVE_EXCHANGES = ["NSE", "NGX", "GSE", "JSE", "LuSE", "DSE", "BRVM"] as const;
export type ExchangeCode = typeof ACTIVE_EXCHANGES[number] | "EGX" | "CSE" | "USE" | "ZSE" | "SEM" | "BSE" | "NSX";