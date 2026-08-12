import type { Request, Response } from "express";
import { quoteService } from "../../services/marketData/quoteService.js";
import { ApiError } from "../middleware/errorHandler.js";
import { getQuery } from "../middleware/validateQuery.js";
import type { QuotesBatchQuerySchema, ExchangeQuery } from "../validators/querySchemas.js";
import { z } from "zod";

export const quotesController = {
  async getOne(req: Request, res: Response) {
    const { symbol } = req.params;
    const { exchange } = getQuery<z.infer<typeof ExchangeQuery>>(req);
    const quote = await quoteService.getQuote(exchange, symbol!.toUpperCase());
    if (!quote) throw new ApiError(404, `No quote found for ${symbol} on ${exchange}`);
    res.json({ data: quote });
  },

  async getBatch(req: Request, res: Response) {
    const { exchange, symbols: symbolsParam } = getQuery<z.infer<typeof QuotesBatchQuerySchema>>(req);
    const symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
    const quotes = await quoteService.getQuotesBatch(exchange, symbols);
    res.json({ data: quotes });
  },
};