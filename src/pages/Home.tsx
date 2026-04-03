import { useState } from "react";
import { Crown } from "lucide-react";
import { MorningBrief } from "@/components/home/MorningBrief";
import { TopMoversLosers } from "@/components/home/TopMoversLosers";
import { TrendingStocks } from "@/components/home/TrendingStocks";
import { QuickTradeWidget } from "@/components/home/QuickTradeWidget";
import { RealtimeWatchlistWidget } from "@/components/home/RealtimeWatchlistWidget";
import { FearGreedIndex } from "@/components/home/FearGreedIndex";
import { WidgetManager, WidgetConfig, defaultWidgets } from "@/components/home/WidgetManager";
import { TopBar } from "@/components/shared/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search, TrendingUp, LogIn, ChevronRight, ArrowUpRight, ArrowDownRight,
  Wallet, Eye, EyeOff, BarChart3
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePortfolio } from "@/hooks/usePortfolio";
import { getTimeBasedGreeting } from "@/utils/timeGreeting";
import { SparklineChart } from "@/components/shared/SparklineChart";
import { MarketStatusIndicator } from "@/components/shared/MarketStatusIndicator";

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
  const hasPortfolio = user && portfolio.length > 0;

  const handleSaveWidgets = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    localStorage.setItem('home-widgets', JSON.stringify(newWidgets));
  };

  const prices: Record<string, number> = { SAFCOM: 12.85, EQTY: 62.50, KCB: 45.30, COOP: 15.20, SCBK: 185.00, BAMB: 89.75 };
  const portfolioValue = portfolio.reduce((s, h) => s + (prices[h.symbol] || h.avg_cost) * h.shares, 0);
  const portfolioCost = portfolio.reduce((s, h) => s + h.avg_cost * h.shares, 0);
  const portfolioGain = portfolioValue - portfolioCost;
  const portfolioGainPct = portfolioCost > 0 ? (portfolioGain / portfolioCost) * 100 : 0;

  const nseIndices = [
    { name: "NSE 20", value: "1,847", change: 1.2, isUp: true },
    { name: "NSE 25", value: "3,542", change: 0.8, isUp: true },
    { name: "All Share", value: "112.4", change: -0.3, isUp: false },
    { name: "FTSE Kenya", value: "1,234", change: 2.1, isUp: true },
  ];

  const watchlistStocks = [
    { symbol: "SCOM", name: "Safaricom", price: 12.85, change: 2.4 },
    { symbol: "EQTY", name: "Equity", price: 62.50, change: -1.2 },
    { symbol: "KCB", name: "KCB", price: 45.30, change: 0.8 },
    { symbol: "EABL", name: "EABL", price: 155.00, change: -2.1 },
    { symbol: "BAMB", name: "Bamburi", price: 89.75, change: 3.2 },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar
        title="AfriFinance"
        subtitle={user ? `${greeting}, ${firstName}` : "Your smart companion"}
        showSearch
        showWidgetSettings={!!user}
        showNotifications
        onWidgetSettingsClick={() => setWidgetManagerOpen(true)}
      />

      {user && (
        <WidgetManager open={widgetManagerOpen} onOpenChange={setWidgetManagerOpen} widgets={widgets} onSave={handleSaveWidgets} />
      )}

      <div className="px-4 pt-3 space-y-4">
        {/* Auth CTA */}
        {!user && (
          <>
            {/* Market Brief first for non-traders */}
            <MorningBrief />
            <Card className="soft-card bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <LogIn className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-1">Start Your Journey</h3>
                <p className="text-xs text-muted-foreground mb-4">Track your portfolio & join the community.</p>
                <Button className="btn-primary w-full h-11" onClick={() => navigate('/auth')}>Sign Up / Login</Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* For traders: Portfolio card → Market Brief → rest */}
        {hasPortfolio && (
          <>
            {/* Compact Portfolio Card */}
            <Card className="soft-card border-0 bg-gradient-to-r from-primary/8 to-accent/5 cursor-pointer active:scale-[0.99] transition-transform" onClick={() => navigate('/track-investments')}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium">Portfolio</p>
                    <p className="text-base font-bold leading-tight">
                      {showBalance ? `KES ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '••••••'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-0.5 text-xs font-semibold ${portfolioGain >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {portfolioGain >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {portfolioGainPct >= 0 ? '+' : ''}{portfolioGainPct.toFixed(1)}%
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={e => { e.stopPropagation(); setShowBalance(!showBalance); }}>
                    {showBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </Button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Market Brief right below portfolio */}
            <MorningBrief />
          </>
        )}

        {/* For logged-in users without portfolio, Market Brief first */}
        {user && !hasPortfolio && <MorningBrief />}

        {/* Market Indices */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">Live Indices</h3>
              <MarketStatusIndicator />
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary rounded-full px-3" onClick={() => navigate('/markets')}>
              All <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </div>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
            {nseIndices.map(idx => (
              <Card key={idx.name} className="soft-card min-w-[110px] flex-shrink-0 p-2.5 active:scale-[0.97] transition-transform cursor-pointer" onClick={() => navigate('/markets')}>
                <p className="text-[10px] font-medium text-muted-foreground">{idx.name}</p>
                <p className="text-sm font-bold mt-0.5">{idx.value}</p>
                <p className={`text-[10px] font-semibold flex items-center gap-0.5 ${idx.isUp ? 'text-bull' : 'text-bear'}`}>
                  {idx.isUp ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                  {idx.isUp ? '+' : ''}{idx.change}%
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Watchlist */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Quick Watch
            </h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary rounded-full px-3" onClick={() => navigate('/watchlist')}>
              All <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </div>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
            {watchlistStocks.map(stock => (
              <Card key={stock.symbol} className="soft-card min-w-[120px] flex-shrink-0 p-2.5 cursor-pointer active:scale-[0.97] transition-transform" onClick={() => navigate(`/stock/${stock.symbol}`)}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {stock.symbol.slice(0, 2)}
                  </div>
                  <SparklineChart isPositive={stock.change >= 0} width={36} height={16} />
                </div>
                <p className="text-xs font-bold">${stock.symbol}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{stock.price}</span>
                  <span className={`text-[10px] font-semibold ${stock.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Upgrade Banner for free users */}
        {user && profile?.subscription_plan !== 'premium' && (
          <div className="upgrade-banner" onClick={() => navigate('/account')}>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-semibold">Unlock Premium</p>
                <p className="text-[10px] text-muted-foreground">Advanced charts, AI insights & more</p>
              </div>
            </div>
            <span className="text-xs font-bold text-primary">KES 999/mo →</span>
          </div>
        )}

        {/* Widgets */}
        <FearGreedIndex />
        {user && <QuickTradeWidget />}
        {user && <RealtimeWatchlistWidget />}
        <TrendingStocks />
        <TopMoversLosers />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <NavLink to="/track-investments">
            <Button className="btn-primary h-11 w-full text-sm font-semibold gap-2">
              <TrendingUp className="h-4 w-4" /> Investments
            </Button>
          </NavLink>
          <NavLink to="/discover">
            <Button variant="outline" className="h-11 w-full text-sm font-semibold gap-2 rounded-2xl">
              <Search className="h-4 w-4" /> Discover
            </Button>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
