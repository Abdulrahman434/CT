import { useState, useEffect, useCallback, useRef } from "react";

const CLOUD_URL = "https://demo.careinn.com";
const CLOUD_PROBE_URL = "https://demo.careinn.com/ping.txt";
const LAST_CONTACT_KEY = "careinn-last-cloud-contact";
const PROBE_TIMEOUT_MS = 4000;
const REFRESH_AVAILABLE_MS = 30 * 60 * 1000; // 30 min reveal
const REFRESH_COOLDOWN_MS = 60 * 1000;       // 1 min hide after failed retry
const TICK_MS = 60 * 1000;

export type ConnState = "connected" | "stale" | "offline" | "bundled";

function isBundled(): boolean {
  return typeof window !== "undefined"
    && window.location.protocol === "file:";
}

export function getLastContact(): number | null {
  const raw = localStorage.getItem(LAST_CONTACT_KEY);
  return raw ? parseInt(raw, 10) : null;
}
function setLastContact(ts: number) {
  localStorage.setItem(LAST_CONTACT_KEY, String(ts));
}

export async function probeCloud(): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS);
  try {
    await fetch(`${CLOUD_PROBE_URL}?t=${Date.now()}`, {
      method: "GET", mode: "no-cors", cache: "no-store",
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    return true;
  } catch {
    clearTimeout(timer);
    return false;
  }
}

export function timeAgo(ts: number | null): string {
  if (!ts) return "";
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function useConnectionStatus() {
  const bundled = isBundled();
  const [online, setOnline] = useState<boolean>(
    () => (typeof navigator !== "undefined" ? navigator.onLine : true)
  );
  const [cloudReachable, setCloudReachable] = useState(!bundled);
  const [lastContact, setLastContactState] =
    useState<number | null>(getLastContact);
  const [refreshAvailable, setRefreshAvailable] = useState(bundled);
  const [cooldown, setCooldown] = useState(false);
  const [, tick] = useState(0);
  const probing = useRef(false);

  const runProbe = useCallback(async (): Promise<boolean> => {
    if (probing.current) return false;
    probing.current = true;
    const ok = await probeCloud();
    probing.current = false;
    setCloudReachable(ok);
    if (ok) {
      const now = Date.now();
      setLastContact(now);
      setLastContactState(now);
    }
    return ok;
  }, []);

  useEffect(() => {
    const goOnline  = () => { setOnline(true); if (!bundled) runProbe(); };
    const goOffline = () => { setOnline(false); setCloudReachable(false); };
    const androidNet = (e: Event) => {
      const d = (e as CustomEvent).detail;
      d?.online ? goOnline() : goOffline();
    };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    window.addEventListener("network-status", androidNet as EventListener);
    if (online && !bundled) runProbe();
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("network-status",
        androidNet as EventListener);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 30-min reveal (cloud states only; bundled shows it by default)
  useEffect(() => {
    if (bundled) return;
    const t = setInterval(() => setRefreshAvailable(true),
      REFRESH_AVAILABLE_MS);
    return () => clearInterval(t);
  }, [bundled]);

  // recompute "ago" text each minute
  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), TICK_MS);
    return () => clearInterval(t);
  }, []);

  const refresh = useCallback(async () => {
    if (bundled) {
      // try to go live; only switch if cloud is actually reachable
      const reachable = navigator.onLine && await probeCloud();
      if (reachable) {
        window.location.href = CLOUD_URL;   // jump to live app
        return;
      }
      // still offline → hide refresh for 60s (cooldown), stay bundled
      setRefreshAvailable(false);
      setCooldown(true);
      setTimeout(() => {
        setCooldown(false);
        setRefreshAvailable(true);
      }, REFRESH_COOLDOWN_MS);
      return;
    }
    // cloud states: re-probe + ask app to re-fetch
    setRefreshAvailable(false);
    await runProbe();
    window.dispatchEvent(new CustomEvent("careinn-manual-refresh"));
  }, [bundled, runProbe]);

  const state: ConnState = bundled
    ? "bundled"
    : !online        ? "offline"
    : cloudReachable ? "connected"
    : "stale";

  // refresh icon visibility:
  //  - bundled: show unless in cooldown
  //  - stale:   always (so user can retry)
  //  - connected: only after 30-min reveal
  //  - offline: never (nothing to reach)
  const showRefresh =
    state === "bundled"   ? (refreshAvailable && !cooldown)
    : state === "stale"   ? true
    : state === "connected" ? refreshAvailable
    : false;

  return { state, lastContact, showRefresh, refresh };
}
