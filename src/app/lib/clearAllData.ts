import { isAndroidApp } from "../utils/androidBridge";
import { nurseActions } from "../components/NurseDataStore";

/**
 * Performs a full data wipe of all stored kiosk data, then 
 * reloads the page. On Android, also clears the native WebView 
 * cache, cookies, and app data before reloading.
 *
 * This function does not return — the page reloads.
 */
export async function clearAllDataAndReload(): Promise<void> {
  // 1. Clear all localStorage keys
  localStorage.clear();

  // 1.1 Clear patient overrides
  nurseActions.clearPatientOverrides();

  // 2. Clear sessionStorage
  sessionStorage.clear();

  // 3. Clear IndexedDB databases
  try {
    const dbs = await indexedDB.databases();
    await Promise.all(
      dbs.map(db => {
        return new Promise<void>((resolve) => {
          if (!db.name) { resolve(); return; }
          const req = indexedDB.deleteDatabase(db.name);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();  // ignore errors
          req.onblocked = () => resolve();
        });
      })
    );
  } catch (e) {
    // indexedDB.databases() not supported in all environments
    console.warn("IndexedDB clear skipped:", e);
  }

  // 4. Clear Cache Storage (service worker caches)
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
  } catch (e) {
    console.warn("Cache Storage clear skipped:", e);
  }

  // 5. Clear cookies (website domain)
  try {
    document.cookie.split(";").forEach(cookie => {
      const name = cookie.split("=")[0].trim();
      // Expire all cookies for current domain
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  } catch (e) {
    console.warn("Cookie clear skipped:", e);
  }

  // 6. On Android — call native clear which handles WebView cache,
  //    Android cookies, and app data. The native method also 
  //    triggers the reload, so we return early.
  if (isAndroidApp() && window.AndroidSystem?.clearAllDataAndReload) {
    window.AndroidSystem.clearAllDataAndReload();
    return;  // Android side handles the reload
  }

  // 7. Reload the page (browser fallback)
  // Use location.replace so there's no back entry
  window.location.replace(window.location.href);
}
