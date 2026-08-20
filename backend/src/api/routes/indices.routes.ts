import type { Request, Response } from "express";
import { Router } from "express";
import { indexService } from "../../services/marketData/indexService.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { getQuery } from "../middleware/validateQuery.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { ExchangeQuery } from "../validators/querySchemas.js";
import { z } from "zod";

export const indicesController = {
  async list(req: Request, res: Response) {
    const { exchange } = getQuery<z.infer<typeof ExchangeQuery>>(req);
    const indices = await indexService.getIndices(exchange);
    res.json({ data: indices });
  },
};

export const indicesRoutes = Router();
indicesRoutes.get("/indices", validateQuery(ExchangeQuery), asyncHandler(indicesController.list));