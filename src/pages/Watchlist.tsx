import { Heart, TrendingUp, TrendingDown, Plus, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/shared/TopBar";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/hooks/use-toast";

export default function Watchlist() {
  const navigate = useNavigate();
  const { watchlist, loading, removeFromWatchlist } = useWatchlist();
  const { toast } = useToast();

  // Mock current prices for demonstration
  const currentPrices = {
    "SAFCOM": { price: 12.85, change: 0.15, changePercent: 1.18, isUp: true },
    "EQTY": { price: 62.50, change: 7.25, changePercent: 13.12, isUp: true },
    "KCB": { price: 45.20, change: -1.30, changePercent: -2.79, isUp: false },
    "COOP": { price: 13.40, change: 0.20, changePercent: 1.52, isUp: true },
  };

  const watchlistStocks = watchlist.map(item => {
    const priceData = currentPrices[item.symbol as keyof typeof currentPrices] || {
      price: 10.00,
      change: 0,
      changePercent: 0,
      isUp: true
    };
    
    return {
      symbol: item.symbol,
      name: item.name,
      price: priceData.price.toString(),
      change: priceData.change.toString(),
      changePercent: priceData.changePercent.toString(),
      isUp: priceData.isUp
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading watchlist...</p>
        </div>
      </div>
    );
  }

  const handleStockClick = (symbol: string) => {
    navigate(`/stock/${symbol}`);
  };

  const handleRemoveFromWatchlist = async (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await removeFromWatchlist(symbol);
    if (result?.error) {
      toast({
        title: "Error",
        description: "Failed to remove from watchlist",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Removed from watchlist",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold">My Watchlist</h1>
            <p className="text-sm text-muted-foreground">Track your favorite stocks</p>
          </div>
          <div className="w-9"></div>
        </div>
      </header>

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