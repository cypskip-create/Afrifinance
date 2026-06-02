import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Sparkles, Calendar, Coins, ArrowUpRight, ChevronRight, Flame } from "lucide-react";
import { AIThesisCard } from "@/components/stock/AIThesisCard";

const undervalued = [
  { symbol: "KCB", name: "KCB Group", upside: 18.5, price: 45.75 },
  { symbol: "COOP", name: "Co-op Bank", upside: 14.2, price: 17.25 },
  { symbol: "EQTY", name: "Equity", upside: 9.7, price: 62.50 },
];

const highGrowth = [
  { symbol: "SAFCOM", name: "Safaricom", growth: 22.4 },
  { symbol: "EABL", name: "EABL", growth: 14.8 },
  { symbol: "EQTY", name: "Equity", growth: 12.3 },
];

const dividendStars = [
  { symbol: "BAT", name: "BAT Kenya", yield: 12.2 },
  { symbol: "SCBK", name: "Stanchart", yield: 6.8 },
  { symbol: "STANBIC", name: "Stanbic", yield: 6.4 },
];

const upcomingEarnings = [
  { symbol: "SAFCOM", name: "Safaricom", date: "Tomorrow", time: "9:00 AM" },
  { symbol: "EQTY", name: "Equity Group", date: "Fri", time: "Pre-market" },
  { symbol: "KCB", name: "KCB Group", date: "Next Mon", time: "Post-market" },
];

const upcomingDividends = [
  { symbol: "BAT", name: "BAT Kenya", amount: "KES 52.00", exDate: "Dec 12" },
  { symbol: "EABL", name: "EABL", amount: "KES 6.50", exDate: "Dec 18" },
];

export function CommandCenterSections() {
  const navigate = useNavigate();

  const Section = ({
    title,
    icon: Icon,
    iconClass,
    children,
    actionLabel,
    onAction,
  }: any) => (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Icon className={`h-4 w-4 ${iconClass || "text-primary"}`} />
          {title}
        </h3>
        {actionLabel && (
          <Button variant="ghost" size="sm" className="h-7 text-xs text-primary rounded-full px-3" onClick={onAction}>
            {actionLabel} <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>
        )}
      </div>
      {children}
    </div>
  );

  const RowList = ({ items, render }: any) => (
    <div className="space-y-1.5">
      {items.map((it: any) => (
        <Card
          key={it.symbol + (it.date || "")}
          className="soft-card cursor-pointer active:scale-[0.99] transition-transform"
          onClick={() => navigate(`/stock/${it.symbol}`)}
        >
          <CardContent className="p-3">{render(it)}</CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      <Section title="Undervalued Picks" icon={Coins} iconClass="text-bull" actionLabel="More" onAction={() => navigate("/screener")}>
        <RowList
          items={undervalued}
          render={(s: any) => (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">{s.symbol} <span className="text-xs font-normal text-muted-foreground">· {s.name}</span></p>
                <p className="text-[11px] text-muted-foreground">KES {s.price.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-bull flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />+{s.upside}%</p>
                <p className="text-[10px] text-muted-foreground">est. upside</p>
              </div>
            </div>
          )}
        />
      </Section>

      <Section title="High-Growth Stocks" icon={TrendingUp} iconClass="text-accent">
        <RowList
          items={highGrowth}
          render={(s: any) => (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">{s.symbol} <span className="text-xs font-normal text-muted-foreground">· {s.name}</span></p>
                <p className="text-[11px] text-muted-foreground">3yr revenue growth</p>
              </div>
              <p className="text-xs font-bold text-accent">+{s.growth}%</p>
            </div>
          )}
        />
      </Section>

      <Section title="Strong Dividends" icon={Coins} iconClass="text-chart-3">
        <RowList
          items={dividendStars}
          render={(s: any) => (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">{s.symbol} <span className="text-xs font-normal text-muted-foreground">· {s.name}</span></p>
                <p className="text-[11px] text-muted-foreground">forward yield</p>
              </div>
              <p className="text-xs font-bold text-chart-3">{s.yield}%</p>
            </div>
          )}
        />
      </Section>

      <Section title="Upcoming Earnings" icon={Calendar} iconClass="text-primary">
        <RowList
          items={upcomingEarnings}
          render={(e: any) => (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">{e.symbol} <span className="text-xs font-normal text-muted-foreground">· {e.name}</span></p>
                <p className="text-[11px] text-muted-foreground">{e.time}</p>
              </div>
              <p className="text-xs font-semibold text-primary">{e.date}</p>
            </div>
          )}
        />
      </Section>

      <Section title="Upcoming Dividends" icon={Coins} iconClass="text-bull">
        <RowList
          items={upcomingDividends}
          render={(d: any) => (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">{d.symbol} <span className="text-xs font-normal text-muted-foreground">· {d.name}</span></p>
                <p className="text-[11px] text-muted-foreground">ex-date {d.exDate}</p>
              </div>
              <p className="text-xs font-bold text-bull">{d.amount}</p>
            </div>
          )}
        />
      </Section>

      <Section title="AI Insight of the Day" icon={Sparkles} iconClass="text-primary">
        <AIThesisCard
          mode="market_insight"
          symbol="NSE"
          name="NSE Market"
          sector="Market"
          price={0}
          changePercent={0}
          pe=""
          eps=""
          dividend=""
          title="Today's NSE Insight"
        />
      </Section>
    </div>
  );
}
