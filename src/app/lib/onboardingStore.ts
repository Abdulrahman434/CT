import { clearAccount } from "./accountAuth";
import { lockedAppsStore } from "./lockedApps";

/* ═══════════════════════════════════════════════════════════════════════════
 * Onboarding preference store — three-tier localStorage model
 *
 *   DEVICE  — hospital/device configuration. NEVER cleared by any code path
 *             in this module. Survives every patient forever.
 *   SETUP   — the answers collected by the first-run onboarding wizard,
 *             including the PIN/app-lock store. Survives "Clear my data";
 *             wiped by "Clear everything".
 *   USER    — everything else (games, notes, seen alerts, call history…).
 *             Wiped by both clear functions.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Device-level config keys — do NOT add patient/session keys here. */
const DEVICE_KEYS = new Set<string>([
  "active-hospital-id",
  "cms-mode",
  "hospital-configs",       // saved hospital theme configs (ThemeContext)
  "hbs-active-config-id",   // CMS active config (useCmsContent)
  "careinn-api-config",     // server IP + API key (apiConfig)
  "hbs-auth-v1",            // device login (AuthContext / PasswordGate)
  "careinn-nfc-cards",      // nurse-registered NFC card map (utils/nfc)
  "careinn-layout-mode",    // staff-chosen layout (1/2/3)
  "careinn-layout2-theme",  // Layout 2 theme overrides (ThemeContext)
  "careinn-brand-logo",     // CiHomescreen brand assets
  "careinn-bg-image",
  "careinn-last-cloud-contact",
]);

/** PIN + app-lock storage (lib/accountAuth + lib/lockedApps).
 *  Part of SETUP: preserved by clearUserData(), removed by clearEverything(). */
const PIN_LOCK_KEYS = ["careinn-account", "careinn-locked-apps"] as const;

const SETUP_KEYS = [
  "careinn-onboarding-complete",
  "careinn-onboarding-admit-ref",
  "careinn-locale",
  "careinn-display-name",
  "careinn-display-name-ar",
  "careinn-display-name-mode",
  "careinn-prayer-alarm",
  "careinn-theme-mode",
  "careinn-data-clear-policy",
  "careinn-notification-sound",
  "careinn-screensaver-timeout",
  "careinn-consent-tour-seen",
  "careinn-consent-terms-agreed",
  "careinn-has-seen-app-lock-tutorial",
  // Existing persistence keys behind the wizard's answers — the wizard applies
  // choices through the real setters (ThemeContext, tour), which write these.
  "active-locale",
  "hbs-dark-mode",
  "prayer-alarm",
  "hbs-tour-seen",
  ...PIN_LOCK_KEYS,
] as const;

/** Data-lifecycle bookkeeping — kept by clearUserData() so the daily /
 *  24h-idle policies don't immediately re-trigger after a clear. */
const LIFECYCLE_KEYS = [
  "careinn-last-interaction-at",
  "careinn-last-scheduled-clear",
] as const;

/** Wipes everything except Device config and Setup answers. */
export function clearUserData(): void {
  const keep = new Set<string>([...DEVICE_KEYS, ...SETUP_KEYS, ...LIFECYCLE_KEYS]);
  for (const key of Object.keys(localStorage)) {
    if (!keep.has(key)) localStorage.removeItem(key);
  }
  localStorage.setItem("careinn-last-interaction-at", String(Date.now()));
}

/** Wipes User data AND Setup — literally everything except DEVICE_KEYS.
 *  After this the app must land back on the first onboarding screen with
 *  no PIN, no name, no theme choice: a factory-fresh session. */
export function clearEverything(): void {
  clearUserData();
  for (const key of SETUP_KEYS) localStorage.removeItem(key);
  // Reset the PIN/lock stores through their real reset functions so their
  // in-memory state and listeners update too (not just the raw keys).
  clearAccount();
  lockedAppsStore.reset();
  window.dispatchEvent(new CustomEvent("display-name-changed"));
}

export function isOnboardingComplete(currentAdmitRef: string | null): boolean {
  const complete = localStorage.getItem("careinn-onboarding-complete") === "true";
  const savedRef = localStorage.getItem("careinn-onboarding-admit-ref");
  return complete && savedRef === (currentAdmitRef ?? "");
}

export function markOnboardingComplete(admitRef: string | null): void {
  localStorage.setItem("careinn-onboarding-complete", "true");
  localStorage.setItem("careinn-onboarding-admit-ref", admitRef ?? "");
}
