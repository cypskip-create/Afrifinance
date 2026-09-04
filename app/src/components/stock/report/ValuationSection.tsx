import { PieChart, Pie, Cell } from "recharts";
import { ReportSection, SubWidget } from "./ReportSection";
import { CriteriaChecklist } from "./CriteriaChecklist";
import { useValuation } from "@/hooks/useValuation";
import { useResearch } from "@/hooks/useResearch";
import { useSectorPeers } from "@/hooks/useSectorPeers";
import { useMarketBenchmark } from "@/hooks/useMarketBenchmark";

interface Props { symbol: string; name: string; sector: string; price: number; currency: string }

function FairValueBar({ price, fair, currency }: { price: number; fair: number; currency: string }) {
  const pct = ((fair - price) / price) * 100;
  const max = Math.max(price, fair) * 1.3;
  const priceX = (price / max) * 100;
  const fairX = (fair / max) * 100;
  return (
    <div>
      <p className={`text-2xl font-bold ${pct >= 0 ? "text-bull" : "text-bear"}`}>
        {Math.abs(pct).toFixed(1)}% <span className="text-sm font-semibold">{pct >= 0 ? "Undervalued" : "Overvalued"}</span>
      </p>
      <div className="relative h-16 mt-3 rounded-lg overflow-hidden" style={{ background: "linear-gradient(90deg, #10b981 0%, #10b981 55%, #eab308 75%, #7f1d1d 100%)" }}>
        <div className="absolute top-0 bottom-0 border-l-2 border-white/80" style={{ left: `${Math.min(98, priceX)}%` }}>
          <span className="absolute -top-1 left-1 text-[10px] font-bold text-white bg-black/40 px-1 rounded">Current {currency}{price.toFixed(2)}</span>
        </div>
        <div className="absolute top-0 bottom-0 border-l-2 border-white" style={{ left: `${Math.min(98, fairX)}%` }}>
          <span className="absolute bottom-1 left-1 text-[10px] font-bold text-white bg-black/40 px-1 rounded">Fair Value {currency}{fair.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export function ValuationSection({ symbol, name, sector, price, currency }: Props) {
  const { valuation, isLoading: valLoading } = useValuation(symbol);
  const { research } = useResearch(symbol);
  const { data: peers, isLoading: peersLoading } = useSectorPeers(sector);
  const { averages: benchmark } = useMarketBenchmark();

  const bestModel = valuation?.models.find((m) => m.fairValue != null);
  const ratios = research?.ratios;
  const peerRows = (peers ?? []).filter((p) => p.pe != null).sort((a, b) => (b.pe ?? 0) - (a.pe ?? 0));
  const peerAvg = peerRows.length > 0 ? peerRows.reduce((s, p) => s + (p.pe ?? 0), 0) / peerRows.length : null;
  const maxPeerPe = Math.max(1, ...peerRows.map((p) => p.pe ?? 0));

  const checks = [
    { label: "Trading below fair value", status: bestModel ? (bestModel.upsidePercent! > 0 ? "pass" as const : "fail" as const) : "unknown" as const },
    { label: "Trading below Sector P/E fair ratio", status: ratios?.pe != null && benchmark.pe != null ? (ratios.pe < benchmark.pe ? "pass" as const : "fail" as const) : "unknown" as const },
    { label: "Analyst price target coverage", status: "unknown" as const },
  ];

  return (
    <ReportSection number={1} title="Valuation">
      <CriteriaChecklist
        checks={checks}
        narrative={bestModel ? `${symbol} trades ${Math.abs(((bestModel.fairValue! - price) / price) * 100).toFixed(1)}% ${bestModel.fairValue! > price ? "below" : "above"} its model-based fair value. Continua has no analyst coverage on file, so growth-based fair-ratio checks aren't evaluated.` : `Not enough data on file to compute a fair value for ${symbol} yet.`}
      />

      <SubWidget number="1.1" title="Share Price vs Fair Value" description={`What is the fair price of ${symbol} based on Continua's real valuation models?`}>
        {valLoading ? <p className="text-xs text-muted-foreground py-6">Loading…</p> : !bestModel ? (
          <p className="text-xs text-muted-foreground py-6">None of Continua's models could compute a fair value for {symbol} yet.</p>
        ) : (
          <FairValueBar price={price} fair={bestModel.fairValue!} currency={currency} />
        )}
        <p className="text-[10px] text-muted-foreground mt-2">Model: {bestModel?.model ?? "—"} — Continua doesn't run a discounted cash flow model yet.</p>
      </SubWidget>

      <SubWidget number="1.2" title="Key Valuation Metric" description={`Which real metric is available for ${symbol}?`}>
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 shrink-0">
            <PieChart width={128} height={128}>
              <Pie data={[{ v: ratios?.pe ? Math.min(100, (1 / ratios.pe) * 100) : 0 }, { v: 100 }]} dataKey="v" innerRadius={44} outerRadius={60} startAngle={90} endAngle={-270}>
                <Cell fill="hsl(217 91% 60%)" />
                <Cell fill="hsl(var(--muted))" />
              </Pie>
            </PieChart>
          </div>
          <div>
            <p className="text-3xl font-bold tabular">{ratios?.pe != null ? `${ratios.pe.toFixed(1)}x` : "—"}</p>
            <p className="text-[11px] text-muted-foreground">P/E Ratio — used since {symbol} is profitable</p>
            {ratios?.pb != null && <p className="text-[11px] text-muted-foreground mt-1">P/B Ratio: {ratios.pb.toFixed(2)}x</p>}
          </div>
        </div>
      </SubWidget>

      <SubWidget number="1.3" title="Price to Earnings Ratio vs Peers" description={`How does ${symbol}'s P/E compare to its real NSE sector peers?`}>
        {peersLoading ? <p className="text-xs text-muted-foreground py-4">Loading peers…</p> : peerRows.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4">No sector peers with a P/E on file yet.</p>
        ) : (
          <div className="space-y-2">
            {peerAvg != null && <p className="text-[10.5px] text-muted-foreground mb-2">Peer average: {peerAvg.toFixed(1)}x</p>}
            {peerRows.slice(0, 6).map((p) => (
              <div key={p.symbol} className="flex items-center gap-2">
                <span className={`text-[11px] w-14 shrink-0 font-bold ${p.symbol === symbol ? "text-primary" : ""}`}>{p.symbol}</span>
                <div className="flex-1 h-5 rounded bg-muted overflow-hidden">
                  <div className={`h-full rounded ${p.symbol === symbol ? "bg-primary" : "bg-bull"}`} style={{ width: `${((p.pe ?? 0) / maxPeerPe) * 100}%` }} />
                </div>
                <span className="text-[11px] font-semibold tabular w-12 text-right">{p.pe!.toFixed(1)}x</span>
              </div>
            ))}
          </div>
        )}
      </SubWidget>

      <SubWidget number="1.4" title="Historical Price to Earnings Ratio" description="Compares a stock's price to its earnings over time.">
        <p className="text-xs text-muted-foreground py-4">Continua doesn't have a historical P/E time series yet — only the current ratio, shown above.</p>
      </SubWidget>

      <SubWidget number="1.5" title="Price to Earnings Ratio vs Industry" description={`How does ${symbol}'s P/E compare across its NSE sector?`}>
        {peerRows.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4">No sector peers on file yet.</p>
        ) : (
          <div className="flex items-end gap-1.5 h-32">
            {peerRows.map((p) => (
              <div key={p.symbol} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className={`w-full rounded-t ${p.symbol === symbol ? "bg-primary" : "bg-bull/60"}`} style={{ height: `${((p.pe ?? 0) / maxPeerPe) * 100}%` }} />
                <span className="text-[8px] text-muted-foreground mt-1 truncate w-full text-center">{p.symbol}</span>
              </div>
            ))}
          </div>
        )}
      </SubWidget>

      <SubWidget number="1.6" title="Price to Earnings Ratio vs Fair Ratio" description="The expected P/E given forecast growth, margins and risk — needs analyst estimates Continua doesn't have.">
        <p className="text-xs text-muted-foreground py-4">Insufficient data — {symbol} has no analyst coverage on file to compute a Fair P/E Ratio.</p>
      </SubWidget>

      <SubWidget number="1.7" title="Analyst Price Targets" description="The analyst 12-month forecast and statistical confidence in the consensus target.">
        <p className="text-xs text-muted-foreground py-4">No analyst price-target coverage on file for {symbol}.</p>
      </SubWidget>
    </ReportSection>
  );
}