import { Users, Trophy, MessageCircle, ThumbsUp, ThumbsDown, BookOpen, TrendingUp, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopBar } from "@/components/shared/TopBar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Discover() {
  const discoverTabs = [
    { id: "hub", label: "TraderHub", icon: MessageCircle },
    { id: "learn", label: "Learn", icon: BookOpen },
    { id: "insights", label: "Insights", icon: TrendingUp },
    { id: "chats", label: "Chats", icon: Hash },
  ];

  const socialPosts = [
    {
      user: "TraderKE_Pro",
      avatar: "TK",
      content: "Just bought more SAFCOM on this dip. Long-term bullish on M-Pesa expansion! 📈",
      likes: 24,
      comments: 8,
      time: "2h ago"
    },
    {
      user: "InvestorJane",
      avatar: "IJ", 
      content: "Banking sector showing strong fundamentals. KCB and EQTY are my picks for Q4 💪",
      likes: 18,
      comments: 12,
      time: "4h ago"
    }
  ];

  const courses = [
    { title: "Stock Market Basics", progress: 0, lessons: 12, duration: "2 hours" },
    { title: "Technical Analysis", progress: 40, lessons: 8, duration: "3 hours" },
    { title: "Portfolio Management", progress: 100, lessons: 10, duration: "2.5 hours" },
  ];

  const topTraders = [
    { name: "MarketMaster", return: "+24.5%", followers: 2340, avatar: "MM" },
    { name: "DividendKing", return: "+18.2%", followers: 1890, avatar: "DK" },
    { name: "TechInvestor", return: "+31.7%", followers: 1245, avatar: "TI" },
  ];

  const chatRooms = [
    { name: "NSE Daily Discussion", members: 1247, active: true },
    { name: "Crypto Kenya", members: 892, active: true },
    { name: "Banking Sector Talk", members: 456, active: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <TopBar 
        title="Discover" 
        subtitle="Social investing & learning hub"
        showSearch={true}
        showAI={true}
        showNotifications={true}
      />

      <div className="p-4">
        <Tabs defaultValue="hub" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            {discoverTabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center space-x-1 text-xs"
              >
                <tab.icon className="h-3 w-3" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* TraderHub Tab */}
          <TabsContent value="hub" className="space-y-4">
            {/* Social Feed */}
            {socialPosts.map((post, index) => (
              <Card key={index} className="card-gradient">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {post.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{post.user}</h4>
                        <span className="text-xs text-muted-foreground">{post.time}</span>
                      </div>
                      <p className="text-sm mb-3">{post.content}</p>
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

          {/* Learn Tab */}
          <TabsContent value="learn" className="space-y-4">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-accent" />
                  <span>Investment Courses</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.map((course, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/20 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{course.title}</h4>
                      <span className="text-xs text-muted-foreground">{course.duration}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{course.lessons} lessons</span>
                      <span className="text-sm text-primary">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-accent" />
                  <span>Top Performers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topTraders.map((trader, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                          {trader.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{trader.name}</div>
                        <div className="text-xs text-muted-foreground">{trader.followers} followers</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-bull">{trader.return}</div>
                      <Button variant="outline" size="sm" className="mt-1">Follow</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chats Tab */}
          <TabsContent value="chats" className="space-y-4">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Hash className="h-5 w-5 text-accent" />
                  <span>Trading Rooms</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {chatRooms.map((room, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div>
                      <div className="font-medium flex items-center space-x-2">
                        <span>{room.name}</span>
                        {room.active && (
                          <div className="w-2 h-2 bg-bull rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{room.members} members</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Join
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}