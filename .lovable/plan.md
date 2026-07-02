# Redesign execution plan

Scope: strip cards everywhere except AI thesis + modals, rebuild the Stock page as the primary research surface, turn Home into a daily command center, and make the Markets sub-nav sticky. Everything shares one design language — hairline dividers, generous whitespace, typographic hierarchy, no floating tiles.

## 1. Foundation — canvas, not cards

`src/index.css` + a new `Section` primitive:
- New utility `.canvas-section` — vertical rhythm, hairline top border, small uppercase eyebrow label.
- New utility `.hairline-row` — 1px `border-border/40` bottom, hover row highlight, tabular-nums for numbers.
- `.stat-row` — label left / value right, no background.
- Kill `.soft-card` visual — remap to `border-0 bg-transparent p-0` so existing `<Card className="soft-card">` collapses into flat sections without a rewrite. Any place needing a real card opts back in with a new `.grouped` class.
- Only `<Card>` instances that stay boxed: AI Thesis card, modal/dialog surfaces, order-ticket-style controls.

## 2. Stock page — the heart of the app

Rebuild `src/pages/StockDetail.tsx`:

Header (no card): Company name (display font) · ticker · exchange (muted) · big price · daily delta pill.

Chart (embedded, no card): rewrite `StockPriceChart.tsx` as a full-bleed Robinhood-style line — thin 1.5px path, green/red vs period-open, faint 8% gradient fill, no right-side axis, crosshair on drag with floating pill above finger, timeframe pills (1D/1W/1M/3M/YTD/1Y/ALL) below. Small icon row top-right of chart: candlestick toggle, compare, fullscreen (compare + fullscreen open a sheet; candlestick swaps series).

Sticky sub-nav under chart: **Overview · Research · Financials · News · Community · More**. Sticky at top offset once chart scrolls past.

Sections (all flat, hairline separated):

- **Overview** — key stats table (Mkt Cap, P/E, EPS, Div Yield, 52w range, Volume), AI thesis (the one remaining card), Investment Health Score inline row (radar shrunk), 3 news highlights, upcoming earnings/dividends list.
- **Research** — editorial rows with ✓/⚠ badges and inline mini-visuals; groups: Valuation (fair value, upside, P/E, P/B, EV/EBITDA), Growth (rev/earnings past + forward), Financial Health (cash vs debt, OCF), Dividends (yield, payout, sustainability), Ownership (insider %, institutional %, top holders table), Risk (debt, volatility, regulatory).
- **Financials** — sub-toggle Income · Balance · Cash Flow · Margins · Historical · Quarterly · Annual · Peers. Hairline tables with tabular-nums + small inline line charts.
- **News** — stock-specific feed with AI "why it matters" one-liner per item, hairline rows.
- **Community** — TradersHub posts mentioning `$TICKER`, bull/bear sentiment bar, nested threaded replies with connecting lines (reuses existing `XCommentSheet` thread renderer), $TICKER routable. Full X-style actions.
- **More** — grouped list: Company Profile, Management, Corporate Actions, Documents, Watchlist, Compare, Export, Alerts.

Existing tab components under `src/components/stock/tabs/*` get their outer `<Card>` wrappers stripped and are recomposed into the new section flow.

## 3. Home — daily command center

Rewrite `src/pages/Home.tsx` + refactor `CommandCenterSections.tsx`:

Flat sections, small uppercase eyebrow labels, hairline separators, no tile grid:
1. Greeting + date + NSE market status (inline)
2. Market Snapshot — NSE 20 · NSE 25 · NASI as inline stat row
3. Market Sentiment — slim horizontal bar (no gauge card)
4. Portfolio Summary — big value + delta + tiny inline sparkline; tap → Portfolio (values sourced from `computePortfolioStats` for parity)
5. Watchlist Movers — plain table (symbol · price · %chg)
6. Opportunities — 4 pills: Undervalued · High Growth · Dividends · Financial Health (routes to filtered Markets)
7. Upcoming — earnings + dividends merged as one dated list
8. Economic Events — inline list
9. Trending on TradersHub — 3 rows, title + engagement
10. AI Insight of the Day — the remaining card, editorial framing
11. Continue Research — recently viewed strip
12. Personalized Alerts — last 3 triggered

Retires the widget-tile home (`FearGreedIndex`, `TopMoversLosers`, `TrendingStocks`, `MorningBrief`, `StockHeatmap`, `WatchlistSummary`, `RealtimeWatchlistWidget` boxes) from the Home surface. Files stay for reuse elsewhere.

## 4. Markets — sticky sub-nav

`src/pages/Markets.tsx`:
- Sub-nav strip (Overview · Discover · Calendars · Heatmap · All Stocks) becomes `sticky top-[safe-header-offset] z-30`, hairline bottom border, blurred background.
- Section bodies strip `<Card>` wrappers to hairline sections. Sector strip becomes an inline row.

## 5. Portfolio + TradersHub cleanup

- `TrackInvestments.tsx` — already Robinhood-ish. Remove remaining `<Card>` wrappers around holdings and insight tiles; keep the Add Investment dialog card (it's a modal).
- `TradersHub.tsx` — already flat; audit for any residual card walls and delete.
- Global sweep: search project for `soft-card` / `<Card` outside modals + AI thesis and flatten.

## 6. Verification

- `tsgo` type-check clean.
- Playwright screenshots (light + dark + amoled) of: Home, Markets (scrolled to prove sticky), Stock KCB (each sub-section), Portfolio, TradersHub. Confirm no card walls remain except AI thesis + dialogs.

## Files touched (high-level)

Rewrites: `src/pages/StockDetail.tsx`, `src/pages/Home.tsx`, `src/components/stock/StockPriceChart.tsx`, `src/pages/Markets.tsx` (sub-nav + card strip), `src/index.css` (utilities + `.soft-card` neutralized).

Edits: every `src/components/stock/tabs/*.tsx` (strip outer Card), `CommandCenterSections.tsx` (flatten rows), `TrackInvestments.tsx`, `TradersHub.tsx`, misc home widgets when referenced.

New primitives: `src/components/shared/Section.tsx`, `src/components/shared/HairlineRow.tsx`, `src/components/stock/StockSubNav.tsx`.

Untouched: AI Thesis card visuals, all `Dialog`/`Sheet`/`Drawer` surfaces, auth, backend, hooks.

## Deferred (call out before I ship)

- Real candlestick data — I'll ship the toggle + a synthesized candle series from existing mock prices (looks right, not real OHLC).
- Fullscreen chart — opens a `Sheet` reusing the same primitive, landscape-optimized; no separate lib.
- Compare mode — sheet lets you pick 1-3 tickers, overlays normalized lines on the same chart.

Reply **go** to execute in the order above, or tell me what to cut / re-order.
