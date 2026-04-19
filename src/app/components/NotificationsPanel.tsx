import { useTheme, TYPE_SCALE, WEIGHT, TEXT_STYLE, SHADOW } from "./ThemeContext";
import { useLocale } from "./i18n";
import { useState, useRef, useCallback } from "react";
import {
  X,
  Bell,
  UtensilsCrossed,
  Pill,
  Stethoscope,
  Download,
  MessageSquare,
  Trash2,
  ChefHat,
  Heart,
  Utensils,
  Check,
  Megaphone,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useOrders } from "./OrderStore";
import type { OrderStatus } from "./OrderStore";
import type { BroadcastNotification } from "./HospitalBroadcast";

interface Notification {
  id: string;
  iconType: string;
  textKey: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: "1", iconType: "megaphone", textKey: "notif.labsReady", time: "11:20 am", read: false },
  { id: "2", iconType: "megaphone", textKey: "notif.surveyRequest", time: "10:45 am", read: false },
  { id: "3", iconType: "megaphone", textKey: "notif.mriReady", time: "09:30 am", read: false },
  { id: "4", iconType: "megaphone", textKey: "notif.hygieneScheduled", time: "08:15 am", read: true },
  { id: "5", iconType: "megaphone", textKey: "notif.doctorVisit", time: "Yesterday", read: true },
];

function NotifIcon({ type }: { type: string }) {
  const { theme } = useTheme();
  switch (type) {
    case "megaphone": return <Megaphone size={20} style={{ color: theme.primary }} />;
    case "message": return <MessageSquare size={20} style={{ color: "#25D366" }} />;
    case "stethoscope": return <Stethoscope size={20} style={{ color: theme.primary }} />;
    case "food": return <UtensilsCrossed size={20} style={{ color: "#E8A530" }} />;
    case "download": return <Download size={20} style={{ color: theme.primary }} />;
    default: return <Bell size={20} style={{ color: theme.primary }} />;
  }
}

/* ─── Swipeable Notification Row ─── */
function SwipeableRow({
  notification,
  onDismiss,
  onClick,
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
  onClick: (notif: Notification) => void;
}) {
  const { theme } = useTheme();
  const { t, isRTL, fontFamily } = useLocale();
  const rowRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const [offsetX, setOffsetX] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const THRESHOLD = 100; // px to trigger dismiss

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = 0;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const diff = e.touches[0].clientX - startX.current;
    // In RTL swipe right to dismiss (positive), in LTR swipe left (negative)
    const clamped = isRTL ? Math.max(0, diff) : Math.min(0, diff);
    currentX.current = clamped;
    setOffsetX(clamped);
  }, [isRTL]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    const dismissed_threshold = isRTL ? currentX.current > THRESHOLD : currentX.current < -THRESHOLD;
    if (dismissed_threshold) {
      setDismissed(true);
      setTimeout(() => onDismiss(notification.id), 250);
    } else {
      setOffsetX(0);
    }
  }, [notification.id, onDismiss, isRTL]);

  // Also support pointer events for desktop testing
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only for non-touch (mouse fallback)
    if (e.pointerType === "touch") return;
    startX.current = e.clientX;
    currentX.current = 0;
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "touch" || !isDragging.current) return;
    const diff = e.clientX - startX.current;
    const clamped = isRTL ? Math.max(0, diff) : Math.min(0, diff);
    currentX.current = clamped;
    setOffsetX(clamped);
  }, [isRTL]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    isDragging.current = false;
    const dismissed_threshold = isRTL ? currentX.current > THRESHOLD : currentX.current < -THRESHOLD;
    if (dismissed_threshold) {
      setDismissed(true);
      setTimeout(() => onDismiss(notification.id), 250);
    } else {
      setOffsetX(0);
    }
  }, [notification.id, onDismiss, isRTL]);

  const showDeleteBg = Math.abs(offsetX) > 20;
  const deleteOpacity = Math.min(1, Math.abs(offsetX) / THRESHOLD);

  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: dismissed ? "0px" : "auto",
        opacity: dismissed ? 0 : 1,
        transition: dismissed ? "height 0.25s ease, opacity 0.2s ease" : undefined,
      }}
    >
      {/* Red delete background revealed on swipe */}
      {showDeleteBg && (
        <div
          className={`absolute inset-0 flex items-center ${isRTL ? "justify-start" : "justify-end"}`}
          style={{
            backgroundColor: "#D10044",
            border: `2px solid ${theme.surface}`,
            padding: "0 5px",
            opacity: deleteOpacity,
          }}
        >
          <Trash2 size={20} style={{ color: "#fff" }} />
        </div>
      )}

      {/* Swipeable content row */}
      <div
        ref={rowRef}
        className="relative flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
        style={{
          padding: "14px 16px",
          borderRadius: "14px",
          backgroundColor: notification.read ? theme.surfaceElevated : theme.primarySubtle,
          transform: `translateX(${offsetX}px)`,
          transition: isDragging.current ? "none" : "transform 0.25s ease, scale 0.2s ease",
          touchAction: "pan-y",
          userSelect: "none",
        }}
        onClick={(e) => {
          // Only trigger if not dragging significantly
          if (Math.abs(offsetX) < 10) {
            onClick(notification);
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Unread dot */}
        {!notification.read && (
          <div
            className="absolute"
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: theme.primary,
              [isRTL ? "right" : "left"]: "5px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
        )}

        {/* Icon */}
        <div
          className="shrink-0 flex items-center justify-center"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            backgroundColor: theme.primarySubtle,
          }}
        >
          <NotifIcon type={notification.iconType} />
        </div>

        {/* Text */}
        <span
          className="flex-1 min-w-0"
          style={{
            fontFamily: fontFamily,
            ...TEXT_STYLE.body,
            fontSize: "14.5px",
            fontWeight: notification.read ? 500 : 600,
            color: notification.read ? theme.textMuted : theme.textHeading,
            lineHeight: "20px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {t(notification.textKey)}
        </span>

        {/* Time */}
        <span
          className="shrink-0"
          style={{
            fontFamily: theme.fontFamily,
            ...TEXT_STYLE.caption,
            fontSize: "12.5px",
            color: theme.textDisabled,
          }}
        >
          {notification.time}
        </span>
      </div>
    </div>
  );
}

