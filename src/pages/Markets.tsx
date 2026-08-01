import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TopBar } from "@/components/shared/TopBar";
import { SparklineChart } from "@/components/shared/SparklineChart";
import { MarketStatusIndicator } from "@/components/shared/MarketStatusIndicator";
import { AllStocksList } from "@/components/markets/AllStocksList";
import { EconomicCalendar } from "@/components/home/EconomicCalendar";
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Search, Clock,
  BarChart3, Globe, Calendar, Star, ChevronRight, Flame, Filter,
  Building2, Zap, Award, DollarSign, Percent, Activity, Bell, Landmark,
  Lightbulb, Volume2, BarChart2
} from "lucide-react";

const tabs = ["Overview", "Discover", "Calendars", "Heatmap", "All Stocks"] as const;
type Tab = typeof tabs[number];

const indices = [
  { name: "NSE 20", value: "1,847.23", change: 1.2, isUp: true, points: "+22.1" },
  { name: "NSE 25", value: "3,542.87", change: 0.8, isUp: true, points: "+28.3" },
  { name: "NASI", value: "112.45", change: -0.3, isUp: false, points: "-0.34" },
  { name: "FTSE Kenya", value: "1,234.56", change: 2.1, isUp: true, points: "+25.9" },
];

const commodities = [
  { name: "Tea (Mombasa)", value: "KES 312/kg", change: 2.1, isUp: true },
  { name: "Coffee (Nairobi)", value: "KES 580/kg", change: 1.4, isUp: true },
  { name: "Maize (90kg)", value: "KES 4,800", change: -0.6, isUp: false },
  { name: "Avocado (export)", value: "KES 95/kg", change: 0.9, isUp: true },
];

const topGainers = [
  { symbol: "EQTY", name: "Equity Group", price: 62.50, change: 13.12, volume: "2.4M", sector: "Banking" },
  { symbol: "KPLC", name: "Kenya Power", price: 1.95, change: 4.2, volume: "15.2M", sector: "Energy" },
  { symbol: "NCBA", name: "NCBA Group", price: 38.75, change: 3.45, volume: "890K", sector: "Banking" },
  { symbol: "SAFCOM", name: "Safaricom PLC", price: 12.85, change: 2.4, volume: "8.1M", sector: "Telecom" },
  { symbol: "COOP", name: "Co-operative Bank", price: 15.40, change: 2.10, volume: "1.5M", sector: "Banking" },
];

const topLosers = [
  { symbol: "TOTL", name: "TotalEnergies", price: 22.10, change: -4.1, volume: "95K", sector: "Energy" },
  { symbol: "BAMB", name: "Bamburi Cement", price: 85.30, change: -2.8, volume: "340K", sector: "Manufacturing" },
  { symbol: "EABL", name: "EABL", price: 142.00, change: -1.8, volume: "520K", sector: "Consumer" },
  { symbol: "BAT", name: "BAT Kenya", price: 320.00, change: -1.5, volume: "45K", sector: "Consumer" },
  { symbol: "BRIT", name: "Britam Holdings", price: 6.85, change: -1.2, volume: "1.8M", sector: "Insurance" },
];

const sectors = [
  { name: "Banking", change: 2.4, isUp: true, stocks: 12, topStock: "EQTY" },
  { name: "Telecom", change: 1.8, isUp: true, stocks: 3, topStock: "SAFCOM" },
  { name: "Energy", change: -1.2, isUp: false, stocks: 5, topStock: "KPLC" },
  { name: "Manufacturing", change: 0.7, isUp: true, stocks: 8, topStock: "BAMB" },
  { name: "Insurance", change: -0.4, isUp: false, stocks: 6, topStock: "BRIT" },
  { name: "Agriculture", change: 1.1, isUp: true, stocks: 7, topStock: "SASN" },
];

