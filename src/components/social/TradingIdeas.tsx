import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, TrendingUp, TrendingDown, Target, Clock, 
  ThumbsUp, MessageCircle, Share2, ChevronRight, BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TradingIdea {
  id: string;
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  symbol: string;
  direction: 'long' | 'short';
  entry: string;
  target: string;
  stopLoss: string;
  riskReward: string;
  timeframe: string;
  analysis: string;
  likes: number;
  comments: number;
  createdAt: string;
  status: 'active' | 'hit_target' | 'stopped_out' | 'expired';
}

const tradingIdeas: TradingIdea[] = [
  {
    id: "1",
    author: { name: "TraderKE", verified: true },
    symbol: "EQTY",
    direction: "long",
    entry: "62.00",
    target: "68.50",
    stopLoss: "59.00",
    riskReward: "2.17",
    timeframe: "1-2 weeks",
    analysis: "Strong support at 62, breakout above resistance with volume. Banking sector momentum favorable.",
    likes: 45,
    comments: 12,
    createdAt: "2h ago",
    status: "active"
  },
  {
    id: "2",
    author: { name: "MarketGuru", verified: true },
    symbol: "SAFCOM",
    direction: "long",
    entry: "12.80",
    target: "14.50",
    stopLoss: "12.20",
    riskReward: "2.83",
    timeframe: "3-4 weeks",
    analysis: "M-Pesa expansion news catalyst. Cup and handle pattern forming on daily chart.",
    likes: 78,
    comments: 23,
    createdAt: "5h ago",
    status: "active"
  },
  {
    id: "3",
    author: { name: "NSEWatcher", verified: false },
    symbol: "KCB",
    direction: "long",
    entry: "45.00",
    target: "52.00",
    stopLoss: "42.50",
    riskReward: "2.80",
    timeframe: "2-3 weeks",
    analysis: "Earnings beat expectations. Strong institutional buying detected.",
    likes: 32,
    comments: 8,
    createdAt: "1d ago",
    status: "hit_target"
  },
];

export function TradingIdeas() {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Active</Badge>;
      case "hit_target":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">🎯 Target Hit</Badge>;
      case "stopped_out":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Stopped</Badge>;
      default:
        return <Badge variant="secondary">Expired</Badge>;
    }
  };

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  return (
    <Card className="card-gradient">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <span>Trading Ideas</span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-7">
            Share Idea
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tradingIdeas.map((idea) => (
          <div 
            key={idea.id} 
            className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={idea.author.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(idea.author.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{idea.author.name}</span>
                    {idea.author.verified && (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0">PRO</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{idea.createdAt}</span>
                </div>
              </div>
              {getStatusBadge(idea.status)}
            </div>

            {/* Trade Setup */}
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/stock/${idea.symbol}`);
                }}
              >
                ${idea.symbol}
              </Badge>
              <Badge className={idea.direction === 'long' ? 'bg-bull/20 text-bull' : 'bg-bear/20 text-bear'}>
                {idea.direction === 'long' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {idea.direction.toUpperCase()}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {idea.timeframe}
              </div>
            </div>

            {/* Trade Levels */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-background/50 rounded-lg p-2">
                <div className="text-[10px] text-muted-foreground">Entry</div>
                <div className="text-xs font-semibold">{idea.entry}</div>
              </div>
              <div className="bg-background/50 rounded-lg p-2">
                <div className="text-[10px] text-muted-foreground">Target</div>
                <div className="text-xs font-semibold text-bull">{idea.target}</div>
              </div>
              <div className="bg-background/50 rounded-lg p-2">
                <div className="text-[10px] text-muted-foreground">Stop</div>
                <div className="text-xs font-semibold text-bear">{idea.stopLoss}</div>
              </div>
              <div className="bg-background/50 rounded-lg p-2">
                <div className="text-[10px] text-muted-foreground">R:R</div>
                <div className="text-xs font-semibold text-primary">{idea.riskReward}</div>
              </div>
            </div>

            {/* Analysis */}
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {idea.analysis}
            </p>

            {/* Engagement */}
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {idea.likes}
                </button>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {idea.comments}
                </button>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                <BarChart3 className="h-3 w-3 mr-1" />
                View Chart
              </Button>
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full mt-2" size="sm">
          View All Ideas
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
