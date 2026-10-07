/**
 * Validates whether a given URL is a safe internal relative path.
 * Protects against:
 * - Protocol-relative URLs: //evil.com, ///evil.com
 * - Backslash bypasses: /\evil.com, /\\evil.com, \evil.com
 * - Encoded slash/backslash tricks: /%2f, /%5c, etc.
 * - Schemes: javascript:, data:, vbscript:, http:, https:
 * - Control characters / newlines
 */
export function isValidCallbackUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim();
  if (!trimmed) return false;

  // Must begin with a single forward slash, and NOT followed by / or \
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return false;
  }

  // Reject any backslashes (Windows path normalization can convert \ to / in some environments)
  if (trimmed.includes("\\")) {
    return false;
  }

  // Reject dangerous encoded characters (%5c is \, %00 is null byte)
  const lower = trimmed.toLowerCase();
  if (lower.includes("%5c") || lower.includes("%00") || lower.includes("\r") || lower.includes("\n")) {
    return false;
  }

  // Verify URL parsing with a private base origin preserves exact origin and relative pathname
  try {
    const parsed = new URL(trimmed, "https://elaris-safe-base.internal");
    if (parsed.origin !== "https://elaris-safe-base.internal") {
      return false;
    }
    if (!parsed.pathname.startsWith("/") || parsed.pathname.startsWith("//")) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
}

export function getSafeCallbackUrl(url: string | null | undefined, fallback: string = "/account"): string {
  if (isValidCallbackUrl(url)) {
    return url!.trim();
  }
  return fallback;
}
