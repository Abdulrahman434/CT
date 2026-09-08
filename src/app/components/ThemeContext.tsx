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
  sm: "14px",
  /** 18px — body text, descriptions, UI controls (primary reading size) */
  base: "18px",
  /** 22px — emphasized text, buttons, card titles */
  md: "22px",
  /** 26px — section headers, page titles */
  lg: "26px",
  /** 30px — patient name, hero text */
  xl: "30px",
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
  normal: 400,
  /** 500 — medium emphasis, subtitles */
  medium: 500,
  /** 600 — labels, badges, nav items */
  semibold: 600,
  /** 700 — titles, buttons, card names */
  bold: 700,
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
  none: 1,
  /** 1.2 — display / hero text */
  tight: 1.2,
  /** 1.3 — headings */
  snug: 1.3,
  /** 1.4 — subheadings, cards */
  compact: 1.4,
  /** 1.5 — body text (default) */
  normal: 1.5,
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
  sm: "0px 1px 2px rgba(31,41,46,0.06)",
  /** Standard card / panel elevation — the workhorse */
  md: "0px 1px 3px rgba(31,41,46,0.04), 0px 4px 12px rgba(31,41,46,0.06)",
  /** Raised elements — top bars, sticky headers */
  lg: "0px 1px 7px rgba(31,41,46,0), 0px 4px 11px rgba(31,41,46,0.06)",
  /** Modals, overlays, floating panels */
  xl: "0px 4px 16px rgba(31,41,46,0.08), 0px 12px 32px rgba(31,41,46,0.12)",
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
  0: "0px",
  1: "8px",
  2: "16px",
  3: "24px",
  4: "32px",
  5: "40px",
  6: "48px",
  8: "64px",
  10: "80px",
  12: "96px",
  16: "128px",
  20: "160px",
  24: "192px",
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
  pageTitle: { fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, lineHeight: LEADING.snug, letterSpacing: "-0.3px" },
  sectionTitle: { fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.bold, lineHeight: LEADING.snug, letterSpacing: "-0.2px" },
  cardTitle: { fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.bold, lineHeight: LEADING.compact, letterSpacing: "0px" },
  subtitle: { fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.semibold, lineHeight: LEADING.compact, letterSpacing: "0px" },
  body: { fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.normal, lineHeight: LEADING.normal, letterSpacing: "0px" },
  bodyEmphasis: { fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.semibold, lineHeight: LEADING.normal, letterSpacing: "0px" },
  label: { fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.semibold, lineHeight: LEADING.snug, letterSpacing: "0.2px" },
  caption: { fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.medium, lineHeight: LEADING.compact, letterSpacing: "0px" },
  micro: { fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.semibold, lineHeight: LEADING.none, letterSpacing: "0.3px" },
  pill: { fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.semibold, lineHeight: 1.2, letterSpacing: "0px" },
  button: { fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.bold, lineHeight: LEADING.none, letterSpacing: "0px" },
  buttonSm: { fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.semibold, lineHeight: LEADING.none, letterSpacing: "0px" },
  helper: { fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.normal, lineHeight: LEADING.compact, letterSpacing: "0px" },
  display: { fontSize: TYPE_SCALE.xl, fontWeight: WEIGHT.bold, lineHeight: LEADING.tight, letterSpacing: "-0.5px" },
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
  slideshowInterval: number; // custom interval for slides in seconds
  heroOpacity: number;       // background photo opacity, percent 0–100 (default 40)
  location: string;
  country: string;

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
  textNormal: string;        // primary text (alias for textHeading)
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

  /** Inset panel *inside* a card (a section block, a grouped list). Neutral
   *  rather than brand-tinted, and mode-aware so the edge stays visible in
   *  dark mode — hardcoded rgba(0,0,0,…) borders vanish there. */
  surfaceInset: string;
  borderInset: string;

  /* ── Engagement tiles (hub + service grid) ──
   * All derived from `primary` so every brand gets the same treatment.
   * Bottom-row (filled) tiles pair `primary` with `brandOnPrimary`. */
  /** Accessible text/icon color on a `primary` fill */
  brandOnPrimary: string;
  /** Accessible text/icon color on an `accent` fill */
  brandOnAccent: string;

  /* ── Foreground-safe brand colors ──────────────────────────────────────────
   * Use these for TEXT, ICONS and BORDERS drawn *in* the brand color on an app
   * surface. In light mode they are the brand hex; in dark mode they are the
   * same hue lifted until it clears AA on the lightest surface it can land on.
   * `primary`/`accent` stay raw and remain correct for FILLS, which pair with
   * `brandOnPrimary`/`brandOnAccent`. */
  primaryOn: string;
  accentOn: string;
  /** Brand foreground for surfaces that stay LIGHT in both modes (hardcoded
   *  white cards, printed-style panels). Always derived against white, so it
   *  does not get lifted when dark mode is active. */
  primaryOnLight: string;
  accentOnLight: string;

  /** Full-bleed inner-page backdrop (Social, Games, About Us, Food, Call…).
   *  Brand-saturated in light mode; brand-tinted but genuinely dark in dark
   *  mode, so inner pages stop looking identical in both themes. */
  pageGradient: string;
  /** Two-stop variant for panels that don't need the deep third stop */
  pageGradientFlat: string;

  /** Contrast-safe semantic colors for TEXT and ICONS. `success`/`warning`/
   *  `error`/`info` stay raw for fills and pair with `onSuccess` etc. */
  successOn: string;
  warningOn: string;
  errorOn: string;
  infoOn: string;
  /** Semantic foregrounds for surfaces that stay LIGHT in both modes
   *  (hardcoded pale chips such as the #FEE2E2 logout pill). */
  successOnLight: string;
  warningOnLight: string;
  errorOnLight: string;
  infoOnLight: string;

  /* ── Interaction states — derived per brand color, never hardcoded ── */
  primaryHover: string;      primaryHoverOn: string;
  primaryActive: string;     primaryActiveOn: string;
  primarySelected: string;   primaryBorder: string;
  accentHover: string;       accentHoverOn: string;
  accentActive: string;      accentActiveOn: string;
  accentSelected: string;
  focusRing: string;         // visible outline on this mode's surface
  disabledBg: string;        disabledOn: string;
  /** Accessible foregrounds for the semantic fills */
  onSuccess: string; onWarning: string; onError: string; onInfo: string;
  /** true when a supplied brand color had to be shifted to stay accessible */
  brandAdjusted: boolean;
  /** Base surface behind an engagement tile */
  engagementSurface: string;
  /** Top gradient: primary tint fading into the surface at 58% */
  engagementCardGradient: string;
  /** Pre-composed 1px tile border */
  engagementCardBorder: string;
  /** Icon-container fill for the 8 hub tiles */
  engagementIconBg: string;
  /** 1px stroke around the rounded icon container (not the glyph) */
  engagementIconStroke: string;
  /** Glyph color for the 8 hub tiles */
  engagementIconColor: string;
  /** Solid fill for the filled (bottom-row) icon containers — guaranteed to
   *  separate from the card even when the brand color matches the surface */
  engagementFill: string;
  /** Accessible glyph color on `engagementFill` */
  engagementOnFill: string;
  /** Opaque color at the top of the card gradient */
  engagementTint: string;
  /** Card gradient for SHORT cards — the tint clears earlier so the surface
   *  still reads on a low card instead of being swamped by brand color. */
  engagementCardGradientShort: string;

  /* ── Semantic Status ── */
  success: string;           // #22C55E — completed, positive
  successSubtle: string;     // success @ 8% — tinted backgrounds
  warning: string;           // #F59E0B — caution, in-progress
  warningSubtle: string;     // warning @ 8% — tinted backgrounds
  error: string;             // #EF4444 — destructive feedback (not actions)
  errorSubtle: string;       // error @ 8% — tinted backgrounds
  info: string;              // #3B82F6 — informational / in-progress (blue)
  infoSubtle: string;        // info @ 8% — tinted backgrounds

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
  logoUrlDark?: string;
  heroImageUrl: string;
  heroImageUrls?: string[];
  heroCropPosition?: string;
  slideshowInterval?: number;
  heroOpacity?: number;
  primary: string;
  primaryDark?: string;
  primaryLight?: string;
  accent: string;
  accentDark?: string;
  accentLight?: string;
}, dark = false): ThemeConfig {
  // Normalize first: every downstream token assumes a parseable #rrggbb, and a
  // brand may supply anything. Light/dark variants are optional — auto-derived
  // when absent so a config needs only Primary + Accent.
  const c = {
    ...core,
    primary: normalizeHex(core.primary),
    accent: normalizeHex(core.accent, "#7A6A58"),
    primaryDark: normalizeHex(core.primaryDark, autoDarken(normalizeHex(core.primary))),
    primaryLight: normalizeHex(core.primaryLight, autoLighten(normalizeHex(core.primary))),
    accentDark: normalizeHex(core.accentDark, autoDarken(normalizeHex(core.accent, "#7A6A58"))),
    accentLight: normalizeHex(core.accentLight, autoLighten(normalizeHex(core.accent, "#7A6A58"))),
  };

  /* ── shared tokens (mode-independent) ── */
  const shared = {
    id: c.id,
    hospitalName: c.hospitalName,
    hospitalShortName: c.hospitalShortName,
    hospitalWebsiteUrl: c.hospitalWebsiteUrl,

    fontFamily: c.fontFamily,
    fontFamilyAr: c.fontFamilyAr,
    fontFamilyMono: `${c.fontFamily.split(",")[0]}, monospace`,

    // Dark mode prefers a light-on-dark mark when the brand supplies one.
    logoUrl: (dark && c.logoUrlDark) || c.logoUrl || (c.id === "dsfh" ? DSFH_LOGO : c.id === "burjeel" ? burjeelLogo : c.id === "slh" ? slhLogo : c.id === "dallah" ? dallahLogo : c.id === "caremed" ? caremedLogo : c.id === "imc" ? imcLogo : c.id === "careinn" ? careinnLogo : c.id === "prime" ? primeLogo : c.id === "kauh" ? kauhLogo : c.id === "andalusia" ? andalusiaLogo : ""),
    heroImageUrl: c.heroImageUrl || (c.id === "dsfh" ? DSFH_HERO : c.id === "burjeel" ? burjeelHero : c.id === "slh" ? slhHero : c.id === "dallah" ? dallahHero : c.id === "caremed" ? caremedHero : c.id === "imc" ? imcHero : c.id === "careinn" ? careinnHero : c.id === "prime" ? primeHero : c.id === "kauh" ? kauhHero : c.id === "andalusia" ? andalusiaHero : ""),
    heroImageUrls: c.heroImageUrls && c.heroImageUrls.length > 0 ? c.heroImageUrls : [c.heroImageUrl || (c.id === "dsfh" ? DSFH_HERO : c.id === "burjeel" ? burjeelHero : c.id === "slh" ? slhHero : c.id === "dallah" ? dallahHero : c.id === "caremed" ? caremedHero : c.id === "imc" ? imcHero : c.id === "careinn" ? careinnHero : c.id === "prime" ? primeHero : c.id === "kauh" ? kauhHero : c.id === "andalusia" ? andalusiaHero : "")],
    heroCropPosition: c.heroCropPosition || "50% 15%",
    slideshowInterval: c.slideshowInterval || 5,
    heroOpacity: c.heroOpacity ?? 40,
    location: (c as any).location || "Riyadh",
    country: (c as any).country ||
      ({ "Jeddah": "Saudi Arabia", "Riyadh": "Saudi Arabia", "Abu Dhabi": "United Arab Emirates", "Dubai": "United Arab Emirates", "Beirut": "Lebanon" } as Record<string, string>)[(c as any).location || "Riyadh"] ||
      "Saudi Arabia",

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
    const P = fillSet(c.primary, "#FFFFFF", false);
    const A = fillSet(c.accent, "#FFFFFF", false);
    // Brand text/icons in light mode land on white or on a pale brand tint;
    // the tint is darker, so it is the binding backdrop for dark ink.
    const ENG_L = engagementTokens(c.primary, c.accent, "#FFFFFF", {
      tint: 0.09, border: 0.18, iconBg: 0.06, stroke: 0.35,
      minBorder: 1.35, minIconBg: 1.05, minStroke: 1.7, minGlyph: 4.5,
    });
    const chipOnTintL = overlayHex(P.seed, P.subtleAlpha, ENG_L.engagementTint);
    const backdropsL = ["#FFFFFF", "#F8F8F8", "#F9FAFB", P.subtleSolid, A.subtleSolid,
      ENG_L.engagementTint, chipOnTintL];
    const pBackdropL = worstBackdrop(
      ["#FFFFFF", P.subtleSolid, A.subtleSolid, ENG_L.engagementTint, chipOnTintL], false);
    return {
      ...shared,
      primarySubtle: P.subtle,
      accentSubtle: A.subtle,
      primaryOn: ensureContrastAll(c.primary, backdropsL, 4.5),
      accentOn: ensureContrastAll(c.accent, backdropsL, 4.5),
      surfaceInset: "rgba(0,0,0,0.026)",
      borderInset: `1px solid ${hexToRgba("#1B2A32", 0.12)}`,
      primaryOnLight: ensureContrast(c.primary, "#FFFFFF", 4.5),
      accentOnLight: ensureContrast(c.accent, "#FFFFFF", 4.5),
      pageGradient: `linear-gradient(160deg, ${c.primary} 0%, ${c.primaryDark} 40%, #0a1628 100%)`,
      pageGradientFlat: `linear-gradient(160deg, ${c.primary} 0%, ${c.primaryDark} 100%)`,
      successOn: ensureContrast("#22C55E", pBackdropL, 4.5),
      warningOn: ensureContrast("#F59E0B", pBackdropL, 4.5),
      errorOn: ensureContrast("#EF4444", pBackdropL, 4.5),
      infoOn: ensureContrast("#3B82F6", pBackdropL, 4.5),
      successOnLight: ensureContrast("#22C55E", "#FFFFFF", 4.5),
      warningOnLight: ensureContrast("#F59E0B", "#FFFFFF", 4.5),
      errorOnLight: ensureContrast("#EF4444", "#FFFFFF", 4.5),
      infoOnLight: ensureContrast("#3B82F6", "#FFFFFF", 4.5),
      ...stateTokens(P, A, "#FFFFFF"),

      background: "#FFFFFF",
      surface: "#FFFFFF",
      surfaceElevated: "#FFFFFF",
      overlay: "rgba(0,0,0,0.35)",
      panelBg: "rgba(255,255,255,0.97)",

      textHeading: "#1B2A32",
      textBody: "#1B2A32",
      textNormal: "#1B2A32",
      textMuted: ensureContrastAll("#95A3AD", backdropsL, 4.5),
      textDisabled: ensureContrastAll("#C0CAD0", backdropsL, 3),
      textInverse: "#FFFFFF",
      textInverseMuted: "rgba(255,255,255,0.7)",

      iconDefault: ensureContrast("#95A3AD", "#FFFFFF", 3),
      iconBrand: ensureContrast(c.primary, "#FFFFFF", 3),
      iconInverse: "#FFFFFF",

      tileActiveBg: c.primary,
      tileInactiveBg: "rgba(0,0,0,0.04)",
      tileActiveText: P.on,
      tileInactiveText: ensureContrast("#95A3AD", "#FFFFFF", 4.5),
      sliderTrack: c.primary,
      sliderThumb: c.primary,
      sliderBg: "rgba(0,0,0,0.08)",
      checkboxActive: c.primary,
      checkboxCheck: P.on,

      borderDefault: "rgba(0,0,0,0.06)",
      borderSubtle: "rgba(0,0,0,0.04)",
      borderActive: c.primary,
      borderAccent: A.border,
      cardBorder: "none",

      ...ENG_L,

      gradientCanvas: `linear-gradient(160deg, ${c.primaryLight} 0%, ${lighten(c.primaryLight, 0.3)} 25%, ${lighten(c.primaryLight, 0.5)} 50%, ${lighten(c.primaryLight, 0.6)} 75%, ${lighten(c.primaryLight, 0.65)} 100%)`,

      iconBg: c.primaryLight,

      /* ── Semantic Status ── */
      success: "#22C55E",
      successSubtle: hexToRgba("#22C55E", 0.08),
      warning: "#F59E0B",
      warningSubtle: hexToRgba("#F59E0B", 0.08),
      error: "#EF4444",
      errorSubtle: hexToRgba("#EF4444", 0.08),
      info: "#3B82F6",
      infoSubtle: hexToRgba("#3B82F6", 0.08),
    };
  }

  /* ── DARK MODE ── */
  const DARK_BG = "#0F1419";
  const DARK_SURFACE = "#1A2027";
  const ENGAGEMENT_DARK_SURFACE = "#1B2227";
  const DARK_ELEVATED = "#222B34";
  const DARK_TEXT = "#E7EBED";
  const DARK_TEXT_SEC = "#8B99A4";
  // Lifted until legible on the lightest dark backdrop (DARK_ELEVATED), so the
  // same value stays readable on every darker one. Hue is preserved.
  const PD = fillSet(c.primary, DARK_SURFACE, true);
  const AD = fillSet(c.accent, DARK_SURFACE, true);
  // Muted/disabled text also lands on brand-tinted chips and tiles, which are
  // lighter than the plain card — include those in the backdrop set so the
  // floor holds for every brand, not just on the neutral surface.
  const ENG_D = engagementTokens(c.primary, c.accent, ENGAGEMENT_DARK_SURFACE, {
    tint: 0.17, border: 0.22, iconBg: 0.11, stroke: 0.55,
    minBorder: 1.55, minIconBg: 1.22, minStroke: 2.0, minGlyph: 4.5,
  });
  // Deepest real stack: a brand-tinted chip drawn on the card's gradient top.
  const chipOnTintD = overlayHex(PD.seed, PD.subtleAlpha, ENG_D.engagementTint);
  const backdropsD = [DARK_SURFACE, ENGAGEMENT_DARK_SURFACE, DARK_ELEVATED,
    PD.subtleSolid, AD.subtleSolid, ENG_D.engagementTint, chipOnTintD];
  const neutralBackdropD = worstBackdrop(
    [DARK_SURFACE, ENGAGEMENT_DARK_SURFACE, DARK_ELEVATED,
     PD.subtleSolid, AD.subtleSolid, ENG_D.engagementTint, chipOnTintD], true);
  const DARK_MUTED = ensureContrastAll("#5C6B77", backdropsD, 4.5);
  const DARK_DISABLED = ensureContrastAll("#3D4A54", backdropsD, 3);
  // In dark mode brand text/icons sit on the card, the elevated panel, or a
  // brand-tinted chip. The lightest of those decides how far we must lift.
  const pBackdropD = neutralBackdropD;

  return {
    ...shared,
    primarySubtle: PD.subtle,
    accentSubtle: AD.subtle,
    primaryOn: ensureContrastAll(c.primary, backdropsD, 4.5),
    accentOn: ensureContrastAll(c.accent, backdropsD, 4.5),
    surfaceInset: "rgba(255,255,255,0.045)",
    borderInset: `1px solid ${hexToRgba("#FFFFFF", 0.14)}`,
    primaryOnLight: ensureContrast(c.primary, "#FFFFFF", 4.5),
    accentOnLight: ensureContrast(c.accent, "#FFFFFF", 4.5),
    pageGradient: `linear-gradient(160deg, ${mixHex(c.primary, DARK_BG, 0.34)} 0%, ${mixHex(c.primary, DARK_BG, 0.16)} 45%, ${DARK_BG} 100%)`,
    pageGradientFlat: `linear-gradient(160deg, ${mixHex(c.primary, DARK_BG, 0.34)} 0%, ${mixHex(c.primary, DARK_BG, 0.12)} 100%)`,
    successOn: ensureContrast("#22C55E", pBackdropD, 4.5),
    warningOn: ensureContrast("#F59E0B", pBackdropD, 4.5),
    errorOn: ensureContrast("#EF4444", pBackdropD, 4.5),
    infoOn: ensureContrast("#3B82F6", pBackdropD, 4.5),
    successOnLight: ensureContrast("#22C55E", "#FFFFFF", 4.5),
    warningOnLight: ensureContrast("#F59E0B", "#FFFFFF", 4.5),
    errorOnLight: ensureContrast("#EF4444", "#FFFFFF", 4.5),
    infoOnLight: ensureContrast("#3B82F6", "#FFFFFF", 4.5),
    ...stateTokens(PD, AD, DARK_SURFACE),

    background: DARK_BG,
    surface: DARK_SURFACE,
    surfaceElevated: DARK_ELEVATED,
    overlay: "rgba(0,0,0,0.60)",
    panelBg: "rgba(18,22,27,0.97)",

    textHeading: DARK_TEXT,
    textBody: DARK_TEXT_SEC,
    textNormal: DARK_TEXT,
    textMuted: DARK_MUTED,
    textDisabled: DARK_DISABLED,
    textInverse: "#FFFFFF",
    textInverseMuted: "rgba(255,255,255,0.6)",

    iconDefault: DARK_MUTED,
    iconBrand: ensureContrast(c.primary, DARK_SURFACE, 3),
    iconInverse: "#FFFFFF",

    tileActiveBg: c.primary,
    tileInactiveBg: "rgba(255,255,255,0.06)",
    tileActiveText: PD.on,
    tileInactiveText: DARK_MUTED,
    sliderTrack: c.primary,
    sliderThumb: c.primary,
    sliderBg: "rgba(255,255,255,0.10)",
    checkboxActive: c.primary,
    checkboxCheck: PD.on,

    borderDefault: "rgba(255,255,255,0.08)",
    borderSubtle: "rgba(255,255,255,0.05)",
    borderActive: c.primary,
    borderAccent: AD.border,
    cardBorder: "1px solid rgba(255,255,255,0.05)",

    ...ENG_D,

    gradientCanvas: `linear-gradient(160deg, ${DARK_BG} 0%, #131920 30%, #161B22 60%, #1C2128 100%)`,

    iconBg: DARK_ELEVATED,

    /* ── Semantic Status ── */
    success: "#22C55E",
    successSubtle: hexToRgba("#22C55E", 0.08),
    warning: "#F59E0B",
    warningSubtle: hexToRgba("#F59E0B", 0.08),
    error: "#EF4444",
    errorSubtle: hexToRgba("#EF4444", 0.08),
    info: "#3B82F6",
    infoSubtle: hexToRgba("#3B82F6", 0.08),
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

/** Mix `hex` into `base` at `amount` (0–1 share of `hex`) — the JS equivalent
 *  of color-mix(), used so derived tints work in older kiosk WebViews. */
function mixHex(hex: string, base: string, amount: number): string {
  const a = hex.replace("#", "");
  const b = base.replace("#", "");
  const ch = (i: number) =>
    Math.round(parseInt(a.substring(i, i + 2), 16) * amount + parseInt(b.substring(i, i + 2), 16) * (1 - amount));
  return `#${[0, 2, 4].map((i) => ch(i).toString(16).padStart(2, "0")).join("")}`;
}

/** WCAG relative luminance of a hex color (0 = black, 1 = white) */
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const chan = (i: number) => {
    const v = parseInt(h.substring(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * chan(0) + 0.7152 * chan(2) + 0.0722 * chan(4);
}

/** Accept any user-supplied color string and return a safe #rrggbb.
 *  Handles #abc, #aabbcc, bare hex, whitespace and case. Anything unparseable
 *  (empty, "red", a broken paste, undefined) returns `fallback` rather than
 *  propagating NaN through every derived token — this is the system's floor:
 *  a bad brand color degrades to a neutral theme, it never renders garbage. */
export function normalizeHex(input: string | undefined | null, fallback = "#5A6B78"): string {
  if (typeof input !== "string") return fallback;
  let h = input.trim().replace(/^#/, "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return fallback;
  return `#${h.toLowerCase()}`;
}

/** Move a color along lightness only — hue and chroma survive. */
function shiftL(hex: string, delta: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, Math.max(0, Math.min(1, l + delta)));
}

/** Foreground for a filled brand surface (icons, and text on that fill).
 *  Prefers white — the conventional pairing — and only drops to ink when white
 *  cannot clear the 3:1 bar WCAG 1.4.11 sets for graphical objects. Picking
 *  purely by "whichever ratio is larger" made this a coin flip for mid-tone
 *  brands (#008AAB scores white 4.02 vs ink 4.06), so the same UI could show
 *  white icons for one brand and black for the next. */
function onColorFor(hex: string): string {
  return contrastRatio("#FFFFFF", hex) >= 3 ? "#FFFFFF" : "#10222B";
}

/** Generate rgba from theme primary for CSS usage (scrollbars, dynamic opacity) */

/* ── Contrast-aware derivation ───────────────────────────────────────────────
 * Brand primaries span a huge range: #008AAB (mid teal) through #212556 and
 * #1D234D (navies darker than the dark-mode surface) to #C9A96E (a pale gold
 * lighter than most light-mode ink). A fixed mix percentage or opacity that
 * reads well for one is invisible for another — a 17% mix of #212556 into
 * #1B2227 returns the surface, and a 22% border of it scores 1.02:1.
 *
 * So each derived value states the contrast it needs and solves for it,
 * treating the design spec's percentage as a floor rather than an answer.
 * Lightness is adjusted in HSL so the brand hue and chroma survive. */

function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const hue = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [hue / 6, sat, l];
}

function hslToHex(hu: number, sa: number, li: number): string {
  const f = (n: number) => {
    const k = (n + hu * 12) % 12;
    const a = sa * Math.min(li, 1 - li);
    const v = li - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * v).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** WCAG contrast ratio between two opaque colors (1 → identical, 21 → max) */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Composite `fg` at `alpha` over opaque `bg` → the opaque result */
function overlayHex(fg: string, alpha: number, bg: string): string {
  return mixHex(fg, bg, alpha);
}

/** Shift `color`'s lightness (hue/chroma preserved) until it clears `minRatio`
 *  against `bg`. Moves away from the backdrop — lighter on dark, darker on light. */
function ensureContrast(color: string, bg: string, minRatio: number): string {
  if (contrastRatio(color, bg) >= minRatio) return color;
  const [hu, sa, l0] = hexToHsl(color);
  const up = luminance(bg) < 0.18;         // dark backdrop → lighten
  let lo = l0, hi = up ? 1 : 0, best = up ? "#FFFFFF" : "#000000";
  for (let i = 0; i < 24; i++) {           // bisect on lightness
    const mid = (lo + hi) / 2;
    const cand = hslToHex(hu, sa, mid);
    if (contrastRatio(cand, bg) >= minRatio) { best = cand; hi = mid; } else { lo = mid; }
  }
  return best;
}

/** Smallest alpha ≥ `floor` whose composite of `fg` over `bg` clears `minRatio`. */
function solveAlpha(fg: string, bg: string, minRatio: number, floor: number): number {
  if (contrastRatio(overlayHex(fg, floor, bg), bg) >= minRatio) return floor;
  for (let a = floor; a <= 1.0001; a += 0.02) {
    if (contrastRatio(overlayHex(fg, Math.min(a, 1), bg), bg) >= minRatio) return Math.min(a, 1);
  }
  return 1;
}

/** Every value one brand color needs on one surface — fills, their accessible
 *  foregrounds, interaction states, tints, borders and the disabled pair.
 *
 *  This is the reusable unit: `fillSet(primary, …)` and `fillSet(accent, …)`
 *  are the same call, and semantic colors (error/success/warning/info) go
 *  through it too. Nothing here knows which brand it is looking at. */
function fillSet(color: string, surface: string, dark: boolean) {
  const base = color;
  const on = onColorFor(base);
  // Hover/press move away from the surface so the control gains weight when
  // touched: lighter on dark, darker on light. Clamped inside hslToHex.
  const dir = dark ? 1 : -1;
  const hover = shiftL(base, dir * 0.06);
  const active = shiftL(base, dir * 0.12);

  // Tints must be *seen* against this surface, so they are solved, not fixed.
  const tintFloor = dark ? 0.14 : 0.08;
  const seed = ensureContrast(base, surface, dark ? 3 : 3);
  const subtleA = solveAlpha(seed, surface, dark ? 1.18 : 1.05, tintFloor);
  const selectedA = solveAlpha(seed, surface, dark ? 1.45 : 1.16, subtleA + 0.06);
  const borderA = solveAlpha(seed, surface, dark ? 1.55 : 1.35, 0.18);

  // Disabled: keep the hue but drain it, then guarantee its label is still
  // perceivable (3:1) — "de-emphasised" must not mean "invisible".
  const disabledBg = overlayHex(shiftL(base, dir * 0.05), dark ? 0.10 : 0.07, surface);
  const disabledOn = ensureContrast(shiftL(base, dir * 0.2), disabledBg, 3);

  return {
    base,
    on,
    hover,
    hoverOn: contrastRatio(on, hover) >= 3 ? on : onColorFor(hover),
    active,
    activeOn: contrastRatio(on, active) >= 3 ? on : onColorFor(active),
    subtle: hexToRgba(seed, subtleA),
    subtleSolid: overlayHex(seed, subtleA, surface),
    /** alpha of `subtle`, so callers can composite it over another backdrop */
    subtleAlpha: subtleA,
    seed,
    selected: overlayHex(seed, selectedA, surface),
    border: hexToRgba(seed, borderA),
    // A focus ring is useless if it cannot be seen, so it is held to the same
    // 3:1 non-text bar against the surface it is drawn on.
    ring: ensureContrast(base, surface, 3),
    disabledBg,
    disabledOn,
    /** true when the raw color could not meet contrast unaided and was shifted */
    adjusted: seed.toLowerCase() !== base.toLowerCase(),
  };
}

/** The backdrop that makes a foreground hardest to read.
 *  We only ever move lightness away from the surface, so on dark backgrounds
 *  the lightest candidate is the binding constraint and on light backgrounds
 *  the darkest is. Clearing that one clears all the others. */
function worstBackdrop(backdrops: string[], dark: boolean): string {
  return backdrops.reduce((worst, cand) =>
    (dark ? luminance(cand) > luminance(worst) : luminance(cand) < luminance(worst)) ? cand : worst,
  backdrops[0]);
}

/** Clear `minRatio` against EVERY candidate backdrop, not just one guessed by
 *  luminance. `worstBackdrop` assumes the foreground moves away from the surface
 *  in a single direction, which holds for a dark navy on white but not for a
 *  light accent (#4EBEE3) sitting on a pale tint of itself — there the binding
 *  surface is the lightest, not the darkest. Iterating removes the guess. */
function ensureContrastAll(color: string, backdrops: string[], minRatio: number): string {
  return backdrops.reduce((c, bg) => ensureContrast(c, bg, minRatio), color);
}

/** Flatten two ramps into the named interaction tokens the UI consumes. */
function stateTokens(P: ReturnType<typeof fillSet>, A: ReturnType<typeof fillSet>, surface: string) {
  return {
    primaryHover: P.hover,   primaryHoverOn: P.hoverOn,
    primaryActive: P.active, primaryActiveOn: P.activeOn,
    primarySelected: P.selected, primaryBorder: P.border,
    accentHover: A.hover,    accentHoverOn: A.hoverOn,
    accentActive: A.active,  accentActiveOn: A.activeOn,
    accentSelected: A.selected,
    focusRing: P.ring,
    disabledBg: P.disabledBg, disabledOn: P.disabledOn,
    onSuccess: onColorFor("#22C55E"),
    onWarning: onColorFor("#F59E0B"),
    onError: onColorFor("#EF4444"),
    onInfo: onColorFor("#3B82F6"),
    brandAdjusted: P.adjusted || A.adjusted,
  };
}

/** Build every Engagement token for one surface.
 *  `spec` carries the design percentages (used as floors) and the contrast
 *  each result must actually reach on this surface. */
function engagementTokens(
  primary: string,
  accent: string,
  surface: string,
  spec: { tint: number; border: number; iconBg: number; stroke: number;
          minBorder: number; minIconBg: number; minStroke: number; minGlyph: number },
) {
  // The glyph carries meaning, so it leads: pull the brand color to a readable
  // lightness on this surface, then tint everything else from that same color
  // so a navy brand stays navy instead of collapsing into the gray surface.
  const seed = ensureContrast(primary, surface, spec.minGlyph);

  const iconBgAlpha = solveAlpha(seed, surface, spec.minIconBg, spec.iconBg);
  const iconBg = overlayHex(seed, iconBgAlpha, surface);
  // The glyph sits on the container, not the card, so re-check it against that.
  const glyph = ensureContrast(seed, iconBg, spec.minGlyph);

  const borderAlpha = solveAlpha(glyph, surface, spec.minBorder, spec.border);
  const strokeAlpha = solveAlpha(glyph, iconBg, spec.minStroke, spec.stroke);
  const tint = overlayHex(glyph, Math.max(spec.tint, iconBgAlpha), surface);

  // The filled container must read as a filled container. A brand whose color
  // sits on top of the surface luminance (a near-black primary in dark mode)
  // would otherwise vanish, so the fill is held to a minimum separation and
  // its glyph is then chosen against the fill that actually ships.
  const fill = ensureContrast(primary, surface, 1.6);

  return {
    brandOnPrimary: onColorFor(primary),
    brandOnAccent: onColorFor(accent),
    engagementFill: fill,
    engagementOnFill: onColorFor(fill),
    engagementSurface: surface,
    engagementCardGradient: `linear-gradient(180deg, ${tint} 0%, ${surface} 58%)`,
    engagementCardGradientShort: `linear-gradient(180deg, ${tint} 0%, ${surface} 32%)`,
    /** Opaque color at the very top of the card gradient — the lightest point
     *  text can sit on, so neutral text tokens must clear it. */
    engagementTint: tint,
    engagementCardBorder: `1px solid ${hexToRgba(glyph, borderAlpha)}`,
    engagementIconBg: iconBg,
    engagementIconStroke: hexToRgba(glyph, strokeAlpha),
    engagementIconColor: glyph,
  };
}

export function primaryRgba(theme: ThemeConfig, alpha: number): string {
  return hexToRgba(theme.primary, alpha);
}

/* ═══════════════════════════════════════════════════════════════════════════
 * BUILT-IN CONFIGS — the default hospital(s) that ship with the system
 * ═══════════════════════════════════════════════════════════════════════════ */

import logoImage from "../../assets/fakeeh-jeddah-logo.svg";
import logoImageDark from "../../assets/logos/Fakeeh-Hospitals-Dark-Mode.svg";
import hospitalImg from "../../assets/fakeeh-jeddah-hero.png";

import burjeelLogo from "../../assets/c8626cd3ed1ce90e9b3bab4a5f97a7315203f204.png";
import burjeelHero from "../../assets/6c870dc0bd960be4275cdbc07d5394bb50ec781e.png";
import slhLogo from "../../assets/000bda4db783fe15cbd489d69579eb6e0e831a8a.png";
import slhHero from "../../assets/e956f98cfa0d9f06f0dd2befe535fed91ed51d1e.png";

import dallahLogo from "../../assets/DallahLogo.png";
import dallahHero from "../../assets/dallah-hero-welcome.jpg";

import caremedLogo from "../../assets/CareMedicalLogo.png";
import caremedHero from "../../assets/CareMedicalHospital.jpeg";

import imcLogo from "../../assets/imclogo.png";
import imcHero from "../../assets/IMC-e1556123324461.jpg";

import careinnLogo from "../../assets/careinn-hospital-logo.png";
import careinnHero from "../../assets/careinn-hospital-hero.jpg";

import primeLogo from "../../assets/prime-hospital-logo.png";
import primeHero from "../../assets/prime-hospital-hero.jpg";

import kauhLogo from "../../assets/kauh-logo.png";
import kauhHero from "../../assets/kauh-hero.jpg";

import andalusiaLogo from "../../assets/Andalusia.jpg";
import andalusiaHero from "../../assets/andalusia-hero.jpg";

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
  logoUrlDark: logoImageDark,
  hospitalWebsiteUrl: "https://en.dsfhriyadh.fakeeh.care/",
  heroImageUrl: hospitalImg,
  primary: "#008AAB",
  primaryDark: "#006B85",
  primaryLight: "#DEF4F7",
  accent: "#D10044",
  accentDark: "#A80037",
  accentLight: "#FDE8EF",
  location: "Jeddah",
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
  location: "Abu Dhabi",
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
  location: "Beirut",
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
  location: "Riyadh",
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
  location: "Riyadh",
};

export const IMC_CORE: HospitalCoreConfig = {
  id: "imc",
  hospitalName: "International Medical Center",
  hospitalShortName: "IMC",
  fontFamily: "'Mulish', sans-serif",
  fontFamilyAr: "'Almarai', sans-serif",
  logoUrl: imcLogo,
  hospitalWebsiteUrl: "https://www.imc.med.sa/",
  heroImageUrl: imcHero,
  primary: "#015a9c",
  primaryDark: "#041727",
  primaryLight: "#DCE5EC",
  accent: "#B68A35",
  accentDark: "#7A5C23",
  accentLight: "#F5EFE6",
  location: "Jeddah",
};

export const CAREINN_CORE: HospitalCoreConfig = {
  id: "careinn",
  hospitalName: "CareInn Hospital",
  hospitalShortName: "CareInn",
  fontFamily: "'Mulish', sans-serif",
  fontFamilyAr: "'Almarai', sans-serif",
  logoUrl: careinnLogo,
  hospitalWebsiteUrl: "",
  heroImageUrl: careinnHero,
  heroCropPosition: "50% 40%",
  primary: "#1B2F5B",
  primaryDark: "#152446",
  primaryLight: "#e1e3e9",
  accent: "#4A90D9",
  accentDark: "#3970a9",
  accentLight: "#e7f0fa",
  location: "Jeddah",
};

export const PRIME_CORE: HospitalCoreConfig = {
  id: "prime",
  hospitalName: "Prime Hospital",
  hospitalShortName: "Prime",
  fontFamily: "'Montserrat', sans-serif",
  fontFamilyAr: "'Almarai', sans-serif",
  logoUrl: primeLogo,
  hospitalWebsiteUrl: "https://www.primehospital.com/",
  heroImageUrl: primeHero,
  primary: "#F47B20",
  primaryDark: "#C45E0A",
  primaryLight: "#F9B27A",
  accent: "#6D6E71",
  accentDark: "#58595B",
  accentLight: "#EBEBEC",
  location: "Dubai",
};

export const KAUH_CORE: HospitalCoreConfig = {
  id: "kauh",
  hospitalName: "King Abdulaziz University Hospital",
  hospitalShortName: "شفاء",
  fontFamily: "'Mulish', sans-serif",
  fontFamilyAr: "'Almarai', sans-serif",
  logoUrl: kauhLogo,
  hospitalWebsiteUrl: "https://shifaa.kau.edu.sa/Default-ar.aspx",
  heroImageUrl: kauhHero,
  heroCropPosition: "50% 40%",
  heroOpacity: 40,
  primary: "#2BAD8A",
  primaryDark: "#218F6E",
  primaryLight: "#DCF5EC",
  accent: "#1A5C40",
  accentDark: "#123D2B",
  accentLight: "#E5F5EE",
  location: "Jeddah",
};

export const ANDALUSIA_CORE: HospitalCoreConfig = {
  id: "andalusia",
  hospitalName: "Andalusia Health",
  hospitalShortName: "Andalusia",
  fontFamily: "'Mulish', sans-serif",
  fontFamilyAr: "'Almarai', sans-serif",
  logoUrl: andalusiaLogo,
  hospitalWebsiteUrl: "",
  heroImageUrl: andalusiaHero,
  heroCropPosition: "50% 50%",
  primary: "#C9A96E",
  primaryDark: "#8B6530",
  primaryLight: "#E8D5B0",
  accent: "#A07840",
  accentDark: "#8B6530", // Fallback for accentDark
  accentLight: "#E8D5B0", // Fallback for accentLight
  location: "Saudi Arabia",
};

/** All built-in hospital presets (always available, never deleted) */
export const BUILTIN_PRESETS: HospitalCoreConfig[] = [
  DSFH_CORE,
  BURJEEL_CORE,
  SLH_CORE,
  DALLAH_CORE,
  CAREMED_CORE,
  IMC_CORE,
  CAREINN_CORE,
  PRIME_CORE,
  KAUH_CORE,
  ANDALUSIA_CORE,
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
  /** Optional light-on-dark logo. Used automatically in dark mode; falls back
   *  to `logoUrl` when a brand hasn't supplied one. */
  logoUrlDark?: string;
  heroImageUrl: string;
  heroImageUrls?: string[];
  heroCropPosition?: string;
  slideshowInterval?: number;
  heroOpacity?: number;      // background photo opacity, percent 0–100 (default 40)
  primary: string;
  /** Optional — auto-derived from `primary` when absent */
  primaryDark?: string;
  /** Optional — auto-derived from `primary` when absent */
  primaryLight?: string;
  accent: string;
  /** Optional — auto-derived from `accent` when absent */
  accentDark?: string;
  /** Optional — auto-derived from `accent` when absent */
  accentLight?: string;
  location?: string;
  country?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LAYOUT 2 (CareInn) — fully independent theme, isolated from hospital configs
 * ═══════════════════════════════════════════════════════════════════════════
 * Layout 2 (the CiHomescreen "CareInn" design) must NEVER inherit colors from
 * the active hospital config that drives Layout 1. It has its own localStorage
 * slice and its own scoped CSS variables (applied on the Layout 2 wrapper in
 * App.tsx), so editing a Layout 1 hospital can never affect Layout 2 and vice
 * versa.
 */
export interface Layout2Theme {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentDark: string;
  accentLight: string;
  presetName?: "dark" | "gold" | "green" | "light" | "custom";
  pageBg?: string;
  tileBg?: string;
  clientLogo?: string;
  typography?: string;
  tileGroups?: Layout2TileGroups;
}

/**
 * Per-tile-group appearance overrides for Layout 2 (CareInn homescreen) only.
 * Each of the three on-screen tile clusters can be styled independently; an
 * empty `bg` means "follow the active hospital theme" so untouched groups stay
 * in sync with Layout 1. Consumed by the CSS vars CiHomescreen reads.
 */
export type TileIconColor = "primary" | "secondary" | "custom";

export interface TileGroupStyle {
  bg: string;          // hex background; "" => inherit the active theme color
  opacity: number;     // background opacity, 0–100
  scale: number;       // tile scale, 0.80–1.20 (1.00 = default)
  iconColor: TileIconColor;
  iconCustom: string;  // hex, used when iconColor === "custom"
}

export interface Layout2TileGroups {
  left: TileGroupStyle;    // Left Sidebar Tiles  (Frame48, small tiles)
  main: TileGroupStyle;    // Main Right Tiles    (Frame45, large tiles)
  bottom: TileGroupStyle;  // Bottom Action Tiles (Frame53, small tiles)
}

// Defaults mirror the current dashboard appearance so the controls initialise
// to exactly what is on screen today:
//  - left/bottom small tiles: translucent (~10%) primary glass, primary icons
//  - main large tiles: solid primary, fully opaque, white icons
export const DEFAULT_TILE_GROUPS: Layout2TileGroups = {
  left: { bg: "", opacity: 10, scale: 1.0, iconColor: "primary", iconCustom: "#1B2F5B" },
  main: { bg: "", opacity: 100, scale: 1.0, iconColor: "custom", iconCustom: "#ffffff" },
  bottom: { bg: "", opacity: 10, scale: 1.0, iconColor: "primary", iconCustom: "#1B2F5B" },
};

export const DEFAULT_LAYOUT2_THEME: Layout2Theme = {
  primary: "#1B2F5B",
  primaryDark: "#152446",
  primaryLight: "#e1e3e9",
  accent: "#4A90D9",
  accentDark: "#3970a9",
  accentLight: "#e7f0fa",
  presetName: "dark",
  pageBg: "#ffffff",
  tileBg: "#16274d",
  clientLogo: "",
  typography: "'Inter', sans-serif",
  tileGroups: DEFAULT_TILE_GROUPS,
};

// localStorage key — independent from "hospital-configs" (Layout 1 storage)
const LAYOUT2_THEME_KEY = "careinn-layout2-theme";

function loadLayout2Theme(): Layout2Theme {
  try {
    const raw = localStorage.getItem(LAYOUT2_THEME_KEY);
    if (!raw) return DEFAULT_LAYOUT2_THEME;
    const parsed = JSON.parse(raw) as Partial<Layout2Theme>;
    // Deep-merge tileGroups so themes saved before this field existed (or with
    // only some groups present) still get complete, valid group defaults.
    const tileGroups: Layout2TileGroups = {
      left: { ...DEFAULT_TILE_GROUPS.left, ...parsed.tileGroups?.left },
      main: { ...DEFAULT_TILE_GROUPS.main, ...parsed.tileGroups?.main },
      bottom: { ...DEFAULT_TILE_GROUPS.bottom, ...parsed.tileGroups?.bottom },
    };
    return { ...DEFAULT_LAYOUT2_THEME, ...parsed, tileGroups };
  } catch {
    return DEFAULT_LAYOUT2_THEME;
  }
}

function saveLayout2ThemeToStorage(t: Layout2Theme) {
  localStorage.setItem(LAYOUT2_THEME_KEY, JSON.stringify(t));
}

const STORAGE_KEY = "hospital-configs";
const ACTIVE_KEY = "active-hospital-id";
const LOCALE_KEY = "active-locale";

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
  return localStorage.getItem(ACTIVE_KEY) || "careinn";
}

function saveActiveId(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
}

function loadLocale(): Locale {
  return (localStorage.getItem(LOCALE_KEY) as Locale) || "en";
}

function saveLocale(l: Locale) {
  localStorage.setItem(LOCALE_KEY, l);
}

function loadDarkMode(): boolean {
  return localStorage.getItem("hbs-dark-mode") === "true";
}

function saveDarkMode(val: boolean) {
  localStorage.setItem("hbs-dark-mode", val ? "true" : "false");
}

// Layout mode (1 = active hospital design, 2 = CareInn design, 3 = Kids design).
// Written by MyAccountDialog under "careinn-layout-mode"; broadcast via
// "layout-mode-changed". All layouts inherit the active hospital's brand.
function loadLayoutMode(): 1 | 2 | 3 {
  const v = localStorage.getItem("careinn-layout-mode");
  return v === "2" ? 2 : v === "3" ? 3 : 1;
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
  /** Layout 2 (CareInn) theme — independent of the active hospital config. */
  layout2Theme: Layout2Theme;
  saveLayout2Theme: (t: Layout2Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DSFH_THEME,
  allConfigs: [DSFH_CORE],
  activeConfigId: "dsfh",
  switchConfig: () => { },
  saveConfig: () => { },
  deleteConfig: () => { },
  patientAdmitted: true,
  setPatientAdmitted: () => { },
  darkMode: false,
  setDarkMode: () => { },
  castDevice: null,
  setCastDevice: () => { },
  locale: "en",
  setLocale: () => { },
  prayerAlarm: true,
  setPrayerAlarm: () => { },
  layout2Theme: DEFAULT_LAYOUT2_THEME,
  saveLayout2Theme: () => { },
});

/* ── Inject CSS Custom Properties ──
 * Prefix: --hbs-  (Hospital Bedside System)
 * These are available globally for non-React consumers (CSS, third-party widgets).
 */
function injectCSSVars(t: ThemeConfig) {
  const root = document.documentElement;
  const vars: Record<string, string> = {
    "--hbs-font": t.fontFamily,
    "--hbs-font-ar": t.fontFamilyAr,
    "--hbs-font-mono": t.fontFamilyMono,
    "--hbs-primary": t.primary,
    "--hbs-primary-dark": t.primaryDark,
    "--hbs-primary-light": t.primaryLight,
    "--hbs-primary-subtle": t.primarySubtle,
    "--hbs-accent": t.accent,
    "--hbs-accent-dark": t.accentDark,
    "--hbs-accent-light": t.accentLight,
    "--hbs-accent-subtle": t.accentSubtle,
    "--hbs-bg": t.background,
    "--hbs-surface": t.surface,
    "--hbs-surface-elevated": t.surfaceElevated,
    "--hbs-overlay": t.overlay,
    "--hbs-panel-bg": t.panelBg,
    "--hbs-text-heading": t.textHeading,
    "--hbs-text-body": t.textBody,
    "--hbs-text-muted": t.textMuted,
    "--hbs-text-disabled": t.textDisabled,
    "--hbs-text-inverse": t.textInverse,
    "--hbs-icon-default": t.iconDefault,
    "--hbs-icon-brand": t.iconBrand,
    "--hbs-border": t.borderDefault,
    "--hbs-border-subtle": t.borderSubtle,
    "--hbs-border-active": t.borderActive,
    "--hbs-tile-active": t.tileActiveBg,
    "--hbs-tile-inactive": t.tileInactiveBg,
    "--hbs-slider-track": t.sliderTrack,
    "--hbs-slider-thumb": t.sliderThumb,
    "--hbs-gradient-canvas": t.gradientCanvas,
    "--hbs-radius-sm": t.radiusSm,
    "--hbs-radius-md": t.radiusMd,
    "--hbs-radius-lg": t.radiusLg,
    "--hbs-radius-xl": t.radiusXl,
    "--hbs-radius-card": t.radiusCard,
    "--hbs-touch-min": t.touchTargetMin,
    "--hbs-card-padding": t.cardPadding,
    "--hbs-icon-bg": t.iconBg,
    "--hbs-success": t.success,
    "--hbs-success-subtle": t.successSubtle,
    "--hbs-warning": t.warning,
    "--hbs-warning-subtle": t.warningSubtle,
    "--hbs-error": t.error,
    "--hbs-error-subtle": t.errorSubtle,

    // Shared brand tokens — every Engagement color derives from these
    "--brand-primary": t.primary,
    "--brand-on-primary": t.brandOnPrimary,
    "--brand-on-accent": t.brandOnAccent,
    "--brand-primary-on": t.primaryOn,
    "--brand-accent-on": t.accentOn,
    "--brand-primary-hover": t.primaryHover,
    "--brand-primary-active": t.primaryActive,
    "--brand-primary-selected": t.primarySelected,
    "--brand-primary-border": t.primaryBorder,
    "--brand-accent-hover": t.accentHover,
    "--brand-accent-active": t.accentActive,
    "--brand-accent-selected": t.accentSelected,
    "--brand-focus-ring": t.focusRing,
    "--brand-disabled-bg": t.disabledBg,
    "--brand-disabled-on": t.disabledOn,
    "--engagement-surface": t.engagementSurface,
    "--engagement-card-gradient": t.engagementCardGradient,
    "--engagement-card-border": t.engagementCardBorder,
    "--engagement-icon-bg": t.engagementIconBg,
    "--engagement-icon-stroke": t.engagementIconStroke,
    "--engagement-icon-color": t.engagementIconColor,

    // Standard CSS Custom Properties for layout styling
    "--primary-color": t.primary,
    "--primary-dark": t.primaryDark,
    "--primary-light": t.primaryLight,
    "--primary-subtle": t.primarySubtle,
    "--accent-color": t.accent,
    "--accent-dark": t.accentDark,
    "--accent-light": t.accentLight,
    "--accent-subtle": t.accentSubtle,
  };
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

/* ── Provider ── */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [savedConfigs, setSavedConfigs] = useState<HospitalCoreConfig[]>(() => loadSavedConfigs());
  const [activeId, setActiveId] = useState(() => loadActiveId());
  const [patientAdmitted, setPatientAdmitted] = useState(true);
  const [darkMode, setDarkMode] = useState(() => loadDarkMode());
  const [castDevice, setCastDevice] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>(() => loadLocale());
  const [prayerAlarm, setPrayerAlarm] = useState(() => {
    const saved = localStorage.getItem("prayer-alarm");
    return saved === null ? true : saved === "true";
  });

  const [layout2Theme, setLayout2Theme] = useState<Layout2Theme>(() => loadLayout2Theme());
  const [layoutMode, setLayoutMode] = useState<1 | 2 | 3>(() => loadLayoutMode());

  // Keep the effective theme in sync with the active layout mode so that, in
  // Layout 2, the WHOLE app (home, games, tools, settings, overlays) is driven
  // by the CareInn Layout 2 theme instead of the active hospital config.
  useEffect(() => {
    const handler = () => setLayoutMode(loadLayoutMode());
    window.addEventListener("layout-mode-changed", handler);
    return () => window.removeEventListener("layout-mode-changed", handler);
  }, []);

  const updatePrayerAlarm = (val: boolean) => {
    setPrayerAlarm(val);
    localStorage.setItem("prayer-alarm", val ? "true" : "false");
  };

  const saveLayout2Theme = useCallback((next: Layout2Theme) => {
    setLayout2Theme(next);
    saveLayout2ThemeToStorage(next);
  }, []);

  // All configs = built-in presets (overridable by saved versions) + user-created configs
  const allConfigs: HospitalCoreConfig[] = (() => {
    // Start with built-in presets, applying any saved overrides
    const merged = BUILTIN_PRESETS.map((preset) => {
      const saved = savedConfigs.find((c) => c.id === preset.id);
      if (!saved) return preset;
      const hasBuiltinAssets = ["dsfh", "burjeel", "slh", "dallah", "caremed", "careinn", "prime"].includes(preset.id);
      // A saved config that changes primary/accent must NOT keep the preset's
      // tonal variants — they were derived from the old hex and would otherwise
      // silently shadow the new brand (e.g. CareInn saved as #16274D still
      // inheriting primaryLight #e1e3e9, derived from #1B2F5B). Drop them so
      // buildTheme regenerates from the colors actually in force.
      const eq = (a?: string, b?: string) => (a || "").toLowerCase() === (b || "").toLowerCase();
      const primaryMoved = !!saved.primary && !eq(saved.primary, preset.primary);
      const accentMoved = !!saved.accent && !eq(saved.accent, preset.accent);
      return {
        ...preset,
        ...saved,
        primaryDark: saved.primaryDark || (primaryMoved ? undefined : preset.primaryDark),
        primaryLight: saved.primaryLight || (primaryMoved ? undefined : preset.primaryLight),
        accentDark: saved.accentDark || (accentMoved ? undefined : preset.accentDark),
        accentLight: saved.accentLight || (accentMoved ? undefined : preset.accentLight),
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

  // Resolve effective config → theme.
  // Both layouts use the active hospital config as-is, so Layout 2 (CareInn)
  // inherits Layout 1's active brand colors AND logo automatically — when the
  // admin edits the active hospital's brand colors, both layouts reflect them.
  // (layout2Theme is retained for the configurator's editor but no longer
  // overrides the rendered theme.)
  const activeCore = allConfigs.find((c) => c.id === activeId) || DSFH_CORE;
  const effectiveCore: HospitalCoreConfig = activeCore;
  const baseTheme = buildTheme(effectiveCore, darkMode);
  // Override fontFamily based on active locale so every component using
  // theme.fontFamily automatically gets the correct Arabic/English font.
  const theme = useMemo(() => ({
    ...baseTheme,
    fontFamily: locale === "ar" ? baseTheme.fontFamilyAr : baseTheme.fontFamily,
  }), [baseTheme, locale]);

  // Inject CSS vars on theme change
  useEffect(() => {
    injectCSSVars(theme);
  }, [activeId, savedConfigs, darkMode, locale, layoutMode, layout2Theme]);

  const switchConfig = useCallback((id: string) => {
    setActiveId(id);
    saveActiveId(id);
  }, []);

  const saveConfigFn = useCallback((config: HospitalCoreConfig) => {
    const hasBuiltinAssets = ["dsfh", "burjeel", "slh", "dallah", "caremed", "careinn", "prime", "kauh", "andalusia"].includes(config.id);
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
      setActiveId("careinn");
      saveActiveId("careinn");
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
      setDarkMode: (val: boolean) => {
        setDarkMode(val);
        saveDarkMode(val);
      },
      castDevice,
      setCastDevice,
      locale,
      setLocale: (l: Locale) => {
        setLocale(l);
        saveLocale(l);
      },
      prayerAlarm,
      setPrayerAlarm: updatePrayerAlarm,
      layout2Theme,
      saveLayout2Theme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { buildTheme };
