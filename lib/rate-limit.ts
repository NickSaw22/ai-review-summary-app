type RateLimitResult = { ok: boolean; retryAfter?: number };

const WINDOW_MS_DEFAULT = 60_000; // 1 minute
const MAX_REQUESTS_DEFAULT = 10; // per key per window

// In-memory store for request timestamps per key (e.g., IP + route)
const requestStore: Map<string, number[]> = new Map();

export function rateLimit(
  key: string,
  max: number = MAX_REQUESTS_DEFAULT,
  windowMs: number = WINDOW_MS_DEFAULT
): RateLimitResult {
  const now = Date.now();
  const timestamps = requestStore.get(key) ?? [];

  // Keep only timestamps within window
  const recent = timestamps.filter((ts) => now - ts < windowMs);
  recent.push(now);
  requestStore.set(key, recent);

  if (recent.length > max) {
    // Oldest within window determines retry time
    const oldest = recent[0];
    const retryMs = windowMs - (now - oldest);
    const retryAfterSeconds = Math.max(0, Math.ceil(retryMs / 1000));
    return { ok: false, retryAfter: retryAfterSeconds };
  }

  return { ok: true };
}

export function getClientKeyFromRequest(request: Request): string {
  // Prefer x-forwarded-for; fallback to remote address if available
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return ip;
}

export function getRateLimitStats(): Array<{ key: string; count: number; timestamps: number[] }> {
  const stats: Array<{ key: string; count: number; timestamps: number[] }> = [];
  for (const [key, timestamps] of requestStore.entries()) {
    stats.push({ key, count: timestamps.length, timestamps });
  }
  // sort by count desc
  return stats.sort((a, b) => b.count - a.count);
}

export function resetRateLimit(key?: string) {
  if (key) {
    requestStore.delete(key);
    return;
  }
  requestStore.clear();
}
