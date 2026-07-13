import { CSSProperties, useEffect, useRef, useState, type TouchEvent as ReactTouchEvent } from "react";
import { TopBar } from "./TopBar";
import { NewsTicker } from "./NewsTicker";
import { useTheme } from "./ThemeContext";
import { useLocale } from "./i18n";
import { useNurseStore } from "./NurseDataStore";

/**
 * Layout 3 — Kids Mode ("Magical Adventure Dashboard").
 *
 * A playful, child-friendly bedside experience for pediatric patients (3–12).
 * Like Layout 1 / Layout 2 it inherits the active hospital's brand colour and
 * logo automatically (via useTheme + TopBar).
 *
 * Theming rule (critical): every accent colour on this screen — the four grid
 * pastels, the sidebar tiles, the progress bar, the badges and the bottom
 * actions — is generated programmatically from the single active brand colour
 * (`theme.primary`) by hue-rotating + lightening it (see `swatch()` below).
 * Nothing is hardcoded pink/purple/amber/green, so switching hospital config
 * re-themes this layout exactly like Layout 1 and Layout 2.
 *
 * All clinical data (patient, nurse, vitals) is read live from the same stores
 * the clinical layouts use — only the presentation changes. Clinical details
 * (MRN, room) are intentionally hidden here, and no medical jargon is shown.
 */

/* External quick-access link (shared with the standard ShortcutsColumn). */
const QURAN_URL = "https://app.quranflash.com/book/Medina1?ar#/reader/chapter/3";
const PODCAST_URL = "https://www.youtube.com/watch?v=1WKyerFH34U&list=PL_JVZV-KlG7oFe-fUAMnbYsWyTU9k8ljF";

