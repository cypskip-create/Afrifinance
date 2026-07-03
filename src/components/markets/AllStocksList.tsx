import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown, Filter, ChevronDown, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SparklineChart } from "@/components/shared/SparklineChart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const allStocks = [
  { symbol: "SAFCOM", name: "Safaricom PLC", price: 12.85, change: 1.18, isUp: true, sector: "Telecommunications", marketCap: "515.2B" },
  { symbol: "EQTY", name: "Equity Group", price: 62.50, change: 13.12, isUp: true, sector: "Banking", marketCap: "237.3B" },
  { symbol: "KCB", name: "KCB Group", price: 45.20, change: 0.85, isUp: true, sector: "Banking", marketCap: "145.2B" },
  { symbol: "SCBK", name: "Standard Chartered", price: 168.50, change: -0.9, isUp: false, sector: "Banking", marketCap: "89.4B" },
  { symbol: "BAMB", name: "Bamburi Cement", price: 85.30, change: -2.4, isUp: false, sector: "Construction", marketCap: "30.8B" },
  { symbol: "EABL", name: "EABL", price: 142.00, change: -1.8, isUp: false, sector: "Manufacturing", marketCap: "112.5B" },
  { symbol: "COOP", name: "Co-operative Bank", price: 15.50, change: 2.3, isUp: true, sector: "Banking", marketCap: "91.2B" },
  { symbol: "DTB", name: "Diamond Trust Bank", price: 58.75, change: 1.5, isUp: true, sector: "Banking", marketCap: "16.4B" },
  { symbol: "ABSA", name: "ABSA Bank Kenya", price: 14.20, change: -0.7, isUp: false, sector: "Banking", marketCap: "77.1B" },
  { symbol: "NCBA", name: "NCBA Group", price: 42.30, change: 3.2, isUp: true, sector: "Banking", marketCap: "71.5B" },
  { symbol: "BRIT", name: "Britam Holdings", price: 5.45, change: 0.9, isUp: true, sector: "Insurance", marketCap: "13.8B" },
  { symbol: "CARBACID", name: "Carbacid Investments", price: 11.85, change: -1.2, isUp: false, sector: "Manufacturing", marketCap: "3.0B" },
  { symbol: "BAT", name: "BAT Kenya", price: 345.00, change: 0.8, isUp: true, sector: "Manufacturing", marketCap: "34.5B" },
  { symbol: "TOTL", name: "TotalEnergies", price: 22.50, change: -4.1, isUp: false, sector: "Energy", marketCap: "8.1B" },
  { symbol: "ARM", name: "ARM Cement", price: 4.25, change: 3.3, isUp: true, sector: "Construction", marketCap: "2.8B" },
  { symbol: "SCOM", name: "Standard Group", price: 18.90, change: 1.9, isUp: true, sector: "Media", marketCap: "1.5B" },
  { symbol: "NBK", name: "National Bank", price: 5.85, change: -0.5, isUp: false, sector: "Banking", marketCap: "6.3B" },
  { symbol: "KPLC", name: "Kenya Power", price: 1.82, change: 5.2, isUp: true, sector: "Energy", marketCap: "8.9B" },
  { symbol: "KEGN", name: "KenGen", price: 3.45, change: 2.1, isUp: true, sector: "Energy", marketCap: "22.6B" },
  { symbol: "UMEME", name: "Umeme Ltd", price: 8.90, change: -1.8, isUp: false, sector: "Energy", marketCap: "12.4B" },
  { symbol: "JUB", name: "Jubilee Holdings", price: 185.00, change: 0.5, isUp: true, sector: "Insurance", marketCap: "13.3B" },
  { symbol: "CIC", name: "CIC Insurance", price: 2.15, change: -2.3, isUp: false, sector: "Insurance", marketCap: "5.6B" },
  { symbol: "KENO", name: "Kenol Kobil", price: 12.40, change: 1.6, isUp: true, sector: "Energy", marketCap: "18.4B" },
  { symbol: "WTK", name: "Williamson Tea", price: 145.00, change: -0.3, isUp: false, sector: "Agriculture", marketCap: "4.2B" },
  { symbol: "KAKZ", name: "Kakuzi", price: 280.00, change: 4.5, isUp: true, sector: "Agriculture", marketCap: "5.5B" },
  { symbol: "SASN", name: "Sasini", price: 18.50, change: 2.8, isUp: true, sector: "Agriculture", marketCap: "4.0B" },
  { symbol: "EGAD", name: "Eaagads", price: 12.00, change: -1.5, isUp: false, sector: "Agriculture", marketCap: "0.9B" },
  { symbol: "TCL", name: "Trans-Century", price: 1.85, change: 8.8, isUp: true, sector: "Industrials", marketCap: "0.5B" },
  { symbol: "SAMR", name: "Sameer Africa", price: 3.20, change: -3.0, isUp: false, sector: "Industrials", marketCap: "0.8B" },
  { symbol: "NSE", name: "NSE PLC", price: 8.50, change: 1.2, isUp: true, sector: "Financial Services", marketCap: "2.2B" },
];

const sectors = ["All Sectors", "Banking", "Telecommunications", "Manufacturing", "Energy", "Insurance", "Construction", "Agriculture", "Industrials", "Media", "Financial Services"];

export function AllStocksList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All Sectors");
  const [sortBy, setSortBy] = useState<"name" | "change" | "price">("name");
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredStocks = useMemo(() => {
    let stocks = allStocks.filter(stock => {
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
  }, [searchQuery, selectedSector, sortBy]);

  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
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

        {/* Stocks List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {filteredStocks.map((stock) => (
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
                    onClick={(e) => toggleFavorite(stock.symbol, e)}
                  >
                    <Star className={`h-4 w-4 ${favorites.includes(stock.symbol) ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
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
                      {stock.isUp ? '+' : ''}{stock.change}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}