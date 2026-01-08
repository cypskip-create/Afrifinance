import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, Calendar, TrendingUp, ChevronRight } from "lucide-react";

interface PortfolioItem {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avg_cost: number;
  sector?: string;
}

interface DividendTrackerProps {
  portfolio: PortfolioItem[];
}

// Mock dividend data - in real app, this would come from API
const DIVIDEND_DATA: { [key: string]: { yield: number; frequency: string; nextDate: string; amount: number } } = {
  SAFCOM: { yield: 5.2, frequency: 'Annual', nextDate: '2026-06-15', amount: 0.64 },
  EQTY: { yield: 4.8, frequency: 'Annual', nextDate: '2026-05-20', amount: 3.00 },
  SCBK: { yield: 3.5, frequency: 'Annual', nextDate: '2026-04-10', amount: 6.50 },
  BAMB: { yield: 2.1, frequency: 'Annual', nextDate: '2026-07-25', amount: 1.88 },
  KCB: { yield: 6.2, frequency: 'Annual', nextDate: '2026-03-30', amount: 2.81 },
  COOP: { yield: 4.1, frequency: 'Annual', nextDate: '2026-05-05', amount: 0.62 },
};

export function DividendTracker({ portfolio }: DividendTrackerProps) {
  // Calculate total expected dividends
  const dividendStats = portfolio.map(item => {
    const dividendInfo = DIVIDEND_DATA[item.symbol];
    if (!dividendInfo) return null;
    
    const annualDividend = dividendInfo.amount * item.shares;
    return {
      ...item,
      ...dividendInfo,
      annualDividend,
    };
  }).filter(Boolean);

  const totalAnnualDividends = dividendStats.reduce((sum, item) => sum + (item?.annualDividend || 0), 0);
  const avgYield = dividendStats.length > 0 
    ? dividendStats.reduce((sum, item) => sum + (item?.yield || 0), 0) / dividendStats.length 
    : 0;

  // Sort by next dividend date
  const upcomingDividends = [...dividendStats].sort((a, b) => {
    if (!a?.nextDate || !b?.nextDate) return 0;
    return new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime();
  });

  if (portfolio.length === 0) {
    return (
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            Dividend Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Banknote className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">Add investments to track dividends</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Dividend Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-full bg-bull/20">
                <Banknote className="h-4 w-4 text-bull" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Annual Dividends</p>
            <p className="text-xl font-bold text-bull">
              KES {totalAnnualDividends.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Expected income</p>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-full bg-primary/20">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Avg Dividend Yield</p>
            <p className="text-xl font-bold">{avgYield.toFixed(2)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Across holdings</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Dividends */}
      <Card className="card-gradient">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-primary" />
            Upcoming Dividends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingDividends.slice(0, 4).map((item) => {
            if (!item) return null;
            const daysUntil = Math.ceil((new Date(item.nextDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            
            return (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold">{item.symbol.slice(0, 2)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.symbol}</p>
                    <p className="text-xs text-muted-foreground">{item.shares} shares</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-bull">
                    +KES {item.annualDividend.toFixed(2)}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {daysUntil > 0 ? `${daysUntil}d` : 'Due'}
                  </Badge>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Dividend Yield by Stock */}
      <Card className="card-gradient">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Yield by Holding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dividendStats.map((item) => {
              if (!item) return null;
              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.symbol}</span>
                    <span className="text-muted-foreground">{item.yield}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-bull to-bull/60 rounded-full transition-all"
                      style={{ width: `${Math.min(100, item.yield * 10)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
