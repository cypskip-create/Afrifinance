import { MorningBrief } from "@/components/home/MorningBrief";
import { TopMovers } from "@/components/home/TopMovers";
import { WatchlistSummary } from "@/components/home/WatchlistSummary";
import { CurrencyConverter } from "@/components/home/CurrencyConverter";
import { TopBar } from "@/components/shared/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Bot, Search, TrendingUp } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Enhanced Header */}
      <TopBar 
        title="AfriFinance" 
        subtitle="Good morning, Investor"
        showSearch={true}
        showAI={true}
        showNotifications={true}
      />

      {/* Main content */}
      <div className="p-4 space-y-6">
        {/* Morning Brief */}
        <MorningBrief />
        
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
              <span>AI Assistant</span>
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