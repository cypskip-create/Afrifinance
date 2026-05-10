import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, Check, X, AtSign, Eye, Bell, MessageCircle, Heart, UserPlus, Shield, Lock, Globe, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProfileSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentHandle?: string | null;
  portfolioPublic: boolean;
  onSaved?: () => void;
}

const HANDLE_REGEX = /^[a-z0-9_]{3,20}$/;

export function ProfileSettingsDialog({ open, onOpenChange, currentHandle, portfolioPublic, onSaved }: ProfileSettingsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [handle, setHandle] = useState(currentHandle || "");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [portfolioOn, setPortfolioOn] = useState(portfolioPublic);
  const [prefs, setPrefs] = useState({
    notif_likes: true, notif_comments: true, notif_reposts: true, notif_follows: true,
    notif_mentions: true, notif_dms: true,
    privacy_protected: false, allow_dms: true, show_activity: true,
  });

  useEffect(() => {
    if (open) {
      setHandle(currentHandle || "");
      setPortfolioOn(portfolioPublic);
      setAvailable(null);
      try {
        const stored = localStorage.getItem(`th_prefs_${user?.id}`);
        if (stored) setPrefs(p => ({ ...p, ...JSON.parse(stored) }));
      } catch {}
    }
  }, [open, currentHandle, portfolioPublic, user]);

  // Debounced handle availability check
  useEffect(() => {
    const v = handle.trim().toLowerCase();
    if (!v || v === (currentHandle || "").toLowerCase()) { setAvailable(null); return; }
    if (!HANDLE_REGEX.test(v)) { setAvailable(false); return; }
    setChecking(true);
    const t = setTimeout(async () => {
      const { data } = await supabase.from("profiles").select("user_id").eq("handle", v).maybeSingle();
      setAvailable(!data || data.user_id === user?.id);
      setChecking(false);
    }, 400);
    return () => clearTimeout(t);
  }, [handle, currentHandle, user]);

  const handleValid = HANDLE_REGEX.test(handle.trim().toLowerCase());

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updates: any = { portfolio_public: portfolioOn };
      const newHandle = handle.trim().toLowerCase();
      if (newHandle && newHandle !== (currentHandle || "").toLowerCase()) {
        if (!handleValid) { toast({ title: "Invalid handle", description: "3-20 chars, letters/numbers/underscore", variant: "destructive" }); setSaving(false); return; }
        if (available === false) { toast({ title: "Handle taken", variant: "destructive" }); setSaving(false); return; }
        updates.handle = newHandle;
      }
      const { error } = await supabase.from("profiles").update(updates).eq("user_id", user.id);
      if (error) throw error;
      try { localStorage.setItem(`th_prefs_${user.id}`, JSON.stringify(prefs)); } catch {}
      toast({ title: "Settings saved" });
      onSaved?.();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">TradersHub Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Handle */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-1.5"><AtSign className="h-3.5 w-3.5" />Username / Handle</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
              <Input value={handle} onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())} placeholder="yourhandle" maxLength={20} className="pl-7 pr-9 h-10" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {!checking && available === true && <Check className="h-4 w-4 text-bull" />}
                {!checking && available === false && <X className="h-4 w-4 text-destructive" />}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">3–20 characters. Letters, numbers, underscores only.</p>
            {!handleValid && handle.length > 0 && <p className="text-[11px] text-destructive">Handle must match a–z, 0–9, _</p>}
            {available === false && handleValid && <p className="text-[11px] text-destructive">This handle is already taken</p>}
            {available === true && <p className="text-[11px] text-bull">Handle is available</p>}
          </div>

          <Separator />

          {/* Privacy */}
          <div className="space-y-3">
            <p className="text-sm font-semibold flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" />Privacy</p>
            <Row icon={<Eye className="h-4 w-4" />} title="Portfolio public" desc="Allow others to see your holdings" checked={portfolioOn} onChange={setPortfolioOn} />
            <Row icon={<Lock className="h-4 w-4" />} title="Protected account" desc="Only approved followers see your posts" checked={prefs.privacy_protected} onChange={(v) => setPrefs(p => ({ ...p, privacy_protected: v }))} />
            <Row icon={<MessageCircle className="h-4 w-4" />} title="Allow direct messages" desc="From anyone you don't follow" checked={prefs.allow_dms} onChange={(v) => setPrefs(p => ({ ...p, allow_dms: v }))} />
            <Row icon={<Globe className="h-4 w-4" />} title="Show activity status" desc="Display when you're online" checked={prefs.show_activity} onChange={(v) => setPrefs(p => ({ ...p, show_activity: v }))} />
          </div>

          <Separator />

          {/* Notifications */}
          <div className="space-y-3">
            <p className="text-sm font-semibold flex items-center gap-1.5"><Bell className="h-3.5 w-3.5" />Notifications</p>
            <Row icon={<Heart className="h-4 w-4" />} title="Likes" desc="Notify when someone likes your post" checked={prefs.notif_likes} onChange={(v) => setPrefs(p => ({ ...p, notif_likes: v }))} />
            <Row icon={<MessageCircle className="h-4 w-4" />} title="Comments & replies" desc="Notify when someone replies" checked={prefs.notif_comments} onChange={(v) => setPrefs(p => ({ ...p, notif_comments: v }))} />
            <Row icon={<AlertCircle className="h-4 w-4" />} title="Reposts" desc="Notify when someone reposts" checked={prefs.notif_reposts} onChange={(v) => setPrefs(p => ({ ...p, notif_reposts: v }))} />
            <Row icon={<UserPlus className="h-4 w-4" />} title="New followers" desc="Notify on new follow" checked={prefs.notif_follows} onChange={(v) => setPrefs(p => ({ ...p, notif_follows: v }))} />
            <Row icon={<AtSign className="h-4 w-4" />} title="Mentions" desc="Notify when @mentioned" checked={prefs.notif_mentions} onChange={(v) => setPrefs(p => ({ ...p, notif_mentions: v }))} />
          </div>

          <div className="flex gap-2 pt-2 sticky bottom-0 bg-background pb-1">
            <Button variant="outline" className="flex-1 rounded-full" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="flex-1 rounded-full" onClick={handleSave} disabled={saving || (handle !== (currentHandle || "") && available === false)}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ icon, title, desc, checked, onChange }: { icon: React.ReactNode; title: string; desc: string; checked: boolean; onChange: (v: boolean) => void; }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground shrink-0">{icon}</div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{title}</div>
          <div className="text-[11px] text-muted-foreground truncate">{desc}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
