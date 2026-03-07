import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, TrendingUp, TrendingDown, Newspaper, Activity, Target, Award, FileText, Banknote, UserCheck, Briefcase, Building, Globe, Users, Calendar, Bell, GitCompare, Plus, Share2, MessageSquare, BarChart3, ChevronRight, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StockPriceChart } from "@/components/stock/StockPriceChart";
import { EnhancedStockChart } from "@/components/stock/EnhancedStockChart";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceAlertsManager } from "@/components/alerts/PriceAlertsManager";
import { usePortfolio } from "@/hooks/usePortfolio";
import { AnalystRatings } from "@/components/stock/AnalystRatings";
import { MarketStatusIndicator } from "@/components/shared/MarketStatusIndicator";
import { TradeSheet } from "@/components/portfolio/TradeSheet";

// Stock data map
const stockData: Record<string, {
  name: string; price: number; change: number; changePercent: string; isUp: boolean;
  marketCap: string; pe: string; eps: string; dividend: string; high52: string; low52: string;
  exchange: string; sector: string; volume?: string; beta?: string; avgVolume?: string;
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
  SASN: { name: "Sasini PLC", price: 18.50, change: -0.25, changePercent: "-1.33", isUp: false, marketCap: "4.2B", pe: "8.5", eps: "2.18", dividend: "0.50", high52: "22.00", low52: "16.00", exchange: "NSE", sector: "Agricultural", volume: "180K", beta: "0.72", avgVolume: "140K" },
  KTBL: { name: "Kenya Tea Development Agency", price: 85.00, change: 1.50, changePercent: "1.80", isUp: true, marketCap: "16.8B", pe: "7.2", eps: "11.81", dividend: "4.00", high52: "95.00", low52: "75.00", exchange: "NSE", sector: "Agricultural", volume: "65K", beta: "0.58", avgVolume: "52K" },
  BAMB: { name: "Bamburi Cement PLC", price: 32.75, change: 0.75, changePercent: "2.34", isUp: true, marketCap: "11.9B", pe: "15.2", eps: "2.15", dividend: "0.00", high52: "38.00", low52: "28.00", exchange: "NSE", sector: "Construction & Allied", volume: "340K", beta: "0.92", avgVolume: "280K" },
  CTUM: { name: "Centum Investment Company", price: 12.50, change: 0.20, changePercent: "1.63", isUp: true, marketCap: "8.3B", pe: "4.5", eps: "2.78", dividend: "0.55", high52: "15.00", low52: "10.00", exchange: "NSE", sector: "Investment", volume: "320K", beta: "1.08", avgVolume: "250K" },
  NMG: { name: "Nation Media Group PLC", price: 16.80, change: 0.30, changePercent: "1.82", isUp: true, marketCap: "3.1B", pe: "8.2", eps: "2.05", dividend: "1.00", high52: "20.00", low52: "14.00", exchange: "NSE", sector: "Commercial & Services", volume: "210K", beta: "0.82", avgVolume: "165K" },
  TPS: { name: "TPS Eastern Africa (Serena)", price: 22.50, change: 0.50, changePercent: "2.27", isUp: true, marketCap: "4.1B", pe: "12.5", eps: "1.80", dividend: "0.75", high52: "26.00", low52: "18.00", exchange: "NSE", sector: "Commercial & Services", volume: "95K", beta: "0.68", avgVolume: "72K" },
};

const companyInfo: Record<string, { description: string; sector: string; headquarters: string; ceo: string; employees: string; founded: string }> = {
  SAFCOM: { description: "Safaricom PLC is a leading mobile network operator in Kenya providing mobile telephony, mobile money transfer (M-Pesa), and wireless data services.", sector: "Telecommunications", headquarters: "Nairobi, Kenya", ceo: "Peter Ndegwa", employees: "6,500+", founded: "1997" },
  EQTY: { description: "Equity Group Holdings PLC is a leading financial services group in East and Central Africa.", sector: "Banking & Financial Services", headquarters: "Nairobi, Kenya", ceo: "James Mwangi", employees: "15,000+", founded: "1984" },
  KCB: { description: "KCB Group PLC is the largest commercial bank in Kenya and East Africa by assets.", sector: "Banking & Financial Services", headquarters: "Nairobi, Kenya", ceo: "Paul Russo", employees: "10,000+", founded: "1896" },
  EABL: { description: "East African Breweries Limited is the largest brewer in East Africa.", sector: "Manufacturing & Allied", headquarters: "Nairobi, Kenya", ceo: "Jane Karuku", employees: "4,000+", founded: "1922" },
};

