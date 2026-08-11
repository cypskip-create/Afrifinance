import type { Request, Response } from "express";
import { securitiesRepository } from "../../storage/repositories/securitiesRepository.js";
import { cache, CacheKeys } from "../../storage/cache.js";

export const sectorsController = {
  async list(_req: Request, res: Response) {
    const sectors = await cache.getOrSet(CacheKeys.sectors(), 300_000, () => securitiesRepository.listSectors());
    res.json({ data: sectors });
  },
};