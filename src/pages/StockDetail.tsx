import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, TrendingUp, TrendingDown, Newspaper, Activity, Target, Award, PieChart, FileText, Banknote, UserCheck, Briefcase, Building, Globe, Users, Calendar, Bell, GitCompare, Plus, Pencil, Share2, MessageSquare, BarChart3, ChevronRight, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StockPriceChart } from "@/components/stock/StockPriceChart";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceAlertsManager } from "@/components/alerts/PriceAlertsManager";
import { usePortfolio } from "@/hooks/usePortfolio";
import { AnalystRatings } from "@/components/stock/AnalystRatings";
import { MarketStatusIndicator } from "@/components/shared/MarketStatusIndicator";
import { SparklineChart } from "@/components/shared/SparklineChart";
import { AddInvestmentDialog } from "@/components/portfolio/AddInvestmentDialog";

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

export default function StockDetail() {
  const navigate = useNavigate();
  const { symbol } = useParams();
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [showAlertsDialog, setShowAlertsDialog] = useState(false);
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
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

  const handleChartHover = useCallback((price: number | null, date: string | null) => {
    setHoverPrice(price);
    setHoverDate(date);
  }, []);

  const timeframes = ["1D", "5D", "1M", "3M", "6M", "1Y", "ALL"];
  const divYield = stock.pe !== "N/A" ? ((parseFloat(stock.dividend) / stock.price) * 100).toFixed(1) : "0.0";

  const displayPrice = hoverPrice ?? stock.price;
  const priceChange = hoverPrice ? hoverPrice - stock.price : stock.change;
  const priceChangePercent = hoverPrice
    ? ((hoverPrice - stock.price) / stock.price * 100).toFixed(2)
    : stock.changePercent;
  const displayIsUp = hoverPrice ? hoverPrice >= stock.price : stock.isUp;

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
        {/* Hero Price — updates on chart drag */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-[10px] py-0">{stock.exchange}</Badge>
            <Badge variant="outline" className="text-[10px] py-0">{stock.sector}</Badge>
          </div>
          <div className="text-3xl font-bold tracking-tight transition-all">
            KES {displayPrice.toFixed(2)}
          </div>
          <div className={`text-sm font-semibold flex items-center gap-1 mt-0.5 ${displayIsUp ? 'text-bull' : 'text-bear'}`}>
            {displayIsUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{priceChange >= 0 ? '+' : ''}KES {Math.abs(priceChange).toFixed(2)} ({priceChangePercent}%)</span>
            <span className="text-muted-foreground text-xs ml-1">
              {hoverDate || "Today"}
            </span>
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
              <div className="h-56">
                <StockPriceChart symbol={symbol} timeframe={selectedTimeframe} onHoverPrice={handleChartHover} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Bell, label: "Alert", action: () => setShowAlertsDialog(true), color: "bg-accent/10 text-accent" },
            { icon: GitCompare, label: "Compare", action: () => navigate(`/compare?stock=${symbol}`), color: "bg-chart-3/10 text-chart-3" },
            { icon: MessageSquare, label: "Discuss", action: () => navigate(`/traders-hub?compose=true&ticker=${symbol}`), color: "bg-chart-4/10 text-chart-4" },
          ].map(btn => (
            <Button key={btn.label} variant="ghost" className={`h-14 flex-col gap-1 rounded-2xl ${btn.color} tap-scale`} onClick={btn.action}>
              <btn.icon className="h-5 w-5" />
              <span className="text-[10px] font-semibold">{btn.label}</span>
            </Button>
          ))}
        </div>

        {/* My Holdings card — visible only when the user owns this stock */}
        {myHolding && (
          <Card className="soft-card border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Your Position</p>
                    <p className="text-sm font-bold">{myHolding.shares} shares</p>
                  </div>
                </div>
                <AddInvestmentDialog
                  lockedSymbol={symbol}
                  lockedName={stock.name}
                  lockedSector={stock.sector}
                  trigger={
                    <Button size="sm" variant="outline" className="h-8 rounded-full text-xs font-semibold">
                      <Pencil className="h-3 w-3 mr-1.5" /> Edit
                    </Button>
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
                <div>
                  <p className="text-[10px] text-muted-foreground">Avg Price</p>
                  <p className="text-sm font-bold">KES {myHolding.avg_cost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Market Value</p>
                  <p className="text-sm font-bold">KES {(myHolding.shares * stock.price).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">P/L</p>
                  <p className={`text-sm font-bold ${(stock.price - myHolding.avg_cost) >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {(stock.price - myHolding.avg_cost) >= 0 ? '+' : ''}{(((stock.price - myHolding.avg_cost) / myHolding.avg_cost) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                  style={{ width: `${stock.high52 !== "N/A" ? ((stock.price - parseFloat(stock.low52)) / (parseFloat(stock.high52) - parseFloat(stock.low52))) * 100 : 50}%` }} />
              </div>
              <span className="text-xs font-semibold">{stock.high52}</span>
            </div>
          </CardContent>
        </Card>

        {/* Financials */}
        <Tabs defaultValue="overview">
          <TabsList className="w-full grid grid-cols-4 bg-muted/40 rounded-full h-9 p-0.5">
            {["Overview", "Financials", "News", "About"].map(tab => (
              <TabsTrigger key={tab} value={tab.toLowerCase()} className="text-xs rounded-full data-[state=active]:bg-card data-[state=active]:shadow-sm h-full">{tab}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-3 space-y-4">
            <AnalystRatings />
          </TabsContent>

          <TabsContent value="financials" className="mt-3 space-y-4">
            <Card className="soft-card">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><PieChart className="h-4 w-4 text-primary" />Revenue Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {revenueSegments.map(seg => (
                  <div key={seg.segment}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{seg.segment}</span>
                      <span className="text-xs text-muted-foreground">{seg.revenue} ({seg.pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${seg.pct}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="mt-3 space-y-3">
            {stockNews.map(n => (
              <Card key={n.id} className="soft-card cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate('/news')}>
                <CardContent className="p-3 flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.sentiment === 'bullish' ? 'bg-bull' : 'bg-bear'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.source} · {n.time}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="about" className="mt-3 space-y-3">
            <Card className="soft-card">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm leading-relaxed text-muted-foreground">{company.description}</p>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                  {[
                    { icon: Building, label: "HQ", value: company.headquarters },
                    { icon: Users, label: "Employees", value: company.employees },
                    { icon: UserCheck, label: "CEO", value: company.ceo },
                    { icon: Calendar, label: "Founded", value: company.founded },
                  ].map(info => (
                    <div key={info.label} className="flex items-center gap-2">
                      <info.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">{info.label}</p>
                        <p className="text-xs font-medium">{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Add Investment Button */}
      <div className="fixed bottom-24 left-4 right-4 z-30">
        <AddInvestmentDialog
          lockedSymbol={symbol}
          lockedName={stock.name}
          lockedSector={stock.sector}
          trigger={
            <Button className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-xl hover:shadow-2xl">
              <Plus className="h-4 w-4 mr-2" />
              {myHolding ? `Update ${symbol} Holding` : `Add ${symbol} to Portfolio`}
            </Button>
          }
        />
      </div>

      {showAlertsDialog && <PriceAlertsManager />}
    </div>
  );
}
