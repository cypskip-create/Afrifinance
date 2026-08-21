import type { Request, Response } from "express";
import { z } from "zod";
import { volumeProfileService } from "../../services/technical/volumeProfileService.js";
import { ApiError } from "../middleware/errorHandler.js";
import { getQuery } from "../middleware/validateQuery.js";
import type { HistoricalQuerySchema } from "../validators/querySchemas.js";

export const volumeProfileController = {
  async get(req: Request, res: Response) {
    const { symbol } = req.params;
    const { exchange, from, to } = getQuery<z.infer<typeof HistoricalQuerySchema>>(req);
    const toIso = to ?? new Date().toISOString();
    const fromIso = from ?? new Date(Date.now() - 90 * 86_400_000).toISOString();

    const result = await volumeProfileService.compute(exchange, symbol!.toUpperCase(), fromIso, toIso);
    if (!result) throw new ApiError(404, `No candle data available for ${symbol} on ${exchange} in that range`);
    res.json({ data: result });
  },
};