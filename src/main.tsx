
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import PatientServicesPreview from "./preview/PatientServicesPreview.tsx";
import "./styles/index.css";

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
