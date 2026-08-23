import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame, Eye, ArrowUpRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SparklineChart } from "@/components/shared/SparklineChart";

interface TrendingStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  mentions: number;
  sparkline: number[];
  reason: string;
}

const TRENDING_STOCKS: TrendingStock[] = [
  {
    symbol: 'SAFCOM',
    name: 'Safaricom PLC',
    price: 12.85,
    change: 4.52,
    volume: '45.2M',
    mentions: 1250,
    sparkline: [10, 11, 10.5, 11.5, 12, 11.8, 12.5, 12.85],
    reason: 'M-Pesa expansion news'
  },
  {
    symbol: 'EQTY',
    name: 'Equity Group',
    price: 62.50,
    change: 2.89,
    volume: '12.8M',
    mentions: 890,
    sparkline: [58, 59, 60, 59.5, 61, 62, 61.5, 62.5],
    reason: 'Strong Q4 earnings'
  },
  {
    symbol: 'KCB',
    name: 'KCB Group',
    price: 45.30,
    change: -1.24,
    volume: '8.5M',
    mentions: 654,
    sparkline: [47, 46.5, 46, 45.8, 45.5, 45.2, 45.4, 45.3],
    reason: 'Regional expansion'
  },
  {
    symbol: 'PORT',
    name: 'East African Portland Cement',
    price: 116.50,
    change: -2.51,
    volume: '3.4K',
    mentions: 432,
    sparkline: [122, 121, 120.5, 119.5, 118, 117.5, 117, 116.5],
    reason: 'Infrastructure deals'
  },
];

export function TrendingStocks() {
  const navigate = useNavigate();

  return (
    <Card className="card-gradient">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Trending Now
          </CardTitle>
          <Badge variant="secondary" className="text-xs gap-1">
            <Zap className="h-3 w-3" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {TRENDING_STOCKS.map((stock, index) => (
          <div
            key={stock.symbol}
            onClick={() => navigate(`/stock/${stock.symbol}`)}
            className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer border border-transparent hover:border-primary/20 group"
          >
            <div className="flex items-center gap-3">
              {/* Rank */}
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>

              {/* Stock Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{stock.symbol}</span>
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
              </div>

              {/* Sparkline */}
              <div className="w-16 h-8">
                <SparklineChart 
                  data={stock.sparkline} 
                  isPositive={stock.change >= 0}
                />
              </div>

              {/* Price & Change */}
              <div className="text-right">
                <p className="text-sm font-semibold">KES {stock.price.toFixed(2)}</p>
                <p className={`text-xs font-medium ${stock.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change}%
                </p>
              </div>
            </div>

            {/* Trending reason & stats */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30 text-xs">
              <span className="text-muted-foreground truncate max-w-[60%]">
                {stock.reason}
              </span>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {stock.mentions}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stock.volume}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}