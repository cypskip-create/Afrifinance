import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, Check, Loader2, AtSign, Sparkles, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { normalizeHandle, fallbackHandle } from "@/lib/handle";
import type { Profile } from "@/hooks/useProfile";

interface Props {
  userId: string | undefined;
  profile: Profile | null;
  updateProfile: (updates: Partial<Profile>) => Promise<{ data?: Profile; error?: unknown }>;
  onDone: () => void;
}

const INTEREST_OPTIONS = [
  { id: "banking", label: "Banking", tickers: ["EQTY", "KCB", "COOP", "SCBK", "ABSA", "NCBA", "DTK"] },
  { id: "telecoms", label: "Telecoms", tickers: ["SAFCOM", "SCOM"] },
  { id: "manufacturing", label: "Manufacturing", tickers: ["BAMB", "BAT"] },
  { id: "consumer", label: "Consumer & drinks", tickers: ["EABL"] },
  { id: "energy", label: "Energy & utilities", tickers: ["KEGN", "KPLC"] },
  { id: "insurance", label: "Insurance", tickers: ["JUB", "BRIT"] },
  { id: "dividends", label: "Dividend investing" },
  { id: "day-trading", label: "Day trading" },
  { id: "long-term", label: "Long-term holding" },
  { id: "ipos", label: "New listings & IPOs" },
];

type Step = "welcome" | "handle" | "interests";

/**
 * First-time-only TradersHub account setup — Moomoo-style: a real handle and
 * a set of interests are chosen up front, rather than the app silently
 * standing in a synthesized identity (see lib/handle.ts's fallbackHandle,
 * which is what every screen showed before someone ever explicitly picked
 * a handle). Gated the same way the old disclaimer was: by
 * profiles.tradershub_onboarded, with a localStorage mirror so it never
 * re-flashes on a slow network re-check.
 */
export function TradersHubOnboarding({ userId, profile, updateProfile, onDone }: Props) {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<Step>("welcome");
  const [handle, setHandle] = useState("");
  const [handleTouched, setHandleTouched] = useState(false);
  const [handleStatus, setHandleStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [interests, setInterests] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId) return;
      const lsKey = `tradershub_disclaimer_${userId}`;
      if (localStorage.getItem(lsKey)) return;
      const { data } = await supabase
        .from("profiles")
        .select("tradershub_onboarded")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (data?.tradershub_onboarded) {
        localStorage.setItem(lsKey, "true");
      } else {
        setShow(true);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  // Prefill with a suggested handle once we know the profile, so the field
  // is never empty — just easy to change before it's claimed for real.
  useEffect(() => {
    if (profile && !handleTouched) setHandle(profile.handle || fallbackHandle(profile));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.handle, profile?.full_name]);

  // Live availability check as the person types their handle.
  useEffect(() => {
    if (step !== "handle") return;
    const clean = normalizeHandle(handle);
    if (clean.length < 3) { setHandleStatus("invalid"); return; }
    setHandleStatus("checking");
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles_public")
        .select("user_id")
        .ilike("handle", clean)
        .neq("user_id", userId || "")
        .maybeSingle();
      setHandleStatus(data ? "taken" : "available");
    }, 350);
    return () => clearTimeout(timer);
  }, [handle, step, userId]);

  const cleanHandle = useMemo(() => normalizeHandle(handle), [handle]);
  const canContinueFromHandle = handleStatus === "available" && cleanHandle.length >= 3;

  const toggleInterest = (id: string) => {
    setInterests(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const finish = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await updateProfile({
      handle: cleanHandle,
      interests: [...interests],
      tradershub_onboarded: true,
    } as Partial<Profile>);
    setSaving(false);
    if (error) return; // updateProfile's own toast/logging covers surfacing this
    localStorage.setItem(`tradershub_disclaimer_${userId}`, "true");
    setShow(false);
    onDone();
  };

  return (
    <Dialog open={show} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm rounded-3xl p-0 gap-0 [&>button]:hidden">
        {step === "welcome" && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
              <ShieldAlert className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-extrabold">Welcome to TradersHub</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Posts here are personal opinions, not financial advice. Always do your own research before making investment decisions.
            </p>
            <p className="text-[12px] text-muted-foreground">
              Next, let's set up your TradersHub identity — it only takes a moment.
            </p>
            <Button className="w-full h-12 rounded-full font-bold text-base" onClick={() => setStep("handle")}>
              Get Started
            </Button>
          </div>
        )}

        {step === "handle" && (
          <div className="p-8 space-y-5">
            <button onClick={() => setStep("welcome")} className="text-muted-foreground -ml-1.5 flex items-center gap-0.5 text-xs">
              <ChevronLeft className="h-3.5 w-3.5" />Back
            </button>
            <div className="text-center space-y-1.5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <AtSign className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-lg font-extrabold">Choose your handle</h2>
              <p className="text-[12.5px] text-muted-foreground">This is how other investors will find and mention you.</p>
            </div>
            <div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">@</span>
                <Input
                  autoFocus
                  value={handle}
                  onChange={e => { setHandleTouched(true); setHandle(e.target.value); }}
                  className="h-12 pl-8 rounded-2xl text-[15px] font-semibold"
                  maxLength={20}
                  placeholder="yourhandle"
                />
              </div>
              <div className="h-5 mt-1.5 px-1 flex items-center gap-1 text-[11.5px]">
                {handleStatus === "checking" && <><Loader2 className="h-3 w-3 animate-spin text-muted-foreground" /><span className="text-muted-foreground">Checking availability…</span></>}
                {handleStatus === "available" && <><Check className="h-3 w-3 text-bull" /><span className="text-bull font-medium">@{cleanHandle} is available</span></>}
                {handleStatus === "taken" && <span className="text-destructive font-medium">@{cleanHandle} is already taken</span>}
                {handleStatus === "invalid" && cleanHandle.length > 0 && <span className="text-muted-foreground">At least 3 characters — letters, numbers, underscores</span>}
              </div>
            </div>
            <Button className="w-full h-12 rounded-full font-bold text-base" disabled={!canContinueFromHandle} onClick={() => setStep("interests")}>
              Continue
            </Button>
          </div>
        )}

        {step === "interests" && (
          <div className="p-8 space-y-5">
            <button onClick={() => setStep("handle")} className="text-muted-foreground -ml-1.5 flex items-center gap-0.5 text-xs">
              <ChevronLeft className="h-3.5 w-3.5" />Back
            </button>
            <div className="text-center space-y-1.5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-lg font-extrabold">What are you into?</h2>
              <p className="text-[12.5px] text-muted-foreground">Pick a few — this shapes your For You feed and who we suggest you follow. You can change these later in Settings.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {INTEREST_OPTIONS.map(opt => {
                const active = interests.has(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleInterest(opt.id)}
                    className={`h-9 px-3.5 rounded-full text-[13px] font-semibold border transition-colors ${
                      active ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-foreground border-border"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <Button className="w-full h-12 rounded-full font-bold text-base" disabled={saving} onClick={finish}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : interests.size > 0 ? "Start exploring" : "Skip for now"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Sector → member tickers, exported so the feed-ranking algorithm can score
 *  a post's $TICKER mentions against a person's chosen sector interests. */
export const INTEREST_SECTOR_TICKERS: Record<string, string[]> = Object.fromEntries(
  INTEREST_OPTIONS.filter(o => o.tickers).map(o => [o.id, o.tickers as string[]])
);