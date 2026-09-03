import { useMemo } from "react";
import { Sankey, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Layer, Rectangle } from "recharts";
import { InfoTip } from "./InfoTip";

interface HoldingLike {
  symbol: string;
  name?: string;
  sector?: string;
  value: number;
}

interface PortfolioDiversificationProps {
  holdings: HoldingLike[];
  showValues?: boolean;
  currencyLabel?: string;
}

// Deterministic hue per sector/ticker name so colors are stable across
// renders and sessions without maintaining a hand-curated lookup table.
const PALETTE = ["#3b82f6", "#10b981", "#eab308", "#a855f7", "#f97316", "#14b8a6", "#ef4444", "#6366f1", "#ec4899", "#84cc16"];
function colorFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export function PortfolioDiversification({ holdings, showValues = true, currencyLabel = "KSh" }: PortfolioDiversificationProps) {
  const totalValue = holdings.reduce((s, h) => s + h.value, 0);

  const sankeyData = useMemo(() => {
    if (holdings.length === 0 || totalValue <= 0) return null;
    const sectors = [...new Set(holdings.map((h) => h.sector || "Other"))];
    const nodes: { name: string }[] = [{ name: "Portfolio" }, ...sectors.map((s) => ({ name: s })), ...holdings.map((h) => ({ name: h.symbol }))];
    const sectorIndex = (s: string) => 1 + sectors.indexOf(s);
    const tickerIndex = (i: number) => 1 + sectors.length + i;

    const links: { source: number; target: number; value: number }[] = [];
    sectors.forEach((s) => {
      const sectorTotal = holdings.filter((h) => (h.sector || "Other") === s).reduce((sum, h) => sum + h.value, 0);
      links.push({ source: 0, target: sectorIndex(s), value: sectorTotal });
    });
    holdings.forEach((h, i) => {
      links.push({ source: sectorIndex(h.sector || "Other"), target: tickerIndex(i), value: h.value });
    });

    return { nodes, links, sectors };
  }, [holdings, totalValue]);

  const donutData = useMemo(() => {
    return [...holdings]
      .sort((a, b) => b.value - a.value)
      .map((h) => ({ name: h.symbol, fullName: h.name || h.symbol, value: h.value, pct: totalValue > 0 ? (h.value / totalValue) * 100 : 0 }));
  }, [holdings, totalValue]);

  if (!sankeyData || holdings.length === 0) {
    return (
      <div className="card-gradient rounded-2xl p-6 text-center">
        <p className="text-sm font-semibold">No holdings to diversify yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card-gradient rounded-2xl p-4">
        <h3 className="font-serif text-lg flex items-center gap-1.5 mb-1">
          Diversification across Industries
          <InfoTip>How your portfolio value flows from sector into individual holdings, based on each position's current market value.</InfoTip>
        </h3>
        <p className="text-[11px] text-muted-foreground mb-3">
          How your value flows from sector into individual holdings.
        </p>
        <div className="h-[380px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={sankeyData}
              nodeWidth={12}
              nodePadding={18}
              margin={{ top: 8, right: 90, bottom: 8, left: 8 }}
              link={{ stroke: "hsl(var(--muted-foreground))", strokeOpacity: 0.25 }}
              node={(props: any) => <SankeyNodeShape {...props} rootIndex={0} sectorCount={sankeyData.sectors.length} />}
            >
              <Tooltip
                formatter={(v: number) => [showValues ? `${currencyLabel}${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "••••", ""]}
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
              />
            </Sankey>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-gradient rounded-2xl p-4">
        <h3 className="font-serif text-lg flex items-center gap-1.5 mb-3">
          Diversification across Holdings
          <InfoTip>Each holding's share of your total portfolio value — a concentration check, not a performance measure.</InfoTip>
        </h3>
        <div className="h-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={donutData} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="90%" paddingAngle={1.5} stroke="none">
                {donutData.map((d) => <Cell key={d.name} fill={colorFor(d.name)} />)}
              </Pie>
              <Tooltip
                formatter={(v: number, _n, entry) => [
                  `${(entry?.payload as { pct: number })?.pct.toFixed(1)}% · ${showValues ? `${currencyLabel}${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "••••"}`,
                  (entry?.payload as { fullName: string })?.fullName,
                ]}
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
          {donutData[0] && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-sm font-bold" style={{ color: colorFor(donutData[0].name) }}>{donutData[0].name}</p>
              <p className="text-lg font-bold tabular">{donutData[0].pct.toFixed(1)}%</p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
          {donutData.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colorFor(d.name) }} />
              <span className="text-[10.5px] font-semibold truncate">{d.name}</span>
              <span className="text-[10.5px] text-muted-foreground ml-auto">{d.pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-gradient rounded-2xl p-4">
        <h3 className="font-serif text-lg flex items-center gap-1.5 mb-1">
          Revenue Diversification by Geography
          <InfoTip>
            NSE-listed issuers don't consistently disclose structured geographic revenue splits
            the way Continua's data layer ingests financials today, so this can't be filled in
            honestly yet — shown here so the tool is visibly present rather than silently missing.
          </InfoTip>
        </h3>
        <p className="text-[11px] text-muted-foreground mb-4">Where your holdings actually earn their revenue.</p>
        <div className="h-56 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={[{ name: "Not Reported", value: 100 }]} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="90%" stroke="none">
                <Cell fill="hsl(var(--muted-foreground) / 0.35)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-8 text-center">
            <p className="text-sm font-bold">Not Reported</p>
            <p className="text-[10.5px] text-muted-foreground mt-1">Geographic revenue data isn't tracked for NSE issuers yet</p>
          </div>
        </div>
      </div>

      {/* Revenue-by-geography above is intentionally a placeholder, not a
          fabricated breakdown: NSE-listed issuers don't consistently
          disclose structured geographic revenue splits the way Continua's
          data layer ingests financials today. */}
    </div>
  );
}

function SankeyNodeShape({ x, y, width, height, index, payload, rootIndex, sectorCount }: any) {
  const isRoot = index === rootIndex;
  const isSector = index > rootIndex && index <= sectorCount;
  const fill = isRoot ? "hsl(var(--foreground))" : isSector ? colorFor(payload.name) : colorFor(payload.name) + "99";
  const labelSide = x < 40 ? "start" : "end";
  return (
    <Layer>
      <Rectangle x={x} y={y} width={width} height={Math.max(height, 2)} fill={fill} radius={2} />
      <text
        x={labelSide === "start" ? x - 6 : x + width + 6}
        y={y + height / 2}
        textAnchor={labelSide === "start" ? "end" : "start"}
        dominantBaseline="middle"
        fontSize={10}
        fontWeight={isRoot || isSector ? 700 : 500}
        fill="hsl(var(--foreground))"
      >
        {payload.name}
      </text>
    </Layer>
  );
}