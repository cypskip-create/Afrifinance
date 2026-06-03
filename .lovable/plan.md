
# AfriFinance Restructure — Simply Wall St Inspired

Much of the skeleton is already in place (6-tab nav with Alerts, 9-tab stock page, AfriFinance Score, contextual news, threaded replies). This plan focuses on the gaps: **interactive analysis tools inside every stock tab**, a sharper home command center, and removing the News tab from navigation.

## 1. Bottom Navigation
- Remove `Learn`, `Rooms`, `News` from `/news`, `/learn`, `/rooms` route exposure in `BottomNavigation.tsx` (already done — verify) and keep: Home, Markets, Portfolio, TradersHub, Alerts, Profile.
- Hide the standalone `/news` route from menus everywhere it still appears (TopBar, Discover sidebar, etc.).

## 2. Stock Analysis Page — Interactive Tools
Replace text-only tab content in `src/pages/StockDetail.tsx` with real interactive widgets. Create one component per tab under `src/components/stock/tabs/`:

- **OverviewTab** — price/sector cards + AI thesis (existing) + mini sparkline of 1Y.
- **ValuationTab** — Fair Value vs Price **gauge** (semi-circle SVG), P/E / P/B / EV-EBITDA comparison **bar chart** vs sector avg, discount % pill.
- **GrowthTab** — Revenue + Earnings **bar chart** (5Y history + 3Y forecast) using Recharts, growth-rate vs sector **horizontal bars**.
- **FinancialHealthTab** — Cash vs Debt **stacked bar**, checklist (5 health checks with ✓/✗/⚠ icons), operating cash flow **area chart**.
- **DividendsTab** — Yield gauge, dividend-per-share **line chart** (10Y), payout-ratio progress bar, sustainability checklist.
- **OwnershipTab** — Ownership breakdown **pie chart** (Insider / Institutional / Public / Other), top-shareholders **table**.
- **RiskTab** — Risk radar (reuse Snowflake style) + plain-language risk **list** with severity badges.
- **NewsEventsTab** — recent headlines list, earnings/dividend calendar, AI-summary card (uses existing stock-thesis edge function `mode: news_summary`).
- **CommunityTab** — TradersHub posts filtered by `$SYMBOL` + bullish/bearish sentiment bar.

All widgets are **mobile-first**, use Recharts (already in deps) and existing design tokens. Mock data lives in a single `src/data/stockFundamentals.ts` keyed by symbol so it stays consistent.

## 3. Home Command Center
Extend `CommandCenterSections.tsx` to match the requested order:
1. Greeting + market sentiment + NSE 20 movement + day summary (top hero strip).
2. My Portfolio card (compact value + chart).
3. Watchlist Movers.
4. Undervalued / High-Growth / Dividends (already there).
5. Upcoming Earnings / Dividends (already there).
6. Major Market Events (new compact card).
7. Trending TradersHub Topics (new — pull top hashtags from posts).
8. AI Insight of the Day (already there).

## 4. Contextual News
- Confirm `/news` is not linked anywhere user-facing (remove links from TopBar, Discover, Home if present).
- Stock page already surfaces news inside the News & Events tab (improved in step 2).
- Add a small "Latest on your holdings" news strip on Home and inside `TrackInvestments` (pulls from the same mock news source keyed by user's portfolio symbols).

## 5. Alerts Page Polish
Group `Notifications.tsx` items into Simply Wall St-style sections: Earnings, Dividends, Valuation, Price, Analyst, Portfolio, Watchlist. Keep existing notification backend.

## 6. TradersHub Replies
Already nested with thread lines + collapse via `XCommentSheet.tsx`. No structural change needed; verify $TICKER tags render in replies.

## Technical Notes
- No DB migrations required — all new widgets are presentational using mock fundamentals (clearly marked) so they ship immediately and can be wired to a real data source later.
- Recharts is already installed.
- Files created: `src/data/stockFundamentals.ts` + 9 files under `src/components/stock/tabs/`.
- Files edited: `src/pages/StockDetail.tsx`, `src/components/home/CommandCenterSections.tsx`, `src/pages/Home.tsx`, `src/pages/Notifications.tsx`, `src/components/shared/TopBar.tsx` (remove News links), `src/components/layout/BottomNavigation.tsx` (verify).

## Scope Out (for follow-up)
- Real fundamentals API integration (currently mock).
- Per-stock AI news summaries beyond what stock-thesis already supports.
- Drag-and-drop home widget reordering (already exists via WidgetManager).

Shall I proceed with the full build?
