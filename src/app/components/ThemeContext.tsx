import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import type { Locale } from "./i18n";

/* ═══════════════════════════════════════════════════════════════════════════
 * HBS — Hospital Bedside System Design Tokens
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ARCHITECTURE:
 *
 *   ThemeConfig .............. Brand-variable tokens (colors, fonts, assets)
 *                              These change per hospital client.
 *
 *   TYPE_SCALE / WEIGHT /     Structural constants — shared across ALL
 *   LEADING / SHADOW / SPACE  hospital configs. Never change per-brand.
 *
 * HOW TO REBRAND FOR A NEW HOSPITAL CLIENT:
 *
 *   Option A (code):    Create a new HospitalCoreConfig object
 *   Option B (runtime): Tap DHUHR prayer → Hospital Configurator UI
 *
 * DESIGN RULES:
 *   - Always use `theme.*` for brand-variable values (colors, fonts, assets)
 *   - Always use scale constants for sizes, weights, shadows, spacing
 *   - NEVER hardcode hex colors or font strings in component files
 *
 * ASSET RECOMMENDATIONS:
 *   Logo        → 360×190 px (PNG with transparent bg, 2× retina)
 *   Hero Image  → 1920×600 px (JPG/PNG, landscape, hospital exterior)
 *
 * QUICK REFERENCE — Which token to use:
 *
 *   CONTEXT                    COLOR TOKEN          TEXT_STYLE / manual
 *   ─────────────────────────  ───────────────────  ────────────────────
 *   Page heading               theme.textHeading    TEXT_STYLE.pageTitle
 *   Section title              theme.textHeading    TEXT_STYLE.sectionTitle
 *   Card title                 theme.textHeading    TEXT_STYLE.cardTitle
 *   Body text                  theme.textBody       TEXT_STYLE.body
 *   Label / caption            theme.textMuted      TEXT_STYLE.label
 *   Caption / hint             theme.textMuted      TEXT_STYLE.caption
 *   Micro label (e.g. badge)   theme.textMuted      TEXT_STYLE.micro
 *   Button text                theme.textInverse    TEXT_STYLE.button
 *   Helper / hint text         theme.textDisabled   TEXT_STYLE.helper
 *   Disabled text              theme.textDisabled   —
 *   Text on colored bg         theme.textInverse    —
 *   Primary action button      theme.primary bg     theme.textInverse text
 *   Danger / destructive       theme.accent bg      theme.textInverse text
 *   Card container             theme.surface bg     SHADOW.md, RADIUS (theme)
 *   Muted icon                 theme.iconDefault    —
 *   Branded icon               theme.iconBrand      —
 *
 * ═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
 * STRUCTURAL SCALES — constant across all hospital configs
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Type scale — 6-step progression optimized for healthcare touchscreens.
 * Base unit: 4px — ensures accessibility for elderly patients and those with weak eyesight.
 * Minimum size: 14px — meets medical device readability standards.
 *
 * Usage: `fontSize: TYPE_SCALE.base`
 */
export const TYPE_SCALE = {
  /** 14px — labels, captions, compact UI elements */
  sm:   "14px",
  /** 18px — body text, descriptions, UI controls (primary reading size) */
  base: "18px",
  /** 22px — emphasized text, buttons, card titles */
  md:   "22px",
  /** 26px — section headers, page titles */
  lg:   "26px",
  /** 30px — patient name, hero text */
  xl:   "30px",
  /** 34px — survey questions, modal headings, splash content */
  "2xl": "34px",
} as const;

/**
 * Font weight scale — named roles instead of raw numbers.
 *
 * Usage: `fontWeight: WEIGHT.semibold`
 */
export const WEIGHT = {
  /** 400 — body text, descriptions */
  normal:    400,
  /** 500 — medium emphasis, subtitles */
  medium:    500,
  /** 600 — labels, badges, nav items */
  semibold:  600,
  /** 700 — titles, buttons, card names */
  bold:      700,
  /** 800 — hero headings, strong emphasis */
  extrabold: 800,
} as const;

/**
 * Line-height scale — unitless multipliers.
 *
 * Usage: `lineHeight: LEADING.normal`
 */
export const LEADING = {
  /** 1.0 — single-line badges, icons */
  none:    1,
  /** 1.2 — display / hero text */
  tight:   1.2,
  /** 1.3 — headings */
  snug:    1.3,
  /** 1.4 — subheadings, cards */
  compact: 1.4,
  /** 1.5 — body text (default) */
  normal:  1.5,
  /** 1.6 — relaxed reading, descriptions */
  relaxed: 1.6,
} as const;

