import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Search, X, Star, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/hooks/use-toast";
import { getPrice, getDayChange } from "@/lib/stockPrices";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { useInstruments } from "@/hooks/useInstruments";
import { SparklineChart } from "@/components/shared/SparklineChart";

export default function Watchlist() {
  const navigate = useNavigate();
  const { watchlist, loading, removeFromWatchlist, addToWatchlist, isInWatchlist } = useWatchlist();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState("");

  const watchlistSymbols = useMemo(() => watchlist.map((item) => item.symbol), [watchlist]);
  const { quotes } = useLiveQuotes(watchlistSymbols);
  const { instruments } = useInstruments();

  const rows = useMemo(() => {
    return watchlist.map(item => {
      const quote = quotes[item.symbol.toUpperCase()];
      // Live AfriFinance Data Layer quote when this symbol is in its
      // current universe; otherwise fall back to the static reference
      // price so a stock not covered yet still renders sensibly.
      const price = quote?.lastPrice ?? getPrice(item.symbol);
      const abs = quote?.change ?? getDayChange(item.symbol).abs;
      const pct = quote?.changePercent ?? getDayChange(item.symbol).pct;
      return { ...item, price, change: abs, changePercent: pct, isUp: abs >= 0, isLive: !!quote };
    });
  }, [watchlist, quotes]);

  const gainers = rows.filter(r => r.isUp).length;
  const losers = rows.length - gainers;

  const searchResults = useMemo(() => {
    if (!query.trim()) return instruments;
    const q = query.trim().toLowerCase();
    return instruments.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }, [query, instruments]);

  const handleAdd = async (symbol: string, name: string) => {
    const result = await addToWatchlist(symbol, name);
    if (result?.error) {
      toast({ title: result.error.message === "Stock already in watchlist" ? "Already in your watchlist" : "Couldn't add stock", variant: "destructive" });
    } else {
      toast({ title: `${symbol} added to watchlist` });
    }
  };

  const handleRemove = async (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await removeFromWatchlist(symbol);
    toast(result?.error
      ? { title: "Couldn't remove from watchlist", variant: "destructive" }
      : { title: `Removed ${symbol} from watchlist` });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9 rounded-full tap-scale">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-base font-bold leading-tight">Watchlist</h1>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {rows.length} {rows.length === 1 ? "stock" : "stocks"}
                {rows.length > 0 && <> · <span className="text-bull font-medium">{gainers} up</span> · <span className="text-bear font-medium">{losers} down</span></>}
              </p>
            </div>
          </div>
          <Button size="icon" className="h-9 w-9 rounded-full" onClick={() => setAddOpen(true)}>
            <Plus className="h-4.5 w-4.5" />
          </Button>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center px-8 py-24">
          <Star className="h-11 w-11 mb-4 text-muted-foreground/40" />
          <h3 className="font-semibold text-[15px] mb-1">Your watchlist is empty</h3>
          <p className="text-[13px] text-muted-foreground mb-5 max-w-[240px]">Add stocks you're tracking to keep an eye on their price right here.</p>
          <Button className="rounded-full" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Add a stock
          </Button>
        </div>
      ) : (
        <div>
          {rows.map(stock => (
            <button
              key={stock.symbol}
              onClick={() => navigate(`/stock/${stock.symbol}`)}
              data-small-target
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-border/40 text-left active:bg-muted/30 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-bold leading-tight">{stock.symbol}</p>
                <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">{stock.name}</p>
              </div>

              <SparklineChart width={52} height={22} isPositive={stock.isUp} />

              <div className="text-right shrink-0 w-[92px]">
                <p className="text-[13.5px] font-bold tabular-nums leading-tight">KES {stock.price.toFixed(2)}</p>
                <div className={`flex items-center justify-end gap-0.5 mt-0.5 ${stock.isUp ? "text-bull" : "text-bear"}`}>
                  {stock.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span className="text-[11px] font-semibold tabular-nums">{stock.isUp ? "+" : ""}{stock.changePercent.toFixed(2)}%</span>
                </div>
              </div>

              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={e => handleRemove(stock.symbol, e)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </button>
          ))}
        </div>
      )}

      {/* Add to watchlist */}
      <Dialog open={addOpen} onOpenChange={v => { setAddOpen(v); if (!v) setQuery(""); }}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Add to watchlist</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search ticker or company name"
              className="h-10 pl-10 pr-9 rounded-full text-[13.5px]"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="max-h-[50vh] overflow-y-auto -mx-1 px-1">
            {searchResults.length === 0 ? (
              <p className="text-[13px] text-muted-foreground text-center py-8">No matching stocks</p>
            ) : searchResults.map(s => {
              const already = isInWatchlist(s.symbol);
              return (
                <div key={s.symbol} className="flex items-center justify-between gap-3 py-2.5 border-b border-border/40 last:border-0">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold">{s.symbol}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{s.name}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={already ? "outline" : "default"}
                    className="h-8 rounded-full text-[12px] shrink-0"
                    disabled={already}
                    onClick={() => handleAdd(s.symbol, s.name)}
                  >
                    {already ? "Added" : "Add"}
                  </Button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}