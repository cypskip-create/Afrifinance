/**
 * The Continua brand mark: an open "C" ring with a navigation-arrow/compass
 * needle nested inside it, reading as "direction within markets" — used for
 * the logo, app icon tiles, and the spinning refresh/loading indicator (see
 * RefreshSpinner.tsx).
 *
 * Brand palette (from the official brand board):
 *   Purple  #7B5CFF
 *   Orange  #FF8A00
 *   Ink     #0D1117  (dark tile background)
 *   Mist    #F5F6FA  (light tile background)
 *
 * Kept as a real component (not a static image) so it can be recolored,
 * resized, and animated without needing separate asset exports.
 */
interface ContinuaMarkProps {
  /** Pixel size of the square mark. */
  size?: number;
  /** Render just the gradient mark with no background tile — for placing on
   *  top of an existing surface (e.g. inside a spinner) or next to a
   *  wordmark instead of as a standalone icon. */
  bare?: boolean;
  /** Tile background treatment when `bare` is false. `auto` follows the
   *  current color scheme (dark tile in dark mode, light tile in light
   *  mode) — this is what the app chrome (top bar, splash, dialogs) should
   *  use. `dark` / `light` force a specific tile regardless of theme and
   *  `gradient` renders the brand-gradient tile with a white mark, as seen
   *  on the alternate app-icon variant. */
  tile?: "auto" | "dark" | "light" | "gradient";
  className?: string;
}

export const ContinuaMark = ({ size = 40, bare = false, tile = "auto", className }: ContinuaMarkProps) => {
  const uid = `continua-mark-${size}-${tile}-${bare}`;
  const arcGradId = `${uid}-arc`;
  const arrowGradId = `${uid}-arrow`;

  const isGradientTile = !bare && tile === "gradient";
  const arcStroke = isGradientTile ? "#FFFFFF" : `url(#${arcGradId})`;
  const arrowFill = isGradientTile ? "#FFFFFF" : `url(#${arrowGradId})`;
  const dotFill = isGradientTile ? "#FFFFFF" : "#FF8A00";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Continua"
      className={className}
      style={{ width: size, height: size, flexShrink: 0, display: "block" }}
    >
      <defs>
        <linearGradient id={arcGradId} x1="0.15" y1="0" x2="0.75" y2="1">
          <stop offset="0%" stopColor="#FF8A00" />
          <stop offset="100%" stopColor="#7B5CFF" />
        </linearGradient>
        <linearGradient id={arrowGradId} x1="0.2" y1="0.05" x2="0.75" y2="0.95">
          <stop offset="0%" stopColor="#FF8A00" />
          <stop offset="100%" stopColor="#7B5CFF" />
        </linearGradient>
        {isGradientTile && (
          <linearGradient id={`${uid}-tile`} x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#FF8A00" />
            <stop offset="100%" stopColor="#7B5CFF" />
          </linearGradient>
        )}
      </defs>

      {!bare && tile === "dark" && <rect x="0" y="0" width="100" height="100" rx="24" fill="#0D1117" />}
      {!bare && tile === "light" && <rect x="0" y="0" width="100" height="100" rx="24" fill="#F5F6FA" />}
      {!bare && tile === "gradient" && <rect x="0" y="0" width="100" height="100" rx="24" fill={`url(#${uid}-tile)`} />}
      {!bare && tile === "auto" && (
        <rect x="0" y="0" width="100" height="100" rx="24" className="fill-[#F5F6FA] dark:fill-[#0D1117]" />
      )}

      {/* Open "C" ring — gap faces right, where the arrow tip pokes through */}
      <circle
        cx="48"
        cy="50"
        r="30"
        fill="none"
        stroke={arcStroke}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray="151.9 36.6"
        strokeDashoffset="-18.3"
      />
      <polygon
        points="80,45 41,29 55,50 47,75"
        fill={arrowFill}
      />

      {/* Accent point at the arrow tip */}
      <circle cx="83.5" cy="43.5" r="4.2" fill={dotFill} />
    </svg>
  );
};