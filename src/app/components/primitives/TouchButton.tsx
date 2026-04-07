import { CSSProperties, ReactNode } from "react";
import { useTheme, TEXT_STYLE, SHADOW } from "../ThemeContext";

/**
 * TouchButton — primary action button primitive for bedside touchscreen.
 *
 * Enforces minimum touch target height (52px), consistent padding,
 * and brand-correct colors. Supports "primary", "secondary", and
 * "danger" variants.
 *
 * Usage:
 *   <TouchButton onClick={fn}>Submit Survey</TouchButton>
 *   <TouchButton variant="secondary" onClick={fn}>Cancel</TouchButton>
 *   <TouchButton variant="danger" onClick={fn}>Call Nurse</TouchButton>
 */

interface TouchButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  /** Visual variant. Default: "primary" */
  variant?: "primary" | "secondary" | "danger";
  /** Use smaller text style (buttonSm). Default: false */
  small?: boolean;
  /** Full-width button. Default: false */
  fullWidth?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional inline styles */
  style?: CSSProperties;
  /** Additional class names */
  className?: string;
  children?: ReactNode;
}

export function TouchButton({
  onClick,
  variant = "primary",
  small = false,
  fullWidth = false,
  disabled = false,
  style,
  className,
  children,
}: TouchButtonProps) {
  const { theme } = useTheme();

  const textStyle = small ? TEXT_STYLE.buttonSm : TEXT_STYLE.button;

  const variantStyles: Record<string, CSSProperties> = {
    primary: {
      backgroundColor: theme.primary,
      color: theme.textInverse,
      boxShadow: `0 4px 16px ${theme.primarySubtle}`,
    },
    secondary: {
      backgroundColor: theme.primarySubtle,
      color: theme.primary,
      boxShadow: "none",
    },
    danger: {
      backgroundColor: "#D10044",
      color: "#FFFFFF",
      boxShadow: "0 4px 16px rgba(209,0,68,0.15)",
    },
  };

  const vs = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center cursor-pointer active:scale-[0.96] transition-transform ${className ?? ""}`}
      style={{
        height: small ? "44px" : "52px",
        paddingLeft: "24px",
        paddingRight: "24px",
        borderRadius: theme.radiusLg,
        border: "none",
        outline: "none",
        fontFamily: theme.fontFamily,
        ...textStyle,
        ...vs,
        width: fullWidth ? "100%" : undefined,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
