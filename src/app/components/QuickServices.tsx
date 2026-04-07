import { useState } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW, TEXT_STYLE } from "./ThemeContext";
import { useLocale } from "./i18n";
import { useRipple } from "./useRipple";
import { BookOpenText, MessageSquareMore } from "lucide-react";

function EducationIcon({ color }: { color: string }) {
  return (
    <div className="relative shrink-0 size-[18px]">
      <BookOpenText size={18} color={color} strokeWidth={2} />
    </div>
  );
}

function SurveyIcon({ color }: { color: string }) {
  return (
    <div className="relative shrink-0 size-[18px]">
      <MessageSquareMore size={18} color={color} strokeWidth={2} />
    </div>
  );
}

function CompactCard({
  label,
  icon,
  accentColor,
  accentBg,
}: {
  label: string;
  icon: React.ReactNode;
  accentColor: string;
  accentBg: string;
}) {
  const { theme } = useTheme();
  const { onPointerDown, rippleElements } = useRipple("rgba(0,0,0,0.04)");
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onPointerDown={(e) => { onPointerDown(e); setPressed(true); }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className="relative overflow-hidden flex-1 flex items-center justify-center gap-2.5 transition-all duration-150 cursor-pointer"
      style={{
        backgroundColor: pressed ? theme.surfaceElevated : theme.surface,
        borderRadius: theme.radiusCard,
        boxShadow: pressed
          ? SHADOW.sm
          : SHADOW.md,
        outline: "none",
        transform: pressed ? "scale(0.97)" : "scale(1)",
        padding: "10px 12px",
        minHeight: "44px",
      }}
      aria-label={label}
    >
      {rippleElements}
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: theme.radiusMd,
          backgroundColor: pressed ? accentColor + "22" : accentBg,
          transition: "background-color 0.15s",
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontFamily: theme.fontFamily,
          ...TEXT_STYLE.bodyEmphasis,
          fontWeight: WEIGHT.bold,
          color: theme.textHeading,
          lineHeight: "18px",
        }}
      >
        {label}
      </span>
    </button>
  );
}

export function QuickServices() {
  const { theme } = useTheme();
  const { t } = useLocale();
  return (
    <div className="flex gap-3 shrink-0">
      <CompactCard
        label={t("hub.education")}
        icon={<EducationIcon color={theme.primary} />}
        accentColor={theme.primary}
        accentBg={theme.primarySubtle}
      />
      <CompactCard
        label={t("service.survey")}
        icon={<SurveyIcon color={theme.accent} />}
        accentColor={theme.accent}
        accentBg={theme.accentSubtle}
      />
    </div>
  );
}