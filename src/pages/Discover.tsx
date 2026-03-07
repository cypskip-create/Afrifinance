import { useState, useEffect } from "react";
import { Heart, MessageCircle, Repeat2, Search, TrendingUp, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import { useFollows } from "@/hooks/useFollows";
import { useAuth } from "@/hooks/useAuth";
import { SparklineChart } from "@/components/shared/SparklineChart";

const trendingStocks = [
  { symbol: "SAFCOM", price: 12.85, change: 2.4 },
  { symbol: "EQTY", price: 62.50, change: -1.2 },
  { symbol: "KCB", price: 45.30, change: 0.8 },
  { symbol: "KPLC", price: 1.95, change: 5.4 },
  { symbol: "EABL", price: 155.00, change: -2.1 },
  { symbol: "COOP", price: 15.20, change: 1.8 },
];

export default function Discover() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { posts, loading: postsLoading, likePost } = usePosts();
  const { isFollowing } = useFollows();
  const [feedTab, setFeedTab] = useState("foryou");
  const [searchQuery, setSearchQuery] = useState("");

  const getFilteredPosts = () => {
    let filtered = [...posts];
    if (feedTab === "trending") {
      filtered.sort((a, b) => (b.likes_count + b.reposts_count) - (a.likes_count + a.reposts_count));
    } else if (feedTab === "following") {
      filtered = filtered.filter(post => isFollowing(post.user_id));
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    if (searchQuery) {
      filtered = filtered.filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  };

  const filteredPosts = getFilteredPosts();

  const handleLike = async (postId: string) => {
    if (!user) { navigate('/auth'); return; }
    await likePost(postId);
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const renderPostContent = (content: string) => {
    return content.split(/(\$[A-Z]+|#\w+)/g).map((part, i) => {
      if (part.startsWith('$')) {
        return (
          <span key={i} className="text-[hsl(152,60%,45%)] font-medium cursor-pointer hover:underline"
            onClick={(e) => { e.stopPropagation(); navigate(`/stock/${part.slice(1)}`); }}>
            {part}
          </span>
        );
      } else if (part.startsWith('#')) {
        return <span key={i} className="text-[hsl(152,60%,45%)] cursor-pointer hover:underline">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-[hsl(220,15%,8%)] text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[hsl(220,15%,8%)]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <h1 className="text-xl font-bold mb-3">Discover</h1>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search posts, $TICKER, #topics..."
            className="h-10 bg-white/5 border-white/10 text-white rounded-full pl-10 placeholder:text-white/30 focus-visible:ring-[hsl(152,60%,45%)]"
          />
        </div>

        {/* Trending stocks carousel */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
          {trendingStocks.map(s => (
            <button
              key={s.symbol}
              className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 shrink-0 active:scale-95 transition-transform border border-white/5"
              onClick={() => navigate(`/stock/${s.symbol}`)}
            >
              <span className="text-xs font-bold">${s.symbol}</span>
              <span className={`text-[10px] font-semibold ${s.change >= 0 ? 'text-[hsl(152,60%,45%)]' : 'text-[hsl(0,70%,55%)]'}`}>
                {s.change >= 0 ? '+' : ''}{s.change}%
              </span>
              <SparklineChart isPositive={s.change >= 0} width={28} height={12} />
            </button>
          ))}
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-[140px] z-30 bg-[hsl(220,15%,8%)]/90 backdrop-blur-xl border-b border-white/5 px-4">
        <div className="flex gap-0">
          {[
            { key: "foryou", label: "For You" },
            { key: "trending", label: "Trending" },
            { key: "following", label: "Following" },
          ].map(tab => (
            <button
              key={tab.key}
              className={`flex-1 py-3 text-sm font-semibold transition-all relative ${
                feedTab === tab.key ? 'text-white' : 'text-white/40'
              }`}
              onClick={() => setFeedTab(tab.key)}
            >
              {tab.label}
              {feedTab === tab.key && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-[hsl(152,60%,45%)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="divide-y divide-white/5">
        {postsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-[hsl(152,60%,45%)]" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 px-6">
            <p className="text-white/40 text-sm">
              {feedTab === "following" ? "Follow traders to see their posts" : "No posts yet. Be the first to share!"}
            </p>
            <Button className="mt-4 bg-[hsl(152,60%,45%)] text-black hover:bg-[hsl(152,60%,50%)]" onClick={() => navigate('/traders-hub')}>
              Go to TradersHub
            </Button>
          </div>
        ) : (
          filteredPosts.map(post => (
            <div key={post.id} className="px-4 py-4 active:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => navigate('/traders-hub')}>
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 shrink-0 cursor-pointer" onClick={e => { e.stopPropagation(); navigate(`/profile/${post.user_id}`); }}>
                  <AvatarImage src={post.author?.avatar_url || ""} />
                  <AvatarFallback className="bg-white/10 text-white text-xs">{getInitials(post.author?.full_name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm truncate cursor-pointer hover:underline" onClick={e => { e.stopPropagation(); navigate(`/profile/${post.user_id}`); }}>
                      {post.author?.full_name || 'User'}
                    </span>
                    <span className="text-xs text-white/30">{formatTimeAgo(post.created_at)}</span>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed mb-3">{renderPostContent(post.content)}</p>
                  {post.image_url && (
                    <div className="rounded-xl overflow-hidden mb-3 border border-white/5">
                      <img src={post.image_url} alt="" className="w-full max-h-64 object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-6 text-white/30">
                    <button className={`flex items-center gap-1.5 text-xs hover:text-[hsl(0,70%,55%)] transition-colors ${post.is_liked ? 'text-[hsl(0,70%,55%)]' : ''}`}
                      onClick={e => { e.stopPropagation(); handleLike(post.id); }}>
                      <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
                      <span>{post.likes_count}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs hover:text-[hsl(200,70%,55%)] transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments_count}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs hover:text-[hsl(152,60%,45%)] transition-colors">
                      <Repeat2 className="h-4 w-4" />
                      <span>{post.reposts_count}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Post Button */}
      <div className="fixed bottom-24 right-4 z-30">
        <Button
          className="h-14 w-14 rounded-full bg-[hsl(152,60%,45%)] text-black hover:bg-[hsl(152,60%,50%)] shadow-[0_4px_20px_hsl(152,60%,45%,0.3)]"
          onClick={() => navigate('/traders-hub')}
        >
          <Pencil className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
