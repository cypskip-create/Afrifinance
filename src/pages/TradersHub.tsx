import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, X, Bell, Flame, Users, MessageCircle, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePosts, Post, Comment } from "@/hooks/usePosts";
import { useFollows } from "@/hooks/useFollows";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/hooks/use-toast";
import { XPostCard } from "@/components/social/XPostCard";
import { XComposeModal } from "@/components/social/XComposeModal";
import { XCommentSheet } from "@/components/social/XCommentSheet";
import { TrendingSidebar } from "@/components/social/TrendingSidebar";
import { TradersHubDisclaimer } from "@/components/social/TradersHubDisclaimer";
import { supabase } from "@/integrations/supabase/client";

const MOCK_PRICES: Record<string, number> = {
  SCOM: 12.85, SAFCOM: 12.85, EQTY: 62.50, KCB: 45.30, COOP: 15.20,
  SCBK: 185.00, BAMB: 89.75, EABL: 155.00, BAT: 320.00, ABSA: 14.10,
  NCBA: 42.50, SBIC: 8.90, JUB: 380.00, BRIT: 6.50, DTK: 82.00,
};

export default function TradersHub() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { posts, loading, createPost, likePost, repostPost, bookmarkPost, fetchComments, addComment, deletePost, editPost } = usePosts();
  const { isFollowing } = useFollows();
  const { portfolio } = usePortfolio();
  const { watchlist } = useWatchlist();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"for-you" | "following" | "trending">("for-you");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [composeOpen, setComposeOpen] = useState(false);
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [prefillContent, setPrefillContent] = useState("");
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);
  const [disclaimerDone, setDisclaimerDone] = useState(() => {
    if (!user) return true;
    return !!localStorage.getItem(`tradershub_disclaimer_${user.id}`);
  });

  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch) setSearchQuery(urlSearch);
    const shouldCompose = searchParams.get("compose");
    const ticker = searchParams.get("ticker");
    if (shouldCompose === "true" && ticker) {
      setComposeOpen(true);
      setPrefillContent(`$${ticker} `);
    }
    const postId = searchParams.get("post");
    if (postId) {
      setHighlightedPostId(postId);
      setTimeout(() => {
        const el = document.getElementById(`post-${postId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
    }
  }, [searchParams]);

  const portfolioSymbols = useMemo(() => new Set(portfolio.map(h => h.symbol)), [portfolio]);
  const watchlistSymbols = useMemo(() => new Set(watchlist.map(w => w.symbol)), [watchlist]);

  const portfolioSnapshot = useMemo(() => {
    if (!portfolio || portfolio.length === 0) return null;
    const holdings = portfolio.map(h => {
      const currentPrice = MOCK_PRICES[h.symbol] || h.avg_cost * (1 + (Math.random() * 0.2 - 0.1));
      const gain = ((currentPrice - h.avg_cost) / h.avg_cost) * 100;
      return { symbol: h.symbol, name: h.name, shares: h.shares, avgCost: h.avg_cost, currentPrice, gain };
    });
    const totalValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
    const totalCost = holdings.reduce((sum, h) => sum + h.avgCost * h.shares, 0);
    const totalGain = totalValue - totalCost;
    const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    return { totalValue, totalGain, gainPercent, holdings };
  }, [portfolio]);

  // Smart "For You" algorithm
  const filteredPosts = useMemo(() => {
    let result = posts.filter(post => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase().replace(/^[#$]/, "");
        if (!post.content.toLowerCase().includes(q) && !post.stock_mentions?.some(s => s.toLowerCase().includes(q))) return false;
      }
      if (activeTab === "following") return isFollowing(post.user_id);
      if (activeTab === "trending") return post.likes_count >= 3 || post.reposts_count >= 1;
      return true;
    });

    // For You: smart sort
    if (activeTab === "for-you" && !searchQuery) {
      result = result.map(post => {
        let score = 0;
        // Recency: newer = higher
        const ageHours = (Date.now() - new Date(post.created_at).getTime()) / 3600000;
        score += Math.max(0, 100 - ageHours * 2);
        // From followed users
        if (isFollowing(post.user_id)) score += 40;
        // Own posts slight boost
        if (user && post.user_id === user.id) score += 10;
        // Mentions stocks in portfolio/watchlist
        if (post.stock_mentions) {
          post.stock_mentions.forEach(s => {
            if (portfolioSymbols.has(s)) score += 30;
            if (watchlistSymbols.has(s)) score += 20;
          });
        }
        // Engagement
        score += Math.min(post.likes_count * 5, 50);
        score += Math.min(post.comments_count * 8, 40);
        score += Math.min(post.reposts_count * 10, 30);
        return { ...post, _score: score };
      }).sort((a, b) => (b as any)._score - (a as any)._score);
    }

    return result;
  }, [posts, searchQuery, activeTab, isFollowing, portfolioSymbols, watchlistSymbols, user]);

  const handleSearch = (q: string) => { setSearchQuery(q); setSearchParams(q ? { search: q } : {}); };
  const clearSearch = () => { setSearchQuery(""); setSearchParams({}); };

  const handlePost = async (content: string, imageUrl?: string) => {
    const { error } = await createPost(content, imageUrl);
    if (error) { toast({ title: "Error", description: "Failed to post", variant: "destructive" }); return { error }; }
    toast({ title: "Posted!" });
    return { error: null };
  };

  const handleLike = async (postId: string) => { if (!user) { navigate("/auth"); return; } await likePost(postId); };
  const handleRepost = async (postId: string) => { if (!user) { navigate("/auth"); return; } const { error } = await repostPost(postId); if (!error) toast({ title: "Reposted!" }); };
  const handleBookmark = async (postId: string) => { if (!user) { navigate("/auth"); return; } const post = posts.find(p => p.id === postId); const { error } = await bookmarkPost(postId); if (!error) toast({ title: post?.is_bookmarked ? "Removed" : "Bookmarked" }); };
  const handleShare = async (post: Post) => {
    if (navigator.share) { try { await navigator.share({ title: `Post by ${post.author?.full_name}`, text: post.content.slice(0, 100), url: window.location.href }); } catch {} }
    else { await navigator.clipboard.writeText(window.location.href); toast({ title: "Link copied" }); }
  };
  const handleDelete = async (postId: string) => { const { error } = await deletePost(postId); if (!error) toast({ title: "Deleted" }); };
  const handleEdit = async (postId: string, newContent: string) => {
    if (!editPost) return;
    const { error } = await editPost(postId, newContent);
    if (error) toast({ title: "Error", description: "Failed to edit", variant: "destructive" });
    else toast({ title: "Post updated" });
  };

  const openComments = async (post: Post) => {
    setSelectedPost(post);
    setCommentSheetOpen(true);
    setLoadingComments(true);
    const fetched = await fetchComments(post.id);
    setComments(fetched);
    setLoadingComments(false);
  };

  const handleAddComment = async (content: string) => {
    if (!selectedPost || !user) return;
    const { error } = await addComment(selectedPost.id, content);
    if (!error) { const updated = await fetchComments(selectedPost.id); setComments(updated); }
  };

  const tabs = [
    { id: "for-you" as const, label: "For You" },
    { id: "following" as const, label: "Following" },
    { id: "trending" as const, label: "Trending" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* First-time disclaimer */}
      {!disclaimerDone && <TradersHubDisclaimer userId={user?.id} onAccept={() => setDisclaimerDone(true)} />}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">TradersHub</h1>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full relative" onClick={() => navigate("/notifications")}>
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-accent rounded-full" />
          </Button>
        </div>

        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts, $stocks, #topics..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-9 h-10 rounded-full bg-muted/50 border-0 text-sm"
            />
            {searchQuery && (
              <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full" onClick={clearSearch} data-small-target>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`flex-1 py-3 text-sm font-semibold text-center relative transition-colors ${
                activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
              onClick={() => setActiveTab(tab.id)}
              data-small-target
            >
              {tab.id === "trending" && <Flame className="h-3.5 w-3.5 inline mr-1" />}
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-[3px] rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </header>

      {searchQuery && (
        <div className="px-4 py-2 bg-muted/20 border-b border-border/40 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Results for <span className="font-bold text-foreground">"{searchQuery}"</span></p>
          <Button variant="ghost" size="sm" className="h-7 text-xs rounded-full" onClick={clearSearch}>Clear</Button>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto flex">
        <div className="flex-1 max-w-[600px] min-w-0">
          {loading || !disclaimerDone ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-12 text-center">
              {activeTab === "following" ? (
                <>
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="font-bold mb-1">No posts yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Follow traders to see their posts</p>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setActiveTab("for-you")}>Discover traders</Button>
                </>
              ) : activeTab === "trending" ? (
                <>
                  <Flame className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="font-bold mb-1">No trending posts</p>
                  <p className="text-sm text-muted-foreground">Posts with high engagement appear here</p>
                </>
              ) : (
                <>
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="font-bold mb-1">No posts yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Be the first to share your insights!</p>
                  {user && (
                    <Button className="rounded-full btn-primary" onClick={() => setComposeOpen(true)}>
                      <Feather className="h-4 w-4 mr-2" />Create post
                    </Button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div>
              {filteredPosts.map(post => (
                <div key={post.id} id={`post-${post.id}`} className={`transition-colors ${highlightedPostId === post.id ? 'bg-primary/5 ring-1 ring-primary/20 rounded-xl' : ''}`}>
                  <XPostCard post={post} currentUserId={user?.id} onLike={handleLike} onComment={openComments} onRepost={handleRepost} onBookmark={handleBookmark} onShare={handleShare} onDelete={handleDelete} onEdit={handleEdit} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:block w-[350px] pl-6 pt-4 sticky top-[160px] self-start">
          <TrendingSidebar />
        </div>
      </div>

      {user && (
        <button
          className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 z-50 h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          onClick={() => setComposeOpen(true)}
          style={{ boxShadow: "var(--shadow-primary)" }}
        >
          <Feather className="h-6 w-6" />
        </button>
      )}

      <XComposeModal open={composeOpen} onOpenChange={(o) => { setComposeOpen(o); if (!o) setPrefillContent(""); }} user={user} profile={profile} onPost={handlePost} portfolioSnapshot={portfolioSnapshot} prefillContent={prefillContent} />
      <XCommentSheet open={commentSheetOpen} onOpenChange={setCommentSheetOpen} post={selectedPost} currentUserId={user?.id} comments={comments} loadingComments={loadingComments} onAddComment={handleAddComment} onLike={handleLike} onRepost={handleRepost} onBookmark={handleBookmark} onShare={handleShare} onDelete={handleDelete} />
    </div>
  );
}
