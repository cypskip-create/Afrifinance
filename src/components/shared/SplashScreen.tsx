import { useEffect, useState } from "react";
import logoImage from "@/assets/logo.jpeg";

/**
 * Premium app-launch splash — logo mark on brand canvas, minimal fade.
 * Inspired by Robinhood / Revolut launch: single mark, no wordmark motion,
 * short-lived (1.1s) so it never gets in the user's way.
 */
export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 900);
    const t2 = setTimeout(onDone, 1250);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-300 ${leaving ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-primary/25 blur-xl splash-pulse" />
          <img
            src={logoImage}
            alt="AfriFinance"
            className="relative h-16 w-16 rounded-2xl object-cover shadow-lg splash-mark"
          />
        </div>
        <div className="splash-word text-[15px] font-semibold tracking-tight text-foreground">
          AfriFinance
        </div>
      </div>
    </div>
  );
}
