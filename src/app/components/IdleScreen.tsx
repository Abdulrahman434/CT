import { useTheme, TYPE_SCALE, WEIGHT, SHADOW, LEADING, TEXT_STYLE } from "./ThemeContext";
import { useLocale } from "./i18n";

export function IdleScreen() {
  const { theme } = useTheme();
  const { t, fontFamily } = useLocale();

  return (
    <div
      className="h-full flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: theme.surface,
        borderRadius: theme.radiusCard,
        boxShadow: SHADOW.md,
        border: theme.cardBorder,
      }}
    >
      {/* Decorative background shapes — uses primary with low opacity */}
      <div
        className="absolute rounded-full"
        style={{
          width: "400px",
          height: "400px",
          top: "-100px",
          right: "-80px",
          background: `radial-gradient(circle, ${theme.primarySubtle} 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: "300px",
          height: "300px",
          bottom: "-60px",
          left: "-40px",
          background: `radial-gradient(circle, ${theme.primarySubtle} 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        <img
          src={theme.logoUrl}
          alt="Hospital"
          className="w-auto object-contain"
          style={{ height: "80px" }}
        />
        <div>
          <h2
            style={{
              ...TEXT_STYLE.display,
              fontWeight: WEIGHT.semibold,
              color: theme.textHeading,
            }}
          >
            {t("idle.welcome", theme.hospitalName)}
          </h2>
          <p
            className="mt-3"
            style={{
              ...TEXT_STYLE.subtitle,
              fontWeight: WEIGHT.normal,
              color: theme.textMuted,
            }}
          >
            {t("idle.ready")}
          </p>
        </div>
      </div>
    </div>
  );
}