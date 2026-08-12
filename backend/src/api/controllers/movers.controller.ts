import type { Request, Response } from "express";
import { z } from "zod";
import { moversService } from "../../services/marketData/moversService.js";
import { getQuery } from "../middleware/validateQuery.js";
import type { MoversQuerySchema } from "../validators/querySchemas.js";

export const moversController = {
  async getMovers(req: Request, res: Response) {
    const { exchange, limit } = getQuery<z.infer<typeof MoversQuerySchema>>(req);
    const movers = await moversService.getTopMovers(exchange, limit);
    res.json({ data: movers });
  },
};