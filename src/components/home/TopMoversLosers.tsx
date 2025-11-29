import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

const movers = [
  { symbol: "EQTY", name: "Equity Group", price: 62.50, change: 8.2, isUp: true },
  { symbol: "SCBK", name: "Standard Chartered", price: 185.00, change: 5.7, isUp: true },
  { symbol: "SAFCOM", name: "Safaricom", price: 12.85, change: 4.1, isUp: true },
  { symbol: "KCB", name: "KCB Bank", price: 45.30, change: 3.8, isUp: true },
  { symbol: "COOP", name: "Co-operative Bank", price: 15.20, change: 2.9, isUp: true },
];

const losers = [
  { symbol: "BAMB", name: "Bamburi Cement", price: 89.75, change: -3.2, isUp: false },
  { symbol: "KENGEN", name: "KenGen", price: 3.45, change: -2.8, isUp: false },
  { symbol: "EABL", name: "East African Breweries", price: 156.00, change: -2.1, isUp: false },
  { symbol: "DTB", name: "Diamond Trust Bank", price: 67.50, change: -1.8, isUp: false },
  { symbol: "BRIT", name: "Britam Holdings", price: 8.90, change: -1.5, isUp: false },
];

export function TopMoversLosers() {
  const navigate = useNavigate();

  const StockList = ({ stocks }: { stocks: typeof movers }) => (
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
            <StockList stocks={movers} />
          </TabsContent>
          <TabsContent value="losers">
            <StockList stocks={losers} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}