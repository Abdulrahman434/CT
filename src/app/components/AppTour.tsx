import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Navigation,
  ChevronRight,
  ChevronLeft,
  X,
  Clock,
  Newspaper,
  UserRound,
  HeartPulse,
  LayoutGrid,
  ConciergeBell,
  Zap,
  MessageSquareHeart,
  Sun,
  Sparkles,
} from "lucide-react";
import { useTheme, TEXT_STYLE, WEIGHT, SHADOW, TYPE_SCALE, SPACE } from "./ThemeContext";
import { useLocale } from "./i18n";

/* ═══════════════════════════════════════════════════════════════════════════
 * TOUR STEP DEFINITIONS
 *
 * Each step has a spotlight region (fixed coords in the 1920×1080 canvas),
 * a tooltip placement, and content.  Because the bedside screen uses a
 * fixed 1920×1080 viewport scaled to fit, we can use absolute pixel values.
 * ═══════════════════════════════════════════════════════════════════════════ */

interface TourStep {
  id: string;
  /** Spotlight rectangle — null for full-screen steps (welcome / finish) */
  region: { x: number; y: number; w: number; h: number; r?: number } | null;
  /** Where the tooltip card sits relative to the spotlight */
  placement: "center" | "right" | "bottom" | "left" | "top" | "bottom-right" | "bottom-left";
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  titleKey: string;
  body: string;
  bodyKey: string;
  detail?: string;
  detailKey?: string;
}

const STEPS: TourStep[] = [
  {
    id: "welcome",
    region: null,
    placement: "center",
    icon: Navigation,
    title: "Welcome to Your Bedside Companion",
    titleKey: "tour.step.welcome.title",
    body: "This interactive guide will walk you through every feature of your in-room smart display — from entertainment to hospital services.",
    bodyKey: "tour.step.welcome.body",
    detail: "Tap \"Next\" to begin, or skip anytime.",
    detailKey: "tour.step.welcome.detail",
  },
  {
    id: "prayer",
    region: { x: 600, y: 8, w: 720, h: 84, r: 16 },
    placement: "bottom",
    icon: Sun,
    title: "Prayer Times",
    titleKey: "tour.step.prayer.title",
    body: "All five daily prayer times at a glance. The next upcoming prayer is highlighted so you never miss a salah.",
    bodyKey: "tour.step.prayer.body",
  },
  {
    id: "controls",
    region: { x: 1370, y: 8, w: 520, h: 84, r: 16 },
    placement: "bottom-left",
    icon: Clock,
    title: "Status Bar & Quick Controls",
    titleKey: "tour.step.controls.title",
    body: "Current time, date, live weather, language toggle, notification bell, and settings — all one tap away.",
    bodyKey: "tour.step.controls.body",
    detail: "The red badge on the bell shows unread notifications.",
    detailKey: "tour.step.controls.detail",
  },
  {
    id: "ticker",
    region: { x: 0, y: 100, w: 1920, h: 40, r: 0 },
    placement: "bottom",
    icon: Newspaper,
    title: "News & Announcements",
    titleKey: "tour.step.ticker.title",
    body: "A scrolling ticker delivers real-time hospital news, health tips, and service updates — personalized to your ward.",
    bodyKey: "tour.step.ticker.body",
  },
  {
    id: "greeting",
    region: { x: 32, y: 172, w: 400, h: 368, r: 32 },
    placement: "right",
    icon: UserRound,
    title: "Your Personal Card",
    titleKey: "tour.step.greeting.title",
    body: "Your name, room number, MRN, and extension — plus a quick link to learn about the hospital with the \"About Us\" button.",
    bodyKey: "tour.step.greeting.body",
    detail: "Tap the ? icon in the corner to relaunch this tour anytime.",
    detailKey: "tour.step.greeting.detail",
  },
  {
    id: "careme",
    region: { x: 32, y: 560, w: 400, h: 496, r: 32 },
    placement: "right",
    icon: HeartPulse,
    title: "CareMe — Your Health Hub",
    titleKey: "tour.step.careme.title",
    body: "Access your Care Team, Care Plan, Diet & Allergies, Baby Camera, and Discharge Plan — all in one rotating card.",
    bodyKey: "tour.step.careme.body",
    detail: "Tap any card to expand it into a full-screen detailed view.",
    detailKey: "tour.step.careme.detail",
  },
  {
    id: "hub",
    region: { x: 472, y: 172, w: 1096, h: 660, r: 32 },
    placement: "left",
    icon: LayoutGrid,
    title: "Entertainment & Engagement Hub",
    titleKey: "tour.step.hub.title",
    body: "Eight categories of content — Media, Reading, Social, Games, Meeting, Internet, Tools, and Education — designed for your comfort.",
    bodyKey: "tour.step.hub.body",
    detail: "Each tile opens a curated launcher with apps and content relevant to that category.",
    detailKey: "tour.step.hub.detail",
  },
  {
    id: "services",
    region: { x: 472, y: 864, w: 1096, h: 192, r: 32 },
    placement: "top",
    icon: ConciergeBell,
    title: "Hospital Services",
    titleKey: "tour.step.services.title",
    body: "Request a consultation, call housekeeping, order food, or ring the nurse station — directly from your screen.",
    bodyKey: "tour.step.services.body",
    detail: "Requests are routed to the right department instantly.",
    detailKey: "tour.step.services.detail",
  },
  {
    id: "shortcuts",
    region: { x: 1608, y: 172, w: 280, h: 656, r: 32 },
    placement: "left",
    icon: Zap,
    title: "Quick Shortcuts",
    titleKey: "tour.step.shortcuts.title",
    body: "Your most-used apps, always one tap away. These shortcuts are configured by your hospital for quick, convenient access.",
    bodyKey: "tour.step.shortcuts.body",
  },
  {
    id: "survey",
    region: { x: 1608, y: 864, w: 280, h: 192, r: 32 },
    placement: "left",
    icon: MessageSquareHeart,
    title: "Share Your Feedback",
    titleKey: "tour.step.survey.title",
    body: "Help us improve! Tap here to complete a quick satisfaction survey about your stay, meals, or staff.",
    bodyKey: "tour.step.survey.body",
  },
  {
    id: "finish",
    region: null,
    placement: "center",
    icon: Sparkles,
    title: "You're All Set!",
    titleKey: "tour.step.finish.title",
    body: "You now know every feature of your bedside companion. Enjoy a comfortable, connected stay.",
    bodyKey: "tour.step.finish.body",
    detail: "You can restart this tour anytime from the ? button on your greeting card.",
    detailKey: "tour.step.finish.detail",
  },
];

