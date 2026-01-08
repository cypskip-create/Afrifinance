import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ArrowRightLeft, TrendingUp, TrendingDown, Search, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface QuickStock {
  symbol: string;
  price: number;
  change: number;
}

const QUICK_STOCKS: QuickStock[] = [
  { symbol: 'SAFCOM', price: 12.85, change: 4.52 },
  { symbol: 'EQTY', price: 62.50, change: 2.89 },
  { symbol: 'KCB', price: 45.30, change: -1.24 },
  { symbol: 'SCBK', price: 185.00, change: 1.15 },
];

export function QuickTradeWidget() {
  const [selectedStock, setSelectedStock] = useState<QuickStock | null>(null);
  const [amount, setAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const navigate = useNavigate();

  const handleQuickTrade = () => {
    if (!selectedStock || !amount) {
      toast.error('Please select a stock and enter amount');
      return;
    }
    
    const shares = parseFloat(amount) / selectedStock.price;
    toast.success(
      `${tradeType === 'buy' ? 'Buy' : 'Sell'} order placed for ${shares.toFixed(2)} shares of ${selectedStock.symbol}`,
      {
        description: `Total: KES ${parseFloat(amount).toLocaleString()}`,
        action: {
          label: 'View Portfolio',
          onClick: () => navigate('/track-investments'),
        },
      }
    );
    setAmount('');
    setSelectedStock(null);
  };

  return (
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
              <p className="text-xs text-muted-foreground">Execute trades instantly</p>
            </div>
          </div>

          {/* Trade Type Toggle */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={tradeType === 'buy' ? 'default' : 'outline'}
              className={`flex-1 h-9 ${tradeType === 'buy' ? 'bg-bull hover:bg-bull/90 text-white' : ''}`}
              onClick={() => setTradeType('buy')}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Buy
            </Button>
            <Button
              variant={tradeType === 'sell' ? 'default' : 'outline'}
              className={`flex-1 h-9 ${tradeType === 'sell' ? 'bg-bear hover:bg-bear/90 text-white' : ''}`}
              onClick={() => setTradeType('sell')}
            >
              <TrendingDown className="h-4 w-4 mr-1" />
              Sell
            </Button>
          </div>

          {/* Quick Stock Selection */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {QUICK_STOCKS.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => setSelectedStock(stock)}
                className={`p-2 rounded-lg text-center transition-all ${
                  selectedStock?.symbol === stock.symbol
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 hover:bg-muted'
                }`}
              >
                <p className="text-xs font-semibold">{stock.symbol}</p>
                <p className={`text-xs ${stock.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change}%
                </p>
              </button>
            ))}
          </div>

          {/* Amount Input */}
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              KES
            </span>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-12 h-11"
            />
            {selectedStock && amount && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ≈ {(parseFloat(amount) / selectedStock.price).toFixed(2)} shares
              </span>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[1000, 5000, 10000, 50000].map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => setAmount(quickAmount.toString())}
              >
                {quickAmount >= 1000 ? `${quickAmount / 1000}K` : quickAmount}
              </Button>
            ))}
          </div>

          {/* Trade Button */}
          <Button
            onClick={handleQuickTrade}
            className={`w-full h-11 font-semibold ${
              tradeType === 'buy' 
                ? 'bg-bull hover:bg-bull/90' 
                : 'bg-bear hover:bg-bear/90'
            } text-white`}
            disabled={!selectedStock || !amount}
          >
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedStock?.symbol || 'Stock'}
          </Button>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center mt-3">
            Market orders execute at current price. Terms apply.
          </p>
        </CardContent>
      </div>
    </Card>
  );
}
