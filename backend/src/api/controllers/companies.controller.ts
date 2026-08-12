import type { Request, Response } from "express";
import { z } from "zod";
import { securitiesRepository } from "../../storage/repositories/securitiesRepository.js";
import { ApiError } from "../middleware/errorHandler.js";
import { getQuery } from "../middleware/validateQuery.js";
import type { ExchangeQuery } from "../validators/querySchemas.js";

export const companiesController = {
  async getProfile(req: Request, res: Response) {
    const { symbol } = req.params;
    const { exchange } = getQuery<z.infer<typeof ExchangeQuery>>(req);
    const profile = await securitiesRepository.getCompanyProfile(exchange, symbol!.toUpperCase());
    if (!profile) throw new ApiError(404, `No company found for ${symbol} on ${exchange}`);
    res.json({ data: profile });
  },
};