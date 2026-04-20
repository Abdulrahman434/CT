import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneMissed,
  PhoneOutgoing,
  PhoneIncoming as PhoneIncomingIcon,
  Mic,
  MicOff,
  Volume2,
  Pause,
  Play,
  Grid3X3,
  ArrowLeft,
  ArrowRight,
  PhoneIncoming,
  Delete,
  BookUser,
  Stethoscope,
  ConciergeBell,
  Pill,
  UtensilsCrossed,
  Sparkles,
  Heart,
  Monitor,
  BookOpen,
  Headset,
  MapPin,
} from "lucide-react";
import { useTheme, TEXT_STYLE, WEIGHT, TYPE_SCALE, SHADOW } from "./ThemeContext";
import { useLocale } from "./i18n";
import { playTone } from "./useRipple";
import type { LucideIcon } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
 * DATA
 * ═══════════════════════════════════════════════════════════════════════════ */

interface Extension {
  id: string;
  nameKey: string;
  descKey: string;
  ext: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  emergency?: boolean;
}

interface CallLogEntry {
  id: string;
  extensionId: string;
  nameKey: string;
  ext: string;
  time: string;
  duration?: string;
  type: "missed" | "attended";
  direction: "incoming" | "outgoing";
}

type CallState = "idle" | "incoming" | "outgoing" | "active";

const EXTENSIONS: Extension[] = [
  { id: "nurse",       nameKey: "call.nurseStation",     descKey: "call.nurseStation.desc",     ext: "1001", icon: Stethoscope,     iconColor: "#E11D48", iconBg: "rgba(225,29,72,0.08)" },
  { id: "reception",   nameKey: "call.reception",        descKey: "call.reception.desc",        ext: "1000", icon: ConciergeBell,   iconColor: "#0891B2", iconBg: "rgba(8,145,178,0.08)" },
  { id: "pharmacy",    nameKey: "call.pharmacy",         descKey: "call.pharmacy.desc",         ext: "1050", icon: Pill,            iconColor: "#7C3AED", iconBg: "rgba(124,58,237,0.08)" },
  { id: "dietary",     nameKey: "call.dietary",          descKey: "call.dietary.desc",          ext: "1060", icon: UtensilsCrossed, iconColor: "#EA580C", iconBg: "rgba(234,88,12,0.08)" },
  { id: "housekeep",   nameKey: "call.housekeeping",     descKey: "call.housekeeping.desc",     ext: "1070", icon: Sparkles,        iconColor: "#0D9488", iconBg: "rgba(13,148,136,0.08)" },
  { id: "relations",   nameKey: "call.patientRelations", descKey: "call.patientRelations.desc", ext: "1080", icon: Heart,           iconColor: "#DB2777", iconBg: "rgba(219,39,119,0.08)" },
  { id: "it",          nameKey: "call.itSupport",        descKey: "call.itSupport.desc",        ext: "1090", icon: Monitor,         iconColor: "#4F46E5", iconBg: "rgba(79,70,229,0.08)" },
  { id: "religious",   nameKey: "call.religiousServices",descKey: "call.religiousServices.desc",ext: "1100", icon: BookOpen,        iconColor: "#059669", iconBg: "rgba(5,150,105,0.08)" },
  { id: "operator",    nameKey: "call.operator",         descKey: "call.operator.desc",         ext: "0",    icon: Headset,         iconColor: "#6366F1", iconBg: "rgba(99,102,241,0.08)" },
];

const MOCK_MISSED: CallLogEntry[] = [
  { id: "m1", extensionId: "nurse",     nameKey: "call.nurseStation", ext: "1001", time: "2:15 PM",  type: "missed", direction: "incoming" },
  { id: "m2", extensionId: "reception", nameKey: "call.reception",    ext: "1000", time: "11:30 AM", type: "missed", direction: "incoming" },
  { id: "m3", extensionId: "pharmacy",  nameKey: "call.pharmacy",     ext: "1050", time: "9:45 AM",  type: "missed", direction: "incoming" },
];

