import { useState, useEffect } from "react";

const STORAGE_KEY = "careinn-api-config";

const CLOUD_HOST = "control.careinn.com";
const CLOUD_KEY  = "2345fcba-1633-46c9-a27e-ed0ca9ee17e9";
const LOCAL_KEY  = "20b91694-7ea1-4a44-91a6-2878664428b3";

export const BURJEEL_SECONDARY_OPTION: ApiConfigData = {
  serverIp: "http://10.11.16.15/api",
  apiKey: "3a68339d-e45f-478e-85a0-811f6b54b457",
};

export function getSecondaryOption(hospitalId?: string): ApiConfigData {
  let hid = hospitalId;
  if (!hid) {
    try {
      const savedTheme = localStorage.getItem("careinn-layout2-theme");
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme);
        hid = typeof parsed === "string" ? parsed : parsed.id;
      }
    } catch {}
  }
  if (hid === "burjeel") {
    return BURJEEL_SECONDARY_OPTION;
  }
  return {
    serverIp: "10.32.0.86",
    apiKey: "20b91694-7ea1-4a44-91a6-2878664428b3",
  };
}

export const SECONDARY_OPTION: ApiConfigData = {
  get serverIp() {
    return getSecondaryOption().serverIp;
  },
  get apiKey() {
    return getSecondaryOption().apiKey;
  },
} as ApiConfigData;

export interface ApiConfigData {
  serverIp: string;   // can be IP, domain, or full URL with protocol
  apiKey: string;
}

const DEFAULTS: ApiConfigData = {
  serverIp: 'https://control.careinn.com/api',
  apiKey: '2345fcba-1633-46c9-a27e-ed0ca9ee17e9',
};

export function apiKeyForUrl(u: string): string {
  if (!u) return CLOUD_KEY;
  if (u.includes("10.11.16.15")) return BURJEEL_SECONDARY_OPTION.apiKey;
  return u.includes(CLOUD_HOST) ? CLOUD_KEY : LOCAL_KEY;
}

/** Append the host-correct apikey. No-op if one is already present. */
export function withApiKey(u: string): string {
  if (!u) return u;
  if (u.includes("apikey=")) return u;
  const sep = u.includes("?") ? "&" : "?";
  return `${u}${sep}apikey=${apiKeyForUrl(u)}`;
}

export function getApiConfig(): ApiConfigData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const saved = JSON.parse(raw);
    let apiKey = saved.apiKey?.trim();
    if (apiKey === "efc9bcbf-6951-436a-8694-c13cc6f30913") {
      apiKey = DEFAULTS.apiKey;
      // Write it back to localStorage so it stays updated
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        serverIp: saved.serverIp?.trim() || DEFAULTS.serverIp,
        apiKey: DEFAULTS.apiKey,
      }));
    }
    return {
      serverIp: saved.serverIp?.trim() || DEFAULTS.serverIp,
      apiKey: apiKey || DEFAULTS.apiKey,
    };
  } catch { return { ...DEFAULTS }; }
}

export function isCustomConfig(): boolean {
  const cfg = getApiConfig();
  return cfg.serverIp !== DEFAULTS.serverIp ||
    cfg.apiKey !== DEFAULTS.apiKey;
}

// ── URL builder ────────────────────────────────────────────────────────────

export function resolveBaseUrl(ipOrUrl: string): string {
  if (!ipOrUrl) return DEFAULTS.serverIp;
  if (ipOrUrl.startsWith("http://") || ipOrUrl.startsWith("https://")) {
    return ipOrUrl.endsWith("/") ? ipOrUrl.slice(0, -1) : ipOrUrl;
  }
  return `http://${ipOrUrl}/api`;
}

/**
 * Build a full authenticated URL for any API path.
 * Reads config fresh every call — server changes take effect immediately.
 *
 * Examples:
 *   apiUrl("/hospital/group/")
 *   apiUrl("/resource/background/wallpaper/?group=1")
 *   apiUrl("/hl7/httpreceiver/?reference_id=38")
 */
export function apiUrl(path: string): string {
  const { serverIp, apiKey } = getApiConfig();
  const base = resolveBaseUrl(serverIp);
  const p = path.startsWith("/") ? path : `/${path}`;
  const sep = p.includes("?") ? "&" : "?";
  return `${base}${p}${sep}apikey=${apiKey}`;
}

/**
 * Rewrite an image URL from the API response so it's safe to display:
 *   1. Force protocol to match the configured server (http ↔ https).
 *   2. Append `apikey=` when missing so authenticated CDN URLs work directly.
 *
 * Callers must pre-filter `data:`, `blob:`, and relative URLs — this helper
 * only handles absolute http(s) URLs.
 */
export function rewriteImageUrl(imageUrl: string): string {
  if (!imageUrl) return "";

  const { serverIp, apiKey } = getApiConfig();
  const base = resolveBaseUrl(serverIp);
  const isHttpsServer = base.startsWith("https://");

  // Step 1 — fix protocol to match server config
  let url = imageUrl;
  if (isHttpsServer && url.startsWith("http://")) {
    url = url.replace("http://", "https://");
  } else if (!isHttpsServer && url.startsWith("https://")) {
    // On-prem http server — keep http
    url = url.replace("https://", "http://");
  }

  // Step 2 — append apikey if missing
  if (!url.includes("apikey=")) {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}apikey=${apiKey}`;
  }

  return url;
}

// ── Write ──────────────────────────────────────────────────────────────────

export function saveApiConfig(cfg: ApiConfigData): void {
  if (!cfg.serverIp?.trim() || !cfg.apiKey?.trim()) return;

  const previous = getApiConfig();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    serverIp: cfg.serverIp.trim(),
    apiKey: cfg.apiKey.trim(),
  }));

  // Clear image cache when server changes
  /*if (cfg.serverIp !== previous.serverIp) {
    try {
      const { clearImageCache } = require("./imageProxy");
      clearImageCache();
    } catch { }
  }*/
  if (cfg.serverIp !== previous.serverIp) {
    window.dispatchEvent(new CustomEvent("careinn-clear-image-cache"));
  }

  // Notify Android bridge
  try {
    (window as any).AndroidSystem?.updateApiConfig?.(
      cfg.serverIp.trim(), cfg.apiKey.trim());
  } catch { }

  // Notify all React consumers
  window.dispatchEvent(new CustomEvent(
    "api-config-changed", { detail: getApiConfig() }));
}

export function resetApiConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
  try {
    (window as any).AndroidSystem?.resetApiConfig?.();
  } catch { }
  window.dispatchEvent(new CustomEvent(
    "api-config-changed", { detail: { ...DEFAULTS } }));
}

// ── React hook ─────────────────────────────────────────────────────────────

export function useApiConfig(): ApiConfigData {
  const [cfg, setCfg] = useState<ApiConfigData>(getApiConfig);
  useEffect(() => {
    const handler = (e: Event) => {
      setCfg((e as CustomEvent<ApiConfigData>).detail);
    };
    window.addEventListener("api-config-changed", handler);
    return () => window.removeEventListener("api-config-changed", handler);
  }, []);
  return cfg;
}
