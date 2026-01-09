import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, TrendingUp, MessageSquare, Award, ArrowLeft, Heart, 
  Repeat2, Share, MoreHorizontal, ImagePlus, BarChart3, Send,
  Flame, Hash, Search, Verified, ChartLine, Bell, UserPlus,
  Bookmark, Globe, Lock, MessageCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/shared/TopBar";
import { useAuth } from "@/hooks/useAuth";

interface Post {
  id: number;
  user: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    followers: number;
  };
  content: string;
  image?: string;
  stockMentions?: string[];
  likes: number;
  reposts: number;
  replies: number;
  views: number;
  time: string;
  liked: boolean;
  reposted: boolean;
  bookmarked: boolean;
}

export default function TradersHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newPost, setNewPost] = useState("");
  const [activeTab, setActiveTab] = useState("for-you");

  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      user: { name: "John Kamau", username: "jkamau", avatar: "JK", verified: true, followers: 12500 },
      content: "🚀 $SAFCOM showing strong momentum! The M-Pesa expansion into Ethiopia is a game changer. My price target: KES 15.50 by Q2.\n\nKey catalysts:\n• Growing subscriber base\n• Fintech innovations\n• Regional expansion\n\n#NSE #KenyanStocks",
      stockMentions: ["SAFCOM"],
      likes: 342,
      reposts: 89,
      replies: 45,
      views: 12400,
      time: "2h",
      liked: false,
      reposted: false,
      bookmarked: false
    },
    {
      id: 2,
      user: { name: "Mary Wanjiru", username: "mwanjiru", avatar: "MW", verified: true, followers: 8900 },
      content: "Banking sector update 📊\n\n$EQTY and $KCB both reporting strong Q3 earnings. Equity Group's digital transformation paying off with 78% of transactions now on mobile.\n\nI'm bullish on Kenyan banks long-term. Who else is accumulating?",
      stockMentions: ["EQTY", "KCB"],
      likes: 218,
      reposts: 56,
      replies: 32,
      views: 8700,
      time: "4h",
      liked: true,
      reposted: false,
      bookmarked: true
    },
    {
      id: 3,
      user: { name: "David Omondi", username: "domondi", avatar: "DO", verified: false, followers: 2100 },
      content: "Just added $BAMB to my portfolio. Cement demand increasing with construction boom in Nairobi. Counter-consensus play but I see 40% upside from current levels. 🧱\n\nRisk: High energy costs\nReward: Infrastructure spending",
      stockMentions: ["BAMB"],
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
      likes: 156,
      reposts: 34,
      replies: 28,
      views: 5600,
      time: "6h",
      liked: false,
      reposted: false,
      bookmarked: false
    },
    {
      id: 4,
      user: { name: "Grace Akinyi", username: "gakinyi", avatar: "GA", verified: true, followers: 6500 },
      content: "⚠️ Market Alert: NSE 20 testing key resistance at 1,850. Watch for breakout or pullback. Setting alerts on major banking stocks.\n\nTechnical setup looking bullish but volume needs to confirm. Trade carefully! 📈",
      likes: 445,
      reposts: 123,
      replies: 67,
      views: 18900,
      time: "8h",
      liked: false,
      reposted: true,
      bookmarked: false
    }
  ]);

  const trendingTopics = [
    { tag: "SafaricomQ4", posts: 1240, trending: true },
    { tag: "NSEDaily", posts: 890 },
    { tag: "KenyanStocks", posts: 756 },
    { tag: "DividendSeason", posts: 543 },
    { tag: "BankingStocks", posts: 432 }
  ];

  const topTraders = [
    { name: "Peter Ndegwa", username: "pndegwa", avatar: "PN", followers: 45200, accuracy: 82, verified: true },
    { name: "Sarah Njeri", username: "snjeri", avatar: "SN", followers: 32100, accuracy: 78, verified: true },
    { name: "Michael Otieno", username: "motieno", avatar: "MO", followers: 28500, accuracy: 75, verified: false }
  ];

  const handleLike = (postId: number) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const handleRepost = (postId: number) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, reposted: !p.reposted, reposts: p.reposted ? p.reposts - 1 : p.reposts + 1 } : p
    ));
  };

  const handleBookmark = (postId: number) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, bookmarked: !p.bookmarked } : p
    ));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title="TradersHub" 
        subtitle="Social trading community"
        showSearch={true}
        showNotifications={true}
      />

      <div className="flex flex-col lg:flex-row">
        {/* Main Feed */}
        <div className="flex-1 border-r border-border">
          {/* Compose Post */}
          {user && (
            <Card className="mx-4 mt-4 card-gradient">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea 
                      placeholder="Share your market insights..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="min-h-[80px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
                    />
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ImagePlus className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <BarChart3 className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Hash className="h-4 w-4 text-primary" />
                        </Button>
                      </div>
                      <Button size="sm" className="btn-primary" disabled={!newPost.trim()}>
                        <Send className="h-4 w-4 mr-1" />
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feed Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 mt-4">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="for-you" className="text-xs">For You</TabsTrigger>
              <TabsTrigger value="following" className="text-xs">Following</TabsTrigger>
              <TabsTrigger value="trending" className="text-xs">Trending</TabsTrigger>
            </TabsList>

            <TabsContent value="for-you" className="mt-4 space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="card-gradient">
                  <CardContent className="p-4">
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {post.user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-sm">{post.user.name}</span>
                            {post.user.verified && <Verified className="h-4 w-4 text-primary fill-primary" />}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>@{post.user.username}</span>
                            <span>·</span>
                            <span>{post.time}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Post Content */}
                    <div className="mb-3">
                      <p className="text-sm whitespace-pre-wrap">
                        {post.content.split(/(\$[A-Z]+)/g).map((part, i) => 
                          part.startsWith('$') ? (
                            <span 
                              key={i} 
                              className="text-primary font-medium cursor-pointer hover:underline"
                              onClick={() => navigate(`/stock/${part.slice(1)}`)}
                            >
                              {part}
                            </span>
                          ) : part.split(/(#\w+)/g).map((hashPart, j) =>
                            hashPart.startsWith('#') ? (
                              <span key={`${i}-${j}`} className="text-primary cursor-pointer hover:underline">
                                {hashPart}
                              </span>
                            ) : hashPart
                          )
                        )}
                      </p>
                    </div>

                    {/* Stock Mentions */}
                    {post.stockMentions && post.stockMentions.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {post.stockMentions.map(stock => (
                          <Badge 
                            key={stock} 
                            variant="secondary" 
                            className="text-xs cursor-pointer"
                            onClick={() => navigate(`/stock/${stock}`)}
                          >
                            <ChartLine className="h-3 w-3 mr-1" />
                            {stock}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Post Image */}
                    {post.image && (
                      <div className="mb-3 rounded-xl overflow-hidden">
                        <img src={post.image} alt="Post" className="w-full h-48 object-cover" />
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-8 px-2 gap-1 ${post.liked ? 'text-red-500' : 'text-muted-foreground'}`}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className={`h-4 w-4 ${post.liked ? 'fill-current' : ''}`} />
                        <span className="text-xs">{formatNumber(post.likes)}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 gap-1 text-muted-foreground"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-xs">{formatNumber(post.replies)}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-8 px-2 gap-1 ${post.reposted ? 'text-bull' : 'text-muted-foreground'}`}
                        onClick={() => handleRepost(post.id)}
                      >
                        <Repeat2 className="h-4 w-4" />
                        <span className="text-xs">{formatNumber(post.reposts)}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-8 px-2 gap-1 ${post.bookmarked ? 'text-primary' : 'text-muted-foreground'}`}
                        onClick={() => handleBookmark(post.id)}
                      >
                        <Bookmark className={`h-4 w-4 ${post.bookmarked ? 'fill-current' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-muted-foreground">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="following" className="mt-4">
              <Card className="card-gradient">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Follow traders to see their posts</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    When you follow traders, their posts will appear here
                  </p>
                  <Button onClick={() => setActiveTab("for-you")}>
                    Discover Traders
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trending" className="mt-4 space-y-4">
              {/* Trending Topics */}
              <Card className="card-gradient">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendingTopics.map((topic, idx) => (
                    <div key={topic.tag} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{idx + 1}</span>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-sm">#{topic.tag}</span>
                            {topic.trending && <Flame className="h-3 w-3 text-orange-500" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{formatNumber(topic.posts)} posts</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Top Traders */}
              <Card className="card-gradient">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    Top Traders This Week
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topTraders.map((trader) => (
                    <div key={trader.username} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {trader.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-sm">{trader.name}</span>
                            {trader.verified && <Verified className="h-3 w-3 text-primary fill-primary" />}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatNumber(trader.followers)} followers</span>
                            <span className="text-bull">{trader.accuracy}% accuracy</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="h-8">
                        <UserPlus className="h-3 w-3 mr-1" />
                        Follow
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-80 p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search TradersHub" className="pl-9" />
          </div>

          {/* Trending */}
          <Card className="card-gradient">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Trending</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {trendingTopics.slice(0, 3).map((topic) => (
                <div key={topic.tag} className="cursor-pointer hover:bg-muted/20 p-2 rounded">
                  <span className="font-medium text-sm">#{topic.tag}</span>
                  <p className="text-xs text-muted-foreground">{formatNumber(topic.posts)} posts</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Who to Follow */}
          <Card className="card-gradient">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Who to follow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topTraders.slice(0, 2).map((trader) => (
                <div key={trader.username} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{trader.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-medium">{trader.name}</p>
                      <p className="text-[10px] text-muted-foreground">@{trader.username}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Follow
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}