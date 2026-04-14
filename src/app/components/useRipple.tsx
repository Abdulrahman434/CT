import { useCallback, useRef, useState } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

let rippleId = 0;

/* ═══════════════════════════════════════════════════════════════════════════
 * INSTANT TAP SOUND — Pre-warmed AudioContext
 * ═══════════════════════════════════════════════════════════════════════════
 * The AudioContext is created and resumed by a one-shot document-level
 * pointerdown listener (capture phase). This fires BEFORE any React
 * component handler, so by the time playTapSound() runs inside
 * onPointerDown, the context is already in "running" state.
 * ═══════════════════════════════════════════════════════════════════════════ */
let _tapCtx: AudioContext | null = null;
let _tapReady = false;

// Pre-warm: fires once on very first touch, before any component handler
if (typeof document !== "undefined") {
  const warmUp = () => {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      _tapCtx = new AC();
      // Play a silent buffer to fully unlock the audio pipeline
      const buf = _tapCtx.createBuffer(1, 1, _tapCtx.sampleRate);
      const src = _tapCtx.createBufferSource();
      src.buffer = buf;
      src.connect(_tapCtx.destination);
      src.start(0);
      if (_tapCtx.state === "suspended") {
        _tapCtx.resume().then(() => { _tapReady = true; });
      } else {
        _tapReady = true;
      }
    } catch {}
    document.removeEventListener("pointerdown", warmUp, true);
  };
  document.addEventListener("pointerdown", warmUp, true);
}

function playTapSound() {
  if (!_tapCtx || !_tapReady) return;
  const t = _tapCtx.currentTime;
  const gain = _tapCtx.createGain();
  gain.connect(_tapCtx.destination);
  gain.gain.setValueAtTime(0.06, t);
  gain.gain.linearRampToValueAtTime(0, t + 0.03);
  const osc = _tapCtx.createOscillator();
  osc.frequency.value = 800;
  osc.connect(gain);
  osc.start(t);
  osc.stop(t + 0.03);
}

/**
 * Returns props to spread onto a container element, plus a <RippleContainer>
 * element to render inside that container (must have `position: relative; overflow: hidden`).
 *
 * @param color  CSS color for the ripple circle (default: "rgba(0,0,0,0.08)")
 */
export function useRipple(color = "rgba(0,0,0,0.08)") {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLElement | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      playTapSound();
      const el = e.currentTarget;
      containerRef.current = el;
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      const id = ++rippleId;
      setRipples((prev) => [...prev, { id, x, y, size }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    },
    []
  );

  const rippleElements = (
    <>
      {ripples.map((r) => (
        <span
          key={r.id}
          style={{
            position: "absolute",
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            borderRadius: "50%",
            backgroundColor: color,
            transform: "scale(0)",
            animation: "ripple-expand 0.55s ease-out forwards",
            pointerEvents: "none",
            zIndex: 50,
          }}
        />
      ))}
    </>
  );

  return { onPointerDown, rippleElements };
}

/** Global ripple keyframes — inject once in your app */
export const RippleStyles = () => (
  <style>{`
    @keyframes ripple-expand {
      0%   { transform: scale(0); opacity: 0.45; }
      100% { transform: scale(1); opacity: 0; }
    }
  `}</style>
);
