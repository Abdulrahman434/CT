import { useEffect, useLayoutEffect, useState } from "react";
import { ThemeProvider, useTheme } from "../app/components/ThemeContext";
import { useLocale } from "../app/components/i18n";
import { NeedSomething } from "../app/components/NeedSomething";

/**
 * Standalone UI-review preview for the redesigned Patient Services module.
 *
 * Opened directly at /preview/patient-services (wired in src/main.tsx). It renders
 * the real `NeedSomething` component — the actual redesigned UI — inside its own
 * ThemeProvider on the same fixed 1920×1080 scaled canvas the kiosk uses, so what
 * a reviewer sees is pixel-identical to production. Nothing here modifies the
 * Patient Services implementation, business logic, APIs, or the app's routing.
 *
 * Mock data: the component sources its "My Requests" list from the shared
 * `careinn-need-requests` localStorage key. We seed a few representative requests
 * before mounting so every status style is on screen, and we snapshot + restore
 * whatever was there on unmount, so the preview leaves no trace in real storage.
 */

const DESIGN_W = 1920;
const DESIGN_H = 1080;

/* Same key + shape NeedSomething reads (see NeedSomething.tsx). itemKeys must be
   ones the component knows so its icon lookup and translations resolve. */
const STORAGE_KEY = "careinn-need-requests";

function buildMockRequests() {
  const now = Date.now();
  const min = 60_000;
  /* Ages chosen so all four time-derived statuses appear:
     <2m sent · <8m preparing · <20m on-the-way · else delivered/fixed. */
  return [
    { id: "prev-1", kind: "report", itemKey: "need.issue.ac", emoji: "❄️", note: "Room feels too warm", createdAt: now - 1 * min },
    { id: "prev-2", kind: "request", itemKey: "need.item.water", emoji: "💧", note: "", createdAt: now - 5 * min },
    { id: "prev-3", kind: "request", itemKey: "need.item.blanket", emoji: "🛏️", note: "An extra warm one, please", createdAt: now - 15 * min },
    { id: "prev-4", kind: "request", itemKey: "need.item.towel", emoji: "🧺", note: "", createdAt: now - 75 * min },
  ];
}

/* Scale the fixed design canvas to fit the browser window — the same
   contain-fit strategy as the kiosk's useScreenScale(), kept local so the
   preview never touches App internals. */
function useFitScale() {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const compute = () =>
      setScale(Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H));
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return scale;
}

function PreviewCanvas() {
  const scale = useFitScale();
  const { theme } = useTheme();
  const { dir, fontFamily } = useLocale();

  /* Seed mock requests before the component first mounts (NeedSomething reads
     localStorage in a useState initializer), then restore prior storage on
     unmount so nothing leaks into the real app's data. */
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const prev = localStorage.getItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildMockRequests()));
    setReady(true);
    return () => {
      if (prev === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, prev);
    };
  }, []);

  return (
    <div
      className="w-screen h-screen overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div
        dir={dir}
        className="flex flex-col overflow-hidden relative shrink-0"
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          background: theme.gradientCanvas,
          fontFamily,
        }}
      >
        {/* The real redesigned Patient Services UI. Back button is inert here —
            this is a review surface with nothing to navigate back to. */}
        {ready && <NeedSomething onClose={() => {}} />}
      </div>
    </div>
  );
}

export default function PatientServicesPreview() {
  return (
    <ThemeProvider>
      <PreviewCanvas />
    </ThemeProvider>
  );
}
