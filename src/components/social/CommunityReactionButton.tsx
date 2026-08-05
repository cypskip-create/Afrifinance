import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type CommunityReaction = "insightful" | "bullish" | "cautious" | "support" | "disagree" | "fire";

export const COMMUNITY_REACTIONS: { id: CommunityReaction; emoji: string; label: string }[] = [
  { id: "insightful", emoji: "💡", label: "Insightful" },
  { id: "bullish", emoji: "📈", label: "Bullish" },
  { id: "cautious", emoji: "🛡️", label: "Cautious" },
  { id: "support", emoji: "🤝", label: "Support" },
  { id: "disagree", emoji: "👎", label: "Disagree" },
  { id: "fire", emoji: "🔥", label: "Hot take" },
];

interface Props {
  counts: Partial<Record<CommunityReaction, number>>;
  selected?: CommunityReaction | null;
  onSelect: (reaction: CommunityReaction) => void;
  compact?: boolean;
}

export function CommunityReactionButton({ counts, selected, onSelect, compact }: Props) {
  const [open, setOpen] = useState(false);
  const total = Object.values(counts).reduce((sum, count) => sum + (count || 0), 0);
  const top = COMMUNITY_REACTIONS
    .filter(item => (counts[item.id] || 0) > 0)
    .sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0))
    .slice(0, 3);
  const active = COMMUNITY_REACTIONS.find(item => item.id === selected);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-9 px-2 gap-1.5 text-muted-foreground hover:text-primary", selected && "text-primary", compact && "h-8")}
          onClick={event => event.stopPropagation()}
          aria-label="React to this post"
        >
          <span className="text-[15px] leading-none">{active?.emoji || "💡"}</span>
          {!compact && <span className="text-[11px] font-semibold">React</span>}
          {top.length > 0 && <span className="flex -space-x-1">{top.map(item => <span key={item.id} className="text-[12px]">{item.emoji}</span>)}</span>}
          {total > 0 && <span className="text-[11px] tabular">{total}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-auto p-1.5 rounded-full" onClick={event => event.stopPropagation()}>
        <div className="flex items-center gap-0.5">
          {COMMUNITY_REACTIONS.map(item => (
            <Button
              key={item.id}
              variant="ghost"
              size="icon"
              className={cn("h-10 w-10 rounded-full text-xl hover:scale-110", selected === item.id && "bg-primary/10")}
              title={item.label}
              aria-label={item.label}
              onClick={() => { onSelect(item.id); setOpen(false); }}
            >
              {item.emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}