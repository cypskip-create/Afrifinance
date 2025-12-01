import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, MessageSquare, Award, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const traders = [
  { id: 1, name: "John Kamau", username: "@jkamau", followers: 1250, accuracy: 78, specialty: "Banking", avatar: "JK" },
  { id: 2, name: "Mary Wanjiru", username: "@mwanjiru", followers: 890, accuracy: 82, specialty: "Telco", avatar: "MW" },
  { id: 3, name: "David Omondi", username: "@domondi", followers: 2100, accuracy: 75, specialty: "Energy", avatar: "DO" },
  { id: 4, name: "Grace Akinyi", username: "@gakinyi", followers: 650, accuracy: 88, specialty: "Manufacturing", avatar: "GA" },
];

export default function TradersHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header with back button */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-primary">Traders Hub</h1>
              <p className="text-sm text-muted-foreground">Connect with top traders and investors</p>
            </div>
          </div>
        </div>
      </header>
      
      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="card-gradient">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">1.2K</div>
              <div className="text-xs text-muted-foreground">Active Traders</div>
            </CardContent>
          </Card>
          
          <Card className="card-gradient">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-bull" />
              <div className="text-2xl font-bold">78%</div>
              <div className="text-xs text-muted-foreground">Avg Accuracy</div>
            </CardContent>
          </Card>
          
          <Card className="card-gradient">
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold">5.4K</div>
              <div className="text-xs text-muted-foreground">Daily Posts</div>
            </CardContent>
          </Card>
        </div>

        {/* Top Traders */}
        <div>
          <h2 className="text-xl font-bold mb-4">Top Traders</h2>
          <div className="space-y-4">
            {traders.map((trader) => (
              <Card key={trader.id} className="card-gradient">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {trader.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{trader.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{trader.username}</p>
                        <Badge variant="secondary" className="mt-1">
                          {trader.specialty}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" className="btn-primary">
                      Follow
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Followers</p>
                      <p className="text-lg font-bold">{trader.followers.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                      <div className="flex items-center space-x-1">
                        <Award className="h-4 w-4 text-bull" />
                        <p className="text-lg font-bold text-bull">{trader.accuracy}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="card-gradient border-primary/20">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Join the Discussion</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Share insights, learn strategies, and grow together with Kenya's top investors.
            </p>
            <Button className="btn-primary w-full" onClick={() => navigate('/rooms')}>
              Explore Trading Rooms
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}