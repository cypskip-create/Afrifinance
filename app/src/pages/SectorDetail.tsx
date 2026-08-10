import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";

export default function SectorDetail() {
  const navigate = useNavigate();
  const { sector } = useParams();

  const sectorData = {
    banking: {
      name: "Banking & Financial Services",
      description: "Leading financial institutions in Kenya providing banking, lending, and financial services.",
      change: 2.4,
      isUp: true,
      stocks: [
        { symbol: "EQTY", name: "Equity Group Holdings", price: "62.50", change: 13.12, isUp: true, marketCap: "237.3B" },
        { symbol: "KCB", name: "KCB Group", price: "45.20", change: 0.85, isUp: true, marketCap: "156.8B" },
        { symbol: "SCBK", name: "Standard Chartered", price: "168.50", change: -0.9, isUp: false, marketCap: "125.4B" },
        { symbol: "COOP", name: "Co-operative Bank", price: "12.80", change: 1.6, isUp: true, marketCap: "98.2B" },
        { symbol: "DTB", name: "Diamond Trust Bank", price: "78.40", change: 2.1, isUp: true, marketCap: "45.6B" },
      ]
    },
    telecommunications: {
      name: "Telecommunications",
      description: "Major telecom operators providing mobile, internet, and communication services across Kenya.",
      change: 1.8,
      isUp: true,
      stocks: [
        { symbol: "SAFCOM", name: "Safaricom PLC", price: "12.85", change: 1.18, isUp: true, marketCap: "515.2B" }
      ]
    },
    energy: {
      name: "Energy & Power",
      description: "Companies involved in power generation, distribution, and renewable energy solutions.",
      change: -1.2,
      isUp: false,
      stocks: [
        { symbol: "KPLC", name: "Kenya Power", price: "2.45", change: -2.4, isUp: false, marketCap: "48.9B" },
        { symbol: "KENGEN", name: "KenGen", price: "3.20", change: -0.6, isUp: false, marketCap: "64.3B" }
      ]
    },
    manufacturing: {
      name: "Manufacturing & Industrial",
      description: "Industrial and manufacturing companies producing goods for local and export markets.",
      change: 0.7,
      isUp: true,
      stocks: [
        { symbol: "BAMB", name: "Bamburi Cement", price: "85.30", change: -2.4, isUp: false, marketCap: "42.6B" },
        { symbol: "EABL", name: "East African Breweries", price: "142.00", change: -1.8, isUp: false, marketCap: "105.7B" }
      ]
    }
  };

  const currentSector = sectorData[sector as keyof typeof sectorData] || sectorData.banking;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">{currentSector.name}</h1>
              <p className="text-xs text-muted-foreground">Sector Overview</p>
            </div>
          </div>
          <div className={`flex items-center space-x-1 ${currentSector.isUp ? 'text-bull' : 'text-bear'}`}>
            {currentSector.isUp ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {currentSector.isUp ? '+' : ''}{currentSector.change}%
            </span>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Sector Overview */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Building className="h-4 w-4 text-accent" />
              <span>Sector Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">{currentSector.description}</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-muted/20 rounded">
                <div className="text-xs text-muted-foreground">Companies</div>
                <div className="text-xs font-medium">{currentSector.stocks.length}</div>
              </div>
              <div className="p-2 bg-muted/20 rounded">
                <div className="text-xs text-muted-foreground">Avg Return</div>
                <div className={`text-xs font-medium ${currentSector.isUp ? 'text-bull' : 'text-bear'}`}>
                  {currentSector.isUp ? '+' : ''}{currentSector.change}%
                </div>
              </div>
              <div className="p-2 bg-muted/20 rounded">
                <div className="text-xs text-muted-foreground">Market Cap</div>
                <div className="text-xs font-medium">
                  KES {Math.round(currentSector.stocks.reduce((sum, stock) => 
                    sum + parseFloat(stock.marketCap.replace('B', '')), 0))}B
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sector Stocks */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-accent" />
              <span>Sector Companies</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentSector.stocks.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => navigate(`/stock/${stock.symbol}`)}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-medium">{stock.symbol}</div>
                      <div className="text-xs font-medium">KES {stock.price}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">{stock.name}</div>
                      <div className={`text-xs ${stock.isUp ? 'text-bull' : 'text-bear'}`}>
                        {stock.isUp ? '+' : ''}{stock.change}%
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Market Cap: KES {stock.marketCap}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sector Performance Chart */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-sm">Sector Performance (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-muted/20 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                <div className="text-xs">Sector performance chart coming soon</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}