/**
 * Shadow tokens — consistent elevation levels.
 * Neutral color basis (31,41,46) so they work with any brand.
 *
 * Usage: `boxShadow: SHADOW.md`
 */
export const SHADOW = {
  /** Minimal lift — pressed states, subtle elements */
  sm:  "0px 1px 2px rgba(31,41,46,0.06)",
  /** Standard card / panel elevation — the workhorse */
  md:  "0px 1px 3px rgba(31,41,46,0.04), 0px 4px 12px rgba(31,41,46,0.06)",
  /** Raised elements — top bars, sticky headers */
  lg:  "0px 1px 7px rgba(31,41,46,0), 0px 4px 11px rgba(31,41,46,0.06)",
  /** Modals, overlays, floating panels */
  xl:  "0px 4px 16px rgba(31,41,46,0.08), 0px 12px 32px rgba(31,41,46,0.12)",
  /** Dramatic lift — full-screen dialogs, configurator */
  "2xl": "0px 16px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.5)",
} as const;

/**
 * Spacing scale — consistent gaps and padding.
 * Based on an 8px unit — the unified base for all spatial measurements.
 *
 * Usage: `padding: SPACE[6]`   → "48px"
 *        `gap: SPACE[3]`       → "24px"
 */
export const SPACE = {
  0:  "0px",
  1:  "8px",
  2:  "16px",
  3:  "24px",
  4:  "32px",
  5:  "40px",
  6:  "48px",
  8:  "64px",
  10: "80px",
  12: "96px",
  16: "128px",
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
 * SEMANTIC TEXT STYLES — pre-composed "style recipes"
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Each entry combines size + weight + lineHeight + letterSpacing into a
 * ready-to-spread CSSProperties object.  Color is intentionally omitted
 * because it depends on context (heading color, muted, inverse, etc.).
 *
 * Usage:
 *   <span style={{ ...TEXT_STYLE.cardTitle, color: theme.textHeading }}>
 *
 * The fontFamily is also omitted — it comes from theme.fontFamily at the
 * component level.  This keeps TEXT_STYLE brand-agnostic.
 *
 * ROLE MAPPING (updated for 6-step scale):
 *   pageTitle    → 26 / 700 / 1.3  — top-level screen headings
 *   sectionTitle → 22 / 700 / 1.3  — section headers inside a screen
 *   cardTitle    → 22 / 700 / 1.4  — card component titles (CareMe, etc.)
 *   subtitle     → 18 / 600 / 1.4  — secondary titles, slide titles
 *   body         → 18 / 400 / 1.5  — default running text
 *   bodyEmphasis → 18 / 600 / 1.5  — emphasized body (inline labels)
 *   label        → 14 / 600 / 1.3  — shortcuts, services, form labels
 *   caption      → 14 / 500 / 1.4  — timestamps, hints, secondary info
 *   micro        → 14 / 600 / 1.0  — top bar prayer names, small badges
 *   pill         → 14 / 600 / 1.2  — patient info pills (MRN, Room, Ext, allergies)
 *   button       → 22 / 700 / 1.0  — large button / CTA text
 *   buttonSm     → 18 / 600 / 1.0  — small button / link text (About Us, etc.)
 *   helper       → 14 / 400 / 1.4  — helper text, field hints
 *   display      → 30 / 700 / 1.2  — hero greetings, patient names
 */
export const TEXT_STYLE = {
  pageTitle:    { fontSize: TYPE_SCALE.lg,   fontWeight: WEIGHT.bold,      lineHeight: LEADING.snug,    letterSpacing: "-0.3px"  },
  sectionTitle: { fontSize: TYPE_SCALE.md,   fontWeight: WEIGHT.bold,      lineHeight: LEADING.snug,    letterSpacing: "-0.2px"  },
  cardTitle:    { fontSize: TYPE_SCALE.md,   fontWeight: WEIGHT.bold,      lineHeight: LEADING.compact, letterSpacing: "0px"     },
  subtitle:     { fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.semibold,  lineHeight: LEADING.compact, letterSpacing: "0px"     },
  body:         { fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.normal,    lineHeight: LEADING.normal,  letterSpacing: "0px"     },
  bodyEmphasis: { fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.semibold,  lineHeight: LEADING.normal,  letterSpacing: "0px"     },
  label:        { fontSize: TYPE_SCALE.sm,   fontWeight: WEIGHT.semibold,  lineHeight: LEADING.snug,    letterSpacing: "0.2px"   },
  caption:      { fontSize: TYPE_SCALE.sm,   fontWeight: WEIGHT.medium,    lineHeight: LEADING.compact, letterSpacing: "0px"     },
  micro:        { fontSize: TYPE_SCALE.sm,   fontWeight: WEIGHT.semibold,  lineHeight: LEADING.none,    letterSpacing: "0.3px"   },
  pill:         { fontSize: TYPE_SCALE.sm,   fontWeight: WEIGHT.semibold,  lineHeight: 1.2,             letterSpacing: "0px"     },
  button:       { fontSize: TYPE_SCALE.md,   fontWeight: WEIGHT.bold,      lineHeight: LEADING.none,    letterSpacing: "0px"     },
  buttonSm:     { fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.semibold,  lineHeight: LEADING.none,    letterSpacing: "0px"     },
  helper:       { fontSize: TYPE_SCALE.sm,   fontWeight: WEIGHT.normal,    lineHeight: LEADING.compact, letterSpacing: "0px"     },
  display:      { fontSize: TYPE_SCALE.xl,   fontWeight: WEIGHT.bold,      lineHeight: LEADING.tight,   letterSpacing: "-0.5px"  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
 * BRAND TOKENS — vary per hospital config
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface ThemeConfig {
  /* ── Meta ── */
  id: string;               // unique key, e.g. "dsfh", "kfmc"
  hospitalName: string;
  hospitalShortName: string;
  hospitalWebsiteUrl: string;

  /* ── Typography ── */
  fontFamily: string;        // Latin/primary — e.g. "'Mulish', sans-serif"
  fontFamilyAr: string;      // Arabic font  — e.g. "'Almarai', sans-serif"
  fontFamilyMono: string;

  /* ── Assets ── */
  logoUrl: string;           // hospital logo (360×190 recommended)
  heroImageUrl: string;      // hospital exterior photo (1920×600 recommended)
  heroImageUrls: string[];   // multiple hero images for carousel
  heroCropPosition: string;  // object-position for hero image crop, e.g. "50% 15%"

  /* ── Brand Colors ── */
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySubtle: string;     // primary @ 8% opacity — tinted backgrounds

  accent: string;
  accentDark: string;
  accentLight: string;
  accentSubtle: string;      // accent @ 6% opacity — tinted backgrounds

  /* ── Surfaces ── */
  background: string;
  surface: string;           // card / panel backgrounds
  surfaceElevated: string;
  overlay: string;           // modal backdrop
  panelBg: string;           // frosted-glass panels

  /* ── Text ── */
  textHeading: string;       // headings, primary text
  textBody: string;          // body paragraphs
  textMuted: string;         // secondary info, captions
  textDisabled: string;      // disabled / placeholder
  textInverse: string;       // text on dark/colored bg
  textInverseMuted: string;  // subtle text on dark bg

  /* ── Icons ── */
  iconDefault: string;       // neutral/muted icons
  iconBrand: string;         // branded / active icons (= primary)
  iconInverse: string;       // icons on dark/colored bg

  /* ── Interactive ── */
  tileActiveBg: string;
  tileInactiveBg: string;
  tileActiveText: string;
  tileInactiveText: string;
  sliderTrack: string;
  sliderThumb: string;
  sliderBg: string;
  checkboxActive: string;
  checkboxCheck: string;

  /* ── Borders ── */
  borderDefault: string;
  borderSubtle: string;
  borderActive: string;
  borderAccent: string;
  /** Pre-composed card border — "none" in light, subtle luminous edge in dark */
  cardBorder: string;

  /* ── Semantic Status ── */
  success: string;           // #22C55E — completed, positive
  successSubtle: string;     // success @ 8% — tinted backgrounds
  warning: string;           // #F59E0B — caution, in-progress
  warningSubtle: string;     // warning @ 8% — tinted backgrounds
  error: string;             // #EF4444 — destructive feedback (not actions)
  errorSubtle: string;       // error @ 8% — tinted backgrounds

  /* ── Gradients ── */
  gradientCanvas: string;    // main background gradient

  /* ── Layout ── */
  radiusSm: string;          // 8px  — small elements, badges
  radiusMd: string;          // 16px — buttons, inputs
  radiusLg: string;          // 24px — cards, panels
  radiusXl: string;          // 32px — large cards, modals
  radiusCard: string;        // 40px — primary cards (hub, greeting)
  radiusFull: string;        // 9999px — pills, avatars
  touchTargetMin: string;    // 48px — WCAG-compliant touch target (8px grid)
  cardPadding: string;       // 24px — unified card inner padding (SPACE[3])
  iconBg: string;            // tinted background for icon containers
}

/* ── Helper: build derived tokens from core brand values ── */
function buildTheme(core: {
  id: string;
  hospitalName: string;
  hospitalShortName: string;
  hospitalWebsiteUrl: string;
  fontFamily: string;
  fontFamilyAr: string;
  logoUrl: string;
  heroImageUrl: string;
  heroImageUrls?: string[];
  heroCropPosition?: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentDark: string;
  accentLight: string;
}, dark = false): ThemeConfig {
  const c = core;

  /* ── shared tokens (mode-independent) ── */
  const shared = {
    id: c.id,
    hospitalName: c.hospitalName,
    hospitalShortName: c.hospitalShortName,
    hospitalWebsiteUrl: c.hospitalWebsiteUrl,

    fontFamily: c.fontFamily,
    fontFamilyAr: c.fontFamilyAr,
    fontFamilyMono: `${c.fontFamily.split(",")[0]}, monospace`,

    logoUrl: c.logoUrl || (c.id === "dsfh" ? DSFH_LOGO : c.id === "burjeel" ? burjeelLogo : c.id === "slh" ? slhLogo : c.id === "dallah" ? dallahLogo : c.id === "caremed" ? caremedLogo : ""),
    heroImageUrl: c.heroImageUrl || (c.id === "dsfh" ? DSFH_HERO : c.id === "burjeel" ? burjeelHero : c.id === "slh" ? slhHero : c.id === "dallah" ? dallahHero : c.id === "caremed" ? caremedHero : ""),
    heroImageUrls: c.heroImageUrls && c.heroImageUrls.length > 0 ? c.heroImageUrls : [c.heroImageUrl || (c.id === "dsfh" ? DSFH_HERO : c.id === "burjeel" ? burjeelHero : c.id === "slh" ? slhHero : c.id === "dallah" ? dallahHero : c.id === "caremed" ? caremedHero : "")],
    heroCropPosition: c.heroCropPosition || "50% 15%",

    primary: c.primary,
    primaryDark: c.primaryDark,
    primaryLight: c.primaryLight,

    accent: c.accent,
    accentDark: c.accentDark,
    accentLight: c.accentLight,

    radiusSm: "8px",
    radiusMd: "16px",
    radiusLg: "24px",
    radiusXl: "32px",
    radiusCard: "40px",
    radiusFull: "9999px",
    touchTargetMin: "48px",
    cardPadding: "24px",
  };

  if (!dark) {
    /* ── LIGHT MODE ── */
    return {
      ...shared,
      primarySubtle: hexToRgba(c.primary, 0.08),
      accentSubtle: hexToRgba(c.accent, 0.06),

      background: "#FFFFFF",
      surface: "#FFFFFF",
      surfaceElevated: "#FFFFFF",
      overlay: "rgba(0,0,0,0.35)",
      panelBg: "rgba(255,255,255,0.97)",

      textHeading: "#1B2A32",
      textBody: "#1B2A32",
      textMuted: "#95A3AD",
      textDisabled: "#C0CAD0",
      textInverse: "#FFFFFF",
      textInverseMuted: "rgba(255,255,255,0.7)",

      iconDefault: "#95A3AD",
      iconBrand: c.primary,
      iconInverse: "#FFFFFF",

      tileActiveBg: c.primary,
      tileInactiveBg: "rgba(0,0,0,0.04)",
      tileActiveText: "#FFFFFF",
      tileInactiveText: "#95A3AD",
      sliderTrack: c.primary,
      sliderThumb: c.primary,
      sliderBg: "rgba(0,0,0,0.08)",
      checkboxActive: c.primary,
      checkboxCheck: "#FFFFFF",

      borderDefault: "rgba(0,0,0,0.06)",
      borderSubtle: "rgba(0,0,0,0.04)",
      borderActive: c.primary,
      borderAccent: hexToRgba(c.accent, 0.15),
      cardBorder: "none",

      gradientCanvas: `linear-gradient(160deg, ${c.primaryLight} 0%, ${lighten(c.primaryLight, 0.3)} 25%, ${lighten(c.primaryLight, 0.5)} 50%, ${lighten(c.primaryLight, 0.6)} 75%, ${lighten(c.primaryLight, 0.65)} 100%)`,

      iconBg: c.primaryLight,

      /* ── Semantic Status ── */
      success: "#22C55E",
      successSubtle: hexToRgba("#22C55E", 0.08),
      warning: "#F59E0B",
      warningSubtle: hexToRgba("#F59E0B", 0.08),
      error: "#EF4444",
      errorSubtle: hexToRgba("#EF4444", 0.08),
    };
  }

  /* ── DARK MODE ── */
  const DARK_BG       = "#0F1419";
  const DARK_SURFACE   = "#1A2027";
  const DARK_ELEVATED  = "#222B34";
  const DARK_TEXT      = "#E7EBED";
  const DARK_TEXT_SEC  = "#8B99A4";
  const DARK_MUTED     = "#5C6B77";
  const DARK_DISABLED  = "#3D4A54";

  return {
    ...shared,
    primarySubtle: hexToRgba(c.primary, 0.14),
    accentSubtle: hexToRgba(c.accent, 0.12),

    background: DARK_BG,
    surface: DARK_SURFACE,
    surfaceElevated: DARK_ELEVATED,
    overlay: "rgba(0,0,0,0.60)",
    panelBg: "rgba(18,22,27,0.97)",

    textHeading: DARK_TEXT,
    textBody: DARK_TEXT_SEC,
    textMuted: DARK_MUTED,
    textDisabled: DARK_DISABLED,
    textInverse: "#FFFFFF",
    textInverseMuted: "rgba(255,255,255,0.6)",

    iconDefault: DARK_MUTED,
    iconBrand: c.primary,
    iconInverse: "#FFFFFF",

    tileActiveBg: c.primary,
    tileInactiveBg: "rgba(255,255,255,0.06)",
    tileActiveText: "#FFFFFF",
    tileInactiveText: DARK_MUTED,
    sliderTrack: c.primary,
    sliderThumb: c.primary,
    sliderBg: "rgba(255,255,255,0.10)",
    checkboxActive: c.primary,
    checkboxCheck: "#FFFFFF",

    borderDefault: "rgba(255,255,255,0.08)",
    borderSubtle: "rgba(255,255,255,0.05)",
    borderActive: c.primary,
    borderAccent: hexToRgba(c.accent, 0.20),
    cardBorder: "1px solid rgba(255,255,255,0.05)",

    gradientCanvas: `linear-gradient(160deg, ${DARK_BG} 0%, #131920 30%, #161B22 60%, #1C2128 100%)`,

    iconBg: DARK_ELEVATED,

    /* ── Semantic Status ── */
    success: "#22C55E",
    successSubtle: hexToRgba("#22C55E", 0.08),
    warning: "#F59E0B",
    warningSubtle: hexToRgba("#F59E0B", 0.08),
    error: "#EF4444",
    errorSubtle: hexToRgba("#EF4444", 0.08),
  };
}

/* ── Color utilities ── */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lighten(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const r = Math.min(255, parseInt(h.substring(0, 2), 16) + Math.round(255 * amount));
  const g = Math.min(255, parseInt(h.substring(2, 4), 16) + Math.round(255 * amount));
  const b = Math.min(255, parseInt(h.substring(4, 6), 16) + Math.round(255 * amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Auto-derive dark variant (darken by ~22%) */
export function autoDarken(hex: string): string {
  const h = hex.replace("#", "");
  const r = Math.max(0, Math.round(parseInt(h.substring(0, 2), 16) * 0.78));
  const g = Math.max(0, Math.round(parseInt(h.substring(2, 4), 16) * 0.78));
  const b = Math.max(0, Math.round(parseInt(h.substring(4, 6), 16) * 0.78));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Auto-derive light tint (very pale version for backgrounds) */
export function autoLighten(hex: string): string {
  const h = hex.replace("#", "");
  const r = Math.min(255, parseInt(h.substring(0, 2), 16) + Math.round((255 - parseInt(h.substring(0, 2), 16)) * 0.87));
  const g = Math.min(255, parseInt(h.substring(2, 4), 16) + Math.round((255 - parseInt(h.substring(2, 4), 16)) * 0.87));
  const b = Math.min(255, parseInt(h.substring(4, 6), 16) + Math.round((255 - parseInt(h.substring(4, 6), 16)) * 0.87));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Generate rgba from theme primary for CSS usage (scrollbars, dynamic opacity) */
export function primaryRgba(theme: ThemeConfig, alpha: number): string {
  return hexToRgba(theme.primary, alpha);
}

/* ═══════════════════════════════════════════════════════════════════════════
 * BUILT-IN CONFIGS — the default hospital(s) that ship with the system
 * ═══════════════════════════════════════════════════════════════════════════ */

import logoImage from "../../assets/28090400fb8eb3cdd61dbc2fa0cb3ac1b1f479a1.png";
import hospitalImg from "../../assets/6b12d49b8fdc59d4a31417b20fc4c1d9751cd530.png";

import burjeelLogo from "../../assets/c8626cd3ed1ce90e9b3bab4a5f97a7315203f204.png";
import burjeelHero from "../../assets/6c870dc0bd960be4275cdbc07d5394bb50ec781e.png";
import slhLogo from "../../assets/000bda4db783fe15cbd489d69579eb6e0e831a8a.png";
import slhHero from "../../assets/e956f98cfa0d9f06f0dd2befe535fed91ed51d1e.png";

import dallahLogo from "../../assets/DallahLogo.png";
import dallahHero from "../../assets/dallah-hero-welcome.jpg";

import caremedLogo from "../../assets/CareMedicalLogo.png";
import caremedHero from "../../assets/CareMedicalHospital.jpeg";

/* Canonical built-in asset URLs — used as fallbacks for DSFH */
export const DSFH_LOGO = logoImage;
export const DSFH_HERO = hospitalImg;

/** Check if a URL is a user-provided asset (data URI or remote URL) vs a bundler path */
function isUserProvidedUrl(url: string): boolean {
  return url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://");
}

export const DSFH_CORE: HospitalCoreConfig = {
  id: "dsfh",
  hospitalName: "Dr. Soliman Fakeeh Hospital",
  hospitalShortName: "DSFH",
  fontFamily: "'Mulish', sans-serif",
  fontFamilyAr: "'Almarai', sans-serif",
  logoUrl: logoImage,
  hospitalWebsiteUrl: "https://en.dsfhjeddah.fakeeh.care/",
  heroImageUrl: hospitalImg,
  primary: "#008AAB",
  primaryDark: "#006B85",
  primaryLight: "#DEF4F7",
  accent: "#D10044",
  accentDark: "#A80037",
  accentLight: "#FDE8EF",
};

/* ── Additional Built-in Hospital Presets ── */
export const BURJEEL_CORE: HospitalCoreConfig = {
  id: "burjeel",
  hospitalName: "Burjeel Hospital",
  hospitalShortName: "Burjeel",
  fontFamily: "'Montserrat', sans-serif",
  fontFamilyAr: "'Almarai', sans-serif",
  logoUrl: burjeelLogo,
  hospitalWebsiteUrl: "https://burjeel.com/abu-dhabi/",
  heroImageUrl: burjeelHero,
  primary: "#8C124B",
  primaryDark: "#6D0E3B",
  primaryLight: "#F0E0E8",
  accent: "#C8A951",
  accentDark: "#9C843F",
  accentLight: "#F8F4E8",
};

export const SLH_CORE: HospitalCoreConfig = {
  id: "slh",
  hospitalName: "Saint Louis Hospital",
  hospitalShortName: "SLH",
  fontFamily: "'Poppins', sans-serif",
  fontFamilyAr: "'Almarai', sans-serif",
  logoUrl: slhLogo,
  hospitalWebsiteUrl: "https://www.slouishospital.com/en",
  heroImageUrl: slhHero,
  heroCropPosition: "50% 65%",
  primary: "#212556",
  primaryDark: "#1A1D43",
  primaryLight: "#E2E3E9",
  accent: "#2678AD",
  accentDark: "#1E5E87",
  accentLight: "#E3EDF4",
};

export const DALLAH_CORE: HospitalCoreConfig = {
  id: "dallah",
  hospitalName: "Dallah Hospital",
  hospitalShortName: "Dallah",
  fontFamily: "'Mulish', sans-serif",
  fontFamilyAr: "'Almarai', sans-serif",
  logoUrl: dallahLogo,
  hospitalWebsiteUrl: "https://www.dallah-hospital.com/english/home",
  heroImageUrl: dallahHero,
  heroCropPosition: "50% 45%",
  primary: "#004B8D",
  primaryDark: "#003A6E",
  primaryLight: "#E6EEF5",
  accent: "#FDB913",
  accentDark: "#C5900F",
  accentLight: "#FFF6E0",
};

export const CAREMED_CORE: HospitalCoreConfig = {
  id: "caremed",
  hospitalName: "Care Medical",
  hospitalShortName: "Care Med",
  fontFamily: "'Mulish', sans-serif",
  fontFamilyAr: "'Almarai', sans-serif",
  logoUrl: caremedLogo,
  hospitalWebsiteUrl: "https://burjeel.com/abu-dhabi/",
  heroImageUrl: caremedHero,
  primary: "#1D234D",
  primaryDark: "#121631",
  primaryLight: "#E8EAF6",
  accent: "#00A3C1",
  accentDark: "#007A91",
  accentLight: "#E0F7FA",
};

/** All built-in hospital presets (always available, never deleted) */
export const BUILTIN_PRESETS: HospitalCoreConfig[] = [
  DSFH_CORE,
  BURJEEL_CORE,
  SLH_CORE,
  DALLAH_CORE,
  CAREMED_CORE,
];

const DSFH_THEME = buildTheme(DSFH_CORE);

/* ── Serializable core config (what we save to localStorage) ── */
export interface HospitalCoreConfig {
  id: string;
  hospitalName: string;
  hospitalShortName: string;
  hospitalWebsiteUrl: string;
  fontFamily: string;
  fontFamilyAr: string;
  logoUrl: string;
  heroImageUrl: string;
  heroImageUrls?: string[];
  heroCropPosition?: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentDark: string;
  accentLight: string;
}

const STORAGE_KEY = "hospital-configs";
const ACTIVE_KEY = "active-hospital-id";

function loadSavedConfigs(): HospitalCoreConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveConfigs(configs: HospitalCoreConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

function loadActiveId(): string {
  return localStorage.getItem(ACTIVE_KEY) || "dsfh";
}

function saveActiveId(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
}

/* ── Context Type ── */
interface ThemeContextType {
  theme: ThemeConfig;
  allConfigs: HospitalCoreConfig[];
  activeConfigId: string;
  switchConfig: (id: string) => void;
  saveConfig: (config: HospitalCoreConfig) => void;
  deleteConfig: (id: string) => void;
  patientAdmitted: boolean;
  setPatientAdmitted: (v: boolean) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  castDevice: string | null;
  setCastDevice: (v: string | null) => void;
  locale: Locale;
  setLocale: (v: Locale) => void;
  prayerAlarm: boolean;
  setPrayerAlarm: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DSFH_THEME,
  allConfigs: [DSFH_CORE],
  activeConfigId: "dsfh",
  switchConfig: () => {},
  saveConfig: () => {},
  deleteConfig: () => {},
  patientAdmitted: true,
  setPatientAdmitted: () => {},
  darkMode: false,
  setDarkMode: () => {},
  castDevice: null,
  setCastDevice: () => {},
  locale: "en",
  setLocale: () => {},
  prayerAlarm: true,
  setPrayerAlarm: () => {},
});

/* ── Inject CSS Custom Properties ──
 * Prefix: --hbs-  (Hospital Bedside System)
 * These are available globally for non-React consumers (CSS, third-party widgets).
 */
function injectCSSVars(t: ThemeConfig) {
  const root = document.documentElement;
  const vars: Record<string, string> = {
    "--hbs-font":              t.fontFamily,
    "--hbs-font-ar":           t.fontFamilyAr,
    "--hbs-font-mono":         t.fontFamilyMono,
    "--hbs-primary":           t.primary,
    "--hbs-primary-dark":      t.primaryDark,
    "--hbs-primary-light":     t.primaryLight,
    "--hbs-primary-subtle":    t.primarySubtle,
    "--hbs-accent":            t.accent,
    "--hbs-accent-dark":       t.accentDark,
    "--hbs-accent-light":      t.accentLight,
    "--hbs-accent-subtle":     t.accentSubtle,
    "--hbs-bg":                t.background,
    "--hbs-surface":           t.surface,
    "--hbs-surface-elevated":  t.surfaceElevated,
    "--hbs-overlay":           t.overlay,
    "--hbs-panel-bg":          t.panelBg,
    "--hbs-text-heading":      t.textHeading,
    "--hbs-text-body":         t.textBody,
    "--hbs-text-muted":        t.textMuted,
    "--hbs-text-disabled":     t.textDisabled,
    "--hbs-text-inverse":      t.textInverse,
    "--hbs-icon-default":      t.iconDefault,
    "--hbs-icon-brand":        t.iconBrand,
    "--hbs-border":            t.borderDefault,
    "--hbs-border-subtle":     t.borderSubtle,
    "--hbs-border-active":     t.borderActive,
    "--hbs-tile-active":       t.tileActiveBg,
    "--hbs-tile-inactive":     t.tileInactiveBg,
    "--hbs-slider-track":      t.sliderTrack,
    "--hbs-slider-thumb":      t.sliderThumb,
    "--hbs-gradient-canvas":   t.gradientCanvas,
    "--hbs-radius-sm":         t.radiusSm,
    "--hbs-radius-md":         t.radiusMd,
    "--hbs-radius-lg":         t.radiusLg,
    "--hbs-radius-xl":         t.radiusXl,
    "--hbs-radius-card":       t.radiusCard,
    "--hbs-touch-min":         t.touchTargetMin,
    "--hbs-card-padding":      t.cardPadding,
    "--hbs-icon-bg":           t.iconBg,
    "--hbs-success":           t.success,
    "--hbs-success-subtle":    t.successSubtle,
    "--hbs-warning":           t.warning,
    "--hbs-warning-subtle":    t.warningSubtle,
    "--hbs-error":             t.error,
    "--hbs-error-subtle":      t.errorSubtle,
  };
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

/* ── Provider ── */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [savedConfigs, setSavedConfigs] = useState<HospitalCoreConfig[]>(() => loadSavedConfigs());
  const [activeId, setActiveId] = useState(() => loadActiveId());
  const [patientAdmitted, setPatientAdmitted] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [castDevice, setCastDevice] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>("en");
  const [prayerAlarm, setPrayerAlarm] = useState(() => {
    const saved = localStorage.getItem("prayer-alarm");
    return saved === null ? true : saved === "true";
  });

  const updatePrayerAlarm = (val: boolean) => {
    setPrayerAlarm(val);
    localStorage.setItem("prayer-alarm", val ? "true" : "false");
  };

  // All configs = built-in presets (overridable by saved versions) + user-created configs
  const allConfigs: HospitalCoreConfig[] = (() => {
    // Start with built-in presets, applying any saved overrides
    const merged = BUILTIN_PRESETS.map((preset) => {
      const saved = savedConfigs.find((c) => c.id === preset.id);
      if (!saved) return preset;
      const hasBuiltinAssets = ["dsfh", "burjeel", "slh", "dallah", "caremed"].includes(preset.id);
      return {
        ...preset,
        ...saved,
        // For presets with bundled assets, keep them unless user provided external URLs
        logoUrl: hasBuiltinAssets
          ? (saved.logoUrl && isUserProvidedUrl(saved.logoUrl) ? saved.logoUrl : preset.logoUrl)
          : (saved.logoUrl || preset.logoUrl),
        heroImageUrl: hasBuiltinAssets
          ? (saved.heroImageUrl && isUserProvidedUrl(saved.heroImageUrl) ? saved.heroImageUrl : preset.heroImageUrl)
          : (saved.heroImageUrl || preset.heroImageUrl),
      };
    });
    // Add any user-created configs that aren't built-in presets
    const builtinIds = new Set(BUILTIN_PRESETS.map((p) => p.id));
    const userCreated = savedConfigs.filter((c) => !builtinIds.has(c.id));
    return [...merged, ...userCreated];
  })();

  // Resolve active config → theme
  const activeCore = allConfigs.find((c) => c.id === activeId) || DSFH_CORE;
  const baseTheme = buildTheme(activeCore, darkMode);
  // Override fontFamily based on active locale so every component using
  // theme.fontFamily automatically gets the correct Arabic/English font.
  const theme = useMemo(() => ({
    ...baseTheme,
    fontFamily: locale === "ar" ? baseTheme.fontFamilyAr : baseTheme.fontFamily,
  }), [baseTheme, locale]);

  // Inject CSS vars on theme change
  useEffect(() => {
    injectCSSVars(theme);
  }, [activeId, savedConfigs, darkMode, locale]);

  const switchConfig = useCallback((id: string) => {
    setActiveId(id);
    saveActiveId(id);
  }, []);

  const saveConfigFn = useCallback((config: HospitalCoreConfig) => {
    const hasBuiltinAssets = ["dsfh", "burjeel", "slh", "dallah", "caremed"].includes(config.id);
    const toSave = hasBuiltinAssets
      ? {
          ...config,
          logoUrl: isUserProvidedUrl(config.logoUrl) ? config.logoUrl : "",
          heroImageUrl: isUserProvidedUrl(config.heroImageUrl) ? config.heroImageUrl : "",
          heroImageUrls: config.heroImageUrls?.filter(isUserProvidedUrl),
        }
      : config;

    setSavedConfigs((prev) => {
      const filtered = prev.filter((c) => c.id !== toSave.id);
      const next = [...filtered, toSave];
      saveConfigs(next);
      return next;
    });
    setActiveId(config.id);
    saveActiveId(config.id);
  }, []);

  const deleteConfigFn = useCallback((id: string) => {
    // Don't allow deleting built-in presets (only remove saved overrides)
    const isBuiltin = BUILTIN_PRESETS.some((p) => p.id === id);
    setSavedConfigs((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveConfigs(next);
      return next;
    });
    if (activeId === id && !isBuiltin) {
      setActiveId("dsfh");
      saveActiveId("dsfh");
    }
  }, [activeId]);

  return (
    <ThemeContext.Provider value={{
      theme,
      allConfigs,
      activeConfigId: activeId,
      switchConfig,
      saveConfig: saveConfigFn,
      deleteConfig: deleteConfigFn,
      patientAdmitted,
      setPatientAdmitted,
      darkMode,
      setDarkMode,
      castDevice,
      setCastDevice,
      locale,
      setLocale,
      prayerAlarm,
      setPrayerAlarm: updatePrayerAlarm,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { buildTheme };