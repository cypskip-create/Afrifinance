import type { Request, Response } from "express";
import { z } from "zod";
import { securitiesRepository } from "../../storage/repositories/securitiesRepository.js";
import { companyAnnouncementsRepository } from "../../storage/repositories/companyAnnouncementsRepository.js";
import { ApiError } from "../middleware/errorHandler.js";
import { getQuery } from "../middleware/validateQuery.js";
import type { AnnouncementsQuerySchema } from "../validators/querySchemas.js";

export const announcementsController = {
  async getForSymbol(req: Request, res: Response) {
    const { symbol } = req.params;
    const { exchange, limit } = getQuery<z.infer<typeof AnnouncementsQuerySchema>>(req);
    const security = await securitiesRepository.getBySymbol(exchange, symbol!.toUpperCase());
    if (!security) throw new ApiError(404, `Unknown symbol ${symbol}`);
    const announcements = await companyAnnouncementsRepository.listBySecurity(security.id, limit);
    res.json({ data: announcements });
  },
};