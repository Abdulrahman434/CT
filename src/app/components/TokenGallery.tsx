import { useTheme, TYPE_SCALE, WEIGHT, LEADING, SHADOW, SPACE, TEXT_STYLE } from "./ThemeContext";
import { X } from "lucide-react";

/**
 * TokenGallery — Visual documentation of all design tokens.
 *
 * Accessible from the Hospital Configurator. Renders every token
 * category with live previews using the current active theme.
 */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <div className="mb-10">
      <h3
        style={{
          fontFamily: theme.fontFamily,
          ...TEXT_STYLE.sectionTitle,
          color: theme.primary,
          marginBottom: "16px",
          paddingBottom: "8px",
          borderBottom: `2px solid ${theme.primarySubtle}`,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function ColorSwatch({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <div className="flex items-center gap-3 mb-2">
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: value,
          border: "1px solid rgba(0,0,0,0.08)",
          flexShrink: 0,
        }}
      />
      <div className="min-w-0">
        <span
          style={{
            fontFamily: theme.fontFamily,
            ...TEXT_STYLE.label,
            color: theme.textHeading,
            display: "block",
          }}
        >
          {label}
        </span>
        <span
          style={{
            ...TEXT_STYLE.caption,
            color: theme.textMuted,
            display: "block",
            fontFamily: "monospace",
          }}
        >
          {value.length > 50 ? value.slice(0, 50) + "..." : value}
        </span>
      </div>
    </div>
  );
}

function TextStylePreview({ name, recipe }: { name: string; recipe: any }) {
  const { theme } = useTheme();
  return (
    <div className="flex items-baseline gap-4 mb-3 pb-3" style={{ borderBottom: `1px solid ${theme.borderSubtle}` }}>
      <span
        style={{
          fontFamily: "monospace",
          ...TEXT_STYLE.label,
          color: theme.primary,
          width: "120px",
          flexShrink: 0,
        }}
      >
        {name}
      </span>
      <span
        style={{
          fontFamily: theme.fontFamily,
          ...recipe,
          color: theme.textHeading,
        }}
      >
        The quick brown fox
      </span>
      <span
        style={{
          fontFamily: "monospace",
          ...TEXT_STYLE.caption,
          color: theme.textMuted,
          marginLeft: "auto",
          whiteSpace: "nowrap",
        }}
      >
        {recipe.fontSize} / {recipe.fontWeight} / {recipe.lineHeight}
      </span>
    </div>
  );
}

function ShadowPreview({ name, value }: { name: string; value: string }) {
  const { theme } = useTheme();
  return (
    <div className="flex items-center gap-4 mb-4">
      <div
        style={{
          width: "100px",
          height: "60px",
          borderRadius: "12px",
          backgroundColor: theme.surface,
          boxShadow: value,
          flexShrink: 0,
        }}
      />
      <div>
        <span
          style={{
            fontFamily: "monospace",
            ...TEXT_STYLE.label,
            color: theme.primary,
            display: "block",
          }}
        >
          SHADOW.{name}
        </span>
        <span
          style={{
            fontFamily: "monospace",
            ...TEXT_STYLE.caption,
            color: theme.textMuted,
            display: "block",
          }}
        >
          {value.length > 60 ? value.slice(0, 60) + "..." : value}
        </span>
      </div>
    </div>
  );
}

