import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart, TrendingUp, Bell, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StockPriceChart } from "@/components/stock/StockPriceChart";
import { BuySharesDialog } from "@/components/stock/BuySharesDialog";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function StockDetail() {
  const navigate = useNavigate();
  const { symbol } = useParams();
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { toast } = useToast();

  const stockInfo = {
    SAFCOM: { name: "Safaricom PLC", price: 12.85, change: 0.15, changePercent: "+1.18%", isUp: true, exchange: "NSE", sector: "Telecommunications" },
    EQTY: { name: "Equity Group Holdings", price: 62.50, change: 7.25, changePercent: "+13.12%", isUp: true, exchange: "NSE", sector: "Banking" },
    SCBK: { name: "Standard Chartered", price: 185.00, change: 5.70, changePercent: "+5.70%", isUp: true, exchange: "NSE", sector: "Banking" },
  }[symbol || 'SAFCOM'] || { name: "Safaricom PLC", price: 12.85, change: 0.15, changePercent: "+1.18%", isUp: true, exchange: "NSE", sector: "Telecommunications" };

  const handleWatchlistToggle = async () => {
    if (!symbol) return;
    
    const isCurrentlyWatchlisted = isInWatchlist(symbol);
    
    if (isCurrentlyWatchlisted) {
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
    } else {
      const result = await addToWatchlist(symbol, stockInfo.name);
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Added to watchlist",
        });
      }
    }
  };

  const timeframes = ["1D", "5D", "1M", "3M", "6M", "1Y", "ALL"];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="text-center flex items-center space-x-2">
            <span className="font-bold">{symbol}</span>
            <span className="text-muted-foreground">KES {stockInfo.price.toFixed(2)}</span>
            <span className={stockInfo.isUp ? 'text-bull' : 'text-bear'}>
              {stockInfo.changePercent}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleWatchlistToggle}
              className="bg-primary/10 rounded-full"
            >
              <Heart className={`h-5 w-5 ${isInWatchlist(symbol || '') ? 'fill-primary text-primary' : 'text-primary'}`} />
            </Button>
            <Button variant="ghost" size="icon" className="bg-blue-500/10 rounded-full">
              <Newspaper className="h-5 w-5 text-blue-500" />
            </Button>
            <Button variant="ghost" size="icon" className="bg-orange-500/10 rounded-full">
              <Bell className="h-5 w-5 text-orange-500" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Stock Header */}
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold">{symbol}</h1>
            <p className="text-muted-foreground">{stockInfo.name}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">{stockInfo.exchange}</Badge>
            <Badge variant="outline" className="text-xs">{stockInfo.sector}</Badge>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Market Open • Updated just now
          </div>
          
          <div className="text-4xl font-bold">
            KES {stockInfo.price.toFixed(2)}
          </div>
          <div className={`text-lg font-medium flex items-center space-x-1 ${stockInfo.isUp ? 'text-bull' : 'text-bear'}`}>
            <span>{stockInfo.isUp ? '+' : ''}{stockInfo.change.toFixed(2)} ({stockInfo.changePercent})</span>
          </div>
        </div>
        
        {/* Market Data Collapsible */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/20 rounded-lg">
            <span className="font-medium">Market Data</span>
            <span className="text-xs text-muted-foreground">▼</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            {/* Market data content can be added here */}
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <BuySharesDialog symbol={symbol || ''} name={stockInfo.name} price={stockInfo.price}>
            <Button className="h-14 flex-col py-2 bg-primary hover:bg-primary/90 w-full">
              <TrendingUp className="h-5 w-5 mb-1" />
              <span className="text-sm font-medium">Buy</span>
            </Button>
          </BuySharesDialog>
          <Button variant="outline" className="h-14 flex-col py-2">
            <Bell className="h-5 w-5 mb-1" />
            <span className="text-sm">Alerts</span>
          </Button>
          <Button variant="outline" className="h-14 flex-col py-2">
            <Newspaper className="h-5 w-5 mb-1" />
            <span className="text-sm">News</span>
          </Button>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex space-x-1">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant={tf === selectedTimeframe ? "default" : "ghost"}
              size="sm"
              className={`h-9 px-3 text-xs flex-1 ${tf === selectedTimeframe ? 'bg-primary hover:bg-primary/90' : ''}`}
              onClick={() => setSelectedTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>

        {/* Chart */}
        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="h-64">
              <StockPriceChart symbol={symbol} timeframe={selectedTimeframe} />
            </div>
            <div className="text-center text-sm text-muted-foreground mt-2">
              Chart for {selectedTimeframe} timeframe
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
