import { ArrowLeft, Users, MessageCircle, ThumbsUp, TrendingUp, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/shared/TopBar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

export default function TradersHub() {
  const navigate = useNavigate();
  const [postContent, setPostContent] = useState("");

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
    },
    {
      user: "MarketWatcher",
      avatar: "MW",
      content: "NSE 20 breaking through resistance levels. Could see 1,900 by month end if momentum continues.",
      likes: 32,
      comments: 15,
      time: "6h ago",
      pinned: false
    }
  ];

  const handlePost = () => {
    if (!postContent.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }
    toast.success("Post shared successfully!");
    setPostContent("");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <TopBar 
        title="TradersHub" 
        subtitle="Social trading community"
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

        {/* Create Post Card */}
        <Card className="card-gradient mb-4">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  You
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Share your trading insights..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex justify-end">
                  <Button onClick={handlePost} size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-4">
          <Button variant="default" size="sm" className="text-xs">Latest</Button>
          <Button variant="ghost" size="sm" className="text-xs">Top</Button>
          <Button variant="ghost" size="sm" className="text-xs">Following</Button>
          <Button variant="ghost" size="sm" className="text-xs">Trending</Button>
        </div>

        {/* Social Feed */}
        <div className="space-y-3">
          {socialPosts.map((post, index) => (
            <Card key={index} className="card-gradient">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {post.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-sm">{post.user}</h4>
                        {post.pinned && (
                          <Badge variant="secondary" className="text-xs">
                            Pinned
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{post.time}</span>
                    </div>
                    <p className="text-sm mb-3">{post.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
