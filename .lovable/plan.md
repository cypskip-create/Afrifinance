## Scope

This batch of changes spans 5 areas of the app. I'll address each from the notes (ignoring the crossed-out items about rooms and Discover top-traders replacement).

---

### 1. TradersHub polish
- **Handle (@username) sync**: Show the user's actual handle consistently across compose, post card header, profile header, and comment sheet (currently sometimes lags / falls back).
- **Loading delays**: Add skeleton-first render + memoize feed query so posts appear immediately.
- **The `:` (more) menu**: Replace placeholder kebab menu with real actions — Copy link, Mute user, Block, Report, and (own post) Edit/Delete.
- **Profile page cleanup**: Remove Win Rate, Avg Gain, and Streak stat tiles; keep Posts / Followers / Following / Portfolio P&L.
- **Timestamp format**: 
  - `< 1m` → "now"
  - `< 60m` → "Xm"
  - `< 24h` → "Xh" (e.g. 1h, 2h, 10h, 22h)
  - `< 7d` → "Xd"
  - else → "MMM D" (or "MMM D, YYYY" if not current year)
  - Apply on post cards, comments, notifications.
- **Disclaimer trigger**: Show TradersHub disclaimer ONLY on first-ever visit after signup (persist `tradershub_onboarded` flag on profile). Remove it from every-session gate.
- **Editable banner + profile picture**: Add banner_url + raise avatar overlap (X-style: avatar sits below banner, half-overlapping, with edit pencil). Hook into `EditProfileDialog` with image upload to storage.
- **TradersHub onboarding flow**: First-time TradersHub click → modal wizard (handle → display name → bio → avatar → banner → disclaimer accept) → creates social profile.

### 2. Account page
- Add **Font Size** setting (Small / Default / Large / X-Large) — applied via CSS variable `--app-font-scale` on `<html>`, persisted in localStorage.

### 3. Global font sizing
- Normalize base font to match TradersHub feel (~15px on mobile, 14px previously). Wire `--app-font-scale` so the Account setting scales everything.

### 4. Markets page — add interactive tools
Add a tools strip above the stock list:
- **Stock Screener** (already exists at `/screener` — surface a prominent entry card + inline mini-screener with sector / market cap / P/E / dividend yield filters).
- **Compare Stocks** (existing `/compare` — surface).
- **Sector Heatmap** (new, inline) — clickable tiles colored by % change, size by market cap.
- **Top Gainers / Losers / Most Active** tabs.
- **Market Movers carousel** with sparklines.
- **Economic Calendar** mini widget (reuse existing component).
- **Currency Converter** (reuse existing).
- All interactive (filters, sort, click-through to stock pages).

### 5. Home page ↔ Portfolio sync
- The "Portfolio Snapshot" widget on Home reads from same `usePortfolio` source as `/portfolio` — fix it to use the canonical total value (cost basis + unrealised P&L computed identically), so both pages show the same number.

### 6. Stock chart — TradingView-style line chart
Replace `StockPriceChart` / `EnhancedStockChart` default view with a clean TradingView-style line:
- Thin (1.5px) crisp line, subtle vertical gridlines only, no area fill on default mode.
- Right-side price axis with floating last-price tag (colored pill at current price).
- Horizontal crosshair with date+price labels on both axes when hovering/scrubbing.
- Smooth pan/zoom via wheel + drag.
- Timeframe pills: 1D · 5D · 1M · 3M · 6M · YTD · 1Y · 5Y · ALL.
- "Advanced" toggle reveals candlestick + indicators (existing).
- Built with Recharts + lightweight overlays to mimic TradingView aesthetic.

---

## Technical notes

- **Storage**: Need a `profile-media` Supabase storage bucket (public read) for avatars + banners if not present.
- **DB**: Add `banner_url`, `handle`, `tradershub_onboarded` columns on `profiles` if missing. Migration required.
- **Font scaling**: `html { font-size: calc(15px * var(--app-font-scale, 1)); }` then rem-based throughout.
- **Timestamp**: Centralize in `src/lib/formatTimestamp.ts` and use everywhere.
- **Chart**: New `TradingViewLineChart.tsx` using Recharts `LineChart` with custom `<Tooltip>`, `<ReferenceLine>` for last price, custom axis tick.
- **Markets tools**: New `src/components/markets/MarketTools.tsx` aggregator + `SectorHeatmapInline.tsx`.
- **Portfolio sync**: Audit `usePortfolio` hook, ensure Home's snapshot widget calls the same selector (`totalValue`, `totalPnL`).

---

## Execution order

1. DB migration (profile fields + storage bucket)
2. Timestamp utility + apply across post/comment/notification
3. TradersHub disclaimer gating → first-time only
4. TradersHub onboarding wizard
5. Profile page: remove stats, add editable banner + raised avatar
6. Post `:` menu actions
7. Handle sync fix
8. Account: font-size setting + global CSS scale
9. Portfolio sync fix
10. TradingView-style chart
11. Markets page tools

This is large — I'll work through it in sequence and verify the build after each major section.