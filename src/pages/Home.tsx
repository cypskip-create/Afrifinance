import { MorningBrief } from "@/components/home/MorningBrief";
import { TopMovers } from "@/components/home/TopMovers";
import { WatchlistSummary } from "@/components/home/WatchlistSummary";
import { CurrencyConverter } from "@/components/home/CurrencyConverter";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-primary">StockHub Kenya</h1>
            <p className="text-sm text-muted-foreground">Good morning, Investor</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

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

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button className="btn-primary h-12 text-sm font-medium">
              + Add to Watchlist
            </Button>
            <Button className="btn-accent h-12 text-sm font-medium">
              📊 Screen Stocks
            </Button>
          </div>
        </div>

        {/* Bottom spacer for navigation */}
        <div className="h-4"></div>
      </div>
    </div>
  );
}