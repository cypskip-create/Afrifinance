import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StockPriceChart } from "@/components/stock/StockPriceChart";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, BarChart3, Clock } from "lucide-react";
import { useState } from "react";

interface CryptoData {
  name: string;
  symbol: string;
  price: string;
  change: number;
  isUp: boolean;
  marketCap?: string;
  volume24h?: string;
  high24h?: string;
  low24h?: string;
  supply?: string;
  rank?: number;
}

interface CryptoChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crypto: CryptoData | null;
}

const timeframes = ["1H", "1D", "1W", "1M", "1Y"];

export const CryptoChartDialog = ({ open, onOpenChange, crypto }: CryptoChartDialogProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");

  if (!crypto) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                {crypto.symbol.slice(0, 2)}
              </div>
              <div>
                <div className="font-bold text-lg">{crypto.name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  {crypto.symbol}
                  {crypto.rank && (
                    <span className="bg-muted px-1.5 py-0.5 rounded text-xs">
                      #{crypto.rank}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Price */}
        <div className="mt-2">
          <div className="text-2xl font-bold">{crypto.price}</div>
          <div className={`flex items-center space-x-1 ${crypto.isUp ? 'text-bull' : 'text-bear'}`}>
            {crypto.isUp ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="font-medium">{crypto.isUp ? '+' : ''}{crypto.change}%</span>
            <span className="text-muted-foreground text-sm">24h</span>
          </div>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex justify-center gap-1 mt-2">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant={selectedTimeframe === tf ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setSelectedTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>

        {/* Chart */}
        <div className="h-48 mt-2">
          <StockPriceChart symbol={crypto.symbol} timeframe={selectedTimeframe} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {crypto.marketCap && (
            <div className="bg-muted/20 rounded-lg p-3">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                Market Cap
              </div>
              <div className="font-semibold">{crypto.marketCap}</div>
            </div>
          )}
          
          {crypto.volume24h && (
            <div className="bg-muted/20 rounded-lg p-3">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                24h Volume
              </div>
              <div className="font-semibold">{crypto.volume24h}</div>
            </div>
          )}
          
          {crypto.high24h && (
            <div className="bg-muted/20 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">24h High</div>
              <div className="font-semibold text-bull">{crypto.high24h}</div>
            </div>
          )}
          
          {crypto.low24h && (
            <div className="bg-muted/20 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">24h Low</div>
              <div className="font-semibold text-bear">{crypto.low24h}</div>
            </div>
          )}
          
          {crypto.supply && (
            <div className="bg-muted/20 rounded-lg p-3 col-span-2">
              <div className="text-xs text-muted-foreground">Circulating Supply</div>
              <div className="font-semibold">{crypto.supply}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
