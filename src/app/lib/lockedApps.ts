import { useState, useEffect } from "react";

const STORAGE_KEY = "careinn-locked-apps";

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch { return new Set(); }
}

function save(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

type Listener = (ids: Set<string>) => void;
let lockedIds = load();
const listeners = new Set<Listener>();

function notify() {
  const currentSet = new Set(lockedIds);
  listeners.forEach(l => l(currentSet));
}

export const lockedAppsStore = {
  isLocked: (id: string) => lockedIds.has(id),

  lock: (id: string) => {
    lockedIds.add(id);
    save(lockedIds);
    notify();
  },

  unlock: (id: string) => {
    lockedIds.delete(id);
    save(lockedIds);
    notify();
  },

  toggle: (id: string) => {
    if (lockedIds.has(id)) {
      lockedAppsStore.unlock(id);
    } else {
      lockedAppsStore.lock(id);
    }
  },

  subscribe: (l: Listener) => {
    listeners.add(l);
    return () => { listeners.delete(l); };
  },
};

/** Reactive hook — re-renders when any app is locked/unlocked */
export function useLockedApps(): Set<string> {
  const [ids, setIds] = useState<Set<string>>(new Set(lockedIds));
  useEffect(() => lockedAppsStore.subscribe(setIds), []);
  return ids;
}
