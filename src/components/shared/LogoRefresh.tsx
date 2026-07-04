import logoImage from "@/assets/logo.jpeg";

/**
 * Branded pull-to-refresh indicator. The logo scales & fades in with pull
 * distance, then spins once the refresh commits. One shared visual is used
 * everywhere so the app feels handcrafted, not templated.
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
          opacity: refreshing ? 1 : clamped,
          transform: refreshing
            ? undefined
            : `scale(${0.7 + clamped * 0.35}) rotate(${clamped * 200}deg)`,
          transition: refreshing ? "none" : "transform 120ms ease-out, opacity 120ms ease-out",
        }}
        className={`h-8 w-8 rounded-xl object-cover shadow-sm ${refreshing ? 'refresh-spin' : ''}`}
      />
    </div>
  );
}
