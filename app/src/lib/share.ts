export type ShareResult = { ok: boolean; method: "share" | "clipboard" | "cancelled" | "failed" };

/**
 * Shares a URL via the native share sheet when available, falling back to the
 * Clipboard API, and finally to a manual textarea + execCommand("copy") trick —
 * the Clipboard API silently fails in some mobile WebViews, and previously that
 * meant the share button did nothing at all with zero feedback to the user.
 */
export async function shareLink(url: string, opts?: { title?: string; text?: string }): Promise<ShareResult> {
  if (typeof navigator !== "undefined" && (navigator as any).share) {
    try {
      await (navigator as any).share({ title: opts?.title, text: opts?.text, url });
      return { ok: true, method: "share" };
    } catch (err: any) {
      if (err?.name === "AbortError") return { ok: false, method: "cancelled" };
      // fall through to clipboard fallback below
    }
  }

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return { ok: true, method: "clipboard" };
    }
    throw new Error("Clipboard API unavailable");
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (copied) return { ok: true, method: "clipboard" };
    } catch {
      // no-op — genuinely nothing worked
    }
  }

  return { ok: false, method: "failed" };
}