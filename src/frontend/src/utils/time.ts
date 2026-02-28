/**
 * Convert a nanosecond bigint timestamp (ICP) or millisecond number to a
 * human-readable relative string.
 */
export function timeAgo(timestamp: bigint | number): string {
  const ms =
    typeof timestamp === "bigint"
      ? // ICP timestamps are in nanoseconds; divide by 1_000_000 to get ms
        Number(timestamp / 1_000_000n)
      : timestamp;

  const seconds = Math.floor((Date.now() - ms) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    return `${m} ${m === 1 ? "min" : "mins"} ago`;
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    return `${h} ${h === 1 ? "hour" : "hours"} ago`;
  }
  if (seconds < 86400 * 7) {
    const d = Math.floor(seconds / 86400);
    return `${d} ${d === 1 ? "day" : "days"} ago`;
  }
  if (seconds < 86400 * 30) {
    const w = Math.floor(seconds / (86400 * 7));
    return `${w} ${w === 1 ? "week" : "weeks"} ago`;
  }
  const mo = Math.floor(seconds / (86400 * 30));
  return `${mo} ${mo === 1 ? "month" : "months"} ago`;
}
