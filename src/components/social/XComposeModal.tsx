import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Image, BarChart3, DollarSign, TrendingUp, PieChart, Globe, AtSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PortfolioSnapshot {
  totalValue: number;
  totalGain: number;
  gainPercent: number;
  holdings: { symbol: string; name: string; shares: number; avgCost: number; currentPrice: number; gain: number }[];
}

interface MentionSuggestion {
  user_id: string;
  handle: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface XComposeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { id: string; email?: string } | null;
  profile: { avatar_url?: string | null; full_name?: string | null } | null;
  onPost: (content: string, imageUrl?: string) => Promise<{ error?: any }>;
  portfolioSnapshot?: PortfolioSnapshot | null;
  prefillContent?: string;
}

export function XComposeModal({ open, onOpenChange, user, profile, onPost, portfolioSnapshot, prefillContent }: XComposeModalProps) {
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [attachedPL, setAttachedPL] = useState(false);
  const [attachedPortfolio, setAttachedPortfolio] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion[]>([]);
  const [mentionCursorPos, setMentionCursorPos] = useState(0);

  useEffect(() => {
    if (open) {
      if (prefillContent && !content) {
        setContent(prefillContent);
      }
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open, prefillContent]);

  // Search for @mention suggestions
  useEffect(() => {
    if (mentionQuery === null || mentionQuery.length < 1) {
      setMentionSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, handle, full_name, avatar_url')
        .or(`handle.ilike.%${mentionQuery}%,full_name.ilike.%${mentionQuery}%`)
        .limit(5);
      if (data) setMentionSuggestions(data as MentionSuggestion[]);
    }, 200);
    return () => clearTimeout(timer);
  }, [mentionQuery]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    
    // Detect @mention typing
    const cursorPos = e.target.selectionStart || 0;
    setMentionCursorPos(cursorPos);
    const textBeforeCursor = val.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@([\w]*)$/);
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (suggestion: MentionSuggestion) => {
    const textBeforeCursor = content.slice(0, mentionCursorPos);
    const mentionMatch = textBeforeCursor.match(/@([\w]*)$/);
    if (mentionMatch) {
      const handle = suggestion.handle || suggestion.full_name?.toLowerCase().replace(/\s+/g, "") || "user";
      const before = textBeforeCursor.slice(0, mentionMatch.index);
      const after = content.slice(mentionCursorPos);
      setContent(`${before}@${handle} ${after}`);
    }
    setMentionQuery(null);
    setMentionSuggestions([]);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !selectedImage && !attachedPL && !attachedPortfolio) return;
    if (!user) { navigate("/auth"); return; }

    setIsPosting(true);
    let finalContent = content;

    if (attachedPL && portfolioSnapshot) {
      const plText = `\n\n📊 Today's P/L: ${portfolioSnapshot.totalGain >= 0 ? "+" : ""}KES ${portfolioSnapshot.totalGain.toLocaleString()} (${portfolioSnapshot.totalGain >= 0 ? "+" : ""}${portfolioSnapshot.gainPercent.toFixed(1)}%)\nTop holdings: ${portfolioSnapshot.holdings.slice(0, 3).map(h => `$${h.symbol}`).join(", ")}`;
      finalContent += plText;
    }

    if (attachedPortfolio && portfolioSnapshot) {
      const pText = `\n\n💼 Portfolio Snapshot\nTotal Value: KES ${portfolioSnapshot.totalValue.toLocaleString()}\nP/L: ${portfolioSnapshot.totalGain >= 0 ? "+" : ""}KES ${portfolioSnapshot.totalGain.toLocaleString()} (${portfolioSnapshot.gainPercent.toFixed(1)}%)\n${portfolioSnapshot.holdings.slice(0, 5).map(h => `$${h.symbol}: ${h.shares} shares (${h.gain >= 0 ? "+" : ""}${h.gain.toFixed(1)}%)`).join("\n")}`;
      finalContent += pText;
    }

    const { error } = await onPost(finalContent, selectedImage || undefined);
    if (!error) {
      setContent("");
      setSelectedImage(null);
      setAttachedPL(false);
      setAttachedPortfolio(false);
      onOpenChange(false);
    }
    setIsPosting(false);
  };

  const charCount = content.length;
  const maxChars = 500;
  const charPercent = (charCount / maxChars) * 100;

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 rounded-2xl overflow-hidden border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onOpenChange(false)} data-small-target>
            <X className="h-5 w-5" />
          </Button>
          <Button
            size="sm"
            className="rounded-full px-5 h-9 font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={(!content.trim() && !selectedImage && !attachedPL && !attachedPortfolio) || isPosting || charCount > maxChars}
            onClick={handlePost}
          >
            {isPosting ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : "Post"}
          </Button>
        </div>

        {/* Compose area */}
        <div className="flex gap-3 p-4 pb-0">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
              {getInitials(profile?.full_name || user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              placeholder="What's happening in the markets?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent border-0 outline-none resize-none text-[17px] leading-[1.4] placeholder:text-muted-foreground/50 min-h-[120px]"
              maxLength={maxChars + 50}
            />

            {/* Preview image */}
            {selectedImage && (
              <div className="relative mt-2 rounded-2xl overflow-hidden border border-border">
                <img src={selectedImage} alt="Selected" className="w-full max-h-60 object-cover" />
                <Button variant="secondary" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background" onClick={() => setSelectedImage(null)} data-small-target>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* P/L Card preview */}
            {attachedPL && portfolioSnapshot && (
              <div className="mt-3 p-3 rounded-xl border border-border bg-muted/30 relative">
                <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 rounded-full" onClick={() => setAttachedPL(false)} data-small-target>
                  <X className="h-3 w-3" />
                </Button>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold">Today's P/L</span>
                </div>
                <div className={`text-xl font-bold ${portfolioSnapshot.totalGain >= 0 ? "text-bull" : "text-bear"}`}>
                  {portfolioSnapshot.totalGain >= 0 ? "+" : ""}KES {portfolioSnapshot.totalGain.toLocaleString()}
                </div>
                <div className={`text-sm ${portfolioSnapshot.totalGain >= 0 ? "text-bull" : "text-bear"}`}>
                  {portfolioSnapshot.totalGain >= 0 ? "+" : ""}{portfolioSnapshot.gainPercent.toFixed(1)}%
                </div>
              </div>
            )}

            {/* Portfolio snapshot preview */}
            {attachedPortfolio && portfolioSnapshot && (
              <div className="mt-3 p-3 rounded-xl border border-border bg-muted/30 relative">
                <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 rounded-full" onClick={() => setAttachedPortfolio(false)} data-small-target>
                  <X className="h-3 w-3" />
                </Button>
                <div className="flex items-center gap-2 mb-2">
                  <PieChart className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold">Portfolio Snapshot</span>
                </div>
                <div className="text-lg font-bold">KES {portfolioSnapshot.totalValue.toLocaleString()}</div>
                <div className="mt-2 space-y-1">
                  {portfolioSnapshot.holdings.slice(0, 3).map(h => (
                    <div key={h.symbol} className="flex items-center justify-between text-xs">
                      <span className="font-medium">${h.symbol}</span>
                      <span className={h.gain >= 0 ? "text-bull" : "text-bear"}>
                        {h.gain >= 0 ? "+" : ""}{h.gain.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visibility toggle */}
        <div className="px-4 py-2 ml-[52px]">
          <button className="flex items-center gap-1 text-primary text-sm font-semibold hover:bg-primary/10 rounded-full px-3 py-1 -ml-3 transition-colors" data-small-target>
            <Globe className="h-3.5 w-3.5" />
            Everyone can reply
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border ml-[52px]">
          <div className="flex items-center gap-0.5">
            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
            <button className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors" onClick={() => fileInputRef.current?.click()} data-small-target>
              <Image className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors" data-small-target>
              <BarChart3 className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors" data-small-target>
              <DollarSign className="h-5 w-5" />
            </button>
            {portfolioSnapshot && (
              <>
                <button
                  className={`p-2 rounded-full transition-colors ${attachedPL ? "text-bull bg-bull/10" : "text-primary hover:bg-primary/10"}`}
                  onClick={() => setAttachedPL(!attachedPL)}
                  title="Attach Today's P/L"
                  data-small-target
                >
                  <TrendingUp className="h-5 w-5" />
                </button>
                <button
                  className={`p-2 rounded-full transition-colors ${attachedPortfolio ? "text-primary bg-primary/10" : "text-primary hover:bg-primary/10"}`}
                  onClick={() => setAttachedPortfolio(!attachedPortfolio)}
                  title="Attach Portfolio Snapshot"
                  data-small-target
                >
                  <PieChart className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Character counter */}
          {charCount > 0 && (
            <div className="flex items-center gap-3">
              <div className="relative h-5 w-5">
                <svg className="h-5 w-5 -rotate-90" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="9" fill="none" strokeWidth="2" stroke="hsl(var(--border))" />
                  <circle
                    cx="10" cy="10" r="9" fill="none" strokeWidth="2"
                    stroke={charPercent > 100 ? "hsl(var(--destructive))" : charPercent > 90 ? "hsl(var(--accent))" : "hsl(var(--primary))"}
                    strokeDasharray={`${Math.min(charPercent, 100) * 0.565} 100`}
                  />
                </svg>
                {charCount > maxChars * 0.9 && (
                  <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${charCount > maxChars ? "text-destructive" : "text-muted-foreground"}`}>
                    {maxChars - charCount}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
