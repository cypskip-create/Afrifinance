import { ArrowLeft, TrendingUp, Trophy, Users, DollarSign, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/shared/TopBar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function PaperTrade() {
  const navigate = useNavigate();

  const leaderboard = [
    { rank: 1, name: "VirtualVictory", return: "+45.2%", balance: "KES 145,200", avatar: "VV" },
    { rank: 2, name: "PaperProfits", return: "+38.7%", balance: "KES 138,700", avatar: "PP" },
    { rank: 3, name: "MockMarket", return: "+32.4%", balance: "KES 132,400", avatar: "MM" },
    { rank: 4, name: "TestTrader", return: "+28.9%", balance: "KES 128,900", avatar: "TT" },
    { rank: 5, name: "DemoDealer", return: "+25.1%", balance: "KES 125,100", avatar: "DD" },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <TopBar 
        title="Paper Trading" 
        subtitle="Practice trading risk-free"
        showSearch={false}
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

        {/* Your Virtual Portfolio */}
        <Card className="card-hero mb-6">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Virtual Portfolio Value</div>
              <div className="text-3xl font-bold text-primary mb-2">
                KES 100,000
              </div>
              <div className="text-lg font-medium text-muted-foreground">
                +KES 0 (0.00%)
              </div>
              <Button className="btn-primary mt-4 w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                Start Paper Trading
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="card-gradient">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold">2,847</div>
              <div className="text-xs text-muted-foreground">Active Traders</div>
            </CardContent>
          </Card>
          <Card className="card-gradient">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 text-accent mx-auto mb-2" />
              <div className="text-xl font-bold">45.2%</div>
              <div className="text-xs text-muted-foreground">Top Return</div>
            </CardContent>
          </Card>
          <Card className="card-gradient">
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-6 w-6 text-bull mx-auto mb-2" />
              <div className="text-xl font-bold">12.5K</div>
              <div className="text-xs text-muted-foreground">Total Trades</div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-accent" />
              <span>Top Performers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaderboard.map((trader) => (
              <div
                key={trader.rank}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    trader.rank === 1 ? "bg-accent text-accent-foreground" :
                    trader.rank === 2 ? "bg-bull/20 text-bull" :
                    trader.rank === 3 ? "bg-bear/20 text-bear" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    <span className="text-xs font-bold">#{trader.rank}</span>
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {trader.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{trader.name}</div>
                    <div className="text-xs text-muted-foreground">{trader.balance}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-bull text-sm">{trader.return}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="card-gradient mt-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">About Paper Trading</h3>
            <p className="text-sm text-muted-foreground">
              Practice trading with virtual money in real market conditions. Perfect for learning strategies, 
              testing ideas, and building confidence before investing real capital.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
