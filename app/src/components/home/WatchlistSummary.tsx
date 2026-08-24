import { useMemo } from "react";
import { Heart, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { getPrice, getDayChange } from "@/lib/stockPrices";

export function WatchlistSummary() {
  const navigate = useNavigate();
  const { watchlist, defaultFolderId, folders } = useWatchlist();

  const currentFolderId = defaultFolderId || folders[0]?.id;
  const folderItems = useMemo(
    () => watchlist.filter((item) => item.folder_id === currentFolderId),
    [watchlist, currentFolderId]
  );

  const symbols = useMemo(() => folderItems.map((item) => item.symbol), [folderItems]);
  const { quotes } = useLiveQuotes(symbols);

  const rows = useMemo(
    () =>
      folderItems.map((item) => {
        const quote = quotes[item.symbol.toUpperCase()];
        const price = quote?.lastPrice ?? getPrice(item.symbol);
        const pct = quote?.changePercent ?? getDayChange(item.symbol).pct;
        return { symbol: item.symbol, price, change: +pct.toFixed(2), isUp: pct >= 0 };
      }),
    [folderItems, quotes]
  );

  // Aggregate "today" move across the watchlist itself — a plain average of
  // %-change across whatever's actually in the folder, not a fabricated figure.
  const avgChangePct = rows.length ? rows.reduce((s, r) => s + r.change, 0) / rows.length : 0;

  return (
    <Card className="card-gradient">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">My Watchlist</CardTitle>
          </div>
          <button 
            onClick={() => navigate('/watchlist')}
            className="text-xs text-primary hover:text-primary/80"
          >
            View All
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">Your watchlist is empty</p>
            <button onClick={() => navigate('/watchlist')} className="text-xs text-primary hover:underline mt-1">
              Add a stock to watch
            </button>
          </div>
        ) : (
          <>
            <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-center space-x-1 text-primary mb-1">
                {avgChangePct >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="text-sm font-medium">Watchlist avg. today</span>
              </div>
              <div className={`text-lg font-bold ${avgChangePct >= 0 ? "text-bull" : "text-bear"}`}>
                {avgChangePct >= 0 ? "+" : ""}{avgChangePct.toFixed(2)}%
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {rows.slice(0, 3).map((stock) => (
                <div 
                  key={stock.symbol}
                  onClick={() => navigate(`/stock/${stock.symbol}`)}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <span className="text-xs font-medium">{stock.symbol}</span>
                  <div className="text-right">
                    <div className="text-xs font-medium">KES {stock.price.toFixed(2)}</div>
                    <div className={`text-xs ${stock.isUp ? 'text-bull' : 'text-bear'}`}>
                      {stock.isUp ? '+' : ''}{stock.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}