import { useState, useEffect } from "react";
import { Users, Trophy, MessageCircle, BookOpen, TrendingUp, Hash, Play, PieChart, Coffee, Heart, Repeat2, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopBar } from "@/components/shared/TopBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { usePosts, Post } from "@/hooks/usePosts";
import { useFollows } from "@/hooks/useFollows";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TopTrader {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  posts_count: number;
}

export default function Discover() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { posts, loading: postsLoading, likePost } = usePosts();
  const { isFollowing, toggleFollow } = useFollows();
  const [feedTab, setFeedTab] = useState("latest");
  const [topTraders, setTopTraders] = useState<TopTrader[]>([]);

  const portfolioInsights = {
    totalReturn: "+24.5%",
    holdings: ["SAFCOM", "EQTY", "KCB"],
    topGainer: "EQTY",
    gainPercent: "+13.2%"
  };

  const courses = [
    { 
      title: "Stock Market Basics", 
      progress: 0, 
      lessons: 12, 
      duration: "2 hours",
      level: "Beginner",
      type: "video"
    },
    { 
      title: "Technical Analysis", 
      progress: 40, 
      lessons: 8, 
      duration: "3 hours",
      level: "Intermediate",
      type: "text"
    },
    { 
      title: "Portfolio Management", 
      progress: 100, 
      lessons: 10, 
      duration: "2.5 hours",
      level: "Advanced",
      type: "audio"
    },
  ];

  useEffect(() => {
    fetchTopTraders();
  }, []);

  const fetchTopTraders = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, avatar_url')
      .limit(10);

    if (profiles) {
      const tradersWithCounts = await Promise.all(
        profiles.map(async (profile) => {
          const { count } = await supabase
            .from('posts')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', profile.user_id);
          return { ...profile, posts_count: count || 0 };
        })
      );
      
      setTopTraders(
        tradersWithCounts
          .sort((a, b) => b.posts_count - a.posts_count)
          .slice(0, 5)
      );
    }
  };

  // Filter posts based on feed tab
  const getFilteredPosts = () => {
    let filtered = [...posts];
    
    if (feedTab === "latest") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (feedTab === "top") {
      filtered.sort((a, b) => (b.likes_count + b.reposts_count) - (a.likes_count + a.reposts_count));
    } else if (feedTab === "following") {
      filtered = filtered.filter(post => isFollowing(post.user_id));
    }
    
    return filtered.slice(0, 5);
  };

  const filteredPosts = getFilteredPosts();

  const handleLike = async (postId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    await likePost(postId);
  };

  const handleFollow = async (targetUserId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const { error } = await toggleFollow(targetUserId);
    if (!error) {
      toast({ title: isFollowing(targetUserId) ? "Unfollowed" : "Following!" });
    }
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const renderPostContent = (content: string) => {
    return content.split(/(\$[A-Z]+|#\w+)/g).map((part, i) => {
      if (part.startsWith('$')) {
        return (
          <span 
            key={i} 
            className="text-primary font-medium cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/stock/${part.slice(1)}`);
            }}
          >
            {part}
          </span>
        );
      } else if (part.startsWith('#')) {
        return (
          <span key={i} className="text-primary cursor-pointer hover:underline">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title="Discover" 
        subtitle="Social investing & learning"
        showSearch={true}
        showNotifications={true}
      />

      <div className="p-4 space-y-4 stagger-children">
        {/* Large Insights Card */}
        <Card className="card-hero cursor-pointer" onClick={() => navigate('/track-investments')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-sm">Portfolio Insights</h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                {portfolioInsights.totalReturn}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">Top Holdings</div>
                <div className="flex space-x-1">
                  {portfolioInsights.holdings.map((stock) => (
                    <Badge key={stock} variant="outline" className="text-xs px-1">
                      {stock}
                    </Badge>
                  ))}
                </div>
                <div className="mt-2 text-xs">
                  <span className="text-muted-foreground">Best: </span>
                  <span className="text-bull font-medium">
                    {portfolioInsights.topGainer} {portfolioInsights.gainPercent}
                  </span>
                </div>
              </div>
              
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <PieChart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2-Column Grid of Main Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="card-gradient cursor-pointer" onClick={() => navigate('/traders-hub')}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <h4 className="font-semibold text-sm">TradersHub</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Connect & interact with traders
              </p>
              <div className="text-xs">
                <div className="flex items-center space-x-1 text-accent">
                  <Users className="h-3 w-3" />
                  <span>1.2K active traders</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient cursor-pointer" onClick={() => navigate('/learn')}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h4 className="font-semibold text-sm">Learn</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Investment courses & guides
              </p>
              <div className="text-xs">
                <div className="flex items-center space-x-1 text-accent">
                  <Play className="h-3 w-3" />
                  <span>12 courses available</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient cursor-pointer" onClick={() => navigate('/track-investments')}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h4 className="font-semibold text-sm">My Investments</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Track your portfolio
              </p>
              <div className="text-xs">
                <div className="flex items-center space-x-1 text-accent">
                  <PieChart className="h-3 w-3" />
                  <span>View holdings</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient cursor-pointer" onClick={() => navigate('/rooms')}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Hash className="h-4 w-4 text-primary" />
                <h4 className="font-semibold text-sm">Rooms</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Real-time trading rooms
              </p>
              <div className="text-xs">
                <div className="flex items-center space-x-1 text-accent">
                  <Coffee className="h-3 w-3" />
                  <span>3 active rooms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expanded Sections */}
        <Tabs defaultValue="hub" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hub" className="text-xs">Feed</TabsTrigger>
            <TabsTrigger value="learn" className="text-xs">Learn</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs">Top Traders</TabsTrigger>
          </TabsList>

          {/* TradersHub Feed */}
          <TabsContent value="hub" className="space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button 
                  variant={feedTab === "latest" ? "default" : "outline"} 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setFeedTab("latest")}
                >
                  Latest
                </Button>
                <Button 
                  variant={feedTab === "top" ? "default" : "ghost"} 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setFeedTab("top")}
                >
                  Top
                </Button>
                <Button 
                  variant={feedTab === "following" ? "default" : "ghost"} 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setFeedTab("following")}
                >
                  Following
                </Button>
              </div>
              <Button size="sm" className="text-xs" onClick={() => navigate('/traders-hub')}>
                <MessageCircle className="h-3 w-3 mr-1" />
                Post
              </Button>
            </div>

            {postsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/30 border-t-primary" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <Card className="card-gradient">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground text-sm">
                    {feedTab === "following" 
                      ? "Follow traders to see their posts here" 
                      : "No posts yet. Be the first to share!"}
                  </p>
                  <Button className="mt-3" size="sm" onClick={() => navigate('/traders-hub')}>
                    Go to TradersHub
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredPosts.map((post) => (
                <Card key={post.id} className="card-gradient">
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <Avatar 
                        className="h-8 w-8 cursor-pointer"
                        onClick={() => navigate(`/profile/${post.user_id}`)}
                      >
                        <AvatarImage src={post.author?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(post.author?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 
                              className="font-semibold text-xs cursor-pointer hover:underline"
                              onClick={() => navigate(`/profile/${post.user_id}`)}
                            >
                              {post.author?.full_name || 'User'}
                            </h4>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(post.created_at)}
                          </span>
                        </div>
                        <p className="text-xs mb-3">{renderPostContent(post.content)}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <button 
                            className={`flex items-center space-x-1 hover:text-red-500 ${post.is_liked ? 'text-red-500' : ''}`}
                            onClick={() => handleLike(post.id)}
                          >
                            <Heart className={`h-3 w-3 ${post.is_liked ? 'fill-current' : ''}`} />
                            <span>{post.likes_count}</span>
                          </button>
                          <button 
                            className="flex items-center space-x-1 hover:text-primary"
                            onClick={() => navigate('/traders-hub')}
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>{post.comments_count}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-green-500">
                            <Repeat2 className="h-3 w-3" />
                            <span>{post.reposts_count}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Learn Courses */}
          <TabsContent value="learn" className="space-y-3 mt-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="text-xs">Beginner</Button>
                <Button variant="ghost" size="sm" className="text-xs">Intermediate</Button>
                <Button variant="ghost" size="sm" className="text-xs">Advanced</Button>
              </div>
              <Button size="sm" className="text-xs" onClick={() => navigate('/learn')}>
                View All
              </Button>
            </div>

            {courses.slice(0, 3).map((course, index) => (
              <Card key={index} className="card-gradient cursor-pointer" onClick={() => navigate('/learn')}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-xs">{course.title}</h4>
                      <Badge variant="outline" className="text-xs px-1">
                        {course.level}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      {course.type === 'video' && <Play className="h-3 w-3" />}
                      {course.type === 'text' && <BookOpen className="h-3 w-3" />}
                      {course.type === 'audio' && <Coffee className="h-3 w-3" />}
                      <span className="text-xs text-muted-foreground">{course.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{course.lessons} lessons</span>
                    <span className="text-xs text-primary">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div 
                      className="bg-primary rounded-full h-1 transition-all"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Top Traders Insights */}
          <TabsContent value="insights" className="space-y-3 mt-4">
            {topTraders.length === 0 ? (
              <Card className="card-gradient">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground text-sm">No traders to show yet</p>
                </CardContent>
              </Card>
            ) : (
              topTraders.map((trader) => (
                <Card key={trader.id} className="card-gradient">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center space-x-3 cursor-pointer"
                        onClick={() => navigate(`/profile/${trader.user_id}`)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={trader.avatar_url || ""} />
                          <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                            {getInitials(trader.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-xs">{trader.full_name || "Trader"}</div>
                          <div className="text-xs text-muted-foreground">{trader.posts_count} posts</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {user && user.id !== trader.user_id && (
                          <Button 
                            variant={isFollowing(trader.user_id) ? "outline" : "default"} 
                            size="sm" 
                            className="text-xs h-7"
                            onClick={() => handleFollow(trader.user_id)}
                          >
                            {isFollowing(trader.user_id) ? "Following" : (
                              <>
                                <UserPlus className="h-3 w-3 mr-1" />
                                Follow
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
