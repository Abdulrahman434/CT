import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme, WEIGHT, TYPE_SCALE } from "./ThemeContext";
import { useLocale } from "./i18n";
import islamicBg from "../../assets/5fe21555a4f83b05fa771caa690aaf6f27d2f6ec.png";

/* ═══════════════════════════════════════════════════════════════════════════
 * AZKAR DATA
 * ═══════════════════════════════════════════════════════════════════════════ */

interface Dhikr {
  id: string;
  ar: string;
  en: string;
  target: number;
}

const AZKAR: Dhikr[] = [
  {
    id: "combined",
    ar: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ",
    en: "SubhanAllah, Alhamdulillah, La ilaha illallah, Allahu Akbar",
    target: 100,
  },
  {
    id: "subhanallah",
    ar: "سُبْحَانَ اللَّهِ",
    en: "SubhanAllah (Glory be to Allah)",
    target: 33,
  },
  {
    id: "alhamdulillah",
    ar: "الْحَمْدُ لِلَّهِ",
    en: "Alhamdulillah (Praise be to Allah)",
    target: 33,
  },
  {
    id: "allahuakbar",
    ar: "اللَّهُ أَكْبَرُ",
    en: "Allahu Akbar (Allah is the Greatest)",
    target: 34,
  },
  {
    id: "lailaha",
    ar: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    en: "La ilaha illallah, wahdahu la sharika lah...",
    target: 100,
  },
  {
    id: "istighfar",
    ar: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ",
    en: "Astaghfirullah al-Azeem wa atubu ilayh",
    target: 100,
  },
  {
    id: "salawat",
    ar: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    en: "Allahumma salli wa sallim 'ala nabiyyina Muhammad",
    target: 100,
  },
  {
    id: "hawqala",
    ar: "لَا حَوْلَ وَا لَا قُوَّةَ إِلَّا بِاللَّهِ",
    en: "La hawla wa la quwwata illa billah",
    target: 100,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════ */

interface TasbihScreenSaverProps {
  onClose: () => void;
}

/** Dark/light-themed tasbih screensaver. Exit via long-press (800ms) or swipe (>150px). */
export function TasbihScreenSaver({ onClose }: TasbihScreenSaverProps) {
  const { theme, darkMode } = useTheme();
  const { t, isRTL } = useLocale();
  const [count, setCount] = useState(0);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [selectedDhikrIdx, setSelectedDhikrIdx] = useState(0);
  const [showAzkarPicker, setShowAzkarPicker] = useState(false);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);

  const currentDhikr = AZKAR[selectedDhikrIdx];

  /* ── Palette: dark vs light ── */
  const pal = darkMode
    ? {
        bg: "#0A0A0F",
        surface: "#13131A",
        surfaceElevated: "#1A1A24",
        border: "#252530",
        borderSubtle: "#1E1E28",
        textPrimary: "#E8E8ED",
        textSecondary: "#8888A0",
        textMuted: "#55556A",
        glow: theme.primary,
        glowSubtle: `${theme.primary}18`,
        glowMedium: `${theme.primary}30`,
        glowStrong: `${theme.primary}50`,
        overlayBg: "rgba(0,0,0,0.6)",
        bgImgBrightness: "brightness(0.4)",
        bgImgOpacity: 0.3,
      }
    : {
        bg: "#F0F4F8",
        surface: "rgba(255,255,255,0.88)",
        surfaceElevated: "rgba(255,255,255,0.95)",
        border: "rgba(255,255,255,0.5)",
        borderSubtle: "rgba(255,255,255,0.3)",
        textPrimary: "#1A2B3C",
        textSecondary: "#4A6077",
        textMuted: "#7B93A8",
        glow: theme.primary,
        glowSubtle: `${theme.primary}18`,
        glowMedium: `${theme.primary}30`,
        glowStrong: `${theme.primary}50`,
        overlayBg: "rgba(0,0,0,0.35)",
        bgImgBrightness: "none",
        bgImgOpacity: 1,
      };

  // Increment counter on tap
  const handleTap = (e: React.PointerEvent) => {
    if (showResetConfirm || showAzkarPicker) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCount((prev) => prev + 1);
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 1000);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (showResetConfirm || showAzkarPicker) return;
    touchStart.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    longPressTimer.current = setTimeout(() => onClose(), 800);
  };
  const handlePointerUp = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!touchStart.current) return;
    if (Math.hypot(e.clientX - touchStart.current.x, e.clientY - touchStart.current.y) > 150) onClose();
  };

  const handleReset = () => { setShowResetConfirm(false); setCount(0); };
  const handleSelectDhikr = (idx: number) => {
    if (idx !== selectedDhikrIdx) { setSelectedDhikrIdx(idx); setCount(0); }
    setShowAzkarPicker(false);
  };

  useEffect(() => () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }, []);

  // Milestone
  const getMilestoneText = (c: number) => {
    if (c === currentDhikr.target) return isRTL ? `أكملت ${currentDhikr.target} تسبيحة!` : `Completed ${currentDhikr.target} dhikr!`;
    if (c === 33) return t("tasbih.milestone33");
    if (c === 99) return t("tasbih.milestone99");
    if (c === 100) return t("tasbih.milestone100");
    return null;
  };
  const milestoneText = getMilestoneText(count);
  useEffect(() => {
    if (milestoneText) { setShowMilestone(true); const tm = setTimeout(() => setShowMilestone(false), 3000); return () => clearTimeout(tm); }
    setShowMilestone(false);
  }, [milestoneText]);

  // Progress arc
  const R = 155;
  const C = 2 * Math.PI * R;
  const pct = count > 0 ? Math.min(count / currentDhikr.target, 1) : 0;
  const done = count >= currentDhikr.target;

  const amiriFont = "'Amiri', 'Almarai', serif";

  const scrollbarCSS = `
    .tasbih-azkar-scroll::-webkit-scrollbar { width: 4px; }
    .tasbih-azkar-scroll::-webkit-scrollbar-track { background: transparent; margin: 4px 0; }
    .tasbih-azkar-scroll::-webkit-scrollbar-thumb { background: var(--hbs-primary-subtle); border-radius: 100px; }
    .tasbih-azkar-scroll::-webkit-scrollbar-thumb:active { background: var(--hbs-primary); opacity: 0.35; }
    .tasbih-azkar-scroll { scrollbar-width: thin; scrollbar-color: var(--hbs-primary-subtle) transparent; }
  `;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 z-[200] flex flex-col items-center overflow-hidden select-none"
      style={{ backgroundColor: pal.bg }}
      onClick={handleTap}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      <style>{scrollbarCSS}</style>
      {/* ── Background image ── */}
      <img
        src={islamicBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{
          opacity: pal.bgImgOpacity,
          filter: pal.bgImgBrightness,
        }}
      />

      {/* Radial glow — only in dark mode */}
      {darkMode && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 45%, ${theme.primary}18 0%, transparent 60%)` }}
        />
      )}

      {/* ── Slow-rotating geometric accents ── */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        className="absolute pointer-events-none"
        style={{ top: "8%", right: "6%", opacity: darkMode ? 0.06 : 0.1 }}
      >
        <svg width="240" height="240" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r="100" fill="none" stroke={pal.glow} strokeWidth="0.5" />
          <circle cx="120" cy="120" r="75" fill="none" stroke={pal.glow} strokeWidth="0.5" />
          <circle cx="120" cy="120" r="50" fill="none" stroke={pal.glow} strokeWidth="0.5" />
          {[0, 45, 90, 135].map((d) => (
            <line key={d} x1="120" y1="20" x2="120" y2="220" stroke={pal.glow} strokeWidth="0.5" transform={`rotate(${d} 120 120)`} />
          ))}
        </svg>
      </motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        className="absolute pointer-events-none"
        style={{ bottom: "12%", left: "5%", opacity: darkMode ? 0.05 : 0.08 }}
      >
        <svg width="200" height="200" viewBox="0 0 200 200">
          <polygon points="100,10 190,100 100,190 10,100" fill="none" stroke={pal.glow} strokeWidth="0.5" />
          <polygon points="100,35 165,100 100,165 35,100" fill="none" stroke={pal.glow} strokeWidth="0.5" />
          <polygon points="100,60 140,100 100,140 60,100" fill="none" stroke={pal.glow} strokeWidth="0.5" />
        </svg>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
       * MAIN CENTERED COLUMN: Title → Azkar → Counter → Actions
       * ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex flex-col items-center flex-1 w-full" style={{ maxWidth: "640px", padding: "64px 24px 0 24px" }}>

        {/* ── Title ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 shrink-0"
        >
          <p style={{ fontFamily: theme.fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold, color: "#FFFFFF", margin: 0 }}>
            {isRTL ? "التسبيح الرقمي" : "Digital Tasbih"}
          </p>
        </motion.div>

        {/* ── Azkar Card (always above counter, never overlaps) ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full shrink-0"
          style={{ marginTop: "16px" }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
        >
          <div
            style={{
              borderRadius: "16px",
              backgroundColor: pal.surface,
              border: `1px solid ${pal.glowMedium}`,
              backdropFilter: "blur(16px)",
              overflow: "hidden",
            }}
          >
            {/* Current dhikr button */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowAzkarPicker((v) => !v); }}
              className="w-full flex items-center gap-4 cursor-pointer active:scale-[0.99] transition-transform"
              style={{ padding: "14px 20px", border: "none", background: "transparent", outline: "none", textAlign: "center" }}
            >
              <div className="flex-1 min-w-0">
                <p
                  dir="rtl"
                  style={{
                    fontFamily: amiriFont,
                    fontSize: "26px",
                    fontWeight: 700,
                    color: pal.textPrimary,
                    lineHeight: "42px",
                    margin: 0,
                    textAlign: "center",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {currentDhikr.ar}
                </p>
                {!isRTL && (
                  <p style={{ fontFamily: theme.fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.normal, color: pal.textMuted, margin: "2px 0 0", lineHeight: "18px", textAlign: "center" }}>
                    {currentDhikr.en}
                  </p>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span
                  style={{
                    fontFamily: theme.fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.bold,
                    color: pal.glow, padding: "4px 10px", borderRadius: "8px", backgroundColor: pal.glowSubtle,
                  }}
                >
                  {currentDhikr.target}x
                </span>
                {showAzkarPicker ? <ChevronUp size={20} color={pal.textSecondary} /> : <ChevronDown size={20} color={pal.textSecondary} />}
              </div>
            </button>

            {/* Dropdown picker — pushes content down, no overlap */}
            <AnimatePresence>
              {showAzkarPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div
                    style={{ borderTop: `1px solid ${pal.border}`, borderRight: "none", borderBottom: "none", borderLeft: "none", padding: "8px", maxHeight: "280px", overflowY: "auto" }}
                    className="flex flex-col gap-1 tasbih-azkar-scroll"
                  >
                    {AZKAR.map((dhikr, idx) => {
                      const sel = idx === selectedDhikrIdx;
                      return (
                        <button
                          key={dhikr.id}
                          onClick={(e) => { e.stopPropagation(); handleSelectDhikr(idx); }}
                          className="w-full flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                          style={{
                            padding: "10px 14px", border: "none", borderRadius: "12px",
                            backgroundColor: sel ? pal.glowSubtle : "transparent",
                            outline: "none", textAlign: isRTL ? "right" : "left",
                          }}
                        >
                          <div
                            className="shrink-0 flex items-center justify-center"
                            style={{
                              width: "26px", height: "26px", borderRadius: "50%",
                              border: sel ? `2px solid ${pal.glow}` : `2px solid ${pal.border}`,
                              backgroundColor: sel ? pal.glow : "transparent",
                            }}
                          >
                            {sel && (
                              <svg width="12" height="12" viewBox="0 0 14 14">
                                <path d="M3 7l3 3 5-5" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <p
                            dir="rtl"
                            className="flex-1 min-w-0"
                            style={{
                              fontFamily: amiriFont, fontSize: "17px",
                              fontWeight: sel ? WEIGHT.semibold : WEIGHT.normal,
                              color: sel ? pal.textPrimary : pal.textSecondary,
                              lineHeight: "28px", margin: 0,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}
                          >
                            {dhikr.ar}
                          </p>
                          <span
                            className="shrink-0"
                            style={{
                              fontFamily: theme.fontFamily, fontSize: "12px", fontWeight: WEIGHT.bold,
                              color: sel ? pal.glow : pal.textMuted,
                              padding: "2px 8px", borderRadius: "6px",
                              backgroundColor: sel ? `${pal.glow}15` : `${pal.textMuted}15`,
                            }}
                          >
                            {dhikr.target}x
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Counter Orb (fills remaining space, centered) ── */}
        <div className="flex-1 flex items-center justify-center w-full min-h-0">
          <motion.div className="relative flex items-center justify-center">
            {/* Ambient glow */}
            <div
              className="absolute pointer-events-none"
              style={{ width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle, ${theme.primary}08 0%, transparent 70%)` }}
            />
            {/* Outer decorative ring */}
            <motion.div
              animate={{ rotate: count * 3.6 }}
              transition={{ type: "spring", stiffness: 40, damping: 20 }}
              className="absolute"
              style={{ width: "380px", height: "380px", borderRadius: "50%", border: `1px solid ${pal.borderSubtle}` }}
            >
              {[0, 118.8, 237.6, 356.4].map((deg, i) => (
                <div key={i} className="absolute" style={{
                  width: "3px", height: "10px", backgroundColor: pal.glowMedium, borderRadius: "2px",
                  top: "-5px", left: "50%", transform: `translateX(-50%) rotate(${deg}deg)`, transformOrigin: "50% 190px",
                }} />
              ))}
            </motion.div>
            {/* Progress arc */}
            <svg className="absolute pointer-events-none" width="340" height="340" viewBox="0 0 340 340" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="170" cy="170" r={R} fill="none" stroke={pal.border} strokeWidth="3" />
              {count > 0 && (
                <motion.circle
                  cx="170" cy="170" r={R} fill="none"
                  stroke={pal.glow} strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={C}
                  initial={{ strokeDashoffset: C }}
                  animate={{ strokeDashoffset: C * (1 - pct) }}
                  transition={{ type: "spring", stiffness: 60, damping: 20 }}
                  style={{ filter: `drop-shadow(0 0 6px ${pal.glowStrong})` }}
                />
              )}
            </svg>
            {/* Inner counter */}
            <motion.div
              whileTap={{ scale: 0.96 }}
              animate={{
                scale: count === 0 ? [1, 1.04, 1] : 1,
              }}
              transition={count === 0 ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
              className="relative flex flex-col items-center justify-center"
              style={{
                width: "260px", height: "260px", borderRadius: "50%",
                backgroundColor: pal.surface, border: `1px solid ${pal.border}`,
                backdropFilter: "blur(12px)",
                boxShadow: darkMode
                  ? `0 0 40px ${theme.primary}08, inset 0 1px 0 ${pal.surfaceElevated}, inset 0 -1px 0 ${pal.bg}`
                  : `0 8px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)`,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={count}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col items-center"
                >
                  <span style={{
                    fontFamily: theme.fontFamily, fontSize: "88px", fontWeight: WEIGHT.bold,
                    color: pal.textPrimary, lineHeight: 1,
                    filter: count > 0 ? `drop-shadow(0 0 20px ${theme.primary}30)` : "none",
                  }}>
                    {count}
                  </span>
                </motion.div>
              </AnimatePresence>
              <p style={{
                fontFamily: theme.fontFamily, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.medium,
                color: pal.textMuted, margin: 0, marginTop: "4px", letterSpacing: "1px",
              }}>
                / {currentDhikr.target}
              </p>
            </motion.div>
            {/* Ripples */}
            <AnimatePresence>
              {ripples.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="absolute pointer-events-none"
                  style={{
                    left: r.x, top: r.y, width: "80px", height: "80px", borderRadius: "50%",
                    border: `2px solid ${pal.glow}`, transform: "translate(-50%, -50%)",
                    filter: `drop-shadow(0 0 4px ${pal.glowMedium})`,
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ── Milestone ── */}
        <AnimatePresence>
          {showMilestone && milestoneText && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="shrink-0 flex items-center gap-3 px-8 py-4 mb-4"
              style={{
                backgroundColor: pal.surfaceElevated, borderRadius: theme.radiusLg,
                border: `1px solid ${pal.glowMedium}`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${theme.primary}15`,
                backdropFilter: "blur(12px)",
              }}
            >
              <span style={{ fontFamily: theme.fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold, color: pal.glow }}>
                {milestoneText}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom: Reset + Hint ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="shrink-0 flex flex-col items-center gap-4"
          style={{ paddingBottom: "48px" }}
        >
          <AnimatePresence>
            {count > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => { e.stopPropagation(); setShowResetConfirm(true); }}
                className="flex items-center gap-2 cursor-pointer active:scale-[0.96] transition-transform"
                style={{
                  height: "56px", paddingLeft: "28px", paddingRight: "28px",
                  backgroundColor: "#FFFFFF", borderRadius: theme.radiusLg,
                  border: "none", fontFamily: theme.fontFamily, fontSize: TYPE_SCALE.lg,
                  fontWeight: WEIGHT.semibold, color: theme.primary, outline: "none",
                  boxShadow: `0 4px 16px rgba(0,0,0,0.15)`,
                }}
              >
                <RotateCcw size={22} strokeWidth={2} color={theme.primary} />
                {t("tasbih.reset")}
              </motion.button>
            )}
          </AnimatePresence>
          <p style={{
            fontFamily: theme.fontFamily, fontSize: "24px", fontWeight: WEIGHT.medium,
            color: "rgba(255,255,255,0.7)", margin: 0, textAlign: "center",
          }}>
            {t("tasbih.exitHint")}
          </p>
        </motion.div>
      </div>

      {/* ── Reset confirmation dialog ── */}
      <AnimatePresence>
        {showResetConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-10"
              style={{ backgroundColor: pal.overlayBg }}
              onClick={(e) => { e.stopPropagation(); setShowResetConfirm(false); }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute z-20 flex flex-col"
              style={{
                width: "420px", backgroundColor: pal.surface, borderRadius: theme.radiusXl,
                padding: "28px", backdropFilter: "blur(16px)",
                boxShadow: `0 24px 64px rgba(0,0,0,0.4), 0 0 1px ${pal.border}`,
                border: `1px solid ${pal.border}`,
                top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontFamily: theme.fontFamily, fontSize: TYPE_SCALE.xl, fontWeight: WEIGHT.bold, color: pal.textPrimary, margin: 0, marginBottom: "8px" }}>
                {t("tasbih.resetConfirmTitle")}
              </h3>
              <p style={{ fontFamily: theme.fontFamily, fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.normal, color: pal.textSecondary, margin: 0, marginBottom: "24px" }}>
                {t("tasbih.resetConfirmBody")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowResetConfirm(false); }}
                  className="flex-1 flex items-center justify-center cursor-pointer active:scale-[0.96] transition-transform"
                  style={{
                    height: "52px", borderRadius: theme.radiusLg,
                    border: `1px solid ${pal.border}`, backgroundColor: pal.surfaceElevated,
                    fontFamily: theme.fontFamily, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.semibold,
                    color: pal.textSecondary, outline: "none",
                  }}
                >
                  {t("general.cancel")}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReset(); }}
                  className="flex-1 flex items-center justify-center cursor-pointer active:scale-[0.96] transition-transform"
                  style={{
                    height: "52px", borderRadius: theme.radiusLg, border: "none",
                    backgroundColor: theme.primary, fontFamily: theme.fontFamily,
                    fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.semibold, color: "#FFFFFF",
                    outline: "none", boxShadow: `0 4px 20px ${pal.glowStrong}`,
                  }}
                >
                  {t("tasbih.resetConfirm")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}