import { useEffect } from "react";

  const NFC_STORAGE_KEY = "careinn-nfc-cards";

  export interface RegisteredNfcCards {
    patientCardUid: string | null;  // replaces 043F1BFA577080
    nurseCardUid:   string | null;  // replaces 045D260A881090
  }

  const HARDCODED_PATIENT_UID = "043F1BFA577080";
  const HARDCODED_NURSE_UID   = "045D260A881090";

  export function getRegisteredCards(): RegisteredNfcCards {
    try {
      const raw = localStorage.getItem(NFC_STORAGE_KEY);
      if (!raw) return { patientCardUid: null, nurseCardUid: null };
      return JSON.parse(raw);
    } catch {
      return { patientCardUid: null, nurseCardUid: null };
    }
  }

  export function saveRegisteredCards(
    cards: RegisteredNfcCards
  ): void {
    localStorage.setItem(NFC_STORAGE_KEY, JSON.stringify(cards));
    // Notify App.tsx to refresh NFC handlers
    window.dispatchEvent(new CustomEvent("nfc-cards-updated",
      { detail: cards }));
  }

  export function clearRegisteredCards(): void {
    localStorage.removeItem(NFC_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("nfc-cards-updated",
      { detail: { patientCardUid: null, nurseCardUid: null }}));
  }

  /**
   * Get the effective patient card UID.
   * Returns registered card if set, otherwise hardcoded fallback.
   */
  export function getPatientCardUid(): string {
    return getRegisteredCards().patientCardUid
        ?? HARDCODED_PATIENT_UID;
  }

  /**
   * Get the effective nurse card UID.
   * Returns registered card if set, otherwise hardcoded fallback.
   */
  export function getNurseCardUid(): string {
    return getRegisteredCards().nurseCardUid
        ?? HARDCODED_NURSE_UID;
  }

  export function getAuthorizedCards(): Record<string, {
    name: string;
    password: string;
    route: string;
  }> {
    const patientUid = getPatientCardUid();
    return {
      [patientUid]: {
        name:     "Demo Patient",
        password: "Dallah",
        route:    "/home",
      },
    };
  }

  // Keep backward compat — computed once at module load as fallback
  export const AUTHORIZED_CARDS = getAuthorizedCards();

/**
 * Detects whether window.AndroidNFC exists (running inside kiosk app).
 */
export const isNfcSupported = (): boolean => {
  return typeof window !== "undefined" && !!window.AndroidNFC;
};

/**
 * Custom hook to subscribe to the 'nfc-card-tap' window event.
 * @param callback - Function to execute when a tag is read.
 */
export const useNfcTap = (callback: (uid: string) => void) => {
  useEffect(() => {
    const handleEvent = (event: any) => {
      // The Android bridge should dispatch a CustomEvent named 'nfc-card-tap'
      // with the UID in event.detail
      const uid = event.detail;
      if (uid) {
        callback(uid);
      }
    };

    window.addEventListener("nfc-card-tap", handleEvent);

    return () => {
      window.removeEventListener("nfc-card-tap", handleEvent);
    };
  }, [callback]);
};
