/**
 * In-process pub/sub bridging ingestion → WebSocket layer. Workers publish
 * normalized events here; websocketServer.ts subscribes and fans them out
 * to connected clients. Single-process today; if this ever needs to scale
 * across multiple API instances, swap the EventEmitter here for a Redis
 * pub/sub channel — nothing outside this file needs to change.
 */
import { EventEmitter } from "node:events";
import type { Quote, CorporateAction } from "../types/market.js";

export type MarketEvent =
  | { type: "quote"; payload: Quote }
  | { type: "corporate_action"; payload: CorporateAction };

class MarketEventBus extends EventEmitter {
  publishQuote(quote: Quote) {
    this.emit("event", { type: "quote", payload: quote } satisfies MarketEvent);
  }
  publishCorporateAction(action: CorporateAction) {
    this.emit("event", { type: "corporate_action", payload: action } satisfies MarketEvent);
  }
  onEvent(handler: (event: MarketEvent) => void) {
    this.on("event", handler);
    return () => this.off("event", handler);
  }
}

export const marketEventBus = new MarketEventBus();
marketEventBus.setMaxListeners(200);