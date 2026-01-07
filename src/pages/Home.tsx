import { MorningBrief } from "@/components/home/MorningBrief";
import { TopMoversLosers } from "@/components/home/TopMoversLosers";
import { WatchlistSummary } from "@/components/home/WatchlistSummary";
import { CurrencyConverter } from "@/components/home/CurrencyConverter";
import { StockHeatmap } from "@/components/home/StockHeatmap";
import { StockScreener } from "@/components/markets/StockScreener";
import { TopBar } from "@/components/shared/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Search, TrendingUp, LogIn, Zap } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { getTimeBasedGreeting } from "@/utils/timeGreeting";

export default function Home() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { greeting } = getTimeBasedGreeting();
  
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Investor';

  const nseIndices = [
    { name: "NSE 20", value: "1,847.23", change: 1.2, isUp: true },
    { name: "NSE 25", value: "3,542.87", change: 0.8, isUp: true },
    { name: "All Share", value: "112.45", change: -0.3, isUp: false },
    { name: "FTSE Kenya", value: "1,234.56", change: 2.1, isUp: true },
    { name: "Growth", value: "987.32", change: -1.5, isUp: false },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title={user ? "AfriFinance" : "Welcome to AfriFinance"} 
        subtitle={user ? `${greeting}, ${firstName}` : "Your smart investment companion"}
        showSearch={true}
        showNotifications={true}
      />
      
      {!user && (
        <div className="p-4 animate-fade-in">
          <Card className="card-gradient border-primary/20 overflow-hidden">
            <CardContent className="p-6 text-center relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <LogIn className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Get Started Today</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Track your portfolio, create watchlists, and access powerful investment tools.
              </p>
              <Button 
                className="btn-primary w-full h-11" 
                onClick={() => navigate('/auth')}
              >
                Sign Up / Login
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="p-4 space-y-5">
        {/* Morning Brief */}
        <div className="animate-fade-in">
          <MorningBrief />
        </div>
        
        {/* NSE Indices Marquee */}
        <div className="animate-fade-in">
          <h3 className="text-base font-semibold mb-3 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>NSE Indices</span>
          </h3>
          <div className="overflow-hidden -mx-4">
            <div className="marquee-container group">
              <div className="marquee-content">
                {[...nseIndices, ...nseIndices].map((fund, idx) => (
                  <div
                    key={`${fund.name}-${idx}`}
                    className="flex-shrink-0 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-200 min-w-[130px] tap-scale mx-1.5"
                  >
                    <div className="text-xs font-medium text-muted-foreground mb-1">{fund.name}</div>
                    <div className="text-base font-bold mb-0.5">{fund.value}</div>
                    <div className={`text-xs flex items-center space-x-1 ${fund.isUp ? 'text-bull' : 'text-bear'}`}>
                      <span>{fund.isUp ? '↑' : '↓'}</span>
                      <span>{fund.isUp ? '+' : ''}{fund.change}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Top Movers & Watchlist */}
        <div className="space-y-5 stagger-children">
          <TopMoversLosers />
          <WatchlistSummary />
        </div>
        
        {/* Currency Converter */}
        <div className="animate-fade-in">
          <CurrencyConverter />
        </div>
        
        {/* Market Heat Index - Modern Treemap */}
        <div className="animate-fade-in">
          <Card className="card-gradient">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center space-x-2">
                <Zap className="h-4 w-4 text-accent" />
                <span>Market Pulse</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StockHeatmap />
            </CardContent>
          </Card>
        </div>
        
        {/* Stock Screener */}
        <div className="animate-fade-in">
          <StockScreener />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          <NavLink to="/track-investments">
            <Button className="btn-primary h-12 w-full text-sm font-medium flex items-center justify-center space-x-2">
              <PieChart className="h-4 w-4" />
              <span>Investments</span>
            </Button>
          </NavLink>
          <NavLink to="/discover">
            <Button variant="outline" className="h-12 w-full text-sm font-medium flex items-center justify-center space-x-2 tap-scale">
              <Search className="h-4 w-4" />
              <span>Discover</span>
            </Button>
          </NavLink>
        </div>
      </div>
    </div>
  );
}