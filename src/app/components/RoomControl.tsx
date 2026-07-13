import { useState } from "react";
import { Sun, SunDim, Lightbulb, LightbulbOff, Wind, Snowflake, Thermometer, Power, Pause, ChevronUp, ChevronDown } from "lucide-react";
import { useTheme, WEIGHT, SHADOW } from "./ThemeContext";
import { useLocale } from "./i18n";
import { InternalPageHeader } from "./InternalPageHeader";

type TabKey = "lights" | "curtains" | "ac";

/* ── Curtain SVGs ── */
function CurtainOpenIcon({ size = 22, color = "#fff" }: { size?: number; color?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 3h16" /><path d="M4 3v18" /><path d="M20 3v18" /><path d="M4 7c2 0 3 4 3 7" /><path d="M20 7c-2 0-3 4-3 7" />
  </svg>);
}
function CurtainClosedIcon({ size = 22, color = "#fff" }: { size?: number; color?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 3h16" /><path d="M4 3v18" /><path d="M20 3v18" /><path d="M8 3v18" /><path d="M12 3v18" /><path d="M16 3v18" />
  </svg>);
}
function AcIcon({ size = 24, color = "currentColor" }: { size?: number; color?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="12" rx="3" /><path d="M6 20h12" /><path d="M8 16v4" /><path d="M16 16v4" /><path d="M6 10h12" /><path d="M9 13c1-1 2-1 3 0s2 1 3 0" />
  </svg>);
}

