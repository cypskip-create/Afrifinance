/**
 * Pushes live price + corporate-action events to subscribed clients.
 * Clients subscribe to specific symbols/channels so we only ever send them
 * data they asked for — not the whole exchange's tape on every tick.
 *
 * Client protocol (JSON messages over the WS connection):
 *   → { "action": "subscribe",   "symbols": ["SAFCOM", "EQTY"] }
 *   → { "action": "unsubscribe", "symbols": ["EQTY"] }
 *   ← { "type": "quote", "payload": Quote }
 *   ← { "type": "corporate_action", "payload": CorporateAction }
 */
import { WebSocketServer, WebSocket } from "ws";
import { marketEventBus, type MarketEvent } from "./pubsub.js";
import { logger } from "../monitoring/logger.js";
import { env } from "../config/index.js";

interface ClientState {
  socket: WebSocket;
  symbols: Set<string>;
}

export function startWebSocketServer(): WebSocketServer {
  const wss = new WebSocketServer({ port: env.WS_PORT });
  const clients = new Set<ClientState>();

  wss.on("connection", (socket) => {
    const state: ClientState = { socket, symbols: new Set() };
    clients.add(state);
    logger.info({ clientCount: clients.size }, "WebSocket client connected");

    socket.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.action === "subscribe" && Array.isArray(msg.symbols)) {
          msg.symbols.forEach((s: string) => state.symbols.add(s.toUpperCase()));
        } else if (msg.action === "unsubscribe" && Array.isArray(msg.symbols)) {
          msg.symbols.forEach((s: string) => state.symbols.delete(s.toUpperCase()));
        }
      } catch {
        socket.send(JSON.stringify({ type: "error", message: "Invalid message — expected JSON { action, symbols }" }));
      }
    });

    socket.on("close", () => {
      clients.delete(state);
      logger.info({ clientCount: clients.size }, "WebSocket client disconnected");
    });
  });

  const unsubscribe = marketEventBus.onEvent((event: MarketEvent) => {
    const symbol = event.type === "quote" ? event.payload.symbol : undefined;
    for (const client of clients) {
      if (client.socket.readyState !== WebSocket.OPEN) continue;
      // No symbol filter (e.g. corporate_action broadcasts) → send to everyone
      // subscribed to anything; symbol-scoped events only go to matching subs.
      if (symbol && client.symbols.size > 0 && !client.symbols.has(symbol)) continue;
      client.socket.send(JSON.stringify(event));
    }
  });

  wss.on("close", unsubscribe);
  logger.info({ port: env.WS_PORT }, "WebSocket server listening");
  return wss;
}