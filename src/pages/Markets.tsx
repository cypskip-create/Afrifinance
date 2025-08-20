import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Markets() {
  const indices = [
    { name: "NSE 20", value: "1,847.23", change: 1.2, isUp: true },
    { name: "NSE 25", value: "3,542.87", change: 0.8, isUp: true },
    { name: "All Share", value: "112.45", change: -0.3, isUp: false },
  ];

  const sectors = [
    { name: "Banking", change: 2.4, isUp: true },
    { name: "Telecommunications", change: 1.8, isUp: true },
    { name: "Energy", change: -1.2, isUp: false },
    { name: "Manufacturing", change: 0.7, isUp: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <h1 className="text-xl font-bold text-primary">Markets</h1>
          <p className="text-sm text-muted-foreground">Nairobi Securities Exchange</p>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* NSE Indices */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg">NSE Indices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {indices.map((index) => (
                <div
                  key={index.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                >
                  <div>
                    <div className="font-medium">{index.name}</div>
                    <div className="text-sm text-muted-foreground">{index.value}</div>
                  </div>
                  <div className={`flex items-center space-x-1 ${index.isUp ? 'text-bull' : 'text-bear'}`}>
                    {index.isUp ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {index.isUp ? '+' : ''}{index.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sector Performance */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              <span>Sector Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sectors.map((sector) => (
                <div
                  key={sector.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                >
                  <span className="font-medium">{sector.name}</span>
                  <div className={`flex items-center space-x-1 ${sector.isUp ? 'text-bull' : 'text-bear'}`}>
                    {sector.isUp ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {sector.isUp ? '+' : ''}{sector.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Heatmap Placeholder */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg">Market Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 h-40">
              {Array.from({ length: 16 }, (_, i) => (
                <div
                  key={i}
                  className={`rounded-lg flex items-center justify-center text-xs font-medium ${
                    Math.random() > 0.5
                      ? 'bg-bull/30 text-bull border border-bull/40'
                      : 'bg-bear/30 text-bear border border-bear/40'
                  }`}
                >
                  {['SAFCOM', 'EQTY', 'SCBK', 'BAMB', 'EABL', 'KCB', 'COOP', 'DTB'][i % 8]}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}