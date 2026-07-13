/**
 * Detect TV set-top box or remote-controlled device.
 * Used to apply TV-specific behavior (focus rings, no hover, etc.)
 */

export function isTvDevice(): boolean {
  if (typeof window === "undefined") return false;

  // If not running in Android wrapper, it's a browser (laptop/desktop) — never a TV STB kiosk
  if (typeof (window as any).AndroidSystem === "undefined") {
    return false;
  }

  const ua = navigator.userAgent.toLowerCase();

  // Common TV/STB indicators in user agent
  if (ua.includes("tv")       ||
      ua.includes("set-top")  ||
      ua.includes("stb")      ||
      ua.includes("firetv")   ||
      ua.includes("fire tv")  ||
      ua.includes("android tv") ||
      ua.includes("googletv") ||
      ua.includes("smarttv")  ||
      ua.includes("crkey")) {  // Chromecast
    return true;
  }

  // Set-top boxes often have large screen but small innerWidth
  // because DPR=2 halves the reported viewport
  if (typeof screen !== "undefined" &&
      screen.width >= 1280 &&
      window.innerWidth < screen.width * 0.7) {
    return true;
  }

  return false;
}

export function isRemoteControlDevice(): boolean {
  if (typeof window === "undefined") return false;
  // No touch = likely remote control navigation
  return (
    !window.matchMedia("(pointer: coarse)").matches &&
    (navigator.maxTouchPoints === 0)
  );
}

export function getDeviceType(): "kiosk" | "tv" | "browser" {
  if (typeof window !== "undefined" && typeof (window as any).AndroidSystem !== "undefined") {
    return isTvDevice() ? "tv" : "kiosk";
  }
  return "browser";
}
