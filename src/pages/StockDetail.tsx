import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, TrendingUp, TrendingDown, Newspaper, Activity, Target, Award, PieChart, FileText, Banknote, UserCheck, Briefcase, Building, Globe, Users, Calendar, Bell, GitCompare, Plus, Share2, MessageSquare, BarChart3, ChevronRight, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StockPriceChart } from "@/components/stock/StockPriceChart";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceAlertsManager } from "@/components/alerts/PriceAlertsManager";
import { usePortfolio } from "@/hooks/usePortfolio";
import { AnalystRatings } from "@/components/stock/AnalystRatings";
import { MarketStatusIndicator } from "@/components/shared/MarketStatusIndicator";
import { SparklineChart } from "@/components/shared/SparklineChart";
import { TradeSheet } from "@/components/trade/TradeSheet";

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
  SASN: { name: "Sasini PLC", price: 18.50, change: -0.25, changePercent: "-1.33", isUp: false, marketCap: "4.2B", pe: "8.5", eps: "2.18", dividend: "0.50", high52: "22.00", low52: "16.00", exchange: "NSE", sector: "Agricultural", volume: "180K", beta: "0.72", avgVolume: "140K" },
  KTBL: { name: "Kenya Tea Development Agency", price: 85.00, change: 1.50, changePercent: "1.80", isUp: true, marketCap: "16.8B", pe: "7.2", eps: "11.81", dividend: "4.00", high52: "95.00", low52: "75.00", exchange: "NSE", sector: "Agricultural", volume: "65K", beta: "0.58", avgVolume: "52K" },
  BAMB: { name: "Bamburi Cement PLC", price: 32.75, change: 0.75, changePercent: "2.34", isUp: true, marketCap: "11.9B", pe: "15.2", eps: "2.15", dividend: "0.00", high52: "38.00", low52: "28.00", exchange: "NSE", sector: "Construction & Allied", volume: "340K", beta: "0.92", avgVolume: "280K" },
  CTUM: { name: "Centum Investment Company", price: 12.50, change: 0.20, changePercent: "1.63", isUp: true, marketCap: "8.3B", pe: "4.5", eps: "2.78", dividend: "0.55", high52: "15.00", low52: "10.00", exchange: "NSE", sector: "Investment", volume: "320K", beta: "1.08", avgVolume: "250K" },
  NMG: { name: "Nation Media Group PLC", price: 16.80, change: 0.30, changePercent: "1.82", isUp: true, marketCap: "3.1B", pe: "8.2", eps: "2.05", dividend: "1.00", high52: "20.00", low52: "14.00", exchange: "NSE", sector: "Commercial & Services", volume: "210K", beta: "0.82", avgVolume: "165K" },
  TPS: { name: "TPS Eastern Africa (Serena)", price: 22.50, change: 0.50, changePercent: "2.27", isUp: true, marketCap: "4.1B", pe: "12.5", eps: "1.80", dividend: "0.75", high52: "26.00", low52: "18.00", exchange: "NSE", sector: "Commercial & Services", volume: "95K", beta: "0.68", avgVolume: "72K" },
};

