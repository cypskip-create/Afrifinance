import { ArrowLeft, Hash, Users, MessageCircle, Plus, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/shared/TopBar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function Rooms() {
  const navigate = useNavigate();

  const chatRooms = [
    { 
      name: "NSE Daily Discussion", 
      members: 1247, 
      active: true,
      type: "public",
      description: "Daily discussion of NSE stocks and market trends",
      messages: 234
    },
    { 
      name: "Crypto Kenya", 
      members: 892, 
      active: true,
      type: "public",
      description: "Cryptocurrency trading and investment discussions",
      messages: 156
    },
    { 
      name: "Banking Sector Talk", 
      members: 456, 
      active: false,
      type: "invite-only",
      description: "In-depth analysis of banking stocks",
      messages: 89
    },
    { 
      name: "Dividend Investors", 
      members: 678, 
      active: true,
      type: "public",
      description: "Focus on dividend-paying stocks and passive income",
      messages: 201
    },
    { 
      name: "Technical Analysis Pro", 
      members: 534, 
      active: true,
      type: "invite-only",
      description: "Advanced technical analysis and chart patterns",
      messages: 167
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <TopBar 
        title="Rooms" 
        subtitle="Real-time trading discussions"
        showSearch={true}
        showAI={false}
        showNotifications={true}
      />

      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Create Room Button */}
        <Button className="btn-primary w-full mb-6">
          <Plus className="h-4 w-4 mr-2" />
          Create New Room
        </Button>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          <Button variant="default" size="sm" className="text-xs">All Rooms</Button>
          <Button variant="ghost" size="sm" className="text-xs">Public</Button>
          <Button variant="ghost" size="sm" className="text-xs">Private</Button>
          <Button variant="ghost" size="sm" className="text-xs">My Rooms</Button>
        </div>

        {/* Rooms List */}
        <div className="space-y-3">
          {chatRooms.map((room, index) => (
            <Card key={index} className="card-gradient hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Hash className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-sm">{room.name}</h3>
                        {room.active && (
                          <div className="w-2 h-2 bg-bull rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{room.description}</p>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{room.members}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{room.messages}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {room.type === "invite-only" ? (
                            <><Lock className="h-2 w-2 mr-1" /> Invite Only</>
                          ) : (
                            "Public"
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <Button 
                  variant={room.type === "invite-only" ? "outline" : "default"} 
                  size="sm" 
                  className="w-full"
                >
                  {room.type === "invite-only" ? "Request Access" : "Join Room"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
