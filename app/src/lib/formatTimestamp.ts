// X-style relative timestamps:
//   < 1m         -> "now"
//   < 60m        -> "5m"
//   < 24h        -> "10h"
//   < 7d         -> "3d"
//   same year    -> "Mar 12"
//   else         -> "Mar 12, 2024"
export function formatTimestamp(date: string | number | Date): string {
  const d = new Date(date);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d`;
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("en-US", sameYear ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "numeric" });
}

// Feed-preview timestamps:
//   < 1m   -> "now"
//   < 60m  -> "5m"
//   < 24h  -> "10h"
//   older  -> "12 Mar" / "12 Mar 2024"
export function formatPostDate(date: string | number | Date): string {
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("en-GB", sameYear ? { day: "numeric", month: "short" } : { day: "numeric", month: "short", year: "numeric" });
}

