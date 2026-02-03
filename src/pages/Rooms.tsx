import { useState } from "react";
import { TopBar } from "@/components/shared/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, MessageCircle, TrendingUp, Lock, Globe, Search, Plus, 
  Mic, MicOff, Volume2, Crown, Star, Verified, Radio, Calendar,
  ChevronRight, Bell, MoreHorizontal, Play, Pause, Headphones,
  MessageSquare, ThumbsUp, Share2, UserPlus, Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const liveRooms = [
  {
    id: 1,
    name: "NSE Market Open Discussion",
    hosts: [
      { name: "James Mwangi", avatar: "JM", verified: true },
      { name: "Sarah Kimani", avatar: "SK", verified: true },
    ],
    listeners: 342,
    speakers: 5,
    topic: "Today's market outlook and key stocks to watch",
    isLive: true,
    category: "Live",
  },
];

const scheduledRooms = [
  {
    id: 3,
    title: "Weekly Earnings Review",
    host: "Market Analysts",
    time: "Tomorrow, 10:00 AM",
    attendees: 234,
    topic: "SAFCOM & EQTY Q3 Results Deep Dive",
  },
  {
    id: 4,
    title: "Beginner's Trading Workshop",
    host: "Learn to Trade",
    time: "Friday, 3:00 PM",
    attendees: 567,
    topic: "Technical Analysis Basics",
  },
];

const textRooms = [
  {
    id: 5,
    name: "NSE Daily Discussions",
    description: "Daily market analysis and trading ideas for NSE stocks",
    members: 1240,
    online: 156,
    category: "General",
    isPrivate: false,
    messages: 2340,
    lastMessage: "EQTY looking bullish today...",
    lastMessageTime: "2m ago",
  },
  {
    id: 6,
    name: "Banking Sector Focus",
    description: "Deep dive into banking stocks: EQTY, KCB, COOP, and more",
    members: 560,
    online: 78,
    category: "Banking",
    isPrivate: false,
    messages: 890,
    lastMessage: "KCB dividend announcement incoming",
    lastMessageTime: "5m ago",
  },
  {
    id: 7,
    name: "Safaricom Bulls",
    description: "For SAFCOM investors and enthusiasts",
    members: 890,
    online: 123,
    category: "Telecommunications",
    isPrivate: false,
    messages: 1560,
    lastMessage: "M-Pesa numbers looking strong",
    lastMessageTime: "1m ago",
  },
  {
    id: 8,
    name: "Premium Traders Circle",
    description: "Exclusive room for verified premium members",
    members: 120,
    online: 34,
    category: "Premium",
    isPrivate: true,
    messages: 450,
    lastMessage: "Members only",
    lastMessageTime: "Premium",
  },
  {
    id: 9,
    name: "Energy & Infrastructure",
    description: "KenGen, Kenya Power, and infrastructure investments",
    members: 340,
    online: 45,
    category: "Energy",
    isPrivate: false,
    messages: 670,
    lastMessage: "KPLC restructuring news",
    lastMessageTime: "15m ago",
  },
];

const topTraders = [
  { name: "James M.", handle: "@jamesm_trades", followers: "12.5K", winRate: "78%", verified: true },
  { name: "Sarah K.", handle: "@sarah_invests", followers: "8.2K", winRate: "72%", verified: true },
  { name: "Alex N.", handle: "@alex_stocks", followers: "6.8K", winRate: "69%", verified: false },
];

