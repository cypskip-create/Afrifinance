import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Bookmark, BookmarkCheck, Share2, ThumbsUp, MessageCircle, 
  Clock, Eye, ExternalLink, X 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  source: string;
  time: string;
  category: string;
  imageUrl: string;
  readTime?: string;
  views?: number;
  likes?: number;
  comments?: number;
  hasVideo?: boolean;
  stockMentions?: string[];
  isPremium?: boolean;
  isBreaking?: boolean;
}

interface NewsDetailDialogProps {
  article: NewsArticle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedArticles: number[];
  onToggleSave: (id: number) => void;
}

export function NewsDetailDialog({ 
  article, 
  open, 
  onOpenChange, 
  savedArticles, 
  onToggleSave 
}: NewsDetailDialogProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!article) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
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

  // Generate full article content based on summary
  const fullContent = `
${article.summary}

The development marks a significant milestone in Kenya's financial sector, with analysts expecting widespread implications for both retail and institutional investors. Market observers have noted the timing of this announcement coincides with broader regional economic trends.

"This is a pivotal moment for the market," said industry experts familiar with the matter. "We're seeing increased confidence from both local and international investors."

The move comes amid growing interest in East African markets, with the Nairobi Securities Exchange recording increased trading volumes over the past quarter. Foreign investor participation has remained steady, with net inflows totaling approximately KES 2.3 billion in recent months.

Key stakeholders have expressed optimism about the long-term prospects, citing improving macroeconomic indicators and supportive monetary policy from the Central Bank of Kenya.

Looking ahead, market participants will be closely watching for further developments, particularly regarding regulatory approvals and implementation timelines. The next few weeks are expected to provide more clarity on the strategic direction.

For investors, analysts recommend maintaining a diversified portfolio while keeping an eye on sector-specific opportunities that may arise from these developments.
  `.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          {/* Hero Image */}
          <div className="relative">
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full h-56 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-2">
                {article.isBreaking && (
                  <Badge className="bg-red-500 text-white">BREAKING</Badge>
                )}
                {article.isPremium && (
                  <Badge className="bg-accent text-accent-foreground">PRO</Badge>
                )}
                <Badge variant="secondary" className="bg-black/50 text-white">
                  {article.category}
                </Badge>
              </div>
            </div>
          </div>

          <div className="p-4">
            {/* Title */}
            <h2 className="text-xl font-bold leading-tight mb-3">
              {article.title}
            </h2>

            {/* Meta Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {article.source.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{article.source}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{article.time}</span>
                    {article.readTime && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Mentions */}
            {article.stockMentions && article.stockMentions.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {article.stockMentions.map((stock) => (
                  <Badge 
                    key={stock} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => {
                      onOpenChange(false);
                      navigate(`/stock/${stock}`);
                    }}
                  >
                    ${stock}
                  </Badge>
                ))}
              </div>
            )}

            <Separator className="my-4" />

            {/* Article Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {fullContent.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 text-sm leading-relaxed text-foreground">
                  {paragraph}
                </p>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Engagement Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {article.views && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {(article.views / 1000).toFixed(1)}K views
                  </span>
                )}
                {article.likes && (
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {article.likes}
                  </span>
                )}
                {article.comments && (
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {article.comments}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => onToggleSave(article.id)}
              >
                {savedArticles.includes(article.id) ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 mr-2" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
