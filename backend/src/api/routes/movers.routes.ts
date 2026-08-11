import { Router } from "express";
import { moversController } from "../controllers/movers.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const moversRoutes = Router();
moversRoutes.get("/movers", asyncHandler(moversController.getMovers));