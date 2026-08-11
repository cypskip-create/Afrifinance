import { Router } from "express";
import { financialsController } from "../controllers/financials.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const financialsRoutes = Router();
financialsRoutes.get("/financials/:symbol", asyncHandler(financialsController.getLatest));
financialsRoutes.get("/financials/:symbol/history", asyncHandler(financialsController.getHistory));