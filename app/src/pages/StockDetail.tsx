import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, TrendingUp, TrendingDown, AlarmClock, GitCompare, MessageSquare, Plus, Pencil, Maximize2, Minimize2, CandlestickChart, LineChart as LineChartIcon, AreaChart as AreaChartIcon, ChevronRight, FileText, Users2, Briefcase, Download, Building2, Eye, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StockPriceChart, generateMockData, type ChartType } from "@/components/stock/StockPriceChart";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { PriceAlertsManager } from "@/components/alerts/PriceAlertsManager";
import { StockAlertDialog } from "@/components/alerts/StockAlertDialog";
import { usePortfolio } from "@/hooks/usePortfolio";
import { MarketStatusIndicator } from "@/components/shared/MarketStatusIndicator";
import { AddInvestmentDialog } from "@/components/portfolio/AddInvestmentDialog";
import { AfriFinanceScoreCard, computeScores } from "@/components/stock/AfriFinanceScore";
import { AIThesisCard } from "@/components/stock/AIThesisCard";
import { getFundamentals } from "@/data/stockFundamentals";
import { STOCK_META, getPrice, getDayChange, DIV_YIELD, getStockFundamentals } from "@/lib/stockPrices";
import { ValuationTab } from "@/components/stock/tabs/ValuationTab";
import { GrowthTab } from "@/components/stock/tabs/GrowthTab";
import { HealthTab } from "@/components/stock/tabs/HealthTab";
import { DividendsTab } from "@/components/stock/tabs/DividendsTab";
import { OwnershipTab } from "@/components/stock/tabs/OwnershipTab";
import { RiskTab } from "@/components/stock/tabs/RiskTab";
import { NewsEventsTab } from "@/components/stock/tabs/NewsEventsTab";
import { CommunityTab } from "@/components/stock/tabs/CommunityTab";
import { PerformanceTab } from "@/components/stock/tabs/PerformanceTab";
import { ScoresTab } from "@/components/stock/tabs/ScoresTab";
import { getMediaItemsForSymbol, MediaItem } from "../data/mediaItems";
import { formatTimestamp } from "@/lib/formatTimestamp";

const companyInfo: Record<string, { description: string; headquarters: string; ceo: string; employees: string; founded: string }> = {
  SAFCOM: { description: "Safaricom PLC is Kenya's largest mobile network operator, best known for M-Pesa mobile money, voice, data and fibre.", headquarters: "Nairobi, Kenya", ceo: "Peter Ndegwa", employees: "6,500+", founded: "1997" },
  EQTY:   { description: "Equity Group Holdings is a leading pan-African financial services group offering banking, insurance and investment products across seven markets.", headquarters: "Nairobi, Kenya", ceo: "James Mwangi", employees: "15,000+", founded: "1984" },
  KCB:    { description: "KCB Group is the largest commercial bank in East Africa by assets, serving retail, corporate and government clients across the region.", headquarters: "Nairobi, Kenya", ceo: "Paul Russo", employees: "10,000+", founded: "1896" },
  EABL:   { description: "East African Breweries produces and distributes beer and spirits including Tusker, Guinness and Bell across East Africa.", headquarters: "Nairobi, Kenya", ceo: "Jane Karuku", employees: "4,000+", founded: "1922" },
};

type SubSection = "overview" | "research" | "news" | "community" | "more";

const SUB_NAV: { id: SubSection; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "research", label: "Research" },
  { id: "news", label: "News" },
  { id: "community", label: "Community" },
  { id: "more", label: "More" },
];

