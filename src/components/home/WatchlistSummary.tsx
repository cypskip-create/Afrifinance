import { Eye, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WatchlistSummary() {
  return (
    <Card className="card-gradient">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">My Watchlist</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-bull/10 border border-bull/20">
            <div className="flex items-center justify-center space-x-1 text-bull mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Today</span>
            </div>
            <div className="text-lg font-bold text-bull">+KES 2,450</div>
            <div className="text-xs text-bull/80">+3.2%</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-center space-x-1 text-primary mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <div className="text-lg font-bold text-primary">+KES 18,320</div>
            <div className="text-xs text-primary/80">+12.7%</div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <button className="text-sm text-primary hover:text-primary/80 font-medium">
            View Full Watchlist →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}