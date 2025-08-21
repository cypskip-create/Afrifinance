import { Newspaper, Filter, Clock, TrendingUp, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function News() {
  const newsCategories = [
    { id: "latest", label: "Latest", icon: Clock },
    { id: "earnings", label: "Earnings", icon: TrendingUp },
    { id: "economy", label: "Economy", icon: Building2 },
    { id: "companies", label: "Companies", icon: Building2 },
  ];

  const newsItems = [
    {
      title: "Safaricom Reports Strong Q3 Results",
      summary: "Kenya's largest telco posts 12% growth in revenue driven by M-Pesa expansion",
      source: "Business Daily",
      time: "2 hours ago",
      category: "earnings",
      image: "📱"
    },
    {
      title: "NSE 20 Index Hits New Monthly High",
      summary: "Banking and telecom sectors lead market rally amid positive investor sentiment",
      source: "Capital FM",
      time: "4 hours ago",
      category: "latest",
      image: "📈"
    },
    {
      title: "Central Bank Maintains Rates at 12.5%",
      summary: "CBK keeps policy rate unchanged citing stable inflation outlook",
      source: "The Star",
      time: "6 hours ago",
      category: "economy",
      image: "🏛️"
    },
    {
      title: "Equity Bank Expands to South Sudan",
      summary: "Regional banking group opens new subsidiary as part of expansion strategy",
      source: "Standard",
      time: "8 hours ago",
      category: "companies",
      image: "🏦"
    },
  ];

  const filteredNews = (category: string) => {
    if (category === "latest") return newsItems;
    return newsItems.filter(item => item.category === category);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-primary flex items-center space-x-2">
              <Newspaper className="h-5 w-5" />
              <span>Market News</span>
            </h1>
            <p className="text-sm text-muted-foreground">Stay updated with latest market developments</p>
          </div>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="p-4">
        {/* News Categories */}
        <Tabs defaultValue="latest" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            {newsCategories.map((category) => (
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

          {newsCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              {filteredNews(category.id).map((article, index) => (
                <Card key={index} className="card-gradient hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <div className="text-2xl">{article.image}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {article.summary}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-medium">{article.source}</span>
                          <span>{article.time}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {/* Breaking News Alert */}
        <Card className="bg-gradient-accent mt-6 border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center space-x-2">
              <div className="animate-pulse w-2 h-2 bg-white rounded-full"></div>
              <span>Breaking News</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-white/90 text-sm">
              KCB Group announces strategic partnership with fintech startup to enhance digital banking services
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}