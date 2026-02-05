import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Settings, UserPlus, UserMinus, MessageCircle, MoreHorizontal, Lock, Verified, Heart, Repeat2, FileText, Bookmark, Camera, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFollows } from "@/hooks/useFollows";
import { useToast } from "@/hooks/use-toast";
import { FollowersDialog } from "@/components/social/FollowersDialog";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";

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
  const [loading, setLoading] = useState(true);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  
  // Dialog states
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<"followers" | "following">("followers");
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const isOwnProfile = user?.id === userId;
  const userIsFollowing = userId ? isFollowing(userId) : false;

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchUserPosts();
      fetchUserLikes();
      fetchUserComments();
      fetchUserReposts();
      loadFollowCounts();
    }
  }, [userId, user]);

  const fetchProfile = async () => {
    if (!userId) return;
    
    try {
      if (isOwnProfile && user) {
        // Own profile - can access the full profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_id, full_name, avatar_url, banner_url, bio, portfolio_public, followers_count, following_count, created_at')
          .eq('user_id', userId)
          .maybeSingle();

        if (data) {
          setProfile(data as UserProfileData);
        }
      } else {
        // Other user's profile - use the public view
        const { data, error } = await supabase
          .from('profiles_public')
          .select('id, user_id, full_name, avatar_url, banner_url, bio, portfolio_public, followers_count, following_count, created_at')
          .eq('user_id', userId)
          .maybeSingle();

        if (data) {
          setProfile(data as UserProfileData);
        }
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
          return {
            ...post,
            likes_count: likesRes.count || 0,
            comments_count: commentsRes.count || 0,
            reposts_count: repostsRes.count || 0,
          };
        })
      );
      setPosts(postsWithCounts);
    }
  };

  const fetchUserLikes = async () => {
    if (!userId) return;
    
    const { data: likesData } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (likesData && likesData.length > 0) {
      const postIds = likesData.map(l => l.post_id);
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .in('id', postIds);

      if (postsData) {
        const userIds = [...new Set(postsData.map(p => p.user_id))];
        const { data: profiles } = await supabase
          .from('profiles_public')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

        const postsWithDetails = await Promise.all(
          postsData.map(async (post) => {
            const [likesRes, commentsRes, repostsRes] = await Promise.all([
              supabase.from('post_likes').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
              supabase.from('post_comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
              supabase.from('post_reposts').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            ]);
            const author = profileMap.get(post.user_id);
            return {
              ...post,
              likes_count: likesRes.count || 0,
              comments_count: commentsRes.count || 0,
              reposts_count: repostsRes.count || 0,
              author: author ? { full_name: author.full_name, avatar_url: author.avatar_url } : undefined,
            };
          })
        );
        setLikedPosts(postsWithDetails);
      }
    }
  };

  const fetchUserComments = async () => {
    if (!userId) return;
    
    const { data: commentsData } = await supabase
      .from('post_comments')
      .select('id, content, created_at, post_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (commentsData && commentsData.length > 0) {
      const postIds = [...new Set(commentsData.map(c => c.post_id))];
      const { data: postsData } = await supabase
        .from('posts')
        .select('id, content, user_id')
        .in('id', postIds);

      if (postsData) {
        const userIds = [...new Set(postsData.map(p => p.user_id))];
        const { data: profiles } = await supabase
          .from('profiles_public')
          .select('user_id, full_name')
          .in('user_id', userIds);

        const postMap = new Map(postsData.map(p => [p.id, p]));
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

        const commentsWithDetails = commentsData.map(comment => {
          const post = postMap.get(comment.post_id);
          const author = post ? profileMap.get(post.user_id) : null;
          return {
            ...comment,
            post_content: post?.content?.slice(0, 100) || '',
            post_author_name: author?.full_name || 'User',
          };
        });
        setUserComments(commentsWithDetails);
      }
    }
  };

  const fetchUserReposts = async () => {
    if (!userId) return;
    
    const { data: repostsData } = await supabase
      .from('post_reposts')
      .select('post_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (repostsData && repostsData.length > 0) {
      const postIds = repostsData.map(r => r.post_id);
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .in('id', postIds);

      if (postsData) {
        const userIds = [...new Set(postsData.map(p => p.user_id))];
        const { data: profiles } = await supabase
          .from('profiles_public')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

        const postsWithDetails = await Promise.all(
          postsData.map(async (post) => {
            const [likesRes, commentsRes, repostsRes] = await Promise.all([
              supabase.from('post_likes').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
              supabase.from('post_comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
              supabase.from('post_reposts').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            ]);
            const author = profileMap.get(post.user_id);
            return {
              ...post,
              likes_count: likesRes.count || 0,
              comments_count: commentsRes.count || 0,
              reposts_count: repostsRes.count || 0,
              author: author ? { full_name: author.full_name, avatar_url: author.avatar_url } : undefined,
            };
          })
        );
        setRepostedPosts(postsWithDetails);
      }
    }
  };

  const handleFollow = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

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

    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file type", description: "Please upload an image", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB allowed", variant: "destructive" });
      return;
    }

    setUploadingBanner(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/banner-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ banner_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, banner_url: publicUrl } : null);
      toast({ title: "Banner updated!" });
    } catch (error) {
      console.error('Banner upload error:', error);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingBanner(false);
    }
  };

  const openFollowersDialog = (tab: "followers" | "following") => {
    setDialogTab(tab);
    setFollowersDialogOpen(true);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

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

  const renderPost = (post: UserPost, showAuthor: boolean = false) => (
    <div key={post.id} className="p-4 border-b border-border">
      <div className="flex gap-3">
        <Avatar 
          className="h-10 w-10 cursor-pointer" 
          onClick={() => navigate(`/profile/${showAuthor ? post.user_id : profile?.user_id}`)}
        >
          <AvatarImage src={(showAuthor ? post.author?.avatar_url : profile?.avatar_url) || ""} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(showAuthor ? post.author?.full_name || null : profile?.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span 
              className="font-semibold text-sm cursor-pointer hover:underline"
              onClick={() => navigate(`/profile/${showAuthor ? post.user_id : profile?.user_id}`)}
            >
              {showAuthor ? (post.author?.full_name || 'User') : (profile?.full_name || 'User')}
            </span>
            <Verified className="h-3 w-3 text-primary fill-primary" />
            <span className="text-sm text-muted-foreground">· {formatTimeAgo(post.created_at)}</span>
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap break-words">
            {post.content.split(/(\$[A-Z]+)/g).map((part, i) => 
              part.startsWith('$') ? (
                <span 
                  key={i} 
                  className="text-primary font-medium cursor-pointer hover:underline"
                  onClick={() => navigate(`/stock/${part.slice(1)}`)}
                >
                  {part}
                </span>
              ) : part
            )}
          </p>
          {post.image_url && (
            <img src={post.image_url} alt="Post" className="mt-3 rounded-xl max-h-60 object-cover w-full" />
          )}
          <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Heart className="h-4 w-4" />{post.likes_count}</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" />{post.comments_count}</span>
            <span className="flex items-center gap-1"><Repeat2 className="h-4 w-4" />{post.reposts_count}</span>
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
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-bold">User Not Found</h1>
          </div>
        </header>
        <div className="p-4 text-center text-muted-foreground">
          This user profile does not exist.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-bold flex items-center gap-1">
                {profile.full_name || 'User'}
                <Verified className="h-4 w-4 text-primary fill-primary" />
              </h1>
              <p className="text-xs text-muted-foreground">{posts.length} posts</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Banner + Profile */}
      <div className="relative">
        {/* Banner */}
        <div className="relative h-32 bg-gradient-primary overflow-hidden">
          {profile.banner_url && (
            <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
          )}
          {isOwnProfile && (
            <>
              <input
                type="file"
                ref={bannerInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleBannerUpload}
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 border-0"
                onClick={() => bannerInputRef.current?.click()}
                disabled={uploadingBanner}
              >
                {uploadingBanner ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 text-white" />
                )}
              </Button>
            </>
          )}
        </div>

        {/* Profile Section */}
        <div className="px-4 -mt-16">
          <div className="flex justify-between items-end">
            <Avatar className="h-28 w-28 ring-4 ring-background">
              <AvatarImage src={profile.avatar_url || ""} className="object-cover" />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl font-bold">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-2 mb-2">
              {isOwnProfile ? (
                <Button variant="outline" onClick={() => setEditProfileOpen(true)}>
                  <Settings className="h-4 w-4 mr-1" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="icon">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={userIsFollowing ? "outline" : "default"}
                    onClick={handleFollow}
                  >
                    {userIsFollowing ? (
                      <><UserMinus className="h-4 w-4 mr-1" />Following</>
                    ) : (
                      <><UserPlus className="h-4 w-4 mr-1" />Follow</>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="mt-4">
            <h2 className="text-xl font-bold">{profile.full_name || 'User'}</h2>
            <p className="text-sm text-muted-foreground">@{profile.full_name?.toLowerCase().replace(/\s+/g, '') || 'user'}</p>
            
            {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(profile.created_at)}</span>
              </div>
            </div>

            <div className="flex gap-4 mt-3">
              <button className="hover:underline" onClick={() => openFollowersDialog("following")}>
                <span className="font-bold">{followingCount}</span>
                <span className="text-muted-foreground ml-1">Following</span>
              </button>
              <button className="hover:underline" onClick={() => openFollowersDialog("followers")}>
                <span className="font-bold">{followersCount}</span>
                <span className="text-muted-foreground ml-1">Followers</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Visibility */}
      {!profile.portfolio_public && !isOwnProfile && (
        <div className="mx-4 mt-4">
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-4 text-center">
              <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">This user's portfolio is private</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="posts" className="mt-4">
        <TabsList className="w-full grid grid-cols-4 bg-transparent border-b border-border rounded-none h-12">
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="posts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                <FileText className="h-5 w-5" />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>Posts</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="replies" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                <MessageCircle className="h-5 w-5" />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>Replies</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="reposts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                <Repeat2 className="h-5 w-5" />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>Reposts</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="likes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                <Heart className="h-5 w-5" />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>Likes</TooltipContent>
          </Tooltip>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          {posts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No posts yet</p>
            </div>
          ) : (
            posts.map(post => renderPost(post))
          )}
        </TabsContent>

        <TabsContent value="replies" className="mt-0">
          {userComments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No replies yet</p>
            </div>
          ) : (
            userComments.map(comment => (
              <div key={comment.id} className="p-4 border-b border-border">
                <p className="text-xs text-muted-foreground mb-2">
                  Replying to <span className="text-primary">@{comment.post_author_name?.toLowerCase().replace(/\s+/g, '') || 'user'}</span>
                </p>
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm">{profile?.full_name || 'User'}</span>
                      <Verified className="h-3 w-3 text-primary fill-primary" />
                      <span className="text-sm text-muted-foreground">· {formatTimeAgo(comment.created_at)}</span>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="reposts" className="mt-0">
          {repostedPosts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Repeat2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No reposts yet</p>
            </div>
          ) : (
            repostedPosts.map(post => renderPost(post, true))
          )}
        </TabsContent>

        <TabsContent value="likes" className="mt-0">
          {likedPosts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No likes yet</p>
            </div>
          ) : (
            likedPosts.map(post => renderPost(post, true))
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {userId && (
        <FollowersDialog 
          open={followersDialogOpen} 
          onOpenChange={setFollowersDialogOpen}
          userId={userId}
          initialTab={dialogTab}
        />
      )}
      
      <EditProfileDialog 
        open={editProfileOpen} 
        onOpenChange={(open) => {
          setEditProfileOpen(open);
          if (!open) fetchProfile();
        }} 
      />
    </div>
  );
}
