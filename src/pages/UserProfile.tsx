import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, UserPlus, MessageCircle, MoreHorizontal, Lock, Verified, Heart, Repeat2, FileText, Camera, Loader2, Share, TrendingUp, TrendingDown, Award, Target, PieChart, ChevronRight, Image as ImageIcon, MapPin, Pin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFollows } from "@/hooks/useFollows";
import { useToast } from "@/hooks/use-toast";
import { FollowersDialog } from "@/components/social/FollowersDialog";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { SparklineChart } from "@/components/shared/SparklineChart";
import { XPostCard } from "@/components/social/XPostCard";
import { usePosts, Post, Comment } from "@/hooks/usePosts";
import { XCommentSheet } from "@/components/social/XCommentSheet";

interface UserProfileData {
  id: string; user_id: string; full_name: string | null; avatar_url: string | null;
  banner_url: string | null; bio: string | null; portfolio_public: boolean;
  followers_count: number; following_count: number; created_at: string;
  handle?: string | null;
}

interface UserPost {
  id: string; content: string; image_url: string | null; created_at: string;
  user_id: string; stock_mentions: string[] | null; likes_count: number;
  comments_count: number; reposts_count: number; is_liked: boolean;
  is_reposted: boolean; is_bookmarked: boolean;
  author?: { id?: string; user_id?: string; full_name: string | null; avatar_url: string | null; bio?: string | null };
}

interface PortfolioHolding {
  symbol: string; name: string; shares: number; avg_cost: number; sector: string | null;
}

