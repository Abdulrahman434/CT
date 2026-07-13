import { useState, useEffect } from 'react';
import {
  isCmsEnabled, fetchHospital, fetchSectionVisibility,
  fetchAboutUs, fetchResources
} from './strapi';
import type {
  StrapiHospital, StrapiSectionVisibility,
  StrapiAboutUs, StrapiResource
} from '../types/strapi';

export type CmsResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  source: 'cms' | 'fallback';
};

/** Resolve which hospital this kiosk represents. 
 *  Reads VITE_HOSPITAL_SLUG env var, falls back to "dallah-hospital". 
 */
function getHospitalSlug(): string {
  // Try to use the active hospital ID from localStorage if available
  const activeId = localStorage.getItem('hbs-active-config-id');
  if (activeId) {
    if (activeId === 'dsfh') return 'fakeeh-hospital';
    return `${activeId}-hospital`;
  }
  return import.meta.env.VITE_HOSPITAL_SLUG || 'dallah-hospital';
}

/** Check if the user opted into CMS mode via the "-hospital" password suffix. */
function isCmsModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('cms-mode') === 'true';
  } catch {
    return false;
  }
}

export function useCmsHospital(): CmsResult<StrapiHospital> {
  const [slug, setSlug] = useState(getHospitalSlug());
  const [cmsActive, setCmsActive] = useState(isCmsModeActive());
  const [state, setState] = useState<CmsResult<StrapiHospital>>({
    data: null, loading: false, error: null, source: 'fallback',
  });
  
  useEffect(() => {
    const refresh = () => {
      setSlug(getHospitalSlug());
      setCmsActive(isCmsModeActive());
    };
    window.addEventListener('hospital-changed', refresh);
    window.addEventListener('cms-mode-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('hospital-changed', refresh);
      window.removeEventListener('cms-mode-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    // If CMS not active OR not enabled at build time → fallback only, no fetch
    if (!cmsActive || !isCmsEnabled()) {
      setState({ data: null, loading: false, error: null, source: 'fallback' });
      return;
    }
    
    let cancelled = false;
    setState(s => ({ ...s, loading: true }));
    fetchHospital(slug).then(data => {
      if (cancelled) return;
      setState({
        data,
        loading: false,
        error: data ? null : `No CMS hospital found for slug: ${slug}`,
        source: data ? 'cms' : 'fallback',
      });
    });
    return () => { cancelled = true; };
  }, [slug, cmsActive]);
  
  return state;
}

export function useCmsSectionVisibility(
  hospitalDocumentId: string | undefined
): CmsResult<StrapiSectionVisibility> {
  const [state, setState] = useState<CmsResult<StrapiSectionVisibility>>({
    data: null, loading: !!hospitalDocumentId && isCmsEnabled(), 
    error: null, source: 'fallback',
  });
  
  useEffect(() => {
    if (!hospitalDocumentId || !isCmsEnabled()) return;
    let cancelled = false;
    fetchSectionVisibility(hospitalDocumentId).then(data => {
      if (cancelled) return;
      setState({
        data,
        loading: false,
        error: data ? null : 'No visibility config',
        source: data ? 'cms' : 'fallback',
      });
    });
    return () => { cancelled = true; };
  }, [hospitalDocumentId]);
  
  return state;
}

export function useCmsAboutUs(
  hospitalDocumentId: string | undefined,
  locale: 'en' | 'ar' | 'ur' = 'en'
): CmsResult<StrapiAboutUs> {
  const [state, setState] = useState<CmsResult<StrapiAboutUs>>({
    data: null, loading: !!hospitalDocumentId && isCmsEnabled(),
    error: null, source: 'fallback',
  });
  
  useEffect(() => {
    if (!hospitalDocumentId || !isCmsEnabled()) return;
    let cancelled = false;
    fetchAboutUs(hospitalDocumentId, locale as any).then(data => {
      if (cancelled) return;
      setState({
        data,
        loading: false,
        error: data ? null : 'No about us content',
        source: data ? 'cms' : 'fallback',
      });
    });
    return () => { cancelled = true; };
  }, [hospitalDocumentId, locale]);
  
  return state;
}

export function useCmsResources(
  hospitalDocumentId: string | undefined,
  locale: 'en' | 'ar' | 'ur' = 'en'
): CmsResult<StrapiResource[]> {
  const [state, setState] = useState<CmsResult<StrapiResource[]>>({
    data: null, loading: !!hospitalDocumentId && isCmsEnabled(),
    error: null, source: 'fallback',
  });
  
  useEffect(() => {
    if (!hospitalDocumentId || !isCmsEnabled()) return;
    let cancelled = false;
    fetchResources(hospitalDocumentId, locale as any).then(data => {
      if (cancelled) return;
      setState({
        data,
        loading: false,
        error: null,
        source: data.length > 0 ? 'cms' : 'fallback',
      });
    });
    return () => { cancelled = true; };
  }, [hospitalDocumentId, locale]);
  
  return state;
}
