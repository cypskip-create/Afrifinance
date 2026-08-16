import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Share2, Clock, X, Play, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { formatTimestamp } from "@/lib/formatTimestamp";
import { shareLink } from "@/lib/share";
import type { MediaItem } from "@/data/mediaItems";

interface MediaDetailDialogProps {
  item: MediaItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sentimentColor = (s?: string) => {
  if (s === "bullish") return "bg-bull/10 text-bull";
  if (s === "bearish") return "bg-bear/10 text-bear";
  return "bg-muted text-muted-foreground";
};

export function MediaDetailDialog({ item, open, onOpenChange }: MediaDetailDialogProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playing, setPlaying] = useState(false);

  if (!item) return null;

  const handleShare = async () => {
    const url = `${window.location.origin}/traders-hub?tab=media&article=${item.id}`;
    const result = await shareLink(url, { title: item.title, text: item.summary });
    if (result.method === "clipboard") toast({ title: "Link copied" });
    else if (result.method === "failed") toast({ title: "Couldn't share this", variant: "destructive" });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setPlaying(false); }}>
      <DialogContent
        hideClose
        className="max-w-none w-screen h-[100dvh] inset-0 top-0 left-0 translate-x-0 translate-y-0 rounded-none border-0 p-0 gap-0 overflow-hidden"
      >
        <ScrollArea className="h-[100dvh]">
          {/* Hero — image, or inline video player when this is a video item */}
          <div className="relative bg-black">
            {item.kind === "video" && playing ? (
              <video
                src={item.videoUrl}
                poster={item.imageUrl}
                controls
                autoPlay
                className="w-full h-64 object-contain bg-black"
              />
            ) : (
              <button
                type="button"
                className="relative block w-full"
                onClick={() => item.kind === "video" && setPlaying(true)}
                aria-label={item.kind === "video" ? "Play video" : undefined}
              >
                <img src={item.imageUrl} alt={item.title} className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                {item.kind === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Play className="h-6 w-6 text-foreground ml-0.5" />
                    </div>
                  </div>
                )}
              </button>
            )}

            {/* Single close control for the full-screen reader */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 bg-black/30 hover:bg-black/50 text-white rounded-full"
              style={{ top: "max(0.75rem, env(safe-area-inset-top, 0.75rem))" }}
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
              <div className="flex items-center gap-2 mb-2">
                {item.isBreaking && <Badge className="bg-destructive text-destructive-foreground rounded-full">BREAKING</Badge>}
                {item.kind === "video" && item.duration && (
                  <Badge variant="secondary" className="bg-black/50 text-white rounded-full">{item.duration}</Badge>
                )}
                <Badge variant="secondary" className="bg-black/50 text-white capitalize rounded-full">{item.category}</Badge>
              </div>
            </div>
          </div>

          <div className="p-4 pb-10">
            <h2 className="text-xl font-bold leading-tight mb-3">{item.title}</h2>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {item.source.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{item.source}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatTimestamp(item.publishedAt)}</span>
                    {item.readTime && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.readTime}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {item.sentiment && (
                <Badge className={`rounded-full border-0 ${sentimentColor(item.sentiment)}`}>
                  {item.sentiment === "bullish" ? <TrendingUp className="h-3 w-3 mr-1" /> : item.sentiment === "bearish" ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                  {item.sentiment === "bullish" ? "Bullish" : item.sentiment === "bearish" ? "Bearish" : "Neutral"}
                </Badge>
              )}
            </div>

            {item.kind === "video" && item.guest && (
              <p className="text-xs font-semibold text-primary mb-4">Featuring: {item.guest}</p>
            )}

            {item.stockMentions && item.stockMentions.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {item.stockMentions.map((stock) => (
                  <Badge
                    key={stock}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 rounded-full"
                    onClick={() => { onOpenChange(false); navigate(`/stock/${stock}`); }}
                  >
                    ${stock}
                  </Badge>
                ))}
              </div>
            )}

            <Separator className="my-4" />

            <div className="prose prose-sm dark:prose-invert max-w-none">
              {item.body.map((paragraph, idx) => (
                <p key={idx} className="mb-4 text-sm leading-relaxed text-foreground">{paragraph}</p>
              ))}
            </div>

            <Separator className="my-4" />

            <Button variant="outline" className="w-full rounded-full" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />Share
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}