const companyInfo: Record<string, { description: string; sector: string; headquarters: string; ceo: string; employees: string; founded: string }> = {
  SAFCOM: { description: "Safaricom PLC is a leading mobile network operator in Kenya providing mobile telephony, mobile money transfer (M-Pesa), and wireless data services.", sector: "Telecommunications", headquarters: "Nairobi, Kenya", ceo: "Peter Ndegwa", employees: "6,500+", founded: "1997" },
  EQTY: { description: "Equity Group Holdings PLC is a leading financial services group in East and Central Africa, providing banking, insurance, and investment services.", sector: "Banking & Financial Services", headquarters: "Nairobi, Kenya", ceo: "James Mwangi", employees: "15,000+", founded: "1984" },
  KCB: { description: "KCB Group PLC is the largest commercial bank in Kenya and East Africa by assets.", sector: "Banking & Financial Services", headquarters: "Nairobi, Kenya", ceo: "Paul Russo", employees: "10,000+", founded: "1896" },
  EABL: { description: "East African Breweries Limited is the largest brewer in East Africa, producing Tusker, Guinness, and Bell lager.", sector: "Manufacturing & Allied", headquarters: "Nairobi, Kenya", ceo: "Jane Karuku", employees: "4,000+", founded: "1922" },
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
  const [tradeSheetOpen, setTradeSheetOpen] = useState(false);
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
      if (result?.error) toast({ title: "Error", variant: "destructive" });
      else toast({ title: "Removed from watchlist" });
    } else {
      const result = await addToWatchlist(symbol, stock.name);
      if (result?.error) toast({ title: "Error", description: result.error.message, variant: "destructive" });
      else toast({ title: "Added to watchlist" });
    }
  };

  const timeframes = ["1D", "5D", "1M", "3M", "6M", "1Y", "ALL"];
  const divYield = stock.pe !== "N/A" ? ((parseFloat(stock.dividend) / stock.price) * 100).toFixed(1) : "0.0";

  // Revenue breakdown mock
  const revenueSegments = [
    { segment: "M-Pesa", revenue: "KES 125.8B", pct: 38 },
    { segment: "Voice", revenue: "KES 72.4B", pct: 22 },
    { segment: "Data", revenue: "KES 65.8B", pct: 20 },
    { segment: "SMS", revenue: "KES 32.9B", pct: 10 },
    { segment: "Other", revenue: "KES 31.6B", pct: 10 },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="tap-scale h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base">{symbol}</span>
                <MarketStatusIndicator />
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{stock.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={handleWatchlistToggle} className="h-9 w-9 rounded-full bg-primary/10 tap-scale">
              <Heart className={`h-4 w-4 transition-all ${isInWatchlist(symbol || '') ? 'fill-primary text-primary scale-110' : 'text-primary'}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-accent/10 tap-scale" onClick={() => navigate(`/news?stock=${symbol}`)}>
              <Newspaper className="h-4 w-4 text-accent" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-muted tap-scale">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Hero Price */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-[10px] py-0">{stock.exchange}</Badge>
            <Badge variant="outline" className="text-[10px] py-0">{stock.sector}</Badge>
          </div>
          <div className="text-3xl font-bold tracking-tight">KES {stock.price.toFixed(2)}</div>
          <div className={`text-sm font-semibold flex items-center gap-1 mt-0.5 ${stock.isUp ? 'text-bull' : 'text-bear'}`}>
            {stock.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{stock.isUp ? '+' : ''}KES {stock.change.toFixed(2)} ({stock.changePercent}%)</span>
            <span className="text-muted-foreground text-xs ml-1">Today</span>
          </div>
        </div>

        {/* Chart */}
        <div>
          <div className="flex gap-1 mb-3">
            {timeframes.map((tf) => (
              <Button key={tf} variant="ghost" size="sm"
                className={`h-8 px-3 text-xs flex-1 rounded-full font-semibold transition-all ${tf === selectedTimeframe ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                onClick={() => setSelectedTimeframe(tf)}>
                {tf}
              </Button>
            ))}
          </div>
          <Card className="soft-card overflow-hidden">
            <CardContent className="p-3">
              <div className="h-56"><StockPriceChart symbol={symbol} timeframe={selectedTimeframe} /></div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Bell, label: "Alert", action: () => setShowAlertsDialog(true), color: "bg-accent/10 text-accent" },
            { icon: DollarSign, label: "Trade", action: () => setTradeSheetOpen(true), color: "bg-bull/10 text-bull" },
            { icon: GitCompare, label: "Compare", action: () => navigate(`/compare?stock=${symbol}`), color: "bg-chart-3/10 text-chart-3" },
            { icon: MessageSquare, label: "Discuss", action: () => navigate(`/traders-hub?compose=true&ticker=${symbol}`), color: "bg-chart-4/10 text-chart-4" },
          ].map(btn => (
            <Button key={btn.label} variant="ghost" className={`h-14 flex-col gap-1 rounded-2xl ${btn.color} tap-scale`} onClick={btn.action}>
              <btn.icon className="h-5 w-5" />
              <span className="text-[10px] font-semibold">{btn.label}</span>
            </Button>
          ))}
        </div>

        {/* Key Statistics */}
        <div>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />Key Statistics
          </h3>
          <Card className="soft-card">
            <CardContent className="p-4">
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
                    <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
                    <p className={`text-sm font-bold ${stat.highlight ? 'text-bull' : ''}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 52-Week Range */}
        <Card className="soft-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium mb-2">52-Week Range</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">{stock.low52}</span>
              <div className="flex-1 h-2 bg-muted rounded-full relative">
                <div className="absolute top-0 h-2 rounded-full bg-primary"
                  style={{ left: '0%', width: `${Math.min(100, Math.max(5, ((stock.price - parseFloat(stock.low52 === 'N/A' ? '0' : stock.low52)) / (parseFloat(stock.high52 === 'N/A' ? '100' : stock.high52) - parseFloat(stock.low52 === 'N/A' ? '0' : stock.low52))) * 100))}%` }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background shadow-sm"
                  style={{ left: `${Math.min(97, Math.max(3, ((stock.price - parseFloat(stock.low52 === 'N/A' ? '0' : stock.low52)) / (parseFloat(stock.high52 === 'N/A' ? '100' : stock.high52) - parseFloat(stock.low52 === 'N/A' ? '0' : stock.low52))) * 100))}%` }} />
              </div>
              <span className="text-xs font-semibold">{stock.high52}</span>
            </div>
          </CardContent>
        </Card>

        {/* Analyst Ratings */}
        <Card className="soft-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Award className="h-4 w-4 text-accent" />Analyst Ratings</CardTitle>
          </CardHeader>
          <CardContent className="pb-4"><AnalystRatings currentPrice={stock.price} /></CardContent>
        </Card>

        {/* Money Flow */}
        <Card className="soft-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Money Flow</h4>
              <Badge variant="secondary" className="text-[10px]">Net Inflow</Badge>
            </div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-bull font-semibold">Inflow 65%</span>
              <span className="text-xs text-bear font-semibold">Outflow 35%</span>
            </div>
            <div className="w-full bg-bear/20 rounded-full h-2.5 overflow-hidden">
              <div className="bg-bull h-2.5 rounded-full transition-all duration-500" style={{ width: '65%' }} />
            </div>
          </CardContent>
        </Card>

        {/* Stock-Specific News */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2"><Newspaper className="h-4 w-4 text-accent" />Latest News</h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary rounded-full px-3">All <ChevronRight className="h-3 w-3 ml-0.5" /></Button>
          </div>
          <div className="space-y-2">
            {stockNews.map(news => (
              <Card key={news.id} className="soft-card p-3 cursor-pointer active:scale-[0.99] transition-transform">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-2">{news.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-muted-foreground">{news.source}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{news.time}</span>
                    </div>
                  </div>
                  <Badge className={`text-[10px] py-0 px-1.5 shrink-0 ${news.sentiment === 'bullish' ? 'bg-bull/10 text-bull border-bull/20' : 'bg-bear/10 text-bear border-bear/20'}`}>
                    {news.sentiment}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Removed community posts section - discuss button in quick actions navigates to TradersHub */}

        {/* Detailed Tabs: Overview / Financials / Profile */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-1">
            <TabsTrigger value="overview" className="text-xs px-2">Overview</TabsTrigger>
            <TabsTrigger value="financials" className="text-xs px-2">Financials</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs px-2">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3 mt-4">
            <Card className="soft-card">
              <CardContent className="p-4">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><Target className="h-4 w-4 text-accent" />Technical Sentiment</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs">Overall Signal</span>
                  <Badge className="bg-bull/10 text-bull border-bull/20 text-xs">Strong Buy</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[
                    { label: "RSI (14)", value: "68.2", status: "Neutral" },
                    { label: "MACD", value: "Bullish", status: "Buy" },
                    { label: "SMA 50", value: "Above", status: "Buy" },
                  ].map(i => (
                    <div key={i.label} className="text-center p-2 bg-muted/30 rounded-xl">
                      <p className="text-[10px] text-muted-foreground">{i.label}</p>
                      <p className="text-xs font-bold mt-0.5">{i.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="space-y-3 mt-4">
            {/* Valuation Metrics */}
            <Card className="soft-card">
              <CardContent className="p-4">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />Valuation Metrics
                </h4>
                <div className="space-y-2.5">
                  {[
                    { label: "P/E Ratio", value: stock.pe, sector: "8.5", note: stock.pe !== "N/A" && parseFloat(stock.pe) < 10 ? "Below sector avg" : "Above sector avg" },
                    { label: "P/B Ratio", value: "2.8", sector: "1.9", note: "Premium valuation" },
                    { label: "P/S Ratio", value: "1.6", sector: "2.1", note: "Below sector avg" },
                    { label: "EV/EBITDA", value: "8.2", sector: "7.5", note: "Near sector avg" },
                  ].map(m => (
                    <div key={m.label} className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground">{m.label}</span>
                        <p className="text-[10px] text-muted-foreground/60">{m.note}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">{m.value}</span>
                        <p className="text-[10px] text-muted-foreground">Sector: {m.sector}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Financial Indicators */}
            <Card className="soft-card">
              <CardContent className="p-4">
                <h4 className="text-sm font-bold mb-3">Key Financial Indicators</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "ROE", value: "18.5%" }, { label: "ROA", value: "12.3%" },
                    { label: "EBITDA Margin", value: "45.2%" }, { label: "FCF", value: "KES 89.2B" },
                    { label: "Debt/Equity", value: "0.25" }, { label: "Current Ratio", value: "1.8" },
                  ].map(s => (
                    <div key={s.label} className="flex justify-between">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-xs font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Breakdown */}
            <Card className="soft-card">
              <CardContent className="p-4">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-accent" />Revenue Breakdown
                </h4>
                <div className="space-y-2">
                  {revenueSegments.map((seg, i) => (
                    <div key={seg.segment}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{seg.segment}</span>
                        <span className="text-xs text-muted-foreground">{seg.revenue} ({seg.pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-700"
                          style={{
                            width: `${seg.pct}%`,
                            backgroundColor: `hsl(${152 + i * 30}, 60%, ${45 + i * 5}%)`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Financial Statements Summary */}
            <Card className="soft-card">
              <CardContent className="p-4">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />Financial Statements
                </h4>
                {[
                  { label: "Revenue (TTM)", value: "KES 328.5B", change: "+12.4%" },
                  { label: "Net Income (TTM)", value: "KES 68.2B", change: "+8.7%" },
                  { label: "Total Assets", value: "KES 512.8B", change: "+5.2%" },
                  { label: "Total Equity", value: "KES 285.3B", change: "+6.1%" },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <div className="text-right">
                      <span className="text-xs font-semibold">{s.value}</span>
                      <span className="text-[10px] text-bull ml-1.5">{s.change}</span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-3 h-9 rounded-full text-xs font-semibold gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  View Full NSE Report
                </Button>
              </CardContent>
            </Card>

            {/* Dividend History */}
            <Card className="soft-card">
              <CardContent className="p-4">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-bull" />Dividend History
                </h4>
                {[
                  { label: "Annual Dividend", value: `KES ${stock.dividend}` },
                  { label: "Dividend Yield", value: `${divYield}%` },
                  { label: "Payout Ratio", value: "45.8%" },
                  { label: "5Y Avg Yield", value: `${(parseFloat(divYield) * 0.9).toFixed(1)}%` },
                ].map(s => (
                  <div key={s.label} className="flex justify-between py-1.5">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <span className="text-xs font-semibold">{s.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-3 mt-4">
            <Card className="soft-card">
              <CardContent className="p-4">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2"><Building className="h-4 w-4 text-accent" />About {stock.name}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{company.description}</p>
              </CardContent>
            </Card>
            <Card className="soft-card">
              <CardContent className="p-4 space-y-3">
                {[
                  { icon: Building, label: "Sector", value: company.sector },
                  { icon: Globe, label: "HQ", value: company.headquarters },
                  { icon: UserCheck, label: "CEO", value: company.ceo },
                  { icon: Users, label: "Employees", value: company.employees },
                  { icon: Calendar, label: "Founded", value: company.founded },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 flex justify-between">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className="text-xs font-medium">{item.value}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Trade Button */}
      <div className="fixed bottom-20 left-4 right-4 z-30">
        <Button className="w-full h-12 rounded-2xl btn-primary text-sm font-bold shadow-lg gap-2" onClick={() => setTradeSheetOpen(true)}>
          <DollarSign className="h-5 w-5" />
          Trade {symbol}
        </Button>
      </div>

      {/* Trade Sheet */}
      <TradeSheet
        open={tradeSheetOpen}
        onOpenChange={setTradeSheetOpen}
        symbol={symbol || ""}
        stockName={stock.name}
        currentPrice={stock.price}
        isUp={stock.isUp}
        changePercent={stock.changePercent}
      />

      {/* Price Alerts Dialog */}
      {showAlertsDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAlertsDialog(false)}>
          <div className="bg-background rounded-2xl w-full max-w-md max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-base font-bold">Price Alerts</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAlertsDialog(false)} className="h-8 w-8">✕</Button>
            </div>
            <div className="p-4"><PriceAlertsManager initialSymbol={symbol} /></div>
          </div>
        </div>
      )}
    </div>
  );
}