const MOCK_ATTENDED: CallLogEntry[] = [
  { id: "a1", extensionId: "nurse",     nameKey: "call.nurseStation",     ext: "1001", time: "1:30 PM",  duration: "3:24", type: "attended", direction: "incoming" },
  { id: "a2", extensionId: "dietary",   nameKey: "call.dietary",          ext: "1060", time: "12:00 PM", duration: "1:12", type: "attended", direction: "outgoing" },
  { id: "a3", extensionId: "reception", nameKey: "call.reception",        ext: "1000", time: "10:20 AM", duration: "2:45", type: "attended", direction: "outgoing" },
  { id: "a4", extensionId: "relations", nameKey: "call.patientRelations", ext: "1080", time: "8:00 AM",  duration: "5:10", type: "attended", direction: "incoming" },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * CALL TIMER HOOK
 * ═══════════════════════════════════════════════════════════════════════════ */

function useCallTimer(active: boolean) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active) {
      setSeconds(0);
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSeconds(0);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * AUDIO HOOK (Web Audio API Synth)
 * ═══════════════════════════════════════════════════════════════════════════ */
const DTMF_FREQS: Record<string, [number, number]> = {
  "1": [697, 1209], "2": [697, 1336], "3": [697, 1477],
  "4": [770, 1209], "5": [770, 1336], "6": [770, 1477],
  "7": [852, 1209], "8": [852, 1336], "9": [852, 1477],
  "0": [941, 1336],
  "*": [941, 1209], "#": [941, 1477]
};

function playDTMF(digit: string) {
  if (digit === "delete") {
    // Quick pop for delete
    playTone(350, undefined, 0.08, 0.08);
    return;
  }
  const freqs = DTMF_FREQS[digit];
  if (freqs) {
    playTone(freqs[0], freqs[1], 0.15, 0.1);
  }
}

function useCallAudio(callState: CallState) {
  useEffect(() => {
    let ctx: AudioContext | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;

    const stop = () => {
      if (interval) clearInterval(interval);
      if (ctx) ctx.close().catch(() => {});
      ctx = null;
    };

    if (callState === "outgoing" || callState === "incoming") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return stop;
      try {
        ctx = new AudioCtx();
        if (ctx.state === "suspended") ctx.resume();
      } catch (e) {
        console.warn("AudioContext failed", e);
        return stop;
      }
    }

    if (callState === "outgoing" && ctx) {
      const playTone = () => {
        if (!ctx) return;
        const t = ctx.currentTime;
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.1);
        gain.gain.setValueAtTime(0.12, t + 1.9);
        gain.gain.linearRampToValueAtTime(0, t + 2.0);

        const o1 = ctx.createOscillator(); o1.frequency.value = 440;
        const o2 = ctx.createOscillator(); o2.frequency.value = 480;
        o1.connect(gain); o2.connect(gain);
        o1.start(t); o2.start(t);
        o1.stop(t + 2.0); o2.stop(t + 2.0);
      };
      playTone();
      interval = setInterval(playTone, 6000);
    } else if (callState === "incoming" && ctx) {
      // Modern soft electronic melodic arpeggio ringtone (Smartphone notification style)
      const playRing = () => {
        if (!ctx) return;
        const t = ctx.currentTime;
        
        const playTone = (freq: number, startOff: number) => {
          if (!ctx) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = "sine";
          osc.frequency.value = freq;
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          gain.gain.setValueAtTime(0, t + startOff);
          gain.gain.linearRampToValueAtTime(0.12, t + startOff + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + startOff + 0.5);
          
          osc.start(t + startOff);
          osc.stop(t + startOff + 0.5);
        };

        // Quick upward ripple
        playTone(523.25, 0.0);  // C5
        playTone(698.46, 0.12); // F5
        playTone(880.00, 0.24); // A5
        playTone(1046.50, 0.36); // C6
        
        // Gentle downward ripple
        playTone(880.00, 0.6); // A5
        playTone(698.46, 0.72); // F5
      };
      playRing();
      interval = setInterval(playRing, 2800); // Repeat every 2.8 seconds
    }

    return stop;
  }, [callState]);
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MAIN CALL SCREEN
 * ═══════════════════════════════════════════════════════════════════════════ */

