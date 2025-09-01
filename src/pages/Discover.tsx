import { Users, Trophy, MessageCircle, ThumbsUp, BookOpen, TrendingUp, Hash, Play, PieChart, Coffee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopBar } from "@/components/shared/TopBar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function Discover() {
  const navigate = useNavigate();

  const portfolioInsights = {
    totalReturn: "+24.5%",
    holdings: ["SAFCOM", "EQTY", "KCB"],
    topGainer: "EQTY",
    gainPercent: "+13.2%"
  };

  const socialPosts = [
    {
      user: "TraderKE_Pro",
      avatar: "TK",
      content: "Just bought more SAFCOM on this dip. Long-term bullish on M-Pesa expansion! 📈",
      likes: 24,
      comments: 8,
      time: "2h ago",
      pinned: false
    },
    {
      user: "InvestorJane",
      avatar: "IJ", 
      content: "Banking sector showing strong fundamentals. KCB and EQTY are my picks for Q4 💪",
      likes: 18,
      comments: 12,
      time: "4h ago",
      pinned: true
    }
  ];

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

  const topTraders = [
    { 
      name: "MarketMaster", 
      return: "+24.5%", 
      followers: 2340, 
      avatar: "MM",
      period: "30D"
    },
    { 
      name: "DividendKing", 
      return: "+18.2%", 
      followers: 1890, 
      avatar: "DK",
      period: "90D"
    },
    { 
      name: "TechInvestor", 
      return: "+31.7%", 
      followers: 1245, 
      avatar: "TI",
      period: "7D"
    },
  ];

  const chatRooms = [
    { 
      name: "NSE Daily Discussion", 
      members: 1247, 
      active: true,
      type: "public"
    },
    { 
      name: "Crypto Kenya", 
      members: 892, 
      active: true,
      type: "public"
    },
    { 
      name: "Banking Sector Talk", 
      members: 456, 
      active: false,
      type: "invite-only"
    },
  ];

  const papertradeStats = {
    activeTraders: 2847,
    topPerformer: "VirtualVictory",
    topReturn: "+45.2%"
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <TopBar 
        title="Discover" 
        subtitle="Social investing & learning hub"
        showSearch={true}
        showAI={true}
        showNotifications={true}
      />

      <div className="p-4 space-y-4">
        {/* Large Insights Card */}
        <Card className="card-hero cursor-pointer" onClick={() => navigate('/insights')}>
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
                  {portfolioInsights.holdings.map((stock, index) => (
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
              
              {/* Mini pie chart placeholder */}
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <PieChart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2-Column Grid of Main Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* TradersHub Card */}
          <Card className="card-gradient cursor-pointer" onClick={() => navigate('/tradershub')}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <h4 className="font-semibold text-sm">TradersHub</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Social trading community
              </p>
              <div className="text-xs">
                <div className="flex items-center space-x-1 text-accent">
                  <MessageCircle className="h-3 w-3" />
                  <span>24 new posts</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learn Card */}
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

          {/* Papertrade Card */}
          <Card className="card-gradient cursor-pointer" onClick={() => navigate('/papertrade')}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h4 className="font-semibold text-sm">Papertrade</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Practice trading risk-free
              </p>
              <div className="text-xs">
                <div className="flex items-center space-x-1 text-accent">
                  <Users className="h-3 w-3" />
                  <span>{papertradeStats.activeTraders} active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chats Card */}
          <Card className="card-gradient cursor-pointer" onClick={() => navigate('/chats')}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Hash className="h-4 w-4 text-primary" />
                <h4 className="font-semibold text-sm">Chats</h4>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hub" className="text-xs">Feed</TabsTrigger>
            <TabsTrigger value="learn" className="text-xs">Courses</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs">Top Traders</TabsTrigger>
            <TabsTrigger value="chats" className="text-xs">Rooms</TabsTrigger>
          </TabsList>

          {/* TradersHub Feed */}
          <TabsContent value="hub" className="space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="text-xs">Latest</Button>
                <Button variant="ghost" size="sm" className="text-xs">Top</Button>
                <Button variant="ghost" size="sm" className="text-xs">Following</Button>
              </div>
              <Button size="sm" className="text-xs">
                <MessageCircle className="h-3 w-3 mr-1" />
                Post
              </Button>
            </div>

            {socialPosts.map((post, index) => (
              <Card key={index} className="card-gradient">
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {post.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-xs">{post.user}</h4>
                          {post.pinned && (
                            <Badge variant="secondary" className="text-xs px-1">
                              Pinned
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{post.time}</span>
                      </div>
                      <p className="text-xs mb-3">{post.content}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <button className="flex items-center space-x-1 hover:text-primary">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-primary">
                          <MessageCircle className="h-3 w-3" />
                          <span>{post.comments}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Learn Courses */}
          <TabsContent value="learn" className="space-y-3 mt-4">
            <div className="flex space-x-2 mb-4">
              <Button variant="outline" size="sm" className="text-xs">Beginner</Button>
              <Button variant="ghost" size="sm" className="text-xs">Intermediate</Button>
              <Button variant="ghost" size="sm" className="text-xs">Advanced</Button>
            </div>

            {courses.map((course, index) => (
              <Card key={index} className="card-gradient">
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
            {topTraders.map((trader, index) => (
              <Card key={index} className="card-gradient">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                          {trader.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-xs">{trader.name}</div>
                        <div className="text-xs text-muted-foreground">{trader.followers} followers</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-bull text-xs">{trader.return}</div>
                      <div className="text-xs text-muted-foreground">{trader.period}</div>
                      <Button variant="outline" size="sm" className="mt-1 text-xs h-6">
                        Follow
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Chat Rooms */}
          <TabsContent value="chats" className="space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="text-xs">Public</Button>
                <Button variant="ghost" size="sm" className="text-xs">Private</Button>
              </div>
              <Button size="sm" className="text-xs">
                <Hash className="h-3 w-3 mr-1" />
                Create Room
              </Button>
            </div>

            {chatRooms.map((room, index) => (
              <Card key={index} className="card-gradient">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium flex items-center space-x-2">
                        <span className="text-xs">{room.name}</span>
                        {room.active && (
                          <div className="w-2 h-2 bg-bull rounded-full animate-pulse"></div>
                        )}
                        <Badge variant="outline" className="text-xs px-1">
                          {room.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{room.members} members</div>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs h-6">
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}