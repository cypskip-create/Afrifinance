import { useState } from "react";
import { TopBar } from "@/components/shared/TopBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, Plus, Radio, Calendar, ChevronRight, 
  Crown, MessageSquare, Mic, Headphones
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LiveRoomCard } from "@/components/rooms/LiveRoomCard";
import { TextRoomCard } from "@/components/rooms/TextRoomCard";
import { ScheduledRoomCard } from "@/components/rooms/ScheduledRoomCard";
import { TopTraderCard } from "@/components/rooms/TopTraderCard";

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
    topic: "Today's market outlook and key stocks to watch for the trading session",
    isLive: true,
    category: "Markets",
  },
  {
    id: 2,
    name: "Banking Sector Deep Dive",
    hosts: [
      { name: "Alex Njeru", avatar: "AN", verified: true },
      { name: "Mary Wanjiku", avatar: "MW", verified: false },
    ],
    listeners: 187,
    speakers: 3,
    topic: "Analyzing Q3 earnings from major banks: EQTY, KCB, COOP",
    isLive: true,
    category: "Banking",
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
  {
    id: 5,
    title: "Dividend Investing Strategy",
    host: "Income Investors",
    time: "Saturday, 2:00 PM",
    attendees: 189,
    topic: "Building a dividend portfolio",
  },
  {
    id: 6,
    title: "Market Week Ahead",
    host: "Trading Desk",
    time: "Monday, 8:00 AM",
    attendees: 412,
    topic: "Key events and stocks to watch",
  },
];

const textRooms = [
  {
    id: 7,
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
    id: 8,
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
    id: 9,
    name: "Safaricom Bulls",
    description: "For SAFCOM investors and enthusiasts",
    members: 890,
    online: 123,
    category: "Telecom",
    isPrivate: false,
    messages: 1560,
    lastMessage: "M-Pesa numbers looking strong",
    lastMessageTime: "1m ago",
  },
  {
    id: 10,
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
    id: 11,
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
  { name: "Mary W.", handle: "@mary_nse", followers: "5.4K", winRate: "74%", verified: true },
];

export default function Rooms() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [joinedRooms, setJoinedRooms] = useState<number[]>([7, 9]);

  const categories = ["All", "General", "Banking", "Telecom", "Energy", "Premium"];

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
    toast({ title: "Left room" });
  };

  const handleJoinLiveRoom = (roomName: string) => {
    toast({
      title: "Joining Live Room",
      description: `Connecting to ${roomName}...`,
    });
  };

  const handleRemindScheduled = (title: string) => {
    toast({
      title: "Reminder Set",
      description: `We'll notify you before "${title}" starts`,
    });
  };

  const handleFollowTrader = (name: string) => {
    toast({
      title: "Following",
      description: `You're now following ${name}`,
    });
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
                <Radio className="h-4 w-4 text-destructive animate-pulse" />
                Live Now
              </h3>
              <Button variant="ghost" size="sm" className="text-xs h-7">
                See all
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {liveRooms.map((room) => (
                <LiveRoomCard 
                  key={room.id} 
                  room={room} 
                  onJoin={() => handleJoinLiveRoom(room.name)}
                />
              ))}
            </div>
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
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3">
              {scheduledRooms.map((room) => (
                <div key={room.id} className="w-[200px] shrink-0">
                  <ScheduledRoomCard 
                    room={room}
                    onRemind={() => handleRemindScheduled(room.title)}
                  />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
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
                <TopTraderCard 
                  key={idx} 
                  trader={trader}
                  onFollow={() => handleFollowTrader(trader.name)}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Text-Based Rooms */}
        <div>
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
            {filteredRooms.map((room) => (
              <TextRoomCard
                key={room.id}
                room={room}
                isJoined={joinedRooms.includes(room.id)}
                onJoin={() => handleJoinRoom(room.id, room.name, room.isPrivate)}
                onLeave={() => handleLeaveRoom(room.id)}
                onOpen={() => toast({ title: `Opening ${room.name}` })}
              />
            ))}
          </div>
        </div>

        {/* Create Room CTA */}
        <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-7 w-7 text-primary" />
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
