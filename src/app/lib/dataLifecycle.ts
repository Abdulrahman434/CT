import { fetchDeviceLocation } from "./hospitalApi";
import { clearEverything, clearUserData } from "./onboardingStore";

/* ═══════════════════════════════════════════════════════════════════════════
 * Data-lifecycle enforcement
 *
 *   Admission watcher — polls the device's admit reference every 5 min; any
 *     change (new admission, discharge, empty bed) triggers a full reset back
 *     to first-run onboarding.
 *   Periodic policies — "daily" / "24h-idle" clear User data only, keeping
 *     Setup. Policy "discharge" relies solely on the admission watcher.
 * ═══════════════════════════════════════════════════════════════════════════ */

const ADMISSION_CHECK_MS = 5 * 60 * 1000;
const LIFECYCLE_CHECK_MS = 10 * 60 * 1000;
const IDLE_THRESHOLD_MS = 24 * 60 * 60 * 1000;
const DAILY_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export function trackInteraction(): void {
  localStorage.setItem("careinn-last-interaction-at", String(Date.now()));
}

/** Call once at app root. Returns a cleanup function.
 *  onForceOnboarding receives the NEW admission ref so the app can bind the
 *  fresh onboarding session to it. */
export function startDataLifecycleWatchers(
  serial: string,
  onForceOnboarding: (newAdmitRef: string | null) => void
): () => void {
  let lastWrite = 0;
  const onActivity = () => {
    const now = Date.now();
    if (now - lastWrite > 60_000) { lastWrite = now; trackInteraction(); }
  };
  window.addEventListener("pointerdown", onActivity);
  window.addEventListener("keydown", onActivity);

  const checkAdmission = async () => {
    const loc = await fetchDeviceLocation(serial);
    // Network/API failure ≠ discharge — never wipe on a failed fetch.
    // A genuinely empty bed still returns a location with admit_data "".
    if (!loc) return;
    const currentRef = loc.admit_data || null;
    const savedRef = localStorage.getItem("careinn-onboarding-admit-ref");
    const complete = localStorage.getItem("careinn-onboarding-complete") === "true";
    // Only a COMPLETED onboarding is bound to a ref; while the wizard is
    // still open there is nothing to reset (and resetting would restart it
    // every poll). Any ref change — including discharge — resets fully.
    if (complete && (savedRef ?? "") !== (currentRef ?? "")) {
      clearEverything();
      onForceOnboarding(currentRef);
    }
  };

  // Check immediately on boot (catches an admission change that happened
  // while the device was off), then poll.
  checkAdmission();
  const admissionInterval = setInterval(checkAdmission, ADMISSION_CHECK_MS);

  const lifecycleInterval = setInterval(() => {
    const policy = localStorage.getItem("careinn-data-clear-policy");
    const now = Date.now();

    if (policy === "24h-idle") {
      const last = Number(localStorage.getItem("careinn-last-interaction-at") ?? now);
      if (now - last >= IDLE_THRESHOLD_MS) clearUserData();
    }
    if (policy === "daily") {
      const lastClear = Number(localStorage.getItem("careinn-last-scheduled-clear") ?? 0);
      if (now - lastClear >= DAILY_THRESHOLD_MS) {
        clearUserData();
        localStorage.setItem("careinn-last-scheduled-clear", String(now));
      }
    }
    // policy === "discharge" → intentionally no periodic action
  }, LIFECYCLE_CHECK_MS);

  return () => {
    window.removeEventListener("pointerdown", onActivity);
    window.removeEventListener("keydown", onActivity);
    clearInterval(admissionInterval);
    clearInterval(lifecycleInterval);
  };
}
