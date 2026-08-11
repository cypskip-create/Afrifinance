import { query } from "../db.js";
import type { Security, Company, Sector } from "../../types/market.js";

export const securitiesRepository = {
  async upsertSector(sector: Sector): Promise<void> {
    await query(
      `INSERT INTO market.sectors (id, name) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
      [sector.id, sector.name]
    );
  },

  async upsertCompany(company: Company): Promise<void> {
    await query(
      `INSERT INTO market.companies (id, name, description, sector_id, industry_id, headquarters, ceo, employees, founded, website)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, description = EXCLUDED.description, sector_id = EXCLUDED.sector_id,
         industry_id = EXCLUDED.industry_id, headquarters = EXCLUDED.headquarters, ceo = EXCLUDED.ceo,
         employees = EXCLUDED.employees, founded = EXCLUDED.founded, website = EXCLUDED.website, updated_at = now()`,
      [company.id, company.name, company.description ?? null, company.sectorId ?? null, company.industryId ?? null,
       company.headquarters ?? null, company.ceo ?? null, company.employees ?? null, company.founded ?? null, company.website ?? null]
    );
  },

  async upsertSecurity(security: Security): Promise<void> {
    await query(
      `INSERT INTO market.securities (id, symbol, exchange, company_id, currency, status, isin, listed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET
         symbol = EXCLUDED.symbol, status = EXCLUDED.status, isin = EXCLUDED.isin, updated_at = now()`,
      [security.id, security.symbol, security.exchange, security.companyId, security.currency,
       security.status, security.isin ?? null, security.listedAt ?? null]
    );
  },

  async getBySymbol(exchange: string, symbol: string): Promise<Security | null> {
    const res = await query<any>(
      `SELECT id, symbol, exchange, company_id as "companyId", currency, status, isin, listed_at as "listedAt"
       FROM market.securities WHERE exchange = $1 AND symbol = $2`,
      [exchange, symbol]
    );
    return res.rows[0] ?? null;
  },

  async listByExchange(exchange: string): Promise<Security[]> {
    const res = await query<any>(
      `SELECT id, symbol, exchange, company_id as "companyId", currency, status, isin, listed_at as "listedAt"
       FROM market.securities WHERE exchange = $1 ORDER BY symbol`,
      [exchange]
    );
    return res.rows;
  },

  async getCompanyProfile(exchange: string, symbol: string): Promise<(Security & { company: Company & { sectorName?: string } }) | null> {
    const res = await query<any>(
      `SELECT s.id, s.symbol, s.exchange, s.company_id as "companyId", s.currency, s.status, s.isin, s.listed_at as "listedAt",
              c.name as "companyName", c.description, c.headquarters, c.ceo, c.employees, c.founded, c.website,
              sec.name as "sectorName"
       FROM market.securities s
       JOIN market.companies c ON c.id = s.company_id
       LEFT JOIN market.sectors sec ON sec.id = c.sector_id
       WHERE s.exchange = $1 AND s.symbol = $2`,
      [exchange, symbol]
    );
    const row = res.rows[0];
    if (!row) return null;
    return {
      id: row.id, symbol: row.symbol, exchange: row.exchange, companyId: row.companyId,
      currency: row.currency, status: row.status, isin: row.isin, listedAt: row.listedAt,
      company: {
        id: row.companyId, name: row.companyName, description: row.description, headquarters: row.headquarters,
        ceo: row.ceo, employees: row.employees, founded: row.founded, website: row.website, sectorName: row.sectorName,
      },
    };
  },

  async listSectors(): Promise<{ id: string; name: string }[]> {
    const res = await query<any>(`SELECT id, name FROM market.sectors ORDER BY name`);
    return res.rows;
  },
};