/* ── Toggle Switch ── */
function Toggle({ on, onToggle, accent, size = "normal" }: { on: boolean; onToggle: () => void; accent: string; size?: "normal" | "large" }) {
  const w = size === "large" ? 80 : 68;
  const h = size === "large" ? 44 : 38;
  const dot = size === "large" ? 36 : 30;
  const pad = size === "large" ? 4 : 4;
  return (
    <button onClick={onToggle} className="relative cursor-pointer active:scale-95 transition-all duration-200"
      style={{ width: `${w}px`, height: `${h}px`, borderRadius: `${h / 2}px`, backgroundColor: on ? accent : "rgba(120,120,140,0.3)", border: "none", outline: "none", boxShadow: on ? `0 0 18px ${accent}50` : "none" }}>
      <div className="absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-250"
        style={{ width: `${dot}px`, height: `${dot}px`, backgroundColor: "#fff", left: on ? `${w - dot - pad}px` : `${pad}px`, boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }} />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * LIGHTS TAB
 * ══════════════════════════════════════════════════════════════════════ */
function LightsTab({ theme, fontFamily, t }: { theme: any; fontFamily: string; t: any }) {
  const [zones, setZones] = useState([
    { id: "main", nameKey: "room.light.main", icon: Sun, on: true },
    { id: "bed", nameKey: "room.light.bedside", icon: SunDim, on: true },
    { id: "bathroom", nameKey: "room.light.bathroom", icon: Lightbulb, on: false },
    { id: "reading", nameKey: "room.light.reading", icon: SunDim, on: false },
  ]);
  const toggle = (id: string) => setZones(p => p.map(z => z.id === id ? { ...z, on: !z.on } : z));
  const allOn = zones.every(z => z.on);

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Master Toggle */}
      <div style={{ backgroundColor: theme.surface, borderRadius: theme.radiusXl, border: theme.cardBorder, boxShadow: SHADOW.md, padding: "20px 28px" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center" style={{
              width: "52px", height: "52px", borderRadius: "14px",
              background: allOn ? `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})` : theme.surfaceElevated,
              boxShadow: allOn ? `0 4px 20px ${theme.primary}35` : "none", transition: "all 0.3s",
            }}>
              {allOn ? <Sun size={26} color="#fff" /> : <LightbulbOff size={26} color={theme.textMuted} />}
            </div>
            <div>
              <p style={{ fontFamily, fontSize: "17px", fontWeight: WEIGHT.bold, color: theme.textHeading }}>{t("room.light.allLights")}</p>
              <p style={{ fontFamily, fontSize: "13px", color: theme.textMuted }}>{zones.filter(z => z.on).length} / {zones.length} {t("room.active")}</p>
            </div>
          </div>
          <Toggle on={allOn} accent={theme.primary} onToggle={() => setZones(p => p.map(z => ({ ...z, on: !allOn })))} />
        </div>
      </div>

      {/* Zone Grid */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {zones.map(zone => {
          const Icon = zone.icon;
          return (
            <button key={zone.id} onClick={() => toggle(zone.id)}
              className="cursor-pointer active:scale-[0.97] transition-all flex flex-col items-center justify-center gap-4"
              style={{
                borderRadius: theme.radiusXl, outline: "none",
                background: zone.on ? `linear-gradient(145deg, ${theme.primary}, ${theme.primaryDark})` : theme.surface,
                border: zone.on ? "none" : theme.cardBorder,
                boxShadow: zone.on ? `0 8px 32px ${theme.primary}30` : SHADOW.md,
                padding: "24px",
              }}>
              <div style={{
                width: "68px", height: "68px", borderRadius: "50%",
                backgroundColor: zone.on ? "rgba(255,255,255,0.2)" : theme.surfaceElevated,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={30} color={zone.on ? "#fff" : theme.textMuted} />
              </div>
              <span style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.bold, color: zone.on ? "#fff" : theme.textHeading }}>
                {t(zone.nameKey)}
              </span>
              <div style={{
                padding: "6px 24px", borderRadius: "20px",
                backgroundColor: zone.on ? "rgba(255,255,255,0.2)" : theme.surfaceElevated,
                color: zone.on ? "#fff" : theme.textMuted,
                fontFamily, fontSize: "13px", fontWeight: WEIGHT.semibold,
              }}>{zone.on ? "ON" : "OFF"}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * CURTAINS TAB — open / half / close
 * ══════════════════════════════════════════════════════════════════════ */
function CurtainsTab({ theme, fontFamily, t }: { theme: any; fontFamily: string; t: any }) {
  const [curtains, setCurtains] = useState([
    { id: "window", nameKey: "room.curtain.window", state: "open" as "open" | "half" | "closed" },
    { id: "privacy", nameKey: "room.curtain.privacy", state: "closed" as "open" | "half" | "closed" },
  ]);
  const setState = (id: string, state: "open" | "half" | "closed") =>
    setCurtains(p => p.map(c => c.id === id ? { ...c, state } : c));
  const accent = theme.primary;
  const actions = [
    { key: "open" as const, labelKey: "room.curtain.open", icon: <ChevronUp size={30} strokeWidth={2.5} /> },
    { key: "half" as const, labelKey: "room.curtain.half", icon: <Pause size={26} strokeWidth={2.5} /> },
    { key: "closed" as const, labelKey: "room.curtain.closed", icon: <ChevronDown size={30} strokeWidth={2.5} /> },
  ];

  return (
    <div className="flex flex-col gap-5 h-full">
      {curtains.map(curtain => (
        <div key={curtain.id} style={{
          flex: 1, padding: "28px", display: "flex", flexDirection: "column",
          backgroundColor: theme.surface, borderRadius: theme.radiusXl,
          border: theme.cardBorder, boxShadow: SHADOW.md,
        }}>
          <div className="flex items-center gap-4 mb-6">
            <div style={{
              width: "52px", height: "52px", borderRadius: "14px",
              background: curtain.state !== "closed" ? `linear-gradient(135deg, ${accent}, ${theme.primaryDark})` : theme.surfaceElevated,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: curtain.state !== "closed" ? `0 4px 16px ${accent}30` : "none",
            }}>
              {curtain.state === "closed"
                ? <CurtainClosedIcon size={26} color={theme.textMuted} />
                : <CurtainOpenIcon size={26} color="#fff" />}
            </div>
            <div>
              <p style={{ fontFamily, fontSize: "17px", fontWeight: WEIGHT.bold, color: theme.textHeading }}>{t(curtain.nameKey)}</p>
              <p style={{ fontFamily, fontSize: "13px", color: theme.textMuted }}>
                {curtain.state === "half" ? t("room.curtain.half") : t(`room.curtain.${curtain.state}`)}
              </p>
            </div>
          </div>
          <div className="flex gap-4 flex-1 items-stretch">
            {actions.map(a => {
              const active = curtain.state === a.key;
              return (
                <button key={a.key} onClick={() => setState(curtain.id, a.key)}
                  className="flex-1 flex flex-col items-center justify-center gap-3 cursor-pointer active:scale-95 transition-all"
                  style={{
                    borderRadius: "20px", border: "none", outline: "none", minHeight: "90px",
                    background: active ? `linear-gradient(145deg, ${accent}, ${theme.primaryDark})` : theme.surfaceElevated,
                    color: active ? "#fff" : theme.textMuted,
                    boxShadow: active ? `0 6px 24px ${accent}35` : "none",
                  }}>
                  {a.icon}
                  <span style={{ fontFamily, fontSize: "14px", fontWeight: WEIGHT.semibold }}>{t(a.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * AC TAB — always visible, disabled when off
 * ══════════════════════════════════════════════════════════════════════ */
function AcTab({ theme, fontFamily, t }: { theme: any; fontFamily: string; t: any }) {
  const [acOn, setAcOn] = useState(true);
  const [temp, setTemp] = useState(22);
  const [fanSpeed, setFanSpeed] = useState(2);
  const [mode, setMode] = useState<"cool" | "heat" | "fan">("cool");
  const modes = [
    { key: "cool" as const, labelKey: "room.ac.cool", icon: Snowflake, color: "#38BDF8" },
    { key: "heat" as const, labelKey: "room.ac.heat", icon: Thermometer, color: "#FB923C" },
    { key: "fan" as const, labelKey: "room.ac.fan", icon: Wind, color: "#A78BFA" },
  ];
  const fans = [
    { level: 1, labelKey: "room.ac.low" },
    { level: 2, labelKey: "room.ac.medium" },
    { level: 3, labelKey: "room.ac.high" },
  ];
  const mc = modes.find(m => m.key === mode)!;
  const dim = acOn ? 1 : 0.35;

  return (
    <div className="flex gap-6 h-full">
      {/* Left — Temperature */}
      <div className="flex-1 flex flex-col items-center justify-center" style={{
        backgroundColor: theme.surface, borderRadius: theme.radiusXl,
        border: theme.cardBorder, boxShadow: SHADOW.md, padding: "32px",
      }}>
        {/* Temp Ring */}
        <div style={{ opacity: dim, transition: "opacity 0.3s", pointerEvents: acOn ? "auto" : "none" }}>
          <div style={{
            width: "220px", height: "220px", borderRadius: "50%", padding: "5px",
            background: acOn
              ? `conic-gradient(${mc.color} ${((temp - 16) / 14) * 100}%, ${theme.surfaceElevated} 0%)`
              : theme.surfaceElevated,
            boxShadow: acOn ? `0 0 40px ${mc.color}15` : "none",
          }}>
            <div style={{
              width: "100%", height: "100%", borderRadius: "50%", backgroundColor: theme.surface,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily, fontSize: "58px", fontWeight: WEIGHT.bold, color: theme.textHeading, lineHeight: 1 }}>{temp}</span>
              <span style={{ fontFamily, fontSize: "16px", color: theme.textMuted, marginTop: "4px" }}>°C</span>
            </div>
          </div>
        </div>

        {/* Power + Temp Buttons Row */}
        <div className="flex items-center gap-5 mt-7">
          <button onClick={() => acOn && setTemp(p => Math.max(16, p - 1))}
            className="cursor-pointer active:scale-90 transition-all flex items-center justify-center"
            style={{
              width: "56px", height: "56px", borderRadius: "50%", opacity: dim,
              background: theme.surfaceElevated, border: theme.cardBorder,
              outline: "none", fontSize: "26px", color: theme.textHeading, fontWeight: WEIGHT.bold,
              pointerEvents: acOn ? "auto" : "none",
            }}>−</button>

          {/* Big Power Button */}
          <button onClick={() => setAcOn(!acOn)}
            className="cursor-pointer active:scale-90 transition-all flex items-center justify-center"
            style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: acOn ? `linear-gradient(135deg, ${mc.color}, ${mc.color}CC)` : theme.surfaceElevated,
              border: acOn ? "none" : `2px solid rgba(120,120,140,0.3)`,
              outline: "none",
              boxShadow: acOn ? `0 6px 24px ${mc.color}40` : "none",
            }}>
            <Power size={28} color={acOn ? "#fff" : theme.textMuted} />
          </button>

          <button onClick={() => acOn && setTemp(p => Math.min(30, p + 1))}
            className="cursor-pointer active:scale-90 transition-all flex items-center justify-center"
            style={{
              width: "56px", height: "56px", borderRadius: "50%", opacity: dim,
              background: theme.surfaceElevated, border: theme.cardBorder,
              outline: "none", fontSize: "26px", color: theme.textHeading, fontWeight: WEIGHT.bold,
              pointerEvents: acOn ? "auto" : "none",
            }}>+</button>
        </div>
      </div>

      {/* Right — Mode + Fan (always visible, dimmed when off) */}
      <div className="flex flex-col gap-5" style={{ width: "280px", opacity: dim, transition: "opacity 0.3s", pointerEvents: acOn ? "auto" : "none" }}>
        <div style={{ flex: 1, padding: "24px", backgroundColor: theme.surface, borderRadius: theme.radiusXl, border: theme.cardBorder, boxShadow: SHADOW.md }}>
          <p style={{ fontFamily, fontSize: "12px", fontWeight: WEIGHT.bold, color: theme.textMuted, letterSpacing: "1.5px", marginBottom: "14px" }}>
            {t("room.ac.mode")}
          </p>
          <div className="flex flex-col gap-3">
            {modes.map(m => {
              const active = mode === m.key;
              const Icon = m.icon;
              return (
                <button key={m.key} onClick={() => setMode(m.key)}
                  className="flex items-center gap-4 cursor-pointer active:scale-[0.97] transition-all"
                  style={{
                    height: "58px", borderRadius: "16px", paddingInline: "20px",
                    background: active ? `${m.color}18` : theme.surfaceElevated,
                    border: active ? `2px solid ${m.color}50` : `2px solid transparent`,
                    outline: "none",
                  }}>
                  <Icon size={22} color={active ? m.color : theme.textMuted} />
                  <span style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.semibold, color: active ? m.color : theme.textMuted }}>
                    {t(m.labelKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ padding: "24px", backgroundColor: theme.surface, borderRadius: theme.radiusXl, border: theme.cardBorder, boxShadow: SHADOW.md }}>
          <p style={{ fontFamily, fontSize: "12px", fontWeight: WEIGHT.bold, color: theme.textMuted, letterSpacing: "1.5px", marginBottom: "14px" }}>
            {t("room.ac.fanSpeed")}
          </p>
          <div className="flex gap-3">
            {fans.map(f => {
              const active = fanSpeed === f.level;
              return (
                <button key={f.level} onClick={() => setFanSpeed(f.level)}
                  className="flex-1 flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                  style={{
                    height: "64px", borderRadius: "14px", border: "none", outline: "none",
                    background: active ? mc.color : theme.surfaceElevated,
                    color: active ? "#fff" : theme.textMuted,
                    boxShadow: active ? `0 4px 20px ${mc.color}35` : "none",
                  }}>
                  <Wind size={16} />
                  <span style={{ fontFamily, fontSize: "12px", fontWeight: WEIGHT.semibold }}>{t(f.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * MAIN ROOM CONTROL
 * ══════════════════════════════════════════════════════════════════════ */
const TABS: { key: TabKey; labelKey: string; icon: React.ReactNode }[] = [
  { key: "lights", labelKey: "room.tab.lights", icon: <Lightbulb size={20} /> },
  { key: "curtains", labelKey: "room.tab.curtains", icon: <CurtainOpenIcon size={20} /> },
  { key: "ac", labelKey: "room.tab.ac", icon: <AcIcon size={20} /> },
];

export function RoomControl({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();
  const { t, fontFamily } = useLocale();
  const [activeTab, setActiveTab] = useState<TabKey>("lights");

  return (
    <div className="absolute inset-0 z-50 flex flex-col"
      style={{ backgroundColor: theme.background, animation: "rcIn 0.25s ease-out" }}>
      <div className="shrink-0" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, paddingBottom: "20px" }}>
        <InternalPageHeader title={t("room.title")} icon={<AcIcon size={26} color="#fff" />} onClose={onClose} />
        <div className="mx-12" style={{ backgroundColor: "rgba(255,255,255,0.12)", borderRadius: "16px", padding: "4px", display: "flex" }}>
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex-1 flex items-center justify-center gap-3 cursor-pointer transition-all"
                style={{
                  height: "50px", borderRadius: "13px",
                  background: active ? "rgba(255,255,255,0.22)" : "transparent",
                  border: "none", outline: "none",
                  boxShadow: active ? "0 2px 12px rgba(0,0,0,0.12)" : "none",
                }}>
                <div style={{ color: active ? "#fff" : "rgba(255,255,255,0.55)" }}>{tab.icon}</div>
                <span style={{ fontFamily, fontSize: "15px", fontWeight: active ? WEIGHT.bold : WEIGHT.medium, color: active ? "#fff" : "rgba(255,255,255,0.55)" }}>
                  {t(tab.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-12 py-6" style={{ scrollbarWidth: "none" }}>
        {activeTab === "lights" && <LightsTab theme={theme} fontFamily={fontFamily} t={t} />}
        {activeTab === "curtains" && <CurtainsTab theme={theme} fontFamily={fontFamily} t={t} />}
        {activeTab === "ac" && <AcTab theme={theme} fontFamily={fontFamily} t={t} />}
      </div>
      <style>{`@keyframes rcIn { from { opacity:0; } to { opacity:1; } }`}</style>
    </div>
  );
}