const MOCK_PRICES: Record<string, number> = {
  SCOM: 12.85, SAFCOM: 12.85, EQTY: 62.50, KCB: 45.30, COOP: 15.20,
  SCBK: 185.00, BAMB: 89.75, EABL: 155.00, BAT: 320.00, ABSA: 14.10,
};

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isFollowing, toggleFollow, fetchFollowers, fetchFollowing } = useFollows();
  const { likePost, repostPost, bookmarkPost, fetchComments, addComment, deletePost } = usePosts();
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<UserPost[]>([]);
  const [repostedPosts, setRepostedPosts] = useState<UserPost[]>([]);
  const [publicPortfolio, setPublicPortfolio] = useState<PortfolioHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<"followers" | "following">("followers");
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const isOwnProfile = user?.id === userId;
  const userIsFollowing = userId ? isFollowing(userId) : false;
  const performanceStats = { winRate: 73, avgReturn: 12.4, streak: 5 };

  useEffect(() => {
    if (userId) {
      fetchProfile(); fetchUserPosts(); fetchUserLikes(); fetchUserReposts();
      loadFollowCounts(); fetchPublicPortfolio();
    }
  }, [userId, user]);

  const fetchProfile = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data } = await supabase.from("profiles_public").select("id, user_id, full_name, avatar_url, banner_url, bio, portfolio_public, followers_count, following_count, created_at, handle").eq("user_id", userId).maybeSingle();
      if (data) setProfileData(data as UserProfileData);
      else {
        const { data: fb } = await supabase.from("profiles").select("id, user_id, full_name, avatar_url, banner_url, bio, portfolio_public, followers_count, following_count, created_at, handle").eq("user_id", userId).maybeSingle();
        if (fb) setProfileData(fb as UserProfileData);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const loadFollowCounts = async () => {
    if (!userId) return;
    const [f1, f2] = await Promise.all([fetchFollowers(userId), fetchFollowing(userId)]);
    setFollowersCount(f1.length); setFollowingCount(f2.length);
  };

  const fetchPublicPortfolio = async () => {
    if (!userId) return;
    const { data } = await supabase.from("portfolios").select("symbol, name, shares, avg_cost, sector").eq("user_id", userId).limit(10);
    if (data) setPublicPortfolio(data);
  };

  const fetchUserPosts = async () => {
    const { data: postsData } = await supabase.from("posts").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (postsData) {
      const withCounts = await Promise.all(postsData.map(async (post) => {
        const [l, c, r, il, ir, ib] = await Promise.all([
          supabase.from("post_likes").select("id", { count: "exact", head: true }).eq("post_id", post.id),
          supabase.from("post_comments").select("id", { count: "exact", head: true }).eq("post_id", post.id),
          supabase.from("post_reposts").select("id", { count: "exact", head: true }).eq("post_id", post.id),
          user ? supabase.from("post_likes").select("id").eq("post_id", post.id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
          user ? supabase.from("post_reposts").select("id").eq("post_id", post.id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
          user ? supabase.from("post_bookmarks").select("id").eq("post_id", post.id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
        ]);
        return { ...post, likes_count: l.count || 0, comments_count: c.count || 0, reposts_count: r.count || 0, is_liked: !!il.data, is_reposted: !!ir.data, is_bookmarked: !!ib.data };
      }));
      setUserPosts(withCounts);
    }
  };

  const fetchUserLikes = async () => {
    if (!userId) return;
    const { data: ld } = await supabase.from("post_likes").select("post_id").eq("user_id", userId).order("created_at", { ascending: false });
    if (ld && ld.length > 0) {
      const pids = ld.map(l => l.post_id);
      const { data: pd } = await supabase.from("posts").select("*").in("id", pids);
      if (pd) {
        const uids = [...new Set(pd.map(p => p.user_id))];
        const { data: profs } = await supabase.from("profiles_public").select("user_id, full_name, avatar_url").in("user_id", uids);
        const pm = new Map(profs?.map(p => [p.user_id, p]));
        const withDetails = await Promise.all(pd.map(async (post) => {
          const [l, c, r] = await Promise.all([
            supabase.from("post_likes").select("id", { count: "exact", head: true }).eq("post_id", post.id),
            supabase.from("post_comments").select("id", { count: "exact", head: true }).eq("post_id", post.id),
            supabase.from("post_reposts").select("id", { count: "exact", head: true }).eq("post_id", post.id),
          ]);
          const a = pm.get(post.user_id);
          return { ...post, likes_count: l.count || 0, comments_count: c.count || 0, reposts_count: r.count || 0, is_liked: true, is_reposted: false, is_bookmarked: false, author: a ? { full_name: a.full_name, avatar_url: a.avatar_url } : undefined };
        }));
        setLikedPosts(withDetails);
      }
    }
  };

  const fetchUserReposts = async () => {
    if (!userId) return;
    const { data: rd } = await supabase.from("post_reposts").select("post_id").eq("user_id", userId).order("created_at", { ascending: false });
    if (rd && rd.length > 0) {
      const pids = rd.map(r => r.post_id);
      const { data: pd } = await supabase.from("posts").select("*").in("id", pids);
      if (pd) {
        const uids = [...new Set(pd.map(p => p.user_id))];
        const { data: profs } = await supabase.from("profiles_public").select("user_id, full_name, avatar_url").in("user_id", uids);
        const pm = new Map(profs?.map(p => [p.user_id, p]));
        const withDetails = await Promise.all(pd.map(async (post) => {
          const [l, c, r] = await Promise.all([
            supabase.from("post_likes").select("id", { count: "exact", head: true }).eq("post_id", post.id),
            supabase.from("post_comments").select("id", { count: "exact", head: true }).eq("post_id", post.id),
            supabase.from("post_reposts").select("id", { count: "exact", head: true }).eq("post_id", post.id),
          ]);
          const a = pm.get(post.user_id);
          return { ...post, likes_count: l.count || 0, comments_count: c.count || 0, reposts_count: r.count || 0, is_liked: false, is_reposted: true, is_bookmarked: false, author: a ? { full_name: a.full_name, avatar_url: a.avatar_url } : undefined };
        }));
        setRepostedPosts(withDetails);
      }
    }
  };

  const handleFollow = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!userId) return;
    const { error } = await toggleFollow(userId);
    if (!error) { toast({ title: userIsFollowing ? "Unfollowed" : "Following!" }); loadFollowCounts(); }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { toast({ title: "Invalid file", variant: "destructive" }); return; }
    if (file.size > 5 * 1024 * 1024) { toast({ title: "Max 5MB", variant: "destructive" }); return; }
    setUploadingBanner(true);
    try {
      const ext = file.name.split(".").pop();
      const fn = `${user.id}/banner-${Date.now()}.${ext}`;
      const { error: ue } = await supabase.storage.from("banners").upload(fn, file, { upsert: true });
      if (ue) throw ue;
      const { data: { publicUrl } } = supabase.storage.from("banners").getPublicUrl(fn);
      await supabase.from("profiles").update({ banner_url: publicUrl }).eq("user_id", user.id);
      setProfileData(prev => prev ? { ...prev, banner_url: publicUrl } : null);
      toast({ title: "Banner updated!" });
    } catch { toast({ title: "Upload failed", variant: "destructive" }); }
    finally { setUploadingBanner(false); }
  };

  const handleShare = async () => {
    if (navigator.share) { try { await navigator.share({ title: `${profileData?.full_name}'s Profile`, url: window.location.href }); } catch {} }
    else { await navigator.clipboard.writeText(window.location.href); toast({ title: "Profile link copied!" }); }
  };

  const handleLike = async (postId: string) => { if (!user) { navigate("/auth"); return; } await likePost(postId); };
  const handleRepost = async (postId: string) => { if (!user) { navigate("/auth"); return; } await repostPost(postId); };
  const handleBookmark = async (postId: string) => { if (!user) { navigate("/auth"); return; } await bookmarkPost(postId); };
  const handlePostShare = async (post: Post) => { await navigator.clipboard.writeText(window.location.href); toast({ title: "Link copied" }); };
  const handleDelete = async (postId: string) => { await deletePost(postId); fetchUserPosts(); };

  const openComments = async (post: Post) => {
    setSelectedPost(post); setCommentSheetOpen(true); setLoadingComments(true);
    const fetched = await fetchComments(post.id);
    setComments(fetched); setLoadingComments(false);
  };

  const handleAddComment = async (content: string) => {
    if (!selectedPost || !user) return;
    const { error } = await addComment(selectedPost.id, content);
    if (!error) { const updated = await fetchComments(selectedPost.id); setComments(updated); }
  };

  const getInitials = (name: string | null) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";
  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const handle = profileData?.handle || profileData?.full_name?.toLowerCase().replace(/\s+/g, "") || "user";

  const portfolioSummary = useMemo(() => {
    if (!publicPortfolio.length) return null;
    const holdings = publicPortfolio.map(h => {
      const cp = MOCK_PRICES[h.symbol] || h.avg_cost * 1.05;
      const gain = ((cp - h.avg_cost) / h.avg_cost) * 100;
      return { ...h, currentPrice: cp, gain };
    });
    const totalValue = holdings.reduce((s, h) => s + h.currentPrice * h.shares, 0);
    const totalCost = holdings.reduce((s, h) => s + h.avg_cost * h.shares, 0);
    return { totalValue, totalGain: totalValue - totalCost, gainPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0, holdings };
  }, [publicPortfolio]);

  const castToPost = (p: UserPost): Post => ({
    ...p, updated_at: p.created_at,
    author: p.author ? { id: p.author.id || "", user_id: p.author.user_id || p.user_id, full_name: p.author.full_name, avatar_url: p.author.avatar_url, bio: p.author.bio || null }
      : { id: "", user_id: p.user_id, full_name: profileData?.full_name || null, avatar_url: profileData?.avatar_url || null, bio: null },
  });

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" /></div>;
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
            <h1 className="font-bold">User Not Found</h1>
          </div>
        </header>
        <div className="p-8 text-center text-muted-foreground">
          <p>This profile doesn't exist.</p>
          <Button variant="outline" className="mt-4 rounded-full" onClick={() => navigate("/traders-hub")}>Back to TradersHub</Button>
        </div>
      </div>
    );
  }

  // Find first post to "pin" (most liked)
  const pinnedPost = userPosts.length > 0 ? [...userPosts].sort((a, b) => b.likes_count - a.likes_count)[0] : null;
  const regularPosts = userPosts.filter(p => p.id !== pinnedPost?.id);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full shrink-0" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="font-bold text-base flex items-center gap-1 truncate">
                {profileData.full_name || "User"}
                <Verified className="h-3.5 w-3.5 text-primary fill-primary shrink-0" />
              </h1>
              <p className="text-xs text-muted-foreground">{userPosts.length} posts</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full"><MoreHorizontal className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}><Share className="h-4 w-4 mr-2" />Share Profile</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Banner */}
      <div className="relative h-36 sm:h-44 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 overflow-hidden">
        {profileData.banner_url && <img src={profileData.banner_url} alt="Banner" className="w-full h-full object-cover" />}
        {isOwnProfile && (
          <>
            <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleBannerUpload} />
            <Button size="icon" variant="secondary" className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-background/70 hover:bg-background/90 backdrop-blur-sm" onClick={() => bannerInputRef.current?.click()} disabled={uploadingBanner}>
              {uploadingBanner ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </Button>
          </>
        )}
      </div>

      {/* Avatar + actions */}
      <div className="px-4 -mt-16">
        <div className="flex justify-between items-end">
          <Avatar className="h-28 w-28 sm:h-32 sm:w-32 ring-4 ring-background shadow-xl">
            <AvatarImage src={profileData.avatar_url || ""} className="object-cover" />
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">{getInitials(profileData.full_name)}</AvatarFallback>
          </Avatar>
          <div className="flex gap-2 mb-2">
            {isOwnProfile ? (
              <Button variant="outline" size="sm" className="h-9 rounded-full font-bold text-sm" onClick={() => setEditProfileOpen(true)}>Edit profile</Button>
            ) : (
              <>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full"><MessageCircle className="h-4 w-4" /></Button>
                <Button variant={userIsFollowing ? "outline" : "default"} size="sm" onClick={handleFollow} className="h-9 rounded-full font-bold text-sm px-5">
                  {userIsFollowing ? "Following" : "Follow"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Name + bio */}
        <div className="mt-3">
          <h2 className="text-xl font-extrabold flex items-center gap-1.5">
            {profileData.full_name || "User"}
            <Verified className="h-4.5 w-4.5 text-primary fill-primary" />
          </h2>
          <p className="text-sm text-muted-foreground">@{handle}</p>

          {profileData.bio && <p className="mt-2 text-[15px] leading-relaxed">{profileData.bio}</p>}

          {/* Enhanced Performance Badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            <div className="flex items-center gap-1.5 bg-bull/10 border border-bull/20 rounded-full px-3 py-1.5">
              <Target className="h-4 w-4 text-bull" />
              <span className="text-sm font-bold text-bull">{performanceStats.winRate}%</span>
              <span className="text-xs text-bull/70">Win Rate</span>
            </div>
            <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">+{performanceStats.avgReturn}%</span>
              <span className="text-xs text-primary/70">Avg Return</span>
            </div>
            <div className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 rounded-full px-3 py-1.5">
              <Award className="h-4 w-4 text-accent" />
              <span className="text-sm font-bold text-accent">{performanceStats.streak}</span>
              <span className="text-xs text-accent/70">Streak 🔥</span>
            </div>
          </div>

          {/* Location + join date */}
          <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Kenya</span>
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Joined {formatDate(profileData.created_at)}</span>
          </div>

          {/* Following/Followers */}
          <div className="flex gap-4 mt-2.5">
            <button className="hover:underline text-sm" onClick={() => { setDialogTab("following"); setFollowersDialogOpen(true); }}>
              <span className="font-bold">{followingCount}</span> <span className="text-muted-foreground">Following</span>
            </button>
            <button className="hover:underline text-sm" onClick={() => { setDialogTab("followers"); setFollowersDialogOpen(true); }}>
              <span className="font-bold">{followersCount}</span> <span className="text-muted-foreground">Followers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="mt-4">
        <TabsList className="w-full grid bg-transparent border-b border-border rounded-none h-11 p-0" style={{ gridTemplateColumns: isOwnProfile ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)' }}>
          {[
            { value: "posts", label: "Posts" },
            { value: "replies", label: "Replies" },
            { value: "media", label: "Media" },
            ...(isOwnProfile ? [{ value: "likes", label: "Likes" }] : []),
            { value: "portfolio", label: "Portfolio" },
          ].map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-full text-xs sm:text-sm font-semibold"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Posts tab with pinned post */}
        <TabsContent value="posts" className="mt-0">
          {userPosts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground"><FileText className="h-10 w-10 mx-auto mb-3 opacity-40" /><p className="text-sm">No posts yet</p></div>
          ) : (
            <div className="divide-y divide-border">
              {/* Pinned Post */}
              {pinnedPost && (
                <div>
                  <div className="flex items-center gap-1.5 px-4 pt-2 text-xs text-muted-foreground">
                    <Pin className="h-3 w-3" />
                    <span className="font-medium">Pinned</span>
                  </div>
                  <XPostCard post={castToPost(pinnedPost)} currentUserId={user?.id} onLike={handleLike} onComment={openComments} onRepost={handleRepost} onBookmark={handleBookmark} onShare={handlePostShare} onDelete={isOwnProfile ? handleDelete : undefined} />
                </div>
              )}
              {regularPosts.map(post => (
                <XPostCard key={post.id} post={castToPost(post)} currentUserId={user?.id} onLike={handleLike} onComment={openComments} onRepost={handleRepost} onBookmark={handleBookmark} onShare={handlePostShare} onDelete={isOwnProfile ? handleDelete : undefined} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Replies tab */}
        <TabsContent value="replies" className="mt-0">
          {repostedPosts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground"><MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-40" /><p className="text-sm">No replies yet</p></div>
          ) : (
            <div className="divide-y divide-border">
              {repostedPosts.map(post => <XPostCard key={post.id} post={castToPost(post)} currentUserId={user?.id} onLike={handleLike} onComment={openComments} onRepost={handleRepost} onBookmark={handleBookmark} onShare={handlePostShare} />)}
            </div>
          )}
        </TabsContent>

        {/* Media tab */}
        <TabsContent value="media" className="mt-0">
          {(() => {
            const mediaPosts = userPosts.filter(p => p.image_url);
            return mediaPosts.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground"><ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-40" /><p className="text-sm">No media yet</p></div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5">
                {mediaPosts.map(post => (
                  <div key={post.id} className="aspect-square overflow-hidden cursor-pointer" onClick={() => openComments(castToPost(post))}>
                    <img src={post.image_url!} alt="" className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                  </div>
                ))}
              </div>
            );
          })()}
        </TabsContent>

        {/* Likes tab — private to owner */}
        <TabsContent value="likes" className="mt-0">
          {!isOwnProfile ? (
            <div className="p-12 text-center text-muted-foreground">
              <Lock className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">Likes are private</p>
              <p className="text-xs text-muted-foreground mt-1">Only visible to the account owner</p>
            </div>
          ) : likedPosts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground"><Heart className="h-10 w-10 mx-auto mb-3 opacity-40" /><p className="text-sm">No likes yet</p></div>
          ) : (
            <div className="divide-y divide-border">
              {likedPosts.map(post => <XPostCard key={post.id} post={castToPost(post)} currentUserId={user?.id} onLike={handleLike} onComment={openComments} onRepost={handleRepost} onBookmark={handleBookmark} onShare={handlePostShare} />)}
            </div>
          )}
        </TabsContent>

        {/* Portfolio tab — enhanced */}
        <TabsContent value="portfolio" className="mt-0">
          {!profileData.portfolio_public && !isOwnProfile ? (
            <div className="p-12 text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
              <p className="font-semibold mb-1">Portfolio is private</p>
              <p className="text-sm text-muted-foreground">This user has chosen to keep their portfolio private</p>
            </div>
          ) : publicPortfolio.length === 0 ? (
            <div className="p-12 text-center">
              <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
              <p className="font-semibold mb-1">No portfolio data</p>
              <p className="text-sm text-muted-foreground">{isOwnProfile ? "Add trades to display your portfolio here" : "This user hasn't added any trades yet"}</p>
              {isOwnProfile && <Button className="mt-4 rounded-full" onClick={() => navigate("/track-investments")}>Add Trade</Button>}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Portfolio Summary Card */}
              {portfolioSummary && (
                <Card className="soft-card overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground font-medium">Portfolio Value</span>
                      <Button variant="ghost" size="sm" className="h-7 rounded-full text-xs text-primary" onClick={() => navigate("/track-investments")}>
                        View Full Portfolio <ChevronRight className="h-3 w-3 ml-0.5" />
                      </Button>
                    </div>
                    <div className="text-2xl font-extrabold">KES {portfolioSummary.totalValue.toLocaleString()}</div>
                    <div className={`text-sm font-semibold mt-1 flex items-center gap-1 ${portfolioSummary.totalGain >= 0 ? "text-bull" : "text-bear"}`}>
                      {portfolioSummary.totalGain >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {portfolioSummary.totalGain >= 0 ? "+" : ""}KES {Math.abs(portfolioSummary.totalGain).toLocaleString()} ({portfolioSummary.gainPercent.toFixed(1)}%)
                    </div>
                    
                    {/* Mini performance chart placeholder */}
                    <div className="mt-3 h-16 flex items-end gap-0.5">
                      {Array.from({ length: 20 }).map((_, i) => {
                        const h = 20 + Math.random() * 80;
                        return <div key={i} className="flex-1 bg-primary/20 rounded-t" style={{ height: `${h}%` }} />;
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Holdings list */}
              <div className="space-y-1">
                {portfolioSummary?.holdings.map(h => (
                  <div key={h.symbol} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer tap-scale" onClick={() => navigate(`/stock/${h.symbol}`)}>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{h.symbol.slice(0, 2)}</div>
                      <div>
                        <div className="font-semibold text-sm">${h.symbol}</div>
                        <div className="text-xs text-muted-foreground">{h.shares} shares · KES {h.avg_cost.toFixed(2)} avg</div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <SparklineChart isPositive={h.gain >= 0} width={40} height={16} />
                      <div>
                        <div className="text-sm font-medium">KES {h.currentPrice.toFixed(2)}</div>
                        <div className={`text-xs font-medium ${h.gain >= 0 ? "text-bull" : "text-bear"}`}>
                          {h.gain >= 0 ? "+" : ""}{h.gain.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Share portfolio button */}
              {isOwnProfile && (
                <Button className="w-full rounded-full h-11 font-bold btn-primary" onClick={() => toast({ title: "Portfolio shared to compose!" })}>
                  <Share className="h-4 w-4 mr-2" />Share Portfolio
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Comment sheet */}
      <XCommentSheet open={commentSheetOpen} onOpenChange={setCommentSheetOpen} post={selectedPost} currentUserId={user?.id} comments={comments} loadingComments={loadingComments} onAddComment={handleAddComment} onLike={handleLike} onRepost={handleRepost} onBookmark={handleBookmark} onShare={handlePostShare} onDelete={isOwnProfile ? handleDelete : undefined} />
      {userId && <FollowersDialog open={followersDialogOpen} onOpenChange={setFollowersDialogOpen} userId={userId} initialTab={dialogTab} />}
      <EditProfileDialog open={editProfileOpen} onOpenChange={(open) => { setEditProfileOpen(open); if (!open) fetchProfile(); }} />
    </div>
  );
}
