import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StockPriceChart } from "@/components/stock/StockPriceChart";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

interface CryptoChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crypto: {
    name: string;
    symbol: string;
    price: string;
    change: number;
    isUp: boolean;
  } | null;
}

const timeframes = ["1D", "1W", "1M", "3M", "1Y", "5Y"];

export const CryptoChartDialog = ({ open, onOpenChange, crypto }: CryptoChartDialogProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");

  if (!crypto) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                {crypto.symbol.slice(0, 2)}
              </div>
              <div>
                <div className="font-bold">{crypto.name}</div>
                <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">{crypto.price}</div>
              <div className={`flex items-center space-x-1 text-sm ${crypto.isUp ? 'text-bull' : 'text-bear'}`}>
                {crypto.isUp ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{crypto.isUp ? '+' : ''}{crypto.change}%</span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Chart */}
        <div className="h-48 mt-4">
          <StockPriceChart symbol={crypto.symbol} timeframe={selectedTimeframe} />
        </div>

        {/* Timeframe Buttons */}
        <div className="flex justify-center gap-2 mt-4">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant={selectedTimeframe === tf ? "default" : "outline"}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setSelectedTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
