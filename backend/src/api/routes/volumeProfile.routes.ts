import { Router } from "express";
import { volumeProfileController } from "../controllers/volumeProfile.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { HistoricalQuerySchema } from "../validators/querySchemas.js";

export const volumeProfileRoutes = Router();
volumeProfileRoutes.get("/volume-profile/:symbol", validateQuery(HistoricalQuerySchema), asyncHandler(volumeProfileController.get));