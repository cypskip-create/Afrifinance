# AfriFinance — Full Redesign Plan

Scope: a top-to-bottom visual + structural redesign of every primary surface. No new backend features — only UI restructuring, chart rewrites, information architecture, theming, and one small subscription section. Everything you asked for is included; anything I flag as "phase 2" is called out at the end so we agree before I ship.

## 1. Design language (foundation — done first, everything else inherits)

Move from "cards on a dashboard" to a **canvas**. The page is the container.

Tokens rewritten in `src/index.css` + `tailwind.config.ts`:
- Typography: **Söhne / Inter Tight** display + **Inter** body (Google-hosted). Tight tracking on numerals, tabular-nums everywhere prices appear.
- Spacing: 4/8/12/20/32/56 scale. No more `p-4` cards inside `p-4` cards.
- Dividers: 1px `border-border/40` hairlines replace card walls.
- Radii: `--radius: 10px` (down from 16). Cards only when grouping is non-obvious (holdings row, post, alert).
- Color: neutral greys carry the app; green/red only for P&L; single accent for CTAs. No purples, no gradients-on-white.
- Motion: 180ms ease-out for state, 320ms for route/tab. No bouncy springs.

Three themes, each hand-tuned (not inversions):
- **Light** — warm off-white `#FAFAF7`, ink `#0E0F13`, hairlines `#E7E5E0` (Fidelity/Robinhood).
- **Dark** — `#0E1013` bg, `#15181D` surface, `#E6E8EC` text (TradingView/X).
- **AMOLED** — true `#000`, `#0A0A0A` surface, dimmer accents.

Theme picker added to Account → Appearance alongside font size.

## 2. Bottom navigation

5 tabs (Alerts removed): Home · Markets · Portfolio · TradersHub · Profile.
- Profile tab uses the user's avatar, not a generic icon.
- Thin 1px top divider, smaller 10px labels, hairline active indicator, subtle scale-in on tap.
- Alerts bell moves to the top-right of every page's header (global `TopBar`).

## 3. Home — daily command center

Kill the widget-tile grid in `Home.tsx`. New structure, canvas-first, section headers as small uppercase labels with a hairline:

1. Greeting + date + NSE market status inline
2. **Market snapshot** — NSE 20, NSE 25, NASI as inline stat row (no cards)
3. **Market sentiment** — slim Fear & Greed bar (rebuilt, no gauge card)
4. **Portfolio summary** — big value, delta, tiny sparkline; tap → Portfolio
5. **Watchlist movers** — plain table, symbol · price · %chg
6. **Opportunities** — 4 pills: Undervalued · High Growth · Dividends · Financial Health (tap → filtered Markets/Discover)
7. **Upcoming** — earnings + dividends merged into a single dated list
8. **Economic events** — inline list
9. **Trending on TradersHub** — 3 rows, title + engagement
10. **AI insight of the day** — editorial block, no card
11. **Continue research** — recently viewed stocks strip
12. **Personalized alerts** — last 3 triggered alerts

## 4. Markets — discovery center with sticky sub-nav

Sticky sub-nav: **Overview · Discover · Calendars · Heatmap · All Stocks**.

- Overview: indices, breadth, gainers/losers/most active as ranked lists, sector performance strip
- Discover: High Growth · Undervalued · Strong Dividends · Momentum · High Quality · Banking · Telecom · Industrial · Small Caps (each an inline section)
- Calendars: Earnings · Dividends · Economic (segmented control)
- Heatmap: rebuilt as a proper treemap by market cap, colored by %chg
- All Stocks: existing screener refined, hairline table

## 5. Portfolio — Robinhood/Fidelity feel

- Huge value at top, delta below, no card
- **New institutional line chart** (see §7): 1D/1W/1M/3M/YTD/1Y/ALL, green/red by period, crosshair, no right-side price axis (per your instruction)
- Holdings as a hairline table (symbol, shares, value, %chg, tiny sparkline)
- Insights section: Diversification · Risk · Sector · Country · Largest · Best · Worst · Income Forecast · Benchmark · Historical · Allocation · AI Insights — as editorial rows with small inline visuals, not tiles
- Public/Private toggle kept; visible near header

## 6. Stock page — the heart of the app

Header: Company name (display font), ticker · exchange (muted), big price, delta.

**New chart** (see §7). Sticky sub-nav: **Overview · Research · Financials · News · Community · More**.

