import { useState, useEffect } from "react";

let _isOnline = navigator.onLine;
type Listener = (online: boolean) => void;
const listeners = new Set<Listener>();

function notify(online: boolean) {
  if (online === _isOnline) return;
  _isOnline = online;
  listeners.forEach((l) => {
    try { l(online); } catch (e) { console.warn("[networkStatus] listener failed:", e); }
  });
}

if (typeof window !== "undefined") {
  window.addEventListener("online",  () => notify(true));
  window.addEventListener("offline", () => notify(false));
}

export function isOnline(): boolean {
  return _isOnline;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function useNetworkStatus(): boolean {
  const [online, setOnline] = useState(_isOnline);
  useEffect(() => subscribe(setOnline), []);
  return online;
}
