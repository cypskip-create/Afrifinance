import { Router } from "express";
import { screenerController } from "../controllers/screener.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const screenerRoutes = Router();
screenerRoutes.get("/screener", asyncHandler(screenerController.run));