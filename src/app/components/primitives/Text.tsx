import { CSSProperties, ReactNode } from "react";
import { useTheme, TEXT_STYLE } from "../ThemeContext";

/**
 * Text — semantic typography primitive.
 *
 * Combines a TEXT_STYLE recipe with the brand fontFamily and a color token
 * into a single component. Eliminates manual style assembly.
 *
 * Usage:
 *   <Text variant="cardTitle" color={theme.textHeading}>My Card</Text>
 *   <Text variant="body">Default body text uses textBody color</Text>
 *   <Text variant="label" color={theme.textMuted} as="label">Field</Text>
 */

type TextVariant = keyof typeof TEXT_STYLE;

/** Map variant → default color token key on ThemeConfig */
const DEFAULT_COLOR: Record<TextVariant, string> = {
  pageTitle:    "textHeading",
  sectionTitle: "textHeading",
  cardTitle:    "textHeading",
  subtitle:     "textHeading",
  body:         "textBody",
  bodyEmphasis: "textBody",
  label:        "textMuted",
  caption:      "textMuted",
  micro:        "textMuted",
  button:       "textInverse",
  buttonSm:     "textInverse",
  helper:       "textDisabled",
  display:      "textHeading",
  displayLg:    "textHeading",
  displayXl:    "textHeading",
};

interface TextProps {
  /** Which semantic text style to apply */
  variant: TextVariant;
  /** Override color (hex or theme token value). Falls back to variant default. */
  color?: string;
  /** HTML element to render. Default: "span" */
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "label" | "div";
  /** Additional inline styles */
  style?: CSSProperties;
  /** Additional class names */
  className?: string;
  children?: ReactNode;
}

export function Text({
  variant,
  color,
  as: Tag = "span",
  style,
  className,
  children,
}: TextProps) {
  const { theme } = useTheme();
  const recipe = TEXT_STYLE[variant];
  const resolvedColor = color ?? (theme as any)[DEFAULT_COLOR[variant]];

  return (
    <Tag
      className={className}
      style={{
        fontFamily: theme.fontFamily,
        ...recipe,
        color: resolvedColor,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
