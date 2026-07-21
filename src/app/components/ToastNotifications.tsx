import { createContext, useCallback, useContext, useRef, useState, ReactNode, useEffect } from "react";
import { Utensils, X, TriangleAlert, ShieldCheck, ShieldOff } from "lucide-react";
import { useTheme, TEXT_STYLE, WEIGHT, TYPE_SCALE, SHADOW, SPACE } from "./ThemeContext";
import { useLocale } from "./i18n";

/* ═══════════════════════════════════════════════════════════════════════════
 * HBS — Toast Notifications
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Lightweight, self-contained toast system that renders INSIDE the scaled
 * 1920×1080 bedside container (so it inherits the same scale + RTL direction).
 * Three service-themed variants:
 *   - "meal"         → utensils,            accent icon disc  → Meal Ordering
 *   - "housekeeping" → sparkle-star (SVG),  primary icon disc → Housekeeping
 *   - "rtls"         → staff photo,         alert header      → RTLS Staff Entry
 * ═══════════════════════════════════════════════════════════════════════════ */

/* Housekeeping sparkle-star SVG paths — same ones used in ServicesGrid.tsx */
const HK_SPARKLE_PATHS = [
  "M8.28083 12.9167C8.20643 12.6283 8.05612 12.3651 7.84551 12.1545C7.63491 11.9439 7.37173 11.7936 7.08333 11.7192L1.97083 10.4008C1.88361 10.3761 1.80684 10.3235 1.75218 10.2512C1.69751 10.1789 1.66794 10.0907 1.66794 10C1.66794 9.90933 1.69751 9.82113 1.75218 9.7488C1.80684 9.67646 1.88361 9.62392 1.97083 9.59917L7.08333 8.28C7.37162 8.20567 7.63474 8.05548 7.84533 7.84503C8.05593 7.63459 8.2063 7.37157 8.28083 7.08333L9.59917 1.97083C9.62367 1.88327 9.67615 1.80612 9.7486 1.75116C9.82105 1.69621 9.90948 1.66646 10.0004 1.66646C10.0913 1.66646 10.1798 1.69621 10.2522 1.75116C10.3247 1.80612 10.3772 1.88327 10.4017 1.97083L11.7192 7.08333C11.7936 7.37173 11.9439 7.63491 12.1545 7.84551C12.3651 8.05612 12.6283 8.20643 12.9167 8.28083L18.0292 9.59833C18.1171 9.62258 18.1946 9.67501 18.2499 9.74756C18.3051 9.82012 18.335 9.9088 18.335 10C18.335 10.0912 18.3051 10.1799 18.2499 10.2524C18.1946 10.325 18.1171 10.3774 18.0292 10.4017L12.9167 11.7192C12.6283 11.7936 12.3651 11.9439 12.1545 12.1545C11.9439 12.3651 11.7936 12.6283 11.7192 12.9167L10.4008 18.0292C10.3763 18.1167 10.3238 18.1939 10.2514 18.2488C10.179 18.3038 10.0905 18.3335 9.99958 18.3335C9.90865 18.3335 9.82021 18.3038 9.74777 18.2488C9.67532 18.1939 9.62284 18.1167 9.59833 18.0292L8.28083 12.9167Z",
  "M16.6667 2.5V5.83333",
  "M18.3333 4.16667H15",
  "M3.33333 14.1667V15.8333",
  "M4.16667 15H2.5",
];

export type ToastVariant = "meal" | "housekeeping" | "rtls";

export interface ToastInput {
  variant: ToastVariant;
  /** Small uppercase eyebrow, e.g. "MEAL ORDERING" */
  category: string;
  /** Bold headline */
  title: string;
  /** Optional coloured action tag on the trailing edge, e.g. "On the Way" */
  actionText?: string;
  actionColor?: string;
  /** Callback when the toast body is tapped (not the close button) */
  onTap?: () => void;
  /* ── RTLS-specific fields ── */
  /** Staff photo URL (for rtls variant) */
  staffPhoto?: string;
  /** Staff role / subtitle, e.g. "Cardiology, MD" */
  staffRole?: string;
  /** true = Authorized (green), false = Unauthorized (red) */
  authorized?: boolean;
}

