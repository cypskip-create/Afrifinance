import { Router } from "express";
import { corporateActionsController } from "../controllers/corporateActions.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const corporateActionsRoutes = Router();
corporateActionsRoutes.get("/corporate-actions/:symbol", asyncHandler(corporateActionsController.getForSymbol));
corporateActionsRoutes.get("/dividends/:symbol", asyncHandler(corporateActionsController.getDividends));
corporateActionsRoutes.get("/ownership/:symbol", asyncHandler(corporateActionsController.getOwnership));