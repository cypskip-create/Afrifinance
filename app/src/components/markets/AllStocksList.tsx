import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown, Filter, ChevronDown, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SparklineChart } from "@/components/shared/SparklineChart";
import { CANONICAL_SYMBOLS, STOCK_META, getPrice, getDayChange } from "@/lib/stockPrices";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Derived from the shared price source (canonical symbols only, so a company with two
// ticker aliases — e.g. Diamond Trust Bank, Stanbic — never appears twice) — this list can
// never disagree with what Home, Portfolio, Watchlist or a stock's own detail page show.
const allStocks = CANONICAL_SYMBOLS
  .map(symbol => {
    const { abs, pct } = getDayChange(symbol);
    return {
      symbol,
      name: STOCK_META[symbol].name,
      sector: STOCK_META[symbol].sector,
      price: getPrice(symbol),
      change: pct,
      isUp: abs >= 0,
    };
  });

const sectors = ["All Sectors", ...Array.from(new Set(allStocks.map(s => s.sector))).sort()];

interface AllStocksListProps {
  /** Pre-applied sector filter, e.g. from tapping a sector card elsewhere on Markets. */
  initialSector?: string;
  /** Restrict the list to just these symbols, e.g. for a "Featured list" drill-down. */
  onlySymbols?: string[];
}

export function AllStocksList({ initialSector, onlySymbols }: AllStocksListProps = {}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState(initialSector || "All Sectors");
  const [sortBy, setSortBy] = useState<"name" | "change" | "price">("name");
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { toast } = useToast();

  useEffect(() => { if (initialSector) setSelectedSector(initialSector); }, [initialSector]);

  const baseStocks = useMemo(
    () => onlySymbols ? allStocks.filter(s => onlySymbols.includes(s.symbol)) : allStocks,
    [onlySymbols]
  );

  const filteredStocks = useMemo(() => {
    let stocks = baseStocks.filter(stock => {
      const matchesSearch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           stock.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = selectedSector === "All Sectors" || stock.sector === selectedSector;
      return matchesSearch && matchesSector;
    });

    return stocks.sort((a, b) => {
      switch(sortBy) {
        case "change":
          return b.change - a.change;
        case "price":
          return b.price - a.price;
        default:
          return a.symbol.localeCompare(b.symbol);
      }
    });
  }, [baseStocks, searchQuery, selectedSector, sortBy]);

  // Infinite scroll: reveal 20 more each time sentinel enters view
  const PAGE = 20;
  const [visible, setVisible] = useState(PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setVisible(PAGE); }, [searchQuery, selectedSector, sortBy]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) {
        setVisible(v => Math.min(filteredStocks.length, v + PAGE));
      }
    }, { rootMargin: "300px" });
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [filteredStocks.length]);

  const toggleFavorite = async (symbol: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWatchlist(symbol)) {
      await removeFromWatchlist(symbol);
      toast({ title: "Removed from watchlist" });
    } else {
      const { error } = await addToWatchlist(symbol, name) || {};
      if (!error) toast({ title: "Added to watchlist" });
    }
  };

  return (
    <Card className="card-gradient">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>All Stocks ({filteredStocks.length})</span>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  {selectedSector === "All Sectors" ? "Sector" : selectedSector}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {sectors.map(sector => (
                  <DropdownMenuItem key={sector} onClick={() => setSelectedSector(sector)}>
                    {sector}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  Sort
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("name")}>Name A-Z</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("change")}>Top Gainers</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price")}>Highest Price</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stocks List — infinite scroll */}
        <div className="space-y-2">
          {filteredStocks.slice(0, visible).map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => navigate(`/stock/${stock.symbol}`)}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => toggleFavorite(stock.symbol, stock.name, e)}
                >
                  <Star className={`h-4 w-4 ${isInWatchlist(stock.symbol) ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{stock.symbol}</span>
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      {stock.sector}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{stock.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <SparklineChart isPositive={stock.isUp} width={50} height={20} />
                <div className="text-right min-w-[70px]">
                  <div className="text-sm font-medium">KES {stock.price.toFixed(2)}</div>
                  <div className={`flex items-center justify-end text-xs ${stock.isUp ? 'text-bull' : 'text-bear'}`}>
                    {stock.isUp ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                    {stock.isUp ? '+' : ''}{stock.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredStocks.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No stocks match this filter</p>
          )}
          {visible < filteredStocks.length && (
            <div ref={sentinelRef} className="py-4 text-center text-xs text-muted-foreground">
              Loading more…
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}