export default function Rooms() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [joinedRooms, setJoinedRooms] = useState<number[]>([5, 7]);

  const categories = ["All", "General", "Banking", "Telecommunications", "Energy", "Premium"];

  const handleJoinRoom = (roomId: number, roomName: string, isPrivate: boolean) => {
    if (isPrivate) {
      toast({
        title: "Premium Feature",
        description: "This room is only available to premium members",
        variant: "destructive",
      });
      return;
    }
    
    setJoinedRooms(prev => [...prev, roomId]);
    toast({
      title: "Joined Room",
      description: `Welcome to ${roomName}!`,
    });
  };

  const handleLeaveRoom = (roomId: number) => {
    setJoinedRooms(prev => prev.filter(id => id !== roomId));
    toast({ title: "Left room", description: "You have left the room" });
  };

  const filteredRooms = textRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || room.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title="Rooms" 
        subtitle="Live discussions & communities"
        showSearch={false}
      />
      
      <div className="p-4 space-y-5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Live Audio Rooms Section */}
        {liveRooms.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Radio className="h-4 w-4 text-red-500 animate-pulse" />
                Live Now
              </h3>
              <Button variant="ghost" size="sm" className="text-xs h-7">
                See all
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-3">
                {liveRooms.map((room) => (
                  <Card key={room.id} className="w-[280px] flex-shrink-0 bg-gradient-to-br from-primary/10 via-background to-accent/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-red-500 text-white text-[10px] animate-pulse">
                          <span className="w-1.5 h-1.5 bg-white rounded-full mr-1" />
                          LIVE
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">{room.category}</Badge>
                      </div>
                      <h4 className="font-semibold text-sm mb-1 line-clamp-1">{room.name}</h4>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{room.topic}</p>
                      
                      {/* Hosts */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex -space-x-2">
                          {room.hosts.map((host, idx) => (
                            <div 
                              key={idx} 
                              className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium border-2 border-background"
                            >
                              {host.avatar}
                            </div>
                          ))}
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">{room.hosts[0].name}</span>
                          {room.hosts[0].verified && <Verified className="h-3 w-3 text-primary inline ml-1" />}
                          {room.hosts.length > 1 && <span className="text-muted-foreground"> +{room.hosts.length - 1}</span>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Headphones className="h-3 w-3" />
                            {room.listeners}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mic className="h-3 w-3" />
                            {room.speakers}
                          </span>
                        </div>
                        <Button size="sm" className="h-7 text-xs">
                          <Headphones className="h-3 w-3 mr-1" />
                          Join
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

        {/* Scheduled Rooms */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" />
              Upcoming
            </h3>
            <Button variant="ghost" size="sm" className="text-xs h-7">
              Schedule
              <Plus className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {scheduledRooms.map((room) => (
              <Card key={room.id} className="card-gradient">
                <CardContent className="p-3">
                  <h4 className="font-semibold text-xs mb-1 line-clamp-1">{room.title}</h4>
                  <p className="text-[10px] text-muted-foreground mb-2">{room.time}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {room.attendees}
                    </span>
                    <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">
                      <Bell className="h-2.5 w-2.5 mr-1" />
                      Remind
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Top Traders to Follow */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              Top Traders
            </h3>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3">
              {topTraders.map((trader, idx) => (
                <Card key={idx} className="w-[160px] flex-shrink-0 card-gradient">
                  <CardContent className="p-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mx-auto mb-2 font-bold">
                      {trader.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h4 className="font-semibold text-sm flex items-center justify-center gap-1">
                      {trader.name}
                      {trader.verified && <Verified className="h-3 w-3 text-primary" />}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">{trader.handle}</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
                      <span>{trader.followers}</span>
                      <span className="text-bull">{trader.winRate} win</span>
                    </div>
                    <Button size="sm" variant="outline" className="w-full h-7 text-xs">
                      <UserPlus className="h-3 w-3 mr-1" />
                      Follow
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Text-Based Rooms */}
        <Tabs defaultValue="all" className="w-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Communities
            </h3>
            <Button size="sm" variant="outline" className="h-7 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Create
            </Button>
          </div>
          
          {/* Category Filter */}
          <ScrollArea className="w-full whitespace-nowrap mb-4">
            <div className="flex gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap py-1.5 px-3"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Rooms List */}
          <div className="space-y-3">
            {filteredRooms.map((room) => {
              const isJoined = joinedRooms.includes(room.id);
              return (
                <Card key={room.id} className="card-gradient overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {room.isPrivate ? (
                            <Lock className="h-4 w-4 text-accent" />
                          ) : (
                            <Globe className="h-4 w-4 text-primary" />
                          )}
                          <h4 className="font-semibold text-sm">{room.name}</h4>
                          {room.isPrivate && (
                            <Badge variant="secondary" className="text-[10px]">
                              <Crown className="h-2.5 w-2.5 mr-0.5" />
                              Premium
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                          {room.description}
                        </p>
                        <Badge variant="outline" className="text-[10px]">
                          {room.category}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Last Message Preview */}
                    {!room.isPrivate && (
                      <div className="bg-muted/30 rounded-lg p-2 mb-3">
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {room.lastMessage}
                        </p>
                        <span className="text-[10px] text-muted-foreground">{room.lastMessageTime}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          <span>{room.members.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-bull animate-pulse" />
                          <span>{room.online} online</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>{room.messages.toLocaleString()}</span>
                        </div>
                      </div>
                      {isJoined ? (
                        <div className="flex gap-2">
                          <Button size="sm" className="h-7 text-xs">
                            Open
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs"
                            onClick={() => handleLeaveRoom(room.id)}
                          >
                            Leave
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className={`h-7 text-xs ${room.isPrivate ? 'bg-accent hover:bg-accent/90' : ''}`}
                          onClick={() => handleJoinRoom(room.id, room.name, room.isPrivate)}
                        >
                          {room.isPrivate ? "Upgrade" : "Join"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Tabs>

        {/* Create Room CTA */}
        <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Start Your Own Community</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a room around your investment interests and grow your following.
            </p>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
