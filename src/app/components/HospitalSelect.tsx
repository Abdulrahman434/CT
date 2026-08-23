import { useMemo, useState } from "react";
import { getAllHospitalConfigs, type HospitalCoreConfig } from "./ThemeContext";
import { setSelectedHospitalId } from "../lib/hospitalAccess";

/* ═══════════════════════════════════════════════════════════════════════════
 * HOSPITAL SELECT — first-launch screen, shown before the sign-in gate
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Lists every hospital from the same source the "Hospital Configs" modal uses
 * (getAllHospitalConfigs → built-in presets + saved edits + user-created), so
 * there is exactly one copy of the hospital data.
 *
 * Picking a hospital persists the choice and hands control to PasswordGate,
 * which then validates against that hospital's access code. It renders outside
 * ThemeProvider (that only mounts after sign-in), so it reads the config list
 * directly and styles itself from the picked config's own brand colours.
 * ═══════════════════════════════════════════════════════════════════════════ */

const SKY = "#6CC4E0";
const NAVY = "#1B2F5B";

export function HospitalSelect({ onSelected }: { onSelected: (id: string) => void }) {
  const configs = useMemo(() => getAllHospitalConfigs(), []);
  const [chosen, setChosen] = useState<string | null>(null);

  const choose = (config: HospitalCoreConfig) => {
    // Brief highlight so the tap registers visually before the screen swaps.
    setChosen(config.id);
    setSelectedHospitalId(config.id);
    setTimeout(() => onSelected(config.id), 180);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Mulish', 'Inter', sans-serif",
        overflow: "hidden",
        background: "#0A0F1D",
      }}
    >
      {/* ─── Immersive background layer (same treatment as the sign-in gate) ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          animation: "kenburns 24s ease-in-out infinite alternate",
          willChange: "transform",
        }}
      >
        <img
          src="/assets/bg/careinnbak.jpg"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          background: "rgba(0, 0, 0, 0.35)",
          pointerEvents: "none",
        }}
      />

      {/* ─── Frosted glass card ─── */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          width: "min(880px, calc(100% - 48px))",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow:
            "0 24px 60px rgba(15, 30, 55, 0.20), 0 2px 8px rgba(15, 30, 55, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.40)",
          padding: "40px 36px 32px",
          animation: "fadeSlideUp 0.6s ease-out both",
        }}
      >
        <h1
          style={{
            color: NAVY,
            fontSize: "30px",
            fontWeight: 800,
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
            textAlign: "center",
            textShadow: "0 1px 2px rgba(255, 255, 255, 0.35)",
          }}
        >
          Select your hospital
        </h1>
        <p
          style={{
            color: "rgba(255, 255, 255, 0.85)",
            fontSize: "14px",
            fontWeight: 600,
            margin: "0 0 28px",
            textAlign: "center",
          }}
        >
          Choose this device&rsquo;s hospital. You will only be asked once.
        </p>

        <div
          className="hs-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "12px",
            paddingRight: "4px",
          }}
        >
          {configs.map((config) => {
            const isChosen = chosen === config.id;
            return (
              <button
                key={config.id}
                onClick={() => choose(config)}
                className="hs-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  background: isChosen ? "rgba(255, 255, 255, 0.30)" : "rgba(255, 255, 255, 0.10)",
                  border: `1.5px solid ${isChosen ? SKY : "rgba(255, 255, 255, 0.25)"}`,
                  boxShadow: isChosen ? `0 0 0 3px ${SKY}40` : "none",
                  transition: "background 0.2s ease, border-color 0.2s ease, transform 0.15s ease",
                }}
              >
                {/* Brand swatch — the hospital's own primary/accent, not a theme token */}
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    width: "10px",
                    height: "48px",
                    borderRadius: "5px",
                    overflow: "hidden",
                    flexDirection: "column",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  }}
                >
                  <span style={{ flex: 2, background: config.primary }} />
                  <span style={{ flex: 1, background: config.accent }} />
                </span>

                {/* Logo, with an initial-chip fallback for configs without one */}
                <span
                  style={{
                    flexShrink: 0,
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.92)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {config.logoUrl ? (
                    <img
                      src={config.logoUrl}
                      alt=""
                      style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain" }}
                    />
                  ) : (
                    <span style={{ color: config.primary, fontSize: "18px", fontWeight: 800 }}>
                      {(config.hospitalShortName || config.hospitalName || "?").trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>

                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      color: "#FFFFFF",
                      fontSize: "15px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textShadow: "0 1px 3px rgba(0,0,0,0.35)",
                    }}
                  >
                    {config.hospitalName || "Untitled"}
                  </span>
                  <span
                    style={{
                      display: "block",
                      color: "rgba(255, 255, 255, 0.75)",
                      fontSize: "12px",
                      fontWeight: 600,
                      marginTop: "2px",
                    }}
                  >
                    {config.hospitalShortName}
                    {config.location ? ` • ${config.location}` : ""}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: 0,
          right: 0,
          textAlign: "center",
          color: "rgba(255, 255, 255, 0.4)",
          fontSize: "13px",
          zIndex: 3,
          pointerEvents: "none",
        }}
      >
        Hospital Bedside Companion by CareInn &copy; {new Date().getFullYear()}
      </div>

      <style>{`
        .hs-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.35) transparent; }
        .hs-scroll::-webkit-scrollbar { width: 6px; }
        .hs-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.35); border-radius: 3px; }
        .hs-card:hover { background: rgba(255, 255, 255, 0.22) !important; border-color: rgba(255, 255, 255, 0.55) !important; }
        .hs-card:active { transform: scale(0.985); }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes kenburns {
          0%   { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.12) translate(-1.5%, -0.8%); }
        }
      `}</style>
    </div>
  );
}
