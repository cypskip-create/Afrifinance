import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePortfolio } from "@/hooks/usePortfolio";
import { AddTradeDialog } from "@/components/portfolio/AddTradeDialog";
import { RobinhoodPerformanceChart } from "@/components/portfolio/RobinhoodPerformanceChart";
import {
  Trash2, TrendingUp, TrendingDown, ArrowLeft, ArrowUpRight, ArrowDownRight,
  Eye, EyeOff, MoreHorizontal, Plus, RefreshCw, Share, ChevronDown, ChevronUp,
  Wallet, Target, Shield, FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SparklineChart } from "@/components/shared/SparklineChart";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const PRICES: Record<string, number> = {
  SAFCOM: 12.85, EQTY: 62.50, SCBK: 185.00, BAMB: 89.75, KCB: 45.30,
  COOP: 15.20, EABL: 142.00, ABSA: 13.85, NCBA: 42.50, BRIT: 6.85, KPLC: 1.95,
};

type SortKey = "value" | "gain" | "name";

export default function TrackInvestments() {
  const { portfolio, loading, removeFromPortfolio, addToPortfolio, refetch } = usePortfolio();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("value");
  const [sortAsc, setSortAsc] = useState(false);
  const [chartPeriod, setChartPeriod] = useState("1M");

  const getPrice = (symbol: string) => PRICES[symbol] || 50;

  const stats = useMemo(() => {
    let totalValue = 0, totalCost = 0;
    portfolio.forEach(h => {
      totalValue += getPrice(h.symbol) * h.shares;
      totalCost += h.avg_cost * h.shares;
    });
    const totalGain = totalValue - totalCost;
    const gainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    const todayGain = totalGain * 0.12;
    const todayPct = gainPct * 0.12;
    return { totalValue, totalCost, totalGain, gainPct, todayGain, todayPct };
  }, [portfolio]);

  const holdings = useMemo(() => {
    const items = portfolio.map(h => {
      const price = getPrice(h.symbol);
      const value = price * h.shares;
      const cost = h.avg_cost * h.shares;
      const gain = value - cost;
      const gainPct = cost > 0 ? (gain / cost) * 100 : 0;
      const weight = stats.totalValue > 0 ? (value / stats.totalValue) * 100 : 0;
      return { ...h, price, value, cost, gain, gainPct, weight };
    });
    items.sort((a, b) => {
      const mul = sortAsc ? 1 : -1;
      if (sortBy === "value") return (b.value - a.value) * mul;
      if (sortBy === "gain") return (b.gainPct - a.gainPct) * mul;
      return a.symbol.localeCompare(b.symbol) * mul;
    });
    return items;
  }, [portfolio, sortBy, sortAsc, stats.totalValue]);

  const sectorAlloc = useMemo(() => {
    const map: Record<string, number> = {};
    holdings.forEach(h => {
      const s = h.sector || "Other";
      map[s] = (map[s] || 0) + h.value;
    });
    const colors = ["bg-primary", "bg-accent", "bg-chart-3", "bg-chart-4", "bg-chart-5", "bg-muted-foreground"];
    return Object.entries(map)
      .map(([name, value], i) => ({ name, value, pct: stats.totalValue > 0 ? (value / stats.totalValue) * 100 : 0, color: colors[i % colors.length] }))
      .sort((a, b) => b.value - a.value);
  }, [holdings, stats.totalValue]);

  const topMovers = useMemo(() => {
    const sorted = [...holdings].sort((a, b) => Math.abs(b.gainPct) - Math.abs(a.gainPct));
    return sorted.slice(0, 3);
  }, [holdings]);

  const diversificationScore = useMemo(() => {
    if (holdings.length === 0) return 0;
    const sectorCount = new Set(holdings.map(h => h.sector || "Other")).size;
    const maxWeight = Math.max(...holdings.map(h => h.weight), 0);
    let score = Math.min(10, sectorCount * 2);
    if (maxWeight > 50) score -= 2;
    else if (maxWeight > 30) score -= 1;
    return Math.max(1, Math.min(10, score));
  }, [holdings]);

  const handleDelete = async (id: string) => {
    const result = await removeFromPortfolio(id);
    if (result.error) toast({ title: "Error", description: "Failed to remove", variant: "destructive" });
    else toast({ title: "Removed", description: "Investment removed" });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortAsc(!sortAsc);
    else { setSortBy(key); setSortAsc(false); }
  };

  const SortIcon = ({ field }: { field: SortKey }) => {
    if (sortBy !== field) return null;
    return sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-b from-card to-card/95 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full h-9 w-9 hover:bg-muted/50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">My Portfolio</h1>
              <p className="text-[10px] text-muted-foreground">{holdings.length} holdings · Last updated now</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className={`rounded-full h-9 w-9 ${isRefreshing ? 'animate-spin' : ''}`} onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <AddTradeDialog onTradeAdded={addToPortfolio} />
          </div>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-5">
        {/* ── HERO ── */}
        <Card className="border-0 bg-gradient-to-br from-primary/10 via-card to-accent/5 overflow-hidden rounded-3xl shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Portfolio Value</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-background/50" onClick={() => setShowBalance(!showBalance)}>
                  {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-background/50">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <h2 className="text-4xl font-extrabold tracking-tight">
              {showBalance ? `KES ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
            </h2>

            <div className="flex items-center gap-3 mt-2">
              <span className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${stats.totalGain >= 0 ? 'bg-bull/15 text-bull' : 'bg-bear/15 text-bear'}`}>
                {stats.totalGain >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {showBalance ? `${stats.totalGain >= 0 ? '+' : ''}KES ${Math.abs(stats.totalGain).toFixed(2)}` : '••••'}
                <span className="text-xs ml-1">({stats.gainPct >= 0 ? '+' : ''}{stats.gainPct.toFixed(1)}%)</span>
              </span>
              <Badge variant="secondary" className="text-[10px] rounded-full bg-primary/10 text-primary border-0 font-semibold">All time</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="bg-background/70 backdrop-blur-sm rounded-2xl p-3.5 border border-border/20">
                <p className="text-[10px] text-muted-foreground font-medium mb-1">Today's P/L</p>
                <p className={`text-base font-bold ${stats.todayGain >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {showBalance ? `${stats.todayGain >= 0 ? '+' : ''}KES ${Math.abs(stats.todayGain).toFixed(2)}` : '••••'}
                </p>
                <p className={`text-[10px] font-medium ${stats.todayPct >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {stats.todayPct >= 0 ? '+' : ''}{stats.todayPct.toFixed(1)}%
                </p>
              </div>
              <div className="bg-background/70 backdrop-blur-sm rounded-2xl p-3.5 border border-border/20">
                <p className="text-[10px] text-muted-foreground font-medium mb-1">Total Invested</p>
                <p className="text-base font-bold">
                  {showBalance ? `KES ${stats.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••'}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium">{holdings.length} stocks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── PERFORMANCE CHART ── */}
        <div>
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto scrollbar-hide">
            {["1D", "5D", "1M", "3M", "6M", "1Y", "All"].map(p => (
              <Button
                key={p}
                variant={chartPeriod === p ? "default" : "outline"}
                size="sm"
                className={`text-xs rounded-full h-7 px-3 ${chartPeriod === p ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => setChartPeriod(p)}
              >
                {p}
              </Button>
            ))}
          </div>
          <Card className="soft-card overflow-hidden">
            <RobinhoodPerformanceChart currentValue={stats.totalValue} initialValue={stats.totalCost} />
          </Card>
        </div>

        {/* ── ALLOCATION ── */}
        {sectorAlloc.length > 0 && (
          <div>
            <h3 className="text-sm font-bold mb-3">Asset Allocation</h3>
            <Card className="soft-card p-4">
              {/* Bar-style allocation */}
              <div className="flex h-3 rounded-full overflow-hidden mb-4">
                {sectorAlloc.map(s => (
                  <div key={s.name} className={`${s.color} transition-all`} style={{ width: `${s.pct}%` }} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sectorAlloc.map(s => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                    <span className="text-xs text-muted-foreground flex-1">{s.name}</span>
                    <span className="text-xs font-semibold">{s.pct.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── HOLDINGS ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold">Holdings ({holdings.length})</h3>
            <div className="flex gap-1">
              {([["name", "A-Z"], ["value", "Value"], ["gain", "P/L"]] as [SortKey, string][]).map(([key, label]) => (
                <Button key={key} variant="ghost" size="sm" className={`text-xs h-7 rounded-full px-2.5 ${sortBy === key ? 'bg-primary/10 text-primary' : ''}`} onClick={() => toggleSort(key)}>
                  {label} <SortIcon field={key} />
                </Button>
              ))}
            </div>
          </div>

          {holdings.length === 0 ? (
            <Card className="soft-card border-dashed border-2 border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Start Building</h3>
                <p className="text-sm text-muted-foreground mb-4">Add your first investment to track.</p>
                <AddTradeDialog onTradeAdded={addToPortfolio} />
              </CardContent>
            </Card>
          ) : (
            <Card className="soft-card overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-1 py-2 px-4 border-b border-border/50 bg-muted/30 text-xs font-semibold text-muted-foreground">
                <span className="col-span-4">Stock</span>
                <span className="col-span-2 text-right">Shares</span>
                <span className="col-span-3 text-right">Value</span>
                <span className="col-span-3 text-right">P/L</span>
              </div>
              <div className="divide-y divide-border/30">
                {holdings.map(h => (
                  <div key={h.id} className="grid grid-cols-12 gap-1 items-center py-3 px-4 cursor-pointer active:bg-muted/30 transition-colors group" onClick={() => navigate(`/stock/${h.symbol}`)}>
                    <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {h.symbol.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{h.symbol}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{h.name}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-xs font-semibold">{h.shares}</p>
                      <p className="text-[10px] text-muted-foreground">@{h.avg_cost.toFixed(2)}</p>
                    </div>
                    <div className="col-span-3 text-right">
                      <p className="text-xs font-bold">{showBalance ? `KES ${h.value.toFixed(0)}` : '••••'}</p>
                      <SparklineChart isPositive={h.gain >= 0} width={40} height={14} />
                    </div>
                    <div className="col-span-3 flex items-center justify-end gap-1">
                      <div className="text-right">
                        <p className={`text-xs font-bold ${h.gain >= 0 ? 'text-bull' : 'text-bear'}`}>
                          {h.gain >= 0 ? '+' : ''}{h.gainPct.toFixed(1)}%
                        </p>
                        <p className={`text-[10px] ${h.gain >= 0 ? 'text-bull' : 'text-bear'}`}>
                          {showBalance ? `${h.gain >= 0 ? '+' : ''}${h.gain.toFixed(0)}` : '••'}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); navigate(`/stock/${h.symbol}`); }}>View Stock</DropdownMenuItem>
                          <DropdownMenuItem>Set Alert</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation(); handleDelete(h.id); }}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* ── INSIGHTS ── */}
        {holdings.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {/* Top Movers */}
            <Card className="soft-card p-4">
              <h4 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                Portfolio Movers
              </h4>
              <div className="space-y-2">
                {topMovers.map(m => (
                  <div key={m.id} className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{m.symbol}</span>
                    <span className={`text-xs font-bold ${m.gain >= 0 ? 'text-bull' : 'text-bear'}`}>
                      {m.gain >= 0 ? '+' : ''}{m.gainPct.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Diversification */}
            <Card className="soft-card p-4">
              <h4 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-primary" />
                Diversification
              </h4>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{diversificationScore}/10</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {diversificationScore >= 7 ? 'Well Balanced' : diversificationScore >= 4 ? 'Moderate' : 'Concentrated'}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Floating Trade Button */}
        <div className="fixed bottom-24 right-4 z-30">
          <Button className="h-12 px-5 rounded-full bg-primary text-primary-foreground shadow-primary font-semibold gap-2">
            <Wallet className="h-4 w-4" />
            Trade
          </Button>
        </div>
      </div>
    </div>
  );
}
