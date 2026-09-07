import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW, SPACE } from "./ThemeContext";
import { useLocale } from "./i18n";
import { IconButton } from "./primitives/IconButton";

/**
 * Fullscreen viewer for a bundled patient-guide PDF.
 *
 * The kiosk has no browser chrome and no downloads folder, so the file is
 * rendered inline in an iframe rather than handed to the system viewer.
 */
export function PatientGuideModal({ src, onClose }: { src: string; onClose: () => void }) {
  const { theme } = useTheme();
  const { t, dir, fontFamily } = useLocale();
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      dir={dir}
      className="absolute inset-0 z-50 flex flex-col"
      style={{ backgroundColor: theme.background }}
    >
      <div
        className="shrink-0 flex items-center justify-between"
        style={{
          height: SPACE[12],
          paddingInline: SPACE[4],
          backgroundColor: theme.surface,
          boxShadow: SHADOW.md,
          borderBottom: theme.cardBorder,
        }}
      >
        <span
          style={{
            fontFamily,
            fontSize: TYPE_SCALE.lg,
            fontWeight: WEIGHT.bold,
            color: theme.textHeading,
          }}
        >
          {t("shortcut.patientGuide")}
        </span>
        <IconButton size={56} onClick={onClose} aria-label={t("general.close")}>
          <X size={28} color={theme.iconBrand} />
        </IconButton>
      </div>

      <div className="relative flex-1 min-h-0">
        <iframe
          /* Hides the viewer's own toolbar, which would otherwise offer
             download and print — neither has anywhere to go on a kiosk. */
          src={`${src}#toolbar=0&navpanes=0`}
          title={t("shortcut.patientGuide")}
          onLoad={() => setLoaded(true)}
          className="w-full h-full"
          style={{ border: "none", display: "block" }}
        />

        {!loaded && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ backgroundColor: theme.background, gap: SPACE[3] }}
          >
            <Loader2 className="animate-spin" size={64} color={theme.primary} />
            <span
              style={{
                fontFamily,
                fontSize: TYPE_SCALE.md,
                fontWeight: WEIGHT.semibold,
                color: theme.textMuted,
              }}
            >
              {t("patientGuide.loading")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
