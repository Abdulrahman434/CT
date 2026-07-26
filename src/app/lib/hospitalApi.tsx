import { useState, useEffect } from "react";
import { FileText, Smartphone } from "lucide-react";
import { apiUrl, rewriteImageUrl, withApiKey } from "./apiConfig";
import { ApiImage } from "../components/ApiImage";

// ═══════════════════════════════════════════════════════════════════════════
// LOCALE HELPERS
// ═══════════════════════════════════════════════════════════════════════════
//
// API returns localized strings as arrays of:
//   { language_id, language_name, locale_name, locale_header, locale_body, ... }
// where language_id: 1 = English, 2 = Arabic, 3 = Urdu.

type LocaleEntry = {
  language_id:        number;
  locale_name?:       string;
  locale_header?:     string;
  locale_body?:       string;
  locale_description?: string;
  [key: string]: any;
};

/**
 * Extract a field from a locale array based on current app locale.
 * Falls back: requested locale → English → first available → "".
 */
export function getLocalized(
  locales: LocaleEntry[] | null | undefined,
  locale:  string,
  field:   string = "locale_name"
): string {
  if (!locales?.length) return "";
  const langId = locale === "ar" ? 2 : locale === "ur" ? 3 : 1;

  const exact = locales.find(l => l.language_id === langId);
  if (exact?.[field]) return exact[field] as string;

  // Fallback to English
  const en = locales.find(l => l.language_id === 1);
  if (en?.[field]) return en[field] as string;

  // Fallback to first non-empty entry for the field
  const first = locales.find(l => l[field]);
  return (first?.[field] as string) ?? "";
}

