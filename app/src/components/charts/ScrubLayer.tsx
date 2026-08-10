import { useCallback, useRef, useState } from "react";

/**
 * Pointer-driven crosshair layer.
 * Recharts' own tooltip cursor does not fire reliably on touch, so scrubbing is
 * handled here: works for mouse hover, mouse drag and touch drag, with haptics.
 */

const haptic = (() => {
  let last = 0;
  return (ms = 5) => {
    const now = Date.now();
    if (now - last < 40) return;
    last = now;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate(ms); } catch { /* unsupported */ }
    }
  };
})();

interface ScrubLayerProps {
  /** Values plotted, in order — used to place the crosshair dot. */
  values: number[];
  /** Y domain of the chart, matching the chart's YAxis domain. */
  domain: [number, number];
  color: string;
  /** Called with the active index while scrubbing, null on release. */
  onScrub: (index: number | null) => void;
  marginTop?: number;
  marginBottom?: number;
  showDot?: boolean;
}

export function ScrubLayer({
  values, domain, color, onScrub, marginTop = 8, marginBottom = 0, showDot = true,
}: ScrubLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useRef(false);
  const [index, setIndex] = useState<number | null>(null);

  const scrub = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el || values.length < 2) return;
    const rect = el.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const next = Math.round(fraction * (values.length - 1));
    setIndex(prev => {
      if (prev !== next) { haptic(); onScrub(next); }
      return next;
    });
  }, [values.length, onScrub]);

  const end = useCallback(() => {
    active.current = false;
    setIndex(null);
    onScrub(null);
  }, [onScrub]);

  const fraction = index !== null && values.length > 1 ? index / (values.length - 1) : 0;
  const [min, max] = domain;
  const span = max - min || 1;
  const value = index !== null ? values[index] : 0;
  const yPercent = 1 - (value - min) / span;

  return (
    <div
      ref={ref}
      className="absolute inset-0 touch-none select-none"
      style={{ touchAction: "none" }}
      onPointerDown={e => {
        active.current = true;
        try { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); } catch { /* noop */ }
        scrub(e.clientX);
      }}
      onPointerMove={e => {
        if (active.current || e.pointerType === "mouse") scrub(e.clientX);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onPointerLeave={() => { if (!active.current) end(); }}
    >
      {index !== null && (
        <>
          <div
            className="absolute top-0 bottom-0 w-px pointer-events-none"
            style={{ left: `${fraction * 100}%`, background: "hsl(var(--foreground) / 0.35)" }}
          />
          {showDot && Number.isFinite(value) && (
            <div
              className="absolute pointer-events-none rounded-full"
              style={{
                left: `${fraction * 100}%`,
                top: `calc(${marginTop}px + (100% - ${marginTop + marginBottom}px) * ${yPercent})`,
                width: 9, height: 9,
                marginLeft: -4.5, marginTop: -4.5,
                background: color,
                boxShadow: "0 0 0 2px hsl(var(--background))",
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

export { haptic as chartHaptic };
