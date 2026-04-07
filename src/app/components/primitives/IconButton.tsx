import { CSSProperties, ReactNode } from "react";
import { useTheme } from "../ThemeContext";

/**
 * IconButton — circular icon container with touch-friendly sizing.
 *
 * Enforces WCAG minimum touch target (44px) by default and uses
 * brand-derived background + icon colors.
 *
 * Usage:
 *   <IconButton onClick={fn}><Settings size={20} /></IconButton>
 *   <IconButton size={52} variant="filled"><Bell size={22} /></IconButton>
 */

interface IconButtonProps {
  /** Click handler */
  onClick?: (e: React.MouseEvent) => void;
  /** Button size in px. Default: 44 (WCAG touch target) */
  size?: number;
  /** Visual variant: "subtle" (tinted bg) or "filled" (solid primary) */
  variant?: "subtle" | "filled";
  /** Accessibility label (required for icon-only buttons) */
  "aria-label"?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  /** Additional class names */
  className?: string;
  children?: ReactNode;
}

export function IconButton({
  onClick,
  size = 44,
  variant = "subtle",
  "aria-label": ariaLabel,
  style,
  className,
  children,
}: IconButtonProps) {
  const { theme } = useTheme();

  const bg = variant === "filled" ? theme.primary : theme.primarySubtle;

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`rounded-full cursor-pointer flex items-center justify-center active:scale-90 transition-transform ${className ?? ""}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: bg,
        border: "none",
        outline: "none",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
