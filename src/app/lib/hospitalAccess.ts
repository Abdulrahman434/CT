import { ACTIVE_HOSPITAL_KEY, type HospitalCoreConfig } from "../components/ThemeContext";

/* ═══════════════════════════════════════════════════════════════════════════
 * HOSPITAL ACCESS — derived sign-in codes + the persisted hospital choice
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Access codes are DERIVED from the config, never stored:
 *
 *     <city initial><INFIX><short-code initial>
 *
 * e.g. Dr. Soliman Fakeeh Hospital (Jeddah, DSFH) → "J2100D".
 *
 * Only those two initials vary, so two hospitals that share a city initial AND
 * a short-code initial derive the same code. `findAccessCodeConflicts` detects
 * that at config save time; the admin then supplies `accessCodeOverride`, which
 * takes precedence over the derived value everywhere.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const ACCESS_CODE_INFIX = "2100";

/** localStorage key holding the hospital the user picked on first launch. */
export const SELECTED_HOSPITAL_KEY = "careinn-selected-hospital-id";

/** Fired after the stored selection changes, so open screens can re-read it. */
export const SELECTED_HOSPITAL_EVENT = "selected-hospital-changed";

/**
 * First A–Z letter across the candidates, uppercased. Falls through so configs
 * with a non-Latin short name (e.g. KAUH's "شفاء") still derive a usable code
 * from the hospital name instead of emitting an unreachable character.
 */
function firstLatinLetter(...candidates: (string | undefined)[]): string {
  for (const candidate of candidates) {
    const match = (candidate || "").match(/[A-Za-z]/);
    if (match) return match[0].toUpperCase();
  }
  return "";
}

/** The code implied by the config's city + short code. "" if underivable. */
export function deriveAccessCode(config: Partial<HospitalCoreConfig>): string {
  const city = firstLatinLetter(config.location, config.country);
  const short = firstLatinLetter(config.hospitalShortName, config.hospitalName);
  if (!city || !short) return "";
  return `${city}${ACCESS_CODE_INFIX}${short}`;
}

/** The code actually accepted at sign-in — the manual override wins if set. */
export function getAccessCode(config: Partial<HospitalCoreConfig>): string {
  const override = (config.accessCodeOverride || "").trim();
  return override ? override.toUpperCase() : deriveAccessCode(config);
}

/** Case- and whitespace-insensitive comparison of user input to a config's code. */
export function accessCodeMatches(input: string, config: Partial<HospitalCoreConfig>): boolean {
  const code = getAccessCode(config);
  return code !== "" && input.trim().toUpperCase() === code;
}

/**
 * Other configs that would answer to the same code as `candidate`. Compares
 * effective codes, so an override on either side resolves the clash.
 */
export function findAccessCodeConflicts(
  candidate: Partial<HospitalCoreConfig>,
  all: HospitalCoreConfig[]
): HospitalCoreConfig[] {
  const code = getAccessCode(candidate);
  if (!code) return [];
  return all.filter((other) => other.id && other.id !== candidate.id && getAccessCode(other) === code);
}

/* ── Persisted hospital selection ───────────────────────────────────────── */

export function getSelectedHospitalId(): string | null {
  try {
    return localStorage.getItem(SELECTED_HOSPITAL_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * Persist the chosen hospital. Also mirrors it into ACTIVE_HOSPITAL_KEY so the
 * ThemeProvider — which mounts only after sign-in — comes up already branded.
 */
export function setSelectedHospitalId(id: string): void {
  try {
    localStorage.setItem(SELECTED_HOSPITAL_KEY, id);
    localStorage.setItem(ACTIVE_HOSPITAL_KEY, id);
  } catch (e) {
    console.error("[hospitalAccess] Could not persist hospital selection:", e);
  }
  window.dispatchEvent(new Event(SELECTED_HOSPITAL_EVENT));
  window.dispatchEvent(new Event("hospital-changed"));
}

/** Drop the selection so the next load returns to the Hospital Selection screen. */
export function clearSelectedHospitalId(): void {
  try {
    localStorage.removeItem(SELECTED_HOSPITAL_KEY);
  } catch (e) {
    console.error("[hospitalAccess] Could not clear hospital selection:", e);
  }
  window.dispatchEvent(new Event(SELECTED_HOSPITAL_EVENT));
}
