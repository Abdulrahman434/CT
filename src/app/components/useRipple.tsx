import { useCallback, useRef, useState, useEffect } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

let rippleId = 0;

/* ═══════════════════════════════════════════════════════════════════════════
 * ZERO-LATENCY AUDIO ENGINE (Always-Running Oscillator)
 * ═══════════════════════════════════════════════════════════════════════════
 * Instead of creating nodes on every tap (which causes GC and instantiation delay),
 * we keep continuous oscillators running at 0 volume and just modulate the gain.
 * ═══════════════════════════════════════════════════════════════════════════ */
let _ctx: AudioContext | null = null;
let _tapGain: GainNode | null = null;
let _dtmfGain: GainNode | null = null;
let _dtmfOsc1: OscillatorNode | null = null;
let _dtmfOsc2: OscillatorNode | null = null;

// The UI tick uses a simple pop
export function playTapSound() {
  if (!_ctx || !_tapGain || _ctx.state !== "running") return;
  const t = _ctx.currentTime;
  _tapGain.gain.cancelScheduledValues(0);
  _tapGain.gain.setValueAtTime(0.06, t);
  _tapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
  _tapGain.gain.setValueAtTime(0, t + 0.04);
}

// Exported for CallScreen
export function playTone(freq1: number, freq2?: number, duration: number = 0.15, vol: number = 0.1) {
  if (!_ctx || !_dtmfGain || !_dtmfOsc1 || _ctx.state !== "running") return;
  const t = _ctx.currentTime;
  _dtmfOsc1.frequency.setValueAtTime(freq1, t);
  if (freq2 && _dtmfOsc2) _dtmfOsc2.frequency.setValueAtTime(freq2, t);
  
  _dtmfGain.gain.cancelScheduledValues(0);
  _dtmfGain.gain.setValueAtTime(vol, t);
  _dtmfGain.gain.setValueAtTime(vol, t + duration - 0.02);
  _dtmfGain.gain.linearRampToValueAtTime(0, t + duration);
}

if (typeof document !== "undefined") {
  const initAudio = () => {
    if (_ctx) return;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      _ctx = new AC();
      
      // Tap ticking setup
      _tapGain = _ctx.createGain();
      _tapGain.gain.value = 0;
      _tapGain.connect(_ctx.destination);
      const tapOsc = _ctx.createOscillator();
      tapOsc.type = "sine";
      tapOsc.frequency.value = 800;
      tapOsc.connect(_tapGain);
      tapOsc.start();

      // DTMF dial pad setup
      _dtmfGain = _ctx.createGain();
      _dtmfGain.gain.value = 0;
      _dtmfGain.connect(_ctx.destination);
      
      _dtmfOsc1 = _ctx.createOscillator();
      _dtmfOsc1.type = "sine";
      _dtmfOsc1.connect(_dtmfGain);
      _dtmfOsc1.start();
      
      _dtmfOsc2 = _ctx.createOscillator();
      _dtmfOsc2.type = "sine";
      _dtmfOsc2.connect(_dtmfGain);
      _dtmfOsc2.start();

      if (_ctx.state === "suspended") _ctx.resume();
    } catch {}
    
    document.removeEventListener("pointerdown", initAudio, true);
  };
  document.addEventListener("pointerdown", initAudio, true);
  
  // GLOBAL SOUND DELEGATION
  // Automatically play tick for ANY interactive element on the screen
  document.addEventListener("pointerdown", (e) => {
    const el = e.target as HTMLElement;
    if (el.closest("[data-no-tick='true']")) return;
    if (
      el.closest("button") || 
      el.closest("a") || 
      el.closest("[data-nav='true']") || 
      el.closest(".cursor-pointer")
    ) {
      playTapSound();
    }
  }, { capture: true, passive: true });
}

/**
 * Returns props to spread onto a container element, plus a <RippleContainer>
 * element to render inside that container.
 *
 * @param color  CSS color for the ripple circle (default: "rgba(0,0,0,0.08)")
 */
export function useRipple(color = "rgba(0,0,0,0.08)") {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLElement | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      // Sound is now handled by the global document listener above
      const el = e.currentTarget;
      containerRef.current = el;
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      const id = ++rippleId;
      setRipples((prev) => [...prev, { id, x, y, size }]);
    },
    []
  );

  // Auto-cleanup ripples
  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

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

/** Global ripple keyframes */
export const RippleStyles = () => (
  <style>{`
    @keyframes ripple-expand {
      0%   { transform: scale(0); opacity: 0.45; }
      100% { transform: scale(1); opacity: 0; }
    }
  `}</style>
);
