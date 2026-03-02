import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Settings, UserPlus, UserMinus, MessageCircle, MoreHorizontal, Lock, Verified, Heart, Repeat2, FileText, Bookmark, Camera, Loader2, Share, TrendingUp, TrendingDown, Award, Target, BarChart3, PieChart, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFollows } from "@/hooks/useFollows";
import { useToast } from "@/hooks/use-toast";
import { FollowersDialog } from "@/components/social/FollowersDialog";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { SparklineChart } from "@/components/shared/SparklineChart";

interface UserProfileData {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  portfolio_public: boolean;
  followers_count: number;
  following_count: number;
  created_at: string;
}

interface UserPost {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface UserComment {
  id: string;
  content: string;
  created_at: string;
  post_id: string;
  post_content?: string;
  post_author_name?: string;
}

interface PortfolioHolding {
  symbol: string;
  name: string;
  shares: number;
  avg_cost: number;
  sector: string | null;
}

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isFollowing, toggleFollow, fetchFollowers, fetchFollowing } = useFollows();
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<UserPost[]>([]);
  const [userComments, setUserComments] = useState<UserComment[]>([]);
  const [repostedPosts, setRepostedPosts] = useState<UserPost[]>([]);
  const [publicPortfolio, setPublicPortfolio] = useState<PortfolioHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<"followers" | "following">("followers");
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const isOwnProfile = user?.id === userId;
  const userIsFollowing = userId ? isFollowing(userId) : false;

  // Mock performance stats
  const performanceStats = {
    winRate: 73,
    avgReturn: 12.4,
    totalTrades: 47,
    bestMonth: "+18.5%",
    streak: 5,
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchUserPosts();
      fetchUserLikes();
      fetchUserComments();
      fetchUserReposts();
      loadFollowCounts();
      fetchPublicPortfolio();
    }
  }, [userId, user]);

  const fetchProfile = async () => {
    if (!userId) return;
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles_public')
        .select('id, user_id, full_name, avatar_url, banner_url, bio, portfolio_public, followers_count, following_count, created_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) console.error('Profile fetch error:', error);
      
      if (data) {
        setProfile(data as UserProfileData);
      } else {
        const { data: fallbackData } = await supabase
          .from('profiles')
          .select('id, user_id, full_name, avatar_url, banner_url, bio, portfolio_public, followers_count, following_count, created_at')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (fallbackData) setProfile(fallbackData as UserProfileData);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
    setLoading(false);
  };

  const loadFollowCounts = async () => {
    if (!userId) return;
    const [followers, following] = await Promise.all([
      fetchFollowers(userId),
      fetchFollowing(userId)
    ]);
    setFollowersCount(followers.length);
    setFollowingCount(following.length);
  };

  const fetchPublicPortfolio = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('portfolios')
      .select('symbol, name, shares, avg_cost, sector')
      .eq('user_id', userId)
      .limit(10);
    if (data) setPublicPortfolio(data);
  };

  const fetchUserPosts = async () => {
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (postsData) {
      const postsWithCounts = await Promise.all(
        postsData.map(async (post) => {
          const [likesRes, commentsRes, repostsRes] = await Promise.all([
            supabase.from('post_likes').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('post_comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('post_reposts').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
          ]);
          return { ...post, likes_count: likesRes.count || 0, comments_count: commentsRes.count || 0, reposts_count: repostsRes.count || 0 };
        })
      );
      setPosts(postsWithCounts);
    }
  };

  const fetchUserLikes = async () => {
    if (!userId) return;
    const { data: likesData } = await supabase.from('post_likes').select('post_id').eq('user_id', userId).order('created_at', { ascending: false });
    if (likesData && likesData.length > 0) {
      const postIds = likesData.map(l => l.post_id);
      const { data: postsData } = await supabase.from('posts').select('*').in('id', postIds);
      if (postsData) {
        const userIds = [...new Set(postsData.map(p => p.user_id))];
        const { data: profiles } = await supabase.from('profiles_public').select('user_id, full_name, avatar_url').in('user_id', userIds);
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
        const postsWithDetails = await Promise.all(postsData.map(async (post) => {
          const [likesRes, commentsRes, repostsRes] = await Promise.all([
            supabase.from('post_likes').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('post_comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('post_reposts').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
          ]);
          const author = profileMap.get(post.user_id);
          return { ...post, likes_count: likesRes.count || 0, comments_count: commentsRes.count || 0, reposts_count: repostsRes.count || 0, author: author ? { full_name: author.full_name, avatar_url: author.avatar_url } : undefined };
        }));
        setLikedPosts(postsWithDetails);
      }
    }
  };

  const fetchUserComments = async () => {
    if (!userId) return;
    const { data: commentsData } = await supabase.from('post_comments').select('id, content, created_at, post_id').eq('user_id', userId).order('created_at', { ascending: false });
    if (commentsData && commentsData.length > 0) {
      const postIds = [...new Set(commentsData.map(c => c.post_id))];
      const { data: postsData } = await supabase.from('posts').select('id, content, user_id').in('id', postIds);
      if (postsData) {
        const userIds = [...new Set(postsData.map(p => p.user_id))];
        const { data: profiles } = await supabase.from('profiles_public').select('user_id, full_name').in('user_id', userIds);
        const postMap = new Map(postsData.map(p => [p.id, p]));
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
        setUserComments(commentsData.map(comment => {
          const post = postMap.get(comment.post_id);
          const author = post ? profileMap.get(post.user_id) : null;
          return { ...comment, post_content: post?.content?.slice(0, 100) || '', post_author_name: author?.full_name || 'User' };
        }));
      }
    }
  };

  const fetchUserReposts = async () => {
    if (!userId) return;
    const { data: repostsData } = await supabase.from('post_reposts').select('post_id').eq('user_id', userId).order('created_at', { ascending: false });
    if (repostsData && repostsData.length > 0) {
      const postIds = repostsData.map(r => r.post_id);
      const { data: postsData } = await supabase.from('posts').select('*').in('id', postIds);
      if (postsData) {
        const userIds = [...new Set(postsData.map(p => p.user_id))];
        const { data: profiles } = await supabase.from('profiles_public').select('user_id, full_name, avatar_url').in('user_id', userIds);
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
        const postsWithDetails = await Promise.all(postsData.map(async (post) => {
          const [likesRes, commentsRes, repostsRes] = await Promise.all([
            supabase.from('post_likes').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('post_comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('post_reposts').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
          ]);
          const author = profileMap.get(post.user_id);
          return { ...post, likes_count: likesRes.count || 0, comments_count: commentsRes.count || 0, reposts_count: repostsRes.count || 0, author: author ? { full_name: author.full_name, avatar_url: author.avatar_url } : undefined };
        }));
        setRepostedPosts(postsWithDetails);
      }
    }
  };

  const handleFollow = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!userId) return;
    const { error } = await toggleFollow(userId);
    if (!error) {
      toast({ title: userIsFollowing ? "Unfollowed" : "Following!" });
      loadFollowCounts();
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) { toast({ title: "Invalid file type", variant: "destructive" }); return; }
    if (file.size > 5 * 1024 * 1024) { toast({ title: "File too large", description: "Max 5MB", variant: "destructive" }); return; }

    setUploadingBanner(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/banner-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('banners').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(fileName);
      const { error: updateError } = await supabase.from('profiles').update({ banner_url: publicUrl }).eq('user_id', user.id);
      if (updateError) throw updateError;
      setProfile(prev => prev ? { ...prev, banner_url: publicUrl } : null);
      toast({ title: "Banner updated!" });
    } catch (error) {
      console.error('Banner upload error:', error);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally { setUploadingBanner(false); }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `${profile?.full_name || 'User'}'s Profile`, url: window.location.href }); } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Profile link copied!" });
    }
  };

  const openFollowersDialog = (tab: "followers" | "following") => { setDialogTab(tab); setFollowersDialogOpen(true); };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return formatDate(date);
  };

  const getMockPrice = (symbol: string) => {
    const prices: Record<string, number> = { SAFCOM: 12.85, EQTY: 62.50, KCB: 45.30, COOP: 15.20, SCBK: 185.00, BAMB: 89.75 };
    return prices[symbol] || Math.random() * 50 + 10;
  };

  const renderPost = (post: UserPost, showAuthor: boolean = false) => (
    <div key={post.id} className="p-3 sm:p-4 border-b border-border hover:bg-muted/20 transition-colors">
      <div className="flex gap-2.5 sm:gap-3">
        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 cursor-pointer shrink-0" onClick={() => navigate(`/profile/${showAuthor ? post.user_id : profile?.user_id}`)}>
          <AvatarImage src={(showAuthor ? post.author?.avatar_url : profile?.avatar_url) || ""} />
          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
            {getInitials(showAuthor ? post.author?.full_name || null : profile?.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-semibold text-sm cursor-pointer hover:underline truncate max-w-[140px] sm:max-w-none" onClick={() => navigate(`/profile/${showAuthor ? post.user_id : profile?.user_id}`)}>
              {showAuthor ? (post.author?.full_name || 'User') : (profile?.full_name || 'User')}
            </span>
            <Verified className="h-3 w-3 text-primary fill-primary shrink-0" />
            <span className="text-xs text-muted-foreground">· {formatTimeAgo(post.created_at)}</span>
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap break-words leading-relaxed">
            {post.content.split(/(\$[A-Z]+)/g).map((part, i) => 
              part.startsWith('$') ? (
                <span key={i} className="text-primary font-medium cursor-pointer hover:underline" onClick={() => navigate(`/stock/${part.slice(1)}`)}>{part}</span>
              ) : part
            )}
          </p>
          {post.image_url && (
            <img src={post.image_url} alt="Post" className="mt-2 rounded-xl max-h-48 sm:max-h-60 object-cover w-full border border-border" />
          )}
          <div className="flex items-center gap-4 sm:gap-6 mt-2.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{post.likes_count}</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{post.comments_count}</span>
            <span className="flex items-center gap-1"><Repeat2 className="h-3.5 w-3.5" />{post.reposts_count}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center gap-3 p-3 sm:p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-bold">User Not Found</h1>
          </div>
        </header>
        <div className="p-4 text-center text-muted-foreground">
          <p>This user profile does not exist or has been removed.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/traders-hub')}>Back to TradersHub</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9 shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="font-bold flex items-center gap-1 text-sm sm:text-base truncate">
                {profile.full_name || 'User'}
                <Verified className="h-3.5 w-3.5 text-primary fill-primary shrink-0" />
              </h1>
              <p className="text-xs text-muted-foreground">{posts.length} posts</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9"><MoreHorizontal className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}><Share className="h-4 w-4 mr-2" />Share Profile</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Banner + Profile */}
      <div className="relative">
        <div className="relative h-28 sm:h-36 bg-gradient-primary overflow-hidden">
          {profile.banner_url && <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />}
          {isOwnProfile && (
            <>
              <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleBannerUpload} />
              <Button size="icon" variant="secondary" className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-background/60 hover:bg-background/80 backdrop-blur-sm border-0" onClick={() => bannerInputRef.current?.click()} disabled={uploadingBanner}>
                {uploadingBanner ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </Button>
            </>
          )}
        </div>

        <div className="px-3 sm:px-4 -mt-14 sm:-mt-16">
          <div className="flex justify-between items-end">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 ring-4 ring-background">
              <AvatarImage src={profile.avatar_url || ""} className="object-cover" />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl sm:text-3xl font-bold">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-2 mb-2">
              {isOwnProfile ? (
                <Button variant="outline" size="sm" onClick={() => setEditProfileOpen(true)} className="h-9 text-xs sm:text-sm">
                  <Settings className="h-3.5 w-3.5 mr-1" />Edit
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="icon" className="h-9 w-9"><MessageCircle className="h-4 w-4" /></Button>
                  <Button variant={userIsFollowing ? "outline" : "default"} size="sm" onClick={handleFollow} className="h-9 text-xs sm:text-sm">
                    {userIsFollowing ? <><UserMinus className="h-3.5 w-3.5 mr-1" />Following</> : <><UserPlus className="h-3.5 w-3.5 mr-1" />Follow</>}
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="mt-3">
            <h2 className="text-lg sm:text-xl font-bold">{profile.full_name || 'User'}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">@{profile.full_name?.toLowerCase().replace(/\s+/g, '') || 'user'}</p>
            {profile.bio && <p className="mt-2 text-sm leading-relaxed">{profile.bio}</p>}

            {/* Performance Badges */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant="outline" className="text-[10px] bg-bull/5 text-bull border-bull/20 gap-1">
                <Target className="h-2.5 w-2.5" />{performanceStats.winRate}% Win Rate
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20 gap-1">
                <TrendingUp className="h-2.5 w-2.5" />+{performanceStats.avgReturn}% Avg
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-accent/5 text-accent border-accent/20 gap-1">
                <Award className="h-2.5 w-2.5" />{performanceStats.streak} Win Streak
              </Badge>
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Joined {formatDate(profile.created_at)}</span>
              </div>
            </div>

            <div className="flex gap-4 mt-2">
              <button className="hover:underline text-sm" onClick={() => openFollowersDialog("following")}>
                <span className="font-bold">{followingCount}</span>
                <span className="text-muted-foreground ml-1">Following</span>
              </button>
              <button className="hover:underline text-sm" onClick={() => openFollowersDialog("followers")}>
                <span className="font-bold">{followersCount}</span>
                <span className="text-muted-foreground ml-1">Followers</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Public Portfolio Section */}
      {profile.portfolio_public && publicPortfolio.length > 0 && (
        <div className="mx-3 sm:mx-4 mt-4">
          <Card className="card-gradient border-primary/10">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <PieChart className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold">Portfolio</span>
                  <Badge variant="secondary" className="text-[10px]">Public</Badge>
                </div>
                {isOwnProfile && (
                  <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => navigate('/track-investments')}>
                    Manage <ChevronRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-1.5">
                {publicPortfolio.slice(0, 5).map((holding) => {
                  const currentPrice = getMockPrice(holding.symbol);
                  const gain = ((currentPrice - holding.avg_cost) / holding.avg_cost) * 100;
                  const isPositive = gain >= 0;
                  return (
                    <div key={holding.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => navigate(`/stock/${holding.symbol}`)}>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-muted/50 flex items-center justify-center text-[10px] font-bold">{holding.symbol.slice(0, 2)}</div>
                        <div>
                          <div className="text-xs font-semibold">{holding.symbol}</div>
                          <div className="text-[10px] text-muted-foreground">{holding.shares} shares</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <SparklineChart isPositive={isPositive} width={35} height={14} />
                        <div className={`text-[10px] font-medium ${isPositive ? 'text-bull' : 'text-bear'}`}>
                          {isPositive ? '+' : ''}{gain.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!profile.portfolio_public && !isOwnProfile && (
        <div className="mx-3 sm:mx-4 mt-4">
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-4 text-center">
              <Lock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Portfolio is private</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="posts" className="mt-4">
        <TabsList className="w-full grid grid-cols-4 bg-transparent border-b border-border rounded-none h-11">
          <Tooltip><TooltipTrigger asChild>
            <TabsTrigger value="posts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full"><FileText className="h-4 w-4 sm:h-5 sm:w-5" /></TabsTrigger>
          </TooltipTrigger><TooltipContent>Posts</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <TabsTrigger value="replies" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full"><MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" /></TabsTrigger>
          </TooltipTrigger><TooltipContent>Replies</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <TabsTrigger value="reposts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full"><Repeat2 className="h-4 w-4 sm:h-5 sm:w-5" /></TabsTrigger>
          </TooltipTrigger><TooltipContent>Reposts</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <TabsTrigger value="likes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full"><Heart className="h-4 w-4 sm:h-5 sm:w-5" /></TabsTrigger>
          </TooltipTrigger><TooltipContent>Likes</TooltipContent></Tooltip>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          {posts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No posts yet</p>
            </div>
          ) : posts.map(post => renderPost(post))}
        </TabsContent>

        <TabsContent value="replies" className="mt-0">
          {userComments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No replies yet</p>
            </div>
          ) : userComments.map(comment => (
            <div key={comment.id} className="p-3 sm:p-4 border-b border-border">
              <p className="text-xs text-muted-foreground mb-2">
                Replying to <span className="text-primary">@{comment.post_author_name?.toLowerCase().replace(/\s+/g, '') || 'user'}</span>
              </p>
              <div className="flex gap-2.5">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">{getInitials(profile?.full_name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm">{profile?.full_name || 'User'}</span>
                    <Verified className="h-3 w-3 text-primary fill-primary" />
                    <span className="text-xs text-muted-foreground">· {formatTimeAgo(comment.created_at)}</span>
                  </div>
                  <p className="text-sm mt-1">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="reposts" className="mt-0">
          {repostedPosts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground"><Repeat2 className="h-10 w-10 mx-auto mb-3 opacity-50" /><p className="text-sm">No reposts yet</p></div>
          ) : repostedPosts.map(post => renderPost(post, true))}
        </TabsContent>

        <TabsContent value="likes" className="mt-0">
          {likedPosts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground"><Heart className="h-10 w-10 mx-auto mb-3 opacity-50" /><p className="text-sm">No likes yet</p></div>
          ) : likedPosts.map(post => renderPost(post, true))}
        </TabsContent>
      </Tabs>

      {userId && <FollowersDialog open={followersDialogOpen} onOpenChange={setFollowersDialogOpen} userId={userId} initialTab={dialogTab} />}
      <EditProfileDialog open={editProfileOpen} onOpenChange={(open) => { setEditProfileOpen(open); if (!open) fetchProfile(); }} />
    </div>
  );
}