import { useState, useRef } from "react";
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
  Bookmark, Globe, Lock, MessageCircle, X, Image as ImageIcon,
  Smile, MapPin, Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/shared/TopBar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [activeTab, setActiveTab] = useState("for-you");
  const [searchQuery, setSearchQuery] = useState("");

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

  const suggestedUsers = [
    { name: "James Mwangi", username: "jmwangi_invest", avatar: "JM", bio: "Equity Bank CEO | 20+ years investing", followers: 125000, verified: true },
    { name: "Carole Karuga", username: "carole_stocks", avatar: "CK", bio: "NSE analyst | Daily market insights", followers: 45000, verified: true },
    { name: "Brian Odhiambo", username: "brian_trades", avatar: "BO", bio: "Full-time trader | Options specialist", followers: 18500, verified: false },
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
    toast({ title: "Reposted successfully" });
  };

  const handleBookmark = (postId: number) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, bookmarked: !p.bookmarked } : p
    ));
    const post = posts.find(p => p.id === postId);
    toast({ title: post?.bookmarked ? "Removed from bookmarks" : "Added to bookmarks" });
  };

  const handleShare = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.user.name}`,
          text: post.content.slice(0, 100) + "...",
          url: window.location.href
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard" });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (!newPost.trim() && !selectedImage) return;
    
    setIsPosting(true);
    
    // Simulate posting
    setTimeout(() => {
      const newPostData: Post = {
        id: Date.now(),
        user: {
          name: user?.email?.split('@')[0] || "You",
          username: user?.email?.split('@')[0] || "you",
          avatar: user?.email?.[0].toUpperCase() || "U",
          verified: false,
          followers: 0
        },
        content: newPost,
        image: selectedImage || undefined,
        stockMentions: newPost.match(/\$[A-Z]+/g)?.map(s => s.slice(1)) || [],
        likes: 0,
        reposts: 0,
        replies: 0,
        views: 0,
        time: "now",
        liked: false,
        reposted: false,
        bookmarked: false
      };
      
      setPosts(prev => [newPostData, ...prev]);
      setNewPost("");
      setSelectedImage(null);
      setIsPosting(false);
      toast({ title: "Post published successfully!" });
    }, 1000);
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
        <div className="flex-1 lg:border-r lg:border-border">
          {/* Compose Post */}
          {user ? (
            <Card className="mx-4 mt-4 card-gradient">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea 
                      placeholder="Share your market insights... Use $SYMBOL for stocks"
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="min-h-[80px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 text-sm"
                    />
                    
                    {selectedImage && (
                      <div className="relative mt-3 rounded-xl overflow-hidden">
                        <img src={selectedImage} alt="Selected" className="w-full max-h-60 object-cover rounded-xl" />
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="absolute top-2 right-2 h-8 w-8 rounded-full"
                          onClick={() => setSelectedImage(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div className="flex gap-1">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageSelect}
                          accept="image/*"
                          className="hidden"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="h-5 w-5 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <BarChart3 className="h-5 w-5 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <Hash className="h-5 w-5 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <Smile className="h-5 w-5 text-primary" />
                        </Button>
                      </div>
                      <Button 
                        size="sm" 
                        className="btn-primary h-9 px-4" 
                        disabled={(!newPost.trim() && !selectedImage) || isPosting}
                        onClick={handlePost}
                      >
                        {isPosting ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-1" />
                            Post
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mx-4 mt-4 card-gradient">
              <CardContent className="p-6 text-center">
                <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Join the Community</h3>
                <p className="text-sm text-muted-foreground mb-4">Sign in to share your insights and connect with traders</p>
                <Button className="btn-primary" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
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
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
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
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
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
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.stockMentions.map(stock => (
                          <Badge 
                            key={stock} 
                            variant="secondary" 
                            className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
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

                    {/* Views */}
                    <div className="text-xs text-muted-foreground mb-3">
                      {formatNumber(post.views)} views
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-9 px-3 gap-1.5 ${post.liked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500 hover:bg-red-500/10`}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className={`h-4 w-4 ${post.liked ? 'fill-current' : ''}`} />
                        <span className="text-xs">{formatNumber(post.likes)}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 px-3 gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-xs">{formatNumber(post.replies)}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-9 px-3 gap-1.5 ${post.reposted ? 'text-bull' : 'text-muted-foreground'} hover:text-bull hover:bg-bull/10`}
                        onClick={() => handleRepost(post.id)}
                      >
                        <Repeat2 className="h-4 w-4" />
                        <span className="text-xs">{formatNumber(post.reposts)}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-9 px-3 gap-1.5 ${post.bookmarked ? 'text-primary' : 'text-muted-foreground'} hover:text-primary hover:bg-primary/10`}
                        onClick={() => handleBookmark(post.id)}
                      >
                        <Bookmark className={`h-4 w-4 ${post.bookmarked ? 'fill-current' : ''}`} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 px-3 gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => handleShare(post)}
                      >
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
                  <Button onClick={() => setActiveTab("trending")} className="btn-primary">
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
                    <div 
                      key={topic.tag} 
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground font-medium w-4">{idx + 1}</span>
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
                    <div key={trader.username} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
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

              {/* Who to Follow */}
              <Card className="card-gradient">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Who to Follow
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {suggestedUsers.map((user) => (
                    <div key={user.username} className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-accent text-accent-foreground">
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-sm truncate">{user.name}</span>
                          {user.verified && <Verified className="h-3 w-3 text-primary fill-primary flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{user.bio}</p>
                      </div>
                      <Button size="sm" className="btn-primary h-8 flex-shrink-0">
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
            <Input 
              placeholder="Search TradersHub"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Trending on Desktop */}
          <Card className="card-gradient">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Trending Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {trendingTopics.slice(0, 3).map((topic) => (
                <div key={topic.tag} className="text-sm cursor-pointer hover:text-primary transition-colors">
                  #{topic.tag}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
