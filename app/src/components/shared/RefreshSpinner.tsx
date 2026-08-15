import { ContinuaMark } from "./ContinuaMark";

interface RefreshSpinnerProps {
  size?: number;
  className?: string;
}

/**
 * The Continua "C" ring, spinning — used for pull-to-refresh, the splash
 * screen, and any other loading state that used to show a generic spinner.
 * Pure CSS animation (no JS), so it's cheap enough to use anywhere.
 */
export const RefreshSpinner = ({ size = 32, className }: RefreshSpinnerProps) => (
  <div
    className={className}
    style={{
      display: "inline-block",
      width: size,
      height: size,
      animation: "continua-spin 0.9s cubic-bezier(0.65, 0, 0.35, 1) infinite",
    }}
  >
    <ContinuaMark size={size} bare />
  </div>
);