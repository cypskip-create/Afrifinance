import { TrendingUp, TrendingDown, BarChart3, Bitcoin, Coins, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopBar } from "@/components/shared/TopBar";

export default function Markets() {
  const marketCategories = [
    { id: "stocks", label: "Stocks", icon: TrendingUp },
    { id: "crypto", label: "Crypto", icon: Bitcoin },
    { id: "etfs", label: "ETFs", icon: Coins },
    { id: "commodities", label: "Commodities", icon: Globe },
  ];

  const indices = [
    { name: "NSE 20", value: "1,847.23", change: 1.2, isUp: true },
    { name: "NSE 25", value: "3,542.87", change: 0.8, isUp: true },
    { name: "All Share", value: "112.45", change: -0.3, isUp: false },
    { name: "S&P 500", value: "4,532.76", change: 0.5, isUp: true },
    { name: "NASDAQ", value: "14,823.43", change: -0.2, isUp: false },
  ];

  const sectors = [
    { name: "Banking", change: 2.4, isUp: true },
    { name: "Telecommunications", change: 1.8, isUp: true },
    { name: "Energy", change: -1.2, isUp: false },
    { name: "Manufacturing", change: 0.7, isUp: true },
  ];

  const cryptoData = [
    { name: "Bitcoin", symbol: "BTC", price: "$43,250", change: 2.4, isUp: true },
    { name: "Ethereum", symbol: "ETH", price: "$2,580", change: 1.8, isUp: true },
    { name: "Cardano", symbol: "ADA", price: "$0.52", change: -3.2, isUp: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Enhanced Header */}
      <TopBar 
        title="Markets" 
        subtitle="Global market overview"
        showSearch={true}
        showAI={true}
        showNotifications={true}
      />

      <div className="p-4">
        {/* Market Categories */}
        <Tabs defaultValue="stocks" className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-4">
            {marketCategories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex items-center space-x-1 text-xs"
              >
                <category.icon className="h-3 w-3" />
                <span>{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Stocks Tab */}
          <TabsContent value="stocks" className="space-y-6">
            {/* Global Indices */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-lg">Major Indices</CardTitle>
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
          </TabsContent>

          {/* Crypto Tab */}
          <TabsContent value="crypto" className="space-y-6">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Bitcoin className="h-5 w-5 text-accent" />
                  <span>Top Cryptocurrencies</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cryptoData.map((crypto) => (
                    <div
                      key={crypto.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                    >
                      <div>
                        <div className="font-medium">{crypto.name}</div>
                        <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{crypto.price}</div>
                        <div className={`text-sm flex items-center space-x-1 ${crypto.isUp ? 'text-bull' : 'text-bear'}`}>
                          {crypto.isUp ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span>{crypto.isUp ? '+' : ''}{crypto.change}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ETFs Tab */}
          <TabsContent value="etfs" className="space-y-6">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-lg">Exchange Traded Funds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>ETF data coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commodities Tab */}
          <TabsContent value="commodities" className="space-y-6">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-lg">Commodities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Commodities data coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Market Heatmap */}
        <Card className="card-gradient mt-6">
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