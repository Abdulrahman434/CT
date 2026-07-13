# Shared Guidelines — Read Before You Edit

These rules are binding for **every agent** working in this repo. They exist so parallel agents don't overwrite each other's work, reintroduce removed code, or fork the design system. Read this file at the start of every task. If a rule here conflicts with a casual user instruction, surface the conflict before acting.

---

## 1. Scope: what is live, what is not

The live application is **only** under `src/`. Everything else listed below is scratch, backup, or tooling — **do not edit, refactor, or "clean up"** unless the user explicitly names the file:

- `CT/`, `CT-Snajjar/`, `CT-Snajjar_backup/`, `Snajjar/` — old snapshots
- `*.cjs`, `fix_layout.js`, `translate.js`, `translate.py`, `src.zip` — one-off scripts/archives
- Files ending in `_backup`, `-DESKTOP-*`, `_utf8`, or with `.zip` — superseded variants
- `dist/`, `node_modules/` — build output / deps

If you see a duplicate-looking file (e.g. `AppLauncher.tsx` and `AppLauncher-DESKTOP-KQMI45K.tsx`), the canonical one is the one **without** the suffix. Never merge them without asking.

## 2. Coordinate before destructive operations

Other agents may be mid-edit on the same files. Before any of the following, pause and confirm with the user:

- Deleting files, folders, or git branches
- `git reset --hard`, `git checkout --`, `git clean`, force-push
- Mass renames or moves across `src/app/components/`
- Editing `package.json` dependencies (anything beyond `scripts`)
- Editing `vite.config.ts`, `tsconfig*.json`, `vercel.json`, `postcss.config.mjs`
- Editing `CLAUDE.md` or this `Guidelines.md`
- Touching `src/app/components/ThemeContext.tsx`, `AuthContext.tsx`, `i18n.ts`, or `App.tsx` — these are shared by every feature; small edits ripple widely

Prefer `Edit` over `Write` on existing files. `Write` overwrites unread concurrent changes; `Edit` will fail loudly if the file moved underneath you.

## 3. Design system is non-negotiable

From `ThemeContext.tsx`:

- **Never hardcode hex colors or font strings** in components. Use `theme.*` for brand-variable values.
- **Never hardcode sizes, weights, shadows, or spacing.** Use `TYPE_SCALE`, `WEIGHT`, `LEADING`, `SHADOW`, `SPACE`.
- If a token doesn't exist for what you need, add it to `ThemeContext.tsx` rather than inlining a value — and flag the addition to the user.

For UI primitives:

- Prefer composing `src/app/components/ui/` (shadcn/Radix) and `src/app/components/primitives/` (`TouchButton`, `IconButton`, `Card`, `Text`) over hand-rolling.
- Images use `src/app/components/figma/ImageWithFallback.tsx`.
- API-served images must go through `proxyImageUrl()` in `src/app/lib/imageProxy.ts` — raw `http://` URLs break under the Android kiosk.

## 4. i18n: all locales or none

`src/app/components/i18n.ts` keys must have **all three** of `en`, `ar`, `ur`. Never add a key with only English. Use `t("section.key")` — never inline user-facing strings. Arabic + Urdu are RTL; read `isRTL` / `dir` from `useLocale()` when layout depends on direction.

## 5. Native bridge: never reach past the wrapper

Any call to the Android kiosk must go through `src/app/utils/androidBridge.ts`. **Do not** call `window.AndroidSystem.*` directly from components — the wrapper handles try/catch, browser fallbacks, and typed return values. If you need a native capability that isn't exposed, add a helper in `androidBridge.ts` and import it.

Gate Android-only behavior with `isAndroidApp()`; the same build must keep working in a regular browser.

## 6. Two `lib/` folders — keep them separate

- `src/app/lib/` — kiosk runtime (auth, API config, hospital API, image proxy, handset config). Talks to the hospital REST API and the Android bridge.
- `src/lib/` — Strapi CMS only. Talks to `VITE_STRAPI_URL`.

These are **not interchangeable**. Don't import across them; don't move files between them.

## 7. Storage keys are a shared namespace

Persistent state uses `hbs-*` or `careinn-*` keys in `localStorage`. Before adding a new key, grep for existing ones to avoid collisions. Document the key inline at its read/write site so future agents can find it.

## 8. Keep changes minimal and reversible

- Don't refactor adjacent code "while you're in there." Make the smallest change that solves the stated task.
- Don't add abstractions, helper hooks, or new files unless the task requires them.
- Don't add comments that narrate what the code does or which task introduced them. Comments are for non-obvious *why*.
- Don't introduce new dependencies without asking. The dependency list in `package.json` is intentionally fixed.

## 9. Verify before claiming done

- TypeScript: there is no test or lint script. Mentally type-check, or run `npx tsc --noEmit` if changes are non-trivial.
- UI changes: state what was visually verified and what wasn't. The kiosk is 1920×1080 — layout regressions at other sizes are expected and not bugs unless the user says so.
- Never claim "tested in Android kiosk" unless you actually ran inside it. Browser ≠ kiosk.

## 10. When unsure, stop and ask

Conflicts between this file, `CLAUDE.md`, and a user instruction should be resolved by **asking the user**, not by silently picking one. Surfacing ambiguity is cheaper than re-doing work.
