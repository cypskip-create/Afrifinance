import { MorningBrief } from "@/components/home/MorningBrief";
import { TopMovers } from "@/components/home/TopMovers";
import { WatchlistSummary } from "@/components/home/WatchlistSummary";
import { CurrencyConverter } from "@/components/home/CurrencyConverter";
import { TopBar } from "@/components/shared/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Bot, Search, TrendingUp, LogIn } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getTimeBasedGreeting } from "@/utils/timeGreeting";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { greeting } = getTimeBasedGreeting();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Enhanced Header */}
      <TopBar 
        title={user ? "AfriFinance" : "Welcome to AfriFinance"} 
        subtitle={user ? `${greeting}, Investor` : "Your smart investment companion"}
        showSearch={true}
        showAI={true}
        showNotifications={true}
      />
      
      {!user && (
        <div className="p-4">
          <Card className="card-gradient border-primary/20">
            <CardContent className="p-6 text-center">
              <LogIn className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Get Started Today</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sign up to track your portfolio, create watchlists, and access powerful investment tools.
              </p>
              <Button 
                className="btn-primary w-full" 
                onClick={() => navigate('/auth')}
              >
                Sign Up / Login
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main content */}
      <div className="p-4 space-y-6">
        {/* Morning Brief */}
        <MorningBrief />
        
        {/* NSE Fund Tracking */}
        <div className="card-gradient rounded-xl p-6 border border-primary/20">
          <h3 className="text-lg font-semibold mb-4 text-primary">NSE Fund Tracking</h3>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {[
              { name: "NSE 20 Index", value: "1,847.23", change: 1.2, isUp: true },
              { name: "NSE 25 Index", value: "3,542.87", change: 0.8, isUp: true },
              { name: "All Share Index", value: "112.45", change: -0.3, isUp: false },
              { name: "FTSE NSE Kenya 15", value: "1,234.56", change: 2.1, isUp: true },
              { name: "NSE Growth Index", value: "987.32", change: -1.5, isUp: false },
            ].map((fund, index) => (
              <div
                key={fund.name}
                className="flex-shrink-0 p-4 rounded-lg bg-muted/20 border border-primary/10 hover:bg-muted/30 transition-all duration-200 min-w-[160px]"
              >
                <div className="text-xs font-medium text-primary mb-1">{fund.name}</div>
                <div className="text-lg font-bold mb-1">{fund.value}</div>
                <div className={`text-xs flex items-center space-x-1 ${fund.isUp ? 'text-bull' : 'text-bear'}`}>
                  <span>{fund.isUp ? '↗' : '↘'}</span>
                  <span>{fund.isUp ? '+' : ''}{fund.change}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Grid of widgets */}
        <div className="grid gap-6">
          {/* Top movers and watchlist row */}
          <div className="grid lg:grid-cols-2 gap-6">
            <TopMovers />
            <WatchlistSummary />
          </div>
          
          {/* Currency converter */}
          <CurrencyConverter />
          
          {/* Market Heat Index placeholder */}
          <div className="card-gradient rounded-xl p-6 border border-primary/20">
            <h3 className="text-lg font-semibold mb-4 text-primary">Market Heat Index</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['SAFCOM', 'EQTY', 'SCBK', 'BAMB'].map((stock, index) => (
                <div
                  key={stock}
                  className={`p-3 rounded-lg text-center transition-all duration-200 hover:scale-105 ${
                    index % 2 === 0 ? 'bg-bull/20 border border-bull/30' : 'bg-bear/20 border border-bear/30'
                  }`}
                >
                  <div className="font-medium text-sm">{stock}</div>
                  <div className={`text-xs ${index % 2 === 0 ? 'text-bull' : 'text-bear'}`}>
                    {index % 2 === 0 ? '🔥 Hot' : '❄️ Cool'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick shortcuts */}
          <div className="grid grid-cols-3 gap-4">
            <NavLink to="/portfolio">
              <Button className="btn-primary h-12 w-full text-sm font-medium flex items-center space-x-2">
                <PieChart className="h-4 w-4" />
                <span>Portfolio</span>
              </Button>
            </NavLink>
            <Button className="btn-accent h-12 text-sm font-medium flex items-center space-x-2">
              <Bot className="h-4 w-4" />
            </Button>
            <NavLink to="/discover">
              <Button variant="outline" className="h-12 w-full text-sm font-medium flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Discover</span>
              </Button>
            </NavLink>
          </div>
        </div>

        {/* Bottom spacer for navigation */}
        <div className="h-4"></div>
      </div>
    </div>
  );
}