import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { Fundamentals } from "@/data/stockFundamentals";

interface Props {
  divYield: string;
  annualDividend: string;
  fundamentals: Fundamentals;
}

export function DividendsTab({ divYield, annualDividend, fundamentals }: Props) {
  const data = fundamentals.dividendHistory;
  const payout = fundamentals.payoutRatio;

  return (
    <div className="space-y-3">
      <Card className="soft-card">
        <CardContent className="p-4 grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground">Dividend Yield</p>
            <p className="text-lg font-bold text-bull">{divYield}%</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Annual Div</p>
            <p className="text-lg font-bold">KES {annualDividend}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Payout Ratio</p>
            <p className="text-lg font-bold">{payout.toFixed(0)}%</p>
          </div>
        </CardContent>
      </Card>

      <Card className="soft-card">
        <CardContent className="p-4">
          <h4 className="text-xs font-bold mb-2">Dividend per Share — 10 Year History</h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -15 }}>
                <XAxis dataKey="year" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} formatter={(v: any) => `KES ${v}`} />
                <Line type="monotone" dataKey="dps" stroke="hsl(var(--bull))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--bull))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="soft-card">
        <CardContent className="p-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium">Payout Ratio</span>
            <span className="font-bold">{payout.toFixed(0)}% of earnings</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${payout < 60 ? "bg-bull" : payout < 80 ? "bg-chart-3" : "bg-bear"}`} style={{ width: `${Math.min(100, payout)}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {payout < 60 ? "Healthy — dividend well covered by earnings" : payout < 80 ? "Moderate — monitor sustainability" : "High — limited buffer for cuts"}
          </p>
        </CardContent>
      </Card>

      <Card className="soft-card">
        <CardContent className="p-4 space-y-2.5">
          <h4 className="text-xs font-bold mb-1">Dividend Sustainability</h4>
          {fundamentals.dividendChecks.map(c => (
            <div key={c.label} className="flex items-center gap-2">
              {c.ok ? <CheckCircle2 className="h-4 w-4 text-bull shrink-0" /> : <XCircle className="h-4 w-4 text-bear shrink-0" />}
              <span className="text-xs">{c.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
