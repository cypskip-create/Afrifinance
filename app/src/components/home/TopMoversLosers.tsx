import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { CANONICAL_SYMBOLS, getStockName, getPrice, getDayChange } from "@/lib/stockPrices";

interface MoverRow { symbol: string; name: string; price: number; change: number; isUp: boolean; }

/** Real gainers/losers, computed from the canonical price data (data/nseSecurities.ts)
 *  instead of two hand-picked lists that would otherwise go stale the moment prices move. */
function computeMovers(): { gainers: MoverRow[]; losers: MoverRow[] } {
  const rows: MoverRow[] = CANONICAL_SYMBOLS.map((symbol) => {
    const price = getPrice(symbol);
    const { pct } = getDayChange(symbol);
    return { symbol, name: getStockName(symbol), price, change: +pct.toFixed(1), isUp: pct >= 0 };
  });
  const sorted = [...rows].sort((a, b) => b.change - a.change);
  return { gainers: sorted.slice(0, 5), losers: sorted.slice(-5).reverse() };
}

export function TopMoversLosers() {
  const navigate = useNavigate();
  const { gainers, losers } = useMemo(computeMovers, []);

  const StockList = ({ stocks }: { stocks: MoverRow[] }) => (
    <div className="space-y-3">
      {stocks.map((stock) => (
        <div
          key={stock.symbol}
          onClick={() => navigate(`/stock/${stock.symbol}`)}
          className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
        >
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-foreground">{stock.symbol}</span>
              <span className="text-xs text-muted-foreground">{stock.name}</span>
            </div>
            <div className="text-sm font-medium">KES {stock.price.toFixed(2)}</div>
          </div>
          
          <div className={`flex items-center space-x-1 ${stock.isUp ? 'text-bull' : 'text-bear'}`}>
            {stock.isUp ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
            <span className="font-medium text-sm">
              {stock.isUp ? '+' : ''}{stock.change}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="card-gradient">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Market Movers</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="movers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="movers" className="text-xs sm:text-sm">
              <ArrowUp className="h-3 w-3 mr-1" />
              Top Gainers
            </TabsTrigger>
            <TabsTrigger value="losers" className="text-xs sm:text-sm">
              <ArrowDown className="h-3 w-3 mr-1" />
              Top Losers
            </TabsTrigger>
          </TabsList>
          <TabsContent value="movers">
            <StockList stocks={gainers} />
          </TabsContent>
          <TabsContent value="losers">
            <StockList stocks={losers} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}