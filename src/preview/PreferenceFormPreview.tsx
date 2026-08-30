import { useLayoutEffect, useState } from "react";
import { ThemeProvider, useTheme } from "../app/components/ThemeContext";
import { useLocale } from "../app/components/i18n";
import { PatientPreferenceForm } from "../app/components/PatientPreferenceForm";

/**
 * Standalone UI-review preview for the Patient Preferences Form.
 *
 * Opened directly at /preview/preference-form (wired in src/main.tsx), following
 * the same pattern as /preview/patient-services. It renders the real
 * `PatientPreferenceForm` inside its own ThemeProvider on the same fixed
 * 1920×1080 canvas the kiosk uses, so what a reviewer sees matches production.
 * Nothing here modifies the form, the onboarding wizard, or app routing.
 *
 * Query params (used for review and by the no-scroll measurement harness):
 *   ?locale=en|ar|ur      language to render in
 *   ?hospital=<config id> hospital theme to render with (dsfh, burjeel, …)
 *   ?scale=1              render 1:1 instead of fitting the window — the
 *                         measurement harness needs true design pixels
 *
 * Both locale and hospital are seeded into the same localStorage keys the real
 * app uses, and whatever was there is restored on unload, so the preview leaves
 * no trace in real storage.
 */

const DESIGN_W = 1920;
const DESIGN_H = 1080;

const params = new URLSearchParams(window.location.search);
const qsLocale = params.get("locale");
const qsHospital = params.get("hospital");
const unscaled = params.get("scale") === "1";

/* Seed before the ThemeProvider mounts and reads them. */
const restore: Array<[string, string | null]> = [];
function seed(key: string, value: string | null) {
  if (!value) return;
  restore.push([key, localStorage.getItem(key)]);
  localStorage.setItem(key, value);
}
seed("active-locale", qsLocale);
seed("careinn-locale", qsLocale);
seed("active-hospital-id", qsHospital);
seed("hbs-active-config-id", qsHospital);
seed("hbs-dark-mode", params.get("dark") === "1" ? "true" : params.get("dark") === "0" ? "false" : null);
window.addEventListener("beforeunload", () => {
  for (const [k, v] of restore) {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  }
});

/* Same contain-fit strategy as the kiosk's useScreenScale(), kept local so the
   preview never touches App internals. */
function useFitScale() {
  const [scale, setScale] = useState(unscaled ? 1 : 0);
  useLayoutEffect(() => {
    if (unscaled) return;
    const compute = () =>
      setScale(Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H));
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return scale || 1;
}

function PreviewCanvas() {
  const scale = useFitScale();
  const { theme } = useTheme();
  const { dir, fontFamily } = useLocale();

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.background,
      }}
    >
      <div
        id="ppf-canvas"
        dir={dir}
        style={{
          width: `${DESIGN_W}px`,
          height: `${DESIGN_H}px`,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
          fontFamily,
        }}
      >
        <PatientPreferenceForm onClose={() => { /* preview: no host to return to */ }} />
      </div>
    </div>
  );
}

export default function PreferenceFormPreview() {
  return (
    <ThemeProvider>
      <PreviewCanvas />
    </ThemeProvider>
  );
}