const allNseStocks = [
  { symbol: "SAFCOM", name: "Safaricom PLC", price: 12.85, change: 2.4, pe: 14.2, divYield: 5.8, mcap: "1.2T", sector: "Telecom" },
  { symbol: "EQTY", name: "Equity Group", price: 62.50, change: 13.12, pe: 8.5, divYield: 4.2, mcap: "285B", sector: "Banking" },
  { symbol: "KCB", name: "KCB Group", price: 45.30, change: -0.8, pe: 7.8, divYield: 3.9, mcap: "145B", sector: "Banking" },
  { symbol: "SCBK", name: "Standard Chartered", price: 185.00, change: 1.1, pe: 11.2, divYield: 6.2, mcap: "125B", sector: "Banking" },
  { symbol: "COOP", name: "Co-operative Bank", price: 15.20, change: -1.5, pe: 9.1, divYield: 4.8, mcap: "89B", sector: "Banking" },
  { symbol: "EABL", name: "EABL", price: 142.00, change: -1.8, pe: 18.5, divYield: 7.1, mcap: "112B", sector: "Consumer" },
  { symbol: "BAMB", name: "Bamburi Cement", price: 89.75, change: -2.8, pe: 12.3, divYield: 2.5, mcap: "32B", sector: "Manufacturing" },
  { symbol: "ABSA", name: "ABSA Bank Kenya", price: 13.85, change: 1.9, pe: 7.2, divYield: 5.1, mcap: "75B", sector: "Banking" },
  { symbol: "NCBA", name: "NCBA Group", price: 42.50, change: 3.45, pe: 8.9, divYield: 4.5, mcap: "68B", sector: "Banking" },
  { symbol: "BRIT", name: "Britam Holdings", price: 6.85, change: -1.2, pe: 15.6, divYield: 1.2, mcap: "17B", sector: "Insurance" },
  { symbol: "KPLC", name: "Kenya Power", price: 1.95, change: 4.2, pe: 6.5, divYield: 0, mcap: "3.8B", sector: "Energy" },
  { symbol: "JUB", name: "Jubilee Holdings", price: 245.00, change: -0.9, pe: 11.8, divYield: 3.8, mcap: "17B", sector: "Insurance" },
];

const ipos = [
  { name: "TechPay Africa", sector: "Fintech", issuePrice: 20.00, status: "Open", closeDate: "Mar 20, 2026", subscriptionRate: "340%", minShares: 100 },
  { name: "SafeInsure Ltd", sector: "Insurance", issuePrice: 15.50, status: "Upcoming", closeDate: "Apr 5, 2026", subscriptionRate: "-", minShares: 200 },
  { name: "AgroTech Kenya", sector: "Agriculture", issuePrice: 8.00, status: "Upcoming", closeDate: "Apr 15, 2026", subscriptionRate: "-", minShares: 500 },
];

const recentIPOs = [
  { name: "DigitalPay PLC", symbol: "DPAY", listingPrice: 12.00, currentPrice: 18.50, change: 54.2, listDate: "Jan 15, 2026" },
  { name: "GreenEnergy Co", symbol: "GREN", listingPrice: 25.00, currentPrice: 22.30, change: -10.8, listDate: "Feb 8, 2026" },
];

const dividendCalendar = [
  { symbol: "SAFCOM", name: "Safaricom", exDate: "Mar 10, 2026", payDate: "Apr 5, 2026", amount: 0.64, yield: 5.8, type: "Final" },
  { symbol: "EQTY", name: "Equity Group", exDate: "Mar 22, 2026", payDate: "Apr 15, 2026", amount: 4.00, yield: 4.2, type: "Final" },
  { symbol: "SCBK", name: "Std Chartered", exDate: "Apr 1, 2026", payDate: "Apr 28, 2026", amount: 17.00, yield: 6.2, type: "Final" },
  { symbol: "EABL", name: "EABL", exDate: "Apr 10, 2026", payDate: "May 5, 2026", amount: 11.00, yield: 7.1, type: "Interim" },
  { symbol: "KCB", name: "KCB Group", exDate: "Apr 18, 2026", payDate: "May 12, 2026", amount: 2.50, yield: 3.9, type: "Final" },
];

