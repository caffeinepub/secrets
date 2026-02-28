export interface RichPostData {
  imageUrl: string; // blob direct URL or empty string
  moodEmoji: string; // e.g. "🔥" or ""
  bgColor: string; // e.g. "rose" | "violet" | "amber" | "cyan" | "emerald" | "" (default)
  fontStyle: string; // "normal" | "display"
}

const PREFIX = "secret_rich_";

export function saveRichPost(id: bigint, data: RichPostData): void {
  try {
    localStorage.setItem(PREFIX + id.toString(), JSON.stringify(data));
  } catch {
    // Ignore storage errors (e.g. private browsing quota)
  }
}

export function getRichPost(id: bigint): RichPostData | null {
  try {
    const raw = localStorage.getItem(PREFIX + id.toString());
    if (!raw) return null;
    return JSON.parse(raw) as RichPostData;
  } catch {
    return null;
  }
}
