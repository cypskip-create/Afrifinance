import { useState } from "react";
import { 
  Newspaper, Filter, Clock, TrendingUp, Building2, Bookmark, BookmarkCheck,
  Play, Share2, ThumbsUp, MessageCircle, Bell, BellOff, ChevronRight,
  Flame, Globe, DollarSign, BarChart3, Zap, Eye, ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function News() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [savedArticles, setSavedArticles] = useState<number[]>([]);
  const [followedTopics, setFollowedTopics] = useState<string[]>(["earnings", "stocks"]);

  const newsCategories = [
    { id: "for-you", label: "For You", icon: Zap },
    { id: "latest", label: "Latest", icon: Clock },
    { id: "trending", label: "Trending", icon: Flame },
    { id: "earnings", label: "Earnings", icon: TrendingUp },
    { id: "economy", label: "Economy", icon: Globe },
    { id: "stocks", label: "Stocks", icon: BarChart3 },
  ];

  const liveNews = {
    isLive: true,
    title: "LIVE: CBK Press Conference on Monetary Policy",
    viewers: 1243,
    source: "CBK Official",
  };

  const breakingNews = {
    id: 0,
    title: "KCB Group announces strategic partnership with fintech startup to enhance digital banking services across East Africa",
    summary: "Major banking group partners with leading fintech to revolutionize digital banking, targeting 5 million new users by 2025",
    source: "Capital Markets",
    time: "Just now",
    category: "latest",
    imageUrl: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=400&h=250&fit=crop",
    isBreaking: true,
    readTime: "3 min",
    views: 12450,
    likes: 342,
    comments: 89,
  };

  const newsItems = [
    {
      id: 1,
      title: "Safaricom Reports Strong Q3 Results, M-Pesa Revenue Surges 23%",
      summary: "Kenya's largest telco posts 12% growth in revenue driven by M-Pesa expansion into Ethiopia market",
      source: "Business Daily",
      time: "2 hours ago",
      category: "earnings",
      imageUrl: "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=400&h=250&fit=crop",
      readTime: "5 min",
      views: 8920,
      likes: 234,
      comments: 56,
      hasVideo: true,
      stockMentions: ["SAFCOM"],
    },
    {
      id: 2,
      title: "NSE 20 Index Hits New Monthly High on Banking Rally",
      summary: "Banking and telecom sectors lead market rally amid positive investor sentiment and foreign inflows",
      source: "Capital FM",
      time: "4 hours ago",
      category: "trending",
      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
      readTime: "4 min",
      views: 6540,
      likes: 189,
      comments: 42,
      stockMentions: ["EQTY", "KCB", "COOP"],
    },
    {
      id: 3,
      title: "Central Bank Maintains Rates at 12.5% Amid Stable Inflation",
      summary: "CBK keeps policy rate unchanged citing stable inflation outlook and improved forex reserves",
      source: "The Star",
      time: "6 hours ago",
      category: "economy",
      imageUrl: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=400&h=250&fit=crop",
      readTime: "6 min",
      views: 4320,
      likes: 156,
      comments: 78,
    },
    {
      id: 4,
      title: "Equity Bank Expands to South Sudan in Regional Push",
      summary: "Regional banking group opens new subsidiary as part of aggressive expansion strategy in East Africa",
      source: "Standard",
      time: "8 hours ago",
      category: "stocks",
      imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop",
      readTime: "4 min",
      views: 3890,
      likes: 98,
      comments: 34,
      stockMentions: ["EQTY"],
    },
    {
      id: 5,
      title: "Analysis: What Rising Global Oil Prices Mean for Kenya Power",
      summary: "Expert analysis on impact of geopolitical tensions on energy costs and KPLC stock outlook",
      source: "Reuters",
      time: "10 hours ago",
      category: "stocks",
      imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=250&fit=crop",
      readTime: "8 min",
      views: 2450,
      likes: 67,
      comments: 23,
      stockMentions: ["KPLC", "KEGN"],
      isPremium: true,
    },
  ];

  const trendingTopics = [
    { tag: "#NSEMomentum", count: "2.4K" },
    { tag: "#Safaricom", count: "1.8K" },
    { tag: "#KenyaEconomy", count: "1.2K" },
    { tag: "#Earnings2024", count: "890" },
    { tag: "#CryptoKenya", count: "756" },
  ];

  const toggleSave = (id: number) => {
    setSavedArticles(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
    toast({
      title: savedArticles.includes(id) ? "Removed from saved" : "Article saved",
      description: savedArticles.includes(id) ? "Article removed from your library" : "You can find it in your saved articles",
    });
  };

  const toggleFollowTopic = (topic: string) => {
    setFollowedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const filteredNews = (category: string) => {
    if (category === "for-you") {
      return newsItems.filter(item => 
        followedTopics.some(topic => item.category === topic || item.stockMentions?.some(s => s.toLowerCase().includes(topic)))
      );
    }
    if (category === "latest" || category === "trending") {
      return newsItems;
    }
    return newsItems.filter(item => item.category === category);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-bold flex items-center space-x-2">
              <Newspaper className="h-5 w-5 text-primary" />
              <span>News</span>
            </h1>
            <p className="text-xs text-muted-foreground">Market updates & insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="tap-scale relative">
              <Bookmark className="h-4 w-4" />
              {savedArticles.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                  {savedArticles.length}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="tap-scale">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Live News Banner */}
        {liveNews.isLive && (
          <Card className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border-red-500/20 overflow-hidden">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full" />
                  LIVE
                </div>
                <div>
                  <p className="text-sm font-medium line-clamp-1">{liveNews.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{liveNews.source}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {liveNews.viewers.toLocaleString()} watching
                    </span>
                  </p>
                </div>
              </div>
              <Button size="sm" className="bg-red-500 hover:bg-red-600">
                <Play className="h-3 w-3 mr-1" />
                Watch
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Breaking News - Large Feature Card */}
        <Card className="bg-gradient-accent border-0 overflow-hidden tap-scale cursor-pointer">
          <CardContent className="p-0">
            <div className="relative">
              <img 
                src={breakingNews.imageUrl} 
                alt={breakingNews.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <Badge className="bg-red-500 text-white animate-pulse">BREAKING</Badge>
                <Badge variant="secondary" className="bg-black/50 text-white">{breakingNews.readTime} read</Badge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{breakingNews.title}</h3>
                <p className="text-white/80 text-sm mb-3 line-clamp-2">{breakingNews.summary}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white/70 text-xs">
                    <span className="font-medium text-white">{breakingNews.source}</span>
                    <span>{breakingNews.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={(e) => { e.stopPropagation(); toggleSave(breakingNews.id); }}
                    >
                      {savedArticles.includes(breakingNews.id) ? (
                        <BookmarkCheck className="h-4 w-4" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trending Topics */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Trending Topics
            </h3>
            <Button variant="ghost" size="sm" className="text-xs h-7">
              See all
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2">
              {trendingTopics.map((topic, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors py-1.5 px-3"
                  onClick={() => toggleFollowTopic(topic.tag)}
                >
                  {topic.tag}
                  <span className="ml-1.5 text-muted-foreground text-[10px]">{topic.count}</span>
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* News Categories */}
        <Tabs defaultValue="for-you" className="w-full">
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="inline-flex h-10 w-max bg-muted/30 p-1">
              {newsCategories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex items-center gap-1.5 px-4 data-[state=active]:bg-background"
                >
                  <category.icon className="h-3.5 w-3.5" />
                  <span className="text-xs">{category.label}</span>
                  {followedTopics.includes(category.id) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {newsCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-3 mt-4">
              {filteredNews(category.id).length === 0 ? (
                <Card className="card-gradient">
                  <CardContent className="p-8 text-center">
                    <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">No articles yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Follow topics to see personalized news here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNews(category.id).map((article) => (
                  <Card 
                    key={article.id} 
                    className="card-gradient overflow-hidden tap-scale cursor-pointer transition-all duration-200 hover:shadow-lg"
                  >
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="relative w-28 flex-shrink-0">
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-full object-cover min-h-[110px]"
                          />
                          {article.hasVideo && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                                <Play className="h-4 w-4 text-foreground ml-0.5" />
                              </div>
                            </div>
                          )}
                          {article.isPremium && (
                            <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px]">
                              PRO
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 p-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-medium text-primary">{article.source}</span>
                              <span className="text-xs text-muted-foreground">{article.time}</span>
                            </div>
                            <h3 className="font-semibold text-sm line-clamp-2 leading-tight mb-1.5">
                              {article.title}
                            </h3>
                            {article.stockMentions && article.stockMentions.length > 0 && (
                              <div className="flex gap-1 mb-2">
                                {article.stockMentions.map((stock) => (
                                  <Badge 
                                    key={stock} 
                                    variant="outline" 
                                    className="text-[10px] px-1.5 py-0 cursor-pointer hover:bg-primary/10"
                                    onClick={(e) => { e.stopPropagation(); navigate(`/stock/${stock}`); }}
                                  >
                                    ${stock}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {(article.views / 1000).toFixed(1)}K
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                {article.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {article.comments}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={(e) => { e.stopPropagation(); toggleSave(article.id); }}
                              >
                                {savedArticles.includes(article.id) ? (
                                  <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
                                ) : (
                                  <Bookmark className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <Share2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Topic Follow Suggestion */}
        <Card className="card-gradient border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Get Personalized News</h4>
                  <p className="text-xs text-muted-foreground">Follow topics you care about</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Customize
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
