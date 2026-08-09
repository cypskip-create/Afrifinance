import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Loader2, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { isAppLockEnabled, verifyAppLock } from "@/lib/appLock";

export function AppLockGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [checked, setChecked] = useState(false);
  const [locked, setLocked] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!user) { setChecked(true); setLocked(false); return; }
    setLocked(isAppLockEnabled(user.id));
    setChecked(true);
    // Only re-check when the signed-in user changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const tryUnlock = useCallback(async () => {
    if (!user) return;
    setVerifying(true);
    setFailed(false);
    const ok = await verifyAppLock(user.id);
    setVerifying(false);
    if (ok) setLocked(false); else setFailed(true);
  }, [user]);

  // Auto-prompt once as soon as we know the app should be locked.
  useEffect(() => {
    if (checked && locked && !verifying) {
      tryUnlock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, locked]);

  if (!checked || !locked) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[999] bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
        <ShieldCheck className="h-8 w-8 text-foreground" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">AfriFinance is locked</h2>
        <p className="text-sm text-muted-foreground mt-1">Verify with your device Face ID, fingerprint, or PIN to continue.</p>
      </div>
      <Button onClick={tryUnlock} disabled={verifying} className="btn-primary gap-2 mt-2">
        {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
        {verifying ? "Verifying…" : "Unlock"}
      </Button>
      {failed && <p className="text-xs text-destructive">Verification failed or was cancelled. Try again.</p>}
    </div>
  );
}