import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SparklineChart } from "@/components/shared/SparklineChart";

interface QuickStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

const QUICK_STOCKS: QuickStock[] = [
  { symbol: 'SAFCOM', name: 'Safaricom PLC', price: 17.85, change: 1.42 },
  { symbol: 'EQTY', name: 'Equity Group', price: 48.50, change: 2.89 },
  { symbol: 'KCB', name: 'KCB Group', price: 38.20, change: -1.24 },
  { symbol: 'SCBK', name: 'StanChart Kenya', price: 215.75, change: 1.15 },
  { symbol: 'EABL', name: 'EABL', price: 165.50, change: 0.85 },
  { symbol: 'COOP', name: 'Co-op Bank', price: 16.45, change: 2.10 },
  { symbol: 'ABSA', name: 'Absa Bank', price: 17.10, change: -0.55 },
  { symbol: 'NCBA', name: 'NCBA Group', price: 49.85, change: 1.78 },
  { symbol: 'BAMB', name: 'Bamburi Cement', price: 38.95, change: -0.92 },
  { symbol: 'BRIT', name: 'Britam', price: 5.42, change: 3.21 },
  { symbol: 'KPLC', name: 'Kenya Power', price: 4.18, change: -2.05 },
];

export function QuickTradeWidget() {
  const navigate = useNavigate();
  const loop = [...QUICK_STOCKS, ...QUICK_STOCKS];

  return (
    <Card className="card-gradient overflow-hidden">
      <div className="relative">
        <CardContent className="p-0 relative">
          <div className="marquee-container -mx-0">
            <div className="marquee-content gap-2">
              {loop.map((stock, i) => (
                <button
                  key={`${stock.symbol}-${i}`}

                  onClick={() => navigate(`/stock/${stock.symbol}`)}
                  className="shrink-0 w-[140px] p-3 rounded-xl bg-muted/50 hover:bg-muted text-left transition-all active:scale-[0.97] tap-scale"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold">${stock.symbol}</p>
                    <SparklineChart isPositive={stock.change >= 0} width={32} height={14} />
                  </div>
                  <p className="text-sm font-bold tabular-nums">KES {stock.price.toFixed(2)}</p>
                  <p className={`text-[10px] font-semibold flex items-center gap-0.5 ${stock.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {stock.change >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </p>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
