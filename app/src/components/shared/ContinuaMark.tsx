/**
 * The Continua brand mark: an open circular arc reading as both a "C" and a
 * continuous ring — used for the logo, favicon-style app icon tiles, and the
 * spinning refresh/loading indicator (see RefreshSpinner.tsx).
 *
 * Kept as a real component (not a static image) so it can be recolored,
 * resized, and animated without needing separate asset exports.
 */
interface ContinuaMarkProps {
  /** Pixel size of the square mark. */
  size?: number;
  /** Render just the gradient ring with no background tile — for placing on
   *  top of an existing surface (e.g. inside a spinner) instead of as a
   *  standalone icon. */
  bare?: boolean;
  className?: string;
}

export const ContinuaMark = ({ size = 40, bare = false, className }: ContinuaMarkProps) => {
  const gradId = "continua-mark-grad";
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
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6C4FE0" />
          <stop offset="100%" stopColor="#FF7A45" />
        </linearGradient>
      </defs>
      {!bare && <rect x="0" y="0" width="100" height="100" rx="24" fill="#101014" />}
      <circle
        cx="50"
        cy="50"
        r="29"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray="141.72 40.49"
        strokeDashoffset="-20.25"
      />
      <circle cx="72.2" cy="68.7" r="4.3" fill="#FF7A45" />
    </svg>
  );
};