import { Router } from "express";
import { corporateActionsController } from "../controllers/corporateActions.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { ExchangeQuery } from "../validators/querySchemas.js";

export const corporateActionsRoutes = Router();
corporateActionsRoutes.get("/corporate-actions/:symbol", validateQuery(ExchangeQuery), asyncHandler(corporateActionsController.getForSymbol));
corporateActionsRoutes.get("/dividends/:symbol", validateQuery(ExchangeQuery), asyncHandler(corporateActionsController.getDividends));
corporateActionsRoutes.get("/ownership/:symbol", validateQuery(ExchangeQuery), asyncHandler(corporateActionsController.getOwnership));