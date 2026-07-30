import React, { useState, useEffect, useRef, useCallback } from "react";
import { Lock, Check } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useLocale } from "./i18n";
import { setHasSeenAppLockTutorial } from "../lib/appLockTutorialStore";

export interface TargetTileInfo {
  id: string;
  name: string;
  icon?: React.ReactNode;
  rect: DOMRect | null;
  onOpenOriginalApp: () => void;
}

interface AppLockTutorialOverlayProps {
  target: TargetTileInfo;
  onClose: () => void;
  onStartLockSetup: (appId: string, appName: string) => void;
}

export function AppLockTutorialOverlay({
  target,
  onClose,
  onStartLockSetup,
}: AppLockTutorialOverlayProps) {
  const { theme: t } = useTheme();
  const { t: tr, isRTL, fontFamily } = useLocale();

  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const [isHolding, setIsHolding] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0); // 0 to 100 for illustration loop

  const holdStartTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const HOLD_DURATION_MS = 2000;

  /* ─── Demo Animation Loop inside Coachmark Illustration ─── */
  useEffect(() => {
    let frameId: number;
    let startTime = performance.now();
    const cycleMs = 3000;

    const loop = (now: number) => {
      const elapsed = (now - startTime) % cycleMs;
      // 0ms - 2000ms: ring fills 0 to 100%. 2000ms - 3000ms: holds at 100% with lock icon
      const progress = Math.min(100, (elapsed / 2000) * 100);
      setDemoProgress(progress);
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  /* ─── Complete long press handler ─── */
  const completeLongPress = useCallback(() => {
    if (navigator.vibrate) {
      try { navigator.vibrate([40, 30, 40]); } catch { /* non-fatal */ }
    }
    setHasSeenAppLockTutorial(true);
    onClose();
    onStartLockSetup(target.id, target.name);
  }, [onClose, onStartLockSetup, target.id, target.name]);

  /* ─── Cancel hold ─── */
  const cancelHold = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    holdStartTimeRef.current = null;
    setIsHolding(false);
    setHoldProgress(0);
  }, []);

  /* ─── Start hold ─── */
  const startHold = useCallback(() => {
    cancelHold();
    setIsHolding(true);
    const now = performance.now();
    holdStartTimeRef.current = now;

    const tick = (currentTime: number) => {
      if (!holdStartTimeRef.current) return;
      const elapsed = currentTime - holdStartTimeRef.current;
      const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setHoldProgress(pct);

      if (pct >= 100) {
        cancelHold();
        completeLongPress();
      } else {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [cancelHold, completeLongPress]);

  /* ─── Keyboard / Remote OK button listener ─── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setHasSeenAppLockTutorial(true);
        onClose();
        return;
      }
      if ((e.key === "Enter" || e.key === " ") && !isHolding) {
        if (e.repeat) return; // ignore key repeat
        startHold();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        cancelHold();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isHolding, startHold, cancelHold, onClose]);

  /* ─── "Got it" action ─── */
  const handleGotIt = () => {
    setHasSeenAppLockTutorial(true);
    onClose();
    target.onOpenOriginalApp();
  };

  /* ─── Compute positions for target tile and coachmark ─── */
  const rect = target.rect;
  const tileWidth = rect ? rect.width : 200;
  const tileHeight = rect ? rect.height : 200;
  const tileLeft = rect ? rect.left : window.innerWidth / 2 - 100;
  const tileTop = rect ? rect.top : window.innerHeight / 2 - 100;

  // Determine coachmark position relative to tile
  const coachmarkWidth = 400;
  const isRightSideSpace = tileLeft + tileWidth + coachmarkWidth + 30 < window.innerWidth;
  const placeOnRight = isRTL ? !isRightSideSpace : isRightSideSpace;

  let coachLeft = placeOnRight
    ? tileLeft + tileWidth + 20
    : tileLeft - coachmarkWidth - 20;

  // Clamp coachmark inside screen
  if (coachLeft < 16) coachLeft = 16;
  if (coachLeft + coachmarkWidth > window.innerWidth - 16) {
    coachLeft = window.innerWidth - coachmarkWidth - 16;
  }

  let coachTop = tileTop + tileHeight / 2 - 120;
  if (coachTop < 20) coachTop = 20;
  if (coachTop + 240 > window.innerHeight - 20) {
    coachTop = window.innerHeight - 260;
  }

  const primaryCyan = "#0090B8";

  return (
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center select-none overflow-hidden"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        fontFamily,
      }}
      dir={isRTL ? "rtl" : "ltr"}
      tabIndex={0}
      autoFocus
    >
      {/* Invisible backdrop click capturer */}
      <div
        className="absolute inset-0"
        onClick={(e) => {
          e.stopPropagation();
          setHasSeenAppLockTutorial(true);
          onClose();
        }}
      />

      {/* ─── ELEVATED HIGHLIGHTED TILE ─── */}
      <div
        className="fixed z-[9995] flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-95"
        style={{
          left: `${tileLeft}px`,
          top: `${tileTop}px`,
          width: `${tileWidth}px`,
          height: `${tileHeight}px`,
          backgroundColor: "#FFFFFF",
          borderRadius: t.radiusCard || "16px",
          border: `2.5px solid ${primaryCyan}`,
          boxShadow: `0 0 30px rgba(0, 144, 184, 0.55), ${t.shadowMd || "0 4px 12px rgba(0,0,0,0.1)"}`,
          touchAction: "none",
        }}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
      >
        {/* Floating "Press and hold" pill badge above tile */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3.5 py-1 rounded-full text-white font-semibold shadow-lg whitespace-nowrap"
          style={{
            top: "-18px",
            backgroundColor: primaryCyan,
            fontSize: "12px",
            letterSpacing: "0.2px",
            zIndex: 10,
          }}
        >
          <Lock size={12} strokeWidth={2.5} />
          <span>{tr("appLock.tutorial.pressAndHold") || "Press and hold"}</span>
          {/* Arrow pointing down at tile */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45"
            style={{ backgroundColor: primaryCyan }}
          />
        </div>

        {/* Circular Progress Overlay when holding down */}
        {isHolding && (
          <div className="absolute inset-0 rounded-[14px] flex items-center justify-center overflow-hidden bg-black/10 pointer-events-none z-20">
            <svg className="w-full h-full p-2" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="rgba(0, 144, 184, 0.25)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={primaryCyan}
                strokeWidth="8"
                strokeDasharray="263.89"
                strokeDashoffset={263.89 - (263.89 * holdProgress) / 100}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: "stroke-dashoffset 0.05s linear" }}
              />
            </svg>
          </div>
        )}

        {/* Tile Content (Icon + Name) */}
        <div className="flex flex-col items-center justify-center gap-2.5 p-4 text-center">
          {target.icon ? (
            <div
              className="flex items-center justify-center w-14 h-14 rounded-2xl"
              style={{ backgroundColor: t.primaryLight || "rgba(0, 144, 184, 0.1)", color: primaryCyan }}
            >
              {target.icon}
            </div>
          ) : (
            <div
              className="flex items-center justify-center w-14 h-14 rounded-2xl"
              style={{ backgroundColor: "rgba(0, 144, 184, 0.1)", color: primaryCyan }}
            >
              <Lock size={28} />
            </div>
          )}
          <span style={{ fontSize: "16px", fontWeight: 700, color: t.textHeading || "#0F172A" }}>
            {target.name}
          </span>
        </div>
      </div>

      {/* ─── COACHMARK CARD BESIDE TILE ─── */}
      <div
        className="fixed z-[9996] flex flex-col bg-white rounded-2xl p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        style={{
          left: `${coachLeft}px`,
          top: `${coachTop}px`,
          width: `${coachmarkWidth}px`,
          boxShadow: "0 20px 40px -10px rgba(15, 23, 42, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-row items-center gap-5">
          {/* Left Column — Animated Touch Illustration */}
          <div className="relative w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden">
            {/* Outer Circular Progress Ring */}
            <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={primaryCyan}
                strokeWidth="6"
                strokeDasharray="251.32"
                strokeDashoffset={251.32 - (251.32 * demoProgress) / 100}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>

            {/* Inner Miniature Keypad & Touch Fingertip */}
            <div className="relative flex items-center justify-center w-12 h-12">
              {/* 3x3 Keypad dots */}
              <div className="grid grid-cols-3 gap-1.5 opacity-30">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-slate-700" />
                ))}
              </div>

              {/* Touch Hand/Fingertip Graphic */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
                style={{ transform: demoProgress > 0 && demoProgress < 100 ? "scale(0.9)" : "scale(1)" }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={primaryCyan} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                  <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" />
                  <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                  <path d="M18 8a2 2 0 0 1 2 2v4a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-1.5" />
                </svg>
              </div>

              {/* Lock pop-up badge when completed */}
              {demoProgress >= 98 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-full animate-in zoom-in-75 duration-150">
                  <div className="w-8 h-8 rounded-full bg-[#0090B8] flex items-center justify-center text-white shadow-md">
                    <Check size={18} strokeWidth={3} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column — Content */}
          <div className="flex flex-col flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {tr("appLock.tutorial.title") || "Keep an app private"}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {tr("appLock.tutorial.body") || "Touch and hold any app to lock it with your PIN."}
            </p>
            <span
              className="text-xs font-semibold mt-1.5"
              style={{ color: primaryCyan }}
            >
              {tr("appLock.tutorial.hint") || "Hold for 2 seconds"}
            </span>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-3.5">
              <button
                onClick={startHold}
                className="px-4 py-1.5 rounded-full text-white font-bold text-xs shadow-sm cursor-pointer active:scale-95 transition-all"
                style={{ backgroundColor: primaryCyan }}
              >
                {tr("appLock.tutorial.tryIt") || "Try it"}
              </button>
              <button
                onClick={handleGotIt}
                className="font-semibold text-xs cursor-pointer hover:underline"
                style={{ color: primaryCyan }}
              >
                {tr("appLock.tutorial.gotIt") || "Got it"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Progress Indicator */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-center">
          <span className="text-[11px] font-medium text-slate-400">
            {tr("appLock.tutorial.progress") || "1 of 1"}
          </span>
        </div>
      </div>
    </div>
  );
}
