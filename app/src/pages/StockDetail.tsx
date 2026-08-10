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


const stockData: Record<string, {
  name: string; price: number; change: number; changePercent: string; isUp: boolean;
  marketCap: string; pe: string; eps: string; dividend: string; high52: string; low52: string;
  exchange: string; sector: string; volume?: string; beta?: string; avgVolume?: string; open?: string;
}> = {
  SAFCOM: { name: "Safaricom PLC", price: 12.85, change: 0.15, changePercent: "1.18", isUp: true, marketCap: "515.2B", pe: "12.4", eps: "1.04", dividend: "0.62", high52: "14.20", low52: "10.80", exchange: "NSE", sector: "Telecommunications", volume: "8.1M", beta: "0.85", avgVolume: "6.2M" },
  EQTY: { name: "Equity Group Holdings PLC", price: 62.50, change: 7.25, changePercent: "13.12", isUp: true, marketCap: "237.3B", pe: "8.2", eps: "7.62", dividend: "2.50", high52: "68.00", low52: "45.25", exchange: "NSE", sector: "Banking", volume: "2.4M", beta: "1.12", avgVolume: "1.8M" },
  KCB: { name: "KCB Group PLC", price: 45.75, change: 1.25, changePercent: "2.81", isUp: true, marketCap: "147.2B", pe: "6.5", eps: "7.04", dividend: "1.50", high52: "52.00", low52: "38.00", exchange: "NSE", sector: "Banking", volume: "1.2M", beta: "1.05", avgVolume: "980K" },
  COOP: { name: "Co-operative Bank of Kenya", price: 17.25, change: 0.45, changePercent: "2.68", isUp: true, marketCap: "101.5B", pe: "5.8", eps: "2.97", dividend: "1.00", high52: "19.50", low52: "14.00", exchange: "NSE", sector: "Banking", volume: "1.5M", beta: "0.92", avgVolume: "1.1M" },
  SCBK: { name: "Standard Chartered Bank Kenya", price: 185.00, change: 5.70, changePercent: "3.18", isUp: true, marketCap: "145.8B", pe: "10.5", eps: "17.62", dividend: "12.50", high52: "195.00", low52: "165.25", exchange: "NSE", sector: "Banking", volume: "450K", beta: "0.78", avgVolume: "380K" },
  ABSA: { name: "ABSA Bank Kenya PLC", price: 14.80, change: 0.35, changePercent: "2.42", isUp: true, marketCap: "80.5B", pe: "5.2", eps: "2.85", dividend: "1.10", high52: "16.00", low52: "12.50", exchange: "NSE", sector: "Banking", volume: "890K", beta: "0.95", avgVolume: "720K" },
  NCBA: { name: "NCBA Group PLC", price: 52.25, change: -0.75, changePercent: "-1.42", isUp: false, marketCap: "86.2B", pe: "6.8", eps: "7.68", dividend: "3.00", high52: "58.00", low52: "45.00", exchange: "NSE", sector: "Banking", volume: "890K", beta: "0.88", avgVolume: "650K" },
  DTB: { name: "Diamond Trust Bank Kenya", price: 68.50, change: 1.00, changePercent: "1.48", isUp: true, marketCap: "19.2B", pe: "4.8", eps: "14.27", dividend: "4.00", high52: "75.00", low52: "58.00", exchange: "NSE", sector: "Banking", volume: "120K", beta: "0.72", avgVolume: "95K" },
  STANBIC: { name: "Stanbic Holdings PLC", price: 125.00, change: 2.50, changePercent: "2.04", isUp: true, marketCap: "49.5B", pe: "7.2", eps: "17.36", dividend: "8.00", high52: "135.00", low52: "105.00", exchange: "NSE", sector: "Banking", volume: "85K", beta: "0.82", avgVolume: "68K" },
  BRIT: { name: "Britam Holdings PLC", price: 6.80, change: 0.15, changePercent: "2.26", isUp: true, marketCap: "17.2B", pe: "8.5", eps: "0.80", dividend: "0.25", high52: "8.00", low52: "5.50", exchange: "NSE", sector: "Insurance", volume: "1.8M", beta: "1.25", avgVolume: "950K" },
  JUB: { name: "Jubilee Holdings Ltd", price: 245.00, change: -5.00, changePercent: "-2.00", isUp: false, marketCap: "17.7B", pe: "6.2", eps: "39.52", dividend: "9.00", high52: "280.00", low52: "220.00", exchange: "NSE", sector: "Insurance", volume: "45K", beta: "0.68", avgVolume: "38K" },
  EABL: { name: "East African Breweries Ltd", price: 178.50, change: 3.25, changePercent: "1.85", isUp: true, marketCap: "141.3B", pe: "18.5", eps: "9.65", dividend: "6.50", high52: "195.00", low52: "155.00", exchange: "NSE", sector: "Manufacturing & Allied", volume: "520K", beta: "0.75", avgVolume: "420K" },
  BAT: { name: "British American Tobacco Kenya", price: 425.00, change: 5.00, changePercent: "1.19", isUp: true, marketCap: "42.5B", pe: "9.8", eps: "43.37", dividend: "52.00", high52: "480.00", low52: "380.00", exchange: "NSE", sector: "Manufacturing & Allied", volume: "45K", beta: "0.55", avgVolume: "35K" },
  KPLC: { name: "Kenya Power & Lighting Co.", price: 2.85, change: 0.05, changePercent: "1.79", isUp: true, marketCap: "5.5B", pe: "N/A", eps: "-1.25", dividend: "0.00", high52: "3.50", low52: "2.00", exchange: "NSE", sector: "Energy & Petroleum", volume: "15.2M", beta: "1.45", avgVolume: "8.5M" },
  KEGN: { name: "KenGen PLC", price: 4.25, change: 0.10, changePercent: "2.41", isUp: true, marketCap: "28.0B", pe: "5.2", eps: "0.82", dividend: "0.30", high52: "5.00", low52: "3.50", exchange: "NSE", sector: "Energy & Petroleum", volume: "2.1M", beta: "1.15", avgVolume: "1.6M" },
  TOTL: { name: "TotalEnergies Marketing Kenya", price: 28.50, change: 0.50, changePercent: "1.79", isUp: true, marketCap: "5.1B", pe: "12.5", eps: "2.28", dividend: "1.50", high52: "32.00", low52: "24.00", exchange: "NSE", sector: "Energy & Petroleum", volume: "95K", beta: "0.65", avgVolume: "78K" },
  BAMB: { name: "Bamburi Cement PLC", price: 32.75, change: 0.75, changePercent: "2.34", isUp: true, marketCap: "11.9B", pe: "15.2", eps: "2.15", dividend: "0.00", high52: "38.00", low52: "28.00", exchange: "NSE", sector: "Construction & Allied", volume: "340K", beta: "0.92", avgVolume: "280K" },
};

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

  const stock = stockData[symbol as keyof typeof stockData] || {
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

  const [hoverChangePercent, setHoverChangePercent] = useState<number | null>(null);
  const [hoverIsUp, setHoverIsUp] = useState<boolean | null>(null);

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

  // Gain/loss for the whole selected timeframe — first vs. last point of that period's
  // series. This is the same series the chart itself renders, so the header numbers and
  // the chart's red/green always agree, and both update when the timeframe pill changes.
  const periodData = useMemo(() => generateMockData(selectedTimeframe, symbol || "STK"), [selectedTimeframe, symbol]);
  const periodFirstPrice = periodData[0]?.price || stock.price;
  const periodLastPrice = periodData[periodData.length - 1]?.price || stock.price;
  const periodChangePercent = periodFirstPrice ? ((periodLastPrice - periodFirstPrice) / periodFirstPrice) * 100 : 0;
  const periodIsUp = periodLastPrice >= periodFirstPrice;

  // While scrubbing the chart, show change vs. the start of the selected period instead;
  // otherwise show the full period's change. Percent is scaled onto the real quoted price
  // (mock series lives on its own price scale) so the KES amount shown stays consistent
  // with the price displayed elsewhere on the page.
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