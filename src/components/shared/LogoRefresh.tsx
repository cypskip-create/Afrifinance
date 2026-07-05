import logoImage from "@/assets/logo.jpeg";

/**
 * Branded pull-to-refresh indicator. The logo fades/scales in with pull
 * distance. On commit it breathes with a soft green halo — dim → glow → dim —
 * instead of spinning. Gives a calmer, more premium feel.
 */
export function LogoRefresh({ progress, refreshing }: { progress: number; refreshing: boolean }) {
  const clamped = Math.min(1, Math.max(0, progress));
  return (
    <div className="flex items-center justify-center">
      <img
        src={logoImage}
        alt=""
        aria-hidden
        style={{
          opacity: refreshing ? undefined : Math.max(0.35, clamped),
          transform: refreshing ? undefined : `scale(${0.75 + clamped * 0.3})`,
          transition: refreshing ? "none" : "transform 120ms ease-out, opacity 120ms ease-out",
        }}
        className={`h-9 w-9 rounded-2xl object-cover ${refreshing ? 'refresh-breathe' : ''}`}
      />
    </div>
  );
}
