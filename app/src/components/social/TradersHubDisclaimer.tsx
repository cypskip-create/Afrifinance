import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  userId: string | undefined;
  onAccept: () => void;
}

// First-time only TradersHub disclaimer.
// Backed by profiles.tradershub_onboarded (server) with a localStorage fallback
// so we never re-show it after a user has accepted on any device.
export function TradersHubDisclaimer({ userId, onAccept }: Props) {
  const [show, setShow] = useState(false);

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

  const handleAccept = async () => {
    if (userId) {
      localStorage.setItem(`tradershub_disclaimer_${userId}`, "true");
      await supabase
        .from("profiles")
        .update({ tradershub_onboarded: true })
        .eq("user_id", userId);
    }
    setShow(false);
    onAccept();
  };

  return (
    <Dialog open={show} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm rounded-3xl p-0 gap-0 [&>button]:hidden">
        <div className="p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-xl font-extrabold">Welcome to TradersHub</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Posts here are personal opinions, not financial advice. Always do your own research before making investment decisions.
            You'll only see this message once.
          </p>
          <Button className="w-full h-12 rounded-full font-bold text-base" onClick={handleAccept}>
            I Understand — Let's Go
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
