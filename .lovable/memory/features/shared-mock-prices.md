---
name: shared-mock-prices
description: Single source of truth for mock NSE prices used across Home snapshot, Portfolio page, and TradersHub. Always import getPrice/computePortfolioStats from @/lib/stockPrices.
type: feature
---
- `src/lib/stockPrices.ts` exports `MOCK_PRICES`, `getPrice(symbol, fallback?)`, and `computePortfolioStats(portfolio)`.
- Home dashboard portfolio card and `/portfolio` (TrackInvestments) page MUST use these helpers so values match exactly.
- When adding a new tradable symbol, add it to MOCK_PRICES so both pages stay in sync.
- Fallback when symbol unknown: caller-provided value (e.g. avg_cost) or 50.
