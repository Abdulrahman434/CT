import { useCallback, useRef, useState } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

let rippleId = 0;

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
