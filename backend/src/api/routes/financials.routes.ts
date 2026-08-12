import { Router } from "express";
import { financialsController } from "../controllers/financials.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { FinancialsQuerySchema, FinancialsHistoryQuerySchema } from "../validators/querySchemas.js";

export const financialsRoutes = Router();
financialsRoutes.get("/financials/:symbol", validateQuery(FinancialsQuerySchema), asyncHandler(financialsController.getLatest));
financialsRoutes.get("/financials/:symbol/history", validateQuery(FinancialsHistoryQuerySchema), asyncHandler(financialsController.getHistory));