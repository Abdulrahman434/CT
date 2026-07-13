const HERO_KEY       = "careinn-hero-image";
const SLIDESHOW_KEY  = "careinn-slideshow-enabled";

export function getSavedHeroImage(): string | null {
  return localStorage.getItem(HERO_KEY);
}

export function saveHeroImage(proxiedUrl: string): void {
  localStorage.setItem(HERO_KEY, proxiedUrl);
  window.dispatchEvent(new CustomEvent(
    "hero-image-changed", { detail: proxiedUrl }));
}

export function clearSavedHeroImage(): void {
  localStorage.removeItem(HERO_KEY);
  window.dispatchEvent(new CustomEvent("hero-image-changed",
    { detail: null }));
}

export function isSlideshowEnabled(): boolean {
  return localStorage.getItem(SLIDESHOW_KEY) === "true";
}

export function setSlideshowEnabled(enabled: boolean): void {
  localStorage.setItem(SLIDESHOW_KEY, String(enabled));
  window.dispatchEvent(new CustomEvent(
    "slideshow-changed", { detail: enabled }));
}
