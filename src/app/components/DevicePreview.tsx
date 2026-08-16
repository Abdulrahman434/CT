import { useEffect, useRef, useState } from "react";
import hardwareMockup from "../../assets/2d721164145236877d6989e711cd07b18edfdba1.png";

/**
 * Full-screen modal showing the current bedside UI rendered inside
 * the physical hardware mockup image. Tap anywhere to close.
 *
 * Screen coordinates are expressed as % of the mockup image's
 * natural dimensions, measured from the provided photo.
 */

/* ── Screen-area calibration (% of full mockup image) ── */
const SCREEN = {
  left: 26.5,
  top: 9,
  width: 67,
  height: 78,
};

export function DevicePreview({ onClose }: { onClose: () => void }) {
  const [pressed, setPressed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);

  /* Measure the rendered image so we can position the screen overlay exactly */
  useEffect(() => {
    const measure = () => {
      if (imgRef.current) {
        setImgSize({ w: imgRef.current.clientWidth, h: imgRef.current.clientHeight });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* Compute pixel positions from % values */
  const screenStyle = imgSize
    ? {
        left: `${(SCREEN.left / 100) * imgSize.w}px`,
        top: `${(SCREEN.top / 100) * imgSize.h}px`,
        width: `${(SCREEN.width / 100) * imgSize.w}px`,
        height: `${(SCREEN.height / 100) * imgSize.h}px`,
      }
    : { left: `${SCREEN.left}%`, top: `${SCREEN.top}%`, width: `${SCREEN.width}%`, height: `${SCREEN.height}%` };

  const screenW = imgSize ? (SCREEN.width / 100) * imgSize.w : 600;
  const uiScale = screenW / 1920;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      {/* Close hint */}
      <div
        className="absolute top-6 right-8 flex items-center gap-2"
        style={{
          fontFamily: "'Mulish', sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          color: "rgba(255,255,255,0.5)",
        }}
      >
        Tap anywhere to close
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>

      {/* Title */}
      <div
        className="absolute top-6 left-8"
        style={{ fontFamily: "'Mulish', sans-serif", color: "#FFFFFF" }}
      >
        <span style={{ fontSize: "18px", fontWeight: 700 }}>Device Preview</span>
        <span className="block mt-1" style={{ fontSize: "12px", fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>
          DSFH Bedside Terminal · 15.6″ Touchscreen
        </span>
      </div>

      {/* Hardware mockup wrapper */}
      <div
        className="relative select-none"
        style={{
          maxWidth: "85vw",
          maxHeight: "82vh",
          transform: pressed ? "scale(0.98)" : "scale(1)",
          transition: "transform 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => { setPressed(false); onClose(); }}
        onPointerLeave={() => setPressed(false)}
      >
        {/* Mockup image */}
        <img
          ref={imgRef}
          src={hardwareMockup}
          alt="Bedside terminal hardware"
          className="block"
          draggable={false}
          onLoad={() => {
            if (imgRef.current) {
              setImgSize({ w: imgRef.current.clientWidth, h: imgRef.current.clientHeight });
            }
          }}
          style={{
            maxWidth: "85vw",
            maxHeight: "82vh",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            filter: "drop-shadow(0px 20px 60px rgba(0,0,0,0.5))",
          }}
        />

        {/* Screen overlay — current UI composited into the device screen */}
        <div
          className="absolute overflow-hidden"
          style={{
            ...screenStyle,
            borderRadius: `${Math.max(8, screenW * 0.014)}px`,
          }}
        >
          <div
            style={{
              width: "1920px",
              height: "1080px",
              transform: `scale(${uiScale})`,
              transformOrigin: "top left",
              pointerEvents: "none",
              background: "linear-gradient(180deg, #F4F7F9 0%, #EDF1F4 100%)",
              fontFamily: "'Mulish', sans-serif",
            }}
          >
            <MiniBedsideUI />
          </div>
        </div>
      </div>

      {/* Bottom info badge */}
      <div
        className="absolute bottom-6 flex items-center gap-3"
        style={{
          fontFamily: "'Mulish', sans-serif",
          backgroundColor: "rgba(255,255,255,0.08)",
          borderRadius: "12px",
          padding: "10px 20px",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#22C55E",
            boxShadow: "0 0 6px rgba(34,197,94,0.5)",
          }}
        />
        <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
          Live Preview · 1920 × 1080 · Landscape
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Simplified mini replica of the bedside UI for the preview
   ───────────────────────────────────────────────────────────── */
function MiniBedsideUI() {
  return (
    <div className="w-full h-full flex flex-col" style={{ background: "linear-gradient(180deg, #F4F7F9 0%, #EDF1F4 100%)" }}>
      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between shrink-0 w-full"
        style={{
          height: "77px",
          backgroundColor: "#FFFFFF",
          padding: "15px 24px",
          boxShadow: "0px 4px 11px 0px rgba(31,41,46,0.06)",
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{ width: "89px", height: "47px", backgroundColor: "rgba(0,138,171,0.08)", borderRadius: "8px" }}
        >
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#008AAB", letterSpacing: "0.5px" }}>DSFH</span>
        </div>

        {/* Prayer strip */}
        <div className="flex items-center gap-1">
          {(["FAJR", "DHUHR", "ASR", "MAGHRIB", "ISHA"] as const).map((name, i) => (
            <div
              key={name}
              className="flex flex-col items-center px-4 py-1.5 rounded-lg"
              style={{ backgroundColor: name === "ASR" ? "#008AAB" : "transparent" }}
            >
              <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.5px", color: name === "ASR" ? "#fff" : "#95A3AD" }}>{name}</span>
              <span style={{ fontSize: "14px", fontWeight: 700, color: name === "ASR" ? "#fff" : "#1B2A32", fontVariantNumeric: "tabular-nums" }}>
                {["05:46", "12:36", "15:56", "18:26", "19:27"][i]}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span style={{ fontSize: "20px", fontWeight: 700, color: "#1B2A32" }}>3:56 PM</span>
            <span style={{ fontSize: "12px", color: "#95A3AD" }}>Wednesday, Mar 11</span>
          </div>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#1B2A32" }}>38°C</span>
        </div>
      </div>

      {/* ── News ticker ── */}
      <div
        className="w-full flex items-center shrink-0"
        style={{ height: "36px", backgroundColor: "rgba(0,138,171,0.04)", padding: "0 24px", borderBottom: "1px solid rgba(0,138,171,0.08)" }}
      >
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#008AAB", marginRight: "8px" }}>NEWS</span>
        <span style={{ fontSize: "12px", color: "#73848C" }}>Welcome to Dr. Soliman Fakeeh Hospital — your comfort is our priority.</span>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex gap-[30px] px-6 pt-8 pb-4 min-h-0">
        {/* Left column */}
        <div className="flex flex-col gap-4 shrink-0" style={{ width: "360px" }}>
          {/* Patient greeting */}
          <div
            className="shrink-0 flex items-center gap-4"
            style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "20px", boxShadow: "0px 4px 12px rgba(31,41,46,0.06)" }}
          >
            <div className="shrink-0 rounded-full" style={{ width: "56px", height: "56px", backgroundColor: "#DEF4F7" }} />
            <div>
              <p style={{ fontSize: "18px", fontWeight: 700, color: "#1B2A32" }}>Hello, Sara</p>
              <p style={{ fontSize: "13px", color: "#95A3AD" }}>Room 412 · Bed A</p>
            </div>
          </div>

          {/* CareMe */}
          <div
            className="flex-1 flex flex-col"
            style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", boxShadow: "0px 4px 12px rgba(31,41,46,0.06)", overflow: "hidden" }}
          >
            <div className="flex items-center gap-3 p-4" style={{ borderBottom: "1px solid #F0F2F4" }}>
              <div className="shrink-0 rounded-full" style={{ width: "44px", height: "44px", backgroundColor: "#DEF4F7" }} />
              <div>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#1B2A32" }}>Your Care Team</p>
                <p style={{ fontSize: "12px", color: "#95A3AD" }}>Dr. Ahmad · Nurse Fatima</p>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((d) => (
                  <div
                    key={d}
                    className="flex flex-col items-center justify-center"
                    style={{ width: "56px", height: "68px", borderRadius: "12px", backgroundColor: d === 2 ? "#008AAB" : "#F4F7F9" }}
                  >
                    <span style={{ fontSize: "10px", color: d === 2 ? "#fff" : "#95A3AD" }}>{["Mon", "Tue", "Wed", "Thu", "Fri"][d]}</span>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: d === 2 ? "#fff" : "#1B2A32" }}>{[9, 10, 11, 12, 13][d]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center column */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <div className="flex flex-col flex-1 min-h-0 justify-center">
            <div className="flex flex-col gap-3">
              {/* 4 staggered columns — odd cols shifted down */}
              <div className="grid grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((col) => {
                  const labels = ["Media", "Reading", "Social", "Games", "Meeting", "Internet", "Tools", "Education"];
                  const topLabel = labels[col];
                  const bottomLabel = labels[col + 4];
                  const isOffset = col % 2 === 1;
                  return (
                    <div key={col} className="flex flex-col gap-3" style={{ transform: isOffset ? "translateY(36px)" : "none" }}>
                      {[topLabel, bottomLabel].map((label) => (
                        <div key={label} className="flex flex-col items-center justify-center gap-3" style={{ height: "310px", backgroundColor: "#FFFFFF", borderRadius: "16px", boxShadow: "0px 4px 12px rgba(31,41,46,0.06)" }}>
                          <div className="flex items-center justify-center" style={{ width: "60px", height: "60px", borderRadius: "18px", backgroundColor: "#DEF4F7" }}>
                            <HubIconMini label={label} />
                          </div>
                          <span style={{ fontSize: "18px", fontWeight: 700, color: "#3F3934" }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* About Us + Survey row */}
              <div className="grid grid-cols-4 gap-3" style={{ marginTop: "36px", minHeight: "62px" }}>
                <div className="col-span-2 flex items-center gap-3" style={{ backgroundColor: "#008AAB", borderRadius: "14px", padding: "12px 24px 12px 16px" }}>
                  <div className="flex items-center justify-center" style={{ width: "38px", height: "38px", borderRadius: "11px", backgroundColor: "rgba(255,255,255,0.18)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </div>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#FFFFFF" }}>About Us</span>
                </div>
                <div className="col-span-2 flex items-center gap-3" style={{ backgroundColor: "#008AAB", borderRadius: "14px", padding: "12px 24px 12px 16px" }}>
                  <div className="flex items-center justify-center" style={{ width: "38px", height: "38px", borderRadius: "11px", backgroundColor: "rgba(255,255,255,0.18)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  </div>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#FFFFFF" }}>Survey</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Services */}
        <div className="flex flex-col gap-3 shrink-0" style={{ width: "220px" }}>
          {(["Consultation", "Housekeeping", "Order Food", "Call"] as const).map((label) => {
            const isCall = label === "Call";
            return (
              <div
                key={label}
                className="flex-1 flex flex-col items-center justify-center gap-3"
                style={{ backgroundColor: isCall ? "#D10044" : "#FFFFFF", borderRadius: "16px", boxShadow: "0px 4px 12px rgba(31,41,46,0.06)" }}
              >
                <div className="flex items-center justify-center" style={{ width: "56px", height: "56px", borderRadius: "16px", backgroundColor: isCall ? "rgba(255,255,255,0.2)" : "rgba(209,0,68,0.08)" }}>
                  <ServiceIconMini label={label} isCall={isCall} />
                </div>
                <span style={{ fontSize: "17px", fontWeight: 700, color: isCall ? "#FFFFFF" : "#D10044" }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Tiny icon helpers for the mini UI ── */
function HubIconMini({ label }: { label: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    Media: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#008AAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
    Reading: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#008AAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    Social: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#008AAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    Games: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#008AAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" /><line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" /><circle cx="16" cy="12" r="1" />
      </svg>
    ),
    Meeting: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#008AAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94" /><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    Internet: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#008AAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    Tools: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#008AAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    Education: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#008AAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
      </svg>
    ),
  };
  return <>{iconMap[label] || null}</>;
}

function ServiceIconMini({ label, isCall }: { label: string; isCall: boolean }) {
  const color = isCall ? "#FFFFFF" : "#D10044";
  const iconMap: Record<string, React.ReactNode> = {
    Consultation: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94" />
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    Housekeeping: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    "Order Food": (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    Call: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  };
  return <>{iconMap[label] || null}</>;
}