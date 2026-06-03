import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Fundamentals } from "@/data/stockFundamentals";

interface Props { fundamentals: Fundamentals }

export function OwnershipTab({ fundamentals }: Props) {
  const data = fundamentals.ownership;
  return (
    <div className="space-y-3">
      <Card className="soft-card">
        <CardContent className="p-4">
          <h4 className="text-xs font-bold mb-2">Ownership Breakdown</h4>
          <div className="flex items-center gap-3">
            <div className="h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" innerRadius={36} outerRadius={64} paddingAngle={3} stroke="none">
                    {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} formatter={(v: any) => `${v.toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {data.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span>{d.name}</span>
                  </div>
                  <span className="font-bold">{d.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="soft-card">
        <CardContent className="p-4">
          <h4 className="text-xs font-bold mb-2">Top Shareholders</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40 text-left text-muted-foreground">
                  <th className="py-1.5 font-medium">Holder</th>
                  <th className="py-1.5 font-medium">Type</th>
                  <th className="py-1.5 font-medium text-right">Stake</th>
                </tr>
              </thead>
              <tbody>
                {fundamentals.topShareholders.map(s => (
                  <tr key={s.name} className="border-b border-border/20 last:border-0">
                    <td className="py-2 font-medium">{s.name}</td>
                    <td className="py-2 text-muted-foreground">{s.type}</td>
                    <td className="py-2 text-right font-bold">{s.pct.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
