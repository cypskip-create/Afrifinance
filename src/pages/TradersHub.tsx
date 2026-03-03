import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, X, Bell, Flame, Users, Plus, MessageCircle, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePosts, Post, Comment } from "@/hooks/usePosts";
import { useFollows } from "@/hooks/useFollows";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useToast } from "@/hooks/use-toast";
import { XPostCard } from "@/components/social/XPostCard";
import { XComposeModal } from "@/components/social/XComposeModal";
import { XCommentSheet } from "@/components/social/XCommentSheet";
import { TrendingSidebar } from "@/components/social/TrendingSidebar";

// Mock prices for portfolio snapshot
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
  const { posts, loading, createPost, likePost, repostPost, bookmarkPost, fetchComments, addComment, deletePost } = usePosts();
  const { isFollowing } = useFollows();
  const { portfolio } = usePortfolio();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"for-you" | "following" | "trending">("for-you");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [composeOpen, setComposeOpen] = useState(false);

  // Comments
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch) setSearchQuery(urlSearch);
  }, [searchParams]);

  // Portfolio snapshot for compose
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

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase().replace(/^[#$]/, "");
        const contentMatch = post.content.toLowerCase().includes(q);
        const stockMatch = post.stock_mentions?.some(s => s.toLowerCase().includes(q));
        if (!contentMatch && !stockMatch) return false;
      }
      if (activeTab === "following") return isFollowing(post.user_id);
      if (activeTab === "trending") return post.likes_count >= 3 || post.reposts_count >= 1;
      return true;
    });
  }, [posts, searchQuery, activeTab, isFollowing]);

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
    if (!error) {
      const updated = await fetchComments(selectedPost.id);
      setComments(updated);
    }
  };

  const tabs = [
    { id: "for-you" as const, label: "For You" },
    { id: "following" as const, label: "Following" },
    { id: "trending" as const, label: "Trending" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top header - X style */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-foreground">TradersHub</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => navigate("/notifications")} data-small-target>
              <Bell className="h-5 w-5" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts, $stocks, #topics..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-9 h-10 rounded-full bg-muted/50 border-border text-sm"
            />
            {searchQuery && (
              <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full" onClick={clearSearch} data-small-target>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tabs - X style underline tabs */}
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
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Search results indicator */}
      {searchQuery && (
        <div className="px-4 py-2 bg-muted/20 border-b border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Results for <span className="font-semibold text-foreground">"{searchQuery}"</span>
          </p>
          <Button variant="ghost" size="sm" className="h-7 text-xs rounded-full" onClick={clearSearch}>Clear</Button>
        </div>
      )}

      {/* Main content area */}
      <div className="max-w-[1200px] mx-auto flex">
        {/* Feed */}
        <div className="flex-1 max-w-[600px] min-w-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-12 text-center">
              {activeTab === "following" ? (
                <>
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                  <p className="font-semibold mb-1">No posts from people you follow</p>
                  <p className="text-sm text-muted-foreground mb-4">Follow traders to see their posts here</p>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setActiveTab("for-you")}>Discover traders</Button>
                </>
              ) : activeTab === "trending" ? (
                <>
                  <Flame className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                  <p className="font-semibold mb-1">No trending posts yet</p>
                  <p className="text-sm text-muted-foreground">Posts with high engagement will appear here</p>
                </>
              ) : (
                <>
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                  <p className="font-semibold mb-1">No posts yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Be the first to share your market insights!</p>
                  {user && (
                    <Button className="rounded-full" onClick={() => setComposeOpen(true)}>
                      <Feather className="h-4 w-4 mr-2" />Create post
                    </Button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredPosts.map(post => (
                <XPostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onLike={handleLike}
                  onComment={openComments}
                  onRepost={handleRepost}
                  onBookmark={handleBookmark}
                  onShare={handleShare}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block w-[350px] pl-6 pt-4 sticky top-[140px] self-start">
          <TrendingSidebar />
        </div>
      </div>

      {/* Floating compose button - X style */}
      {user && (
        <button
          className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          onClick={() => setComposeOpen(true)}
          style={{ boxShadow: "var(--shadow-primary)" }}
        >
          <Feather className="h-6 w-6" />
        </button>
      )}

      {/* Compose modal */}
      <XComposeModal
        open={composeOpen}
        onOpenChange={setComposeOpen}
        user={user}
        profile={profile}
        onPost={handlePost}
        portfolioSnapshot={portfolioSnapshot}
      />

      {/* Comment / Post detail sheet */}
      <XCommentSheet
        open={commentSheetOpen}
        onOpenChange={setCommentSheetOpen}
        post={selectedPost}
        currentUserId={user?.id}
        comments={comments}
        loadingComments={loadingComments}
        onAddComment={handleAddComment}
        onLike={handleLike}
        onRepost={handleRepost}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onDelete={handleDelete}
      />
    </div>
  );
}
