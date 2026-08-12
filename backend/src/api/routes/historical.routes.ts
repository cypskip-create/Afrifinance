import { Router } from "express";
import { historicalController } from "../controllers/historical.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { HistoricalQuerySchema, PerformanceQuerySchema } from "../validators/querySchemas.js";

export const historicalRoutes = Router();
historicalRoutes.get("/historical/:symbol", validateQuery(HistoricalQuerySchema), asyncHandler(historicalController.getCandles));
historicalRoutes.get("/historical/:symbol/performance", validateQuery(PerformanceQuerySchema), asyncHandler(historicalController.getPerformance));