/* ─── Order Status Helpers ─── */
const ORDER_STATUS_NOTIF: Record<OrderStatus, { textKey: { en: string; ar: string }; icon: typeof ChefHat; color: string }> = {
  "preparing":     { textKey: { en: "Your meal is being prepared by the kitchen", ar: "يتم تحضير وجبتك في المطبخ" }, icon: ChefHat, color: "#F59E0B" },
  "quality-check": { textKey: { en: "Your meal is undergoing a quality check", ar: "وجبتك تخضع لفحص الجودة" }, icon: Heart, color: "#3B82F6" },
  "delivering":    { textKey: { en: "Your meal is on the way to your room", ar: "وجبتك في الطريق إلى غرفتك" }, icon: Utensils, color: "#8B5CF6" },
  "delivered":     { textKey: { en: "Your meal has been delivered. Enjoy!", ar: "تم توصيل وجبتك. بالعافية!" }, icon: Check, color: "#22C55E" },
};

/* ─── Main Panel ─── */
export function NotificationsPanel({ 
  onClose, 
  acknowledgedBroadcasts = [],
  onNotificationClick,
}: { 
  onClose: () => void; 
  acknowledgedBroadcasts?: BroadcastNotification[];
  onNotificationClick: (notif: Notification) => void;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const { theme } = useTheme();
  const { t, isRTL, fontFamily } = useLocale();
  const { activeOrders } = useOrders();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div
      className="absolute inset-0 z-50 flex justify-end"
      style={{ animation: "notifFadeIn 0.2s ease-out" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(10,22,40,0.45)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative h-full flex flex-col"
        style={{
          width: "480px",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          backgroundColor: theme.panelBg,
          [isRTL ? "borderRight" : "borderLeft"]: `1px solid ${theme.borderSubtle}`,
          boxShadow: `${isRTL ? "8px" : "-8px"} 0 40px rgba(0,0,0,0.12)`,
          animation: "notifSlideIn 0.25s ease-out",
        }}
      >
        {/* Header */}
        <div
          className="shrink-0 flex items-center justify-between"
          style={{ padding: "24px 24px 16px 24px" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center relative"
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: theme.primarySubtle,
              }}
            >
              <Bell size={22} style={{ color: theme.primary }} />
              {unreadCount > 0 && (
                <div
                  className="absolute flex items-center justify-center"
                  style={{
                    top: "-4px",
                    right: "-4px",
                    minWidth: "20px",
                    height: "20px",
                    borderRadius: "10px",
                    backgroundColor: "#D10044",
                    border: `2px solid ${theme.panelBg}`,
                    padding: "0 5px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: theme.fontFamily,
                      fontSize: "11px",
                      fontWeight: WEIGHT.bold,
                      color: "#fff",
                      lineHeight: "11px",
                    }}
                  >
                    {unreadCount}
                  </span>
                </div>
              )}
            </div>
            <span
              style={{
                fontFamily: theme.fontFamily,
                ...TEXT_STYLE.pageTitle,
                fontSize: "22px",
                color: theme.textHeading,
                letterSpacing: "-0.3px",
              }}
            >
              {t("notif.title")}
            </span>
          </div>
          {/* Close — 48×48 touch target */}
          <button
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
            style={{
              width: "48px",
              height: "48px",
              borderRadius: theme.radiusLg,
              backgroundColor: theme.tileInactiveBg,
              border: "none",
            }}
          >
            <X size={22} style={{ color: theme.iconDefault }} />
          </button>
        </div>

        {/* Action bar */}
        {notifications.length > 0 && (
          <div
            className="shrink-0 flex items-center justify-between"
            style={{ padding: "0 16px 8px 16px" }}
          >
            <button
              onClick={markAllRead}
              className="cursor-pointer active:scale-[0.96] transition-transform flex items-center justify-center"
              style={{
                fontFamily: theme.fontFamily,
                ...TEXT_STYLE.label,
                fontSize: "13.5px",
                fontWeight: WEIGHT.bold,
                color: unreadCount > 0 ? theme.primary : theme.textDisabled,
                border: "none",
                background: unreadCount > 0 ? theme.primarySubtle : "none",
                padding: "10px 16px",
                borderRadius: "12px",
                minHeight: "44px",
              }}
            >
              {t("notif.markAllRead")}
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-2 cursor-pointer active:scale-[0.96] transition-transform"
              style={{
                fontFamily: fontFamily,
                ...TEXT_STYLE.label,
                fontSize: "13.5px",
                fontWeight: WEIGHT.bold,
                color: theme.textMuted,
                border: "none",
                background: theme.tileInactiveBg,
                padding: "10px 16px",
                borderRadius: "12px",
                minHeight: "44px",
              }}
            >
              <Trash2 size={14} />
              {t("notif.clearAll")}
            </button>
          </div>
        )}

        {/* Swipe hint */}
        {notifications.length > 0 && (
          <div
            className="shrink-0 flex items-center justify-center gap-1.5"
            style={{ padding: "2px 24px 10px 24px" }}
          >
            <span
              style={{
                fontFamily: theme.fontFamily,
                fontSize: "11px",
                fontWeight: WEIGHT.medium,
                color: theme.textDisabled,
                letterSpacing: "0.2px",
              }}
            >
              {t("notif.swipeHint")}
            </span>
            <span style={{ color: theme.textDisabled, fontSize: "11px" }}>{isRTL ? "\u2192" : "\u2190"}</span>
          </div>
        )}

        {/* Active Order Tracking */}
        {activeOrders.length > 0 && (
          <div className="shrink-0 flex flex-col gap-2" style={{ padding: "0 12px 8px 12px" }}>
            <span
              style={{
                fontFamily: theme.fontFamily,
                ...TEXT_STYLE.label,
                fontSize: "12px",
                fontWeight: WEIGHT.bold,
                color: theme.textMuted,
                letterSpacing: "0.5px",
                textTransform: "uppercase" as const,
                padding: "0 4px",
              }}
            >
              {isRTL ? "تتبع الطلبات" : "ORDER TRACKING"}
            </span>
            {activeOrders.map((order) => {
              const cfg = ORDER_STATUS_NOTIF[order.status];
              const StatusIcon = cfg.icon;
              const loc = (v: { en: string; ar: string }) => isRTL ? v.ar : v.en;
              return (
                <div
                  key={order.id}
                  className="flex items-center gap-3"
                  style={{
                    padding: "14px 16px",
                    borderRadius: "14px",
                    backgroundColor: `${cfg.color}10`,
                    border: `1px solid ${cfg.color}25`,
                  }}
                >
                  <div
                    className="shrink-0 flex items-center justify-center"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: `${cfg.color}18`,
                    }}
                  >
                    <StatusIcon size={20} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      style={{
                        fontFamily: fontFamily,
                        ...TEXT_STYLE.body,
                        fontSize: "14.5px",
                        fontWeight: WEIGHT.semibold,
                        color: theme.textHeading,
                        lineHeight: "20px",
                        display: "block",
                      }}
                    >
                      {loc(cfg.textKey)}
                    </span>
                    <span
                      style={{
                        fontFamily: fontFamily,
                        ...TEXT_STYLE.caption,
                        fontSize: "12px",
                        color: theme.textMuted,
                        display: "block",
                        marginTop: "2px",
                      }}
                    >
                      {order.orderNumber} · {order.items.map((it) => `${it.quantity}x ${loc(it.name)}`).join(", ")}
                    </span>
                  </div>
                  <span
                    className="shrink-0"
                    style={{
                      fontFamily: theme.fontFamily,
                      ...TEXT_STYLE.caption,
                      fontSize: "12px",
                      fontWeight: WEIGHT.bold,
                      color: cfg.color,
                      padding: "4px 10px",
                      borderRadius: "8px",
                      backgroundColor: `${cfg.color}12`,
                    }}
                  >
                    {order.estimatedDelivery}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Notifications list */}
        <div
          className="flex-1 overflow-y-auto flex flex-col gap-1.5"
          style={{ padding: "4px 12px 24px 12px", scrollbarWidth: "none" }}
        >
          {/* Hospital Broadcasts Section */}
          {acknowledgedBroadcasts.length > 0 && (
            <div className="flex flex-col gap-2" style={{ marginBottom: "8px" }}>
              <span
                style={{
                  fontFamily: theme.fontFamily,
                  ...TEXT_STYLE.label,
                  fontSize: "12px",
                  fontWeight: WEIGHT.bold,
                  color: theme.textMuted,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase" as const,
                  padding: "4px 4px 0",
                }}
              >
                {isRTL ? "إشعارات المستشفى" : "HOSPITAL NOTICES"}
              </span>
              {acknowledgedBroadcasts.map((bc) => {
                const loc = (v: { en: string; ar: string }) => isRTL ? v.ar : v.en;
                const priorityColor = bc.priority === "urgent" ? "#D10044" : bc.priority === "warning" ? "#F59E0B" : "#3B82F6";
                return (
                  <div
                    key={bc.id}
                    className="flex items-start gap-3"
                    style={{
                      padding: "14px 16px",
                      borderRadius: "14px",
                      backgroundColor: `${priorityColor}08`,
                      border: `1px solid ${priorityColor}20`,
                    }}
                  >
                    <div
                      className="shrink-0 flex items-center justify-center"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        backgroundColor: `${priorityColor}12`,
                        marginTop: "2px",
                      }}
                    >
                      <Megaphone size={20} style={{ color: priorityColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        style={{
                          fontFamily: fontFamily,
                          ...TEXT_STYLE.subtitle,
                          fontSize: "14.5px",
                          color: theme.textHeading,
                          lineHeight: "20px",
                          display: "block",
                        }}
                      >
                        {loc(bc.title)}
                      </span>
                      <span
                        style={{
                          fontFamily: fontFamily,
                          ...TEXT_STYLE.caption,
                          fontSize: "13px",
                          color: theme.textMuted,
                          lineHeight: "18px",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical" as const,
                          overflow: "hidden",
                          marginTop: "4px",
                        }}
                      >
                        {loc(bc.body)}
                      </span>
                      <div className="flex items-center gap-2" style={{ marginTop: "6px" }}>
                        <Check size={12} style={{ color: theme.success }} />
                        <span
                          style={{
                            fontFamily: fontFamily,
                            fontSize: "11px",
                            fontWeight: WEIGHT.medium,
                            color: theme.textDisabled,
                          }}
                        >
                          {isRTL ? `تم الاطلاع ${bc.acknowledgedAt}` : `Acknowledged ${bc.acknowledgedAt}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {notifications.length === 0 && activeOrders.length === 0 && acknowledgedBroadcasts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div
                className="flex items-center justify-center"
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "20px",
                  backgroundColor: theme.primarySubtle,
                }}
              >
                <Bell size={32} style={{ color: theme.textDisabled }} />
              </div>
              <div className="text-center">
                <span
                  style={{
                    fontFamily: theme.fontFamily,
                    ...TEXT_STYLE.subtitle,
                    color: theme.textHeading,
                    display: "block",
                  }}
                >
                  {t("notif.allCaughtUp")}
                </span>
                <span
                  style={{
                    fontFamily: theme.fontFamily,
                    ...TEXT_STYLE.caption,
                    color: theme.textMuted,
                    display: "block",
                    marginTop: "4px",
                  }}
                >
                  {t("notif.noNew")}
                </span>
              </div>
            </div>
          ) : (
            notifications.map((notif) => (
              <SwipeableRow
                key={notif.id}
                notification={notif}
                onDismiss={dismissNotification}
                onClick={onNotificationClick}
              />
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes notifFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes notifSlideIn {
          from { transform: translateX(${isRTL ? "-100%" : "100%"}); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}