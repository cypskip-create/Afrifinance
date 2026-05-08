import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Verified, Send, ArrowLeft, SlidersHorizontal, ChevronDown, MessageCircle, X } from "lucide-react";
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
  onAddComment: (content: string, parentCommentId?: string) => Promise<void>;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onShare: (post: Post) => void;
  onDelete?: (postId: string) => void;
}

const getInitials = (name?: string | null) =>
  name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

const formatTimeAgo = (date: string) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

function CommentNode({
  comment, depth, onReply, replyingTo, navigateTo,
}: {
  comment: Comment;
  depth: number;
  onReply: (c: Comment) => void;
  replyingTo: string | null;
  navigateTo: (url: string) => void;
}) {
  const renderContent = (content: string) =>
    content.split(/(\$[A-Z]+|@\w+)/g).map((part, i) => {
      if (part.startsWith("$")) {
        return (
          <span key={i} className="text-primary font-semibold cursor-pointer hover:underline" onClick={() => navigateTo(`/stock/${part.slice(1)}`)}>
            {part}
          </span>
        );
      }
      if (part.startsWith("@")) {
        return <span key={i} className="text-primary font-semibold">{part}</span>;
      }
      return part;
    });

  return (
    <div>
      <div
        className={`flex gap-3 px-4 py-3 border-b border-border/40 hover:bg-muted/20 transition-colors ${
          replyingTo === comment.id ? "bg-primary/5" : ""
        }`}
        style={{ paddingLeft: `${16 + Math.min(depth, 4) * 24}px` }}
      >
        <Avatar className="h-8 w-8 shrink-0 cursor-pointer" onClick={() => navigateTo(`/profile/${comment.user_id}`)}>
          <AvatarImage src={comment.author?.avatar_url || ""} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
            {getInitials(comment.author?.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-bold text-[13px]">{comment.author?.full_name || "User"}</span>
            <Verified className="h-3 w-3 text-primary fill-primary" />
            <span className="text-[11px] text-muted-foreground">· {formatTimeAgo(comment.created_at)}</span>
          </div>
          <p className="text-[13px] mt-0.5 leading-relaxed">{renderContent(comment.content)}</p>
          <button
            onClick={() => onReply(comment)}
            className="mt-1.5 text-[11px] font-semibold text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            data-small-target
          >
            <MessageCircle className="h-3 w-3" /> Reply
          </button>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map(reply => (
            <CommentNode
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              replyingTo={replyingTo}
              navigateTo={navigateTo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function XCommentSheet({
  open, onOpenChange, post, currentUserId, comments, loadingComments,
  onAddComment, onLike, onRepost, onBookmark, onShare, onDelete,
}: XCommentSheetProps) {
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "relevant" | "liked">("relevant");

  const navigateTo = (url: string) => { onOpenChange(false); navigate(url); };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    await onAddComment(newComment, replyingTo?.id);
    setNewComment("");
    setReplyingTo(null);
    setSending(false);
  };

  const totalCount = (() => {
    const count = (arr: Comment[]): number =>
      arr.reduce((sum, c) => sum + 1 + (c.replies ? count(c.replies) : 0), 0);
    return count(comments);
  })();

  const sorted = [...comments].sort((a, b) => {
    if (sortBy === "latest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return 0;
  });

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 gap-0 rounded-3xl overflow-hidden border-border/60 [&>button]:hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-card">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => onOpenChange(false)} data-small-target>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-bold text-base">Post</h2>
        </div>

        <ScrollArea className="max-h-[60vh]">
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

          <div className="px-4 py-2.5 border-b border-border/60 flex items-center justify-between">
            <span className="text-sm font-bold text-muted-foreground">
              {totalCount > 0 ? `${totalCount} ${totalCount === 1 ? "Reply" : "Replies"}` : "Replies"}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs rounded-full gap-1 px-2" data-small-target>
                  <SlidersHorizontal className="h-3 w-3" />
                  {sortBy === "latest" ? "Latest" : "Relevant"}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={() => setSortBy("relevant")}>Relevant</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("latest")}>Latest</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {loadingComments ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/30 border-t-primary" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-muted-foreground">No replies yet. Start the conversation!</p>
            </div>
          ) : (
            <div>
              {sorted.map(c => (
                <CommentNode
                  key={c.id}
                  comment={c}
                  depth={0}
                  onReply={setReplyingTo}
                  replyingTo={replyingTo?.id || null}
                  navigateTo={navigateTo}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {currentUserId && (
          <div className="border-t border-border/60 bg-card">
            {replyingTo && (
              <div className="flex items-center justify-between px-4 py-2 bg-muted/40 text-[12px]">
                <span className="text-muted-foreground">
                  Replying to <span className="text-primary font-semibold">@{replyingTo.author?.full_name || "user"}</span>
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setReplyingTo(null)} data-small-target>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2 p-3">
              <Input
                placeholder={replyingTo ? `Reply to ${replyingTo.author?.full_name || "user"}` : "Post your reply"}
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