- Overview: key stats table, AI thesis (editorial), Investment Health Score row, news highlights, upcoming events
- Research: Valuation / Growth / Financial Health / Dividends / Ownership / Risk — each an editorial section with ✓/⚠ indicators and inline mini-visuals, no giant cards
- Financials: Income / Balance / Cash Flow / Margins / Historical / Quarterly / Annual / Peers — hairline tables + small line charts
- News: stock-specific feed with AI "why it matters" summaries
- Community: TradersHub posts mentioning ticker, bull/bear sentiment bar, top discussions, nested threaded replies with connecting lines, $TICKER tags routable
- More: Profile · Management · Corporate Actions · Documents · Watchlist · Compare · Export · Alerts (grouped list)

## 7. Charts — full rewrite

Rewrite `StockPriceChart.tsx` + create `PortfolioValueChart.tsx`:
- **No right-side price axis** (per your instruction) — Robinhood style
- Thin 1.5px line, dynamic green/red vs period-open
- Faint gradient fill (8% opacity)
- Crosshair on touch/hover; floating value + date pill above the finger
- Timeframe pills below chart (1D/1W/1M/3M/YTD/1Y/ALL)
- Candlestick + Compare + Fullscreen accessible from a single small "chart tools" button top-right of chart area (not the current toolbar clutter)
- Same primitive reused everywhere (Home sparkline, Portfolio, Stock, Compare)

## 8. News page

Delete `/news` route and nav entry. Redistribute:
- Company news → Stock page › News tab
- Portfolio news → Portfolio (new inline strip)
- Market news → Home + Markets › Overview
Add AI "why it matters" one-liner to each item.

## 9. TradersHub

Refine, don't rebuild:
- Post cards flattened to hairline separators between posts (X-style)
- Nested replies with left thread lines per depth, collapse/expand (already partially there — polish)
- Like / Repost / Comment / Bookmark / Follow row cleaned up
- $TICKER + #hashtag stay routable
- Compose sheet spacing tightened

## 10. Alerts

- Global bell in TopBar → sheet/drawer
- Categories: Earnings · Dividends · Price · Valuation · Insider · Watchlist · Portfolio · Market news
- `/notifications` route kept as the full-page view

## 11. Account — Subscriptions

Short, single-screen section. Two tiers, based on research of Simply Wall St / Moomoo / Robinhood Gold / Seeking Alpha pricing benchmarked to Kenyan market:

- **Free** — Watchlists, basic charts, TradersHub, delayed prices, 3 AI theses/mo
- **Premium — KES 1,200/mo or KES 12,000/yr** — Unlimited AI theses, Investment Health Score, advanced screener, real-time prices, portfolio insights, no ads, priority alerts

One clean comparison, single CTA. No congestion.

## Files touched (high-level)

Rewrites: `src/index.css`, `tailwind.config.ts`, `ThemeProvider.tsx`, `BottomNavigation.tsx`, `TopBar.tsx`, `MainLayout.tsx`, `Home.tsx`, `Markets.tsx`, `TrackInvestments.tsx`, `StockDetail.tsx`, `StockPriceChart.tsx`, `TradersHub.tsx`, `Account.tsx`, `App.tsx` (route removal).

New: `PortfolioValueChart.tsx`, `AlertsSheet.tsx`, `MarketsSubNav.tsx`, `StockSubNav.tsx`, `SectionHeader.tsx`, `HairlineTable.tsx`, `SubscriptionSection.tsx`, `ThemePicker.tsx`.

Retired: `News.tsx` route, most `home/*` widget cards, Alerts bottom-nav item.

## Order of execution

1. Design tokens + themes + typography (foundation)
2. Bottom nav + TopBar + AlertsSheet
3. Chart primitive rewrite
4. Home
5. Markets + sticky sub-nav + heatmap
6. Portfolio
7. Stock page + sticky sub-nav + tabs
8. TradersHub polish
9. News removal + redistribution
10. Account + Subscriptions
11. QA pass with Playwright screenshots across all 3 themes on mobile viewport

## Deferred to phase 2 (flagging so we agree)

- Real candlestick + compare + fullscreen chart modes — I'll wire the entry points and ship line + basic candlestick; full compare/fullscreen after you approve the new chart primitive.
- Treemap heatmap library choice (custom SVG vs a lib) — I'll build custom SVG for zero deps unless you'd rather I add `visx`.
- Real-time price wiring for Premium tier — UI only this pass; backend gating later.

Reply "go" and I'll execute in the order above. If any of the deferred items should be in-scope now, say which.
