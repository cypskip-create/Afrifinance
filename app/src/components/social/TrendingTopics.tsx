import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";

const trendingTopics = [
  { tag: "#NSEMarkets", posts: 234, trend: "+15%" },
  { tag: "#SAFCOM", posts: 189, trend: "+22%" },
  { tag: "#BankingStocks", posts: 156, trend: "+8%" },
  { tag: "#DividendInvesting", posts: 134, trend: "+12%" },
  { tag: "#KenyaEconomy", posts: 98, trend: "+5%" },
];

const trendingStocks = [
  { symbol: "EQTY", name: "Equity Group", change: "+13.2%" },
  { symbol: "SAFCOM", name: "Safaricom", change: "+1.2%" },
  { symbol: "KCB", name: "KCB Group", change: "+3.5%" },
  { symbol: "COOP", name: "Co-op Bank", change: "+2.1%" },
];

export function TrendingTopics() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Trending Stocks */}
      <Card className="card-gradient">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-bull" />
            Trending Stocks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {trendingStocks.map((stock) => (
            <div 
              key={stock.symbol}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
              onClick={() => navigate(`/stock/${stock.symbol}`)}
            >
              <div>
                <p className="font-medium text-sm">${stock.symbol}</p>
                <p className="text-xs text-muted-foreground">{stock.name}</p>
              </div>
              <Badge variant="secondary" className="text-bull bg-bull/10">
                {stock.change}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card className="card-gradient">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Hash className="h-4 w-4 text-primary" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {trendingTopics.map((topic, index) => (
            <div 
              key={topic.tag}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                <div>
                  <p className="font-medium text-sm text-primary">{topic.tag}</p>
                  <p className="text-xs text-muted-foreground">{topic.posts} posts</p>
                </div>
              </div>
              <span className="text-xs text-bull">{topic.trend}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
