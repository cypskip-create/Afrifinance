import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Play, Newspaper, Radio } from "lucide-react";
import { formatTimestamp } from "@/lib/formatTimestamp";
import { MEDIA_CATEGORIES, getMediaFeed, MediaItem, MediaCategory } from "@/data/mediaItems";
import { MediaDetailDialog } from "@/components/social/MediaDetailDialog";

interface MediaFeedProps {
  searchQuery: string;
  /** Article id to auto-open on mount — used for notification deep links. */
  deepLinkArticleId?: string | null;
  onDeepLinkConsumed?: () => void;
}

const sentimentColor = (s?: string) => {
  if (s === "bullish") return "bg-bull/10 text-bull";
  if (s === "bearish") return "bg-bear/10 text-bear";
  return "bg-muted text-muted-foreground";
};

export function MediaFeed({ searchQuery, deepLinkArticleId, onDeepLinkConsumed }: MediaFeedProps) {
  const [category, setCategory] = useState<MediaCategory | "all">("all");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const feed = useMemo(() => getMediaFeed(category, searchQuery), [category, searchQuery]);
  const breaking = useMemo(() => feed.find((m) => m.isBreaking) || feed[0], [feed]);
  const rest = useMemo(() => feed.filter((m) => m.id !== breaking?.id), [feed, breaking]);

  const openItem = (item: MediaItem) => { setSelected(item); setDetailOpen(true); };

  // Notification deep-link: /traders-hub?tab=media&article=<id>
  useEffect(() => {
    if (!deepLinkArticleId) return;
    const target = getMediaFeed("all", "").find((m) => m.id === deepLinkArticleId);
    if (target) {
      setSelected(target);
      setDetailOpen(true);
    }
    onDeepLinkConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepLinkArticleId]);

  return (
    <div className="px-4 pt-3 pb-6 space-y-4">
      {/* Category rail */}
      <ScrollArea className="w-full">
        <div className="flex gap-1.5 pb-1">
          {MEDIA_CATEGORIES.map((c) => (
            <button
              key={c.id}
              data-small-target
              onClick={() => setCategory(c.id)}
              className={`shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                category === c.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {feed.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <Newspaper className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm font-bold">No stories found</p>
          <p className="text-[12px] text-muted-foreground mt-1">Try a different search or category.</p>
        </div>
      ) : (
        <>
          {/* Featured / breaking story */}
          {breaking && (
            <Card className="soft-card border-0 overflow-hidden cursor-pointer animate-fade-in" onClick={() => openItem(breaking)}>
              <div className="relative">
                <img src={breaking.imageUrl} alt={breaking.title} className="w-full h-40 object-cover rounded-t-2xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-t-2xl" />
                {breaking.kind === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-11 w-11 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="h-4 w-4 text-foreground ml-0.5" />
                    </div>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  {breaking.isBreaking && <Badge className="bg-destructive text-destructive-foreground text-[10px] px-2.5 py-0.5 rounded-full">BREAKING</Badge>}
                  {breaking.sentiment && (
                    <Badge className={`text-[10px] px-2 py-0.5 rounded-full border-0 ${sentimentColor(breaking.sentiment)}`}>
                      {breaking.sentiment === "bullish" ? "↑ Bullish" : breaking.sentiment === "bearish" ? "↓ Bearish" : "Neutral"}
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="text-white font-bold text-sm leading-snug mb-1.5">{breaking.title}</h2>
                  <div className="flex items-center gap-2 text-white/70 text-xs">
                    <span className="font-medium text-white">{breaking.source}</span>
                    <span>·</span>
                    <span>{formatTimestamp(breaking.publishedAt)}</span>
                    {breaking.kind === "video" && breaking.duration && (<><span>·</span><span>{breaking.duration}</span></>)}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Story list — compact thumbnail, headline gets most of the width */}
          <div className="space-y-2.5">
            {rest.map((item) => (
              <Card key={item.id} className="soft-card overflow-hidden cursor-pointer" onClick={() => openItem(item)}>
                <div className="flex items-center gap-3 p-2.5">
                  <div className="relative w-16 h-16 shrink-0">
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                    {item.kind === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                        <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="h-3 w-3 text-foreground ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.kind === "video" ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-primary"><Radio className="h-3 w-3" />{item.source}</span>
                      ) : (
                        <span className="text-[11px] font-semibold text-primary">{item.source}</span>
                      )}
                      <span className="text-[11px] text-muted-foreground">{formatTimestamp(item.publishedAt)}</span>
                      {item.kind === "video" && item.duration && (
                        <span className="text-[11px] text-muted-foreground">· {item.duration}</span>
                      )}
                    </div>
                    <h2 className="font-bold text-[13px] leading-snug line-clamp-3 mb-1.5">{item.title}</h2>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.sentiment && (
                        <Badge className={`text-[9px] px-1.5 py-0 rounded-full border-0 ${sentimentColor(item.sentiment)}`}>
                          {item.sentiment === "bullish" ? "↑ Bullish" : item.sentiment === "bearish" ? "↓ Bearish" : "—"}
                        </Badge>
                      )}
                      {item.stockMentions?.slice(0, 2).map((stock) => (
                        <Badge
                          key={stock}
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 rounded-full cursor-pointer hover:bg-primary/10"
                          onClick={(e) => { e.stopPropagation(); openItem(item); }}
                        >
                          ${stock}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <MediaDetailDialog item={selected} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}