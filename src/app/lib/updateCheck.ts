import { useState, useEffect } from "react";

const VERSION_URL = "/version.json";
const CHECK_INTERVAL_MS = 10 * 60 * 1000; // 10 min

let bootedVersion: string | null = null;

function isBundled(): boolean {
  return typeof window !== "undefined" && window.location.protocol === "file:";
}

async function fetchVersion(): Promise<string | null> {
  if (isBundled() || !navigator.onLine) return null;
  try {
    const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.version ?? null;
  } catch {
    return null;
  }
}

export function useUpdateAvailable(): { available: boolean; reload: () => void } {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const v = await fetchVersion();
      if (v && !cancelled) bootedVersion = v; // capture booted version once
    })();

    const check = async () => {
      const v = await fetchVersion();
      if (v && bootedVersion && v !== bootedVersion && !cancelled) {
        setAvailable(true);
      }
    };

    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return { available, reload: () => window.location.reload() };
}