function SpacePreview({ step, value }: { step: string; value: string }) {
  const { theme } = useTheme();
  return (
    <div className="flex items-center gap-3 mb-2">
      <span
        style={{
          fontFamily: "monospace",
          ...TEXT_STYLE.label,
          color: theme.primary,
          width: "60px",
          flexShrink: 0,
        }}
      >
        SPACE[{step}]
      </span>
      <div
        style={{
          width: value,
          height: "16px",
          borderRadius: "4px",
          backgroundColor: theme.primarySubtle,
          border: `1px solid ${theme.primary}`,
          minWidth: "2px",
        }}
      />
      <span
        style={{
          fontFamily: "monospace",
          ...TEXT_STYLE.caption,
          color: theme.textMuted,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function RadiusPreview({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <div className="flex items-center gap-3 mb-3">
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: value,
          backgroundColor: theme.primarySubtle,
          border: `2px solid ${theme.primary}`,
          flexShrink: 0,
        }}
      />
      <div>
        <span
          style={{
            fontFamily: "monospace",
            ...TEXT_STYLE.label,
            color: theme.primary,
            display: "block",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "monospace",
            ...TEXT_STYLE.caption,
            color: theme.textMuted,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

export function TokenGallery({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();

  const brandColors: [string, string][] = [
    ["primary", theme.primary],
    ["primaryDark", theme.primaryDark],
    ["primaryLight", theme.primaryLight],
    ["primarySubtle", theme.primarySubtle],
    ["accent", theme.accent],
    ["accentDark", theme.accentDark],
    ["accentLight", theme.accentLight],
    ["accentSubtle", theme.accentSubtle],
  ];

  const surfaceColors: [string, string][] = [
    ["background", theme.background],
    ["surface", theme.surface],
    ["surfaceElevated", theme.surfaceElevated],
    ["overlay", theme.overlay],
    ["panelBg", theme.panelBg],
  ];

  const textColors: [string, string][] = [
    ["textHeading", theme.textHeading],
    ["textBody", theme.textBody],
    ["textMuted", theme.textMuted],
    ["textDisabled", theme.textDisabled],
    ["textInverse", theme.textInverse],
    ["textInverseMuted", theme.textInverseMuted],
  ];

  const iconColors: [string, string][] = [
    ["iconDefault", theme.iconDefault],
    ["iconBrand", theme.iconBrand],
    ["iconInverse", theme.iconInverse],
  ];

  const borderColors: [string, string][] = [
    ["borderDefault", theme.borderDefault],
    ["borderSubtle", theme.borderSubtle],
    ["borderActive", theme.borderActive],
    ["borderAccent", theme.borderAccent],
  ];

  const radii: [string, string][] = [
    ["radiusSm", theme.radiusSm],
    ["radiusMd", theme.radiusMd],
    ["radiusLg", theme.radiusLg],
    ["radiusXl", theme.radiusXl],
    ["radiusCard", theme.radiusCard],
    ["radiusFull", theme.radiusFull],
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col"
      style={{
        backgroundColor: theme.background,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          padding: "24px 32px",
          borderBottom: `1px solid ${theme.borderDefault}`,
          backgroundColor: theme.surface,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: theme.radiusMd,
              backgroundColor: theme.primarySubtle,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <div>
            <h2
              style={{
                fontFamily: theme.fontFamily,
                ...TEXT_STYLE.pageTitle,
                color: theme.textHeading,
              }}
            >
              Design Token Gallery
            </h2>
            <p
              style={{
                fontFamily: theme.fontFamily,
                ...TEXT_STYLE.caption,
                color: theme.textMuted,
              }}
            >
              Live preview of all HBS design tokens for {theme.hospitalShortName}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
          style={{
            width: "44px",
            height: "44px",
            borderRadius: theme.radiusFull,
            backgroundColor: theme.tileInactiveBg,
            border: "none",
          }}
        >
          <X size={20} style={{ color: theme.textMuted }} />
        </button>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "32px" }}
      >
        <div className="grid grid-cols-2 gap-12" style={{ maxWidth: "1600px" }}>
          {/* Left Column */}
          <div>
            <Section title="TEXT_STYLE — Semantic Text Recipes">
              {Object.entries(TEXT_STYLE).map(([name, recipe]) => (
                <TextStylePreview key={name} name={name} recipe={recipe} />
              ))}
            </Section>

            <Section title="TYPE_SCALE — Size Progression">
              {Object.entries(TYPE_SCALE).map(([name, value]) => (
                <div key={name} className="flex items-baseline gap-3 mb-2">
                  <span style={{ fontFamily: "monospace", ...TEXT_STYLE.label, color: theme.primary, width: "50px" }}>{name}</span>
                  <span style={{ fontFamily: theme.fontFamily, fontSize: value, fontWeight: WEIGHT.semibold, color: theme.textHeading }}>{value}</span>
                </div>
              ))}
            </Section>

            <Section title="SHADOW — Elevation Levels">
              {Object.entries(SHADOW).map(([name, value]) => (
                <ShadowPreview key={name} name={name} value={value} />
              ))}
            </Section>

            <Section title="SPACE — Spacing Scale">
              {Object.entries(SPACE).map(([step, value]) => (
                <SpacePreview key={step} step={step} value={value} />
              ))}
            </Section>
          </div>

          {/* Right Column */}
          <div>
            <Section title="Brand Colors">
              <div className="grid grid-cols-2 gap-x-6">
                {brandColors.map(([label, value]) => (
                  <ColorSwatch key={label} label={label} value={value} />
                ))}
              </div>
            </Section>

            <Section title="Surface Colors">
              {surfaceColors.map(([label, value]) => (
                <ColorSwatch key={label} label={label} value={value} />
              ))}
            </Section>

            <Section title="Text Colors">
              <div className="flex flex-col gap-1">
                {textColors.map(([label, value]) => (
                  <div key={label} className="flex items-center gap-3 mb-1">
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        backgroundColor: label.includes("Inverse") ? theme.primary : theme.surface,
                        border: "1px solid rgba(0,0,0,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.cardTitle, color: value }}>Aa</span>
                    </div>
                    <div>
                      <span style={{ fontFamily: "monospace", ...TEXT_STYLE.label, color: theme.textHeading, display: "block" }}>{label}</span>
                      <span style={{ fontFamily: "monospace", ...TEXT_STYLE.caption, color: theme.textMuted }}>{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Icon Colors">
              {iconColors.map(([label, value]) => (
                <ColorSwatch key={label} label={label} value={value} />
              ))}
            </Section>

            <Section title="Border Colors">
              {borderColors.map(([label, value]) => (
                <ColorSwatch key={label} label={label} value={value} />
              ))}
            </Section>

            <Section title="Border Radius">
              <div className="grid grid-cols-2 gap-4">
                {radii.map(([label, value]) => (
                  <RadiusPreview key={label} label={label} value={value} />
                ))}
              </div>
            </Section>

            <Section title="Typography">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span style={{ fontFamily: "monospace", ...TEXT_STYLE.label, color: theme.primary, width: "100px" }}>fontFamily</span>
                  <span style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.body, color: theme.textHeading }}>{theme.fontFamily}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ fontFamily: "monospace", ...TEXT_STYLE.label, color: theme.primary, width: "100px" }}>fontFamilyAr</span>
                  <span style={{ fontFamily: theme.fontFamilyAr, ...TEXT_STYLE.body, color: theme.textHeading }}>{theme.fontFamilyAr}</span>
                </div>
              </div>
            </Section>

            <Section title="WEIGHT — Font Weight Scale">
              {Object.entries(WEIGHT).map(([name, value]) => (
                <div key={name} className="flex items-baseline gap-3 mb-2">
                  <span style={{ fontFamily: "monospace", ...TEXT_STYLE.label, color: theme.primary, width: "80px" }}>{name}</span>
                  <span style={{ fontFamily: theme.fontFamily, fontSize: TYPE_SCALE.md, fontWeight: value, color: theme.textHeading }}>{value} — The quick brown fox</span>
                </div>
              ))}
            </Section>

            <Section title="LEADING — Line Height Scale">
              {Object.entries(LEADING).map(([name, value]) => (
                <div key={name} className="flex items-baseline gap-3 mb-2">
                  <span style={{ fontFamily: "monospace", ...TEXT_STYLE.label, color: theme.primary, width: "70px" }}>{name}</span>
                  <span style={{ fontFamily: "monospace", ...TEXT_STYLE.caption, color: theme.textMuted }}>{value}</span>
                </div>
              ))}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}