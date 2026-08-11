import type { Request, Response } from "express";
import { quoteService } from "../../services/marketData/quoteService.js";
import { ApiError } from "../middleware/errorHandler.js";
import type { ExchangeCode } from "../../config/index.js";

export const quotesController = {
  async getOne(req: Request, res: Response) {
    const { symbol } = req.params;
    const exchange = (req.query.exchange as ExchangeCode) || "NSE";
    const quote = await quoteService.getQuote(exchange, symbol!.toUpperCase());
    if (!quote) throw new ApiError(404, `No quote found for ${symbol} on ${exchange}`);
    res.json({ data: quote });
  },

  async getBatch(req: Request, res: Response) {
    const symbolsParam = req.query.symbols as string | undefined;
    if (!symbolsParam) throw new ApiError(400, "symbols query param is required, e.g. ?symbols=SAFCOM,EQTY");
    const exchange = (req.query.exchange as ExchangeCode) || "NSE";
    const symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
    const quotes = await quoteService.getQuotesBatch(exchange, symbols);
    res.json({ data: quotes });
  },
};