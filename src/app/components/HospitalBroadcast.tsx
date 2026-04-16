import { useState, useEffect } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, TEXT_STYLE, SHADOW } from "./ThemeContext";
import { useLocale } from "./i18n";
import { CheckCircle2, AlertTriangle, Info, Megaphone, ShieldCheck } from "lucide-react";
import imgMosque from "../../assets/b51acb5e2ec4a2c930572c53103b020b12e76ee2.png";

/* ═══════════════════════════════════════════════════════════════════════════
 * HospitalBroadcast — Full-screen urgent notification overlay
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * When the hospital pushes a broadcast notification to the bedside screen,
 * it appears as a center-screen modal that requires patient acknowledgment.
 *
 * BEST PRACTICE (JCI / Planetree / NHS):
 *   - Broadcasts MUST persist in the notification panel after acknowledgment
 *   - Patients may be sedated, drowsy, or cognitively impaired
 *   - Family members visiting later should be able to review
 *   - Audit trail: acknowledged time is recorded
 *   - Visual priority levels map to urgency without causing alarm
 *
 * PRIORITY LEVELS:
 *   info     → blue icon, standard styling (meal updates, visiting hours)
 *   warning  → amber icon, warm border (schedule changes, maintenance)
 *   urgent   → red icon, accent border (emergency drills, safety alerts)
 * ═══════════════════════════════════════════════════════════════════════════ */

export type BroadcastPriority = "info" | "warning" | "urgent";

export interface BroadcastNotification {
  id: string;
  title: { en: string; ar: string };
  body: { en: string; ar: string };
  priority: BroadcastPriority;
  timestamp: string; // display time
  acknowledgedAt?: string;
  type?: "prayer" | "general";
}

const PRIORITY_CONFIG: Record<BroadcastPriority, {
  iconColor: string;
  borderColor: string;
  bgTint: string;
  glowColor: string;
  gradientFrom: string;
  gradientTo: string;
  label: { en: string; ar: string };
}> = {
  info: {
    iconColor: "#3B82F6",
    borderColor: "rgba(59,130,246,0.20)",
    bgTint: "rgba(59,130,246,0.06)",
    glowColor: "rgba(59,130,246,0.12)",
    gradientFrom: "#3B82F6",
    gradientTo: "#60A5FA",
    label: { en: "INFORMATION", ar: "معلومات" },
  },
  warning: {
    iconColor: "#F59E0B",
    borderColor: "rgba(245,158,11,0.25)",
    bgTint: "rgba(245,158,11,0.06)",
    glowColor: "rgba(245,158,11,0.12)",
    gradientFrom: "#F59E0B",
    gradientTo: "#FBBF24",
    label: { en: "IMPORTANT", ar: "مهم" },
  },
  urgent: {
    iconColor: "#D10044",
    borderColor: "rgba(209,0,68,0.25)",
    bgTint: "rgba(209,0,68,0.06)",
    glowColor: "rgba(209,0,68,0.15)",
    gradientFrom: "#D10044",
    gradientTo: "#FF4D7A",
    label: { en: "URGENT", ar: "عاجل" },
  },
};

