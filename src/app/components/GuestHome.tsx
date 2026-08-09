import { useState } from "react";
import { useTheme, WEIGHT, SHADOW, TEXT_STYLE, SPACE } from "./ThemeContext";
import { useLocale } from "./i18n";
import { useAuth } from "./AuthContext";
import { HeartPulse, LockKeyhole, LogIn, Sparkles, Stethoscope, User, Utensils } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
 * GUEST HOME — left sidebar for sessions entered via "Continue as Guest"
 * Replaces PatientGreeting + CareMe. Personalized services are shown as
 * locked previews; everything else on the dashboard stays fully accessible.
 * ═══════════════════════════════════════════════════════════════════════════ */

/* No neutral "muted surface" token exists — background/surface/surfaceElevated
 * are all #FFFFFF in light mode. borderDefault is the one neutral tint that
 * reads correctly over a card in both light and dark themes. */
const neutralFill = (theme: { borderDefault: string }) => theme.borderDefault;

/** Solid brand-filled "Patient Login" CTA. Returns to the access-code screen. */
function PatientLoginButton() {
  const { theme } = useTheme();
  const { t, fontFamily } = useLocale();
  const { logout } = useAuth();
  const [pressed, setPressed] = useState(false);

  return (
    <button
      data-nav="true"
      onClick={(e) => {
        e.stopPropagation();
        logout();
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className="flex items-center justify-center gap-2.5 w-full py-3 cursor-pointer transition-transform duration-150"
      style={{
        backgroundColor: pressed ? theme.primaryDark : theme.primary,
        transform: pressed ? "scale(0.96)" : "scale(1)",
        border: "none",
        outline: "none",
        borderRadius: theme.radiusMd,
      }}
    >
      <LogIn size={20} style={{ color: theme.textInverse }} strokeWidth={2} />
      <span
        style={{
          fontFamily,
          ...TEXT_STYLE.buttonSm,
          color: theme.textInverse,
          letterSpacing: "0.3px",
        }}
      >
        {t("guest.home.patientLogin")}
      </span>
    </button>
  );
}

/* ─── Top card: guest welcome ─── */
export function GuestGreeting({ onOpenAboutUs, showAboutUs = true }: { onOpenAboutUs?: () => void; showAboutUs?: boolean }) {
  const { theme } = useTheme();
  const { t, isRTL, fontFamily } = useLocale();

  return (
    <div
      className="relative overflow-hidden w-full shrink-0"
      style={{
        textAlign: isRTL ? "right" : "left",
        backgroundColor: theme.surface,
        borderRadius: theme.radiusCard,
        boxShadow: SHADOW.md,
        border: theme.cardBorder,
        padding: theme.cardPadding,
      }}
    >
      <p
        style={{
          fontFamily,
          ...TEXT_STYLE.subtitle,
          fontWeight: WEIGHT.medium,
          color: theme.textMuted,
        }}
      >
        {t("general.hello")}
      </p>
      <p
        style={{
          fontFamily,
          ...TEXT_STYLE.display,
          fontWeight: WEIGHT.extrabold,
          color: theme.textHeading,
        }}
      >
        {t("guest.home.welcome")}
      </p>
      <p
        style={{
          fontFamily,
          ...TEXT_STYLE.body,
          color: theme.textMuted,
          margin: 0,
          paddingTop: SPACE[1],
        }}
      >
        {t("guest.home.subtitle")}
      </p>

      {/* Current session state — not a control, the user is already in guest mode */}
      <div
        aria-current="true"
        className="flex items-center justify-center gap-2.5 w-full py-3"
        style={{
          marginTop: SPACE[3],
          backgroundColor: neutralFill(theme),
          border: `1.5px solid ${theme.borderDefault}`,
          borderRadius: theme.radiusMd,
        }}
      >
        <User size={20} style={{ color: theme.textBody }} strokeWidth={2} />
        <span
          style={{
            fontFamily,
            ...TEXT_STYLE.buttonSm,
            color: theme.textBody,
            letterSpacing: "0.3px",
          }}
        >
          {t("guest.home.modeBadge")}
        </span>
      </div>

      <div style={{ marginTop: SPACE[2] }}>
        <PatientLoginButton />
      </div>

      {showAboutUs && (
        <button
          data-nav="true"
          onClick={(e) => {
            e.stopPropagation();
            onOpenAboutUs?.();
          }}
          className="w-full cursor-pointer active:scale-95 transition-transform"
          style={{
            marginTop: SPACE[2],
            background: "none",
            border: "none",
            outline: "none",
            padding: SPACE[1],
          }}
        >
          <span
            style={{
              fontFamily,
              ...TEXT_STYLE.buttonSm,
              color: theme.primary,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            {t("general.aboutUs")}
          </span>
        </button>
      )}
    </div>
  );
}

/* ─── Locked service preview tile ─── */
function LockedServiceTile({ labelKey, icon: Icon }: { labelKey: string; icon: typeof HeartPulse }) {
  const { theme } = useTheme();
  const { t, isRTL, fontFamily } = useLocale();

  return (
    <div
      aria-disabled="true"
      className="relative flex flex-col items-center justify-center gap-2 w-full h-full min-h-0"
      style={{
        backgroundColor: neutralFill(theme),
        borderRadius: theme.radiusLg,
        border: `1px solid ${theme.borderSubtle}`,
        padding: SPACE[1],
      }}
    >
      {/* Lock marker */}
      <div
        className="absolute flex items-center justify-center"
        style={{ top: SPACE[1], [isRTL ? "left" : "right"]: SPACE[1] }}
      >
        <LockKeyhole size={14} style={{ color: theme.textDisabled }} strokeWidth={2.2} />
      </div>

      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: SPACE[6],
          height: SPACE[6],
          borderRadius: theme.radiusMd,
          backgroundColor: theme.surface,
        }}
      >
        <Icon size={26} style={{ color: theme.textDisabled }} strokeWidth={1.8} />
      </div>

      <span
        style={{
          fontFamily,
          ...TEXT_STYLE.label,
          fontWeight: WEIGHT.semibold,
          color: theme.textDisabled,
          textAlign: "center",
        }}
      >
        {t(labelKey)}
      </span>
    </div>
  );
}

/* ─── Second card: gated patient services ─── */
export function GuestPatientServices() {
  const { theme } = useTheme();
  const { t, fontFamily } = useLocale();

  return (
    <div
      className="flex flex-col w-full h-full min-h-0 overflow-hidden"
      style={{
        backgroundColor: theme.surface,
        borderRadius: theme.radiusCard,
        boxShadow: SHADOW.md,
        border: theme.cardBorder,
        padding: theme.cardPadding,
        gap: SPACE[2],
      }}
    >
      {/* Header + lock */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <span
          style={{
            fontFamily,
            ...TEXT_STYLE.cardTitle,
            fontWeight: WEIGHT.bold,
            color: theme.textHeading,
          }}
        >
          {t("guest.services.title")}
        </span>
        <LockKeyhole size={20} style={{ color: theme.textMuted }} strokeWidth={2} />
      </div>

      <p
        className="shrink-0"
        style={{
          fontFamily,
          ...TEXT_STYLE.helper,
          color: theme.textMuted,
          margin: 0,
        }}
      >
        {t("guest.services.subtitle")}
      </p>

      {/* 2×2 locked previews */}
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        <LockedServiceTile labelKey="care.title" icon={HeartPulse} />
        <LockedServiceTile labelKey="service.orderFood" icon={Utensils} />
        <LockedServiceTile labelKey="service.housekeeping" icon={Sparkles} />
        <LockedServiceTile labelKey="service.consultation" icon={Stethoscope} />
      </div>

      <div className="shrink-0">
        <PatientLoginButton />
      </div>
    </div>
  );
}
