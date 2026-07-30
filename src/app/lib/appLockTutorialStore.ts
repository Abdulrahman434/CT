const STORAGE_KEY = "careinn-has-seen-app-lock-tutorial";

export function hasSeenAppLockTutorial(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setHasSeenAppLockTutorial(seen: boolean = true): void {
  try {
    localStorage.setItem(STORAGE_KEY, seen ? "true" : "false");
  } catch {
    /* storage full/unavailable - non-fatal */
  }
}

export function resetAppLockTutorial(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* non-fatal */
  }
}
