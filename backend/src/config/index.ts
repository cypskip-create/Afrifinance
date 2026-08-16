export { env } from "./env.js";

/** Which exchanges are active in this deployment. NSE only for now — adding
 *  a new one is: build its adapter, register it here, done. Nothing else
 *  in the system (storage, API, calc engine) needs to know an exchange exists. */
export const ACTIVE_EXCHANGES = ["NSE"] as const;
export type ExchangeCode = typeof ACTIVE_EXCHANGES[number] | "NGX" | "JSE" | "EGX" | "GSE" | "BRVM";