import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * AfriFinance reaction palette — finance-first, deliberately not a like button.
 * Legacy ids are kept so historical reactions still render.
 */
export type CommunityReaction =
  | "bullish" | "bearish" | "strong_hold" | "insightful" | "watch" | "fire" | "laugh" | "love"
  // legacy
  | "cautious" | "support" | "disagree";

export interface ReactionMeta { id: CommunityReaction; emoji: string; label: string }

export const COMMUNITY_REACTIONS: ReactionMeta[] = [
  { id: "bullish", emoji: "🐂", label: "Bullish" },
  { id: "bearish", emoji: "🐻", label: "Bearish" },
  { id: "strong_hold", emoji: "🤲", label: "Strong Hold" },
  { id: "insightful", emoji: "💡", label: "Insightful" },
  { id: "watch", emoji: "👀", label: "Watch" },
  { id: "fire", emoji: "🔥", label: "Fire" },
  { id: "laugh", emoji: "😂", label: "Laugh" },
  { id: "love", emoji: "❤️", label: "Love" },
];

const LEGACY: ReactionMeta[] = [
  { id: "cautious", emoji: "🛡️", label: "Cautious" },
  { id: "support", emoji: "🤝", label: "Support" },
  { id: "disagree", emoji: "👎", label: "Disagree" },
];

export const ALL_REACTIONS = [...COMMUNITY_REACTIONS, ...LEGACY];

export function reactionMeta(id?: CommunityReaction | null): ReactionMeta | undefined {
  return ALL_REACTIONS.find(r => r.id === id);
}

export type ReactionCountMap = Partial<Record<CommunityReaction, number>>;

export function sortedReactions(counts: ReactionCountMap): { meta: ReactionMeta; count: number }[] {
  return ALL_REACTIONS
    .map(meta => ({ meta, count: counts[meta.id] || 0 }))
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count);
}

interface TrayProps {
  counts: ReactionCountMap;
  selected?: CommunityReaction | null;
  onSelect: (reaction: CommunityReaction) => void;
  compact?: boolean;
  /** Hide the aggregate count (used where chips already show totals). */
  hideTotal?: boolean;
}

/** Reaction control: shows top reactions + total, opens the tray on tap. */
export function CommunityReactionButton({ counts, selected, onSelect, compact, hideTotal }: TrayProps) {
  const [open, setOpen] = useState(false);
  const ranked = sortedReactions(counts);
  const total = ranked.reduce((sum, r) => sum + r.count, 0);
  // Only the single most-used reaction is shown in the collapsed view — whichever
  // reaction has the most reactors "wins" the icon slot, like the fire emoji does today.
  const winner = ranked[0];
  const active = reactionMeta(selected);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="React to this post"
          onClick={e => e.stopPropagation()}
          className={cn(
            "flex items-center gap-1.5 rounded-full text-muted-foreground transition-colors hover:text-foreground",
            compact ? "h-7 px-1.5" : "h-8 px-1.5",
            selected && "text-foreground"
          )}
          data-small-target
        >
          {winner ? (
            <span className="text-[15px] leading-none">{winner.meta.emoji}</span>
          ) : active ? (
            <span className="text-[15px] leading-none">{active.emoji}</span>
          ) : (
            <ThumbsUp className="h-[15px] w-[15px]" strokeWidth={2} />
          )}
          {!hideTotal && <span className="text-[11px] font-medium tabular-nums">{total > 0 ? total : "React"}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-[264px] p-2.5 rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="grid grid-cols-4 gap-1">
          {COMMUNITY_REACTIONS.map(item => (
            <button
              key={item.id}
              type="button"
              title={item.label}
              aria-label={item.label}
              onClick={() => { onSelect(item.id); setOpen(false); }}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl py-2 transition-colors hover:bg-muted/60 active:scale-95",
                selected === item.id && "bg-primary/10"
              )}
            >
              <span className="text-[22px] leading-none">{item.emoji}</span>
              <span className="text-[9.5px] text-muted-foreground leading-none">{item.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Moomoo-style reaction chips (used in the expanded post view). */
export function ReactionChips({
  counts, selected, onSelect,
}: { counts: ReactionCountMap; selected?: CommunityReaction | null; onSelect?: (r: CommunityReaction) => void }) {
  const ranked = sortedReactions(counts);
  if (ranked.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {ranked.map(r => (
        <button
          key={r.meta.id}
          type="button"
          onClick={e => { e.stopPropagation(); onSelect?.(r.meta.id); }}
          className={cn(
            "flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-muted/50 text-[11px] font-medium tabular-nums transition-colors hover:bg-muted",
            selected === r.meta.id && "bg-primary/15 text-foreground"
          )}
          data-small-target
        >
          <span className="text-[13px] leading-none">{r.meta.emoji}</span>
          <span className="text-muted-foreground">{r.count}</span>
        </button>
      ))}
    </div>
  );
}