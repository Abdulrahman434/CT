import { isAndroidApp } from "../utils/androidBridge";
import { rewriteImageUrl } from "./apiConfig";

const cache = new Map<string, string>();

export async function proxyImageUrl(url: string): Promise<string> {
  if (!url) return "";

  // Already a data URL or relative path — use as-is
  if (url.startsWith("data:") || url.startsWith("/") ||
      url.startsWith("blob:")) return url;

  // Fix protocol + append apikey FIRST so everything downstream is consistent
  const rewritten = rewriteImageUrl(url);

  // Return from cache if already proxied
  if (cache.has(url)) return cache.get(url)!;

  // Already https — safe everywhere, use directly
  if (rewritten.startsWith("https://")) {
    cache.set(url, rewritten);
    return rewritten;
  }

  // http:// — Android WebView handles it via the native base64 bridge
  if (isAndroidApp()) {
    try {
      const base64 = (window as any).AndroidSystem
        ?.fetchImageAsBase64?.(rewritten);
      if (base64 && base64.startsWith("data:")) {
        cache.set(url, base64);
        return base64;
      }
    } catch {}
    // Bridge failed — return rewritten URL as fallback
    cache.set(url, rewritten);
    return rewritten;
  }

  // Browser + http:// → mixed content; let caller decide what to render
  return "";
}

export function clearImageCache(): void {
  cache.clear();
}
