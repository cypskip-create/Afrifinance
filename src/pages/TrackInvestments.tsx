import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { usePortfolio } from "@/hooks/usePortfolio";
import { AddInvestmentDialog } from "@/components/portfolio/AddInvestmentDialog";
import { RobinhoodPerformanceChart } from "@/components/portfolio/RobinhoodPerformanceChart";
import { PortfolioSnowflake } from "@/components/portfolio/PortfolioSnowflake";
import { PortfolioInsights } from "@/components/portfolio/PortfolioInsights";
import {
  ArrowUpRight, ArrowDownRight, Eye, EyeOff, RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

import { getPrice as getSharedPrice, computePortfolioStats } from "@/lib/stockPrices";
import { HoldingsList } from "@/components/portfolio/HoldingsList";

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

  const getPrice = (symbol: string) => getSharedPrice(symbol);

  const stats = useMemo(() => computePortfolioStats(portfolio), [portfolio]);

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
    <div className="page-canvas min-h-screen bg-background pb-24">
      {/* Header — thin, editorial (no back button) */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-base font-semibold">Portfolio</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className={`rounded-full h-9 w-9 ${isRefreshing ? 'animate-spin' : ''}`} onClick={handleRefresh} data-small-target>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setShowBalance(!showBalance)} data-small-target>
              {showBalance ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 pt-6 space-y-8">
        {/* ── HERO — canvas, no card ── */}
        <div>
          <p className="section-eyebrow">Total Value</p>
          <h2 className="mt-1 text-[40px] leading-none font-semibold tabular tracking-tight">
            {showBalance
              ? `KES ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '••••••'}
          </h2>
          <div className="mt-2 flex items-center gap-2 text-sm tabular">
            <span className={`inline-flex items-center gap-0.5 font-semibold ${stats.totalGain >= 0 ? 'text-bull' : 'text-bear'}`}>
              {stats.totalGain >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {showBalance && (
                <>{stats.totalGain >= 0 ? '+' : '−'}KES {Math.abs(stats.totalGain).toFixed(2)} </>
              )}
              <span className="opacity-80 ml-1">({stats.gainPct >= 0 ? '+' : ''}{stats.gainPct.toFixed(2)}%)</span>
            </span>
            <span className="text-muted-foreground text-xs">All time</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 hairline-t pt-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Today</p>
              <p className={`mt-0.5 text-sm font-semibold tabular ${stats.todayGain >= 0 ? 'text-bull' : 'text-bear'}`}>
                {showBalance ? `${stats.todayGain >= 0 ? '+' : '−'}${Math.abs(stats.todayGain).toFixed(0)}` : '••'}
              </p>
              <p className={`text-[10px] tabular ${stats.todayPct >= 0 ? 'text-bull' : 'text-bear'}`}>{stats.todayPct >= 0 ? '+' : ''}{stats.todayPct.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Invested</p>
              <p className="mt-0.5 text-sm font-semibold tabular">{showBalance ? `KES ${stats.totalCost.toFixed(0)}` : '••'}</p>
              <p className="text-[10px] text-muted-foreground">{holdings.length} stocks</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Diversif.</p>
              <p className="mt-0.5 text-sm font-semibold tabular">{diversificationScore}/10</p>
              <p className="text-[10px] text-muted-foreground">{sectorAlloc.length} sectors</p>
            </div>
          </div>
        </div>

        {/* ── PERFORMANCE CHART — Robinhood-clean, no side prices ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 bg-muted/50 rounded-full p-0.5">
              <button
                data-small-target
                className={`text-[10px] rounded-full h-6 px-3 font-semibold transition-colors ${chartMode === 'value' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => setChartMode('value')}
              >Value</button>
              <button
                data-small-target
                className={`text-[10px] rounded-full h-6 px-3 font-semibold transition-colors ${chartMode === 'performance' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => setChartMode('performance')}
              >Performance</button>
            </div>
          </div>
          <div className="-mx-4">
            <RobinhoodPerformanceChart
              currentValue={chartMode === 'value' ? stats.totalValue : stats.gainPct}
              initialValue={chartMode === 'value' ? stats.totalCost : 0}
              mode={chartMode}
              hideValue={!showBalance}
              seed={holdings.map(h => h.symbol).join(',')}
            />
          </div>
        </div>

        {/* ── PORTFOLIO HEALTH ── */}
        <PortfolioSnowflake
          holdings={holdings}
          totalValue={stats.totalValue}
          totalCost={stats.totalCost}
          gainPct={stats.gainPct}
        />

        <PortfolioInsights holdings={portfolio} prices={Object.fromEntries(portfolio.map(h => [h.symbol, getPrice(h.symbol)]))} />

        {/* ── ALLOCATION ── */}
        {sectorAlloc.length > 0 && (
          <div>
            <p className="section-eyebrow">Asset allocation</p>
            <div className="mt-3 flex h-2 rounded-full overflow-hidden bg-muted">
              {sectorAlloc.map(s => (
                <div key={s.name} className={s.color} style={{ width: `${s.pct}%` }} />
              ))}
            </div>
            <div className="mt-3">
              {sectorAlloc.map(s => (
                <div key={s.name} className="flex items-center gap-2.5 py-2.5 border-b border-border/50 last:border-0">
                  <span className={`w-2 h-2 rounded-full ${s.color}`} />
                  <span className="text-[12px] flex-1 truncate">{s.name}</span>
                  <span className="text-[11px] text-muted-foreground tabular">
                    {showBalance ? `KES ${s.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '••••'}
                  </span>
                  <span className="text-[12px] font-semibold tabular w-14 text-right">{s.pct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HOLDINGS ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-eyebrow">Holdings · {holdings.length}</p>
            <div className="flex gap-1">
              {([["name", "A–Z"], ["value", "Value"], ["gain", "P/L"]] as [SortKey, string][]).map(([key, label]) => (
                <button
                  key={key}
                  data-small-target
                  className={`text-[10px] font-semibold px-2.5 h-6 rounded-full transition-colors ${sortBy === key ? 'bg-foreground text-background' : 'text-muted-foreground'}`}
                  onClick={() => toggleSort(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {holdings.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold">No positions yet</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Add your first investment to start tracking.</p>
              <AddInvestmentDialog />
            </div>
          ) : (
            <HoldingsList holdings={holdings} showValues={showBalance} onRemove={handleDelete} />
          )}
        </div>

        {/* ── INSIGHTS ── */}
        {holdings.length > 0 && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="section-eyebrow">Portfolio movers</p>
              <div className="mt-2">
                {topMovers.map(m => (
                  <div key={m.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-[12px] font-semibold">{m.symbol}</span>
                    <span className={`text-[12px] font-semibold tabular ${m.gain >= 0 ? 'text-bull' : 'text-bear'}`}>
                      {m.gain >= 0 ? '+' : ''}{m.gainPct.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="section-eyebrow">Diversification</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-[28px] leading-none font-semibold tabular">{diversificationScore}</span>
                <span className="text-[11px] text-muted-foreground">/10</span>
              </div>
              <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-foreground/70" style={{ width: `${diversificationScore * 10}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                {diversificationScore >= 7 ? 'Well balanced across sectors' : diversificationScore >= 4 ? 'Moderately diversified' : 'Concentrated — consider spreading risk'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
