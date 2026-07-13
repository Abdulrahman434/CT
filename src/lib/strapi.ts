import type {
  StrapiResponse, StrapiHospital, StrapiSectionVisibility,
  StrapiAboutUs, StrapiResource, StrapiMedia
} from '../types/strapi';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || '';

/** Returns true if a Strapi URL is configured. */
export function isCmsEnabled(): boolean {
  return !!STRAPI_URL;
}

/** Build a full URL for a Strapi media asset. */
export function strapiMediaUrl(media: StrapiMedia | null | undefined): string | null {
  if (!media || !media.url) return null;
  if (media.url.startsWith('http')) return media.url;
  return STRAPI_URL.replace(/\/$/, '') + media.url;
}

/** Generic fetch wrapper. Returns null on any failure (never throws). */
async function fetchStrapi<T>(path: string): Promise<T | null> {
  if (!STRAPI_URL) return null;
  try {
    const res = await fetch(STRAPI_URL.replace(/\/$/, '') + path, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      console.warn(`Strapi ${path} returned ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json as T;
  } catch (err) {
    console.warn(`Strapi ${path} failed:`, err);
    return null;
  }
}

/** Fetch hospital by slug. */
export async function fetchHospital(slug: string): Promise<StrapiHospital | null> {
  const json = await fetchStrapi<StrapiResponse<StrapiHospital[]>>(
    `/api/hospitals?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`
  );
  return json?.data?.[0] ?? null;
}

/** Fetch section visibility for a hospital by hospital documentId. */
export async function fetchSectionVisibility(
  hospitalDocumentId: string
): Promise<StrapiSectionVisibility | null> {
  const json = await fetchStrapi<StrapiResponse<StrapiSectionVisibility[]>>(
    `/api/section-visibilities?filters[hospital][documentId][$eq]=${hospitalDocumentId}&populate=*`
  );
  return json?.data?.[0] ?? null;
}

/** Fetch about-us content for a hospital, in the given locale. */
export async function fetchAboutUs(
  hospitalDocumentId: string,
  locale: 'en' | 'ar' | 'ur' = 'en'
): Promise<StrapiAboutUs | null> {
  const json = await fetchStrapi<StrapiResponse<StrapiAboutUs[]>>(
    `/api/about-uses?filters[hospital][documentId][$eq]=${hospitalDocumentId}&locale=${locale}&populate=*`
  );
  return json?.data?.[0] ?? null;
}

/** Fetch resources for a hospital, in the given locale. */
export async function fetchResources(
  hospitalDocumentId: string,
  locale: 'en' | 'ar' | 'ur' = 'en'
): Promise<StrapiResource[]> {
  const json = await fetchStrapi<StrapiResponse<StrapiResource[]>>(
    `/api/resources?filters[hospital][documentId][$eq]=${hospitalDocumentId}&filters[is_active][$eq]=true&locale=${locale}&sort=display_order:asc&populate=*`
  );
  return json?.data ?? [];
}
