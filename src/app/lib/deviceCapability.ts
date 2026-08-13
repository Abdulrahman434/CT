/**
 * Web-side mirror of the native DeviceCapability tier.
 *
 * "Aggressive memory mode" enables the web app's own low-RAM adaptations
 * (smaller imageProxy cache, reduced carousel preloading). It must agree
 * with the native decision so the whole app behaves as one tier.
 *
 * Source of truth, in order:
 *   1. Native bridge  window.AndroidSystem.isAggressiveMemoryMode()
 *      — authoritative; uses ActivityManager.isLowRamDevice() + totalMem.
 *   2. navigator.deviceMemory  (Chromium: approx GB, coarse) < 3
 *   3. Unknown → false (performance-first) so we NEVER degrade UX on a
 *      device we could not classify. NOTHING changes on high-end devices.
 *
 * Computed once and cached — the RAM tier cannot change at runtime.
 */

let cached: boolean | null = null;

export function isAggressiveMemoryMode(): boolean {
  if (cached !== null) return cached;

  let aggressive = false;
  try {
    const bridge = (window as any).AndroidSystem;
    if (bridge && typeof bridge.isAggressiveMemoryMode === "function") {
      aggressive = !!bridge.isAggressiveMemoryMode();
    } else {
      // Browser / no bridge: fall back to the Device Memory API when present.
      const dm = (navigator as any).deviceMemory;
      if (typeof dm === "number" && dm > 0) {
        aggressive = dm < 3; // < 3 GB class
      }
      // dm undefined → leave aggressive = false (performance-first).
    }
  } catch {
    aggressive = false;
  }

  cached = aggressive;
  return aggressive;
}

/** Total device RAM in MB if the native bridge can tell us, else 0. */
export function totalMemoryMb(): number {
  try {
    const bridge = (window as any).AndroidSystem;
    if (bridge && typeof bridge.getTotalMemoryMb === "function") {
      return Number(bridge.getTotalMemoryMb()) || 0;
    }
  } catch {}
  return 0;
}