interface ToastItem extends ToastInput {
  id: number;
}

interface ToastContextValue {
  showToast: (t: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const AUTO_DISMISS_MS = 7000;
const MAX_VISIBLE = 4;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback((input: ToastInput) => {
    const id = ++idRef.current;
    setToasts((prev) => [{ ...input, id }, ...prev].slice(0, MAX_VISIBLE));
    const timer = setTimeout(() => remove(id), AUTO_DISMISS_MS);
    timers.current.set(id, timer);
  }, [remove]);

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  /* ── Demo helpers: triggered from PatientGreeting badges ── */
  const hkDemoIdx = useRef(0);
  const mealDemoIdx = useRef(0);
  const rtlsDemoIdx = useRef(0);
  useEffect(() => {
    (window as any).__demoHkToast = () => {
      const nav = () => window.dispatchEvent(new CustomEvent("toast-navigate", { detail: "housekeeping" }));
      const demos: ToastInput[] = [
        { variant: "housekeeping", category: "HOUSEKEEPING REQUEST", title: "Water has been delivered", actionText: "Delivered", actionColor: "#16A34A", onTap: nav },
        { variant: "housekeeping", category: "HOUSEKEEPING REQUEST", title: "Blanket is on the way", actionText: "On the Way", actionColor: "#2563EB", onTap: nav },
        { variant: "housekeeping", category: "HOUSEKEEPING REQUEST", title: "Pillow is being prepared", actionText: "Preparing", actionColor: "#D97706", onTap: nav },
        { variant: "housekeeping", category: "HOUSEKEEPING ISSUE", title: "Air Conditioner issue has been fixed", actionText: "Fixed", actionColor: "#16A34A", onTap: nav },
      ];
      showToast(demos[hkDemoIdx.current % demos.length]);
      hkDemoIdx.current++;
    };
    (window as any).__demoMealToast = () => {
      const nav = () => window.dispatchEvent(new CustomEvent("toast-navigate", { detail: "meal" }));
      const demos: ToastInput[] = [
        { variant: "meal", category: "MEAL ORDERING", title: "Dinner ordering is now open!", actionText: "Order Now", actionColor: "#2563EB", onTap: nav },
        { variant: "meal", category: "MEAL ORDERING", title: "Only 30 min left to order Lunch!", actionText: "Hurry!", actionColor: "#D97706", onTap: nav },
        { variant: "meal", category: "MEAL ORDERING", title: "Your Breakfast is being served now 🍽️", actionText: "Bon Appétit!", actionColor: "#16A34A", onTap: nav },
        { variant: "meal", category: "MEAL ORDERING", title: "Lunch #4827 — On the Way", actionText: "On the Way", actionColor: "#2563EB", onTap: nav },
      ];
      showToast(demos[mealDemoIdx.current % demos.length]);
      mealDemoIdx.current++;
    };
    (window as any).__demoToast = (window as any).__demoHkToast;
    return () => {
      delete (window as any).__demoHkToast;
      delete (window as any).__demoMealToast;
      delete (window as any).__demoToast;
    };
  }, [showToast]);

  /* ── RTLS demo — uses actual care team images from NurseDataStore ── */
  useEffect(() => {
    (window as any).__demoRtlsToast = (staffList?: { name: string; role: string; img: string }[]) => {
      /* Default demo data if no staff list is passed */
      const defaults = [
        { name: "Fahad Mahmoud", role: "Cardiology, MD", img: "" },
        { name: "Nawal Ali", role: "Nurse", img: "" },
        { name: "Dr. Khalid", role: "Internal Medicine", img: "" },
        { name: "Unknown Visitor", role: "Unregistered", img: "" },
      ];
      const list = staffList ?? defaults;
      const person = list[rtlsDemoIdx.current % list.length];
      /* Alternate authorized/unauthorized on each click */
      const isAuthorized = rtlsDemoIdx.current % 2 === 0;
      showToast({
        variant: "rtls",
        category: "toast.rtls.category",
        title: person.name,
        staffPhoto: person.img || "",
        staffRole: person.role,
        authorized: isAuthorized,
      });
      rtlsDemoIdx.current++;
    };
    return () => {
      delete (window as any).__demoRtlsToast;
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * VIEWPORT — positioned absolutely inside the 1920×1080 container
 * ═══════════════════════════════════════════════════════════════════════════ */

function ToastViewport({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  const { isRTL } = useLocale();

  return (
    <div
      aria-live="polite"
      className="absolute flex flex-col pointer-events-none"
      style={{
        top: SPACE[3],
        [isRTL ? "left" : "right"]: SPACE[3],
        gap: SPACE[2],
        zIndex: 80,
        width: "480px",
        maxWidth: "480px",
      }}
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * TOAST CARD — renders either the standard (meal/hk) or RTLS variant
 * ═══════════════════════════════════════════════════════════════════════════ */

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const { theme } = useTheme();
  const { t, isRTL, fontFamily } = useLocale();

  /* ── RTLS variant: staff photo card ── */
  if (toast.variant === "rtls") {
    return (
      <div
        className="pointer-events-auto relative"
        onClick={() => { toast.onTap?.(); }}
        style={{
          backgroundColor: theme.surface,
          borderRadius: theme.radiusLg,
          boxShadow: SHADOW.xl,
          border: theme.cardBorder,
          animation: `${isRTL ? "hbsToastInRTL" : "hbsToastIn"} 0.35s cubic-bezier(0.16,1,0.3,1)`,
          textAlign: isRTL ? "right" : "left",
          cursor: toast.onTap ? "pointer" : "default",
          overflow: "hidden",
        }}
      >
        {/* Alert header bar */}
        <div
          className="flex items-center gap-2"
          style={{
            padding: `${SPACE[2]} ${SPACE[3]}`,
            borderBottom: `1px solid ${theme.borderSubtle}`,
          }}
        >
          <TriangleAlert size={18} strokeWidth={2.2} style={{ color: "#F59E0B", flexShrink: 0 }} />
          <span style={{
            fontFamily,
            fontSize: TYPE_SCALE.base,
            fontWeight: WEIGHT.semibold,
            color: theme.textHeading,
          }}>
            {t("toast.rtls.category")}
          </span>

          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); onDismiss(); }}
            aria-label={t("general.close")}
            className="flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform"
            style={{
              marginInlineStart: "auto",
              width: "28px",
              height: "28px",
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
            }}
          >
            <X size={16} strokeWidth={2.5} style={{ color: theme.textMuted }} />
          </button>
        </div>

        {/* Staff body */}
        <div className="flex items-center gap-4" style={{ padding: `${SPACE[3]} ${SPACE[3]}` }}>
          {/* Photo */}
          {toast.staffPhoto ? (
            <img
              src={toast.staffPhoto}
              alt={toast.title}
              className="shrink-0 rounded-xl object-cover"
              style={{ width: "80px", height: "90px" }}
            />
          ) : (
            <div
              className="shrink-0 rounded-xl flex items-center justify-center"
              style={{ width: "80px", height: "90px", backgroundColor: theme.primaryLight }}
            >
              <span style={{ fontSize: "32px", fontWeight: WEIGHT.bold, color: theme.primary }}>
                {toast.title.charAt(0)}
              </span>
            </div>
          )}

          {/* Text + badge */}
          <div className="flex-1 min-w-0">
            <p style={{
              fontFamily,
              ...TEXT_STYLE.pageTitle,
              fontWeight: WEIGHT.bold,
              color: theme.textHeading,
              margin: 0,
              fontSize: "22px",
            }}>
              {toast.title}
            </p>
            {toast.staffRole && (
              <p style={{
                fontFamily,
                ...TEXT_STYLE.body,
                color: theme.textMuted,
                margin: "2px 0 10px",
              }}>
                {toast.staffRole}
              </p>
            )}
            {/* Authorized / Unauthorized badge */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: toast.authorized ? "#DCFCE7" : "#FEE2E2",
              }}
            >
              {toast.authorized ? (
                <ShieldCheck size={18} strokeWidth={2.2} style={{ color: "#16A34A" }} />
              ) : (
                <ShieldOff size={18} strokeWidth={2.2} style={{ color: "#EF4444" }} />
              )}
              <span style={{
                fontFamily,
                fontSize: TYPE_SCALE.base,
                fontWeight: WEIGHT.bold,
                color: toast.authorized ? "#16A34A" : "#EF4444",
              }}>
                {toast.authorized ? t("toast.rtls.authorized") : t("toast.rtls.unauthorized")}
              </span>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes hbsToastIn {
            from { opacity: 0; transform: translateX(24px) scale(0.96); }
            to   { opacity: 1; transform: translateX(0) scale(1); }
          }
          @keyframes hbsToastInRTL {
            from { opacity: 0; transform: translateX(-24px) scale(0.96); }
            to   { opacity: 1; transform: translateX(0) scale(1); }
          }
        `}</style>
      </div>
    );
  }

  /* ── Standard variant (meal / housekeeping) ── */
  const isMeal = toast.variant === "meal";
  const discColor = isMeal ? theme.accent : theme.primary;

  return (
    <div
      className="pointer-events-auto relative flex items-center"
      onClick={() => { toast.onTap?.(); }}
      style={{
        backgroundColor: theme.surface,
        borderRadius: theme.radiusLg,
        boxShadow: SHADOW.xl,
        border: theme.cardBorder,
        padding: `${SPACE[2]} ${SPACE[3]}`,
        gap: SPACE[2],
        animation: `${isRTL ? "hbsToastInRTL" : "hbsToastIn"} 0.35s cubic-bezier(0.16,1,0.3,1)`,
        textAlign: isRTL ? "right" : "left",
        cursor: toast.onTap ? "pointer" : "default",
      }}
    >
      {/* Icon disc */}
      <div
        className="shrink-0 flex items-center justify-center rounded-full"
        style={{ width: "52px", height: "52px", backgroundColor: discColor }}
      >
        {isMeal ? (
          <Utensils size={26} strokeWidth={2} style={{ color: theme.textInverse }} />
        ) : (
          <svg width={26} height={26} viewBox="0 0 20 20" fill="none">
            <g clipPath="url(#hk_toast_clip)">
              {HK_SPARKLE_PATHS.map((d, i) => (
                <path key={i} d={d} stroke={theme.textInverse} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              ))}
            </g>
            <defs>
              <clipPath id="hk_toast_clip">
                <rect fill="white" height="20" width="20" />
              </clipPath>
            </defs>
          </svg>
        )}
      </div>

      {/* Text column */}
      <div className="flex-1 min-w-0" style={{ paddingInlineEnd: SPACE[1] }}>
        <p
          className="truncate"
          style={{
            fontFamily,
            fontSize: TYPE_SCALE.sm,
            fontWeight: WEIGHT.bold,
            letterSpacing: "0.6px",
            lineHeight: 1,
            color: discColor,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {toast.category}
        </p>
        <p
          style={{
            fontFamily,
            ...TEXT_STYLE.subtitle,
            fontWeight: WEIGHT.bold,
            color: theme.textHeading,
            margin: "4px 0 2px",
          }}
        >
          {toast.title}
        </p>
        <p
          style={{
            fontFamily,
            ...TEXT_STYLE.caption,
            color: theme.textMuted,
            margin: 0,
          }}
        >
          {t("toast.justNow")}
        </p>
      </div>

      {/* Action tag */}
      {toast.actionText && (
        <span
          className="shrink-0 self-center whitespace-nowrap"
          style={{
            fontFamily,
            ...TEXT_STYLE.bodyEmphasis,
            fontWeight: WEIGHT.bold,
            color: toast.actionColor || discColor,
            paddingInlineEnd: SPACE[2],
          }}
        >
          {toast.actionText}
        </span>
      )}

      {/* Close */}
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        aria-label={t("general.close")}
        className="absolute flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform"
        style={{
          top: SPACE[1],
          [isRTL ? "left" : "right"]: SPACE[1],
          width: "28px",
          height: "28px",
          backgroundColor: "transparent",
          border: "none",
          outline: "none",
        }}
      >
        <X size={16} strokeWidth={2.5} style={{ color: theme.textMuted }} />
      </button>

      <style>{`
        @keyframes hbsToastIn {
          from { opacity: 0; transform: translateX(24px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes hbsToastInRTL {
          from { opacity: 0; transform: translateX(-24px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