/* ── Colour helpers — derive the whole kids palette from the brand colour ── */
function hexToHsl(hex: string): [number, number, number] {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hue = (b - r) / d + 2; break;
      default: hue = (r - g) / d + 4; break;
    }
    hue /= 6;
  }
  return [hue * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* A pastel "swatch" — fill / border / glow / ink — all rooted at one hue. */
interface Swatch { bg: string; border: string; glow: string; ink: string }

interface KidsHomescreenProps {
  onOpenCategory: (categoryKey: string) => void;
  onLaunchTool: (toolId: string) => void;
  onShowCareMeExpanded: () => void;
  onOpenSettings: () => void;
  onOpenNotifications?: () => void;
  onOpenSurvey?: () => void;
  unreadCount?: number;
}

/* Decorative twinkling stars — fixed positions so they don't jump on re-render.
   Purely cosmetic; the container is pointer-events:none. */
const STARS: { char: string; top: string; left: string; size: number; delay: string }[] = [
  { char: "✦", top: "12%", left: "20%", size: 22, delay: "0s" },
  { char: "✧", top: "18%", left: "63%", size: 18, delay: "0.6s" },
  { char: "✦", top: "44%", left: "47%", size: 16, delay: "1.1s" },
  { char: "✧", top: "62%", left: "30%", size: 20, delay: "0.3s" },
  { char: "✦", top: "73%", left: "70%", size: 18, delay: "0.9s" },
  { char: "✧", top: "86%", left: "44%", size: 16, delay: "1.4s" },
  { char: "✦", top: "28%", left: "84%", size: 15, delay: "0.5s" },
  { char: "✧", top: "52%", left: "11%", size: 18, delay: "1.2s" },
  { char: "✦", top: "8%", left: "50%", size: 15, delay: "1.6s" },
  { char: "✧", top: "90%", left: "14%", size: 20, delay: "0.2s" },
];

/* Soft translucent background blobs (hue offset from brand). */
const BLOBS: { top: string; left: string; size: number; shift: number }[] = [
  { top: "-5%", left: "-3%", size: 300, shift: 24 },
  { top: "58%", left: "-6%", size: 240, shift: 150 },
  { top: "-7%", left: "80%", size: 320, shift: 210 },
  { top: "64%", left: "84%", size: 260, shift: 300 },
];

/* Dotted-grid clusters — faint atmospheric texture. */
const DOTS: { top: string; left: string; size: number }[] = [
  { top: "22%", left: "8%", size: 110 },
  { top: "70%", left: "55%", size: 130 },
  { top: "14%", left: "74%", size: 100 },
];

export default function KidsHomescreen({
  onOpenCategory,
  onLaunchTool,
  onShowCareMeExpanded,
  onOpenSettings,
  onOpenNotifications,
  onOpenSurvey,
  unreadCount,
}: KidsHomescreenProps) {
  const { theme } = useTheme();
  const { t, isRTL, fontFamily: localeFont } = useLocale();
  const nurseStore = useNurseStore();
  const [moreOpen, setMoreOpen] = useState(false);
  const [mood, setMood] = useState<string | null>(null);
  const [moodToast, setMoodToast] = useState<string | null>(null);
  const [thanked, setThanked] = useState(false);
  const [slide, setSlide] = useState(0);
  const moodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);

  /* Rounded, friendly fonts. Fall back to the Arabic/Urdu brand font for RTL. */
  const bodyFont = isRTL ? `'Nunito', ${localeFont}` : "'Nunito', sans-serif";
  const headFont = isRTL ? `'Baloo 2', ${localeFont}` : "'Baloo 2', 'Nunito', sans-serif";

  /* ── Whole palette derived from the active hospital brand colour ── */
  const [bh, bs] = hexToHsl(theme.primary);

  const swatch = (hueShift: number): Swatch => {
    const h = bh + hueShift;
    return {
      bg: hslToHex(h, clamp(bs * 0.55, 42, 64), 93),
      border: hslToHex(h, clamp(bs * 0.7, 46, 72), 80),
      glow: hslToHex(h, clamp(bs * 0.85, 52, 80), 86),
      ink: hslToHex(h, clamp(bs, 56, 80), 33),
    };
  };

  /* Four well-separated hues — read as rose / lavender / amber / mint relative
     to the brand, and rotate with it when the hospital changes. */
  const tints = [-24, 34, 96, 158].map(swatch);
  const [tRose, tLav, tAmber, tMint] = tints;

  const pageBg = hslToHex(bh, clamp(bs * 0.55, 30, 55), 95);
  const pageBg2 = hslToHex(bh + 22, clamp(bs * 0.55, 30, 55), 91);
  const brandInk = hslToHex(bh, clamp(bs, 55, 78), 30);
  const dotColor = hslToHex(bh, 28, 62);

  /* ── Live clinical data (presentation-only transform) ── */
  const p = nurseStore.patient;
  const displayName = isRTL && p.nameAr ? p.nameAr : (p.nameKey ? t(p.nameKey) : p.name);
  const firstName = (displayName || "").trim().split(/\s+/)[0] || displayName;

  const nurse = nurseStore.careTeam.find((m) => m.visible && m.roleKey === "care.team.primaryNurse")
    || nurseStore.careTeam.find((m) => m.visible);
  const nurseName = nurse ? t(nurse.nameKey) : "";

  const latestObs = nurseStore.observations[nurseStore.observations.length - 1];
  const heartRate = latestObs?.vitals.hr || "—";
  const temperature = latestObs?.vitals.temp || "—";

  /* Time-of-day greeting + mascot expression */
  const hour = new Date().getHours();
  const isMorning = hour >= 5 && hour < 12;
  const isAfternoon = hour >= 12 && hour < 17;
  const greetingKey = isMorning ? "kids.greeting.morning" : isAfternoon ? "kids.greeting.afternoon" : "kids.greeting.evening";
  const greetingEmoji = isMorning ? "☀️" : isAfternoon ? "🌤️" : "🌙";
  const mascotMood = isMorning ? "🐨" : isAfternoon ? "🐨" : hour >= 21 || hour < 5 ? "😴" : "🐨";

  /* ── Daily mood picker ── */
  const MOODS: { key: string; emoji: string; label: string }[] = [
    { key: "happy", emoji: "😊", label: "kids.mood.happy" },
    { key: "okay", emoji: "😐", label: "kids.mood.okay" },
    { key: "sad", emoji: "😢", label: "kids.mood.sad" },
  ];

  /* Tap a mood → keep it selected and show a brief popup. Happy/Okay auto-
     dismiss after ~3s; Sad stays until dismissed (may need a caregiver). */
  const selectMood = (key: string) => {
    setMood(key);
    setMoodToast(key);
    if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
    if (key !== "sad") {
      moodTimerRef.current = setTimeout(() => setMoodToast(null), 3000);
    }
  };

  useEffect(() => () => {
    if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
  }, []);

  /* Per-mood popup content + brand-derived accent tint. */
  const moodToastCfg: Record<string, { tint: Swatch; message: string; sparkle?: boolean; action?: boolean }> = {
    happy: { tint: tAmber, message: t("kids.mood.toast.happy", firstName), sparkle: true },
    okay: { tint: tLav, message: t("kids.mood.toast.okay") },
    sad: { tint: tRose, message: t("kids.mood.toast.sad"), action: true },
  };

  /* ── Motivational carousel (auto-rotating encouragement cards) ── */
  const MOTIVATION: { emoji: string; msg: string; tint: Swatch }[] = [
    { emoji: "🌈", msg: t("kids.motiv.steps"), tint: tMint },
    { emoji: "💗", msg: t("kids.motiv.strong"), tint: tRose },
    { emoji: "🏔️", msg: t("kids.motiv.grow"), tint: tLav },
    { emoji: "🌟", msg: t("kids.motiv.better"), tint: tAmber },
  ];
  const slideCount = MOTIVATION.length;
  const goSlide = (i: number) => setSlide(((i % slideCount) + slideCount) % slideCount);
  const nextSlide = () => goSlide(slide + 1);
  const prevSlide = () => goSlide(slide - 1);

  /* Auto-advance every 4.5s; any manual change resets the timer (dep on slide). */
  useEffect(() => {
    const id = setTimeout(() => setSlide((s) => (s + 1) % slideCount), 4500);
    return () => clearTimeout(id);
  }, [slide, slideCount]);

  const onCarouselTouchStart = (e: ReactTouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onCarouselTouchEnd = (e: ReactTouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 30) return;
    const forward = isRTL ? dx > 0 : dx < 0;
    forward ? nextSlide() : prevSlide();
  };

  /* ── Main 2×2 grid (exactly four large activity cards) ── */
  const grid: { key: string; emoji: string; label: string; sub: string; s: Swatch; onClick: () => void }[] = [
    { key: "Media", emoji: "📺", label: "kids.tile.media", sub: "kids.media.sub", s: tRose, onClick: () => onOpenCategory("Media") },
    { key: "Games", emoji: "🎮", label: "kids.tile.games", sub: "kids.games.sub", s: tLav, onClick: () => onOpenCategory("Games") },
    { key: "Reading", emoji: "📚", label: "kids.tile.reading", sub: "kids.reading.sub", s: tAmber, onClick: () => onOpenCategory("Reading") },
    { key: "Draw", emoji: "🎨", label: "kids.tile.draw", sub: "kids.draw.sub", s: tMint, onClick: () => onLaunchTool("whiteboard") },
  ];

  /* ── Right sidebar — exactly four quick-access tiles (same colour language) ── */
  const sideItems: { emoji: string; label: string; s: Swatch; onClick: () => void }[] = [
    { emoji: "📖", label: "kids.side.quran", s: tMint, onClick: () => window.open(QURAN_URL, "_blank", "noopener,noreferrer") },
    { emoji: "💬", label: "kids.tile.social", s: tLav, onClick: () => onOpenCategory("Social") },
    { emoji: "👩‍⚕️", label: "kids.tile.consultation", s: tRose, onClick: () => onOpenCategory("Consultation") },
    { emoji: "🔔", label: "kids.tile.housekeeping", s: tAmber, onClick: () => onOpenCategory("Housekeeping") },
  ];

  /* ── Bottom bar — two large finger-friendly actions ── */
  const bottomActions: { emoji: string; label: string; s: Swatch; onClick: () => void }[] = [
    { emoji: "📞", label: "kids.action.callNurse", s: tRose, onClick: () => onOpenCategory("Call") },
    { emoji: "⭐", label: "kids.action.needSomething", s: tAmber, onClick: () => onOpenCategory("Housekeeping") },
  ];

  /* ── "Explore More" drawer — every remaining module not on the main screen ── */
  const moreItems: { key: string; emoji: string; label: string; onClick: () => void }[] = [
    { key: "Meeting", emoji: "📹", label: "kids.tile.meeting", onClick: () => onOpenCategory("Meeting") },
    { key: "Internet", emoji: "🌐", label: "kids.tile.internet", onClick: () => onOpenCategory("Internet") },
    { key: "Tools", emoji: "🧰", label: "kids.tile.tools", onClick: () => onOpenCategory("Tools") },
    { key: "Education", emoji: "🔬", label: "kids.tile.education", onClick: () => onOpenCategory("Education") },
    { key: "Consultation", emoji: "👩‍⚕️", label: "kids.tile.consultation", onClick: () => onOpenCategory("Consultation") },
    { key: "Housekeeping", emoji: "🛏️", label: "kids.tile.housekeeping", onClick: () => onOpenCategory("Housekeeping") },
    { key: "Order Food", emoji: "🍕", label: "kids.tile.food", onClick: () => onOpenCategory("Order Food") },
    { key: "Call", emoji: "📞", label: "kids.tile.call", onClick: () => onOpenCategory("Call") },
    { key: "Feedback", emoji: "💬", label: "kids.tile.feedback", onClick: () => onOpenSurvey?.() },
    { key: "roomcontrol", emoji: "🕹️", label: "kids.tile.roomcontrol", onClick: () => onLaunchTool("roomcontrol") },
    { key: "podcast", emoji: "🎙️", label: "kids.side.podcast", onClick: () => window.open(PODCAST_URL, "_blank", "noopener,noreferrer") },
  ];

  const runMore = (fn: () => void) => {
    setMoreOpen(false);
    fn();
  };

  return (
    <div
      className="size-full flex flex-col relative overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${pageBg} 0%, ${pageBg2} 100%)`,
        fontFamily: bodyFont,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes kidsFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes kidsBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes kidsHeart { 0%,100% { transform: scale(1); } 15% { transform: scale(1.25); } 30% { transform: scale(1); } 45% { transform: scale(1.18); } 60% { transform: scale(1); } }
        @keyframes kidsTwinkle { 0%,100% { opacity: 0.55; transform: scale(1) rotate(0deg); } 50% { opacity: 0.12; transform: scale(1.3) rotate(18deg); } }
        @keyframes kidsBlob { 0%,100% { transform: scale(1); } 50% { transform: scale(1.12); } }
        @keyframes kidsWave { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(18deg); } 75% { transform: rotate(-12deg); } }
        @keyframes kidsSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes kidsToastIn { from { transform: translateY(-18px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes kidsFade { from { opacity: 0.25; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes kidsSparkle { 0%,100% { opacity: 0; transform: scale(0.6) rotate(0deg); } 50% { opacity: 1; transform: scale(1.2) rotate(20deg); } }
        .kids-tile { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .kids-tile:hover { transform: translateY(-6px) scale(1.03); }
        .kids-tile:active { transform: scale(0.96); }
      `}</style>

      {/* ── Atmospheric background decoration (all pointer-events:none, low opacity) ── */}
      <div className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden" aria-hidden="true">
        {/* Soft blobs */}
        {BLOBS.map((b, i) => (
          <div
            key={`blob-${i}`}
            style={{
              position: "absolute",
              top: b.top,
              left: b.left,
              width: b.size,
              height: b.size,
              borderRadius: 9999,
              background: `radial-gradient(circle at 35% 35%, ${swatch(b.shift).glow}, transparent 70%)`,
              opacity: 0.4,
              animation: `kidsBlob ${6 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
        {/* Dotted-grid clusters */}
        {DOTS.map((d, i) => (
          <div
            key={`dots-${i}`}
            style={{
              position: "absolute",
              top: d.top,
              left: d.left,
              width: d.size,
              height: d.size,
              opacity: 0.13,
              backgroundImage: `radial-gradient(${dotColor} 2px, transparent 2px)`,
              backgroundSize: "18px 18px",
            }}
          />
        ))}
        {/* Delicate leaf / floral line-art sketches */}
        {[
          { top: "30%", left: "4%", rot: -18 },
          { top: "78%", left: "40%", rot: 12 },
          { top: "10%", left: "88%", rot: 24 },
        ].map((lf, i) => (
          <svg
            key={`leaf-${i}`}
            viewBox="0 0 64 64"
            width={84}
            height={84}
            style={{ position: "absolute", top: lf.top, left: lf.left, opacity: 0.12, transform: `rotate(${lf.rot}deg)` }}
          >
            <path d="M32 4 C12 22 12 46 32 60 C52 46 52 22 32 4 Z" fill="none" stroke={brandInk} strokeWidth={1.5} />
            <path d="M32 12 L32 56" fill="none" stroke={brandInk} strokeWidth={1.2} />
            <path d="M32 26 L20 20 M32 26 L44 20 M32 38 L21 33 M32 38 L43 33" fill="none" stroke={brandInk} strokeWidth={1.2} />
          </svg>
        ))}
        {/* Twinkling stars */}
        {STARS.map((s, i) => (
          <span
            key={`star-${i}`}
            style={{
              position: "absolute",
              top: s.top,
              left: s.left,
              fontSize: s.size,
              color: brandInk,
              animation: "kidsTwinkle 3.4s ease-in-out infinite",
              animationDelay: s.delay,
            }}
          >
            {s.char}
          </span>
        ))}
      </div>

      {/* Header — hospital logo, prayer times, greeting. Settings gear shown
          top-right (same as Layout 1 / Layout 2); prayer times are not clickable. */}
      <div className="relative z-20 shrink-0">
        <TopBar
          onSettingsTap={onOpenSettings}
          onBellTap={onOpenNotifications}
          unreadCount={unreadCount}
        />
      </div>
      {/* News ticker — kept informational, only softened to the kids theme. */}
      <div className="relative z-10 shrink-0">
        <NewsTicker />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col gap-4 px-6 pt-4 pb-4">
        {/* Body row */}
        <div className={`flex-1 min-h-0 flex gap-5 ${isRTL ? "flex-row-reverse" : ""}`}>
          {/* ── Left sidebar — Character & Progress card ── */}
          <div className="shrink-0 min-h-0" style={{ width: 340 }}>
            <div
              className="h-full flex flex-col items-stretch gap-3 px-5 py-5 overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.72)",
                borderRadius: 28,
                border: `3px solid ${theme.primary}`,
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                backdropFilter: "blur(2px)",
              }}
            >
              {/* Mascot avatar */}
              <div className="shrink-0 flex flex-col items-center gap-1.5">
                <div
                  className="flex items-center justify-center relative"
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 9999,
                    background: `radial-gradient(circle at 50% 35%, ${tMint.glow}, ${tLav.bg})`,
                    border: `4px solid ${theme.primary}`,
                    fontSize: 52,
                    animation: "kidsFloat 3.4s ease-in-out infinite",
                  }}
                >
                  {mascotMood}
                  <span
                    style={{ position: "absolute", bottom: -4, right: -2, fontSize: 26, transformOrigin: "70% 70%", animation: "kidsWave 1.6s ease-in-out infinite" }}
                  >
                    👋
                  </span>
                </div>
                {/* Time-of-day greeting — same emoji + logic as the header */}
                <p style={{ fontFamily: headFont, fontSize: 15, fontWeight: 700, color: theme.primary, textAlign: "center", lineHeight: 1.2 }}>
                  {greetingEmoji} {t(greetingKey)},
                </p>
                <p style={{ fontFamily: headFont, fontSize: 30, fontWeight: 800, color: brandInk, textAlign: "center", lineHeight: 1.1 }}>
                  {t("kids.name", firstName)}
                </p>
                <p style={{ fontSize: 13, fontWeight: 700, color: theme.primary, textAlign: "center", lineHeight: 1.3 }}>
                  {t("kids.happyHere")}
                </p>
              </div>

              {/* Daily Mood card */}
              <div
                className="shrink-0 flex flex-col gap-2 px-3.5 py-3"
                style={{ background: tRose.bg, borderRadius: 20, border: `2.5px solid ${tRose.border}` }}
              >
                <p style={{ fontFamily: headFont, fontSize: 15, fontWeight: 800, color: tRose.ink }}>
                  😊 {t("kids.mood.title")}
                </p>
                <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  {MOODS.map((m) => {
                    const active = mood === m.key;
                    return (
                      <button
                        key={m.key}
                        onClick={() => selectMood(m.key)}
                        className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-transform"
                        style={{
                          padding: "9px 4px",
                          background: "#ffffff",
                          borderRadius: 16,
                          border: `2.5px solid ${active ? tRose.ink : tRose.border}`,
                          transform: active ? "scale(1.07)" : "scale(1)",
                          boxShadow: active ? `0 5px 14px ${tRose.border}66` : "none",
                          outline: "none",
                        }}
                      >
                        <span style={{ fontSize: 28, lineHeight: 1 }}>{m.emoji}</span>
                        <span style={{ fontSize: 11.5, fontWeight: 800, color: tRose.ink }}>{t(m.label)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nurse mini-card */}
              <div
                className="shrink-0 flex flex-col gap-2 px-3.5 py-2.5"
                style={{ background: tMint.bg, borderRadius: 20, border: `2.5px solid ${tMint.border}` }}
              >
                <button
                  onClick={onShowCareMeExpanded}
                  className={`flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform ${isRTL ? "flex-row-reverse text-right" : ""}`}
                  style={{ background: "transparent", border: "none", outline: "none", padding: 0 }}
                >
                  {/* Simple illustrated nurse icon (not a photo) */}
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{ width: 44, height: 44, borderRadius: 9999, backgroundColor: "#fff", border: `3px solid ${tMint.border}`, fontSize: 24 }}
                  >
                    👩‍⚕️
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <p style={{ fontSize: 11.5, fontWeight: 700, color: tMint.ink, opacity: 0.85 }}>{t("kids.yourNurse")}</p>
                    <p style={{ fontFamily: headFont, fontSize: 16, fontWeight: 800, color: tMint.ink, lineHeight: 1.1 }}>{nurseName}</p>
                  </div>
                </button>

                {/* "Send a thank you" pill — soft white button inside the card */}
                <button
                  onClick={() => setThanked(true)}
                  className="flex items-center justify-center cursor-pointer active:scale-[0.97] transition-transform"
                  style={{
                    height: 34,
                    padding: "0 14px",
                    background: "#ffffff",
                    borderRadius: 9999,
                    border: `2px solid ${thanked ? tMint.ink : tMint.border}`,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
                    fontSize: 12.5,
                    fontWeight: 800,
                    color: tMint.ink,
                    outline: "none",
                  }}
                >
                  {thanked ? t("kids.nurse.thanked") : t("kids.nurse.thankYou")}
                </button>
              </div>

              {/* Motivational carousel — fills the space between nurse + vitals */}
              <div className="flex-1 min-h-0 flex flex-col gap-2">
                <div
                  className="relative flex-1 min-h-0"
                  onTouchStart={onCarouselTouchStart}
                  onTouchEnd={onCarouselTouchEnd}
                >
                  {(() => {
                    const card = MOTIVATION[slide];
                    return (
                      <div
                        key={slide}
                        className="h-full flex flex-col items-center justify-center text-center gap-2 px-7"
                        style={{
                          background: card.tint.bg,
                          borderRadius: 16,
                          border: `2px solid ${card.tint.border}`,
                          animation: "kidsFade 0.45s ease",
                        }}
                      >
                        <span style={{ fontSize: 38, lineHeight: 1, animation: "kidsFloat 3.6s ease-in-out infinite" }}>{card.emoji}</span>
                        <p style={{ fontFamily: headFont, fontSize: 15, fontWeight: 800, color: card.tint.ink, lineHeight: 1.3 }}>{card.msg}</p>
                      </div>
                    );
                  })()}

                  {/* Prev / Next arrows (positioned by reading direction) */}
                  <button
                    onClick={prevSlide}
                    aria-label="Previous"
                    className="absolute top-1/2 flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                    style={{ [isRTL ? "right" : "left"]: 4, transform: "translateY(-50%)", width: 26, height: 26, borderRadius: 9999, background: "rgba(255,255,255,0.82)", border: `2px solid ${MOTIVATION[slide].tint.border}`, fontSize: 16, fontWeight: 900, color: MOTIVATION[slide].tint.ink, outline: "none" } as CSSProperties}
                  >
                    {isRTL ? "›" : "‹"}
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Next"
                    className="absolute top-1/2 flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                    style={{ [isRTL ? "left" : "right"]: 4, transform: "translateY(-50%)", width: 26, height: 26, borderRadius: 9999, background: "rgba(255,255,255,0.82)", border: `2px solid ${MOTIVATION[slide].tint.border}`, fontSize: 16, fontWeight: 900, color: MOTIVATION[slide].tint.ink, outline: "none" } as CSSProperties}
                  >
                    {isRTL ? "‹" : "›"}
                  </button>
                </div>

                {/* Dot-indicator pagination */}
                <div className={`shrink-0 flex items-center justify-center gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                  {MOTIVATION.map((m, i) => {
                    const active = i === slide;
                    return (
                      <button
                        key={i}
                        onClick={() => goSlide(i)}
                        aria-label={`Slide ${i + 1}`}
                        className="cursor-pointer transition-all"
                        style={{
                          width: active ? 18 : 7,
                          height: 7,
                          borderRadius: 9999,
                          background: active ? theme.primary : `${theme.primary}33`,
                          border: "none",
                          outline: "none",
                          padding: 0,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Two friendly vital pills — no clinical labels */}
              <div className="shrink-0 flex gap-3">
                <div
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5"
                  style={{ borderRadius: 18, background: tAmber.bg, border: `2.5px solid ${tAmber.border}` }}
                >
                  <span style={{ fontSize: 26, animation: "kidsFloat 4s ease-in-out infinite" }}>🌡️</span>
                  <span style={{ fontFamily: headFont, fontSize: 22, fontWeight: 800, color: tAmber.ink }}>{temperature}°</span>
                </div>
                <div
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5"
                  style={{ borderRadius: 18, background: tRose.bg, border: `2.5px solid ${tRose.border}` }}
                >
                  <span style={{ fontSize: 26, animation: "kidsHeart 1.4s ease-in-out infinite" }}>💓</span>
                  <span style={{ fontFamily: headFont, fontSize: 22, fontWeight: 800, color: tRose.ink }}>{heartRate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Center — 2×2 activity grid + Explore More pill ── */}
          <div className="relative flex-1 min-w-0 flex flex-col items-center justify-center gap-6">
            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: "repeat(2, minmax(0, 340px))", gridAutoRows: "minmax(0, 248px)" }}
            >
              {grid.map((card, ci) => (
                <button
                  key={card.key}
                  onClick={card.onClick}
                  className="kids-tile relative overflow-hidden flex flex-col items-center justify-center gap-2 cursor-pointer"
                  style={{
                    width: 340,
                    height: 248,
                    backgroundColor: card.s.bg,
                    borderRadius: 28,
                    border: `3px solid ${card.s.border}`,
                    boxShadow: `0 14px 34px ${card.s.border}55`,
                    outline: "none",
                  } as CSSProperties}
                >
                  {/* Radial glow behind the icon */}
                  <span
                    className="pointer-events-none"
                    style={{
                      position: "absolute",
                      top: 38,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 150,
                      height: 150,
                      borderRadius: 9999,
                      background: `radial-gradient(circle, ${card.s.glow}, transparent 70%)`,
                      animation: "kidsBlob 5.5s ease-in-out infinite",
                      animationDelay: `${ci * 0.4}s`,
                    }}
                    aria-hidden="true"
                  />
                  <span style={{ position: "relative", fontSize: 78, lineHeight: 1, animation: "kidsBounce 2.4s ease-in-out infinite", animationDelay: `${ci * 0.35}s` }}>
                    {card.emoji}
                  </span>
                  <span style={{ position: "relative", fontFamily: headFont, fontSize: 28, fontWeight: 800, color: card.s.ink }}>
                    {t(card.label)}
                  </span>
                  <span style={{ position: "relative", fontSize: 14, fontWeight: 700, color: card.s.ink, opacity: 0.78 }}>
                    {t(card.sub)}
                  </span>
                </button>
              ))}
            </div>

            {/* "✨ Explore More ➜" — white pill, accent-coloured text + arrow */}
            <button
              onClick={() => setMoreOpen(true)}
              className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
              style={{
                height: 58,
                padding: "0 30px",
                backgroundColor: "#ffffff",
                borderRadius: 9999,
                boxShadow: "0 8px 22px rgba(0,0,0,0.14)",
                outline: "none",
              } as CSSProperties}
            >
              <span style={{ fontSize: 20 }}>✨</span>
              <span style={{ fontFamily: headFont, fontSize: 20, fontWeight: 800, color: theme.primary }}>{t("kids.more.title")}</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: theme.primary }}>{isRTL ? "⬅" : "➜"}</span>
            </button>
          </div>

          {/* ── Right sidebar — exactly four quick-access tiles ── */}
          <div className="shrink-0 flex flex-col gap-4 min-h-0" style={{ width: 156 }}>
            {sideItems.map((item, i) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="kids-tile flex-1 min-h-0 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                style={{
                  backgroundColor: item.s.bg,
                  borderRadius: 24,
                  border: `3px solid ${item.s.border}`,
                  boxShadow: `0 8px 20px ${item.s.border}44`,
                  outline: "none",
                }}
              >
                <span style={{ fontSize: 44, lineHeight: 1, animation: `kidsFloat ${5 + i * 0.4}s ease-in-out infinite` }}>{item.emoji}</span>
                <span style={{ fontFamily: headFont, fontSize: 14, fontWeight: 800, color: item.s.ink, textAlign: "center", padding: "0 4px", lineHeight: 1.1 }}>{t(item.label)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Bottom action bar — two large finger-friendly buttons ── */}
        <div className="shrink-0 flex gap-5" style={{ height: 76 }}>
          {bottomActions.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="flex-1 flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
              style={{
                minHeight: 64,
                backgroundColor: a.s.bg,
                color: a.s.ink,
                borderRadius: 20,
                border: `3px solid ${a.s.border}`,
                boxShadow: `0 8px 20px ${a.s.border}44`,
                outline: "none",
              }}
            >
              <span style={{ fontSize: 34 }}>{a.emoji}</span>
              <span style={{ fontFamily: headFont, fontSize: 26, fontWeight: 800 }}>{t(a.label)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Daily-mood popup — toast sliding in from the top ── */}
      {moodToast && moodToastCfg[moodToast] && (() => {
        const cfg = moodToastCfg[moodToast];
        return (
          <div className="absolute z-[70]" style={{ top: 128, left: "50%", transform: "translateX(-50%)" }}>
            <div
              className="relative flex flex-col items-center gap-3"
              style={{
                animation: "kidsToastIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
                background: "#ffffff",
                borderRadius: 16,
                border: `3px solid ${cfg.tint.border}`,
                boxShadow: "0 16px 42px rgba(0,0,0,0.18)",
                padding: "18px 24px",
                maxWidth: 460,
              }}
            >
              {/* Sparkle micro-animation (Happy only) */}
              {cfg.sparkle && (
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                  {([
                    { top: -12, left: 14, size: 22, delay: "0s" },
                    { top: -8, right: 20, size: 18, delay: "0.3s" },
                    { bottom: -10, left: 30, size: 16, delay: "0.6s" },
                    { bottom: -12, right: 26, size: 20, delay: "0.15s" },
                    { top: 6, right: -10, size: 16, delay: "0.45s" },
                  ] as { top?: number; bottom?: number; left?: number; right?: number; size: number; delay: string }[]).map((sp, i) => (
                    <span
                      key={i}
                      style={{
                        position: "absolute",
                        top: sp.top,
                        bottom: sp.bottom,
                        left: sp.left,
                        right: sp.right,
                        fontSize: sp.size,
                        color: cfg.tint.ink,
                        animation: "kidsSparkle 1.4s ease-in-out infinite",
                        animationDelay: sp.delay,
                      }}
                    >
                      ✨
                    </span>
                  ))}
                </div>
              )}

              <p style={{ fontFamily: headFont, fontSize: 20, fontWeight: 800, color: cfg.tint.ink, textAlign: "center", lineHeight: 1.3, position: "relative" }}>
                {cfg.message}
              </p>

              {cfg.action && (
                <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <button
                    onClick={() => { setMoodToast(null); onOpenCategory("Call"); }}
                    className="flex items-center gap-2 cursor-pointer active:scale-[0.97] transition-transform"
                    style={{
                      height: 44,
                      padding: "0 22px",
                      background: cfg.tint.bg,
                      borderRadius: 9999,
                      border: `2.5px solid ${cfg.tint.border}`,
                      boxShadow: `0 6px 16px ${cfg.tint.border}55`,
                      fontFamily: headFont,
                      fontSize: 17,
                      fontWeight: 800,
                      color: cfg.tint.ink,
                      outline: "none",
                    }}
                  >
                    📞 {t("kids.action.callNurse")}
                  </button>
                  <button
                    onClick={() => setMoodToast(null)}
                    className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                    style={{ width: 44, height: 44, borderRadius: 9999, background: "#fff", border: `2.5px solid ${cfg.tint.border}`, fontSize: 18, fontWeight: 900, color: cfg.tint.ink, outline: "none" }}
                    aria-label="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── "Explore More" drawer — slides up as a sheet ── */}
      {moreOpen && (
        <div
          onClick={() => setMoreOpen(false)}
          className="absolute inset-0 z-[60] flex items-end justify-center"
          style={{ background: "rgba(20,20,40,0.45)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full flex flex-col gap-4"
            style={{
              maxHeight: "80%",
              backgroundColor: "#ffffff",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderTop: `4px solid ${theme.primary}`,
              boxShadow: "0 -24px 60px rgba(0,0,0,0.28)",
              padding: "16px 32px 32px",
              animation: "kidsSheetUp 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <div className="shrink-0 mx-auto" style={{ width: 56, height: 6, borderRadius: 9999, backgroundColor: `${theme.primary}33` }} aria-hidden="true" />

            <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
              <p style={{ fontFamily: headFont, fontSize: 30, fontWeight: 800, color: brandInk }}>
                ✨ {t("kids.more.title")}
              </p>
              <button
                onClick={() => setMoreOpen(false)}
                className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                style={{ width: 52, height: 52, borderRadius: 9999, backgroundColor: pageBg, border: `3px solid ${theme.primary}`, fontSize: 26, fontWeight: 900, color: theme.primary, outline: "none" }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 overflow-y-auto" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              {moreItems.map((item, i) => {
                const s = swatch(i * 40);
                return (
                  <button
                    key={item.key + i}
                    onClick={() => runMore(item.onClick)}
                    className="kids-tile flex flex-col items-center justify-center gap-2 cursor-pointer"
                    style={{
                      minHeight: 124,
                      padding: "16px 8px",
                      backgroundColor: s.bg,
                      borderRadius: 26,
                      border: `3px solid ${s.border}`,
                      outline: "none",
                    }}
                  >
                    <span style={{ fontSize: 46, lineHeight: 1, animation: `kidsFloat ${4 + (i % 4) * 0.5}s ease-in-out infinite`, animationDelay: `${(i % 5) * 0.3}s` }}>
                      {item.emoji}
                    </span>
                    <span style={{ fontFamily: headFont, fontSize: 18, fontWeight: 800, color: s.ink, textAlign: "center", lineHeight: 1.15 }}>
                      {t(item.label)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