export function CallScreen({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();
  const { t, isRTL, fontFamily } = useLocale();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const [callState, setCallState] = useState<CallState>("idle");
  const [callTarget, setCallTarget] = useState<Extension | null>(null);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [dialInput, setDialInput] = useState("");
  const [historyTab, setHistoryTab] = useState<"all" | "missed" | "attended">("all");
  const [showKeypad, setShowKeypad] = useState(false);
  const [inCallDigits, setInCallDigits] = useState("");

  const callTimer = useCallTimer(callState === "active");
  useCallAudio(callState);
  
  const primary = theme.primary;
  const DANGER = "#D10044";

  useEffect(() => {
    if (callState === "outgoing") {
      const timer = setTimeout(() => setCallState("active"), 3000);
      return () => clearTimeout(timer);
    }
  }, [callState]);

  const handleDial = useCallback((ext: Extension) => {
    setCallTarget(ext);
    setMuted(false); setSpeaker(false); setOnHold(false);
    setCallState("outgoing");
  }, []);

  const handleDialCustom = useCallback(() => {
    if (!dialInput) return;
    const found = EXTENSIONS.find((e) => e.ext === dialInput);
    const target: Extension = found ?? { id: "custom", nameKey: "call.ext", descKey: "", ext: dialInput };
    setCallTarget(target);
    setMuted(false); setSpeaker(false); setOnHold(false);
    setCallState("outgoing");
  }, [dialInput]);

  const handleSimulateIncoming = useCallback(() => {
    setCallTarget(EXTENSIONS[0]);
    setCallState("incoming");
  }, []);

  const handleAccept = useCallback(() => {
    setCallState("active");
    setMuted(false); setSpeaker(false); setOnHold(false);
  }, []);

  const handleDecline = useCallback(() => { setCallState("idle"); setCallTarget(null); setShowKeypad(false); setInCallDigits(""); }, []);
  const handleEnd = useCallback(() => { setCallState("idle"); setCallTarget(null); setShowKeypad(false); setInCallDigits(""); }, []);

  const onKeypadPress = useCallback((digit: string) => {
    playDTMF(digit);
    setDialInput((prev) => {
      if (prev.length >= 6) return prev;
      return prev + digit;
    });
  }, []);

  const onKeypadDelete = useCallback(() => {
    if (!dialInput) return;
    playDTMF("delete");
    setDialInput((prev) => prev.slice(0, -1));
  }, [dialInput]);

  /* ═══════════════════════════════════════════════════════════════════════
   * RENDER — Call-in-progress overlays (dark)
   * ══════════════════════════════════════════════════════════════════════ */
  if (callState !== "idle" && callTarget) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col" style={{ animation: "callScreenIn 0.25s ease-out" }}>
        <div className="absolute inset-0" style={{
          background: callState === "incoming"
            ? `linear-gradient(160deg, ${primary} 0%, ${theme.primaryDark} 50%, #0a1628 100%)`
            : callState === "outgoing"
            ? `linear-gradient(160deg, ${primary} 0%, ${theme.primaryDark} 50%, #0a1628 100%)`
            : `linear-gradient(160deg, ${theme.primaryDark} 0%, #0d1825 50%, #060e18 100%)`,
        }} />

        {callState === "incoming" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[0, 1, 2].map((i) => (
              <div key={i} className="absolute rounded-full" style={{
                width: `${200 + i * 120}px`, height: `${200 + i * 120}px`,
                border: `1px solid rgba(255,255,255,${0.12 - i * 0.03})`,
                animation: `callPulseRing 2.5s ease-out ${i * 0.5}s infinite`,
              }} />
            ))}
          </div>
        )}

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span style={{ fontFamily, ...TEXT_STYLE.label, color: "rgba(255,255,255,0.6)", letterSpacing: "2px" }}>
              {callState === "incoming" ? t("call.incoming") : callState === "outgoing" ? t("call.ringing") : t("call.connected")}
            </span>
          </motion.div>

          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 20 }}
            className="flex items-center justify-center" style={{
              width: "120px", height: "120px", borderRadius: theme.radiusFull,
              backgroundColor: callState === "incoming" ? "rgba(255,255,255,0.15)" : callState === "active" ? `${primary}33` : "rgba(255,255,255,0.08)",
              border: callState === "active" ? `2px solid ${primary}` : "2px solid rgba(255,255,255,0.12)",
            }}>
            <Phone size={48} color="#fff" strokeWidth={1.5} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-center">
            <p style={{ fontFamily, ...TEXT_STYLE.display, color: "#FFFFFF", margin: 0 }}>{t(callTarget.nameKey)}</p>
            <p style={{ fontFamily, ...TEXT_STYLE.body, color: "rgba(255,255,255,0.5)", marginTop: "8px" }}>
              {t("call.ext")} {callTarget.ext}
            </p>
          </motion.div>

          {callState === "active" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <div className="rounded-full" style={{ width: "8px", height: "8px", backgroundColor: "#22C55E", animation: "callDotPulse 1.5s ease-in-out infinite" }} />
              <span style={{ fontFamily: theme.fontFamilyMono, fontSize: TYPE_SCALE["2xl"], fontWeight: WEIGHT.semibold, color: "rgba(255,255,255,0.85)", letterSpacing: "2px" }}>
                {callTimer}
              </span>
            </motion.div>
          )}

          {callState === "outgoing" && (
            <div className="flex gap-2 mt-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-full" style={{
                  width: "8px", height: "8px", backgroundColor: "rgba(255,255,255,0.4)",
                  animation: `callDotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          )}
        </div>

        <div className="relative z-10 pb-16">
          {callState === "active" && (
            <div className="flex flex-col items-center gap-6">
              {showKeypad ? (
                /* ── In-call Keypad overlay ── */
                <div dir="ltr" className="flex flex-col items-center gap-3" style={{ animation: "callScreenIn 0.2s ease-out" }}>
                   {/* Digit display */}
                   <div style={{ minHeight: "40px", display: "flex", alignItems: "center", justifyContent: "center", padding: "2px 16px" }}>
                     <span style={{ fontFamily: theme.fontFamilyMono || fontFamily, fontSize: "30px", color: "#fff", fontWeight: 400, letterSpacing: "6px" }}>
                       {inCallDigits || "\u00A0"}
                     </span>
                   </div>
                   {/* Keypad grid */}
                   {[["1","2","3"],["4","5","6"],["7","8","9"],["*","0","#"]].map((row, ri) => (
                      <div key={ri} className="flex gap-4 justify-center">
                        {row.map((digit) => (
                           <button key={digit} data-no-tick="true" onPointerDown={() => { playDTMF(digit); setInCallDigits(prev => prev.length >= 16 ? prev : prev + digit); }} className="active:scale-90 transition-transform" style={{
                             width:"68px", height:"68px", borderRadius:theme.radiusFull, backgroundColor:"rgba(255,255,255,0.12)",
                             display:"flex", alignItems:"center", justifyContent:"center", border: "none",
                           }}>
                             <span style={{fontFamily:theme.fontFamilyMono || fontFamily, fontSize:"28px", color:"#fff", fontWeight: 500}}>{digit}</span>
                           </button>
                        ))}
                      </div>
                   ))}
                   {/* Bottom row: Hide + End call + Placeholder to align perfectly with the grid */}
                   <div className="flex gap-4 justify-center mt-2 relative">
                     {/* Left: Back (aligns with *) */}
                     <button onClick={() => { setShowKeypad(false); setInCallDigits(""); }}
                       className="flex items-center justify-center active:scale-90 transition-transform"
                       style={{ width: "68px", height: "68px", backgroundColor: "transparent", border: "none" }}>
                       <ArrowLeft size={28} color="rgba(255,255,255,0.5)" strokeWidth={2} />
                     </button>
                     
                     {/* Center: End Call (aligns with 0) */}
                     <div className="flex flex-col items-center relative">
                       <button onClick={handleEnd} className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform relative z-10"
                         style={{ width: "68px", height: "68px", borderRadius: theme.radiusFull, backgroundColor: DANGER, border: "none", boxShadow: "0 8px 32px rgba(209,0,68,0.4)" }}>
                         <PhoneOff size={28} color="#fff" />
                       </button>
                       <span style={{ position: "absolute", top: "76px", width: "100px", textAlign: "center", fontFamily, ...TEXT_STYLE.caption, color: "rgba(255,255,255,0.4)" }}>{t("call.endCall")}</span>
                     </div>
                     
                     {/* Right: Empty placeholder (aligns with #) */}
                     <div style={{ width: "68px" }} />
                   </div>
                </div>
              ) : (
                /* ── Normal call controls ── */
                <div className="flex items-center justify-center gap-10">
                  <CallControlButton icon={muted ? MicOff : Mic} label={muted ? t("call.unmute") : t("call.mute")} active={muted} onTap={() => setMuted(!muted)} fontFamily={fontFamily} />
                  <CallControlButton icon={Volume2} label={t("call.speaker")} active={speaker} onTap={() => setSpeaker(!speaker)} fontFamily={fontFamily} />
                  <CallControlButton icon={onHold ? Play : Pause} label={onHold ? t("call.resume") : t("call.hold")} active={onHold} onTap={() => setOnHold(!onHold)} fontFamily={fontFamily} />
                  <CallControlButton icon={Grid3X3} label={t("call.keypad")} active={false} onTap={() => setShowKeypad(true)} fontFamily={fontFamily} />
                </div>
              )}

              {/* ── Normal End Call button when keypad is HIDDEN ── */}
              {!showKeypad && (
                <div className="flex flex-col items-center gap-2 mt-4">
                  <button onClick={handleEnd} className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                    style={{ width: "72px", height: "72px", borderRadius: theme.radiusFull, backgroundColor: DANGER, border: "none", boxShadow: "0 8px 32px rgba(209,0,68,0.4)" }}>
                    <PhoneOff size={28} color="#fff" />
                  </button>
                  <span style={{ fontFamily, ...TEXT_STYLE.caption, color: "rgba(255,255,255,0.4)" }}>{t("call.endCall")}</span>
                </div>
              )}
            </div>
          )}
          {callState === "outgoing" && (
            <div className="flex flex-col items-center gap-3">
              <button onClick={handleEnd} className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                style={{ width: "72px", height: "72px", borderRadius: theme.radiusFull, backgroundColor: DANGER, border: "none", boxShadow: "0 8px 32px rgba(209,0,68,0.4)" }}>
                <PhoneOff size={28} color="#fff" />
              </button>
              <span style={{ fontFamily, ...TEXT_STYLE.caption, color: "rgba(255,255,255,0.4)" }}>{t("call.cancel")}</span>
            </div>
          )}
          {callState === "incoming" && (
            <div className="flex items-center justify-center gap-24">
              <div className="flex flex-col items-center gap-3">
                <button onClick={handleDecline} className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                  style={{ width: "72px", height: "72px", borderRadius: theme.radiusFull, backgroundColor: DANGER, border: "none", boxShadow: "0 8px 32px rgba(209,0,68,0.35)" }}>
                  <PhoneOff size={28} color="#fff" />
                </button>
                <span style={{ fontFamily, ...TEXT_STYLE.caption, color: "rgba(255,255,255,0.5)" }}>{t("call.decline")}</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <button onClick={handleAccept} className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                  style={{ width: "72px", height: "72px", borderRadius: theme.radiusFull, backgroundColor: "#22C55E", border: "none", boxShadow: "0 8px 32px rgba(34,197,94,0.35)", animation: "callAcceptPulse 1.5s ease-in-out infinite" }}>
                  <Phone size={28} color="#fff" />
                </button>
                <span style={{ fontFamily, ...TEXT_STYLE.caption, color: "rgba(255,255,255,0.5)" }}>{t("call.accept")}</span>
              </div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes callScreenIn { from { opacity:0; transform:scale(1.02); } to { opacity:1; transform:scale(1); } }
          @keyframes callPulseRing { 0% { transform:scale(0.8); opacity:0.6; } 100% { transform:scale(1.6); opacity:0; } }
          @keyframes callDotPulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
          @keyframes callDotBounce { 0%,100% { transform:translateY(0); opacity:0.3; } 50% { transform:translateY(-6px); opacity:1; } }
          @keyframes callAcceptPulse { 0%,100% { box-shadow:0 8px 32px rgba(34,197,94,0.35); } 50% { box-shadow:0 8px 32px rgba(34,197,94,0.6),0 0 0 12px rgba(34,197,94,0.1); } }
        `}</style>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
   * RENDER — Idle / Directory + Keypad + History — CareMe expanded pattern
   * ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      style={{
        background: `linear-gradient(160deg, ${primary} 0%, ${theme.primaryDark} 40%, #0a1628 100%)`,
        animation: "callScreenIn 0.2s ease-out",
      }}
    >
      {/* Subtle hero texture */}
      <img
        src={theme.heroImageUrl}
        alt="" aria-hidden
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        style={{ opacity: 0.1, mixBlendMode: "luminosity" }}
      />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.15)", backdropFilter: "blur(6px)" }} />

      {/* ── Header ── */}
      <div className={`shrink-0 flex items-center justify-between pt-8 pb-2 relative z-10 ${isRTL ? "pr-[172px] pl-[172px]" : "pl-[172px] pr-[172px]"}`}>
        <div className="flex items-center gap-4 relative">
          <button
            onClick={onClose}
            className="flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer absolute"
            style={{
              width: "52px", height: "52px", borderRadius: theme.radiusLg,
              backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              [isRTL ? "right" : "left"]: "-112px"
            }}
          >
            <BackArrow size={24} style={{ color: "#fff" }} />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{
              width: "52px", height: "52px", borderRadius: theme.radiusLg,
              backgroundColor: "rgba(255,255,255,0.12)",
            }}>
              <Phone size={26} fill="#fff" style={{ color: "#fff" }} />
            </div>
            <div>
              <h2 style={{ fontFamily, ...TEXT_STYLE.display, fontSize: "32px", color: "#FFFFFF", lineHeight: "36px" }}>
                {t("call.title")}
              </h2>
              <p style={{ fontFamily, ...TEXT_STYLE.caption, color: "rgba(255,255,255,0.6)", marginTop: "2px" }}>
                {t("call.tapToCall")}
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSimulateIncoming}
          className="flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform hover:brightness-110" 
          style={{
            borderRadius: theme.radiusLg, backgroundColor: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)", padding: "10px 24px 10px 16px", boxShadow: SHADOW.sm,
            outline: "none",
          }}
        >
          <div className="w-10 h-10 flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#fff", borderRadius: theme.radiusMd }}>
            <Phone size={20} />
          </div>
          <div className="text-left">
            <p style={{ fontFamily, ...TEXT_STYLE.caption, fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>{t("call.yourExtension")}</p>
            <p style={{ fontFamily: theme.fontFamilyMono, fontSize: "20px", fontWeight: WEIGHT.bold, color: "#fff", letterSpacing: "1px", lineHeight: 1 }}>4120</p>
          </div>
        </button>
      </div>

      {/* ── 3-Column Content ── */}
      <div className={`min-h-0 flex pt-8 pb-20 relative z-10 ${isRTL ? "pr-[172px] pl-[172px]" : "pl-[172px] pr-[172px]"}`} style={{ flex: "1 1 0", maxHeight: "calc(100% - 130px)", gap: "20px" }}>

        <div className="flex-1 flex flex-col gap-4 min-w-0" style={{ flex: "1 1 0" }}>
           {/* Header Row */}
           <div 
             className="flex items-center gap-3 px-5 py-3.5 shrink-0 shadow-sm"
             style={{ backgroundColor: "#fff", borderRadius: theme.radiusLg, border: "1px solid rgba(0,0,0,0.04)" }}
           >
              <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ backgroundColor: theme.primarySubtle, color: theme.primary, borderRadius: theme.radiusMd }}>
                <PhoneCall size={16} />
              </div>
              <span style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.bold, color: theme.textHeading }}>{t("call.history")}</span>
           </div>

           {/* Card Content */}
           <div className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{
             backgroundColor: theme.surface, borderRadius: theme.radiusXl, boxShadow: SHADOW.xl,
           }}>
             {/* Row 2 — Tab toggle */}
          {/* Row 2 — Tab toggle */}
           <div className="shrink-0 px-5 pt-5 pb-3">
            <div className="flex gap-1" style={{
              borderRadius: theme.radiusFull, backgroundColor: theme.background,
              border: `1px solid ${theme.borderSubtle}`, padding: "4px",
            }}>
              {(["all", "missed", "attended"] as const).map((key) => {
                const active = historyTab === key;
                const count = key === "missed" ? MOCK_MISSED.length : key === "attended" ? MOCK_ATTENDED.length : MOCK_MISSED.length + MOCK_ATTENDED.length;
                return (
                  <button
                    key={key}
                    onClick={() => setHistoryTab(key)}
                    className="flex-1 flex items-center justify-center gap-2 cursor-pointer transition-transform"
                    style={{
                      padding: "9px 12px", borderRadius: theme.radiusFull,
                      backgroundColor: active ? theme.primary : "transparent",
                      boxShadow: active ? SHADOW.sm : "none",
                      border: "none", outline: "none",
                    }}
                  >
                    <span style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.bold, color: active ? "#fff" : theme.textMuted }}>
                      {t(`call.${key}`)}
                    </span>
                    {count > 0 && (
                      <span className="flex items-center justify-center" style={{
                        minWidth: "20px", height: "20px", borderRadius: theme.radiusFull, padding: "0 5px",
                        backgroundColor: active ? "rgba(255,255,255,0.25)" : theme.primarySubtle,
                        fontFamily, fontSize: "14px", fontWeight: WEIGHT.bold,
                        color: active ? "#fff" : theme.primary,
                      }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ height: "1px", backgroundColor: theme.borderSubtle, margin: "0 16px" }} />

          <div className="flex-1 min-h-0 overflow-y-auto callscreen-scroll" style={{ padding: "20px 16px 16px 16px" }}>
            <AnimatePresence mode="wait">
              {historyTab === "all" ? (
                <motion.div key="all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                  {MOCK_MISSED.length === 0 && MOCK_ATTENDED.length === 0 ? (
                    <EmptyState message={t("call.noHistory")} />
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="px-2 pt-1 pb-2" style={{ fontFamily, ...TEXT_STYLE.caption, fontSize: "16px", color: theme.textMuted }}>{t("call.today")}</p>
                      {MOCK_MISSED.map((entry) => (
                        <CallLogRow key={entry.id} entry={entry} onCallback={(e) => {
                          const ext = EXTENSIONS.find((x) => x.id === e.extensionId);
                          if (ext) handleDial(ext);
                        }} />
                      ))}
                      {MOCK_ATTENDED.map((entry) => (
                        <CallLogRow key={entry.id} entry={entry} onCallback={(e) => {
                          const ext = EXTENSIONS.find((x) => x.id === e.extensionId);
                          if (ext) handleDial(ext);
                        }} />
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : historyTab === "missed" ? (
                <motion.div key="missed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                  {MOCK_MISSED.length === 0 ? (
                    <EmptyState message={t("call.noMissed")} />
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="px-2 pt-1 pb-2" style={{ fontFamily, ...TEXT_STYLE.caption, fontSize: "16px", color: theme.textMuted }}>{t("call.today")}</p>
                      {MOCK_MISSED.map((entry) => (
                        <CallLogRow key={entry.id} entry={entry} onCallback={(e) => {
                          const ext = EXTENSIONS.find((x) => x.id === e.extensionId);
                          if (ext) handleDial(ext);
                        }} />
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="attended" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                  {MOCK_ATTENDED.length === 0 ? (
                    <EmptyState message={t("call.noAttended")} />
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="px-2 pt-1 pb-2" style={{ fontFamily, ...TEXT_STYLE.caption, fontSize: "16px", color: theme.textMuted }}>{t("call.today")}</p>
                      {MOCK_ATTENDED.map((entry) => (
                        <CallLogRow key={entry.id} entry={entry} onCallback={(e) => {
                          const ext = EXTENSIONS.find((x) => x.id === e.extensionId);
                          if (ext) handleDial(ext);
                        }} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

        {/* Column 2 — Keypad (center, takes remaining space) */}
        <div className="flex-1 flex flex-col gap-4 min-w-0" style={{ flex: "1 1 0" }}>
          {/* Header Row */}
          <div 
            className="flex items-center gap-3 px-5 py-3.5 shrink-0 shadow-sm"
            style={{ backgroundColor: "#fff", borderRadius: theme.radiusLg, border: "1px solid rgba(0,0,0,0.04)" }}
          >
             <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ backgroundColor: theme.primarySubtle, color: theme.primary, borderRadius: theme.radiusMd }}>
               <Grid3X3 size={16} />
             </div>
             <span style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.bold, color: theme.textHeading }}>{t("call.keypadHint")}</span>
          </div>

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{
            backgroundColor: theme.surface, borderRadius: theme.radiusXl, boxShadow: SHADOW.xl,
            minWidth: 0,
          }}>

          {/* Display */}
          <div className="shrink-0 flex items-center justify-center px-5 pt-[14px] pb-1" style={{ minHeight: "60px" }}>
            <span style={{
              fontFamily: theme.fontFamilyMono, fontSize: "48px", fontWeight: WEIGHT.bold,
              color: dialInput ? theme.primary : theme.textDisabled,
              letterSpacing: "8px", textAlign: "center", minHeight: "56px",
              textShadow: "none",
              transition: "all 0.3s ease",
            }}>
              {dialInput || "—"}
            </span>
          </div>

          {/* Keypad grid */}
          <div dir="ltr" className="flex-1 flex flex-col justify-center items-center px-4 pb-4 gap-3">
            {[["1","2","3"],["4","5","6"],["7","8","9"]].map((row, ri) => (
              <div key={ri} className="flex gap-3 justify-center">
                {row.map((digit) => (
                  <KeypadButton key={digit} digit={digit} onPress={onKeypadPress} />
                ))}
              </div>
            ))}
            {/* Bottom row: empty | 0 | delete */}
            <div className="flex gap-3 justify-center">
              <div style={{ width: "72px", height: "72px" }} />
              <KeypadButton digit="0" onPress={onKeypadPress} />
              <button
                data-no-tick="true"
                onClick={onKeypadDelete}
                className="flex items-center justify-center cursor-pointer transition-transform duration-300 active:scale-90"
                style={{
                  width: "72px", height: "72px", borderRadius: theme.radiusFull,
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  opacity: dialInput ? 1 : 0.3,
                }}
                disabled={!dialInput}
              >
                <Delete size={28} style={{ color: theme.textMuted }} strokeWidth={1.5} />
              </button>
            </div>

            {/* Call button */}
            <div className="flex justify-center pt-4 w-full px-6">
              <button
                onClick={handleDialCustom}
                className="flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform duration-300"
                style={{
                  width: "100%", maxWidth: "280px", height: "60px", borderRadius: theme.radiusFull,
                  backgroundColor: dialInput ? "#22C55E" : theme.borderSubtle,
                  border: "none", outline: "none",
                  opacity: dialInput ? 1 : 0.5,
                  boxShadow: dialInput ? "0 8px 32px rgba(34,197,94,0.4)" : "none",
                }}
                disabled={!dialInput}
              >
                <Phone size={24} color="#fff" />
                <span style={{ fontFamily, ...TEXT_STYLE.buttonSm, fontSize: "18px", color: "#fff" }}>{t("call.title")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

        <div className="flex-1 flex flex-col gap-4 min-w-0" style={{ flex: "1 1 0" }}>
          {/* Header Row */}
          <div 
            className="flex items-center gap-3 px-5 py-3.5 shrink-0 shadow-sm"
            style={{ backgroundColor: "#fff", borderRadius: theme.radiusLg, border: "1px solid rgba(0,0,0,0.04)" }}
          >
             <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ backgroundColor: theme.primarySubtle, color: theme.primary, borderRadius: theme.radiusMd }}>
               <BookUser size={16} />
             </div>
             <span style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.bold, color: theme.textHeading }}>{t("call.hospitalDirectory")}</span>
          </div>

          <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden" style={{
             backgroundColor: theme.surface, borderRadius: theme.radiusXl, boxShadow: SHADOW.xl,
          }}>
          <div className="flex-1 min-h-0 overflow-y-auto callscreen-scroll" style={{ padding: "16px 20px 20px 20px" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
            }}>
              {EXTENSIONS.slice(0, 6).map((ext) => (
                <ExtensionCard key={ext.id} ext={ext} onDial={handleDial} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

      <style>{`
        @keyframes callScreenIn { from { opacity:0; transform:scale(1.02); } to { opacity:1; transform:scale(1); } }
        @keyframes callCardPopIn { from { opacity:0; transform:scale(0.6); } to { opacity:1; transform:scale(1); } }
        .callscreen-scroll::-webkit-scrollbar { width: 4px; }
        .callscreen-scroll::-webkit-scrollbar-track { background: transparent; margin: 4px 0; }
        .callscreen-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 4px; }
        .callscreen-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.08) transparent; }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * SUB-COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════ */

function ExtensionCard({ ext, onDial }: { ext: Extension; onDial: (e: Extension) => void }) {
  const { theme } = useTheme();
  const { t, fontFamily } = useLocale();
  const [pressed, setPressed] = useState(false);
  const ExtIcon = ext.icon;
  
  const isHighlighted = ext.id === "nurse";
  const isFilled = isHighlighted ? !pressed : pressed;

  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={() => onDial(ext)}
      className="flex flex-col items-center justify-center gap-3 cursor-pointer transition-transform"
      style={{
        aspectRatio: "1 / 1",
        padding: "16px 12px",
        borderRadius: theme.radiusXl,
        backgroundColor: isFilled ? theme.primary : theme.background,
        border: `2px solid ${isFilled ? "transparent" : theme.borderSubtle}`,
        outline: "none",
        textAlign: "center",
        transform: pressed ? "scale(0.95)" : "scale(1)",
        boxShadow: pressed ? "none" : (isHighlighted ? `0 4px 16px ${theme.primary}40` : "0 4px 12px rgba(0,0,0,0.05)"),
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Department icon */}
      <div className="flex items-center justify-center" style={{
        width: "44px", height: "44px", borderRadius: theme.radiusLg,
        backgroundColor: isFilled ? "rgba(255,255,255,0.2)" : theme.primaryLight,
        transition: "all 0.2s",
      }}>
        <ExtIcon size={24} color={isFilled ? theme.textInverse : theme.primary} strokeWidth={2} />
      </div>

      {/* Name */}
      <p style={{
        fontFamily, fontSize: "16px", fontWeight: WEIGHT.semibold,
        color: isFilled ? theme.textInverse : theme.textHeading, margin: 0, lineHeight: "1.2",
      }}>
        {t(ext.nameKey)}
      </p>

      {/* Extension number */}
      <span style={{
        fontFamily: theme.fontFamilyMono, fontSize: "15px", fontWeight: WEIGHT.medium,
        color: isFilled ? "rgba(255,255,255,0.8)" : theme.textMuted,
      }}>
        {ext.ext}
      </span>
    </button>
  );
}

function CallLogRow({ entry, onCallback }: { entry: CallLogEntry; onCallback: (entry: CallLogEntry) => void }) {
  const { theme } = useTheme();
  const { t, fontFamily, locale } = useLocale();
  const isMissed = entry.type === "missed";
  const isOutgoing = entry.direction === "outgoing";
  const DANGER = "#D10044";

  /* Locale-aware AM/PM → صباحًا / مساءً */
  const localizedTime = locale === "ar"
    ? entry.time.replace(/\bAM\b/i, "صباحًا").replace(/\bPM\b/i, "مساءً")
    : entry.time;

  // Direction-aware icon like mobile phones
  const DirIcon = isMissed
    ? PhoneMissed
    : isOutgoing
    ? PhoneOutgoing
    : PhoneIncomingIcon;
  const iconColor = isMissed ? DANGER : isOutgoing ? theme.primary : "#22C55E";
  const bgColor = isMissed ? "rgba(209,0,68,0.08)" : isOutgoing ? theme.primarySubtle : "rgba(34,197,94,0.08)";

  return (
    <button
      onClick={() => onCallback(entry)}
      className="flex items-center gap-4 w-full cursor-pointer active:scale-[0.99] transition-transform"
      style={{
        padding: "12px 16px", borderRadius: theme.radiusXl,
        backgroundColor: isMissed ? "rgba(209,0,68,0.03)" : "transparent",
        border: isMissed ? "1px solid rgba(209,0,68,0.06)" : `1px solid ${theme.borderSubtle}`,
        outline: "none", textAlign: "start",
      }}
    >
      <div className="shrink-0 flex items-center justify-center" style={{
        width: "40px", height: "40px", borderRadius: theme.radiusFull,
        backgroundColor: bgColor,
      }}>
        <DirIcon size={20} color={iconColor} strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate" style={{
          fontFamily, fontSize: "17px", fontWeight: WEIGHT.semibold,
          color: isMissed ? DANGER : theme.textHeading, margin: 0,
        }}>
          {t(entry.nameKey)}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span style={{
            fontFamily: theme.fontFamilyMono, fontSize: "15px", fontWeight: WEIGHT.medium, color: theme.textMuted,
          }}>
            {t("call.ext")} {entry.ext}
          </span>
          {entry.duration && (
            <>
              <span style={{ color: theme.borderDefault }}>·</span>
              <span style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.medium, color: theme.textMuted }}>{entry.duration}</span>
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-1">
        <span style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.medium, color: isMissed ? "rgba(209,0,68,0.7)" : theme.textMuted }}>
          {localizedTime}
        </span>
      </div>
    </button>
  );
}

function CallControlButton({ icon: Icon, label, active, onTap, fontFamily }: {
  icon: React.ComponentType<any>; label: string; active: boolean; onTap: () => void; fontFamily: string;
}) {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col items-center gap-2">
      <button onClick={onTap} className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
        style={{
          width: "80px", height: "80px", borderRadius: theme.radiusFull,
          backgroundColor: active ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
          border: active ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.1)",
          outline: "none",
        }}>
        <Icon size={32} color={active ? "#fff" : "rgba(255,255,255,0.7)"} />
      </button>
      <span style={{ fontFamily, fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>{label}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  const { theme } = useTheme();
  const { fontFamily } = useLocale();
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full gap-4 py-16">
      <div className="flex items-center justify-center" style={{
        width: "64px", height: "64px", borderRadius: theme.radiusFull, backgroundColor: theme.primarySubtle,
      }}>
        <Phone size={28} color={theme.textMuted} />
      </div>
      <span style={{ fontFamily, ...TEXT_STYLE.body, fontSize: "18px", color: theme.textMuted }}>{message}</span>
    </div>
  );
}

function KeypadButton({ digit, onPress }: { digit: string; onPress: (digit: string) => void }) {
  const { theme } = useTheme();
  const [pressed, setPressed] = useState(false);
  
  return (
    <button
      data-no-tick="true"
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={() => onPress(digit)}
      className="flex items-center justify-center cursor-pointer transition-transform duration-300"
      style={{
        width: "72px", height: "72px", borderRadius: theme.radiusFull,
        backgroundColor: pressed ? theme.primary : "rgba(0,0,0,0.03)",
        border: "none",
        outline: "none",
        boxShadow: "none",
        transform: pressed ? "scale(0.92)" : "scale(1)",
      }}
    >
      <span style={{
        fontFamily: theme.fontFamilyMono, fontSize: "32px", fontWeight: WEIGHT.medium,
        color: pressed ? "#fff" : theme.textHeading,
        transition: "color 0.2s",
      }}>
        {digit}
      </span>
    </button>
  );
}