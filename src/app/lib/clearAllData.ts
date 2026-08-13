import { isAndroidApp } from "../utils/androidBridge";
import { nurseActions } from "../components/NurseDataStore";
import { clearUserData } from "./onboardingStore";
import { getPackagesCache } from "./hospitalApi";
import { clearImageCache } from "./imageProxy";

/**
 * Performs a partial data wipe, clearing cookies, sessionStorage, caches,
 * indexedDB, and non-setup local storage keys (preserving user PIN and preferences).
 * Reloads the page afterwards.
 */
export async function clearUserDataAndReload(): Promise<void> {
  // 1. Clear non-setup localStorage keys (keep device config and onboarding answers)
  clearUserData();

  // 1.5 Free the in-memory proxied-image cache (base64 data-URIs of the
  //     previous patient's posters/photos) so it doesn't carry over.
  clearImageCache();

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
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  } catch (e) {
    console.warn("Cookie clear skipped:", e);
  }

  // 6. Reload the page (browser fallback)
  window.location.replace(window.location.href);
}

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

  // 1.2 Free the in-memory proxied-image cache (base64 data-URIs).
  clearImageCache();

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

  // 6. On Android — first wipe third-party patient apps (WhatsApp, etc.) so
  //    the next patient can't see the previous one's logins, then call native
  //    clear (WebView cache/cookies) which also triggers the reload.
  if (isAndroidApp()) {
    try {
      // Authoritative source: every app the server lists with a package
      // name (any type), so all configured patient apps get wiped — not
      // just the ones flagged "APK".
      const apiPkgs = getPackagesCache()
        .filter((p: any) => p.packageName)
        .map((p: any) => String(p.packageName).trim())
        .filter(Boolean);
      const known = [
        "com.whatsapp", "com.google.android.youtube", "com.android.chrome",
        "com.microsoft.teams", "com.google.android.apps.tachyon",
        "com.instagram.android", "com.facebook.katana", "com.twitter.android",
        "com.snapchat.android",
      ];
      const pkgs = Array.from(new Set([...apiPkgs, ...known]));
      window.AndroidSystem?.clearAppData?.(JSON.stringify(pkgs));
    } catch (e) {
      console.warn("clearAppData skipped:", e);
    }

    if (window.AndroidSystem?.clearAllDataAndReload) {
      window.AndroidSystem.clearAllDataAndReload();
      return;  // Android side handles the reload
    }
  }

  // 7. Reload the page (browser fallback)
  // Use location.replace so there's no back entry
  window.location.replace(window.location.href);
}
