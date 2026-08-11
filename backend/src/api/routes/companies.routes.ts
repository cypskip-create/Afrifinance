import { Router } from "express";
import { historicalController } from "../controllers/companies.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const companiesRoutes = Router();
companiesRoutes.get("/companies/:symbol", asyncHandler(historicalController.getCandles));
