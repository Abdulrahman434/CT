import { clearImageCache } from "./imageProxy";

/**
 * Web-side response to native low-memory signals.
 *
 * The Android host fires a `memory-pressure` CustomEvent (from
 * MainActivity's watchdog / onTrimMemory) shortly BEFORE the OS would
 * otherwise kill the process. We react by dropping non-essential
 * in-memory caches — freeing RAM inside the WebView renderer — WITHOUT
 * touching the patient session, login, or the loaded page.
 *
 * Everything here is silent (no patient-visible UI). A small stat is kept
 * for the admin/settings panel only.
 */

export interface MemoryPressureDetail {
  reason?: string;
  availMb?: number;
  thresholdMb?: number;
  count?: number;
}

export interface MemoryStats {
  reclaims: number;      // times we've reclaimed this session
  lastAt: number | null; // epoch ms of the last reclaim
  lastAvailMb: number | null;
}

const stats: MemoryStats = { reclaims: 0, lastAt: null, lastAvailMb: null };
const listeners = new Set<(s: MemoryStats) => void>();
let installed = false;

export function getMemoryStats(): MemoryStats {
  return { ...stats };
}

export function subscribeMemoryStats(fn: (s: MemoryStats) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function reclaim(detail: MemoryPressureDetail): void {
  // Non-essential caches only. The patient session lives in React state +
  // localStorage and is deliberately left untouched.
  try { clearImageCache(); } catch {}

  stats.reclaims += 1;
  stats.lastAt = Date.now();
  stats.lastAvailMb =
    typeof detail.availMb === "number" && detail.availMb >= 0
      ? detail.availMb
      : null;

  if (typeof console !== "undefined") {
    console.info(
      `[memory] pressure reclaim #${stats.reclaims}` +
        (detail.reason ? ` (${detail.reason})` : "") +
        (stats.lastAvailMb !== null ? ` avail=${stats.lastAvailMb}MB` : "")
    );
  }

  listeners.forEach((fn) => {
    try { fn(getMemoryStats()); } catch {}
  });
}

/** Register the single global `memory-pressure` listener. Idempotent. */
export function installMemoryPressureHandler(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("memory-pressure", (e: Event) => {
    const detail = (e as CustomEvent<MemoryPressureDetail>).detail || {};
    reclaim(detail);
  });
}
