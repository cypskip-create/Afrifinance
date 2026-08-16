import { pool, query } from "../db.js";
import type { Candle, CandleInterval } from "../../types/market.js";

export const candlesRepository = {
  /** Bulk upsert via a single multi-row statement — candle backfills can be
   *  thousands of rows and we don't want thousands of round-trips. */
  async upsertCandlesBatch(candles: Candle[]): Promise<void> {
    if (candles.length === 0) return;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const chunkSize = 500;
      for (let i = 0; i < candles.length; i += chunkSize) {
        const chunk = candles.slice(i, i + chunkSize);
        const values: unknown[] = [];
        const rows = chunk.map((c, idx) => {
          const base = idx * 7;
          values.push(c.securityId, c.interval, c.timestamp, c.open, c.high, c.low, c.close);
          return `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6},$${base + 7},${c.volume})`;
        });
        await client.query(
          `INSERT INTO market.candles (security_id, interval, bar_time, open, high, low, close, volume)
           VALUES ${rows.join(",")}
           ON CONFLICT (security_id, interval, bar_time) DO UPDATE SET
             open = EXCLUDED.open, high = EXCLUDED.high, low = EXCLUDED.low, close = EXCLUDED.close, volume = EXCLUDED.volume`,
          values
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async getCandles(securityId: string, interval: CandleInterval, from: string, to: string): Promise<Candle[]> {
    const res = await query<any>(
      `SELECT security_id as "securityId", interval, bar_time as "timestamp", open, high, low, close, volume
       FROM market.candles
       WHERE security_id = $1 AND interval = $2 AND bar_time BETWEEN $3 AND $4
       ORDER BY bar_time ASC`,
      [securityId, interval, from, to]
    );
    return res.rows;
  },

  /** price-at-date / range helpers used by the research engine for returns
   *  and momentum calculations. */
  async getPriceAt(securityId: string, atOrBefore: string): Promise<number | null> {
    const res = await query<any>(
      `SELECT close FROM market.candles
       WHERE security_id = $1 AND interval = '1d' AND bar_time <= $2
       ORDER BY bar_time DESC LIMIT 1`,
      [securityId, atOrBefore]
    );
    return res.rows[0]?.close ?? null;
  },

  async getHighLow(securityId: string, from: string, to: string): Promise<{ high: number; low: number } | null> {
    const res = await query<any>(
      `SELECT MAX(high) as high, MIN(low) as low FROM market.candles
       WHERE security_id = $1 AND interval = '1d' AND bar_time BETWEEN $2 AND $3`,
      [securityId, from, to]
    );
    const row = res.rows[0];
    if (!row || row.high == null) return null;
    return { high: Number(row.high), low: Number(row.low) };
  },

  async getAverageVolume(securityId: string, from: string, to: string): Promise<number | null> {
    const res = await query<any>(
      `SELECT AVG(volume) as avg_volume FROM market.candles
       WHERE security_id = $1 AND interval = '1d' AND bar_time BETWEEN $2 AND $3`,
      [securityId, from, to]
    );
    const v = res.rows[0]?.avg_volume;
    return v != null ? Number(v) : null;
  },
};