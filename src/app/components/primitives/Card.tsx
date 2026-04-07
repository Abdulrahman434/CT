import { CSSProperties, ReactNode } from "react";
import { useTheme, SHADOW } from "../ThemeContext";

/**
 * Card — surface container primitive.
 *
 * Wraps content in a themed surface with consistent radius, shadow,
 * padding, and background color.
 *
 * Usage:
 *   <Card>Content here</Card>
 *   <Card elevation="lg" radius="radiusXl" padding="32px">Modal</Card>
 *   <Card noPadding>Full-bleed layout</Card>
 */

type Elevation = keyof typeof SHADOW;

interface CardProps {
  /** Shadow elevation level. Default: "md" (standard card) */
  elevation?: Elevation;
  /** ThemeConfig radius key. Default: "radiusCard" (32px) */
  radius?: "radiusSm" | "radiusMd" | "radiusLg" | "radiusXl" | "radiusCard";
  /** Override padding. Default: theme.cardPadding (22px) */
  padding?: string;
  /** Set true to remove padding entirely */
  noPadding?: boolean;
  /** Override background color */
  bg?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  /** Additional class names */
  className?: string;
  children?: ReactNode;
}

export function Card({
  elevation = "md",
  radius = "radiusCard",
  padding,
  noPadding = false,
  bg,
  style,
  className,
  children,
}: CardProps) {
  const { theme } = useTheme();

  return (
    <div
      className={className}
      style={{
        backgroundColor: bg ?? theme.surface,
        borderRadius: theme[radius],
        boxShadow: SHADOW[elevation],
        border: theme.cardBorder,
        padding: noPadding ? undefined : (padding ?? theme.cardPadding),
        ...style,
      }}
    >
      {children}
    </div>
  );
}