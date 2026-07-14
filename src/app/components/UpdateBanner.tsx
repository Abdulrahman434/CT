import { useTheme } from "./ThemeContext";
import { useLocale } from "./i18n";
import { useUpdateAvailable } from "../lib/updateCheck";

export function UpdateBanner() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { available, reload } = useUpdateAvailable();
  if (!available) return null;

  return (
    <div style={{
      position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
      zIndex: 9997, display: "flex", alignItems: "center", gap: 12,
      background: theme.surfaceElevated, border: `1px solid ${theme.borderDefault}`,
      borderRadius: theme.radiusLg, padding: "12px 18px", boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
    }}>
      <span style={{ color: theme.textHeading, fontSize: 14, fontWeight: 600 }}>
        {t("update.available") || "An update is available"}
      </span>
      <button onClick={reload} style={{
        background: theme.primary, color: theme.textInverse, border: "none",
        borderRadius: theme.radiusLg, padding: "8px 16px", fontWeight: 700, cursor: "pointer",
      }}>
        {t("update.reload") || "Reload now"}
      </button>
    </div>
  );
}
