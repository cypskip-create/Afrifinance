import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Heart, Repeat2, Share, ImagePlus, Send,
  Verified, ChartLine, Bookmark, BookmarkCheck, MessageCircle, X, 
  Trash2, ShieldCheck, Lightbulb, Trophy, BarChart2, Users, Flame, 
  Search, Image, Hash, BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/shared/TopBar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePosts, Post, Comment } from "@/hooks/usePosts";
import { useFollows } from "@/hooks/useFollows";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const { posts, loading, createPost, likePost, repostPost, bookmarkPost, fetchComments, addComment, deletePost, fetchPosts } = usePosts();
  const { following, isFollowing } = useFollows();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [activeTab, setActiveTab] = useState("for-you");
  const [activeSection, setActiveSection] = useState("feed");
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  
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
    return true; // for-you shows all
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchParams(query ? { search: query } : {});
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() && !selectedImage) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setIsPosting(true);
    
    const { error } = await createPost(newPost, selectedImage || undefined);
    
    if (error) {
      toast({ title: "Error", description: "Failed to post", variant: "destructive" });
    } else {
      setNewPost("");
      setSelectedImage(null);
      toast({ title: "Posted successfully!" });
    }
    
    setIsPosting(false);
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    await likePost(postId);
  };

  const handleRepost = async (postId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const { error } = await repostPost(postId);
    if (!error) {
      toast({ title: "Reposted!" });
    }
  };

  const handleBookmark = async (postId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const post = posts.find(p => p.id === postId);
    const { error } = await bookmarkPost(postId);
    if (!error) {
      toast({ title: post?.is_bookmarked ? "Removed from bookmarks" : "Added to bookmarks" });
    }
  };

  const handleShare = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.author?.full_name || 'User'}`,
          text: post.content.slice(0, 100) + "...",
          url: window.location.href
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard" });
    }
  };

  const handleDelete = async (postId: string) => {
    const { error } = await deletePost(postId);
    if (!error) {
      toast({ title: "Post deleted" });
    }
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
    if (!user) {
      navigate('/auth');
      return;
    }

    const { error } = await addComment(selectedPostForComments.id, newComment);
    if (!error) {
      const updatedComments = await fetchComments(selectedPostForComments.id);
      setComments(updatedComments);
      setNewComment("");
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const renderPostContent = (content: string) => {
    return content.split(/(\$[A-Z]+|#\w+)/g).map((part, i) => {
      if (part.startsWith('$')) {
        return (
          <span 
            key={i} 
            className="text-primary font-medium cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/stock/${part.slice(1)}`);
            }}
          >
            {part}
          </span>
        );
      } else if (part.startsWith('#')) {
        return (
          <span key={i} className="text-primary cursor-pointer hover:underline">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const renderCommentContent = (content: string) => {
    return content.split(/(\$[A-Z]+)/g).map((part, i) => {
      if (part.startsWith('$')) {
        return (
          <span 
            key={i} 
            className="text-primary font-medium cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
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

  const renderPost = (post: Post) => (
    <Card key={post.id} className="card-gradient">
      <CardContent className="p-4">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-3">
          <div 
            className="flex gap-3 cursor-pointer"
            onClick={() => navigate(`/profile/${post.user_id}`)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author?.avatar_url || ""} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials(post.author?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm">{post.author?.full_name || 'User'}</span>
                <Verified className="h-4 w-4 text-primary fill-primary" />
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTimeAgo(post.created_at)}
              </div>
            </div>
          </div>
          {user?.id === post.user_id && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-destructive"
              onClick={() => handleDelete(post.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Post Content */}
        <div className="mb-3">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {renderPostContent(post.content)}
          </p>
        </div>

        {/* Stock Mentions */}
        {post.stock_mentions && post.stock_mentions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.stock_mentions.map(stock => (
              <Badge 
                key={stock} 
                variant="secondary" 
                className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => navigate(`/stock/${stock}`)}
              >
                <ChartLine className="h-3 w-3 mr-1" />
                {stock}
              </Badge>
            ))}
          </div>
        )}

        {/* Post Image */}
        {post.image_url && (
          <div className="mb-3 rounded-xl overflow-hidden">
            <img src={post.image_url} alt="Post" className="w-full h-48 object-cover" />
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-3 gap-1.5 ${post.is_liked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500 hover:bg-red-500/10`}
            onClick={() => handleLike(post.id)}
          >
            <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
            <span className="text-xs">{formatNumber(post.likes_count)}</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 px-3 gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => openCommentsDialog(post)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{formatNumber(post.comments_count)}</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-3 gap-1.5 ${post.is_reposted ? 'text-green-500' : 'text-muted-foreground'} hover:text-green-500 hover:bg-green-500/10`}
            onClick={() => handleRepost(post.id)}
          >
            <Repeat2 className={`h-4 w-4 ${post.is_reposted ? 'text-green-500' : ''}`} />
            <span className="text-xs">{formatNumber(post.reposts_count)}</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-3 ${post.is_bookmarked ? 'text-primary' : 'text-muted-foreground'} hover:text-primary hover:bg-primary/10`}
            onClick={() => handleBookmark(post.id)}
          >
            {post.is_bookmarked ? (
              <BookmarkCheck className="h-4 w-4 fill-current" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 px-3 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => handleShare(post)}
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title="TradersHub" 
        subtitle="Professional trading community"
        showSearch={true}
        showNotifications={true}
        onSearch={handleSearch}
        initialSearchQuery={searchQuery}
      />

      {/* Search Active Indicator */}
      {searchQuery && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <Search className="h-4 w-4 text-primary" />
            <span className="text-sm flex-1">
              Showing results for: <span className="font-medium text-primary">{searchQuery}</span>
            </span>
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={clearSearch}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Community Guidelines Banner */}
      <div className="px-4 pt-4">
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-3 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Community Guidelines:</span> Share insights responsibly. No financial advice. All trading carries risk.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Tabs - Icon only for mobile */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "feed", label: "Feed", icon: MessageCircle },
            { id: "ideas", label: "Ideas", icon: Lightbulb },
            { id: "leaderboard", label: "Top", icon: Trophy },
            { id: "polls", label: "Polls", icon: BarChart2 },
          ].map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={() => setActiveSection(section.id)}
            >
              <section.icon className="h-5 w-5" />
              <span className="text-[10px]">{section.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex gap-4">
        {/* Main Content */}
        <div className="flex-1 max-w-2xl">
          {/* Trade Ideas Section */}
          {activeSection === "ideas" && (
            <div className="px-4 mt-4">
              <TradingIdeas />
            </div>
          )}

          {/* Leaderboard Section */}
          {activeSection === "leaderboard" && (
            <div className="px-4 mt-4">
              <TraderLeaderboard />
            </div>
          )}

          {/* Polls Section */}
          {activeSection === "polls" && (
            <div className="px-4 mt-4">
              <CommunityPolls />
            </div>
          )}

          {/* Feed Section */}
          {activeSection === "feed" && (
            <>
              {/* Compose Post */}
              {user ? (
                <Card className="mx-4 mt-4 card-gradient">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0 cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(profile?.full_name || user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea 
                          placeholder="Share your market insights... Use $SYMBOL for stocks, #hashtag for topics"
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          className="min-h-[80px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 text-sm"
                        />
                        
                        {selectedImage && (
                          <div className="relative mt-3 rounded-xl overflow-hidden">
                            <img src={selectedImage} alt="Selected" className="w-full max-h-60 object-cover rounded-xl" />
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className="absolute top-2 right-2 h-8 w-8 rounded-full"
                              onClick={() => setSelectedImage(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                          <div className="flex gap-1">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleImageSelect}
                              accept="image/*"
                              className="hidden"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Image className="h-5 w-5 text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                              <BarChart3 className="h-5 w-5 text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                              <Hash className="h-5 w-5 text-primary" />
                            </Button>
                          </div>
                          <Button 
                            size="sm" 
                            className="btn-primary h-9 px-4" 
                            disabled={(!newPost.trim() && !selectedImage) || isPosting}
                            onClick={handlePost}
                          >
                            {isPosting ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-1" />
                                Post
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mx-4 mt-4 card-gradient">
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">Join the Community</h3>
                    <p className="text-sm text-muted-foreground mb-4">Sign in to share your insights and connect with traders</p>
                    <Button className="btn-primary" onClick={() => navigate('/auth')}>
                      Sign In
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Feed Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 mt-4">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="for-you" className="text-xs">For You</TabsTrigger>
                  <TabsTrigger value="following" className="text-xs">Following</TabsTrigger>
                  <TabsTrigger value="trending" className="text-xs">
                    <Flame className="h-3 w-3 mr-1" />
                    Trending
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="for-you" className="mt-4 space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" />
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <Card className="card-gradient">
                      <CardContent className="p-8 text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="font-medium mb-1">No posts yet</p>
                        <p className="text-sm text-muted-foreground">Be the first to share your market insights!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredPosts.map((post) => renderPost(post))
                  )}
                </TabsContent>

                <TabsContent value="following" className="mt-4 space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" />
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <Card className="card-gradient">
                      <CardContent className="p-8 text-center">
                        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="font-medium mb-1">No posts from people you follow</p>
                        <p className="text-sm text-muted-foreground mb-4">Follow traders to see their posts here</p>
                        <Button onClick={() => setActiveTab("for-you")}>
                          Discover Traders
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredPosts.map((post) => renderPost(post))
                  )}
                </TabsContent>

                <TabsContent value="trending" className="mt-4 space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" />
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <Card className="card-gradient">
                      <CardContent className="p-8 text-center">
                        <Flame className="h-12 w-12 mx-auto mb-4 text-orange-500" />
                        <p className="font-medium mb-1">No trending posts yet</p>
                        <p className="text-sm text-muted-foreground">Posts with high engagement appear here</p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredPosts.map((post) => renderPost(post))
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-80 p-4 space-y-4">
          <SuggestedUsers />
          <TrendingTopics />
        </div>
      </div>

      {/* Comments Dialog */}
      <Dialog open={commentsDialogOpen} onOpenChange={setCommentsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh]">
            {loadingComments ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/30 border-t-primary" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{comment.author?.full_name || 'User'}</span>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-sm mt-1">{renderCommentContent(comment.content)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          {user && (
            <div className="flex gap-2 pt-4 border-t">
              <Input 
                placeholder="Add a comment... (use $SYMBOL to mention stocks)"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
