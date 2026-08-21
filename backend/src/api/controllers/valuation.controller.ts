import type { Request, Response } from "express";
import { z } from "zod";
import { valuationService } from "../../services/technical/valuationService.js";
import { ApiError } from "../middleware/errorHandler.js";
import { getQuery } from "../middleware/validateQuery.js";
import type { ExchangeQuery } from "../validators/querySchemas.js";

export const valuationController = {
  async get(req: Request, res: Response) {
    const { symbol } = req.params;
    const { exchange } = getQuery<z.infer<typeof ExchangeQuery>>(req);
    const result = await valuationService.compute(exchange, symbol!.toUpperCase());
    if (!result) throw new ApiError(404, `No quote or company data available for ${symbol} on ${exchange}`);
    res.json({ data: result });
  },
};