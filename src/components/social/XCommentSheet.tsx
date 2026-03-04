import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Verified, Send, ArrowLeft, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Post, Comment } from "@/hooks/usePosts";
import { XPostCard } from "./XPostCard";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface XCommentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
  currentUserId?: string;
  comments: Comment[];
  loadingComments: boolean;
  onAddComment: (content: string) => Promise<void>;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onShare: (post: Post) => void;
  onDelete?: (postId: string) => void;
}

export function XCommentSheet({
  open, onOpenChange, post, currentUserId, comments, loadingComments,
  onAddComment, onLike, onRepost, onBookmark, onShare, onDelete
}: XCommentSheetProps) {
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sortBy, setSortBy] = useState<"latest" | "relevant" | "liked">("relevant");

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    await onAddComment(newComment);
    setNewComment("");
    setSending(false);
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === "latest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === "liked") return 0; // placeholder
    return 0; // relevant = default order
  });

  const renderCommentContent = (content: string) => {
    return content.split(/(\$[A-Z]+)/g).map((part, i) => {
      if (part.startsWith("$")) {
        return (
          <span key={i} className="text-primary font-semibold cursor-pointer hover:underline" onClick={() => { onOpenChange(false); navigate(`/stock/${part.slice(1)}`); }}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 gap-0 rounded-3xl overflow-hidden border-border/60 [&>button]:hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-card">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => onOpenChange(false)} data-small-target>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-bold text-base">Post</h2>
        </div>

        <ScrollArea className="max-h-[60vh]">
          {/* Original post */}
          <XPostCard
            post={post}
            currentUserId={currentUserId}
            onLike={onLike}
            onComment={() => {}}
            onRepost={onRepost}
            onBookmark={onBookmark}
            onShare={onShare}
            onDelete={onDelete}
          />

          {/* Replies header with sort */}
          <div className="px-4 py-2.5 border-b border-border/60 flex items-center justify-between">
            <span className="text-sm font-bold text-muted-foreground">
              {comments.length > 0 ? `${comments.length} Replies` : "Replies"}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs rounded-full gap-1 px-2" data-small-target>
                  <SlidersHorizontal className="h-3 w-3" />
                  {sortBy === "latest" ? "Latest" : sortBy === "liked" ? "Most Liked" : "Relevant"}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={() => setSortBy("relevant")}>Relevant</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("latest")}>Latest</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("liked")}>Most Liked</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Comments */}
          {loadingComments ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/30 border-t-primary" />
            </div>
          ) : sortedComments.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-muted-foreground">No replies yet. Start the conversation!</p>
            </div>
          ) : (
            <div>
              {sortedComments.map((comment) => (
                <div key={comment.id} className="flex gap-3 px-4 py-3 border-b border-border/40 hover:bg-muted/20 transition-colors">
                  <Avatar className="h-8 w-8 shrink-0 cursor-pointer" onClick={() => { onOpenChange(false); navigate(`/profile/${comment.user_id}`); }}>
                    <AvatarImage src={comment.author?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {getInitials(comment.author?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-bold text-sm">{comment.author?.full_name || "User"}</span>
                      <Verified className="h-3 w-3 text-primary fill-primary" />
                      <span className="text-xs text-muted-foreground">· {formatTimeAgo(comment.created_at)}</span>
                    </div>
                    <p className="text-sm mt-0.5 leading-relaxed">{renderCommentContent(comment.content)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Reply input */}
        {currentUserId && (
          <div className="flex items-center gap-2 p-3 border-t border-border/60 bg-card">
            <Input
              placeholder="Post your reply"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="h-10 text-sm rounded-full bg-muted/40 border-0"
            />
            <Button
              size="icon"
              className="h-10 w-10 rounded-full shrink-0 bg-primary hover:bg-primary/90"
              onClick={handleSubmit}
              disabled={!newComment.trim() || sending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
