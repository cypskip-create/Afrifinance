import { Users, Trophy, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Discover() {
  const polls = [
    { question: "Will NSE close up today?", votes: { up: 234, down: 156 } },
    { question: "Best performing sector this week?", votes: { up: 189, down: 87 } },
  ];

  const portfolios = [
    { name: "Dividend Kings", description: "High-yield Kenyan stocks", followers: 1240 },
    { name: "Growth Starter", description: "Beginner-friendly picks", followers: 890 },
    { name: "Tech & Innovation", description: "Future-focused investments", followers: 567 },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <h1 className="text-xl font-bold text-primary">Discover</h1>
          <p className="text-sm text-muted-foreground">Social investing & learning</p>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Community Polls */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-accent" />
              <span>Community Polls</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {polls.map((poll, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/20 border border-border">
                <p className="font-medium mb-3">{poll.question}</p>
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-bull">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{poll.votes.up}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-bear">
                    <ThumbsDown className="h-4 w-4" />
                    <span>{poll.votes.down}</span>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Fantasy League */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-accent" />
              <span>Fantasy Portfolio League</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 border-2 border-dashed border-primary/30 rounded-lg">
              <Trophy className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Join the Competition!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Build a portfolio with KES 100K virtual cash and compete with other investors
              </p>
              <Button className="btn-accent">
                Start Trading
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Portfolios */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Popular Portfolios</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {portfolios.map((portfolio, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                <div>
                  <div className="font-medium">{portfolio.name}</div>
                  <div className="text-sm text-muted-foreground">{portfolio.description}</div>
                  <div className="text-xs text-accent">{portfolio.followers} followers</div>
                </div>
                <Button variant="outline" size="sm">
                  Follow
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}