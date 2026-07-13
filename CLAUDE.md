# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Before editing anything, read `guidelines/Guidelines.md`.** Those rules are binding for every agent in this repo and exist to prevent parallel agents from overwriting each other's work or forking the design system.

## Project

CareInn Hospital Bedside Screen — a React kiosk UI that runs on bedside terminals in patient rooms. Designed at a fixed **1920×1080** canvas and scaled to fit via `useScreenScale()` in `src/app/App.tsx`. The web build is hosted inside a native Android kiosk app and talks back to it through `window.AndroidSystem`.

## Commands

- `npm i` — install dependencies (requires Node ≥ 18)
- `npm run dev` — start the Vite dev server
- `npm run build` — production build to `dist/` (Vercel uses `vite build` + `dist`)

There are no test or lint scripts defined. `tsconfig.json` has `noEmit: true` and `strict: true`; type-check via your editor / `tsc --noEmit`.

## Path alias

`@/...` resolves to `src/...` (see `vite.config.ts` and `tsconfig.json`). `assetsInclude` is configured for `**/*.svg` and `**/*.csv` raw imports — do **not** add `.css`, `.ts`, or `.tsx` to that list.

The Vite config also enforces `react()` + `tailwindcss()` plugins (both required, even if Tailwind isn't actively used — comment in `vite.config.ts` explicitly says do not remove).

## Architecture

Entry: `src/main.tsx` → `src/app/App.tsx`. `App.tsx` is the master shell — it composes `AuthProvider` → `ThemeProvider` → `OrderProvider` and wires every screen, modal, game, and tool into a single render tree.

There are four cross-cutting subsystems any non-trivial change usually touches:

### 1. Theme + design tokens (`src/app/components/ThemeContext.tsx`)
- Multi-hospital branding (Burjeel, Dallah, SLH, Care Medical, Fakeeh, IMC, CareInn). Each hospital is a `HospitalCoreConfig` of colors, fonts, and image assets.
- `useTheme()` returns the active `theme` plus `switchConfig`, `darkMode`, `prayerAlarm`, etc.
- Exported scale constants: `TYPE_SCALE`, `WEIGHT`, `LEADING`, `SHADOW`, `SPACE`.
- **Convention enforced by the header doc:** never hardcode hex colors or font strings in components — always use `theme.*` for brand-variable values and scale constants for sizes/weights/shadows/spacing.
- Hospital switching at runtime is available via the Hospital Configurator (entered via long-press on the Dhuhr prayer tile when in full-access mode).

### 2. Auth + password-gated access (`src/app/components/AuthContext.tsx`, `PasswordGate.tsx`)
- Passwords are checked against SHA-256 hashes in `HASHED_PASSWORD_MAP`.
- Each hospital password unlocks **only** that hospital config; the `careinn` password is full access (all hospitals + configurator).
- `lockedHospitalId` from auth drives `switchConfig` on mount so the UI auto-loads the right brand after login.

**Password → hospital config ID:**

| Password   | Config ID  | Access                                          |
|------------|------------|-------------------------------------------------|
| `burjeel`  | `burjeel`  | Burjeel Hospital only                           |
| `dallah`   | `dallah`   | Dallah Hospital only                            |
| `slh`      | `slh`      | Saint Louis Hospital only                       |
| `caremed`  | `caremed`  | Care Medical only                               |
| `fakeeh`   | `dsfh`     | Dr. Soliman Fakeeh Hospital only                |
| `imc`      | `imc`      | IMC only                                        |
| `careinn`  | *(none)*   | **Full access** — all hospitals + configurator  |

Appending `-hospital` to any password (e.g. `dallah-hospital`) additionally flips `localStorage.cms-mode = "true"`, switching content sourcing to the Strapi CMS (see Data sources below).

### 3. i18n (`src/app/components/i18n.ts`)
- Locales: `"en" | "ar" | "ur"`. Arabic + Urdu are RTL.
- Flat dot-namespaced dictionary; use `t("section.key")`. `useLocale()` also returns `isRTL`, `dir`, and `fontFamily`.
- Adding a new string requires entries for **all three locales** in the `translations` object.

### 4. Android kiosk bridge (`src/app/utils/androidBridge.ts`, `src/app/types/android.d.ts`)
- Every native call wraps `window.AndroidSystem.<method>()` in try/catch with a browser-safe default, so the same build runs in dev browsers and on the Android kiosk.
- Detect environment with `isAndroidApp()`.
- Bridge surface area: brightness, volume, SIP calls, IPTV, Wi-Fi/Bluetooth, NFC, image fetching (base64), etc. Use the typed helpers exported from this file — don't reach into `window.AndroidSystem` directly elsewhere.

## Data sources

Two independent backends feed the UI:

- **Hospital REST API** (`src/app/lib/apiConfig.ts`, `src/app/lib/hospitalApi.tsx`)
  - Server IP + API key are stored in `localStorage` under `careinn-api-config` (defaults in `apiConfig.ts`). Editable at runtime; changes broadcast via the `api-config-changed` window event and the Android bridge.
  - Build all URLs through `apiUrl(path)` — it injects the `apikey` query param.
  - Provides device → patient lookup (HL7), wallpapers, news, app packages, device alerts.
  - Images from this API are typically `http://` and must go through `proxyImageUrl()` (`src/app/lib/imageProxy.ts`) before display; on Android the bridge returns a base64 data URL to avoid mixed-content errors.

- **Strapi CMS** (`src/lib/strapi.ts`, `src/lib/useCmsContent.ts`) — note this lives in `src/lib`, **separate** from `src/app/lib`.
  - Enabled when `VITE_STRAPI_URL` is set **and** the user opts in via the `"-hospital"` password suffix (sets `localStorage.cms-mode = "true"`).
  - Hospital slug comes from `VITE_HOSPITAL_SLUG` or the active config in localStorage (`hbs-active-config-id`).
  - Every fetch is wrapped to never throw — failure returns `null` and the UI falls back to bundled content.

## Stores

Two singleton pub/sub stores live next to components and are shared via hooks rather than React context:

- `src/app/components/NurseDataStore.ts` — nurse-side patient overrides, observations, section/item visibility. Persists to `localStorage` (`careinn-nurse-overrides`, `careinn-api-snapshot`). Nurse-edited fields shadow API-populated values.
- `OrderStore.tsx` — food-ordering state (uses React context).

## UI library conventions

- `src/app/components/ui/` is the **shadcn/ui** set (Radix-based primitives). Prefer composing these over hand-rolling dialogs/menus/etc.
- `src/app/components/primitives/` holds project-specific primitives (`TouchButton`, `IconButton`, `Card`, `Text`) tuned for touch and the design tokens.
- `src/app/components/figma/ImageWithFallback.tsx` is the standard image element with fallback handling.
- `src/app/components/games/` and `src/app/components/tools/` are self-contained mini-screens launched from the App Launcher.
- `src/app/components/nurse/` is the nurse-side interface (separate UX from the patient bedside screen).

## Other notes

- Persistent UI state is generally keyed under `hbs-*` or `careinn-*` in `localStorage`. Search for the key before adding new ones to avoid collisions.
- Sibling top-level folders `CT/`, `CT-Snajjar/`, `CT-Snajjar_backup/`, `Snajjar/`, plus `*.cjs` / `fix_layout.js` / `translate.py` are scratch/backup material — not part of the active build. The live source is `src/`.
- `guidelines/Guidelines.md` holds the binding multi-agent coordination rules (scope boundaries, design-system enforcement, locking around shared files). Read it before editing.
