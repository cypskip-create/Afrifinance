import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePortfolio } from "@/hooks/usePortfolio";
import { AddInvestmentDialog } from "@/components/portfolio/AddInvestmentDialog";
import { RobinhoodPerformanceChart } from "@/components/portfolio/RobinhoodPerformanceChart";
import { PortfolioSnowflake } from "@/components/portfolio/PortfolioSnowflake";
import {
  Trash2, TrendingUp, ArrowLeft, ArrowUpRight, ArrowDownRight,
  Eye, EyeOff, MoreHorizontal, Plus, RefreshCw, ChevronDown, ChevronUp,
  Wallet, Target, Shield, Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SparklineChart } from "@/components/shared/SparklineChart";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const PRICES: Record<string, number> = {
  SAFCOM: 17.85, EQTY: 48.50, SCBK: 215.75, BAMB: 38.95, KCB: 38.20,
  COOP: 16.45, EABL: 165.50, ABSA: 17.10, NCBA: 49.85, BRIT: 5.42, KPLC: 4.18,
};

type SortKey = "value" | "gain" | "name";

export default function TrackInvestments() {
  const { portfolio, loading, removeFromPortfolio, refetch } = usePortfolio();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("value");
  const [sortAsc, setSortAsc] = useState(false);
  const [chartPeriod, setChartPeriod] = useState("1M");
  const [chartMode, setChartMode] = useState<"value" | "performance">("value");

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
      {/* Header */}
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
            <AddInvestmentDialog size="sm" />
          </div>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-5">
        {/* ── HERO ── */}
        <Card className="border-0 bg-gradient-to-br from-primary/10 via-card to-accent/5 overflow-hidden rounded-3xl shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Portfolio Value</span>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-background/50" onClick={() => setShowBalance(!showBalance)}>
                {showBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </Button>
            </div>

            <h2 className="text-[22px] font-bold tracking-tight leading-none">
              {showBalance ? `KES ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
            </h2>

            <div className="flex items-center gap-2 mt-2">
              <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${stats.totalGain >= 0 ? 'bg-bull/15 text-bull' : 'bg-bear/15 text-bear'}`}>
                {stats.totalGain >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {showBalance ? `${stats.totalGain >= 0 ? '+' : ''}KES ${Math.abs(stats.totalGain).toFixed(2)}` : '••••'}
                <span className="text-[9px] ml-0.5 opacity-80">({stats.gainPct >= 0 ? '+' : ''}{stats.gainPct.toFixed(1)}%)</span>
              </span>
              <Badge variant="secondary" className="text-[9px] rounded-full bg-primary/10 text-primary border-0 font-semibold">All time</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <div className="bg-background/70 backdrop-blur-sm rounded-2xl p-3 border border-border/20">
                <p className="text-[9px] text-muted-foreground font-medium mb-0.5">Today's P/L</p>
                <p className={`text-xs font-semibold ${stats.todayGain >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {showBalance ? `${stats.todayGain >= 0 ? '+' : ''}KES ${Math.abs(stats.todayGain).toFixed(2)}` : '••••'}
                </p>
                <p className={`text-[9px] font-medium ${stats.todayPct >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {stats.todayPct >= 0 ? '+' : ''}{stats.todayPct.toFixed(1)}%
                </p>
              </div>
              <div className="bg-background/70 backdrop-blur-sm rounded-2xl p-3 border border-border/20">
                <p className="text-[9px] text-muted-foreground font-medium mb-0.5">Total Invested</p>
                <p className="text-xs font-semibold">
                  {showBalance ? `KES ${stats.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••'}
                </p>
                <p className="text-[9px] text-muted-foreground font-medium">{holdings.length} stocks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── PORTFOLIO HEALTH (Snowflake + IRR) ── */}
        <PortfolioSnowflake
          holdings={holdings}
          totalValue={stats.totalValue}
          totalCost={stats.totalCost}
          gainPct={stats.gainPct}
        />

        {/* ── PERFORMANCE CHART ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Performance
            </h3>
            {/* Value / Performance toggle */}
            <div className="flex items-center bg-muted/40 rounded-full p-0.5">
              <Button
                variant="ghost"
                size="sm"
                className={`text-[10px] rounded-full h-6 px-3 font-semibold ${chartMode === 'value' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => setChartMode('value')}
              >
                Value
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`text-[10px] rounded-full h-6 px-3 font-semibold ${chartMode === 'performance' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => setChartMode('performance')}
              >
                Performance
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-1 mb-3 bg-muted/30 p-1 rounded-full">
            {["1D", "5D", "1M", "3M", "6M", "1Y", "All"].map(p => (
              <Button
                key={p}
                variant="ghost"
                size="sm"
                className={`text-xs rounded-full h-7 px-3 flex-1 ${chartPeriod === p ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setChartPeriod(p)}
              >
                {p}
              </Button>
            ))}
          </div>
          <Card className="border-0 rounded-2xl overflow-hidden shadow-sm">
            <RobinhoodPerformanceChart
              currentValue={chartMode === 'value' ? stats.totalValue : stats.gainPct}
              initialValue={chartMode === 'value' ? stats.totalCost : 0}
              mode={chartMode}
            />
          </Card>
        </div>

        {/* ── ALLOCATION ── */}
        {sectorAlloc.length > 0 && (
          <div>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              Asset Allocation
            </h3>
            <Card className="border-0 rounded-2xl p-4 shadow-sm">
              <div className="flex h-4 rounded-full overflow-hidden mb-4 shadow-inner">
                {sectorAlloc.map(s => (
                  <div key={s.name} className={`${s.color} transition-all duration-500`} style={{ width: `${s.pct}%` }} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {sectorAlloc.map(s => (
                  <div key={s.name} className="flex items-center gap-2 bg-muted/30 rounded-xl p-2">
                    <div className={`w-3 h-3 rounded-full ${s.color}`} />
                    <span className="text-xs text-muted-foreground flex-1">{s.name}</span>
                    <span className="text-xs font-bold">{s.pct.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── HOLDINGS ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Holdings ({holdings.length})
            </h3>
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
                <AddInvestmentDialog />
              </CardContent>
            </Card>
          ) : (
            <Card className="soft-card overflow-hidden">
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
            <Card className="border-0 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-card to-muted/20">
              <h4 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                Portfolio Movers
              </h4>
              <div className="space-y-2.5">
                {topMovers.map(m => (
                  <div key={m.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-2">
                    <span className="text-xs font-bold">{m.symbol}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.gain >= 0 ? 'bg-bull/10 text-bull' : 'bg-bear/10 text-bear'}`}>
                      {m.gain >= 0 ? '+' : ''}{m.gainPct.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-0 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-card to-muted/20">
              <h4 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-primary" />
                Diversification
              </h4>
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray={`${diversificationScore * 10}, 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-extrabold text-primary">{diversificationScore}</span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-muted-foreground">
                  {diversificationScore >= 7 ? '🟢 Well Balanced' : diversificationScore >= 4 ? '🟡 Moderate' : '🔴 Concentrated'}
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
