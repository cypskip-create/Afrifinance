import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Verified, Send, ArrowLeft, SlidersHorizontal, ChevronDown, MessageCircle, X, Heart, Repeat2, Quote, MoreHorizontal, ChevronRight, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Post, Comment, usePosts } from "@/hooks/usePosts";
import { XPostCard } from "./XPostCard";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

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
  onQuote?: (post: Post, comment?: Comment) => void;
  onCommentsRefresh?: () => Promise<void>;
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
  comment, depth, onReply, onQuote, replyingTo, navigateTo, onRefresh,
}: {
  comment: Comment;
  depth: number;
  onReply: (c: Comment) => void;
  onQuote: (c: Comment) => void;
  replyingTo: string | null;
  navigateTo: (url: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const { likeComment, repostComment } = usePosts();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(depth < 1); // Auto-expand top-level only
  const [optimistic, setOptimistic] = useState({
    is_liked: !!comment.is_liked,
    likes_count: comment.likes_count || 0,
    is_reposted: !!comment.is_reposted,
    reposts_count: comment.reposts_count || 0,
  });

  const replyCount = comment.replies?.length || 0;

  const handleLikeReply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasLiked = optimistic.is_liked;
    setOptimistic(o => ({ ...o, is_liked: !wasLiked, likes_count: o.likes_count + (wasLiked ? -1 : 1) }));
    await likeComment(comment.id, wasLiked);
  };

  const handleRepostReply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasReposted = optimistic.is_reposted;
    setOptimistic(o => ({ ...o, is_reposted: !wasReposted, reposts_count: o.reposts_count + (wasReposted ? -1 : 1) }));
    await repostComment(comment.id, wasReposted);
    if (!wasReposted) toast({ title: "Reposted!" });
  };

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

  const indent = Math.min(depth, 6);
  const indentPx = indent * 20;

  return (
    <div className="relative">
      {/* Thread line(s) for each ancestor level */}
      {Array.from({ length: indent }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-px bg-border/60 pointer-events-none"
          style={{ left: `${28 + i * 20}px` }}
        />
      ))}

      <div
        className={`relative flex gap-3 px-4 py-3 border-b border-border/40 hover:bg-muted/20 transition-colors ${
          replyingTo === comment.id ? "bg-primary/5" : ""
        }`}
        style={{ paddingLeft: `${16 + indentPx}px` }}
      >
        <Avatar className="h-8 w-8 shrink-0 cursor-pointer relative z-10 bg-background" onClick={() => navigateTo(`/profile/${comment.user_id}`)}>
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
          <p className="text-[13px] mt-0.5 leading-relaxed break-words">{renderContent(comment.content)}</p>

          {/* Action bar */}
          <div className="flex items-center gap-4 mt-1.5 -ml-1.5">
            <button onClick={(e) => { e.stopPropagation(); onReply(comment); }} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary p-1 rounded-full" data-small-target>
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Reply</span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className={`flex items-center gap-1 text-[11px] p-1 rounded-full ${optimistic.is_reposted ? 'text-bull' : 'text-muted-foreground hover:text-bull'}`} data-small-target>
                  <Repeat2 className="h-3.5 w-3.5" />
                  {optimistic.reposts_count > 0 && <span>{optimistic.reposts_count}</span>}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40 rounded-xl">
                <DropdownMenuItem onClick={handleRepostReply}>
                  <Repeat2 className="h-4 w-4 mr-2" />{optimistic.is_reposted ? "Undo repost" : "Repost"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onQuote(comment); }}>
                  <Pencil className="h-4 w-4 mr-2" />Quote
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button onClick={handleLikeReply} className={`flex items-center gap-1 text-[11px] p-1 rounded-full ${optimistic.is_liked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`} data-small-target>
              <Heart className={`h-3.5 w-3.5 ${optimistic.is_liked ? 'fill-current' : ''}`} />
              {optimistic.likes_count > 0 && <span>{optimistic.likes_count}</span>}
            </button>
          </div>

          {replyCount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
              className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
              data-small-target
            >
              <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
              {expanded ? `Hide ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}` : `View ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
            </button>
          )}
        </div>
      </div>

      {expanded && comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map(reply => (
            <CommentNode
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              onQuote={onQuote}
              replyingTo={replyingTo}
              navigateTo={navigateTo}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function XCommentSheet({
  open, onOpenChange, post, currentUserId, comments, loadingComments,
  onAddComment, onLike, onRepost, onBookmark, onShare, onDelete, onQuote, onCommentsRefresh,
}: XCommentSheetProps) {
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "relevant">("relevant");

  const navigateTo = (url: string) => { onOpenChange(false); navigate(url); };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    await onAddComment(newComment, replyingTo?.id);
    setNewComment("");
    setReplyingTo(null);
    setSending(false);
  };

  const handleQuoteComment = (c: Comment) => {
    if (post && onQuote) {
      onOpenChange(false);
      onQuote(post, c);
    }
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
      <DialogContent className="max-w-2xl w-screen sm:w-[95vw] h-[100dvh] sm:h-[95dvh] p-0 gap-0 sm:rounded-2xl rounded-none overflow-hidden border-0 sm:border border-border/60 [&>button]:hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-card sticky top-0 z-10 shrink-0">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => onOpenChange(false)} data-small-target>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-bold text-base">Post</h2>
        </div>

        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto">
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

          <div className="px-4 py-2.5 border-b border-border/60 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-[5]">
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
            <div className="pb-24">
              {sorted.map(c => (
                <CommentNode
                  key={c.id}
                  comment={c}
                  depth={0}
                  onReply={setReplyingTo}
                  onQuote={handleQuoteComment}
                  replyingTo={replyingTo?.id || null}
                  navigateTo={navigateTo}
                  onRefresh={async () => { if (onCommentsRefresh) await onCommentsRefresh(); }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Composer */}
        {currentUserId && (
          <div className="border-t border-border/60 bg-card shrink-0">
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
            <div className="flex items-center gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
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
