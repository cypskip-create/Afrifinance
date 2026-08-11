import { Router } from "express";
import { quotesController } from "../controllers/quotes.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const quotesRoutes = Router();
quotesRoutes.get("/quotes", asyncHandler(quotesController.getBatch));
quotesRoutes.get("/quotes/:symbol", asyncHandler(quotesController.getOne));