/** Convenience: pull EN + AR `locale_name` out of a locale array in one call. */
export function getBilingualNames(
  locales: LocaleEntry[] | null | undefined,
  field:   string = "locale_name"
): { nameEn: string; nameAr: string } {
  const nameEn = getLocalized(locales, "en", field);
  const nameAr = getLocalized(locales, "ar", field) || nameEn;
  return { nameEn, nameAr };
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface HospitalGroup {
  id: number;
  group_title: string;
  organization: number;
}

export interface WallpaperImage {
  id: number;
  imageUrl: string;   // raw http:// from API — proxy before display
  groupId: number;
  groupTitle: string;
}

export interface WallpaperGroup {
  id: number;
  title: string;
  images: WallpaperImage[];
}

export interface DeviceLocation {
  room_no: string;
  bed_no: string;
  patient_id: string;
  admit_data: string;   // reference_id for HL7 lookup
  group: { id: number; group_title: string } | null;
}

export interface Hl7Patient {
  name: string;
  nameAr?: string;
  mrn: string;
  room: string;
  bed: string;
  sex: string;
  dob: string;
  admissionDate: string;
  dischargeDate: string;
  admitRefId: number;
}

export interface NewsItem {
  id: number;
  title: string;
  logoUrl: string;
  feeds: { language: string; url: string }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/** Parse HL7 datetime "20260402170358" → "02 Apr 2026" */
function parseHl7Date(raw: string): string {
  if (!raw || raw.length < 8) return "";
  const year = raw.slice(0, 4);
  const month = parseInt(raw.slice(4, 6), 10);
  const day = raw.slice(6, 8);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  if (month < 1 || month > 12) return "";
  return `${day} ${months[month - 1]} ${year}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// GROUP / ORGANIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /hospital/group/
 * Returns all ward groups for this organization.
 * Used to know which group IDs exist before fetching wallpapers.
 */
export async function fetchHospitalGroups(): Promise<HospitalGroup[]> {
  try {
    const res = await fetch(apiUrl("/hospital/group/"));
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.warn("[hospitalApi] fetchHospitalGroups:", e);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// WALLPAPERS / BACKGROUNDS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /resource/background/wallpaper/?group={id}
 * Returns wallpaper images for one group.
 */
async function fetchWallpapersForGroup(
  group: HospitalGroup
): Promise<WallpaperGroup | null> {
  try {
    const res = await fetch(
      apiUrl(`/resource/background/wallpaper/?group=${group.id}`)
    );
    if (!res.ok) return null;
    const data: any[] = await res.json();
    if (!data?.length) return null;

    return {
      id: group.id,
      title: group.group_title,
      images: data
        .filter(item => item?.image)
        .map(item => ({
          id: item.id,
          imageUrl: rewriteImageUrl(item.image ?? ""),
          groupId: group.id,
          groupTitle: group.group_title,
        })),
    };
  } catch (e) {
    console.warn(`[hospitalApi] fetchWallpapersForGroup(${group.id}):`, e);
    return null;
  }
}

/**
 * Fetches ALL wallpaper groups and their images.
 * Step 1: GET /hospital/group/ → get group IDs
 * Step 2: GET /resource/background/wallpaper/?group={id} for each
 * All requests run in parallel.
 */
export async function fetchAllWallpapers(): Promise<WallpaperGroup[]> {
  try {
    const groups = await fetchHospitalGroups();
    if (!groups.length) return [];

    const results = await Promise.all(
      groups.map(g => fetchWallpapersForGroup(g))
    );

    return results.filter((g): g is WallpaperGroup => g !== null);
  } catch (e) {
    console.warn("[hospitalApi] fetchAllWallpapers:", e);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DEVICE + PATIENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /user/organization/devices/
 * Find this device by serial number → get room, bed, patient reference_id.
 */
/**
 * Robustly extract patient full name (English and Arabic) from HL7 message.
 */
export function extractNameFromHl7(d: any): { nameEn: string; nameAr: string } {
  if (!d) return { nameEn: "", nameAr: "" };
  const pid = d.patient_identification ?? {};
  const nameObj = pid.pid_patient_name;

  let given = "";
  let family = "";
  let textName = "";

  if (Array.isArray(nameObj) && nameObj.length > 0) {
    const item = nameObj[0];
    if (typeof item === "string") textName = item;
    else if (item && typeof item === "object") {
      given = item.given_name || item.given || item.first_name || "";
      family = item.family_name || item.family || item.last_name || "";
      textName = item.text || item.name || item.full_name || "";
    }
  } else if (nameObj && typeof nameObj === "object") {
    given = nameObj.given_name || nameObj.given || nameObj.first_name || "";
    family = nameObj.family_name || nameObj.family || nameObj.last_name || "";
    textName = nameObj.text || nameObj.name || nameObj.full_name || "";
  } else if (typeof nameObj === "string") {
    textName = nameObj;
  }

  const nameEn = `${given} ${family}`.trim() || textName.trim();

  let nameAr = "";
  if (pid.pid_patient_name_ar) {
    nameAr = String(pid.pid_patient_name_ar).trim();
  } else if (Array.isArray(nameObj) && nameObj.length > 1) {
    const arItem = nameObj[1];
    if (typeof arItem === "string") nameAr = arItem.trim();
    else if (arItem && typeof arItem === "object") {
      const g = arItem.given_name || arItem.given || "";
      const f = arItem.family_name || arItem.family || "";
      nameAr = `${g} ${f}`.trim() || (arItem.text || arItem.name || "").trim();
    }
  }

  return { nameEn, nameAr };
}

/**
 * Robustly extract patient MRN / ID from HL7 message response.
 */
export function extractMrnFromHl7(d: any): string {
  if (!d) return "";
  const pid = d.patient_identification ?? {};

  const idList = pid.pid_patient_identifier_list;
  if (Array.isArray(idList) && idList.length > 0) {
    for (const item of idList) {
      if (typeof item === "string" && item.trim()) return item.trim();
      if (item?.id_number) return String(item.id_number).trim();
      if (item?.id) return String(item.id).trim();
      if (item?.cx_1) return String(item.cx_1).trim();
    }
  } else if (idList && typeof idList === "object") {
    if (idList.id_number) return String(idList.id_number).trim();
    if (idList.id) return String(idList.id).trim();
    if (idList.cx_1) return String(idList.cx_1).trim();
  } else if (typeof idList === "string" && idList.trim()) {
    return idList.trim();
  }

  const idInternal = pid.pid_patient_id_internal;
  if (Array.isArray(idInternal) && idInternal.length > 0) {
    for (const item of idInternal) {
      if (typeof item === "string" && item.trim()) return item.trim();
      if (item?.id_number) return String(item.id_number).trim();
      if (item?.id) return String(item.id).trim();
      if (item?.cx_1) return String(item.cx_1).trim();
    }
  } else if (idInternal && typeof idInternal === "object") {
    if (idInternal.id_number) return String(idInternal.id_number).trim();
    if (idInternal.id) return String(idInternal.id).trim();
    if (idInternal.cx_1) return String(idInternal.cx_1).trim();
  } else if (typeof idInternal === "string" && idInternal.trim()) {
    return idInternal.trim();
  }

  if (pid.mrn) return String(pid.mrn).trim();
  if (pid.id_number) return String(pid.id_number).trim();
  if (pid.patient_id) return String(pid.patient_id).trim();
  if (d.mrn) return String(d.mrn).trim();
  if (d.patient_id) return String(d.patient_id).trim();

  return "";
}

export function isMrnPasscodeMatch(input: string, target: string): boolean {
  if (!input || !target) return false;
  const cleanIn = input.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const cleanTar = target.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  if (!cleanIn || !cleanTar) return false;

  if (cleanIn === cleanTar) return true;

  const noZeroIn = cleanIn.replace(/^0+/, '');
  const noZeroTar = cleanTar.replace(/^0+/, '');
  if (noZeroIn && noZeroTar && noZeroIn === noZeroTar) return true;

  if (noZeroTar && noZeroIn && (noZeroTar.endsWith(noZeroIn) || noZeroIn.endsWith(noZeroTar))) return true;

  return false;
}

/**
 * GET /user/organization/devices/
 * Find this device by serial number → get room, bed, patient reference_id.
 * STRICT MATCH: Only returns device location if device_id matches serial number.
 */
export async function fetchDeviceLocation(
  serial: string
): Promise<DeviceLocation | null> {
  const normSerial = (serial || "").trim().toLowerCase();
  if (!normSerial) return null;

  try {
    const res = await fetch(apiUrl("/user/organization/devices/"));
    if (!res.ok) return null;
    const devices: any[] = await res.json();
    if (!Array.isArray(devices)) return null;

    const device = devices.find(
      d => String(d.device_id || "").trim().toLowerCase() === normSerial
    );
    if (!device?.device_location) return null;

    const loc = device.device_location;
    return {
      room_no: loc.room_no ?? "",
      bed_no: loc.bed_no ?? "",
      patient_id: loc.patient_id ?? "",
      admit_data: loc.admit_data ?? "",
      group: loc.group ?? null,
    };
  } catch (e) {
    console.warn("[hospitalApi] fetchDeviceLocation:", e);
    return null;
  }
}

/**
 * GET /hl7/httpreceiver/?reference_id={id}
 * Returns patient demographics from HL7 ADT message.
 * reference_id comes from device_location.admit_data
 */
export async function fetchPatientByRefId(
  referenceId: string | number
): Promise<Hl7Patient | null> {
  if (!referenceId) return null;
  try {
    const res = await fetch(
      apiUrl(`/hl7/httpreceiver/?reference_id=${referenceId}`)
    );
    if (!res.ok) return null;
    const d = await res.json();

    const pid = d.patient_identification ?? {};
    const pv = d.patient_visit ?? {};

    const { nameEn, nameAr } = extractNameFromHl7(d);
    const mrn = extractMrnFromHl7(d);

    return {
      name: nameEn,
      nameAr: nameAr || undefined,
      mrn,
      room: pv.pv_assigned_patient_location?.room ?? "",
      bed: pv.pv_assigned_patient_location?.bed ?? "",
      sex: pid.pid_administrative_sex ?? "",
      dob: parseHl7Date(pid.pid_date_time_of_birth?.time ?? ""),
      admissionDate: parseHl7Date(pv.pv_admit_date_time?.time ?? ""),
      dischargeDate: parseHl7Date(pv.pv_discharge_date_time?.time ?? ""),
      admitRefId: Number(referenceId),
    };
  } catch (e) {
    console.warn("[hospitalApi] fetchPatientByRefId:", e);
    return null;
  }
}

/**
 * Convenience: device serial → patient data in one call.
 * Returns { location, patient, isFallback } or null if device/patient not found.
 */
export async function fetchPatientForDevice(serial: string): Promise<{
  location: DeviceLocation;
  patient: Hl7Patient;
  isFallback?: boolean;
} | null> {
  if (!serial) return null;

  let activeHospitalId = localStorage.getItem("active-hospital-id") || "";
  if (!activeHospitalId) {
    try {
      const savedTheme = localStorage.getItem("careinn-layout2-theme");
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme);
        activeHospitalId = typeof parsed === "string" ? parsed : (parsed.id || "");
      }
    } catch {}
  }
  const normHid = activeHospitalId.trim().toLowerCase();
  const isFakeeh = normHid === "dsfh" || normHid === "fakeeh" || normHid.includes("dsfh") || normHid.includes("fakeeh");

  if (isFakeeh) {
    const fakeehLocalIp = "http://10.1.189.77/api";
    const fakeehLocalKey = "dc870ea4-d5d0-4f91-a4a4-502724603ec0";

    const cloudIp = "https://control.careinn.com/api";
    const cloudKey = "2345fcba-1633-46c9-a27e-ed0ca9ee17e9";

    // 1. Try Fakeeh Local Server First (10.1.189.77)
    try {
      const locLocal = await fetchDeviceLocationWithConfig(serial, fakeehLocalIp, fakeehLocalKey);
      if (locLocal) {
        let patLocal: Hl7Patient | null = null;
        if (locLocal.admit_data) {
          patLocal = await fetchPatientByRefIdWithConfig(locLocal.admit_data, fakeehLocalIp, fakeehLocalKey);
        }
        const mrn = (patLocal?.mrn || locLocal.patient_id || "").trim();
        if (patLocal) {
          patLocal.room = locLocal.room_no || patLocal.room;
          patLocal.bed = locLocal.bed_no || patLocal.bed;
          patLocal.mrn = mrn;
        } else if (locLocal.patient_id) {
          patLocal = {
            name: "",
            mrn: locLocal.patient_id,
            room: locLocal.room_no || "",
            bed: locLocal.bed_no || "",
            sex: "",
            dob: "",
            admissionDate: "",
            dischargeDate: "",
            admitRefId: Number(locLocal.admit_data || 0),
          };
        }
        if (patLocal) {
          saveApiConfig({ serverIp: fakeehLocalIp, apiKey: fakeehLocalKey });
          return { location: locLocal, patient: patLocal, isFallback: false };
        }
      }
    } catch {}

    // 2. Local server unreachable -> Move to Cloud server (control.careinn.com)
    try {
      const locCloud = await fetchDeviceLocationWithConfig(serial, cloudIp, cloudKey);
      if (locCloud) {
        let patCloud: Hl7Patient | null = null;
        if (locCloud.admit_data) {
          patCloud = await fetchPatientByRefIdWithConfig(locCloud.admit_data, cloudIp, cloudKey);
        }
        const mrn = (patCloud?.mrn || locCloud.patient_id || "").trim();
        if (patCloud) {
          patCloud.room = locCloud.room_no || patCloud.room;
          patCloud.bed = locCloud.bed_no || patCloud.bed;
          patCloud.mrn = mrn;
        } else if (locCloud.patient_id) {
          patCloud = {
            name: "",
            mrn: locCloud.patient_id,
            room: locCloud.room_no || "",
            bed: locCloud.bed_no || "",
            sex: "",
            dob: "",
            admissionDate: "",
            dischargeDate: "",
            admitRefId: Number(locCloud.admit_data || 0),
          };
        }
        if (patCloud) {
          saveApiConfig({ serverIp: cloudIp, apiKey: cloudKey });
          return { location: locCloud, patient: patCloud, isFallback: true };
        }
      }
    } catch {}

    return null;
  }

  // General server fetch for other hospitals
  const location = await fetchDeviceLocation(serial);
  if (!location) return null;

  let patient: Hl7Patient | null = null;
  if (location.admit_data) {
    patient = await fetchPatientByRefId(location.admit_data);
  }

  const mrn = (patient?.mrn || location.patient_id || "").trim();

  if (patient) {
    patient.room = location.room_no || patient.room;
    patient.bed = location.bed_no || patient.bed;
    patient.mrn = mrn;
  } else if (location.patient_id) {
    patient = {
      name: "",
      mrn: location.patient_id,
      room: location.room_no || "",
      bed: location.bed_no || "",
      sex: "",
      dob: "",
      admissionDate: "",
      dischargeDate: "",
      admitRefId: Number(location.admit_data || 0),
    };
  } else {
    return null;
  }

  return { location, patient, isFallback: false };
}

export async function fetchDeviceLocationWithConfig(
  serial: string,
  serverIp: string,
  apiKey: string
): Promise<DeviceLocation | null> {
  const normSerial = (serial || "").trim().toLowerCase();
  if (!normSerial) return null;

  try {
    const base = serverIp.startsWith("http")
      ? serverIp.replace(/\/$/, "")
      : `http://${serverIp}/api`;
    const url = `${base}/user/organization/devices/?apikey=${apiKey}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) return null;
    const devices: any[] = await res.json();
    if (!Array.isArray(devices)) return null;

    const device = devices.find(
      d => String(d.device_id || "").trim().toLowerCase() === normSerial
    );
    if (!device?.device_location) return null;

    const loc = device.device_location;
    return {
      room_no: loc.room_no ?? "",
      bed_no: loc.bed_no ?? "",
      patient_id: loc.patient_id ?? "",
      admit_data: loc.admit_data ?? "",
      group: loc.group ?? null,
    };
  } catch {
    return null;
  }
}

export async function fetchPatientByRefIdWithConfig(
  referenceId: string | number,
  serverIp: string,
  apiKey: string
): Promise<Hl7Patient | null> {
  try {
    const base = serverIp.startsWith("http")
      ? serverIp.replace(/\/$/, "")
      : `http://${serverIp}/api`;
    const url = `${base}/hl7/httpreceiver/?reference_id=${referenceId}&apikey=${apiKey}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) return null;
    const d = await res.json();

    const pid = d.patient_identification ?? {};
    const pv = d.patient_visit ?? {};

    const { nameEn, nameAr } = extractNameFromHl7(d);
    const mrn = extractMrnFromHl7(d);

    return {
      name: nameEn,
      nameAr: nameAr || undefined,
      mrn,
      room: pv.pv_assigned_patient_location?.room ?? "",
      bed: pv.pv_assigned_patient_location?.bed ?? "",
      sex: pid.pid_administrative_sex ?? "",
      dob: parseHl7Date(pid.pid_date_time_of_birth?.time ?? ""),
      admissionDate: parseHl7Date(pv.pv_admit_date_time?.time ?? ""),
      dischargeDate: parseHl7Date(pv.pv_discharge_date_time?.time ?? ""),
      admitRefId: Number(referenceId),
    };
  } catch {
    return null;
  }
}

export interface MrnMatchResult {
  hospitalId: string;
  serverIp: string;
  apiKey: string;
  location: DeviceLocation;
  patient: Hl7Patient;
}

export async function findDeviceAndPatientByMrn(
  enteredMrn: string,
  serialNumber: string
): Promise<MrnMatchResult | null> {
  const normMrn = enteredMrn.trim().toLowerCase();
  if (!normMrn || !serialNumber) return null;

  const fakeehKey = "dc870ea4-d5d0-4f91-a4a4-502724603ec0";
  const burjeelKey = "3a68339d-e45f-478e-85a0-811f6b54b457";
  const cloudKey = "2345fcba-1633-46c9-a27e-ed0ca9ee17e9";

  const candidateServers = [
    { hospitalId: "fakeeh", serverIp: "http://10.1.189.77/api", apiKey: fakeehKey },
    { hospitalId: "careinn", serverIp: "https://control.careinn.com/api", apiKey: cloudKey },
    { hospitalId: "burjeel", serverIp: "http://10.11.16.15/api", apiKey: burjeelKey },
    { hospitalId: "burjeel", serverIp: "http://careinn.bh.com/api", apiKey: burjeelKey },
    { hospitalId: "burjeel", serverIp: "https://careinn.bh.com/api", apiKey: burjeelKey },
  ];

  for (const srv of candidateServers) {
    try {
      const location = await fetchDeviceLocationWithConfig(serialNumber, srv.serverIp, srv.apiKey);
      if (location) {
        let patient: Hl7Patient | null = null;
        if (location.admit_data) {
          patient = await fetchPatientByRefIdWithConfig(location.admit_data, srv.serverIp, srv.apiKey);
        }

        const patMrn = (patient?.mrn || location.patient_id || "").trim();
        const isMatched =
          isMrnPasscodeMatch(enteredMrn, patMrn) ||
          isMrnPasscodeMatch(enteredMrn, location.patient_id);

        if (isMatched) {
          if (!patient) {
            patient = {
              name: "",
              mrn: patMrn,
              room: location.room_no || "",
              bed: location.bed_no || "",
              sex: "",
              dob: "",
              admissionDate: "",
              dischargeDate: "",
              admitRefId: Number(location.admit_data || 0),
            };
          } else {
            patient.room = location.room_no || patient.room;
            patient.bed = location.bed_no || patient.bed;
            patient.mrn = patMrn;
          }

          return {
            hospitalId: srv.hospitalId,
            serverIp: srv.serverIp,
            apiKey: srv.apiKey,
            location,
            patient,
          };
        }
      }
    } catch {}
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// NEWS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /access/latestnews/
 * Returns news feeds with localized RSS URLs and logos.
 */
export async function fetchLatestNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(apiUrl("/access/latestnews/"));
    if (!res.ok) return [];
    const data: any[] = await res.json();

    return data.map(item => ({
      id: item.id,
      title: item.title ?? "",
      logoUrl: rewriteImageUrl(item.logo_url ?? ""),
      feeds: (item.latestnews_desc_locale ?? []).map((l: any) => ({
        language: l.language_name ?? "",
        url: l.locale_description ?? "",
      })),
    }));
  } catch (e) {
    console.warn("[hospitalApi] fetchLatestNews:", e);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FUTURE ENDPOINTS — add here
// ═══════════════════════════════════════════════════════════════════════════
//
// export async function fetchWelcomeNote(): Promise<string> { ... }
//   GET /access/welcomenote/
//
// export async function fetchFoodMenu(): Promise<FoodItem[]> { ... }
//   GET /food/menu/... (sub-routes TBD)
//
// export async function fetchCareTeam(patientId): Promise<...> { ... }
//   GET /nursingstation/... (sub-routes TBD)
//
// export async function fetchScreenSavers(): Promise<string[]> { ... }
//   GET /cdn/resource/screen_savers/...

// ═══════════════════════════════════════════════════════════════════════════
// APPS (APK, URL, PDF)
// ═══════════════════════════════════════════════════════════════════════════

export interface AppPackage {
  id: number;
  packageName: string | null;
  versionName: string | null;
  imageUrl: string;
  nameEn: string;
  nameAr: string;
  categoryId: number;
  category: string;   // "Entertainment", "Social", etc.
  type: "APK" | "URL" | "PDF";
  url: string | null;
  apkUrl: string | null;
  pdfUrl: string | null;  // cdn URL for PDF
}

// ── Module-level cache — persists across component mounts ────────────────

let _packagesCache: AppPackage[] | null = null;

export function getPackagesCache(): AppPackage[] {
  return _packagesCache ?? [];
}
let _packagesFetching: Promise<AppPackage[]> | null = null;

/**
 * Fetch packages once and cache. Subsequent calls return cache instantly.
 * Pass force=true to bypass cache (e.g. after server config change).
 */
export async function fetchAppPackages(
  force = false
): Promise<AppPackage[]> {
  if (_packagesCache && !force) return _packagesCache;

  // Deduplicate concurrent calls — if already fetching, 
  // return the same promise
  if (_packagesFetching && !force) return _packagesFetching;

  _packagesFetching = (async () => {
    try {
      const res = await fetch(apiUrl("/apps/packages/"));
      if (!res.ok) return _packagesCache ?? [];
      const data: any[] = await res.json();
      _packagesCache = data.map(item => ({
        id: item.id,
        packageName: item.package_name ?? null,
        versionName: item.version_name ?? null,
        imageUrl: rewriteImageUrl(item.image ?? ""),
        ...getBilingualNames(item.package_locale),
        categoryId: item.category_id,
        category: item.category_title ?? "",
        type: item.type as "APK" | "URL" | "PDF",
        url: item.url ?? null,
        apkUrl: item.package ? withApiKey(item.package) : null,
        pdfUrl: item.pdf ?? null,
      }));

      const packages = _packagesCache
        .filter(a => a.type === "APK" && a.packageName)
        .map(a => a.packageName);
      window.AndroidSystem?.setLaunchableApps?.(JSON.stringify(packages));

      return _packagesCache;
    } catch (e) {
      console.warn("[hospitalApi] fetchAppPackages:", e);
      return _packagesCache ?? [];
    } finally {
      _packagesFetching = null;
    }
  })();

  return _packagesFetching;
}

/** Call this when server config changes to force re-fetch */
export function invalidatePackagesCache(): void {
  _packagesCache = null;
}

/**
 * Maps API category_title to AppLauncher category key.
 * Add new mappings here when new categories are added to the API.
 */
export const API_CATEGORY_MAP: Record<string, string> = {
  "Entertainment": "Media",
  "Social": "Social",
  "Call": "Meeting",
  "Games": "Games",
  "Tools": "Tools",
  "Religion": "Reading",
  "Shortcut Services": "Shortcuts",  // ServicesGrid shortcuts
  "I-Services": "Internet",
};

export interface ApiAppItem {
  id: string;
  name: string;
  nameAr?: string;
  bg: string;
  mark?: string;
  textColor?: string;
  pdfSource?: string;
  packageName?: string; // Android package — for install/launch
  apkUrl?: string;      // CDN APK download URL
  url?: string;         // Web fallback URL
  imageUrl?: string;
  customRender?: () => React.ReactNode;
}

/**
 * Hook — fetches all packages once, returns only PDF items
 * mapped to AppItem shape for a specific AppLauncher category key.
 * Re-fetches when api-config-changed fires.
 */
function mapPackagesToAppItems(packages: AppPackage[], categoryKey: string): ApiAppItem[] {
  // Find which API category maps to this launcher key
  const apiCategory = Object.entries(API_CATEGORY_MAP)
    .find(([, v]) => v === categoryKey)?.[0];

  if (!apiCategory) return [];

  const items = packages.filter(
    p => p.category === apiCategory && (p.pdfUrl || p.apkUrl || p.url)
  );

  // de-dupe API packages by packageName → url → id
  const seen = new Set<string>();
  const unique = items.filter(p => {
    const key = (p.packageName || p.url || String(p.id)).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.map(p => {
    // ── PDF type ──
    if (p.type === "PDF" && p.pdfUrl) {
      return {
        id: `api-pdf-${p.id}`,
        name: p.nameEn || `PDF ${p.id}`,
        nameAr: p.nameAr || p.nameEn,
        bg: "#E8453C",
        mark: "PDF",
        textColor: "#fff",
        pdfSource: p.pdfUrl,
        customRender: () => (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg,#E8453C,#C0392B)",
            borderRadius: "12px",
            gap: "6px",
            padding: "8px",
          }}>
            <FileText size={32} color="#fff" strokeWidth={1.5} />
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#fff",
              textAlign: "center",
              lineHeight: 1.2,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}>
              {p.nameEn || "PDF"}
            </span>
          </div>
        ),
      };
    }

    // ── APK / URL type ──
    return {
      id: `api-app-${p.id}`,
      name: p.nameEn || `App ${p.id}`,
      nameAr: p.nameAr || p.nameEn,
      bg: "#1e293b",
      mark: "",
      textColor: "#fff",
      packageName: p.packageName ?? undefined,
      apkUrl: p.apkUrl ?? undefined,
      url: p.url ?? undefined,
      imageUrl: p.imageUrl || "?",
      appType: p.type ? (p.type.toLowerCase() as "apk" | "url" | "pdf") : "url",
    };
  });
}

/**
 * Hook — fetches all packages once, returns only PDF items
 * mapped to AppItem shape for a specific AppLauncher category key.
 * Re-fetches when api-config-changed fires.
 */
export function useApiPdfApps(categoryKey: string): ApiAppItem[] {
  const [apps, setApps] = useState<ApiAppItem[]>(() => {
    // Read from cache immediately — no loading delay
    return mapPackagesToAppItems(_packagesCache ?? [], categoryKey);
  });

  useEffect(() => {
    // If cache was empty on mount, fetch then update
    fetchAppPackages().then(packages => {
      setApps(mapPackagesToAppItems(packages, categoryKey));
    });

    const handler = () => {
      fetchAppPackages(true).then(packages => {
        setApps(mapPackagesToAppItems(packages, categoryKey));
      });
    };
    window.addEventListener("api-config-changed", handler);
    return () => window.removeEventListener("api-config-changed", handler);
  }, [categoryKey]);

  return apps;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEVICE ALERTS
// ═══════════════════════════════════════════════════════════════════════════

export interface DeviceAlert {
  id:             number;
  titleEn:        string;
  titleAr:        string;
  titleUr:        string;
  bodyEn:         string;
  bodyAr:         string;
  bodyUr:         string;
  sendImmediately: boolean;
  scheduledAt:    string;
  status:         "scheduled" | "completed" | "cancelled";
  lastSentAt:     string | null;
  groupIds:       number[];
  createdAt?:     string;
  updatedAt?:     string;
}

function getAlertLocale(
  locales: any[], languageId: number, field: string
): string {
  return locales?.find(
    l => l.language_id === languageId)?.[field] ?? "";
}

export async function fetchDeviceAlerts(): Promise<DeviceAlert[]> {
  try {
    const res = await fetch(apiUrl("/push/device/alerts/"));
    if (!res.ok) return [];
    const data: any[] = await res.json();

    return data.map(item => ({
      id:              item.id,
      titleEn:         getAlertLocale(item.device_alert_locale, 1, "locale_header")
                       || item.title || "",
      titleAr:         getAlertLocale(item.device_alert_locale, 2, "locale_header")
                       || item.title || "",
      titleUr:         getAlertLocale(item.device_alert_locale, 3, "locale_header")
                       || item.title || "",
      bodyEn:          getAlertLocale(item.device_alert_locale, 1, "locale_body"),
      bodyAr:          getAlertLocale(item.device_alert_locale, 2, "locale_body"),
      bodyUr:          getAlertLocale(item.device_alert_locale, 3, "locale_body"),
      sendImmediately: item.metadata?.send_immediately ?? false,
      scheduledAt:     item.metadata?.scheduled_at    ?? "",
      status:          item.metadata?.status          ?? "scheduled",
      lastSentAt:      item.metadata?.last_sent_at    ?? null,
      groupIds:        item.metadata?.group_ids       ?? [],
      createdAt:       item.created_at || item.createdAt || item.metadata?.created_at || item.metadata?.createdAt || item.scheduled_at || item.metadata?.scheduled_at || "",
      updatedAt:       item.updated_at || item.updatedAt || item.modified_at || item.modifiedAt || item.metadata?.updated_at || item.metadata?.updatedAt || item.metadata?.modified_at || item.metadata?.modifiedAt || item.metadata?.last_sent_at || item.lastSentAt || "",
    }));
  } catch (e) {
    console.warn("[hospitalApi] fetchDeviceAlerts:", e);
    return [];
  }
}

const SEEN_ALERTS_KEY = "careinn-seen-alerts";

export function getSeenAlertIds(): Set<number> {
  try {
    const raw = localStorage.getItem(SEEN_ALERTS_KEY);
    return new Set(JSON.parse(raw ?? "[]"));
  } catch { return new Set(); }
}

export function markAlertSeen(id: number): void {
  const seen = getSeenAlertIds();
  seen.add(id);
  localStorage.setItem(SEEN_ALERTS_KEY,
    JSON.stringify([...seen]));
}

export function markAllAlertsSeen(ids: number[]): void {
  const seen = getSeenAlertIds();
  ids.forEach(id => seen.add(id));
  localStorage.setItem(SEEN_ALERTS_KEY,
    JSON.stringify([...seen]));
}

const HIDDEN_ALERTS_KEY = "careinn-hidden-alerts";

export function getHiddenAlertIds(): Set<number> {
  try {
    const raw = localStorage.getItem(HIDDEN_ALERTS_KEY);
    return new Set(JSON.parse(raw ?? "[]"));
  } catch { return new Set(); }
}

export function markAlertHidden(id: number): void {
  const hidden = getHiddenAlertIds();
  hidden.add(id);
  localStorage.setItem(HIDDEN_ALERTS_KEY, JSON.stringify([...hidden]));
}

export function markAllAlertsHidden(ids: number[]): void {
  const hidden = getHiddenAlertIds();
  ids.forEach(id => hidden.add(id));
  localStorage.setItem(HIDDEN_ALERTS_KEY, JSON.stringify([...hidden]));
}