const highDividendStocks = [
  { symbol: "EABL", name: "EABL", yield: 7.1, amount: 11.00, price: 142.00, frequency: "Semi-annual" },
  { symbol: "SCBK", name: "Std Chartered", yield: 6.2, amount: 17.00, price: 185.00, frequency: "Annual" },
  { symbol: "SAFCOM", name: "Safaricom", yield: 5.8, amount: 0.64, price: 12.85, frequency: "Annual" },
  { symbol: "ABSA", name: "ABSA Bank", yield: 5.1, amount: 1.10, price: 13.85, frequency: "Annual" },
  { symbol: "COOP", name: "Co-op Bank", yield: 4.8, amount: 1.00, price: 15.20, frequency: "Annual" },
];

const featuredLists = [
  { title: "Blue Chip NSE", desc: "Largest & most stable", icon: Star, count: 8, color: "bg-primary/10 text-primary" },
  { title: "High Dividend", desc: "Yield > 5%", icon: DollarSign, count: 5, color: "bg-bull/10 text-bull" },
  { title: "Top Movers", desc: "Biggest daily moves", icon: Flame, count: 10, color: "bg-accent/10 text-accent" },
  { title: "Undervalued", desc: "P/B < 1.0", icon: Award, count: 6, color: "bg-chart-3/10 text-chart-3" },
];

const investmentThemes = [
  {
    title: "Digital Banking",
    desc: "Lenders growing non-funded income from mobile channels",
    stocks: ["EQTY", "KCB", "COOP"],
    change: 8.2,
    icon: "🏦",
    why: "Agency & mobile lending now drive >40% of group revenue",
  },
  {
    title: "Mobile Money",
    desc: "M-Pesa ecosystem and payment rails",
    stocks: ["SAFCOM", "NCBA", "ABSA"],
    change: 5.4,
    icon: "💳",
    why: "Transaction volumes compounding at double digits",
  },
  {
    title: "Power & Infrastructure",
    desc: "Grid, generation and construction inputs",
    stocks: ["KPLC", "BAMB"],
    change: -1.8,
    icon: "⚡",
    why: "Tariff review and public works pipeline drive earnings",
  },
  {
    title: "Dividend Income",
    desc: "Consistent payers with covered distributions",
    stocks: ["BAT", "SCBK", "EABL"],
    change: 3.1,
    icon: "💰",
    why: "Yields of 5–11% with multi-year payout track records",
  },
];

const earningsCalendar = [
  { symbol: "EABL", name: "EABL", date: "Mar 8, 2026", time: "2:00 PM EAT", expected: "KES 9.80", impact: "high" as const },
  { symbol: "SAFCOM", name: "Safaricom", date: "Mar 15, 2026", time: "10:00 AM EAT", expected: "KES 1.08", impact: "high" as const },
  { symbol: "KCB", name: "KCB Group", date: "Mar 22, 2026", time: "11:00 AM EAT", expected: "KES 7.20", impact: "medium" as const },
  { symbol: "BAMB", name: "Bamburi", date: "Apr 2, 2026", time: "3:00 PM EAT", expected: "KES 2.30", impact: "low" as const },
];

const volumeLeaders = [
  { symbol: "KPLC", name: "Kenya Power", volume: "15.2M", avgVolume: "8.5M", ratio: 1.79, price: 1.95, change: 4.2 },
  { symbol: "SAFCOM", name: "Safaricom", volume: "8.1M", avgVolume: "6.2M", ratio: 1.31, price: 12.85, change: 2.4 },
  { symbol: "EQTY", name: "Equity Group", volume: "2.4M", avgVolume: "1.8M", ratio: 1.33, price: 62.50, change: 13.12 },
  { symbol: "BRIT", name: "Britam", volume: "1.8M", avgVolume: "950K", ratio: 1.89, price: 6.85, change: -1.2 },
];

