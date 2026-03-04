import { useState } from "react";
import { MorningBrief } from "@/components/home/MorningBrief";
import { TopMoversLosers } from "@/components/home/TopMoversLosers";
import { CurrencyConverter } from "@/components/home/CurrencyConverter";
import { StockHeatmap } from "@/components/home/StockHeatmap";
import { RealtimeWatchlistWidget } from "@/components/home/RealtimeWatchlistWidget";
import { EconomicCalendar } from "@/components/home/EconomicCalendar";
import { FearGreedIndex } from "@/components/home/FearGreedIndex";
import { TrendingStocks } from "@/components/home/TrendingStocks";
import { QuickTradeWidget } from "@/components/home/QuickTradeWidget";
import { WidgetManager, WidgetConfig, defaultWidgets } from "@/components/home/WidgetManager";
import { TopBar } from "@/components/shared/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, Search, TrendingUp, TrendingDown, LogIn, Sparkles, ChevronRight, 
  Scale, ArrowUpRight, ArrowDownRight, Wallet, Eye, EyeOff, Zap, BarChart3
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePortfolio } from "@/hooks/usePortfolio";
import { getTimeBasedGreeting } from "@/utils/timeGreeting";
import { SparklineChart } from "@/components/shared/SparklineChart";

export default function Home() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { portfolio } = usePortfolio();
  const navigate = useNavigate();
  const { greeting } = getTimeBasedGreeting();
  const [widgetManagerOpen, setWidgetManagerOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('home-widgets');
    return saved ? JSON.parse(saved) : defaultWidgets;
  });
  
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Investor';

  const handleSaveWidgets = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    localStorage.setItem('home-widgets', JSON.stringify(newWidgets));
  };

  // Portfolio calculation
  const portfolioValue = portfolio.reduce((sum, h) => {
    const prices: Record<string, number> = { SAFCOM: 12.85, EQTY: 62.50, KCB: 45.30, COOP: 15.20, SCBK: 185.00, BAMB: 89.75 };
    return sum + (prices[h.symbol] || h.avg_cost) * h.shares;
  }, 0);
  const portfolioCost = portfolio.reduce((sum, h) => sum + h.avg_cost * h.shares, 0);
  const portfolioGain = portfolioValue - portfolioCost;
  const portfolioGainPct = portfolioCost > 0 ? (portfolioGain / portfolioCost) * 100 : 0;
  const dailyChange = portfolioGain * 0.12;

  const nseIndices = [
    { name: "NSE 20", value: "1,847.23", change: 1.2, isUp: true },
    { name: "NSE 25", value: "3,542.87", change: 0.8, isUp: true },
    { name: "All Share", value: "112.45", change: -0.3, isUp: false },
    { name: "FTSE Kenya", value: "1,234.56", change: 2.1, isUp: true },
    { name: "Growth", value: "987.32", change: -1.5, isUp: false },
  ];

  const watchlistStocks = [
    { symbol: "SCOM", name: "Safaricom", price: 12.85, change: 2.4 },
    { symbol: "EQTY", name: "Equity", price: 62.50, change: -1.2 },
    { symbol: "KCB", name: "KCB Group", price: 45.30, change: 0.8 },
    { symbol: "EABL", name: "EABL", price: 155.00, change: -2.1 },
    { symbol: "BAMB", name: "Bamburi", price: 89.75, change: 3.2 },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar 
        title={user ? "AfriFinance" : "AfriFinance"} 
        subtitle={user ? `${greeting}, ${firstName}` : "Your smart investment companion"}
        showSearch={true}
        showWidgetSettings={!!user}
        showNotifications={true}
        onWidgetSettingsClick={() => setWidgetManagerOpen(true)}
      />
      
      {user && (
        <WidgetManager 
          open={widgetManagerOpen} 
          onOpenChange={setWidgetManagerOpen}
          widgets={widgets}
          onSave={handleSaveWidgets}
        />
      )}
      
      <div className="px-4 pt-4 space-y-5">
        {/* Auth CTA for logged out users */}
        {!user && (
          <div className="animate-fade-in">
            <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 overflow-hidden">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <LogIn className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Start Your Journey</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Track your portfolio, create watchlists, and join the community.
                </p>
                <Button className="btn-primary w-full h-12 text-base" onClick={() => navigate('/auth')}>
                  Sign Up / Login
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Portfolio Snapshot Card (logged in) */}
        {user && portfolio.length > 0 && (
          <div className="animate-fade-in">
            <Card className="soft-card border-0 bg-gradient-to-br from-primary/8 via-card to-accent/5 cursor-pointer" onClick={() => navigate('/track-investments')}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Portfolio Value</span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); setShowBalance(!showBalance); }}>
                      {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2">
                  {showBalance ? `KES ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
                </div>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-1 text-sm font-semibold ${portfolioGain >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {portfolioGain >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {showBalance ? `${portfolioGain >= 0 ? '+' : ''}KES ${Math.abs(portfolioGain).toFixed(2)}` : '••••'}
                    <span className="text-xs">({portfolioGainPct >= 0 ? '+' : ''}{portfolioGainPct.toFixed(1)}%)</span>
                  </div>
                  <Badge variant="secondary" className="text-xs rounded-full bg-primary/10 text-primary border-0">All time</Badge>
                </div>
                <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Wallet className="h-3.5 w-3.5" />
                    <span>Today</span>
                    <span className={`font-medium ${dailyChange >= 0 ? 'text-bull' : 'text-bear'}`}>
                      {dailyChange >= 0 ? '+' : ''}KES {Math.abs(dailyChange).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Live Market Indices */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Live Indices
            </h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary rounded-full px-3" onClick={() => navigate('/markets')}>
              View All <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </div>
          <div className="overflow-hidden -mx-4 px-4">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {nseIndices.map((idx) => (
                <Card key={idx.name} className="soft-card min-w-[130px] flex-shrink-0 p-3 cursor-pointer" onClick={() => navigate('/markets')}>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{idx.name}</p>
                  <p className="text-base font-bold">{idx.value}</p>
                  <p className={`text-xs font-semibold flex items-center gap-0.5 mt-0.5 ${idx.isUp ? 'text-bull' : 'text-bear'}`}>
                    {idx.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {idx.isUp ? '+' : ''}{idx.change}%
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Watchlist Carousel */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Quick Watch
            </h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary rounded-full px-3" onClick={() => navigate('/watchlist')}>
              All <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </div>
          <div className="overflow-hidden -mx-4 px-4">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {watchlistStocks.map((stock) => (
                <Card key={stock.symbol} className="soft-card min-w-[140px] flex-shrink-0 p-3 cursor-pointer" onClick={() => navigate(`/stock/${stock.symbol}`)}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <SparklineChart isPositive={stock.change >= 0} width={48} height={20} />
                  </div>
                  <p className="text-xs font-bold">${stock.symbol}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-muted-foreground">KES {stock.price.toFixed(2)}</span>
                    <span className={`text-xs font-semibold ${stock.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change}%
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Morning Brief */}
        <div className="animate-fade-in">
          <MorningBrief />
        </div>

        {/* Fear & Greed */}
        <div className="animate-fade-in">
          <FearGreedIndex />
        </div>
        
        {user && (
          <div className="animate-fade-in">
            <QuickTradeWidget />
          </div>
        )}
        
        {user && (
          <div className="animate-fade-in">
            <RealtimeWatchlistWidget />
          </div>
        )}

        <div className="animate-fade-in">
          <TrendingStocks />
        </div>
        
        <div className="animate-fade-in">
          <TopMoversLosers />
        </div>
        
        <div className="animate-fade-in">
          <CurrencyConverter />
        </div>
        
        <div className="animate-fade-in">
          <Card className="soft-card">
            <div className="p-4">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-accent" />
                Market Pulse
              </h3>
              <StockHeatmap />
            </div>
          </Card>
        </div>

        <div className="animate-fade-in">
          <EconomicCalendar />
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          <Card className="soft-card cursor-pointer" onClick={() => navigate('/screener')}>
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-11 h-11 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Screener</h3>
                <p className="text-xs text-muted-foreground">Find stocks</p>
              </div>
            </CardContent>
          </Card>
          <Card className="soft-card cursor-pointer" onClick={() => navigate('/compare')}>
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Compare</h3>
                <p className="text-xs text-muted-foreground">Side by side</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          <NavLink to="/track-investments">
            <Button className="btn-primary h-12 w-full text-sm font-semibold flex items-center justify-center gap-2">
              <PieChart className="h-4 w-4" />
              Investments
            </Button>
          </NavLink>
          <NavLink to="/discover">
            <Button variant="outline" className="h-12 w-full text-sm font-semibold flex items-center justify-center gap-2 rounded-2xl tap-scale">
              <Search className="h-4 w-4" />
              Discover
            </Button>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
