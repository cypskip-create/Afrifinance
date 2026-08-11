import { Router } from "express";
import { historicalController } from "../controllers/historical.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const historicalRoutes = Router();
historicalRoutes.get("/historical/:symbol", asyncHandler(historicalController.getCandles));
historicalRoutes.get("/historical/:symbol/performance", asyncHandler(historicalController.getPerformance));