import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Settings, UserPlus, UserMinus, MessageCircle, MoreHorizontal, Lock, Verified, Heart, Repeat2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFollows } from "@/hooks/useFollows";
import { useToast } from "@/hooks/use-toast";
import { FollowersDialog } from "@/components/social/FollowersDialog";

interface UserProfileData {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
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
  likes_count: number;
  comments_count: number;
  reposts_count: number;
}

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isFollowing, toggleFollow, fetchFollowers, fetchFollowing } = useFollows();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  
  // Followers dialog state
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<"followers" | "following">("followers");

  const isOwnProfile = user?.id === userId;
  const userIsFollowing = userId ? isFollowing(userId) : false;

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchUserPosts();
      loadFollowCounts();
    }
  }, [userId, user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setProfile(data as UserProfileData);
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

  const openFollowersDialog = (tab: "followers" | "following") => {
    setDialogTab(tab);
    setFollowersDialogOpen(true);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
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

      {/* Profile Header */}
      <div className="relative">
        <div className="h-32 bg-gradient-primary" />
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
                <Button variant="outline" onClick={() => navigate('/account')}>
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
                      <>
                        <UserMinus className="h-4 w-4 mr-1" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="mt-4">
            <h2 className="text-xl font-bold flex items-center gap-1">
              {profile.full_name || 'User'}
            </h2>
            <p className="text-sm text-muted-foreground">@{profile.email?.split('@')[0] || 'user'}</p>
            
            {profile.bio && (
              <p className="mt-3 text-sm">{profile.bio}</p>
            )}

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(profile.created_at)}</span>
              </div>
            </div>

            <div className="flex gap-4 mt-3">
              <button 
                className="hover:underline"
                onClick={() => openFollowersDialog("following")}
              >
                <span className="font-bold">{followingCount}</span>
                <span className="text-muted-foreground ml-1">Following</span>
              </button>
              <button 
                className="hover:underline"
                onClick={() => openFollowersDialog("followers")}
              >
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
        <TabsList className="w-full grid grid-cols-3 bg-transparent border-b border-border rounded-none h-12">
          <TabsTrigger value="posts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Posts
          </TabsTrigger>
          <TabsTrigger value="replies" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Replies
          </TabsTrigger>
          <TabsTrigger value="likes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Likes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          {posts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {posts.map((post) => (
                <div key={post.id} className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.avatar_url || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(profile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm">{profile.full_name || 'User'}</span>
                        <Verified className="h-3 w-3 text-primary fill-primary" />
                        <span className="text-sm text-muted-foreground">
                          @{profile.email?.split('@')[0]} · {formatTimeAgo(post.created_at)}
                        </span>
                      </div>
                      <p className="text-sm mt-1 whitespace-pre-wrap">
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
                        <img 
                          src={post.image_url} 
                          alt="Post" 
                          className="mt-3 rounded-xl max-h-60 object-cover w-full" 
                        />
                      )}
                      <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likes_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {post.comments_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Repeat2 className="h-4 w-4" />
                          {post.reposts_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="replies" className="p-8 text-center">
          <p className="text-muted-foreground">No replies yet</p>
        </TabsContent>

        <TabsContent value="likes" className="p-8 text-center">
          <p className="text-muted-foreground">No liked posts</p>
        </TabsContent>
      </Tabs>

      {/* Followers/Following Dialog */}
      <FollowersDialog
        open={followersDialogOpen}
        onOpenChange={setFollowersDialogOpen}
        userId={userId || ""}
        initialTab={dialogTab}
        userName={profile.full_name || "User"}
      />
    </div>
  );
}