/* ══════════════════════════════════════════════════════════════════════════
 * COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

export function AppTour({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();
  const { t, isRTL } = useLocale();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  const current = STEPS[step];
  const total = STEPS.length;
  const isFirst = step === 0;
  const isLast = step === total - 1;
  const progress = ((step + 1) / total) * 100;

  const next = useCallback(() => {
    if (isLast) { onClose(); return; }
    setDirection(1);
    setStep((s) => s + 1);
  }, [isLast, onClose]);

  const back = useCallback(() => {
    if (isFirst) return;
    setDirection(-1);
    setStep((s) => s - 1);
  }, [isFirst]);

  /* Keyboard support */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (isRTL) {
        if (e.key === "ArrowLeft" || e.key === "Enter") next();
        if (e.key === "ArrowRight") back();
      } else {
        if (e.key === "ArrowRight" || e.key === "Enter") next();
        if (e.key === "ArrowLeft") back();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, next, back, isRTL]);

  /* ── Spotlight coords ── */
  const region = current.region;
  const pad = 10; // breathing room around the spotlight
  const spot = region
    ? (() => {
        const rawX = region.x;
        const mirroredX = isRTL ? (1920 - rawX - region.w) : rawX;
        return {
          x: mirroredX - pad,
          y: region.y - pad,
          w: region.w + pad * 2,
          h: region.h + pad * 2,
          r: (region.r ?? 16) + 4,
        };
      })()
    : null;

  /* ── Flip placement for RTL ── */
  const flipPlacement = (p: TourStep["placement"]): TourStep["placement"] => {
    if (!isRTL) return p;
    switch (p) {
      case "left": return "right";
      case "right": return "left";
      case "bottom-left": return "bottom-right";
      case "bottom-right": return "bottom-left";
      default: return p;
    }
  };
  const placement = flipPlacement(current.placement);

  /* ── Tooltip position calculation ── */
  const tooltipStyle = useMemo((): React.CSSProperties => {
    const cardW = 460;
    const cardH = 480; // actual tooltip height accounting for all content
    const vw = 1920;
    const vh = 1080;
    const margin = 24; // minimum distance from viewport edge
    const bottomSafeZone = 80; // extra padding from bottom for keyboard hints

    const clampX = (x: number) => Math.max(margin, Math.min(x, vw - cardW - margin));
    const clampY = (y: number) => Math.max(margin, Math.min(y, vh - cardH - bottomSafeZone));

    if (!spot || placement === "center") {
      return {
        position: "absolute",
        top: `${(vh - cardH) / 2}px`,
        left: `${(vw - cardW) / 2}px`,
        width: `${cardW}px`,
      };
    }
    const gap = 24;
    let x: number;
    let y: number;

    switch (placement) {
      case "right":
        x = spot.x + spot.w + gap;
        y = spot.y + spot.h / 2 - cardH / 2;
        break;
      case "left":
        x = spot.x - gap - cardW;
        y = spot.y + spot.h / 2 - cardH / 2;
        break;
      case "bottom":
        x = spot.x + spot.w / 2 - cardW / 2;
        y = spot.y + spot.h + gap;
        break;
      case "bottom-left":
        x = spot.x + spot.w - cardW;
        y = spot.y + spot.h + gap;
        break;
      case "bottom-right":
        x = spot.x;
        y = spot.y + spot.h + gap;
        break;
      case "top":
        x = spot.x + spot.w / 2 - cardW / 2;
        y = spot.y - gap - cardH;
        break;
      default:
        x = (vw - cardW) / 2;
        y = (vh - cardH) / 2;
    }

    return {
      position: "absolute",
      left: `${clampX(x)}px`,
      top: `${clampY(y)}px`,
      width: `${cardW}px`,
    };
  }, [spot, placement]);

  const Icon = current.icon;

  return (
    <div className="absolute inset-0 z-[100]" style={{ pointerEvents: "auto", direction: "ltr" }}>
      {/* ── Overlay with spotlight cutout ── */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="1920" height="1080" fill="white" />
            {spot && (
              <motion.rect
                key={`mask-${step}`}
                initial={{
                  x: spot.x,
                  y: spot.y,
                  width: spot.w,
                  height: spot.h,
                  rx: spot.r,
                  ry: spot.r,
                }}
                animate={{
                  x: spot.x,
                  y: spot.y,
                  width: spot.w,
                  height: spot.h,
                  rx: spot.r,
                  ry: spot.r,
                }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="1920"
          height="1080"
          fill="rgba(0,0,0,0.62)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* ── Click catcher (prevents interacting with stuff behind) ── */}
      <div
        className="absolute inset-0"
        style={{ pointerEvents: "auto" }}
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
      />

      {/* ── Progress bar — top of screen ── */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: 0,
          height: "3px",
          backgroundColor: "rgba(255,255,255,0.1)",
          zIndex: 10,
        }}
      >
        <motion.div
          className="h-full"
          style={{ backgroundColor: theme.primary }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* ── Tooltip card ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`tooltip-${step}`}
          initial={{
            opacity: 0,
            y: placement === "center" ? 24 : 0,
            x: (direction > 0 ? 30 : -30) * (isRTL ? -1 : 1),
            scale: placement === "center" ? 0.97 : 1,
          }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{
            opacity: 0,
            x: (direction > 0 ? -20 : 20) * (isRTL ? -1 : 1),
          }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            ...tooltipStyle,
            zIndex: 20,
            pointerEvents: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex flex-col"
            style={{
              backgroundColor: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(24px) saturate(1.6)",
              WebkitBackdropFilter: "blur(24px) saturate(1.6)",
              borderRadius: "32px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.5)",
              overflow: "hidden",
              direction: isRTL ? "rtl" : "ltr",
            }}
          >

            <div style={{ padding: "36px 36px 32px" }}>
              {/* Step indicator + skip */}
              <div className="flex items-center justify-between" style={{ marginBottom: "26px" }}>
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      backgroundColor: theme.primary,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: theme.fontFamily,
                        fontSize: TYPE_SCALE.base,
                        fontWeight: WEIGHT.bold,
                        color: "#FFFFFF",
                        lineHeight: 1,
                      }}
                    >
                      {step + 1}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: theme.fontFamily,
                      fontSize: TYPE_SCALE.base,
                      fontWeight: WEIGHT.medium,
                      color: theme.textMuted,
                    }}
                  >
                    {t("tour.of")} {total}
                  </span>
                </div>

                {!isLast && (
                  <button
                    onClick={onClose}
                    className="flex items-center gap-1 cursor-pointer rounded-full active:scale-95 transition-transform"
                    style={{
                      padding: "6px 14px",
                      backgroundColor: "transparent",
                      border: "none",
                      outline: "none",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: theme.fontFamily,
                        fontSize: TYPE_SCALE.base,
                        fontWeight: WEIGHT.medium,
                        color: theme.textMuted,
                      }}
                    >
                      {t("tour.skipTour")}
                    </span>
                  </button>
                )}
              </div>

              {/* Icon */}
              <div
                className="flex items-center justify-center"
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "16px",
                  backgroundColor: theme.primarySubtle,
                  marginBottom: "24px",
                }}
              >
                <Icon size={30} color={theme.primary} strokeWidth={1.8} />
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: theme.fontFamily,
                  fontSize: TYPE_SCALE.xl,
                  fontWeight: WEIGHT.bold,
                  lineHeight: 1.3,
                  letterSpacing: "-0.3px",
                  color: theme.textHeading,
                  margin: 0,
                  marginBottom: "14px",
                }}
              >
                {t(current.titleKey)}
              </h3>

              {/* Body */}
              <p
                style={{
                  fontFamily: theme.fontFamily,
                  fontSize: TYPE_SCALE.md,
                  fontWeight: WEIGHT.normal,
                  color: theme.textBody,
                  lineHeight: "28px",
                  margin: 0,
                }}
              >
                {t(current.bodyKey)}
              </p>

              {/* Detail line */}
              {current.detailKey && (
                <p
                  style={{
                    fontFamily: theme.fontFamily,
                    fontSize: TYPE_SCALE.base,
                    fontWeight: WEIGHT.medium,
                    color: theme.textMuted,
                    margin: 0,
                    marginTop: "14px",
                    lineHeight: "24px",
                  }}
                >
                  {t(current.detailKey)}
                </p>
              )}

              {/* ── Step dots ── */}
              <div className="flex items-center gap-[6px] justify-center" style={{ marginTop: "28px", marginBottom: "24px" }}>
                {STEPS.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      width: i === step ? 24 : 6,
                      backgroundColor: i === step ? theme.primary : i < step ? theme.primaryLight : "#D4D4D4",
                      opacity: i === step ? 1 : i < step ? 0.7 : 0.4,
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      height: "6px",
                      borderRadius: "3px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setDirection(i > step ? 1 : -1);
                      setStep(i);
                    }}
                  />
                ))}
              </div>

              {/* ── Action buttons ── */}
              <div className="flex gap-3">
                {!isFirst && (
                  <button
                    onClick={back}
                    className="flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.96] transition-transform"
                    style={{
                      height: "52px",
                      paddingLeft: "20px",
                      paddingRight: "22px",
                      borderRadius: "14px",
                      border: "none",
                      outline: "none",
                      backgroundColor: theme.primarySubtle,
                      fontFamily: theme.fontFamily,
                      ...TEXT_STYLE.button,
                      fontSize: TYPE_SCALE.base,
                      fontWeight: WEIGHT.semibold,
                      color: theme.primary,
                    }}
                  >
                    {isRTL ? <ChevronRight size={18} strokeWidth={2.5} /> : <ChevronLeft size={18} strokeWidth={2.5} />}
                    {t("tour.back")}
                  </button>
                )}

                <button
                  onClick={next}
                  className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.96] transition-transform"
                  style={{
                    height: "52px",
                    paddingLeft: "26px",
                    paddingRight: "22px",
                    borderRadius: "14px",
                    border: "none",
                    outline: "none",
                    backgroundColor: theme.primary,
                    boxShadow: `0 4px 16px ${theme.primarySubtle}`,
                    fontFamily: theme.fontFamily,
                    ...TEXT_STYLE.button,
                    fontSize: TYPE_SCALE.base,
                    fontWeight: WEIGHT.semibold,
                    color: theme.textInverse,
                  }}
                >
                  {isLast ? t("tour.finishTour") : isFirst ? t("tour.startTour") : t("tour.next")}
                  {!isLast && (isRTL ? <ChevronLeft size={18} strokeWidth={2.5} /> : <ChevronRight size={18} strokeWidth={2.5} />)}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Keyboard hint (bottom center) ── */}
      <div
        className="absolute flex items-center gap-4 pointer-events-none"
        style={{
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
        }}
      >
        {[
          { key: "←", labelKey: "tour.keyboard.back" },
          { key: "→", labelKey: "tour.keyboard.next" },
          { key: "Esc", labelKey: "tour.keyboard.exit" },
        ].map((k) => (
          <div key={k.key} className="flex items-center gap-1.5">
            <div
              style={{
                padding: "3px 8px",
                borderRadius: "6px",
                backgroundColor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.15)",
                fontFamily: theme.fontFamily,
                fontSize: "11px",
                fontWeight: WEIGHT.semibold,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1,
              }}
            >
              {k.key}
            </div>
            <span
              style={{
                fontFamily: theme.fontFamily,
                fontSize: "11px",
                fontWeight: WEIGHT.medium,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {t(k.labelKey)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}