const stockNews = [
  { id: 1, title: "Strong quarterly earnings beat expectations", source: "Business Daily", time: "2h ago", sentiment: "bullish" as const },
  { id: 2, title: "Analyst raises price target amid sector rally", source: "The Standard", time: "4h ago", sentiment: "bullish" as const },
  { id: 3, title: "New regulatory framework may impact margins", source: "Reuters Africa", time: "6h ago", sentiment: "bearish" as const },
  { id: 4, title: "Board announces share buyback program", source: "NSE Filings", time: "1d ago", sentiment: "bullish" as const },
];

const communityPosts = [
  { id: 1, user: "TraderMike", content: "Just loaded up on more shares. The fundamentals are strong 📈", likes: 24, replies: 8, time: "1h ago" },
  { id: 2, user: "NairobiInvestor", content: "Great earnings call today. Management is confident about next quarter.", likes: 18, replies: 5, time: "3h ago" },
  { id: 3, user: "StockPickerKE", content: "Watch the support level at KES 12.50. If it holds, we're going higher.", likes: 31, replies: 12, time: "5h ago" },
];

export default function StockDetail() {
  const navigate = useNavigate();
  const { symbol } = useParams();
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [showAlertsDialog, setShowAlertsDialog] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [advancedChart, setAdvancedChart] = useState(false);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { addToPortfolio } = usePortfolio();
  const { toast } = useToast();

  const stock = stockData[symbol as keyof typeof stockData] || {
    name: symbol || "Unknown Stock", price: 0, change: 0, changePercent: "0.00", isUp: true,
    marketCap: "N/A", pe: "N/A", eps: "N/A", dividend: "N/A", high52: "N/A", low52: "N/A",
    exchange: "NSE", sector: "Unknown", volume: "N/A", beta: "N/A", avgVolume: "N/A"
  };

  const company = companyInfo[symbol as keyof typeof companyInfo] || {
    description: `${stock.name} is a company listed on the Nairobi Securities Exchange in the ${stock.sector} sector.`,
    sector: stock.sector, headquarters: "Nairobi, Kenya", ceo: "N/A", employees: "N/A", founded: "N/A"
  };

  const handleWatchlistToggle = async () => {
    if (!symbol) return;
    if (isInWatchlist(symbol)) {
      const result = await removeFromWatchlist(symbol);
      if (result?.error) toast({ title: "Error", description: "Failed to remove", variant: "destructive" });
      else toast({ title: "Removed from watchlist" });
    } else {
      const result = await addToWatchlist(symbol, stock.name);
      if (result?.error) toast({ title: "Error", description: result.error.message, variant: "destructive" });
      else toast({ title: "Added to watchlist" });
    }
  };

  const timeframes = ["1D", "5D", "1M", "3M", "6M", "1Y", "ALL"];
  const divYield = stock.pe !== "N/A" ? ((parseFloat(stock.dividend) / stock.price) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-[hsl(220,15%,8%)] text-white pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-[hsl(220,15%,8%)]/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="tap-scale h-9 w-9 text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base">{symbol}</span>
                <MarketStatusIndicator />
              </div>
              <p className="text-xs text-white/40 line-clamp-1">{stock.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={handleWatchlistToggle} className="h-9 w-9 rounded-full bg-white/5 tap-scale">
              <Heart className={`h-4 w-4 transition-all ${isInWatchlist(symbol || '') ? 'fill-[hsl(0,70%,55%)] text-[hsl(0,70%,55%)] scale-110' : 'text-white/60'}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-white/5 tap-scale">
              <Share2 className="h-4 w-4 text-white/60" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Hero Price */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="text-[10px] py-0 bg-white/5 text-white/50 border-0">{stock.exchange}</Badge>
            <Badge className="text-[10px] py-0 bg-white/5 text-white/50 border-0">{stock.sector}</Badge>
          </div>
          <div className="text-3xl font-bold tracking-tight">KES {stock.price.toFixed(2)}</div>
          <div className={`text-sm font-semibold flex items-center gap-1 mt-0.5 ${stock.isUp ? 'text-[hsl(152,60%,45%)]' : 'text-[hsl(0,70%,55%)]'}`}>
            {stock.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{stock.isUp ? '+' : ''}KES {stock.change.toFixed(2)} ({stock.changePercent}%)</span>
            <span className="text-white/30 text-xs ml-1">Today</span>
          </div>
        </div>

        {/* Chart */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1 flex-1">
              {timeframes.map(tf => (
                <button
                  key={tf}
                  className={`h-8 px-3 text-xs flex-1 rounded-full font-semibold transition-all ${
                    tf === selectedTimeframe ? 'bg-[hsl(152,60%,45%)] text-black' : 'text-white/40 hover:text-white/70'
                  }`}
                  onClick={() => setSelectedTimeframe(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
            <button
              className={`ml-2 h-8 px-3 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                advancedChart ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 border border-white/10'
              }`}
              onClick={() => setAdvancedChart(!advancedChart)}
            >
              <Settings2 className="h-3 w-3" />
              Advanced
            </button>
          </div>
          <div className="bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden">
            <div className={advancedChart ? "" : "p-3"}>
              {advancedChart ? (
                <div className="p-3">
                  <EnhancedStockChart symbol={symbol || "SAFCOM"} timeframe={selectedTimeframe} />
                </div>
              ) : (
                <div className="h-56">
                  <StockPriceChart symbol={symbol} timeframe={selectedTimeframe} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Bell, label: "Alert", action: () => setShowAlertsDialog(true), color: "bg-[hsl(200,70%,50%)]/10 text-[hsl(200,70%,50%)]" },
            { icon: Plus, label: "Trade", action: () => setTradeOpen(true), color: "bg-[hsl(152,60%,45%)]/10 text-[hsl(152,60%,45%)]" },
            { icon: GitCompare, label: "Compare", action: () => navigate(`/compare?stock=${symbol}`), color: "bg-[hsl(280,55%,55%)]/10 text-[hsl(280,55%,55%)]" },
            { icon: MessageSquare, label: "Discuss", action: () => navigate(`/tradershub`), color: "bg-[hsl(35,85%,55%)]/10 text-[hsl(35,85%,55%)]" },
          ].map(btn => (
            <button key={btn.label} className={`h-14 flex flex-col items-center justify-center gap-1 rounded-2xl ${btn.color} active:scale-95 transition-transform`} onClick={btn.action}>
              <btn.icon className="h-5 w-5" />
              <span className="text-[10px] font-semibold">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Key Statistics */}
        <div>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-white/80">
            <BarChart3 className="h-4 w-4 text-[hsl(152,60%,45%)]" />
            Key Statistics
          </h3>
          <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-4">
            <div className="grid grid-cols-3 gap-x-4 gap-y-3">
              {[
                { label: "Market Cap", value: stock.marketCap },
                { label: "P/E Ratio", value: stock.pe },
                { label: "EPS", value: `KES ${stock.eps}` },
                { label: "Div Yield", value: `${divYield}%`, highlight: true },
                { label: "52W High", value: `KES ${stock.high52}` },
                { label: "52W Low", value: `KES ${stock.low52}` },
                { label: "Volume", value: stock.volume || "N/A" },
                { label: "Beta", value: stock.beta || "N/A" },
                { label: "Avg Vol", value: stock.avgVolume || "N/A" },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-[10px] text-white/40 font-medium">{stat.label}</p>
                  <p className={`text-sm font-bold ${stat.highlight ? 'text-[hsl(152,60%,45%)]' : ''}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 52-Week Range */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-4">
          <p className="text-xs text-white/40 font-medium mb-2">52-Week Range</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">{stock.low52}</span>
            <div className="flex-1 h-2 bg-white/10 rounded-full relative">
              <div className="absolute top-0 h-2 rounded-full bg-[hsl(152,60%,45%)]"
                style={{ left: '0%', width: `${Math.min(100, Math.max(5, ((stock.price - parseFloat(stock.low52 === 'N/A' ? '0' : stock.low52)) / (parseFloat(stock.high52 === 'N/A' ? '100' : stock.high52) - parseFloat(stock.low52 === 'N/A' ? '0' : stock.low52))) * 100))}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[hsl(152,60%,45%)] border-2 border-[hsl(220,15%,8%)] shadow-sm"
                style={{ left: `${Math.min(97, Math.max(3, ((stock.price - parseFloat(stock.low52 === 'N/A' ? '0' : stock.low52)) / (parseFloat(stock.high52 === 'N/A' ? '100' : stock.high52) - parseFloat(stock.low52 === 'N/A' ? '0' : stock.low52))) * 100))}%` }} />
            </div>
            <span className="text-xs font-semibold">{stock.high52}</span>
          </div>
        </div>

        {/* Analyst Ratings */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-4">
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-white/80">
            <Award className="h-4 w-4 text-[hsl(200,70%,50%)]" />
            Analyst Ratings
          </h4>
          <AnalystRatings currentPrice={stock.price} />
        </div>

        {/* Money Flow */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold flex items-center gap-2 text-white/80">
              <Activity className="h-4 w-4 text-[hsl(152,60%,45%)]" />
              Money Flow
            </h4>
            <Badge className="text-[10px] bg-[hsl(152,60%,45%)]/10 text-[hsl(152,60%,45%)] border-0">Net Inflow</Badge>
          </div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-[hsl(152,60%,45%)] font-semibold">Inflow 65%</span>
            <span className="text-xs text-[hsl(0,70%,55%)] font-semibold">Outflow 35%</span>
          </div>
          <div className="w-full bg-[hsl(0,70%,55%)]/20 rounded-full h-2.5 overflow-hidden">
            <div className="bg-[hsl(152,60%,45%)] h-2.5 rounded-full transition-all duration-500" style={{ width: '65%' }} />
          </div>
        </div>

        {/* News */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2 text-white/80">
              <Newspaper className="h-4 w-4 text-[hsl(200,70%,50%)]" />
              Latest News
            </h3>
            <button className="text-xs text-[hsl(152,60%,45%)] font-semibold flex items-center">
              All <ChevronRight className="h-3 w-3 ml-0.5" />
            </button>
          </div>
          <div className="space-y-2">
            {stockNews.map(news => (
              <div key={news.id} className="bg-white/[0.03] rounded-xl border border-white/5 p-3 active:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-2">{news.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-white/30">{news.source}</span>
                      <span className="text-xs text-white/30">·</span>
                      <span className="text-xs text-white/30">{news.time}</span>
                    </div>
                  </div>
                  <Badge className={`text-[10px] py-0 px-1.5 shrink-0 border-0 ${
                    news.sentiment === 'bullish' ? 'bg-[hsl(152,60%,45%)]/10 text-[hsl(152,60%,45%)]' : 'bg-[hsl(0,70%,55%)]/10 text-[hsl(0,70%,55%)]'
                  }`}>{news.sentiment}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2 text-white/80">
              <MessageSquare className="h-4 w-4 text-[hsl(35,85%,55%)]" />
              Community
            </h3>
            <button className="text-xs text-[hsl(152,60%,45%)] font-semibold flex items-center" onClick={() => navigate('/tradershub')}>
              All <ChevronRight className="h-3 w-3 ml-0.5" />
            </button>
          </div>
          <div className="space-y-2">
            {communityPosts.map(post => (
              <div key={post.id} className="bg-white/[0.03] rounded-xl border border-white/5 p-3 active:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/tradershub')}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">{post.user.slice(0, 1)}</div>
                  <span className="text-xs font-semibold">{post.user}</span>
                  <span className="text-xs text-white/30">· {post.time}</span>
                </div>
                <p className="text-sm text-white/60 line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-white/30 flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes}</span>
                  <span className="text-xs text-white/30 flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {post.replies}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            className="w-full mt-2 h-10 rounded-2xl text-sm font-semibold gap-2 flex items-center justify-center border border-white/10 text-white/60 active:bg-white/5 transition-colors"
            onClick={() => navigate('/tradershub')}
          >
            <MessageSquare className="h-4 w-4" />
            Post about ${symbol}
          </button>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-1 bg-white/5 rounded-xl">
            <TabsTrigger value="overview" className="text-xs px-2 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/40 rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="financials" className="text-xs px-2 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/40 rounded-lg">Financials</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs px-2 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/40 rounded-lg">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3 mt-4">
            <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-4">
              <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-white/80">
                <Target className="h-4 w-4 text-[hsl(200,70%,50%)]" />
                Technical Sentiment
              </h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/50">Overall Signal</span>
                <Badge className="bg-[hsl(152,60%,45%)]/10 text-[hsl(152,60%,45%)] text-xs border-0">Strong Buy</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { label: "RSI (14)", value: "68.2", status: "Neutral" },
                  { label: "MACD", value: "Bullish", status: "Buy" },
                  { label: "SMA 50", value: "Above", status: "Buy" },
                ].map(i => (
                  <div key={i.label} className="text-center p-2 bg-white/5 rounded-xl">
                    <p className="text-[10px] text-white/40">{i.label}</p>
                    <p className="text-xs font-bold mt-0.5">{i.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="financials" className="space-y-3 mt-4">
            <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-4">
              <h4 className="text-sm font-bold mb-3 text-white/80">Key Financial Indicators</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "ROE", value: "18.5%" }, { label: "ROA", value: "12.3%" },
                  { label: "EBITDA Margin", value: "45.2%" }, { label: "FCF", value: "KES 89.2B" },
                  { label: "P/B Ratio", value: "2.8" }, { label: "Debt/Equity", value: "0.25" },
                ].map(s => (
                  <div key={s.label} className="flex justify-between">
                    <span className="text-xs text-white/40">{s.label}</span>
                    <span className="text-xs font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-3 mt-4">
            <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-4">
              <h4 className="text-sm font-bold mb-2 flex items-center gap-2 text-white/80">
                <Building className="h-4 w-4 text-[hsl(200,70%,50%)]" />
                About {stock.name}
              </h4>
              <p className="text-xs text-white/50 leading-relaxed">{company.description}</p>
            </div>
            <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-4 space-y-3">
              {[
                { icon: Building, label: "Sector", value: company.sector },
                { icon: Globe, label: "HQ", value: company.headquarters },
                { icon: UserCheck, label: "CEO", value: company.ceo },
                { icon: Users, label: "Employees", value: company.employees },
                { icon: Calendar, label: "Founded", value: company.founded },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-white/30 shrink-0" />
                  <div className="flex-1 flex justify-between">
                    <span className="text-xs text-white/40">{item.label}</span>
                    <span className="text-xs font-medium">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Trade Button */}
      <div className="fixed bottom-20 left-4 right-4 z-30">
        <Button
          className="w-full h-12 rounded-2xl bg-[hsl(152,60%,45%)] text-black hover:bg-[hsl(152,60%,50%)] font-bold text-sm shadow-[0_4px_20px_hsl(152,60%,45%,0.3)] gap-2"
          onClick={() => setTradeOpen(true)}
        >
          <Plus className="h-5 w-5" />
          Trade {symbol}
        </Button>
      </div>

      {/* Trade Sheet */}
      <TradeSheet open={tradeOpen} onOpenChange={setTradeOpen} symbol={symbol} onTradeAdded={addToPortfolio} />

      {/* Price Alerts Dialog */}
      {showAlertsDialog && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowAlertsDialog(false)}>
          <div className="bg-[hsl(220,15%,12%)] text-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-auto border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-[hsl(220,15%,12%)] border-b border-white/10 p-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-base font-bold">Price Alerts</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAlertsDialog(false)} className="h-8 w-8 text-white hover:bg-white/10">✕</Button>
            </div>
            <div className="p-4"><PriceAlertsManager initialSymbol={symbol} /></div>
          </div>
        </div>
      )}
    </div>
  );
}
