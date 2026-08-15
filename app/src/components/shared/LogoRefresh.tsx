import { ContinuaMark } from "./ContinuaMark";

/**
 * Branded pull-to-refresh indicator. The mark fades/scales in with pull
 * distance. On commit it spins with a soft glow behind it — a purposeful,
 * branded alternative to a generic spinner.
 */
export function LogoRefresh({ progress, refreshing }: { progress: number; refreshing: boolean }) {
  const clamped = Math.min(1, Math.max(0, progress));
  return (
    <div className="relative flex items-center justify-center h-9 w-9">
      {refreshing && (
        <div className="absolute inset-0 rounded-2xl bg-primary/25 blur-lg refresh-breathe" />
      )}
      <div
        style={{
          opacity: refreshing ? undefined : Math.max(0.35, clamped),
          transform: refreshing ? undefined : `scale(${0.75 + clamped * 0.3})`,
          transition: refreshing ? "none" : "transform 120ms ease-out, opacity 120ms ease-out",
        }}
        className={`relative rounded-2xl shadow-lg ${refreshing ? 'continua-refresh-spin' : ''}`}
      >
        <ContinuaMark size={36} />
      </div>
    </div>
  );
}