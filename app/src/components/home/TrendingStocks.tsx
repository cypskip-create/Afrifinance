import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame, Eye, ArrowUpRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SparklineChart } from "@/components/shared/SparklineChart";
import { getStockName, getPrice, getDayChange, getStockFundamentals } from "@/lib/stockPrices";

// Only the editorial part — which stocks are "trending" and why — is curated
// here. Price, change, and volume all come from the canonical data in
// data/nseSecurities.ts (via stockPrices.ts) at render time, not hardcoded,
// so this widget can never show a stale/wrong number for a real ticker.
const TRENDING_PICKS: { symbol: string; reason: string; mentions: number }[] = [
  { symbol: "SCOM", reason: "M-Pesa expansion news", mentions: 1250 },
  { symbol: "EQTY", reason: "Strong Q4 earnings", mentions: 890 },
  { symbol: "KCB", reason: "Regional expansion", mentions: 654 },
  { symbol: "PORT", reason: "Infrastructure deals", mentions: 432 },
];

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

/** A short illustrative sparkline that actually ends at the real current price —
 *  there's no real intraday history in the data layer yet, so this is a stand-in
 *  shape, not real historical data, but at least it's honest about where it ends up. */
function buildSparkline(price: number, changePct: number): number[] {
  const start = changePct !== 0 ? price / (1 + changePct / 100) : price;
  return Array.from({ length: 8 }, (_, i) => +(start + ((price - start) * i) / 7).toFixed(2));
}

export function TrendingStocks() {
  const navigate = useNavigate();

  const stocks: TrendingStock[] = useMemo(
    () =>
      TRENDING_PICKS.map((pick) => {
        const price = getPrice(pick.symbol);
        const { pct } = getDayChange(pick.symbol);
        return {
          symbol: pick.symbol,
          name: getStockName(pick.symbol),
          price,
          change: +pct.toFixed(2),
          volume: getStockFundamentals(pick.symbol).volume,
          mentions: pick.mentions,
          sparkline: buildSparkline(price, pct),
          reason: pick.reason,
        };
      }),
    []
  );

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
        {stocks.map((stock, index) => (
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