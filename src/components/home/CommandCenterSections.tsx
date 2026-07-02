import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Sparkles, Calendar, Coins, ArrowUpRight, ChevronRight } from "lucide-react";
import { AIThesisCard } from "@/components/stock/AIThesisCard";

const undervalued = [
  { symbol: "KCB",  name: "KCB Group",   upside: 18.5, price: 45.75 },
  { symbol: "COOP", name: "Co-op Bank",  upside: 14.2, price: 17.25 },
  { symbol: "EQTY", name: "Equity",      upside:  9.7, price: 62.50 },
];

const highGrowth = [
  { symbol: "SAFCOM", name: "Safaricom", growth: 22.4 },
  { symbol: "EABL",   name: "EABL",      growth: 14.8 },
  { symbol: "EQTY",   name: "Equity",    growth: 12.3 },
];

const dividendStars = [
  { symbol: "BAT",     name: "BAT Kenya",  yield: 12.2 },
  { symbol: "SCBK",    name: "Stanchart",  yield: 6.8 },
  { symbol: "STANBIC", name: "Stanbic",    yield: 6.4 },
];

const upcomingEarnings = [
  { symbol: "SAFCOM", name: "Safaricom",    date: "Tomorrow", time: "9:00 AM" },
  { symbol: "EQTY",   name: "Equity Group", date: "Fri",      time: "Pre-market" },
  { symbol: "KCB",    name: "KCB Group",    date: "Next Mon", time: "Post-market" },
];

export function CommandCenterSections() {
  const navigate = useNavigate();

  const Section = ({ title, icon: Icon, iconClass, children, actionLabel, onAction }: any) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="section-eyebrow flex items-center gap-1.5">
          <Icon className={`h-3 w-3 ${iconClass || "text-primary"}`} /> {title}
        </p>
        {actionLabel && (
          <button data-small-target onClick={onAction} className="text-[11px] text-primary font-semibold flex items-center">
            {actionLabel} <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="border-t border-border/60">{children}</div>
    </div>
  );

  const Row = ({ onClick, left, right }: { onClick: () => void; left: React.ReactNode; right: React.ReactNode }) => (
    <button
      data-small-target
      onClick={onClick}
      className="w-full flex items-center justify-between py-2.5 border-b border-border/40 hover:bg-muted/30 -mx-4 px-4 text-left transition-colors"
    >
      {left}
      {right}
    </button>
  );

  return (
    <div className="space-y-6">
      <Section title="Undervalued Picks" icon={Coins} iconClass="text-bull" actionLabel="More" onAction={() => navigate("/screener")}>
        {undervalued.map(s => (
          <Row key={s.symbol} onClick={() => navigate(`/stock/${s.symbol}`)}
            left={<div><p className="text-xs font-semibold">{s.symbol} <span className="font-normal text-muted-foreground">· {s.name}</span></p><p className="text-[10px] text-muted-foreground tabular">KES {s.price.toFixed(2)}</p></div>}
            right={<div className="text-right"><p className="text-xs font-semibold text-bull tabular flex items-center gap-0.5 justify-end"><ArrowUpRight className="h-3 w-3" />+{s.upside}%</p><p className="text-[10px] text-muted-foreground">upside</p></div>}
          />
        ))}
      </Section>

      <Section title="High-Growth Stocks" icon={TrendingUp} iconClass="text-accent">
        {highGrowth.map(s => (
          <Row key={s.symbol} onClick={() => navigate(`/stock/${s.symbol}`)}
            left={<div><p className="text-xs font-semibold">{s.symbol} <span className="font-normal text-muted-foreground">· {s.name}</span></p><p className="text-[10px] text-muted-foreground">3-yr revenue</p></div>}
            right={<p className="text-xs font-semibold text-accent tabular">+{s.growth}%</p>}
          />
        ))}
      </Section>

      <Section title="Strong Dividends" icon={Coins} iconClass="text-chart-3">
        {dividendStars.map(s => (
          <Row key={s.symbol} onClick={() => navigate(`/stock/${s.symbol}`)}
            left={<div><p className="text-xs font-semibold">{s.symbol} <span className="font-normal text-muted-foreground">· {s.name}</span></p><p className="text-[10px] text-muted-foreground">forward yield</p></div>}
            right={<p className="text-xs font-semibold text-chart-3 tabular">{s.yield}%</p>}
          />
        ))}
      </Section>

      <Section title="Upcoming Earnings" icon={Calendar} iconClass="text-primary">
        {upcomingEarnings.map(e => (
          <Row key={e.symbol} onClick={() => navigate(`/stock/${e.symbol}`)}
            left={<div><p className="text-xs font-semibold">{e.symbol} <span className="font-normal text-muted-foreground">· {e.name}</span></p><p className="text-[10px] text-muted-foreground">{e.time}</p></div>}
            right={<p className="text-xs font-semibold text-primary tabular">{e.date}</p>}
          />
        ))}
      </Section>

      <div>
        <p className="section-eyebrow mb-2 flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-primary" /> AI Insight of the Day</p>
        <AIThesisCard
          mode="market_insight" symbol="NSE" name="NSE Market" sector="Market"
          price={0} changePercent={0} pe="" eps="" dividend=""
          title="Today's NSE Insight"
        />
      </div>
    </div>
  );
}
