import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, TrendingUp, TrendingDown, Newspaper, Activity, Target, Award, PieChart, FileText, Banknote, UserCheck, Briefcase, Building, Globe, Users, Calendar, Bell, GitCompare, Plus, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StockPriceChart } from "@/components/stock/StockPriceChart";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceAlertsManager } from "@/components/alerts/PriceAlertsManager";
import { AddTradeDialog } from "@/components/portfolio/AddTradeDialog";
import { usePortfolio } from "@/hooks/usePortfolio";
import { AnalystRatings } from "@/components/stock/AnalystRatings";
import { MarketStatusIndicator } from "@/components/shared/MarketStatusIndicator";

export default function StockDetail() {
  const navigate = useNavigate();
  const { symbol } = useParams();
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [showAlertsDialog, setShowAlertsDialog] = useState(false);
  const [showAddTradeDialog, setShowAddTradeDialog] = useState(false);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { addToPortfolio } = usePortfolio();
  const { toast } = useToast();

  // Comprehensive NSE stock data with accurate tickers and sectors
  const stockData: Record<string, {
    name: string;
    price: number;
    change: number;
    changePercent: string;
    isUp: boolean;
    marketCap: string;
    pe: string;
    eps: string;
    dividend: string;
    high52: string;
    low52: string;
    exchange: string;
    sector: string;
  }> = {
    // Telecommunications
    SAFCOM: {
      name: "Safaricom PLC",
      price: 12.85,
      change: 0.15,
      changePercent: "1.18",
      isUp: true,
      marketCap: "515.2B",
      pe: "12.4",
      eps: "1.04",
      dividend: "0.62",
      high52: "14.20",
      low52: "10.80",
      exchange: "NSE",
      sector: "Telecommunications"
    },
    // Banking
    EQTY: {
      name: "Equity Group Holdings PLC",
      price: 62.50,
      change: 7.25,
      changePercent: "13.12",
      isUp: true,
      marketCap: "237.3B",
      pe: "8.2",
      eps: "7.62",
      dividend: "2.50",
      high52: "68.00",
      low52: "45.25",
      exchange: "NSE",
      sector: "Banking"
    },
    KCB: {
      name: "KCB Group PLC",
      price: 45.75,
      change: 1.25,
      changePercent: "2.81",
      isUp: true,
      marketCap: "147.2B",
      pe: "6.5",
      eps: "7.04",
      dividend: "1.50",
      high52: "52.00",
      low52: "38.00",
      exchange: "NSE",
      sector: "Banking"
    },
    COOP: {
      name: "Co-operative Bank of Kenya",
      price: 17.25,
      change: 0.45,
      changePercent: "2.68",
      isUp: true,
      marketCap: "101.5B",
      pe: "5.8",
      eps: "2.97",
      dividend: "1.00",
      high52: "19.50",
      low52: "14.00",
      exchange: "NSE",
      sector: "Banking"
    },
    SCBK: {
      name: "Standard Chartered Bank Kenya",
      price: 185.00,
      change: 5.70,
      changePercent: "3.18",
      isUp: true,
      marketCap: "145.8B",
      pe: "10.5",
      eps: "17.62",
      dividend: "12.50",
      high52: "195.00",
      low52: "165.25",
      exchange: "NSE",
      sector: "Banking"
    },
    ABSA: {
      name: "ABSA Bank Kenya PLC",
      price: 14.80,
      change: 0.35,
      changePercent: "2.42",
      isUp: true,
      marketCap: "80.5B",
      pe: "5.2",
      eps: "2.85",
      dividend: "1.10",
      high52: "16.00",
      low52: "12.50",
      exchange: "NSE",
      sector: "Banking"
    },
    NCBA: {
      name: "NCBA Group PLC",
      price: 52.25,
      change: -0.75,
      changePercent: "-1.42",
      isUp: false,
      marketCap: "86.2B",
      pe: "6.8",
      eps: "7.68",
      dividend: "3.00",
      high52: "58.00",
      low52: "45.00",
      exchange: "NSE",
      sector: "Banking"
    },
    DTB: {
      name: "Diamond Trust Bank Kenya",
      price: 68.50,
      change: 1.00,
      changePercent: "1.48",
      isUp: true,
      marketCap: "19.2B",
      pe: "4.8",
      eps: "14.27",
      dividend: "4.00",
      high52: "75.00",
      low52: "58.00",
      exchange: "NSE",
      sector: "Banking"
    },
    STANBIC: {
      name: "Stanbic Holdings PLC",
      price: 125.00,
      change: 2.50,
      changePercent: "2.04",
      isUp: true,
      marketCap: "49.5B",
      pe: "7.2",
      eps: "17.36",
      dividend: "8.00",
      high52: "135.00",
      low52: "105.00",
      exchange: "NSE",
      sector: "Banking"
    },
    // Insurance
    BRIT: {
      name: "Britam Holdings PLC",
      price: 6.80,
      change: 0.15,
      changePercent: "2.26",
      isUp: true,
      marketCap: "17.2B",
      pe: "8.5",
      eps: "0.80",
      dividend: "0.25",
      high52: "8.00",
      low52: "5.50",
      exchange: "NSE",
      sector: "Insurance"
    },
    JUB: {
      name: "Jubilee Holdings Ltd",
      price: 245.00,
      change: -5.00,
      changePercent: "-2.00",
      isUp: false,
      marketCap: "17.7B",
      pe: "6.2",
      eps: "39.52",
      dividend: "9.00",
      high52: "280.00",
      low52: "220.00",
      exchange: "NSE",
      sector: "Insurance"
    },
    // Manufacturing & Allied
    EABL: {
      name: "East African Breweries Ltd",
      price: 178.50,
      change: 3.25,
      changePercent: "1.85",
      isUp: true,
      marketCap: "141.3B",
      pe: "18.5",
      eps: "9.65",
      dividend: "6.50",
      high52: "195.00",
      low52: "155.00",
      exchange: "NSE",
      sector: "Manufacturing & Allied"
    },
    BAT: {
      name: "British American Tobacco Kenya",
      price: 425.00,
      change: 5.00,
      changePercent: "1.19",
      isUp: true,
      marketCap: "42.5B",
      pe: "9.8",
      eps: "43.37",
      dividend: "52.00",
      high52: "480.00",
      low52: "380.00",
      exchange: "NSE",
      sector: "Manufacturing & Allied"
    },
    // Energy & Petroleum
    KPLC: {
      name: "Kenya Power & Lighting Co.",
      price: 2.85,
      change: 0.05,
      changePercent: "1.79",
      isUp: true,
      marketCap: "5.5B",
      pe: "N/A",
      eps: "-1.25",
      dividend: "0.00",
      high52: "3.50",
      low52: "2.00",
      exchange: "NSE",
      sector: "Energy & Petroleum"
    },
    KEGN: {
      name: "KenGen PLC",
      price: 4.25,
      change: 0.10,
      changePercent: "2.41",
      isUp: true,
      marketCap: "28.0B",
      pe: "5.2",
      eps: "0.82",
      dividend: "0.30",
      high52: "5.00",
      low52: "3.50",
      exchange: "NSE",
      sector: "Energy & Petroleum"
    },
    TOTL: {
      name: "TotalEnergies Marketing Kenya",
      price: 28.50,
      change: 0.50,
      changePercent: "1.79",
      isUp: true,
      marketCap: "5.1B",
      pe: "12.5",
      eps: "2.28",
      dividend: "1.50",
      high52: "32.00",
      low52: "24.00",
      exchange: "NSE",
      sector: "Energy & Petroleum"
    },
    // Agricultural
    SASN: {
      name: "Sasini PLC",
      price: 18.50,
      change: -0.25,
      changePercent: "-1.33",
      isUp: false,
      marketCap: "4.2B",
      pe: "8.5",
      eps: "2.18",
      dividend: "0.50",
      high52: "22.00",
      low52: "16.00",
      exchange: "NSE",
      sector: "Agricultural"
    },
    KTBL: {
      name: "Kenya Tea Development Agency",
      price: 85.00,
      change: 1.50,
      changePercent: "1.80",
      isUp: true,
      marketCap: "16.8B",
      pe: "7.2",
      eps: "11.81",
      dividend: "4.00",
      high52: "95.00",
      low52: "75.00",
      exchange: "NSE",
      sector: "Agricultural"
    },
    // Construction & Allied
    BAMB: {
      name: "Bamburi Cement PLC",
      price: 32.75,
      change: 0.75,
      changePercent: "2.34",
      isUp: true,
      marketCap: "11.9B",
      pe: "15.2",
      eps: "2.15",
      dividend: "0.00",
      high52: "38.00",
      low52: "28.00",
      exchange: "NSE",
      sector: "Construction & Allied"
    },
    // Investment
    CTUM: {
      name: "Centum Investment Company",
      price: 12.50,
      change: 0.20,
      changePercent: "1.63",
      isUp: true,
      marketCap: "8.3B",
      pe: "4.5",
      eps: "2.78",
      dividend: "0.55",
      high52: "15.00",
      low52: "10.00",
      exchange: "NSE",
      sector: "Investment"
    },
    // Commercial & Services
    NMG: {
      name: "Nation Media Group PLC",
      price: 16.80,
      change: 0.30,
      changePercent: "1.82",
      isUp: true,
      marketCap: "3.1B",
      pe: "8.2",
      eps: "2.05",
      dividend: "1.00",
      high52: "20.00",
      low52: "14.00",
      exchange: "NSE",
      sector: "Commercial & Services"
    },
    TPS: {
      name: "TPS Eastern Africa (Serena)",
      price: 22.50,
      change: 0.50,
      changePercent: "2.27",
      isUp: true,
      marketCap: "4.1B",
      pe: "12.5",
      eps: "1.80",
      dividend: "0.75",
      high52: "26.00",
      low52: "18.00",
      exchange: "NSE",
      sector: "Commercial & Services"
    },
  };

  const stock = stockData[symbol as keyof typeof stockData] || {
    name: symbol || "Unknown Stock",
    price: 0,
    change: 0,
    changePercent: "0.00",
    isUp: true,
    marketCap: "N/A",
    pe: "N/A",
    eps: "N/A",
    dividend: "N/A",
    high52: "N/A",
    low52: "N/A",
    exchange: "NSE",
    sector: "Unknown"
  };

  const companyInfo: Record<string, {
    description: string;
    sector: string;
    headquarters: string;
    ceo: string;
    employees: string;
    founded: string;
  }> = {
    SAFCOM: {
      description: "Safaricom PLC is a leading mobile network operator in Kenya providing mobile telephony, mobile money transfer (M-Pesa), and wireless data services. It is the largest telecommunications provider in Kenya.",
      sector: "Telecommunications",
      headquarters: "Nairobi, Kenya",
      ceo: "Peter Ndegwa",
      employees: "6,500+",
      founded: "1997"
    },
    EQTY: {
      description: "Equity Group Holdings PLC is a leading financial services group in East and Central Africa, providing banking, insurance, and investment services through its subsidiaries.",
      sector: "Banking & Financial Services",
      headquarters: "Nairobi, Kenya", 
      ceo: "James Mwangi",
      employees: "15,000+",
      founded: "1984"
    },
    KCB: {
      description: "KCB Group PLC is the largest commercial bank in Kenya and East Africa by assets, offering a wide range of banking and financial services.",
      sector: "Banking & Financial Services",
      headquarters: "Nairobi, Kenya",
      ceo: "Paul Russo",
      employees: "10,000+",
      founded: "1896"
    },
    COOP: {
      description: "Co-operative Bank of Kenya is a major commercial bank serving retail and corporate customers, with a strong focus on the cooperative movement.",
      sector: "Banking & Financial Services",
      headquarters: "Nairobi, Kenya",
      ceo: "Gideon Muriuki",
      employees: "4,500+",
      founded: "1965"
    },
    SCBK: {
      description: "Standard Chartered Bank Kenya Limited is a leading financial services provider in Kenya, offering a wide range of banking products and services to personal, corporate, and institutional clients.",
      sector: "Banking & Financial Services",
      headquarters: "Nairobi, Kenya",
      ceo: "Kariuki Ngari",
      employees: "1,200+",
      founded: "1911"
    },
    ABSA: {
      description: "ABSA Bank Kenya PLC (formerly Barclays Bank Kenya) is a leading financial services provider offering personal and business banking solutions.",
      sector: "Banking & Financial Services",
      headquarters: "Nairobi, Kenya",
      ceo: "Abdi Mohamed",
      employees: "2,500+",
      founded: "1916"
    },
    NCBA: {
      description: "NCBA Group PLC was formed from the merger of NIC Bank and CBA Group, creating one of Kenya's largest banks by customer deposits.",
      sector: "Banking & Financial Services",
      headquarters: "Nairobi, Kenya",
      ceo: "John Gachora",
      employees: "3,000+",
      founded: "2019"
    },
    EABL: {
      description: "East African Breweries Limited is the largest brewer in East Africa, producing and distributing a wide range of alcoholic and non-alcoholic beverages including Tusker, Guinness, and Bell lager.",
      sector: "Manufacturing & Allied",
      headquarters: "Nairobi, Kenya",
      ceo: "Jane Karuku",
      employees: "4,000+",
      founded: "1922"
    },
    BAT: {
      description: "British American Tobacco Kenya PLC is a leading tobacco company manufacturing and distributing cigarettes and tobacco products in Kenya and the East African region.",
      sector: "Manufacturing & Allied",
      headquarters: "Nairobi, Kenya",
      ceo: "Crispin Achola",
      employees: "800+",
      founded: "1907"
    },
    KPLC: {
      description: "Kenya Power and Lighting Company is the sole electricity distribution company in Kenya, responsible for transmission, distribution, and retail of electricity.",
      sector: "Energy & Petroleum",
      headquarters: "Nairobi, Kenya",
      ceo: "Joseph Siror",
      employees: "12,000+",
      founded: "1922"
    },
    KEGN: {
      description: "Kenya Electricity Generating Company (KenGen) is the largest electricity generator in Kenya, producing about 70% of the electricity consumed in the country.",
      sector: "Energy & Petroleum",
      headquarters: "Nairobi, Kenya",
      ceo: "Rebecca Miano",
      employees: "2,500+",
      founded: "1954"
    },
    BAMB: {
      description: "Bamburi Cement PLC is Kenya's leading cement manufacturer, producing and distributing cement and other construction materials across East Africa.",
      sector: "Construction & Allied",
      headquarters: "Nairobi, Kenya",
      ceo: "Karl-Jan Vissers",
      employees: "1,500+",
      founded: "1951"
    },
    NMG: {
      description: "Nation Media Group is the largest private media house in East and Central Africa, operating newspapers, television, radio, and digital platforms.",
      sector: "Commercial & Services",
      headquarters: "Nairobi, Kenya",
      ceo: "Stephen Gitagama",
      employees: "2,000+",
      founded: "1959"
    },
  };

  const company = companyInfo[symbol as keyof typeof companyInfo] || {
    description: `${stock.name} is a company listed on the Nairobi Securities Exchange in the ${stock.sector} sector.`,
    sector: stock.sector,
    headquarters: "Nairobi, Kenya",
    ceo: "N/A",
    employees: "N/A",
    founded: "N/A"
  };

  

  const handleWatchlistToggle = async () => {
    if (!symbol) return;
    
    const isCurrentlyWatchlisted = isInWatchlist(symbol);
    
    if (isCurrentlyWatchlisted) {
      const result = await removeFromWatchlist(symbol);
      if (result?.error) {
        toast({
          title: "Error",
          description: "Failed to remove from watchlist",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Removed from watchlist",
        });
      }
    } else {
      const result = await addToWatchlist(symbol, stock.name);
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Added to watchlist",
        });
      }
    }
  };

  const timeframes = ["1D", "5D", "1M", "3M", "6M", "1Y", "ALL"];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="tap-scale"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{symbol}</span>
                <span className={`text-sm font-medium ${stock.isUp ? 'text-bull' : 'text-bear'}`}>
                  {stock.isUp ? '+' : ''}{stock.changePercent}%
                </span>
              </div>
              <div className="text-sm text-muted-foreground">KES {stock.price.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleWatchlistToggle}
              className="bg-primary/10 rounded-full tap-scale"
            >
              <Heart className={`h-5 w-5 transition-all ${isInWatchlist(symbol || '') ? 'fill-primary text-primary scale-110' : 'text-primary'}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-accent/10 rounded-full tap-scale"
              onClick={() => navigate(`/news?stock=${symbol}`)}
            >
              <Newspaper className="h-5 w-5 text-accent" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Stock Header */}
        <div className="space-y-2 animate-fade-in">
          <div>
            <h1 className="text-xl font-bold">{symbol}</h1>
            <p className="text-sm text-muted-foreground">{stock.name}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">{stock.exchange}</Badge>
            <Badge variant="outline" className="text-xs">{stock.sector}</Badge>
          </div>
          
          <MarketStatusIndicator />
          
          <div className="text-3xl font-bold">
            KES {stock.price.toFixed(2)}
          </div>
          <div className={`text-base font-medium flex items-center space-x-1 ${stock.isUp ? 'text-bull' : 'text-bear'}`}>
            <span>{stock.isUp ? '+' : ''}KES {stock.change.toFixed(2)} ({stock.changePercent}%)</span>
          </div>
        </div>

        {/* Market Data Collapsible */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/20 rounded-lg">
            <span className="font-medium">Market Data</span>
            <span className="text-xs text-muted-foreground">▼</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/10 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Open</span>
                  <span className="text-xs font-medium">KES {stock.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Volume</span>
                  <span className="text-xs font-medium">2.3M</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">High</span>
                  <span className="text-xs font-medium">KES {(stock.price * 1.02).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Low</span>
                  <span className="text-xs font-medium">KES {(stock.price * 0.98).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 animate-fade-in">
          <Button 
            variant="outline" 
            className="h-12 flex-col py-2 tap-scale"
            onClick={() => setShowAlertsDialog(true)}
          >
            <Bell className="h-4 w-4 mb-0.5" />
            <span className="text-xs">Alert</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-12 flex-col py-2 tap-scale"
            onClick={() => setShowAddTradeDialog(true)}
          >
            <Plus className="h-4 w-4 mb-0.5" />
            <span className="text-xs">Add Trade</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-12 flex-col py-2 tap-scale"
            onClick={() => navigate(`/compare?stock=${symbol}`)}
          >
            <GitCompare className="h-4 w-4 mb-0.5" />
            <span className="text-xs">Compare</span>
          </Button>
        </div>

        {/* Price Alerts Dialog */}
        {showAlertsDialog && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg w-full max-w-md max-h-[80vh] overflow-auto">
              <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Price Alerts</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAlertsDialog(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="p-4">
                <PriceAlertsManager initialSymbol={symbol} />
              </div>
            </div>
          </div>
        )}

        {/* Add Trade Dialog */}
        {showAddTradeDialog && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg w-full max-w-md max-h-[80vh] overflow-auto">
              <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Add Trade</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAddTradeDialog(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="p-4">
                <AddTradeDialog 
                  onTradeAdded={async (sym, name, shares, avgCost, sector) => {
                    const result = await addToPortfolio(sym, name, shares, avgCost, sector);
                    if (!result.error) {
                      setShowAddTradeDialog(false);
                    }
                    return result;
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Timeframe Buttons */}
        <div className="flex space-x-1">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant={tf === selectedTimeframe ? "default" : "ghost"}
              size="sm"
              className={`h-9 px-3 text-xs flex-1 ${tf === selectedTimeframe ? 'bg-primary hover:bg-primary/90' : ''}`}
              onClick={() => setSelectedTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>

        {/* Chart */}
        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="h-64">
              <StockPriceChart symbol={symbol} timeframe={selectedTimeframe} />
            </div>
            <div className="text-center text-sm text-muted-foreground mt-2">
              Chart for {selectedTimeframe} timeframe
            </div>
          </CardContent>
        </Card>

        {/* Key Stats */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-sm">Key Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Market Cap</span>
                  <span className="text-xs font-medium">{stock.marketCap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">P/E Ratio</span>
                  <span className="text-xs font-medium">{stock.pe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">EPS</span>
                  <span className="text-xs font-medium">{stock.eps}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Dividend</span>
                  <span className="text-xs font-medium">{stock.dividend}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">52W High</span>
                  <span className="text-xs font-medium">{stock.high52}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">52W Low</span>
                  <span className="text-xs font-medium">{stock.low52}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analyst Ratings */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Award className="h-4 w-4 text-accent" />
              <span>Analyst Ratings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnalystRatings currentPrice={stock.price} />
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-1">
            <TabsTrigger value="overview" className="text-xs px-2">Overview</TabsTrigger>
            <TabsTrigger value="financials" className="text-xs px-2">Financials</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs px-2">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3 mt-4">
            {/* Trade Overview */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-accent" />
                  <span>Trade Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-muted/20 rounded">
                    <div className="text-xs text-muted-foreground">Open</div>
                    <div className="text-xs font-medium">KES {stock.price.toFixed(2)}</div>
                  </div>
                  <div className="text-center p-2 bg-muted/20 rounded">
                    <div className="text-xs text-muted-foreground">Volume</div>
                    <div className="text-xs font-medium">2.3M</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Money Flow */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-bull" />
                  <span>Money Flow</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-bull">Inflow</span>
                  <span className="text-xs font-medium text-bull">65%</span>
                </div>
                <div className="w-full bg-muted/20 rounded-full h-2 mb-2">
                  <div className="bg-bull h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-bear">Outflow</span>
                  <span className="text-xs font-medium text-bear">35%</span>
                </div>
              </CardContent>
            </Card>

            {/* Technical Sentiment */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Target className="h-4 w-4 text-accent" />
                  <span>Technical Sentiment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs">Bullish</span>
                  <Badge variant="default" className="text-xs">Strong Buy</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  RSI: 68.2 | MACD: Bullish | Moving Avg: Above 50D
                </div>
              </CardContent>
            </Card>

            {/* Short Interest */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-sm">Short Interest</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Short %</span>
                  <span className="text-xs font-medium">2.1%</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="space-y-3 mt-4">
            <Tabs defaultValue="analytics" className="w-full">
              <TabsList className="grid w-full grid-cols-5 h-12">
                <TabsTrigger value="analytics" className="flex flex-col items-center gap-0.5 py-2">
                  <Award className="h-4 w-4" />
                  <span className="text-[9px]">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="estimates" className="flex flex-col items-center gap-0.5 py-2">
                  <Target className="h-4 w-4" />
                  <span className="text-[9px]">Estimates</span>
                </TabsTrigger>
                <TabsTrigger value="statements" className="flex flex-col items-center gap-0.5 py-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-[9px]">Statements</span>
                </TabsTrigger>
                <TabsTrigger value="shareholders" className="flex flex-col items-center gap-0.5 py-2">
                  <Users className="h-4 w-4" />
                  <span className="text-[9px]">Holders</span>
                </TabsTrigger>
                <TabsTrigger value="dividends" className="flex flex-col items-center gap-0.5 py-2">
                  <Banknote className="h-4 w-4" />
                  <span className="text-[9px]">Dividends</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="space-y-3 mt-4">
                {/* Analyst Ratings */}
                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Award className="h-4 w-4 text-accent" />
                      <span>Analyst Ratings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-bull/20 rounded">
                        <div className="text-xs text-bull font-medium">Buy</div>
                        <div className="text-xs">8</div>
                      </div>
                      <div className="p-2 bg-muted/20 rounded">
                        <div className="text-xs font-medium">Hold</div>
                        <div className="text-xs">3</div>
                      </div>
                      <div className="p-2 bg-bear/20 rounded">
                        <div className="text-xs text-bear font-medium">Sell</div>
                        <div className="text-xs">1</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Indicators */}
                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle className="text-sm">Key Financial Indicators</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">ROE</span>
                          <span className="text-xs font-medium">18.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">ROA</span>
                          <span className="text-xs font-medium">12.3%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">EBITDA Margin</span>
                          <span className="text-xs font-medium">45.2%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">FCF</span>
                          <span className="text-xs font-medium">KES 89.2B</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">P/B Ratio</span>
                          <span className="text-xs font-medium">2.8</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Debt/Equity</span>
                          <span className="text-xs font-medium">0.25</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="estimates" className="space-y-3 mt-4">
                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle className="text-sm">Earnings Estimates</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Q4 2024 Est.</span>
                        <span className="text-xs font-medium">KES 1.12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">FY 2024 Est.</span>
                        <span className="text-xs font-medium">KES 4.85</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="statements" className="space-y-3 mt-4">
                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-accent" />
                      <span>Financial Statements</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Revenue (TTM)</span>
                        <span className="text-xs font-medium">KES 328.5B</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Net Income (TTM)</span>
                        <span className="text-xs font-medium">KES 68.2B</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Total Assets</span>
                        <span className="text-xs font-medium">KES 512.8B</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shareholders" className="space-y-3 mt-4">
                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <UserCheck className="h-4 w-4 text-accent" />
                      <span>Major Shareholders</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Institutional</span>
                        <span className="text-xs font-medium">45.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Retail</span>
                        <span className="text-xs font-medium">32.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Government</span>
                        <span className="text-xs font-medium">22.0%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dividends" className="space-y-3 mt-4">
                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Banknote className="h-4 w-4 text-accent" />
                      <span>Dividend History</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Annual Dividend</span>
                        <span className="text-xs font-medium">KES {stock.dividend}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Dividend Yield</span>
                        <span className="text-xs font-medium">{((parseFloat(stock.dividend) / stock.price) * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Payout Ratio</span>
                        <span className="text-xs font-medium">45.8%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="profile" className="space-y-3 mt-4">
            {/* Company Description */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Building className="h-4 w-4 text-accent" />
                  <span>About {stock.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {company.description}
                </p>
              </CardContent>
            </Card>

            {/* Company Details */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-accent" />
                  <span>Company Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Sector</div>
                      <div className="text-xs font-medium">{company.sector}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Headquarters</div>
                      <div className="text-xs font-medium">{company.headquarters}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <UserCheck className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">CEO</div>
                      <div className="text-xs font-medium">{company.ceo}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Employees</div>
                      <div className="text-xs font-medium">{company.employees}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Founded</div>
                      <div className="text-xs font-medium">{company.founded}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
