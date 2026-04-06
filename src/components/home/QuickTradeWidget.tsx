import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TradeSheet } from "@/components/trade/TradeSheet";
import { SparklineChart } from "@/components/shared/SparklineChart";

interface QuickStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

const QUICK_STOCKS: QuickStock[] = [
  { symbol: 'SAFCOM', name: 'Safaricom PLC', price: 12.85, change: 4.52 },
  { symbol: 'EQTY', name: 'Equity Group', price: 62.50, change: 2.89 },
  { symbol: 'KCB', name: 'KCB Group', price: 45.30, change: -1.24 },
  { symbol: 'SCBK', name: 'StanChart Kenya', price: 185.00, change: 1.15 },
];

export function QuickTradeWidget() {
  const [tradeOpen, setTradeOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<QuickStock | null>(null);
  const navigate = useNavigate();

  const handleTrade = (stock: QuickStock) => {
    setSelectedStock(stock);
    setTradeOpen(true);
  };

  return (
    <>
      <Card className="card-gradient overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/20">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Quick Trade</h3>
                <p className="text-xs text-muted-foreground">Tap any stock to trade</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {QUICK_STOCKS.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleTrade(stock)}
                  className="p-3 rounded-xl bg-muted/50 hover:bg-muted text-left transition-all active:scale-[0.97] tap-scale"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold">${stock.symbol}</p>
                    <SparklineChart isPositive={stock.change >= 0} width={32} height={14} />
                  </div>
                  <p className="text-sm font-bold">KES {stock.price}</p>
                  <p className={`text-[10px] font-semibold flex items-center gap-0.5 ${stock.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {stock.change >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </div>
      </Card>

      {selectedStock && (
        <TradeSheet
          open={tradeOpen}
          onOpenChange={setTradeOpen}
          symbol={selectedStock.symbol}
          stockName={selectedStock.name}
          currentPrice={selectedStock.price}
          isUp={selectedStock.change >= 0}
          changePercent={Math.abs(selectedStock.change).toFixed(2)}
        />
      )}
    </>
  );
}
