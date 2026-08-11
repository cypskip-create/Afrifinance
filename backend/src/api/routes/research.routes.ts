import { Router } from "express";
import { researchController } from "../controllers/research.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const researchRoutes = Router();
researchRoutes.get("/research/:symbol", asyncHandler(researchController.getResearch));