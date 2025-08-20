import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const movers = [
  { symbol: "EQTY", name: "Equity Group", price: 62.50, change: 8.2, isUp: true },
  { symbol: "SCBK", name: "Standard Chartered", price: 185.00, change: 5.7, isUp: true },
  { symbol: "SAFCOM", name: "Safaricom", price: 12.85, change: 4.1, isUp: true },
  { symbol: "BAMB", name: "Bamburi Cement", price: 89.75, change: -3.2, isUp: false },
  { symbol: "KENGEN", name: "KenGen", price: 3.45, change: -2.8, isUp: false },
];

export function TopMovers() {
  return (
    <Card className="card-gradient">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Top Movers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {movers.map((stock) => (
            <div
              key={stock.symbol}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
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
      </CardContent>
    </Card>
  );
}