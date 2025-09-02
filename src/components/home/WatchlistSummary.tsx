import { Heart, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function WatchlistSummary() {
  const navigate = useNavigate();

  const watchlistStocks = [
    { symbol: "SAFCOM", price: "12.85", change: 1.18, isUp: true },
    { symbol: "EQTY", price: "62.50", change: 13.12, isUp: true },
    { symbol: "KCB", price: "45.20", change: -2.79, isUp: false }
  ];

  return (
    <Card className="card-gradient">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">My Watchlist</CardTitle>
          </div>
          <button 
            onClick={() => navigate('/watchlist')}
            className="text-xs text-primary hover:text-primary/80"
          >
            View All
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-bull/10 border border-bull/20">
            <div className="flex items-center justify-center space-x-1 text-bull mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Today</span>
            </div>
            <div className="text-lg font-bold text-bull">+KES 2,450</div>
            <div className="text-xs text-bull/80">+3.2%</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-center space-x-1 text-primary mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <div className="text-lg font-bold text-primary">+KES 18,320</div>
            <div className="text-xs text-primary/80">+12.7%</div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          {watchlistStocks.slice(0, 3).map((stock) => (
            <div 
              key={stock.symbol}
              onClick={() => navigate(`/stock/${stock.symbol}`)}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <span className="text-xs font-medium">{stock.symbol}</span>
              <div className="text-right">
                <div className="text-xs font-medium">KES {stock.price}</div>
                <div className={`text-xs ${stock.isUp ? 'text-bull' : 'text-bear'}`}>
                  {stock.isUp ? '+' : ''}{stock.change}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}