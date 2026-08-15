import { useLocation, useParams } from "react-router-dom";
import { Seo } from "./Seo";

type Meta = { title: string; description: string };

const STATIC_META: Record<string, Meta> = {
  "/": {
    title: "Continua — NSE stock tracker & research",
    description:
      "Track Nairobi Securities Exchange stocks, follow your portfolio and read daily Kenyan market insights in one command centre.",
  },
  "/markets": {
    title: "NSE Markets — live Kenyan stock prices",
    description:
      "Browse every Nairobi Securities Exchange listing with sector performance, top movers, screeners and heatmaps in Kenyan shillings.",
  },
  "/track-investments": {
    title: "My Portfolio — track NSE investments",
    description:
      "Follow your NSE holdings with cost basis, daily profit and loss, sector allocation and portfolio performance charts.",
  },
  "/traders-hub": {
    title: "TradersHub — Kenyan investor community",
    description:
      "Discuss NSE tickers with Kenyan investors: share ideas, reply in threads and follow the traders you trust.",
  },
  "/discover": {
    title: "Discover — trending NSE ideas & posts",
    description:
      "See what Kenyan investors are talking about today: trending tickers, hot topics and the latest TradersHub posts.",
  },
  "/notifications": {
    title: "Notifications — alerts & activity",
    description:
      "Review your price alerts, portfolio updates and TradersHub activity, grouped by feature so nothing is missed.",
  },
  "/alerts": {
    title: "Price alerts — NSE stock notifications",
    description:
      "Create and manage price alerts for Nairobi Securities Exchange stocks and see every triggered alert in one place.",
  },
  "/watchlist": {
    title: "Watchlist — follow NSE stocks",
    description:
      "Keep a shortlist of Nairobi Securities Exchange stocks with live prices, day change and quick access to research.",
  },
  "/screener": {
    title: "NSE stock screener — filter by value",
    description:
      "Screen Nairobi Securities Exchange stocks by valuation, dividend yield, growth and financial health metrics.",
  },
  "/compare": {
    title: "Compare NSE stocks side by side",
    description:
      "Compare Kenyan listed companies on valuation, growth, dividends and risk to decide where to invest next.",
  },
  "/sector-heatmap": {
    title: "NSE sector heatmap & performance",
    description:
      "Visualise how Kenyan market sectors are performing today with a colour-coded Nairobi Securities Exchange heatmap.",
  },
  "/learn": {
    title: "Learn investing on the NSE",
    description:
      "Short lessons on how the Nairobi Securities Exchange works, reading company financials and building a portfolio.",
  },
  "/rooms": {
    title: "Investor rooms — live NSE discussions",
    description:
      "Join live and scheduled rooms where Kenyan investors discuss NSE earnings, sectors and market strategy.",
  },
  "/account": {
    title: "Account settings — Continua",
    description:
      "Manage your Continua profile, appearance, text size, portfolio privacy and notification preferences.",
  },
  "/auth": {
    title: "Sign in to Continua",
    description:
      "Sign in or create a free Continua account to track NSE investments and join the Kenyan investor community.",
  },
  "/landing": {
    title: "Continua — invest smarter on the NSE",
    description:
      "Continua brings Nairobi Securities Exchange research, portfolio tracking and an investor community together.",
  },
};

/**
 * Gives every route its own title, description, canonical and social preview.
 * Mounted once inside the app layout; reacts to the current pathname.
 */
export const RouteSeo = () => {
  const { pathname } = useLocation();
  const params = useParams();

  const stockMatch = pathname.match(/^\/stock\/([A-Za-z0-9.\-]+)/);
  if (stockMatch) {
    const symbol = decodeURIComponent(stockMatch[1]).toUpperCase();
    return (
      <Seo
        path={`/stock/${symbol}`}
        title={`${symbol} share price, financials & forecast`}
        description={`Analyse ${symbol} on the Nairobi Securities Exchange: share price chart, valuation, growth, dividends, balance-sheet health and investor discussion.`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FinancialProduct",
          name: `${symbol} — NSE listed share`,
          category: "Equity",
          provider: { "@type": "Organization", name: "Nairobi Securities Exchange" },
        }}
      />
    );
  }

  const sectorMatch = pathname.match(/^\/sector\/([^/]+)/);
  if (sectorMatch) {
    const sector = decodeURIComponent(sectorMatch[1]);
    return (
      <Seo
        path={pathname}
        title={`${sector} sector on the NSE — performance`}
        description={`How the ${sector} sector is performing on the Nairobi Securities Exchange, with constituent companies, returns and valuation context.`}
      />
    );
  }

  if (pathname.startsWith("/profile/")) {
    return (
      <Seo
        path={pathname}
        title="Investor profile — Continua TradersHub"
        description="View this investor's TradersHub posts, followers and (when shared publicly) their NSE portfolio allocation."
      />
    );
  }

  const meta = STATIC_META[pathname];
  if (!meta) {
    return (
      <Seo
        path={pathname}
        title="Continua — Kenyan market research"
        description="Track NSE stocks, manage your portfolio and follow Kenyan market news and investor discussion on Continua."
      />
    );
  }

  return <Seo path={pathname} title={meta.title} description={meta.description} />;
};