import { useRef, useCallback } from "react";

export function useLongPress(
  onLongPress: () => void,
  ms: number = 600
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didFire = useRef(false);

  const start = useCallback(() => {
    didFire.current = false;
    timerRef.current = setTimeout(() => {
      didFire.current = true;
      onLongPress();
    }, ms);
  }, [onLongPress, ms]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleClick = useCallback((normalClick: () => void) => {
    if (!didFire.current) {
      normalClick();
    }
    didFire.current = false;
  }, []);

  return {
    handlers: {
      onPointerDown: start,
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
    },
    handleClick,
    didFire,
  };
}
