import { Newspaper, Filter, Clock, TrendingUp, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

export default function News() {
  const navigate = useNavigate();
  const newsCategories = [
    { id: "latest", label: "Latest", icon: Clock },
    { id: "earnings", label: "Earnings", icon: TrendingUp },
    { id: "economy", label: "Economy", icon: Building2 },
    { id: "companies", label: "Companies", icon: Building2 },
  ];


  const breakingNews = {
    title: "KCB Group announces strategic partnership with fintech startup to enhance digital banking services",
    summary: "Major banking group partners with leading fintech to revolutionize digital banking",
    source: "Capital Markets",
    time: "Just now",
    category: "latest",
    imageUrl: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=400&h=250&fit=crop",
    isBreaking: true
  };

  const newsItems = [
    {
      title: "Safaricom Reports Strong Q3 Results",
      summary: "Kenya's largest telco posts 12% growth in revenue driven by M-Pesa expansion",
      source: "Business Daily",
      time: "2 hours ago",
      category: "earnings",
      imageUrl: "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=400&h=250&fit=crop"
    },
    {
      title: "NSE 20 Index Hits New Monthly High",
      summary: "Banking and telecom sectors lead market rally amid positive investor sentiment",
      source: "Capital FM",
      time: "4 hours ago",
      category: "latest",
      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop"
    },
    {
      title: "Central Bank Maintains Rates at 12.5%",
      summary: "CBK keeps policy rate unchanged citing stable inflation outlook",
      source: "The Star",
      time: "6 hours ago",
      category: "economy",
      imageUrl: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=400&h=250&fit=crop"
    },
    {
      title: "Equity Bank Expands to South Sudan",
      summary: "Regional banking group opens new subsidiary as part of expansion strategy",
      source: "Standard",
      time: "8 hours ago",
      category: "companies",
      imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop"
    },
  ];

  const filteredNews = (category: string) => {
    const filtered = category === "latest" ? newsItems : newsItems.filter(item => item.category === category);
    return [breakingNews, ...filtered];
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-bold flex items-center space-x-2">
              <Newspaper className="h-5 w-5 text-primary" />
              <span>Market News</span>
            </h1>
            <p className="text-xs text-muted-foreground">Latest market developments</p>
          </div>
          <Button variant="ghost" size="icon" className="tap-scale">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="p-4">
        {/* News Categories */}
        <Tabs defaultValue="latest" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 h-9">
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
            <TabsContent key={category.id} value={category.id} className="space-y-3 stagger-children">
              {filteredNews(category.id).map((article, index) => (
                <Card 
                  key={index} 
                  className={`overflow-hidden tap-scale cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    'isBreaking' in article && article.isBreaking 
                      ? 'bg-gradient-accent border-accent/20' 
                      : 'card-gradient'
                  }`}
                >
                  <CardContent className="p-0">
                    {'isBreaking' in article && article.isBreaking && (
                      <div className="flex items-center space-x-2 px-3 pt-3 pb-1">
                        <div className="animate-pulse w-2 h-2 bg-white rounded-full" />
                        <span className="text-xs font-bold text-white tracking-wide">BREAKING</span>
                      </div>
                    )}
                    <div className="flex">
                      {'imageUrl' in article && (
                        <div className="w-20 h-20 flex-shrink-0 m-3 rounded-lg overflow-hidden">
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 py-3 pr-3">
                        <h3 className={`font-semibold mb-1 line-clamp-2 text-sm leading-tight ${
                          'isBreaking' in article && article.isBreaking ? 'text-white' : ''
                        }`}>
                          {article.title}
                        </h3>
                        {'summary' in article && (
                          <p className={`text-xs mb-2 line-clamp-2 leading-relaxed ${
                            'isBreaking' in article && article.isBreaking ? 'text-white/90' : 'text-muted-foreground'
                          }`}>
                            {article.summary}
                          </p>
                        )}
                        <div className={`flex items-center justify-between text-xs ${
                          'isBreaking' in article && article.isBreaking ? 'text-white/80' : 'text-muted-foreground'
                        }`}>
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
      </div>
    </div>
  );
}