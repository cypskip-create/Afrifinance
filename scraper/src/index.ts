import { startServer } from "./api/server.js";
import { logger } from "./monitoring/logger.js";

startServer();

process.on("unhandledRejection", (err) => {
  logger.error({ err }, "Unhandled rejection");
});
process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught exception");
});