import { useState, useEffect } from "react";

type Listener = (state: GuestState) => void;

export interface GuestState {
  /** True only when the patient set a PIN, the screensaver came back,
   *  and someone tapped "Continue as Guest" from the lock screen. */
  isGuest: boolean;
  /** Within guest mode, has the user since unlocked CareMe with the PIN? */
  careMeUnlocked: boolean;
}

let state: GuestState = { isGuest: false, careMeUnlocked: false };
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l({ ...state }));
}

export const guestModeStore = {
  get: () => state,
  subscribe: (l: Listener) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  enterGuestMode() {
    state = { isGuest: true, careMeUnlocked: false };
    notify();
  },
  exitGuestMode() {
    state = { isGuest: false, careMeUnlocked: false };
    notify();
  },
  unlockCareMe() {
    if (!state.isGuest) return;
    state = { ...state, careMeUnlocked: true };
    notify();
  },
  relockCareMe() {
    if (!state.isGuest) return;
    state = { ...state, careMeUnlocked: false };
    notify();
  },
};

export function useGuestMode(): GuestState {
  const [s, setS] = useState<GuestState>(guestModeStore.get());
  useEffect(() => guestModeStore.subscribe(setS), []);
  return s;
}