const analystRatings = [
  { symbol: "SAFCOM", rating: "Buy", target: 15.50, current: 12.85, upside: 20.6, firm: "Genghis Capital" },
  { symbol: "EQTY", rating: "Strong Buy", target: 75.00, current: 62.50, upside: 20.0, firm: "SBG Securities" },
  { symbol: "KCB", rating: "Hold", target: 48.00, current: 45.20, upside: 6.2, firm: "Dyer & Blair" },
  { symbol: "SCBK", rating: "Sell", target: 155.00, current: 185.00, upside: -16.2, firm: "Standard Investment" },
];

function StockRow({ stock, onTap }: { stock: { symbol: string; name: string; price: number; change: number }; onTap: () => void }) {
  return (
    <div onClick={onTap} className="flex items-center justify-between py-3 px-1 border-b border-border/40 last:border-0 cursor-pointer active:bg-muted/30 active:scale-[0.99] transition-all duration-150">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center text-xs font-bold text-primary shrink-0">
          {stock.symbol.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{stock.symbol}</p>
          <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <SparklineChart isPositive={stock.change >= 0} width={44} height={18} />
        <div className="text-right min-w-[72px]">
          <p className="text-sm font-bold">KES {stock.price.toFixed(2)}</p>
          <p className={`text-xs font-semibold ${stock.change >= 0 ? 'text-bull' : 'text-bear'}`}>
            {stock.change >= 0 ? '+' : ''}{stock.change}%
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Markets() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [nseFilter, setNseFilter] = useState<string>("All");
  const [nseSortBy, setNseSortBy] = useState<string>("mcap");
  const [divSortBy, setDivSortBy] = useState<string>("yield");

  const filteredNseStocks = allNseStocks
    .filter(s => nseFilter === "All" || s.sector === nseFilter)
    .sort((a, b) => {
      if (nseSortBy === "change") return b.change - a.change;
      if (nseSortBy === "pe") return a.pe - b.pe;
      if (nseSortBy === "yield") return b.divYield - a.divYield;
      return parseFloat(b.mcap) - parseFloat(a.mcap);
    });

  const sortedDividendStocks = [...highDividendStocks].sort((a, b) => {
    if (divSortBy === "amount") return b.amount - a.amount;
    return b.yield - a.yield;
  });

  return (
    <div className="page-canvas min-h-screen bg-background pb-24">
      <TopBar title="Markets" subtitle="Discover opportunities" showSearch showNotifications />

      {/* Sticky editorial sub-nav */}
      <div className="sub-nav">
        <div className="flex overflow-x-auto scrollbar-hide px-4 gap-1 py-2">
          {tabs.map(tab => (
            <button
              key={tab}
              data-small-target
              onClick={() => setActiveTab(tab)}
              className={`pill-tab whitespace-nowrap ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5 animate-fade-in">
        {/* ── INTERACTIVE ANALYSIS TOOLS ── shown on every Markets tab */}
        <div>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            Analysis Tools
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            <Card className="soft-card p-3 cursor-pointer active:scale-[0.97] transition-transform" onClick={() => navigate('/screener')}>
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2"><Filter className="h-4 w-4" /></div>
              <p className="text-sm font-bold">Stock Screener</p>
              <p className="text-[10px] text-muted-foreground">Filter by P/E, yield, sector</p>
            </Card>
            <Card className="soft-card p-3 cursor-pointer active:scale-[0.97] transition-transform" onClick={() => navigate('/compare')}>
              <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-2"><BarChart2 className="h-4 w-4" /></div>
              <p className="text-sm font-bold">Compare Stocks</p>
              <p className="text-[10px] text-muted-foreground">Side-by-side metrics</p>
            </Card>
            <Card className="soft-card p-3 cursor-pointer active:scale-[0.97] transition-transform" onClick={() => navigate('/sector-heatmap')}>
              <div className="w-9 h-9 rounded-xl bg-bull/10 text-bull flex items-center justify-center mb-2"><Activity className="h-4 w-4" /></div>
              <p className="text-sm font-bold">Sector Heatmap</p>
              <p className="text-[10px] text-muted-foreground">See what's hot today</p>
            </Card>
            <Card className="soft-card p-3 cursor-pointer active:scale-[0.97] transition-transform" onClick={() => navigate('/watchlist')}>
              <div className="w-9 h-9 rounded-xl bg-chart-3/10 text-chart-3 flex items-center justify-center mb-2"><Star className="h-4 w-4" /></div>
              <p className="text-sm font-bold">My Watchlist</p>
              <p className="text-[10px] text-muted-foreground">Track favourite stocks</p>
            </Card>
          </div>
        </div>

        {activeTab === "Overview" && (
          <>
            {/* Market Status */}
            <div className="flex items-center justify-between">
              <MarketStatusIndicator />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Live</span>
                <span className="w-1.5 h-1.5 rounded-full bg-bull animate-pulse" />
              </div>
            </div>

            {/* NSE Indices */}
            <div>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Landmark className="h-4 w-4 text-primary" />
                NSE Indices
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {indices.map(idx => (
                  <Card key={idx.name} className="soft-card p-3 active:scale-[0.98] transition-transform cursor-pointer" onClick={() => navigate('/markets')}>
                    <p className="text-xs font-medium text-muted-foreground">{idx.name}</p>
                    <p className="text-lg font-bold mt-0.5">{idx.value}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-xs font-semibold flex items-center gap-0.5 ${idx.isUp ? 'text-bull' : 'text-bear'}`}>
                        {idx.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {idx.points}
                      </span>
                      <span className={`text-xs ${idx.isUp ? 'text-bull' : 'text-bear'}`}>
                        ({idx.isUp ? '+' : ''}{idx.change}%)
                      </span>
                    </div>
                    <div className="mt-2">
                      <SparklineChart isPositive={idx.isUp} width={120} height={28} />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Investment Themes */}
            <div>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-accent" />
                Investment Themes
              </h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
                {investmentThemes.map(theme => (
                  <div key={theme.title} className="min-w-[210px] flex-shrink-0 border-l border-border/60 pl-3 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{theme.icon}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${theme.change >= 0 ? 'bg-bull/10 text-bull' : 'bg-bear/10 text-bear'}`}>
                        {theme.change >= 0 ? '+' : ''}{theme.change}%
                      </span>
                    </div>
                    <p className="text-sm font-bold">{theme.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{theme.desc}</p>
                    <div className="flex gap-1 mt-2">
                      {theme.stocks.map(s => (
                        <Badge key={s} variant="secondary" className="text-[10px] py-0 px-1.5 border-0">{s}</Badge>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 leading-snug">{theme.why}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Local Commodities */}
            <div>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                Local Commodities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {commodities.map(c => (
                  <Card key={c.name} className="soft-card p-3">
                    <p className="text-xs text-muted-foreground font-medium">{c.name}</p>
                    <p className="text-sm font-bold mt-0.5">{c.value}</p>
                    <p className={`text-xs font-semibold mt-0.5 ${c.isUp ? 'text-bull' : 'text-bear'}`}>
                      {c.isUp ? '+' : ''}{c.change}%
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Featured Lists */}
            <div>
              <h3 className="text-sm font-bold mb-3">Featured Lists</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {featuredLists.map(list => (
                  <Card key={list.title} className="soft-card p-4 cursor-pointer active:scale-[0.97] transition-transform" onClick={() => setActiveTab("All Stocks")}>
                    <div className={`w-10 h-10 rounded-2xl ${list.color} flex items-center justify-center mb-3`}>
                      <list.icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold">{list.title}</p>
                    <p className="text-xs text-muted-foreground">{list.desc}</p>
                    <p className="text-xs text-muted-foreground mt-1">{list.count} stocks</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Earnings Calendar */}
            <div>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Upcoming Earnings
              </h3>
              <Card className="soft-card overflow-hidden">
                {earningsCalendar.map(e => (
                  <div key={e.symbol} onClick={() => navigate(`/stock/${e.symbol}`)} className="flex items-center justify-between py-3 px-4 border-b border-border/40 last:border-0 cursor-pointer active:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${e.impact === 'high' ? 'bg-bear' : e.impact === 'medium' ? 'bg-accent' : 'bg-muted-foreground'}`} />
                      <div>
                        <p className="text-sm font-semibold">{e.symbol} · {e.name}</p>
                        <p className="text-xs text-muted-foreground">{e.date} · {e.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Est. EPS</p>
                      <p className="text-sm font-bold">{e.expected}</p>
                    </div>
                  </div>
                ))}
              </Card>
            </div>

            {/* Volume Leaders */}
            <div>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-accent" />
                Volume Leaders
              </h3>
              <Card className="soft-card overflow-hidden">
                {volumeLeaders.map(v => (
                  <div key={v.symbol} onClick={() => navigate(`/stock/${v.symbol}`)} className="flex items-center justify-between py-3 px-4 border-b border-border/40 last:border-0 cursor-pointer active:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                        {v.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{v.symbol}</p>
                        <p className="text-xs text-muted-foreground">Vol: {v.volume}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{v.ratio.toFixed(1)}x</p>
                      <p className={`text-xs font-semibold ${v.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                        {v.change >= 0 ? '+' : ''}{v.change}%
                      </p>
                    </div>
                  </div>
                ))}
              </Card>
            </div>

            {/* Economic Calendar */}
            <EconomicCalendar />

            {/* Top Gainers & Losers */}
            <div>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-bull" />
                Top Gainers
              </h3>
              <Card className="soft-card overflow-hidden">
                <div className="divide-y divide-border/40">
                  {topGainers.slice(0, 5).map(s => (
                    <StockRow key={s.symbol} stock={s} onTap={() => navigate(`/stock/${s.symbol}`)} />
                  ))}
                </div>
              </Card>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-bear" />
                Top Losers
              </h3>
              <Card className="soft-card overflow-hidden">
                <div className="divide-y divide-border/40">
                  {topLosers.slice(0, 5).map(s => (
                    <StockRow key={s.symbol} stock={s} onTap={() => navigate(`/stock/${s.symbol}`)} />
                  ))}
                </div>
              </Card>
            </div>

            {/* Analyst Ratings */}
            <div>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-accent" />
                Analyst Ratings
              </h3>
              <Card className="soft-card overflow-hidden">
                {analystRatings.map(r => (
                  <div key={r.symbol} onClick={() => navigate(`/stock/${r.symbol}`)} className="flex items-center justify-between py-3 px-4 border-b border-border/40 last:border-0 cursor-pointer active:bg-muted/30">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{r.symbol}</span>
                        <Badge className={`text-[10px] py-0 px-1.5 ${
                          r.rating.includes('Buy') ? 'bg-bull/10 text-bull border-bull/20' :
                          r.rating === 'Hold' ? 'bg-accent/10 text-accent border-accent/20' :
                          'bg-bear/10 text-bear border-bear/20'
                        }`}>{r.rating}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.firm}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">KES {r.target.toFixed(2)}</p>
                      <p className={`text-xs font-semibold ${r.upside >= 0 ? 'text-bull' : 'text-bear'}`}>
                        {r.upside >= 0 ? '+' : ''}{r.upside}% upside
                      </p>
                    </div>
                  </div>
                ))}
              </Card>
            </div>

            {/* Sector Heat Map */}
            <div>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Sector Performance
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {sectors.map(s => (
                  <Card key={s.name} className="soft-card p-3 cursor-pointer active:scale-[0.97] transition-transform" onClick={() => { setNseFilter(s.name === "Telecom" ? "Telecom" : s.name); setActiveTab("All Stocks"); }}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{s.name}</p>
                      <p className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.isUp ? 'bg-bull/10 text-bull' : 'bg-bear/10 text-bear'}`}>
                        {s.isUp ? '+' : ''}{s.change}%
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{s.stocks} stocks · Top: {s.topStock}</p>
                  </Card>
                ))}
              </div>
            </div>

          </>
        )}

        {/* ─── NSE TAB ─── */}
        {activeTab === "All Stocks" && (
          <>
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {["All", "Banking", "Telecom", "Energy", "Consumer", "Manufacturing", "Insurance"].map(f => (
                <Badge
                  key={f}
                  variant={nseFilter === f ? "default" : "secondary"}
                  className={`cursor-pointer whitespace-nowrap text-xs py-1.5 px-3 rounded-full transition-all ${
                    nseFilter === f ? 'bg-primary text-primary-foreground' : ''
                  }`}
                  onClick={() => setNseFilter(f)}
                >
                  {f}
                </Badge>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex gap-2">
              {[
                { key: "mcap", label: "Market Cap" },
                { key: "change", label: "% Change" },
                { key: "pe", label: "P/E Ratio" },
                { key: "yield", label: "Div Yield" },
              ].map(s => (
                <Button
                  key={s.key}
                  variant={nseSortBy === s.key ? "default" : "outline"}
                  size="sm"
                  className={`text-xs rounded-full h-8 transition-all ${nseSortBy === s.key ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => setNseSortBy(s.key)}
                >
                  {s.label}
                </Button>
              ))}
            </div>

            {/* Stock List */}
            <Card className="soft-card overflow-hidden">
              <div className="flex items-center justify-between py-2 px-4 border-b border-border/60 bg-muted/30">
                <span className="text-xs font-semibold text-muted-foreground">Stock</span>
                <div className="flex items-center gap-6">
                  <span className="text-xs font-semibold text-muted-foreground w-12 text-right">P/E</span>
                  <span className="text-xs font-semibold text-muted-foreground w-12 text-right">Yield</span>
                  <span className="text-xs font-semibold text-muted-foreground w-20 text-right">Price</span>
                </div>
              </div>
              <div className="divide-y divide-border/30">
                {filteredNseStocks.map(stock => (
                  <div key={stock.symbol} onClick={() => navigate(`/stock/${stock.symbol}`)} className="flex items-center justify-between py-3 px-4 cursor-pointer active:bg-muted/30 active:scale-[0.99] transition-all duration-150">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {stock.symbol.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{stock.symbol}</p>
                        <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-xs text-muted-foreground w-12 text-right">{stock.pe}</span>
                      <span className="text-xs text-muted-foreground w-12 text-right">{stock.divYield}%</span>
                      <div className="text-right w-20">
                        <p className="text-sm font-bold">{stock.price.toFixed(2)}</p>
                        <p className={`text-xs font-semibold ${stock.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Sector Heat Map */}
            <div>
              <h3 className="text-sm font-bold mb-3">Sector Heat Map</h3>
              <div className="grid grid-cols-3 gap-2">
                {sectors.map(s => (
                  <div
                    key={s.name}
                    onClick={() => setNseFilter(s.name)}
                    className={`rounded-2xl p-3 cursor-pointer text-center transition-all active:scale-95 ${
                      s.isUp ? 'bg-bull/10 border border-bull/20' : 'bg-bear/10 border border-bear/20'
                    }`}
                  >
                    <p className="text-xs font-bold">{s.name}</p>
                    <p className={`text-lg font-bold ${s.isUp ? 'text-bull' : 'text-bear'}`}>
                      {s.isUp ? '+' : ''}{s.change}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Global tab removed — focused on Kenyan market */}

        {/* ─── IPOs TAB ─── */}
        {activeTab === "Discover" && (
          <>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Flame className="h-4 w-4 text-accent" />
              Listing Soon
            </h3>
            <div className="space-y-3">
              {ipos.map(ipo => (
                <Card key={ipo.name} className="soft-card overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold">{ipo.name}</p>
                        <p className="text-xs text-muted-foreground">{ipo.sector}</p>
                      </div>
                      <Badge className={`text-xs ${ipo.status === "Open" ? 'bg-bull/10 text-bull border-bull/20' : 'bg-accent/10 text-accent border-accent/20'}`}>
                        {ipo.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Issue Price</p>
                        <p className="text-sm font-bold">KES {ipo.issuePrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Close Date</p>
                        <p className="text-sm font-semibold">{ipo.closeDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Subscription</p>
                        <p className="text-sm font-bold text-bull">{ipo.subscriptionRate}</p>
                      </div>
                    </div>
                    {ipo.status === "Open" && (
                      <Button className="w-full h-10 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform">
                        Subscribe Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <h3 className="text-sm font-bold flex items-center gap-2 mt-2">
              <Activity className="h-4 w-4 text-primary" />
              Recently Listed
            </h3>
            <Card className="soft-card overflow-hidden">
              {recentIPOs.map(ipo => (
                <div key={ipo.symbol} onClick={() => navigate(`/stock/${ipo.symbol}`)} className="flex items-center justify-between py-3 px-4 border-b border-border/40 last:border-0 cursor-pointer active:bg-muted/30">
                  <div>
                    <p className="text-sm font-bold">{ipo.name}</p>
                    <p className="text-xs text-muted-foreground">${ipo.symbol} · Listed {ipo.listDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">KES {ipo.currentPrice.toFixed(2)}</p>
                    <p className={`text-xs font-semibold ${ipo.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                      {ipo.change >= 0 ? '+' : ''}{ipo.change}% from IPO
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          </>
        )}

        {/* ─── DIVIDENDS TAB ─── */}
        {activeTab === "Calendars" && (
          <>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Upcoming Dividends
            </h3>
            <Card className="soft-card overflow-hidden">
              {dividendCalendar.map(d => (
                <div key={d.symbol} onClick={() => navigate(`/stock/${d.symbol}`)} className="flex items-center justify-between py-3 px-4 border-b border-border/40 last:border-0 cursor-pointer active:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-bull/8 flex items-center justify-center text-xs font-bold text-bull">
                      {d.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{d.symbol}</p>
                      <p className="text-xs text-muted-foreground">Ex: {d.exDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-bull">KES {d.amount.toFixed(2)}</p>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">{d.type}</Badge>
                      <span className="text-xs text-muted-foreground">{d.yield}% yield</span>
                    </div>
                  </div>
                </div>
              ))}
            </Card>

            <div className="flex items-center justify-between mt-2">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-bull" />
                High Dividend Stocks
              </h3>
              <div className="flex gap-1.5">
                {["yield", "amount"].map(s => (
                  <Button key={s} variant={divSortBy === s ? "default" : "outline"} size="sm" className={`text-xs rounded-full h-7 ${divSortBy === s ? 'bg-primary text-primary-foreground' : ''}`} onClick={() => setDivSortBy(s)}>
                    {s === "yield" ? "By Yield" : "By Amount"}
                  </Button>
                ))}
              </div>
            </div>
            <Card className="soft-card overflow-hidden">
              {sortedDividendStocks.map((stock, i) => (
                <div key={stock.symbol} onClick={() => navigate(`/stock/${stock.symbol}`)} className="flex items-center justify-between py-3 px-4 border-b border-border/40 last:border-0 cursor-pointer active:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-bold">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground">{stock.frequency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-bull">{stock.yield}%</p>
                    <p className="text-xs text-muted-foreground">KES {stock.amount.toFixed(2)}/share</p>
                  </div>
                </div>
              ))}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
