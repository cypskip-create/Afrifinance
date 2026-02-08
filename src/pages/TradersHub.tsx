import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, X, MessageCircle, Lightbulb, Trophy, BarChart2, 
  Users, Flame, Send, ShieldCheck
} from "lucide-react";
import { TopBar } from "@/components/shared/TopBar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePosts, Post, Comment } from "@/hooks/usePosts";
import { useFollows } from "@/hooks/useFollows";
import { useToast } from "@/hooks/use-toast";

// Components
import { HotTopicsBanner } from "@/components/social/HotTopicsBanner";
import { MoomooPostCard } from "@/components/social/MoomooPostCard";
import { ComposePostWidget } from "@/components/social/ComposePostWidget";
import { SuggestedUsers } from "@/components/social/SuggestedUsers";
import { TrendingTopics } from "@/components/social/TrendingTopics";
import { TraderLeaderboard } from "@/components/social/TraderLeaderboard";
import { TradingIdeas } from "@/components/social/TradingIdeas";
import { CommunityPolls } from "@/components/social/CommunityPolls";

export default function TradersHub() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { posts, loading, createPost, likePost, repostPost, bookmarkPost, fetchComments, addComment, deletePost } = usePosts();
  const { isFollowing } = useFollows();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("for-you");
  const [activeSection, setActiveSection] = useState("feed");
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Comments dialog
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  // Update search query from URL params
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  // Filter posts based on active tab and search query
  const filteredPosts = posts.filter(post => {
    // First apply search filter if there's a query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase().replace(/^#/, '');
      const contentMatches = post.content.toLowerCase().includes(searchLower);
      const stockMatches = post.stock_mentions?.some(s => s.toLowerCase().includes(searchLower));
      if (!contentMatches && !stockMatches) return false;
    }
    
    // Then apply tab filter
    if (activeTab === "following") {
      return isFollowing(post.user_id);
    }
    if (activeTab === "trending") {
      return post.likes_count >= 5 || post.reposts_count >= 2;
    }
    return true;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchParams(query ? { search: query } : {});
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
    setIsSearchFocused(false);
  };

  const handlePost = async (content: string, imageUrl?: string) => {
    const { error } = await createPost(content, imageUrl);
    if (error) {
      toast({ title: "Error", description: "Failed to post", variant: "destructive" });
      return { error };
    }
    toast({ title: "Posted successfully!" });
    return { error: null };
  };

  const handleLike = async (postId: string) => {
    if (!user) { navigate('/auth'); return; }
    await likePost(postId);
  };

  const handleRepost = async (postId: string) => {
    if (!user) { navigate('/auth'); return; }
    const { error } = await repostPost(postId);
    if (!error) toast({ title: "Reposted!" });
  };

  const handleBookmark = async (postId: string) => {
    if (!user) { navigate('/auth'); return; }
    const post = posts.find(p => p.id === postId);
    const { error } = await bookmarkPost(postId);
    if (!error) toast({ title: post?.is_bookmarked ? "Removed from bookmarks" : "Added to bookmarks" });
  };

  const handleShare = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.author?.full_name || 'User'}`,
          text: post.content.slice(0, 100) + "...",
          url: window.location.href
        });
      } catch (err) { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard" });
    }
  };

  const handleDelete = async (postId: string) => {
    const { error } = await deletePost(postId);
    if (!error) toast({ title: "Post deleted" });
  };

  const openCommentsDialog = async (post: Post) => {
    setSelectedPostForComments(post);
    setCommentsDialogOpen(true);
    setLoadingComments(true);
    const fetchedComments = await fetchComments(post.id);
    setComments(fetchedComments);
    setLoadingComments(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPostForComments) return;
    if (!user) { navigate('/auth'); return; }
    const { error } = await addComment(selectedPostForComments.id, newComment);
    if (!error) {
      const updatedComments = await fetchComments(selectedPostForComments.id);
      setComments(updatedComments);
      setNewComment("");
    }
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

  const renderCommentContent = (content: string) => {
    return content.split(/(\$[A-Z]+)/g).map((part, i) => {
      if (part.startsWith('$')) {
        return (
          <span 
            key={i} 
            className="text-primary font-medium cursor-pointer hover:underline"
            onClick={() => {
              setCommentsDialogOpen(false);
              navigate(`/stock/${part.slice(1)}`);
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const sectionButtons = [
    { id: "feed", label: "Feed", icon: MessageCircle },
    { id: "ideas", label: "Ideas", icon: Lightbulb },
    { id: "leaderboard", label: "Top", icon: Trophy },
    { id: "polls", label: "Polls", icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title="TradersHub" 
        subtitle="Trading community"
        showSearch={false}
        showNotifications={true}
      />

      {/* Hot Topics Banner */}
      <HotTopicsBanner />

      {/* Search + Section Nav */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border">
        {/* Search Bar */}
        <div className="px-3 sm:px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts, stocks, hashtags..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="pl-9 pr-9 h-9 sm:h-10 bg-muted/50 border-0 text-sm"
            />
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="px-3 sm:px-4 pb-2">
          <div className="flex gap-1.5 sm:gap-2">
            {sectionButtons.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "ghost"}
                size="sm"
                className={`flex-1 h-9 sm:h-10 gap-1.5 text-xs sm:text-sm ${
                  activeSection === section.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <section.icon className="h-4 w-4" />
                <span className="hidden xs:inline">{section.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Active State - Quick Results */}
      {searchQuery && (
        <div className="px-3 sm:px-4 py-2 bg-muted/30 border-b border-border">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing results for <span className="font-medium text-foreground">"{searchQuery}"</span>
            </p>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearSearch}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto flex gap-4">
        <div className="flex-1 max-w-2xl">
          
          {/* Trade Ideas Section */}
          {activeSection === "ideas" && (
            <div className="px-3 sm:px-4 mt-4">
              <TradingIdeas />
            </div>
          )}

          {/* Leaderboard Section */}
          {activeSection === "leaderboard" && (
            <div className="px-3 sm:px-4 mt-4">
              <TraderLeaderboard />
            </div>
          )}

          {/* Polls Section */}
          {activeSection === "polls" && (
            <div className="px-3 sm:px-4 mt-4">
              <CommunityPolls />
            </div>
          )}

          {/* Feed Section */}
          {activeSection === "feed" && (
            <>
              {/* Community Guidelines */}
              <div className="px-3 sm:px-4 pt-3">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Guidelines:</span> Share insights responsibly. No financial advice.
                  </p>
                </div>
              </div>

              {/* Compose Post */}
              <div className="mt-3">
                <ComposePostWidget user={user} profile={profile} onPost={handlePost} />
              </div>

              {/* Feed Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="w-full grid grid-cols-3 mx-3 sm:mx-4 h-9 bg-muted/50 p-0.5">
                  <TabsTrigger value="for-you" className="text-xs data-[state=active]:bg-background">For You</TabsTrigger>
                  <TabsTrigger value="following" className="text-xs data-[state=active]:bg-background">Following</TabsTrigger>
                  <TabsTrigger value="trending" className="text-xs gap-1 data-[state=active]:bg-background">
                    <Flame className="h-3 w-3" />
                    Hot
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="for-you" className="mt-0">
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" />
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="font-medium mb-1">No posts yet</p>
                      <p className="text-sm text-muted-foreground">Be the first to share your insights!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredPosts.map((post) => (
                        <MoomooPostCard
                          key={post.id}
                          post={post}
                          currentUserId={user?.id}
                          onLike={handleLike}
                          onComment={openCommentsDialog}
                          onRepost={handleRepost}
                          onBookmark={handleBookmark}
                          onShare={handleShare}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="following" className="mt-0">
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" />
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="p-8 text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="font-medium mb-1">No posts from people you follow</p>
                      <p className="text-sm text-muted-foreground mb-4">Follow traders to see their posts here</p>
                      <Button size="sm" onClick={() => setActiveTab("for-you")}>
                        Discover Traders
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredPosts.map((post) => (
                        <MoomooPostCard
                          key={post.id}
                          post={post}
                          currentUserId={user?.id}
                          onLike={handleLike}
                          onComment={openCommentsDialog}
                          onRepost={handleRepost}
                          onBookmark={handleBookmark}
                          onShare={handleShare}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="trending" className="mt-0">
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" />
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="p-8 text-center">
                      <Flame className="h-12 w-12 mx-auto mb-4 text-accent opacity-50" />
                      <p className="font-medium mb-1">No trending posts yet</p>
                      <p className="text-sm text-muted-foreground">Posts with high engagement appear here</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredPosts.map((post) => (
                        <MoomooPostCard
                          key={post.id}
                          post={post}
                          currentUserId={user?.id}
                          onLike={handleLike}
                          onComment={openCommentsDialog}
                          onRepost={handleRepost}
                          onBookmark={handleBookmark}
                          onShare={handleShare}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        {/* Sidebar - Desktop only */}
        <div className="hidden lg:block w-80 p-4 space-y-4">
          <SuggestedUsers />
          <TrendingTopics />
        </div>
      </div>

      {/* Comments Dialog */}
      <Dialog open={commentsDialogOpen} onOpenChange={setCommentsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] p-0 gap-0">
          <DialogHeader className="p-4 pb-3 border-b border-border">
            <DialogTitle className="text-base">Comments</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh] p-4">
            {loadingComments ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/30 border-t-primary" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">No comments yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar 
                      className="h-8 w-8 cursor-pointer"
                      onClick={() => {
                        setCommentsDialogOpen(false);
                        navigate(`/profile/${comment.user_id}`);
                      }}
                    >
                      <AvatarImage src={comment.author?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(comment.author?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{comment.author?.full_name || 'User'}</span>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-sm mt-0.5">{renderCommentContent(comment.content)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          {user && (
            <div className="flex gap-2 p-4 border-t border-border bg-muted/30">
              <Input 
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="h-9 text-sm"
              />
              <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()} className="h-9 px-3">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