export default function StockDetail() {
  const navigate = useNavigate();
  const { symbol } = useParams();
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [fullscreen, setFullscreen] = useState(false);
  const [showAlertsDialog, setShowAlertsDialog] = useState(false);
  const [stockAlertOpen, setStockAlertOpen] = useState(false);
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [section, setSection] = useState<SubSection>("overview");
  const [researchGroup, setResearchGroup] = useState<"valuation" | "performance" | "growth" | "health" | "dividends" | "scores" | "ownership" | "risk">("valuation");
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { portfolio } = usePortfolio();
  const { toast } = useToast();

  const myHolding = portfolio.find(p => p.symbol.toUpperCase() === (symbol || "").toUpperCase());

  const upperSymbol = (symbol || "").toUpperCase();
  const stockMeta = STOCK_META[upperSymbol];

  const stock = stockMeta ? (() => {
    const price = getPrice(upperSymbol);
    const { abs: change, pct } = getDayChange(upperSymbol);
    const f = getStockFundamentals(upperSymbol);
    const dividend = +(price * ((DIV_YIELD[upperSymbol] ?? 0) / 100)).toFixed(2);
    const eps = f.pe > 0 ? +(price / f.pe).toFixed(2) : 0;
    return {
      name: stockMeta.name, price, change, changePercent: pct.toFixed(2), isUp: change >= 0,
      marketCap: f.marketCap, pe: f.pe.toFixed(1), eps: eps.toFixed(2), dividend: dividend.toFixed(2),
      high52: (price * 1.12).toFixed(2), low52: (price * 0.85).toFixed(2),
      exchange: "NSE", sector: stockMeta.sector, volume: f.volume, beta: f.beta.toFixed(2), avgVolume: f.avgVolume,
    };
  })() : {
    name: symbol || "Unknown Stock", price: 0, change: 0, changePercent: "0.00", isUp: true,
    marketCap: "N/A", pe: "N/A", eps: "N/A", dividend: "N/A", high52: "N/A", low52: "N/A",
    exchange: "NSE", sector: "Unknown", volume: "N/A", beta: "N/A", avgVolume: "N/A"
  };

  const company = companyInfo[symbol as keyof typeof companyInfo] || {
    description: `${stock.name} is listed on the Nairobi Securities Exchange in the ${stock.sector} sector.`,
    headquarters: "Nairobi, Kenya", ceo: "N/A", employees: "N/A", founded: "N/A"
  };

  const handleWatchlistToggle = async () => {
    if (!symbol) return;
    if (isInWatchlist(symbol)) {
      await removeFromWatchlist(symbol);
      toast({ title: "Removed from watchlist" });
    } else {
      await addToWatchlist(symbol, stock.name);
      toast({ title: "Added to watchlist" });
    }
  };

  // Hover state for period change calculations
  const [hoverChangePercent, setHoverChangePercent] = useState<number | null>(null);
  const [hoverIsUp, setHoverIsUp] = useState<boolean | null>(null);

  // Enhanced hover handler that also captures change % relative to period start
  const handleChartHover = useCallback((price: number | null, date: string | null, changePercent?: number | null, isUp?: boolean | null) => {
    setHoverPrice(price);
    setHoverDate(date);
    setHoverChangePercent(changePercent ?? null);
    setHoverIsUp(isUp ?? null);
  }, []);

  const timeframes = ["1D", "1W", "1M", "3M", "YTD", "1Y", "ALL"];
  const timeframeLabels: Record<string, string> = {
    "1D": "Today", "1W": "Past week", "1M": "Past month", "3M": "Past 3 months",
    "YTD": "Year to date", "1Y": "Past year", "ALL": "All time",
  };

  const divYield = stock.pe !== "N/A" ? ((parseFloat(stock.dividend) / stock.price) * 100).toFixed(1) : "0.0";

  // Period data for the selected timeframe (used to compute change vs. start of period)
  const periodData = useMemo(() => generateMockData(selectedTimeframe, symbol || "STK"), [selectedTimeframe, symbol]);
  const periodFirstPrice = periodData[0]?.price || stock.price;
  const periodLastPrice = periodData[periodData.length - 1]?.price || stock.price;
  const periodChangePercent = periodFirstPrice ? ((periodLastPrice - periodFirstPrice) / periodFirstPrice) * 100 : 0;
  const periodIsUp = periodLastPrice >= periodFirstPrice;

  const activeChangePercent = hoverPrice !== null && hoverChangePercent !== null ? hoverChangePercent : periodChangePercent;
  const activeIsUp = hoverPrice !== null && hoverIsUp !== null ? hoverIsUp : periodIsUp;
  const priceChange = stock.price * (activeChangePercent / 100);
  const priceChangePercent = activeChangePercent.toFixed(2);
  const displayIsUp = activeIsUp;
  const displayPrice = stock.price + priceChange;

  const scoreInputs = {
    price: stock.price, pe: stock.pe, eps: stock.eps, dividend: stock.dividend,
    changePercent: stock.changePercent, beta: stock.beta,
    high52: stock.high52, low52: stock.low52, marketCap: stock.marketCap,
  };
  const scores = computeScores(scoreInputs);
  const fundamentals = getFundamentals(symbol || "", stock.price);

  // Fetch news items from the shared media source
  const stockNews = getMediaItemsForSymbol(symbol || "");

  // Opens the full story on the TradersHub Media tab.
  const openNewsItem = (item: MediaItem) => navigate(`/traders-hub?tab=media&article=${item.id}`);

  // Section refs — sticky sub-nav scrolls to them
  const refs = {
    overview: useRef<HTMLDivElement>(null),
    research: useRef<HTMLDivElement>(null),
    news: useRef<HTMLDivElement>(null),
    community: useRef<HTMLDivElement>(null),
    more: useRef<HTMLDivElement>(null),
  };
  const scrollTo = (id: SubSection) => {
    setSection(id);
    refs[id].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const id = (visible[0].target as HTMLElement).dataset.section as SubSection;
          if (id) setSection(id);
        }
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    Object.values(refs).forEach(r => r.current && observer.observe(r.current));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Eyebrow = ({ children }: { children: React.ReactNode }) => (
    <p className="section-eyebrow mb-2">{children}</p>
  );

  return (
    <div className="page-canvas min-h-screen bg-background pb-28">
      {/* Slim sticky header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="tap-scale h-9 w-9 shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight">{symbol}</span>
                <span className="text-[10px] text-muted-foreground">{stock.exchange}</span>
                <MarketStatusIndicator />
              </div>
              <p className="text-[11px] text-muted-foreground truncate">{stock.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Toggle watchlist" onClick={handleWatchlistToggle} className="h-9 w-9 tap-scale">
              <Heart className={`h-4 w-4 ${isInWatchlist(symbol || '') ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Price alerts" className="h-9 w-9 tap-scale" onClick={() => setStockAlertOpen(true)}>
              <AlarmClock className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      {/* HERO — company · price · delta. No card. */}
      <div className="px-4 pt-4 pb-2 animate-fade-in">
        <h1 className="text-[15px] font-medium text-muted-foreground tracking-tight leading-tight">{stock.name}</h1>
        <div className="mt-1 flex items-end justify-between gap-3">
          <span className="text-4xl font-bold tabular tracking-tight">KES {displayPrice.toFixed(2)}</span>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Compare stock"
            onClick={() => navigate(`/compare?stock=${symbol}`)}
            className="h-8 rounded-full px-3 text-[11px] font-semibold text-muted-foreground gap-1.5"
          >
            <GitCompare className="h-3.5 w-3.5" />
            Compare
          </Button>
        </div>
        <div className={`text-sm font-semibold flex items-center gap-1 mt-1 tabular ${displayIsUp ? 'text-bull' : 'text-bear'}`}>
          {displayIsUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span>{priceChange >= 0 ? '+' : ''}KES {Math.abs(priceChange).toFixed(2)} · {priceChange >= 0 ? '+' : ''}{priceChangePercent}%</span>
          <span className="text-muted-foreground font-normal text-xs ml-1">{hoverDate || timeframeLabels[selectedTimeframe] || selectedTimeframe}</span>
        </div>
      </div>

      {/* CHART — embedded, no card wrapper */}
      <div className="relative">
        <div className="h-[280px] px-1">
          <StockPriceChart symbol={symbol} timeframe={selectedTimeframe} chartType={chartType} onHoverPrice={handleChartHover} />
        </div>
        {/* Chart tool row */}
        <div className="absolute top-2 right-3 z-10 flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Change chart type" className="h-7 w-7 rounded-full text-muted-foreground">
                {chartType === "candle" ? <CandlestickChart className="h-3.5 w-3.5" /> : chartType === "line" ? <LineChartIcon className="h-3.5 w-3.5" /> : <AreaChartIcon className="h-3.5 w-3.5" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {([
                { id: "line", label: "Line", icon: LineChartIcon },
                { id: "area", label: "Area", icon: AreaChartIcon },
                { id: "candle", label: "Candlestick", icon: CandlestickChart },
              ] as const).map(o => (
                <DropdownMenuItem key={o.id} onClick={() => setChartType(o.id)} className="text-xs gap-2">
                  <o.icon className="h-3.5 w-3.5" />
                  {o.label}
                  {chartType === o.id && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" aria-label="Fullscreen chart" className="h-7 w-7 rounded-full text-muted-foreground" onClick={() => setFullscreen(true)}>
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Timeframe pills */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
        {timeframes.map(tf => (
          <button
            key={tf}
            data-small-target
            onClick={() => setSelectedTimeframe(tf)}
            className={`px-2 py-1 text-[11px] font-semibold rounded-md tabular transition-colors ${tf === selectedTimeframe ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* FULLSCREEN CHART — Moomoo-style landscape overlay */}
      {fullscreen && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{symbol}</span>
                <span className="text-[10px] text-muted-foreground">{stock.exchange}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold tabular">KES {displayPrice.toFixed(2)}</span>
                <span className={`text-xs font-semibold tabular ${displayIsUp ? 'text-bull' : 'text-bear'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChangePercent}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Change chart type" className="h-9 w-9 rounded-full text-muted-foreground">
                    {chartType === "candle" ? <CandlestickChart className="h-4 w-4" /> : chartType === "line" ? <LineChartIcon className="h-4 w-4" /> : <AreaChartIcon className="h-4 w-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {([
                    { id: "line", label: "Line", icon: LineChartIcon },
                    { id: "area", label: "Area", icon: AreaChartIcon },
                    { id: "candle", label: "Candlestick", icon: CandlestickChart },
                  ] as const).map(o => (
                    <DropdownMenuItem key={o.id} onClick={() => setChartType(o.id)} className="text-xs gap-2">
                      <o.icon className="h-3.5 w-3.5" />{o.label}
                      {chartType === o.id && <span className="ml-auto text-primary">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" aria-label="Exit fullscreen" className="h-9 w-9 rounded-full text-muted-foreground" onClick={() => setFullscreen(false)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0 px-1 py-2">
            <StockPriceChart symbol={symbol} timeframe={selectedTimeframe} chartType={chartType} onHoverPrice={handleChartHover} />
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/60" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}>
            {timeframes.map(tf => (
              <button
                key={tf}
                data-small-target
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2.5 py-1.5 text-[12px] font-semibold rounded-md tabular transition-colors ${tf === selectedTimeframe ? 'bg-foreground text-background' : 'text-muted-foreground'}`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STICKY SUB-NAV */}
      <div className="sticky top-[53px] z-30 bg-background/92 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-hide">
          {SUB_NAV.map(s => (
            <button
              key={s.id}
              data-small-target
              onClick={() => scrollTo(s.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${section === s.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTIONS — canvas-first, hairline separated */}
      <div className="px-4 pt-5 pb-6 space-y-10">
        {/* OVERVIEW */}
        <section ref={refs.overview} data-section="overview" className="space-y-5 scroll-mt-32">
          {myHolding && (
            <div>
              <Eyebrow>Your Position</Eyebrow>
              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <div className="grid grid-cols-3 gap-6 flex-1">
                  <div><p className="text-[10px] text-muted-foreground">Shares</p><p className="text-sm font-semibold tabular">{myHolding.shares}</p></div>
                  <div><p className="text-[10px] text-muted-foreground">Avg cost</p><p className="text-sm font-semibold tabular">KES {myHolding.avg_cost.toFixed(2)}</p></div>
                  <div><p className="text-[10px] text-muted-foreground">P/L</p>
                    <p className={`text-sm font-semibold tabular ${(stock.price - myHolding.avg_cost) >= 0 ? 'text-bull' : 'text-bear'}`}>
                      {(stock.price - myHolding.avg_cost) >= 0 ? '+' : ''}{(((stock.price - myHolding.avg_cost) / myHolding.avg_cost) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <AddInvestmentDialog lockedSymbol={symbol} lockedName={stock.name} lockedSector={stock.sector}
                  trigger={<Button size="sm" variant="ghost" className="h-8 text-xs text-primary"><Pencil className="h-3 w-3 mr-1" /> Edit</Button>} />
              </div>
            </div>
          )}

          <div>
            <Eyebrow>Key Statistics</Eyebrow>
            <div className="border-t border-border/60">
              {[
                ["Market Cap", stock.marketCap],
                ["P/E Ratio", stock.pe],
                ["EPS", `KES ${stock.eps}`],
                ["Dividend Yield", `${divYield}%`],
                ["52W High", `KES ${stock.high52}`],
                ["52W Low", `KES ${stock.low52}`],
                ["Volume", stock.volume || "—"],
                ["Beta", stock.beta || "—"],
              ].map(([k, v]) => (
                <div key={k as string} className="flex items-center justify-between py-2.5 border-b border-border/40">
                  <span className="text-xs text-muted-foreground">{k}</span>
                  <span className="text-xs font-semibold tabular">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <AIThesisCard
            symbol={symbol || ""} name={stock.name} sector={stock.sector}
            price={stock.price} changePercent={stock.changePercent}
            pe={stock.pe} eps={stock.eps} dividend={stock.dividend}
            marketCap={stock.marketCap} scores={scores as any}
          />

          <div>
            <Eyebrow>Investment Health Score</Eyebrow>
            <AfriFinanceScoreCard scores={scores} />
          </div>

          {stockNews.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="section-eyebrow">Recent News</p>
                <button data-small-target onClick={() => scrollTo("news")} className="text-[11px] text-primary font-semibold flex items-center">More <ChevronRight className="h-3 w-3" /></button>
              </div>
              <div className="border-t border-border/60">
                {stockNews.slice(0, 3).map(n => (
                  <button
                    key={n.id}
                    data-small-target
                    onClick={() => openNewsItem(n)}
                    className="w-full flex items-start justify-between py-3 border-b border-border/40 gap-3 text-left active:opacity-70 transition-opacity"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-snug">{n.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{n.source} · {formatTimestamp(n.publishedAt)}</p>
                    </div>
                    {n.sentiment && n.sentiment !== "neutral" && (
                      <Badge variant="outline" className={`text-[9px] shrink-0 ${n.sentiment === 'bullish' ? 'text-bull border-bull/40' : 'text-bear border-bear/40'}`}>
                        {n.sentiment}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* RESEARCH */}
        <section ref={refs.research} data-section="research" className="space-y-4 scroll-mt-32">
          <Eyebrow>Research</Eyebrow>
          {/* Second-level sticky nav — sits directly under the primary sub-nav */}
          <div className="sticky top-[97px] z-20 -mx-4 px-4 py-2 bg-background/92 backdrop-blur-xl border-b border-border/60">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {(["valuation", "performance", "growth", "health", "dividends", "scores", "ownership", "risk"] as const).map(g => (
                <button
                  key={g}
                  data-small-target
                  onClick={() => setResearchGroup(g)}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap capitalize transition-colors ${researchGroup === g ? 'bg-foreground text-background' : 'bg-muted/40 text-muted-foreground'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="research-flow pt-2">
          {researchGroup === "valuation" && <ValuationTab price={stock.price} pe={stock.pe} fundamentals={fundamentals} onSeePerformance={() => setResearchGroup("performance")} />}
          {researchGroup === "performance" && <PerformanceTab symbol={symbol || ""} price={stock.price} fundamentals={fundamentals} />}
          {researchGroup === "growth" && <GrowthTab fundamentals={fundamentals} />}
          {researchGroup === "health" && <HealthTab fundamentals={fundamentals} />}
          {researchGroup === "dividends" && <DividendsTab divYield={divYield} annualDividend={stock.dividend} fundamentals={fundamentals} />}
          {researchGroup === "scores" && <ScoresTab fundamentals={fundamentals} />}
          {researchGroup === "ownership" && <OwnershipTab fundamentals={fundamentals} />}
          {researchGroup === "risk" && <RiskTab fundamentals={fundamentals} />}
          </div>
        </section>

        {/* NEWS */}
        <section ref={refs.news} data-section="news" className="space-y-4 scroll-mt-32">
          <Eyebrow>News about {symbol}</Eyebrow>
          <NewsEventsTab
            symbol={symbol || ""} name={stock.name} sector={stock.sector}
            price={stock.price} changePercent={stock.changePercent}
            pe={stock.pe} eps={stock.eps} dividend={stock.dividend}
            news={stockNews} fundamentals={fundamentals}
            onSelectNews={openNewsItem}
          />
        </section>

        {/* COMMUNITY */}
        <section ref={refs.community} data-section="community" className="space-y-4 scroll-mt-32">
          <Eyebrow>Community</Eyebrow>
          <CommunityTab symbol={symbol || ""} />
        </section>

        {/* MORE */}
        <section ref={refs.more} data-section="more" className="space-y-3 scroll-mt-32">
          <Eyebrow>More</Eyebrow>
          <div className="border-t border-border/60">
            {[
              { icon: Building2, label: "Company Profile", detail: company.description, action: () => {} },
              { icon: Users2, label: "Management", detail: `CEO · ${company.ceo}`, action: () => {} },
              { icon: Briefcase, label: "Corporate Actions", detail: "Dividends, splits, buybacks", action: () => {} },
              { icon: FileText, label: "Documents", detail: "Annual reports & filings", action: () => {} },
              { icon: Heart, label: "Watchlist", detail: isInWatchlist(symbol || "") ? "In your watchlist" : "Add to watchlist", action: handleWatchlistToggle },
              { icon: GitCompare, label: "Compare", detail: "Benchmark against peers", action: () => navigate(`/compare?stock=${symbol}`) },
              { icon: Download, label: "Export", detail: "Download data as CSV", action: () => toast({ title: "Export coming soon" }) },
              { icon: Bell, label: "Alerts", detail: "Price & event alerts", action: () => setShowAlertsDialog(true) },
              { icon: MessageSquare, label: "Discuss on TradersHub", detail: `Start a $${symbol} thread`, action: () => navigate(`/traders-hub?compose=true&ticker=${symbol}`) },
              { icon: Eye, label: "Founded / HQ", detail: `${company.founded} · ${company.headquarters}`, action: () => {} },
            ].map(row => (
              <button
                key={row.label}
                data-small-target
                onClick={row.action}
                className="w-full flex items-center justify-between py-3 border-b border-border/40 text-left hover:bg-muted/30 -mx-4 px-4 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <row.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">{row.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{row.detail}</p>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Fixed Add Investment CTA — compact, pinned to the very bottom edge */}
      <div className="fixed left-6 right-6 z-30" style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1px)" }}>
        <AddInvestmentDialog
          lockedSymbol={symbol} lockedName={stock.name} lockedSector={stock.sector}
          trigger={
            <Button className="w-full h-10 rounded-full bg-foreground text-background font-semibold text-xs shadow-lg hover:shadow-xl">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {myHolding ? `Update ${symbol} holding` : `Add ${symbol} to portfolio`}
            </Button>
          }
        />
      </div>

      {showAlertsDialog && <PriceAlertsManager />}
      <StockAlertDialog open={stockAlertOpen} onOpenChange={setStockAlertOpen} symbol={symbol || ""} currentPrice={stock.price} />
    </div>
  );
}