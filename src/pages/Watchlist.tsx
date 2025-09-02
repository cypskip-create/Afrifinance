import { Heart, TrendingUp, TrendingDown, Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/shared/TopBar";
import { useNavigate } from "react-router-dom";

export default function Watchlist() {
  const navigate = useNavigate();

  const watchlistStocks = [
    {
      symbol: "SAFCOM",
      name: "Safaricom PLC",
      price: "12.85",
      change: "0.15",
      changePercent: "1.18",
      isUp: true
    },
    {
      symbol: "EQTY", 
      name: "Equity Group Holdings",
      price: "62.50",
      change: "7.25",
      changePercent: "13.12",
      isUp: true
    },
    {
      symbol: "KCB",
      name: "KCB Group PLC",
      price: "45.20",
      change: "-1.30",
      changePercent: "-2.79",
      isUp: false
    },
    {
      symbol: "COOP",
      name: "Co-operative Bank",
      price: "13.40",
      change: "0.20",
      changePercent: "1.52",
      isUp: true
    }
  ];

  const handleStockClick = (symbol: string) => {
    navigate(`/stock/${symbol}`);
  };

  const handleRemoveFromWatchlist = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Add remove logic here
    console.log(`Removing ${symbol} from watchlist`);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <TopBar 
        title="My Watchlist" 
        subtitle="Track your favorite stocks"
        showSearch={true}
        showAI={true}
        showNotifications={true}
      />

      <div className="p-4 space-y-4">
        {/* Summary Stats */}
        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-bull">+KES 18,320</div>
                <div className="text-xs text-muted-foreground">Total Gain</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">4</div>
                <div className="text-xs text-muted-foreground">Stocks</div>
              </div>
              <div>
                <div className="text-lg font-bold text-bull">+12.7%</div>
                <div className="text-xs text-muted-foreground">Performance</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add to Watchlist */}
        <Card className="card-gradient">
          <CardContent className="p-4">
            <Button className="w-full btn-primary" onClick={() => navigate('/markets')}>
              <Plus className="h-4 w-4 mr-2" />
              Add More Stocks
            </Button>
          </CardContent>
        </Card>

        {/* Watchlist Items */}
        <div className="space-y-3">
          {watchlistStocks.map((stock) => (
            <Card 
              key={stock.symbol} 
              className="card-gradient cursor-pointer transition-all hover:scale-[1.02]"
              onClick={() => handleStockClick(stock.symbol)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-bold text-sm">{stock.symbol}</div>
                        <div className="text-xs text-muted-foreground">{stock.name}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-sm">KES {stock.price}</div>
                    <div className={`flex items-center space-x-1 justify-end ${stock.isUp ? 'text-bull' : 'text-bear'}`}>
                      {stock.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      <span className="text-xs font-medium">
                        {stock.isUp ? '+' : ''}KES {stock.change} ({stock.changePercent}%)
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-3 h-8 w-8 p-0"
                    onClick={(e) => handleRemoveFromWatchlist(stock.symbol, e)}
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State (when no stocks) */}
        {watchlistStocks.length === 0 && (
          <Card className="card-gradient">
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <div className="text-sm font-medium mb-2">Your watchlist is empty</div>
              <div className="text-xs text-muted-foreground mb-4">
                Add stocks to track their performance
              </div>
              <Button className="btn-primary" onClick={() => navigate('/markets')}>
                <Plus className="h-4 w-4 mr-2" />
                Browse Stocks
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}