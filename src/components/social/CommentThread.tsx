import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment } from "@/hooks/usePosts";
import { CommunityReactionButton, CommunityReaction, ReactionChips } from "./CommunityReactionButton";
import { atHandle, getInitials } from "@/lib/handle";
import { formatTimestamp } from "@/lib/formatTimestamp";
import { renderRichText } from "./HubPostCard";

interface NodeProps {
  comment: Comment;
  depth: number;
  onReply: (c: Comment) => void;
  onReactComment?: (commentId: string, reaction: CommunityReaction, current?: CommunityReaction | null) => Promise<any>;
  replyingToId?: string | null;
}

function CommentNode({ comment, depth, onReply, onReactComment, replyingToId }: NodeProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(depth < 1);
  const [reaction, setReaction] = useState<CommunityReaction | null>(comment.my_reaction || null);
  const [counts, setCounts] = useState(comment.reaction_counts || {});

  const replies = comment.replies || [];

  const react = async (next: CommunityReaction) => {
    const prev = reaction;
    setReaction(prev === next ? null : next);
    setCounts(current => {
      const updated = { ...current };
      if (prev) updated[prev] = Math.max(0, (updated[prev] || 0) - 1);
      if (prev !== next) updated[next] = (updated[next] || 0) + 1;
      return updated;
    });
    await onReactComment?.(comment.id, next, prev);
  };

  return (
    <div className="relative">
      <div className={`flex gap-2.5 px-4 py-3 ${replyingToId === comment.id ? "bg-primary/5" : ""}`}>
        <div className="relative shrink-0 flex flex-col items-center">
          <Avatar className="h-7 w-7 z-10 bg-background" onClick={() => navigate(`/profile/${comment.user_id}`)}>
            <AvatarImage src={comment.author?.avatar_url || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{getInitials(comment.author?.full_name)}</AvatarFallback>
          </Avatar>
          {replies.length > 0 && expanded && <div className="flex-1 w-px bg-border/60 mt-1" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-[12.5px] truncate">{comment.author?.full_name || "Investor"}</span>
              <span className="text-[11px] text-muted-foreground truncate">{atHandle(comment.author as any)}</span>
            </div>
            <span className="text-[11px] text-muted-foreground shrink-0">{formatTimestamp(comment.created_at)}</span>
          </div>
          <p className="text-[13px] mt-1 leading-[1.55] break-words whitespace-pre-wrap">{renderRichText(comment.content, navigate)}</p>

          <div className="mt-1.5">
            <ReactionChips counts={counts} selected={reaction} onSelect={react} />
          </div>

          <div className="flex items-center gap-3 mt-1 -ml-1.5">
            <CommunityReactionButton compact counts={counts} selected={reaction} onSelect={react} hideTotal />
            <button
              type="button"
              data-small-target
              onClick={() => onReply(comment)}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="h-3.5 w-3.5" />Reply
            </button>
          </div>

          {replies.length > 0 && (
            <button
              type="button"
              data-small-target
              onClick={() => setExpanded(v => !v)}
              className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold text-primary"
            >
              <ChevronRight className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
              {expanded ? `Hide ${replies.length} ${replies.length === 1 ? "reply" : "replies"}` : `${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
            </button>
          )}
        </div>
      </div>

      {expanded && replies.length > 0 && (
        <div className="pl-[26px]">
          {replies.map(r => (
            <CommentNode key={r.id} comment={r} depth={depth + 1} onReply={onReply} onReactComment={onReactComment} replyingToId={replyingToId} />
          ))}
        </div>
      )}

      {depth === 0 && <div className="border-b border-border/40" />}
    </div>
  );
}

export function CommentThread({
  comments, onReply, onReactComment, replyingToId,
}: {
  comments: Comment[];
  onReply: (c: Comment) => void;
  onReactComment?: (commentId: string, reaction: CommunityReaction, current?: CommunityReaction | null) => Promise<any>;
  replyingToId?: string | null;
}) {
  return (
    <div>
      {comments.map(c => (
        <CommentNode key={c.id} comment={c} depth={0} onReply={onReply} onReactComment={onReactComment} replyingToId={replyingToId} />
      ))}
    </div>
  );
}