function PriorityIcon({ priority, type, size = 28, color }: { priority: BroadcastPriority; type?: string; size?: number; color?: string }) {
  const c = color || PRIORITY_CONFIG[priority].iconColor;
  if (type === "prayer") {
    return (
      <div style={{ width: size + 4, height: size + 4, borderRadius: "50%", overflow: "hidden" }}>
        <img src={imgMosque} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  switch (priority) {
    case "urgent":  return <AlertTriangle size={size} style={{ color: c }} />;
    case "warning": return <AlertTriangle size={size} style={{ color: c }} />;
    default:        return <Megaphone size={size} style={{ color: c }} />;
  }
}

/* Keyframe injection for pulse ring animation */
const PULSE_KEYFRAMES = `
@keyframes hbs-broadcast-pulse {
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 0; }
  100% { transform: scale(1.15); opacity: 0; }
}
@keyframes hbs-broadcast-bell {
  0%, 100% { transform: rotate(0deg); }
  10% { transform: rotate(12deg); }
  20% { transform: rotate(-12deg); }
  30% { transform: rotate(8deg); }
  40% { transform: rotate(-8deg); }
  50% { transform: rotate(0deg); }
}
`;

export function HospitalBroadcast({
  notification,
  onAcknowledge,
}: {
  notification: BroadcastNotification;
  onAcknowledge: (id: string) => void;
}) {
  const { theme } = useTheme();
  const { isRTL, fontFamily, locale } = useLocale();
  const [visible, setVisible] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);

  const loc = (v: { en: string; ar: string }) => (locale === "ar" ? v.ar : v.en);
  const cfg = PRIORITY_CONFIG[notification.priority];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleAcknowledge = () => {
    setAcknowledging(true);
    setTimeout(() => {
      onAcknowledge(notification.id);
    }, 400);
  };

  const isUrgent = notification.priority === "urgent";

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center"
      style={{
        backgroundColor: acknowledging ? "rgba(10,22,40,0.15)" : "rgba(10,22,40,0.6)",
        transition: "background-color 0.3s ease",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {/* Inject keyframes */}
      <style>{PULSE_KEYFRAMES}</style>

      {/* Broadcast Card */}
      <div
        style={{
          width: "620px",
          maxWidth: "90%",
          backgroundColor: theme.surface,
          borderRadius: theme.radiusXl,
          boxShadow: `0 25px 50px -12px rgba(0,0,0,0.25), 0 0 60px ${cfg.glowColor}`,
          border: `1.5px solid ${cfg.borderColor}`,
          overflow: "hidden",
          transform: visible && !acknowledging
            ? "scale(1) translateY(0)"
            : acknowledging
            ? "scale(0.95) translateY(8px)"
            : "scale(0.92) translateY(24px)",
          opacity: visible && !acknowledging ? 1 : acknowledging ? 0 : 0,
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
        }}
      >
        {/* Header area with tinted background */}
        <div
          className="flex items-center gap-4"
          style={{
            padding: "24px 36px 20px",
            backgroundColor: cfg.bgTint,
            borderBottom: `1px solid ${cfg.borderColor}`,
          }}
        >
          {/* Icon with pulse ring */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            {/* Pulse ring for urgent */}
            {isUrgent && (
              <div
                style={{
                  position: "absolute",
                  inset: "-4px",
                  borderRadius: theme.radiusMd,
                  border: `2px solid ${cfg.iconColor}`,
                  animation: "hbs-broadcast-pulse 2s ease-in-out infinite",
                }}
              />
            )}
            <div
              className="flex items-center justify-center"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: theme.radiusMd,
                backgroundColor: theme.surface,
                border: `1.5px solid ${cfg.borderColor}`,
                boxShadow: `0 2px 8px ${cfg.glowColor}`,
              }}
            >
              <PriorityIcon priority={notification.priority} type={notification.type} size={26} color={theme.primary} />
            </div>
          </div>

          {/* Label + timestamp */}
          <div className="flex flex-col min-w-0 flex-1">
            <span
              style={{
                fontFamily,
                fontSize: "18px",
                fontWeight: WEIGHT.bold,
                color: theme.primary,
                letterSpacing: "1.2px",
                textTransform: "uppercase" as const,
              }}
            >
              {locale === "ar" ? "إشعار المستشفى" : "HOSPITAL NOTICE"}
            </span>
            <span
              style={{
                fontFamily,
                ...TEXT_STYLE.micro,
                fontSize: "13px",
                color: theme.textMuted,
                marginTop: "3px",
              }}
            >
              {notification.timestamp}
            </span>
          </div>

          {/* Bell icon — decorative */}
          <div
            style={{
              flexShrink: 0,
              animation: isUrgent ? "hbs-broadcast-bell 3s ease-in-out infinite" : "none",
            }}
          >
            
          </div>
        </div>

        {/* Content body */}
        <div style={{ padding: "28px 36px 32px" }}>
          {/* Title */}
          <h2
            style={{
              fontFamily,
              ...TEXT_STYLE.pageTitle,
              fontSize: TYPE_SCALE.lg,
              color: theme.textHeading,
              margin: 0,
              marginBottom: "14px",
            }}
          >
            {loc(notification.title)}
          </h2>

          {/* Body text */}
          <p
            style={{
              fontFamily,
              ...TEXT_STYLE.body,
              color: theme.textBody,
              margin: 0,
              marginBottom: "32px",
              lineHeight: 1.7,
            }}
          >
            {loc(notification.body)}
          </p>

          {/* Acknowledge button */}
          <button
            onClick={handleAcknowledge}
            className="w-full cursor-pointer flex items-center justify-center gap-3 active:scale-[0.97] transition-transform"
            style={{
              height: "60px",
              borderRadius: theme.radiusMd,
              backgroundColor: isUrgent ? "#D10044" : theme.primary,
              border: "none",
              outline: "none",
              boxShadow: `0 4px 20px ${isUrgent ? "rgba(209,0,68,0.3)" : `${theme.primary}30`}`,
            }}
          >
            <CheckCircle2 size={22} style={{ color: theme.textInverse }} />
            <span
              style={{
                fontFamily,
                ...TEXT_STYLE.button,
                color: theme.textInverse,
              }}
            >
              {locale === "ar" ? "تم الاطلاع" : "I've Read This"}
            </span>
          </button>

          {/* Persistence notice with shield icon */}
          <div
            className="flex items-center justify-center gap-2"
            style={{ marginTop: "14px" }}
          >
            <ShieldCheck size={13} style={{ color: theme.textDisabled }} />
            <p
              style={{
                fontFamily,
                ...TEXT_STYLE.helper,
                color: theme.textDisabled,
                textAlign: "center",
                margin: 0,
              }}
            >
              {locale === "ar"
                ? "سيتم حفظ هذا الإشعار في لوحة الإشعارات"
                : "This notice will be saved in your notifications"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sample broadcast for demo ── */
export const SAMPLE_BROADCAST: BroadcastNotification = {
  id: "broadcast-" + Date.now(),
  title: {
    en: "Visiting Hours Update",
    ar: "تحديث ساعات الزيارة",
  },
  body: {
    en: "Due to enhanced safety protocols, visiting hours have been adjusted to 4:00 PM – 8:00 PM daily starting tomorrow. Each patient may receive up to two visitors at a time. Please inform your family members of this change. Thank you for your understanding.",
    ar: "نظراً لتعزيز بروتوكولات السلامة، تم تعديل ساعات الزيارة لتكون من الساعة 4:00 مساءً إلى 8:00 مساءً يومياً ابتداءً من الغد. يُسمح بزائرين كحد أقصى لكل مريض في وقت واحد. يرجى إبلاغ عائلتكم بهذا التغيير. شكراً لتفهمكم.",
  },
  priority: "info",
  timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
};