import { TopBar } from "@/components/shared/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle, TrendingUp, Lock, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const rooms = [
  {
    id: 1,
    name: "NSE Daily Discussions",
    description: "Daily market analysis and trading ideas for NSE stocks",
    members: 1240,
    online: 156,
    category: "General",
    isPrivate: false,
    messages: 2340,
  },
  {
    id: 2,
    name: "Banking Sector Focus",
    description: "Deep dive into banking stocks: EQTY, KCB, COOP, and more",
    members: 560,
    online: 78,
    category: "Banking",
    isPrivate: false,
    messages: 890,
  },
  {
    id: 3,
    name: "Safaricom Bulls",
    description: "For SAFCOM investors and enthusiasts",
    members: 890,
    online: 123,
    category: "Telecommunications",
    isPrivate: false,
    messages: 1560,
  },
  {
    id: 4,
    name: "Premium Traders Circle",
    description: "Exclusive room for verified premium members",
    members: 120,
    online: 34,
    category: "Premium",
    isPrivate: true,
    messages: 450,
  },
  {
    id: 5,
    name: "Energy & Infrastructure",
    description: "KenGen, Kenya Power, and infrastructure investments",
    members: 340,
    online: 45,
    category: "Energy",
    isPrivate: false,
    messages: 670,
  },
];

export default function Rooms() {
  const { toast } = useToast();

  const handleJoinRoom = (roomName: string, isPrivate: boolean) => {
    if (isPrivate) {
      toast({
        title: "Premium Feature",
        description: "This room is only available to premium members",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Joined Room",
        description: `Welcome to ${roomName}!`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <TopBar 
        title="Trading Rooms" 
        subtitle="Join discussions and share insights"
      />
      
      <div className="p-4 space-y-6">
        {/* Room Categories */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {["All", "General", "Banking", "Telecommunications", "Energy", "Premium"].map((category) => (
            <Badge
              key={category}
              variant={category === "All" ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Rooms List */}
        <div className="space-y-4">
          {rooms.map((room) => (
            <Card key={room.id} className="card-gradient">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {room.isPrivate ? (
                        <Lock className="h-4 w-4 text-primary" />
                      ) : (
                        <Globe className="h-4 w-4 text-primary" />
                      )}
                      <CardTitle className="text-base">{room.name}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {room.description}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {room.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{room.members.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-bull" />
                      <span>{room.online} online</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{room.messages.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <Button
                  className={room.isPrivate ? "btn-accent w-full" : "btn-primary w-full"}
                  onClick={() => handleJoinRoom(room.name, room.isPrivate)}
                >
                  {room.isPrivate ? "Premium Only" : "Join Room"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Room CTA */}
        <Card className="card-gradient border-primary/20">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Create Your Own Room</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start a community around your investment interests and strategies.
            </p>
            <Button variant="outline" className="w-full">
              Create Room
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}