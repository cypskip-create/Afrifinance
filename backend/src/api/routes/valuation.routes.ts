import { Router } from "express";
import { valuationController } from "../controllers/valuation.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { ExchangeQuery } from "../validators/querySchemas.js";

export const valuationRoutes = Router();
valuationRoutes.get("/valuation/:symbol", validateQuery(ExchangeQuery), asyncHandler(valuationController.get));