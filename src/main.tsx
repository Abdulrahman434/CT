// Polyfill URL.parse for older browser environments (like older Android WebViews)
if (typeof URL.parse !== "function") {
  URL.parse = function (url: string | URL, base?: string | URL) {
    try {
      return new URL(url, base);
    } catch {
      return null;
    }
  };
}

import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import PatientServicesPreview from "./preview/PatientServicesPreview.tsx";
import { installMemoryPressureHandler } from "./app/lib/memoryPressure";
import "./styles/index.css";

// Respond to native low-memory signals by dropping non-essential caches.
installMemoryPressureHandler();

// Back button logic moved to App.tsx for better control

// Standalone UI-review routes. Only the exact preview path is diverted; every
// other path renders the unchanged App, so normal app routing is untouched.
const path = window.location.pathname.replace(/\/+$/, "");
const Root = path === "/preview/patient-services" ? PatientServicesPreview : App;

createRoot(document.getElementById("root")!).render(<Root />);

// Register service worker for offline caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => {
        console.log('[SW] Registered:', reg.scope);
      })
      .catch(err => {
        console.warn('[SW] Registration failed:', err);
      });
  });
}
