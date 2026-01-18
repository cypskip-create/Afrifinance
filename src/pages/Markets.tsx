import { TrendingUp, TrendingDown, BarChart3, Bitcoin, Coins, Globe, Brain, Building2, Layers, Box, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/shared/TopBar";
import { useNavigate } from "react-router-dom";
import * as WatchlistHook from "@/hooks/useWatchlist";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";
import { CryptoChartDialog } from "@/components/markets/CryptoChartDialog";
import { MarketStatusIndicator } from "@/components/shared/MarketStatusIndicator";
import { SparklineChart } from "@/components/shared/SparklineChart";
import { AllStocksList } from "@/components/markets/AllStocksList";

export default function Markets() {
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = WatchlistHook.useWatchlist();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = React.useState("stocks");
  const [selectedCrypto, setSelectedCrypto] = React.useState<typeof cryptoData[0] | null>(null);
  const [cryptoDialogOpen, setCryptoDialogOpen] = React.useState(false);

  const cryptoData = [
    { name: "Bitcoin", symbol: "BTC", price: "$43,250", change: 2.4, isUp: true, marketCap: "$847.2B", volume24h: "$28.5B", high24h: "$44,120", low24h: "$42,580", supply: "19.6M BTC", rank: 1 },
    { name: "Ethereum", symbol: "ETH", price: "$2,580", change: 1.8, isUp: true, marketCap: "$310.5B", volume24h: "$15.2B", high24h: "$2,650", low24h: "$2,520", supply: "120.2M ETH", rank: 2 },
    { name: "BNB", symbol: "BNB", price: "$312.45", change: 3.2, isUp: true, marketCap: "$48.1B", volume24h: "$1.2B", high24h: "$318.00", low24h: "$302.10", supply: "153.8M BNB", rank: 3 },
    { name: "Solana", symbol: "SOL", price: "$98.45", change: 5.1, isUp: true, marketCap: "$42.8B", volume24h: "$2.8B", high24h: "$102.30", low24h: "$93.20", supply: "435.2M SOL", rank: 4 },
    { name: "XRP", symbol: "XRP", price: "$0.62", change: -1.2, isUp: false, marketCap: "$33.9B", volume24h: "$1.5B", high24h: "$0.65", low24h: "$0.60", supply: "54.7B XRP", rank: 5 },
    { name: "Cardano", symbol: "ADA", price: "$0.52", change: -3.2, isUp: false, marketCap: "$18.4B", volume24h: "$520M", high24h: "$0.56", low24h: "$0.50", supply: "35.4B ADA", rank: 6 },
    { name: "Avalanche", symbol: "AVAX", price: "$35.80", change: 4.5, isUp: true, marketCap: "$13.7B", volume24h: "$580M", high24h: "$37.20", low24h: "$34.10", supply: "382M AVAX", rank: 7 },
    { name: "Polkadot", symbol: "DOT", price: "$7.23", change: 0.8, isUp: true, marketCap: "$10.1B", volume24h: "$320M", high24h: "$7.45", low24h: "$7.05", supply: "1.4B DOT", rank: 8 },
    { name: "Chainlink", symbol: "LINK", price: "$14.85", change: 2.1, isUp: true, marketCap: "$8.7B", volume24h: "$450M", high24h: "$15.20", low24h: "$14.30", supply: "587M LINK", rank: 9 },
    { name: "Polygon", symbol: "MATIC", price: "$0.89", change: -0.5, isUp: false, marketCap: "$8.3B", volume24h: "$380M", high24h: "$0.92", low24h: "$0.87", supply: "9.3B MATIC", rank: 10 },
  ];
  
  const marketCategories = [
    { id: "stocks", label: "Stocks", icon: Building2 },
    { id: "crypto", label: "Crypto", icon: Bitcoin },
    { id: "etfs", label: "ETFs", icon: Layers },
    { id: "options", label: "Options", icon: BarChart3 },
    { id: "commodities", label: "Commodities", icon: Box },
    { id: "bonds", label: "Bonds", icon: Coins },
  ];

  const topGainers = [
    { symbol: "EQTY", name: "Equity Group", price: "62.50", change: 13.12, isUp: true },
    { symbol: "SAFCOM", name: "Safaricom PLC", price: "12.85", change: 1.18, isUp: true },
    { symbol: "KCB", name: "KCB Group", price: "45.20", change: 0.85, isUp: true },
  ];

  const topLosers = [
    { symbol: "BAMB", name: "Bamburi Cement", price: "85.30", change: -2.4, isUp: false },
    { symbol: "EABL", name: "EABL", price: "142.00", change: -1.8, isUp: false },
    { symbol: "SCBK", name: "Standard Chartered", price: "168.50", change: -0.9, isUp: false },
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

  const handleCryptoClick = (crypto: typeof cryptoData[0]) => {
    setSelectedCrypto(crypto);
    setCryptoDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <TopBar 
        title="Markets" 
        subtitle="Global market overview"
        showSearch={true}
        showAI={false}
        showNotifications={true}
      />

      <div className="p-4 space-y-5">
        {/* Market Status */}
        <div className="flex items-center justify-between animate-fade-in">
          <MarketStatusIndicator />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Updated just now</span>
          </div>
        </div>

        {/* Market Summary Card */}
        <Card className="card-gradient animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Market Summary</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Markets showing positive momentum today with banking sector leading gains. 
              NSE 20 up 1.2% driven by strong earnings reports. Crypto markets rallying with Bitcoin testing $44K resistance.
            </p>
          </CardContent>
        </Card>

        {/* Category Icons */}
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold mb-3">
            {marketCategories.find(c => c.id === selectedCategory)?.label || "Stocks"}
          </h2>
          <div className="grid grid-cols-6 gap-2">
            {marketCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={category.id === selectedCategory ? "default" : "outline"}
                  size="icon"
                  className={`w-full aspect-square tap-scale ${
                    category.id === selectedCategory ? 'bg-primary hover:bg-primary/90' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              );
            })}
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full mb-6">
          {/* Stocks Tab */}
          <TabsContent value="stocks" className="space-y-6">
            {/* All Stocks List */}
            <AllStocksList />
            {/* Top Gainers & Losers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="card-gradient">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-bull" />
                    <span>Top Gainers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topGainers.map((stock) => (
                      <div
                        key={stock.symbol}
                        onClick={() => navigate(`/stock/${stock.symbol}`)}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors tap-scale"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-xs font-medium">{stock.symbol}</div>
                            <div className="text-xs text-muted-foreground">{stock.name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <SparklineChart isPositive={stock.isUp} width={50} height={20} />
                          <div className="text-right">
                            <div className="text-xs font-medium">KES {stock.price}</div>
                            <div className="text-xs text-bull">+{stock.change}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <TrendingDown className="h-4 w-4 text-bear" />
                    <span>Top Losers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topLosers.map((stock) => (
                      <div
                        key={stock.symbol}
                        onClick={() => navigate(`/stock/${stock.symbol}`)}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors tap-scale"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-xs font-medium">{stock.symbol}</div>
                            <div className="text-xs text-muted-foreground">{stock.name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <SparklineChart isPositive={stock.isUp} width={50} height={20} />
                          <div className="text-right">
                            <div className="text-xs font-medium">KES {stock.price}</div>
                            <div className="text-xs text-bear">{stock.change}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Global Indices */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-sm">Major Indices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {indices.map((index) => (
                    <div
                      key={index.name}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/20"
                    >
                      <div>
                        <div className="text-xs font-medium">{index.name}</div>
                        <div className="text-xs text-muted-foreground">{index.value}</div>
                      </div>
                      <div className={`flex items-center space-x-1 ${index.isUp ? 'text-bull' : 'text-bear'}`}>
                        {index.isUp ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span className="text-xs font-medium">
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
                      onClick={() => navigate(`/sector/${sector.name.toLowerCase()}`)}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
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
            {/* Crypto Market Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="card-gradient">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Total Market Cap</div>
                  <div className="text-lg font-bold">$1.72T</div>
                  <div className="text-xs text-bull">+2.3% 24h</div>
                </CardContent>
              </Card>
              <Card className="card-gradient">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">24h Volume</div>
                  <div className="text-lg font-bold">$89.5B</div>
                  <div className="text-xs text-bull">+5.1% 24h</div>
                </CardContent>
              </Card>
            </div>

            <Card className="card-gradient">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bitcoin className="h-5 w-5 text-accent" />
                    <span>Top Cryptocurrencies</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-normal">Tap for details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cryptoData.map((crypto) => (
                    <div
                      key={crypto.name}
                      onClick={() => handleCryptoClick(crypto)}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors tap-scale"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                          {crypto.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {crypto.name}
                            <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                              #{crypto.rank}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">{crypto.symbol}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <SparklineChart isPositive={crypto.isUp} width={50} height={24} />
                        <div className="text-right min-w-[70px]">
                          <div className="font-medium">{crypto.price}</div>
                          <div className={`text-xs flex items-center justify-end space-x-1 ${crypto.isUp ? 'text-bull' : 'text-bear'}`}>
                            {crypto.isUp ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            <span>{crypto.isUp ? '+' : ''}{crypto.change}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bitcoin Dominance */}
            <Card className="card-gradient">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Bitcoin Dominance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">49.2%</span>
                  <span className="text-xs text-muted-foreground">of total market cap</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-3">
                  <div className="bg-gradient-primary h-3 rounded-full" style={{ width: '49.2%' }} />
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

          {/* Options Tab */}
          <TabsContent value="options" className="space-y-6">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-lg">Options Trading</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Options data coming soon</p>
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

          {/* Bonds Tab */}
          <TabsContent value="bonds" className="space-y-6">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-lg">Bonds & Fixed Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Bonds data coming soon</p>
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
            <div className="grid grid-cols-4 gap-3">
              {[
                { symbol: 'SAFCOM', change: 2.4 },
                { symbol: 'EQTY', change: 5.2 },
                { symbol: 'SCBK', change: -1.8 },
                { symbol: 'BAMB', change: -3.5 },
                { symbol: 'EABL', change: 1.1 },
                { symbol: 'KCB', change: 3.7 },
                { symbol: 'COOP', change: -0.9 },
                { symbol: 'DTB', change: 2.1 },
                { symbol: 'ABSA', change: -2.3 },
                { symbol: 'NCBA', change: 4.2 },
                { symbol: 'BRIT', change: 1.5 },
                { symbol: 'CARBACID', change: -1.2 },
                { symbol: 'BAT', change: 0.8 },
                { symbol: 'TOTL', change: -4.1 },
                { symbol: 'ARM', change: 3.3 },
                { symbol: 'SCOM', change: 1.9 }
              ].map((stock, i) => {
                const intensity = Math.abs(stock.change);
                const isPositive = stock.change >= 0;
                return (
                  <div
                    key={i}
                    onClick={() => navigate(`/stock/${stock.symbol}`)}
                    className={`rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg aspect-square ${
                      isPositive 
                        ? intensity > 3 ? 'bg-gradient-to-br from-bull to-bull/60 text-white' :
                          intensity > 1.5 ? 'bg-bull/50 text-white border border-bull' :
                          'bg-bull/25 text-bull border border-bull/50'
                        : intensity > 3 ? 'bg-gradient-to-br from-bear to-bear/60 text-white' :
                          intensity > 1.5 ? 'bg-bear/50 text-white border border-bear' :
                          'bg-bear/25 text-bear border border-bear/50'
                    }`}
                    style={{
                      opacity: Math.max(0.7, Math.min(1, 0.5 + intensity / 10))
                    }}
                  >
                    <div className="text-xs font-bold mb-1">{stock.symbol}</div>
                    <div className="text-xs font-semibold">
                      {stock.change >= 0 ? '+' : ''}{stock.change}%
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crypto Chart Dialog */}
      <CryptoChartDialog
        open={cryptoDialogOpen}
        onOpenChange={setCryptoDialogOpen}
        crypto={selectedCrypto}
      />
    </div>
  );
}