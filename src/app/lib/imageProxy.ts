import { isAndroidApp } from "../utils/androidBridge";
import { rewriteImageUrl } from "./apiConfig";
import { isAggressiveMemoryMode } from "./deviceCapability";

/**
 * Adaptive LRU cache for proxied image URLs / base64 data-URIs.
 *
 * Previously an unbounded Map that stored the full base64 of every http://
 * image forever — the top multi-day growth vector on low-RAM kiosks. Now
 * bounded: a Map preserves insertion order, so the first key is the oldest;
 * on overflow we evict the eldest, and every read re-inserts (LRU touch).
 *
 * Cap adapts to the device tier: small + hard eviction on low-RAM devices,
 * larger on high-RAM devices where retaining more improves relist speed.
 * base64 data-URIs are large in-memory strings, so entry count is a good
 * proxy for memory here.
 */
const MAX_ENTRIES = isAggressiveMemoryMode() ? 40 : 200;

const cache = new Map<string, string>();

function cacheGet(key: string): string | undefined {
  const v = cache.get(key);
  if (v !== undefined) {
    // LRU touch: move to newest.
    cache.delete(key);
    cache.set(key, v);
  }
  return v;
}

function cacheSet(key: string, value: string): void {
  if (cache.has(key)) cache.delete(key);
  cache.set(key, value);
  while (cache.size > MAX_ENTRIES) {
    const eldest = cache.keys().next().value;
    if (eldest === undefined) break;
    cache.delete(eldest);
  }
}

export async function proxyImageUrl(url: string): Promise<string> {
  if (!url) return "";

  // Already a data URL or relative path — use as-is
  if (url.startsWith("data:") || url.startsWith("/") ||
      url.startsWith("blob:")) return url;

  // Fix protocol + append apikey FIRST so everything downstream is consistent
  const rewritten = rewriteImageUrl(url);

  // Return from cache if already proxied
  const hit = cacheGet(url);
  if (hit !== undefined) return hit;

  // Already https — safe everywhere, use directly
  if (rewritten.startsWith("https://")) {
    cacheSet(url, rewritten);
    return rewritten;
  }

  // http:// — Android WebView handles it via the native base64 bridge
  if (isAndroidApp()) {
    try {
      const base64 = (window as any).AndroidSystem
        ?.fetchImageAsBase64?.(rewritten);
      if (base64 && base64.startsWith("data:")) {
        cacheSet(url, base64);
        return base64;
      }
    } catch {}
    // Bridge failed — return rewritten URL as fallback
    cacheSet(url, rewritten);
    return rewritten;
  }

  // Browser + http:// → mixed content; let caller decide what to render
  return "";
}

export function clearImageCache(): void {
  cache.clear();
}
