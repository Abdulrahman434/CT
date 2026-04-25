import { Coordinates, CalculationMethod, PrayerTimes, Prayer } from "adhan";
import { format } from "date-fns";

/**
 * City coordinate map — keyed by city name.
 * To support a new hospital location, add an entry here.
 *
 * Default locations per hospital:
 *   Fakeeh (DSFH) → Jeddah
 *   Dallah        → Riyadh
 *   Care Medical  → Riyadh
 *   SLH           → Beirut
 *   Burjeel       → Abu Dhabi
 */
export const CITY_COORDS: Record<string, Coordinates> = {
  "Jeddah":    new Coordinates(21.5433, 39.1728),
  "Riyadh":    new Coordinates(24.7136, 46.6753),
  "Abu Dhabi": new Coordinates(24.4539, 54.3773),
  "Beirut":    new Coordinates(33.8938, 35.5018),
  "Dubai":     new Coordinates(25.2048, 55.2708),
};

/** Backward-compatibility alias — maps to Jeddah */
export const JeddahCoords = CITY_COORDS["Jeddah"];

/**
 * Resolve Coordinates from a city name string.
 * Falls back to Jeddah if city is not registered.
 */
export function getCoordsForCity(city: string): Coordinates {
  return CITY_COORDS[city] ?? CITY_COORDS["Jeddah"];
}

/**
 * Get prayer times for a given date and city.
 * Uses UmmAlQura calculation (Gulf standard).
 * Uses MuslimWorldLeague for Beirut (more accurate for Levant region).
 */
export function getPrayerTimes(date: Date = new Date(), city: string = "Jeddah") {
  const coords = getCoordsForCity(city);
  const params = city === "Beirut"
    ? CalculationMethod.MuslimWorldLeague()
    : CalculationMethod.UmmAlQura();
  return new PrayerTimes(coords, date, params);
}

/**
 * Get names mapping
 */
export const PRAYER_NAMES = {
  [Prayer.Fajr]:    "prayer.fajr",
  [Prayer.Dhuhr]:   "prayer.dhuhr",
  [Prayer.Asr]:     "prayer.asr",
  [Prayer.Maghrib]: "prayer.maghrib",
  [Prayer.Isha]:    "prayer.isha",
  [Prayer.None]:    "",
};

export const PRAYER_KEYS = [
  Prayer.Fajr,
  Prayer.Dhuhr,
  Prayer.Asr,
  Prayer.Maghrib,
  Prayer.Isha,
];

/**
 * Format prayer time as HH:mm
 */
export function formatPrayerTime(time: Date | null, locale: string = "en") {
  if (!time) return "--:--";
  return format(time, "HH:mm");
}

/**
 * Calculate countdown string (HH:mm:ss) to a target date
 */
export function getCountdown(now: Date, target: Date): string {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "00:00:00";

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Get relative time string (e.g., "12 mins ago" or "in 5 mins")
 */
export function getRelativeTimeString(now: Date, target: Date, locale: string = "en"): string {
  const diff = now.getTime() - target.getTime();
  const absDiff = Math.abs(diff);
  const totalMinutes = Math.floor(absDiff / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const isPast = diff > 0;

  if (locale === "ar") {
    if (totalMinutes === 0) return "الآن";
    if (isPast) {
      if (hours === 0) return `منذ ${minutes} دقيقة`;
      return `منذ ${hours} س و ${minutes} د`;
    } else {
      if (hours === 0) return `خلال ${minutes} دقيقة`;
      return `خلال ${hours} س و ${minutes} د`;
    }
  }

  if (locale === "ur") {
    if (totalMinutes === 0) return "ابھی";
    if (isPast) {
      if (hours === 0) return `${minutes} منٹ پہلے`;
      return `${hours} گھنٹے ${minutes} منٹ پہلے`;
    } else {
      if (hours === 0) return `${minutes} منٹ میں`;
      return `${hours} گھنٹے ${minutes} منٹ میں`;
    }
  }

  if (totalMinutes === 0) return "Just now";
  if (isPast) {
    if (hours === 0) return `${minutes}m ago`;
    return `${hours}h ${minutes}m ago`;
  } else {
    if (hours === 0) return `in ${minutes}m`;
    return `in ${hours}h ${minutes}m`;
  }
}

/**
 * Determine the current and next prayer, optionally for a specific city.
 */
export function getPrayerStatus(now: Date = new Date(), city: string = "Jeddah") {
  const currentTimes = getPrayerTimes(now, city);
  const current = currentTimes.currentPrayer();
  const next = currentTimes.nextPrayer();

  let targetTime = currentTimes.timeForPrayer(next);
  let currentTime = currentTimes.timeForPrayer(current);

  // Handle edge cases for targetTime (if next is tomorrow)
  if (next === Prayer.None || !targetTime) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = getPrayerTimes(tomorrow, city);
    targetTime = tomorrowTimes.fajr;
  }

  // Handle edge cases for currentTime (if current was yesterday's Isha)
  if (current === Prayer.None || !currentTime) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTimes = getPrayerTimes(yesterday, city);
    currentTime = yesterdayTimes.isha;
  }

  return {
    current,
    next,
    targetTime,
    currentTime,
    times: currentTimes,
  };
}
