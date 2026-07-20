import { CSSProperties, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HandHelping, Wrench, ClipboardList,
  CheckCircle2, Clock, X, Send, Inbox, Globe,
  // Unified Patient Services icon set — clean, outlined, single-stroke lucide
  // glyphs replacing the old emoji illustrations (matches Entertainment / Home).
  BedDouble, GlassWater, BedSingle, Shirt, SprayCan, Layers, Footprints,
  AirVent, Lightbulb, Tv, ShowerHead, Plug,
  createLucideIcon, type LucideIcon,
} from "lucide-react";
import { useTheme, TYPE_SCALE, WEIGHT, TEXT_STYLE, SHADOW, SPACE, LEADING } from "./ThemeContext";
import { useLocale } from "./i18n";
import { InternalPageHeader } from "./InternalPageHeader";
import { ApiImage } from "./ApiImage";

/* ── Housekeeping product photos ── */
import imgBlanket from "../../assets/Housekeeping/blanket.png";
import imgWater from "../../assets/Housekeeping/water.png";
import imgPillow from "../../assets/Housekeeping/pillow.png";
import imgTowel from "../../assets/Housekeeping/towels.png";
import imgToiletries from "../../assets/Housekeeping/toiletries.png";
import imgTissues from "../../assets/Housekeeping/tissues.png";
import imgSheets from "../../assets/Housekeeping/bedsheets.png";
import imgSlippers from "../../assets/Housekeeping/slippers.png";

/**
 * Patient Services — "I Need Something" flow.
 *
 * Reachable from every layout via the Housekeeping / "I Need Something" action.
 * Its visual language deliberately mirrors the Meal Ordering module
 * (FoodOrdering.tsx): a brand-gradient canvas, a white internal page header, a
 * large rounded white content card, icon-led white sub-cards with soft borders
 * and hover lift, pill navigation tabs, and modern dialogs.
 *
 * Branding rule (same as Layout 1 / Layout 2): every colour, font and asset is
 * inherited from the active Hospital Config token system — nothing is
 * hardcoded. Semantic status colours use the theme's success / warning tokens
 * rather than literal green / amber, so they re-theme per hospital.
 *
 * There is no backend: each request is persisted to localStorage and its status
 * is derived from how long ago it was created, so the list looks alive.
 */

/* localStorage key — patient's own service requests for the "I Need Something" flow. */
const STORAGE_KEY = "careinn-need-requests";

interface NeedRequest {
  id: string;
  kind: "request" | "report";
  itemKey: string; // i18n key, e.g. "need.item.blanket"
  emoji: string;
  note: string;
  createdAt: number; // epoch ms
}

/* Tissue box with a tissue sheet protruding from the top. lucide-react has no
   tissue/napkin glyph, so this is authored via createLucideIcon — it renders as
   a genuine LucideIcon, inheriting the same viewBox, round caps/joins, and the
   stroke/size/color/strokeWidth props as every other icon in the set. */
const TissueBox: LucideIcon = createLucideIcon("TissueBox", [
  ["path", { d: "M8.5 11 L9.5 6.5 L12 8 L14.5 6.5 L15.5 11", key: "sheet" }],
  ["rect", { x: "3", y: "11", width: "18", height: "9", rx: "2", key: "box" }],
]);

interface CardDef {
  key: string; // i18n label key
  emoji: string; // retained for back-compat with requests persisted before the redesign
  Icon: LucideIcon; // unified vector icon shown in the light-blue container
  image?: string; // optional product photo — replaces the icon box in the grid
}

const REQUEST_ITEMS: CardDef[] = [
  { key: "need.item.blanket", emoji: "🛏️", Icon: BedDouble, image: imgBlanket },
  { key: "need.item.water", emoji: "💧", Icon: GlassWater, image: imgWater },
  { key: "need.item.pillow", emoji: "🧸", Icon: BedSingle, image: imgPillow },
  { key: "need.item.towel", emoji: "🧺", Icon: Shirt, image: imgTowel },
  { key: "need.item.toiletries", emoji: "🧼", Icon: SprayCan, image: imgToiletries },
  { key: "need.item.tissues", emoji: "🧻", Icon: TissueBox, image: imgTissues },
  { key: "need.item.sheets", emoji: "🛌", Icon: Layers, image: imgSheets },
  { key: "need.item.slippers", emoji: "🩴", Icon: Footprints, image: imgSlippers },
];

const REPORT_ITEMS: CardDef[] = [
  { key: "need.issue.ac", emoji: "❄️", Icon: AirVent },
  { key: "need.issue.lights", emoji: "💡", Icon: Lightbulb },
  { key: "need.issue.tv", emoji: "📺", Icon: Tv },
  { key: "need.issue.bed", emoji: "🛏️", Icon: BedDouble },
  { key: "need.issue.bathroom", emoji: "🚿", Icon: ShowerHead },
  { key: "need.issue.power", emoji: "🔌", Icon: Plug },
];

/* Look up the unified icon for a persisted request by its i18n item key, so the
   "My Requests" list and dialogs render the same vector set as the grid cards. */
const ICON_BY_KEY: Record<string, LucideIcon> = Object.fromEntries(
  [...REQUEST_ITEMS, ...REPORT_ITEMS].map((c) => [c.key, c.Icon]),
);

/* ── Status: derived from elapsed time (no backend). ── */
type StatusKey = "sent" | "preparing" | "onway" | "delivered";

function deriveStatus(createdAt: number, now: number): StatusKey {
  const mins = (now - createdAt) / 60000;
  if (mins < 2) return "sent";
  if (mins < 8) return "preparing";
  if (mins < 20) return "onway";
  return "delivered";
}

interface NeedSomethingProps {
  onClose: () => void;
}

type Tab = "request" | "report" | "mine";

export function NeedSomething({ onClose }: NeedSomethingProps) {
  const { theme, setLocale } = useTheme();
  const { t, isRTL, fontFamily, locale } = useLocale();

  /* Header language switcher — same en/ar toggle behaviour as the global TopBar
     and the Meal Ordering module, so patients can flip language without leaving
     the page. Any non-English locale (ar/ur) returns to English. */
  const toggleLanguage = () => setLocale(locale === "en" ? "ar" : "en");

  /* ── Semantic status styles — all from theme tokens, so they re-theme ── */
  /* Friendly status display. Colours are intentionally config-independent
     (gray / blue / orange / green) so a patient reads the same status the same
     way on every hospital: success & warning are already constant theme tokens,
     info is the blue token, textMuted is the neutral gray. */
  const STATUS_STYLE: Record<StatusKey, { fg: string; emoji: string }> = {
    sent: { fg: theme.textMuted, emoji: "🟢" },
    preparing: { fg: theme.info, emoji: "👩‍⚕️" },
    onway: { fg: theme.warning, emoji: "🚶" },
    delivered: { fg: theme.success, emoji: "✅" },
  };

  /* ── View state ── */
  const [tab, setTab] = useState<Tab>("request");
  const [selected, setSelected] = useState<{ card: CardDef; kind: "request" | "report" } | null>(null);
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState<null | "request" | "report">(null);

  /* ── Persisted requests + time-derived status ── */
  const [requests, setRequests] = useState<NeedRequest[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }, [requests]);

  /* Re-derive statuses periodically so the list progresses while it's open. */
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  /* Auto-return to My Requests 3s after the success screen appears. */
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!success) return;
    successTimer.current = setTimeout(() => {
      setSuccess(null);
      setTab("mine");
    }, 3000);
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    };
  }, [success]);

  const openSheet = (card: CardDef, kind: "request" | "report") => {
    setSelected({ card, kind });
    setNote("");
  };

  const closeSheet = () => {
    setSelected(null);
    setNote("");
  };

  const sendRequest = () => {
    if (!selected) return;
    const entry: NeedRequest = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind: selected.kind,
      itemKey: selected.card.key,
      emoji: selected.card.emoji,
      note: note.trim(),
      createdAt: Date.now(),
    };
    setRequests((prev) => [entry, ...prev]);
    const kind = selected.kind;
    setSelected(null);
    setNote("");
    setSuccess(kind);
  };

  const backToMine = () => {
    if (successTimer.current) clearTimeout(successTimer.current);
    setSuccess(null);
    setTab("mine");
  };

  /* Relative day + clock time, e.g. "Today at 4:51 PM", "Yesterday at 11:46 AM",
     "12 Jul at 4:51 PM" (never the year). Display-only. */
  const bcp47 = locale === "ar" ? "ar" : locale === "ur" ? "ur-PK" : "en-US";
  const formatDateTime = (createdAt: number): string => {
    const d = new Date(createdAt);
    const time = d.toLocaleTimeString(bcp47, { hour: "numeric", minute: "2-digit", hour12: true });
    const startOfDay = (ms: number) => {
      const x = new Date(ms);
      return new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    };
    const diffDays = Math.round((startOfDay(now) - startOfDay(createdAt)) / 86400000);
    if (diffDays <= 0) return t("need.rel.todayAt", time);
    if (diffDays === 1) return t("need.rel.yesterdayAt", time);
    const dateStr = `${d.getDate()} ${d.toLocaleDateString(bcp47, { month: "short" })}`;
    return t("need.rel.dateAt", dateStr, time);
  };

  /* Reference number derived deterministically from the request (no backend):
     WO-YYYYMM + a stable 4-char code, so old and new entries both show one. */
  const refFor = (r: NeedRequest): string => {
    const d = new Date(r.createdAt);
    const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
    let hash = 0;
    for (let i = 0; i < r.id.length; i++) hash = (hash * 31 + r.id.charCodeAt(i)) >>> 0;
    const code = hash.toString(36).toUpperCase().slice(-4).padStart(4, "0");
    return `WO-${ym}${code}`;
  };

  const statusLabel = (kind: NeedRequest["kind"], status: StatusKey): string => {
    if (kind === "report" && status === "delivered") return t("need.status.fixed");
    return t(`need.status.${status}`);
  };

  const gridItems = tab === "report" ? REPORT_ITEMS : REQUEST_ITEMS;
  const gridKind: "request" | "report" = tab === "report" ? "report" : "request";

  const tabs: { key: Tab; Icon: typeof HandHelping; label: string; count?: number }[] = [
    { key: "request", Icon: HandHelping, label: t("need.tab.request") },
    { key: "report", Icon: Wrench, label: t("need.tab.report") },
    { key: "mine", Icon: ClipboardList, label: t("need.tab.mine"), count: requests.length },
  ];

  const titleKey =
    tab === "mine" ? "need.title.mine" : tab === "report" ? "need.title.report" : "need.title.request";
  const subKey = tab === "report" ? "need.sub.report" : "need.sub.request";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      dir={isRTL ? "rtl" : "ltr"}
      className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
        fontFamily,
        // CSS vars used by the hover/focus rules below (keeps colours brand-driven)
        ["--ns-primary" as any]: theme.primary,
      } as CSSProperties}
    >
      {/* Subtle hospital hero photo — consistent with other internal pages */}
      <ApiImage
        src={theme.heroImageUrl}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        style={{ opacity: 0.08, mixBlendMode: "luminosity", userSelect: "none" }}
      />

      <style>{`
        .ns-card { transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease; }
        .ns-card:hover { border-color: var(--ns-primary); box-shadow: ${SHADOW.md}; transform: translateY(-4px); }
        .ns-card:active { transform: scale(0.985); }
        .ns-card img { transition: transform .4s cubic-bezier(.25,.46,.45,.94); }
        .ns-card:hover img { transform: scale(1.06); }
        .ns-iconbox { transition: background-color .2s ease; }
        .ns-card:hover .ns-iconbox { background-color: color-mix(in srgb, var(--ns-primary) 18%, #fff); }
        .ns-textarea::placeholder { color: ${theme.textDisabled}; }
        .ns-textarea:focus { border-color: var(--ns-primary) !important; }
        .ns-scroll::-webkit-scrollbar { width: 10px; }
        .ns-scroll::-webkit-scrollbar-track { background: transparent; }
        .ns-scroll::-webkit-scrollbar-thumb { background: ${theme.borderDefault}; border-radius: 100px; border: 3px solid transparent; background-clip: content-box; }
        @keyframes nsSpin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ─── Header (white text on brand gradient) ─── */}
      <InternalPageHeader
        title={t("need.header.title")}
        subtitle={t("need.header.subtitle")}
        icon={<HandHelping size={24} />}
        onClose={onClose}
        rightAction={
          <button
            onClick={toggleLanguage}
            aria-label={t("settings.language")}
            className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "12px",
              padding: "10px 16px",
              color: "#fff",
              outline: "none",
            }}
          >
            <Globe size={20} />
            <span
              style={{
                ...TEXT_STYLE.buttonSm,
                /* Label is the target-language endonym: render it in that
                   language's brand font (Arabic when currently in English). */
                fontFamily: locale === "en" ? theme.fontFamilyAr : fontFamily,
                color: "#fff",
              }}
            >
              {t("need.header.language")}
            </span>
          </button>
        }
      />

      {/* ─── Main content — large white rounded card ─── */}
      <div className="flex-1 min-h-0 px-12 pt-2 pb-8 relative z-10 flex flex-col">
        {success ? (
          /* Success — lives in the same white card as every other page */
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-8 py-10"
            style={{
              backgroundColor: theme.surface,
              borderRadius: theme.radiusXl,
              boxShadow: SHADOW.xl,
              border: theme.cardBorder,
            }}
          >
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="flex items-center justify-center"
              style={{
                width: 132,
                height: 132,
                borderRadius: theme.radiusFull,
                backgroundColor: theme.successSubtle,
                marginBottom: SPACE[3],
              }}
            >
              <CheckCircle2 size={72} color={theme.success} strokeWidth={2} />
            </motion.div>
            <h2 style={{ ...TEXT_STYLE.display, fontFamily, fontSize: TYPE_SCALE["2xl"], color: theme.textHeading }}>
              {t("need.success.title")}
            </h2>
            <p style={{ ...TEXT_STYLE.subtitle, fontFamily, color: theme.primary, marginTop: 8 }}>
              {success === "report" ? t("need.success.subtitleReport") : t("need.success.subtitle")}
            </p>
            <p style={{ ...TEXT_STYLE.body, fontFamily, color: theme.textMuted, marginTop: 6, maxWidth: 440, lineHeight: LEADING.relaxed }}>
              {t("need.success.body")}
            </p>
            <button
              onClick={backToMine}
              className="flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] transition-transform"
              style={{
                marginTop: SPACE[4],
                height: 62,
                padding: "0 40px",
                borderRadius: theme.radiusMd,
                backgroundColor: theme.primary,
                border: "none",
                boxShadow: SHADOW.md,
                outline: "none",
              }}
            >
              <ClipboardList size={22} color={theme.textInverse} strokeWidth={2.4} />
              <span style={{ ...TEXT_STYLE.button, fontFamily, color: theme.textInverse }}>
                {t("need.success.back")}
              </span>
            </button>
          </motion.div>
        ) : (
        <div
          className="flex-1 min-h-0 flex flex-col overflow-hidden"
          style={{
            backgroundColor: theme.surface,
            borderRadius: theme.radiusXl,
            boxShadow: SHADOW.xl,
            border: theme.cardBorder,
          }}
        >
          {/* Tabs strip */}
          <div
            className="shrink-0 flex items-center gap-3 flex-wrap px-8 pt-7 pb-5"
            style={{ borderBottom: `1px solid ${theme.borderSubtle}` }}
          >
            {tabs.map((tb) => {
              const active = tab === tb.key;
              const TIcon = tb.Icon;
              return (
                <button
                  key={tb.key}
                  onClick={() => setTab(tb.key)}
                  className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
                  style={{
                    padding: "13px 22px",
                    borderRadius: theme.radiusFull,
                    backgroundColor: active ? theme.primary : theme.surface,
                    border: active ? "1px solid transparent" : `1px solid ${theme.borderDefault}`,
                    outline: "none",
                    boxShadow: active ? SHADOW.sm : "none",
                  }}
                >
                  <TIcon size={20} color={active ? theme.textInverse : theme.textMuted} strokeWidth={2.2} />
                  <span
                    style={{
                      ...TEXT_STYLE.buttonSm,
                      fontFamily,
                      color: active ? theme.textInverse : theme.textMuted,
                    }}
                  >
                    {tb.label}
                  </span>
                  {tb.count !== undefined && tb.count > 0 && (
                    <span
                      style={{
                        minWidth: 26,
                        height: 26,
                        padding: "0 8px",
                        borderRadius: theme.radiusFull,
                        backgroundColor: active ? "rgba(255,255,255,0.22)" : theme.primarySubtle,
                        color: active ? theme.textInverse : theme.primary,
                        fontFamily,
                        fontSize: TYPE_SCALE.sm,
                        fontWeight: WEIGHT.bold,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {tb.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Body */}
          <div className="ns-scroll flex-1 min-h-0 overflow-y-auto px-8 py-7 flex flex-col">
            {/* Section heading */}
            <div className="shrink-0 mb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 style={{ ...TEXT_STYLE.pageTitle, fontFamily, color: theme.textHeading }}>
                  {t(titleKey)}
                </h3>
                {/* Quick shortcut to the Report an Issue tab — inline pill next to the
                    title. Hidden when already on that tab so it never points at itself. */}
                {tab !== "report" && (
                  <button
                    onClick={() => setTab("report")}
                    className="inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-[transform,background-color]"
                    style={{
                      padding: "5px 12px",
                      borderRadius: theme.radiusFull,
                      backgroundColor: theme.errorSubtle,
                      border: `1px solid color-mix(in srgb, ${theme.error} 35%, transparent)`,
                      color: theme.error,
                      outline: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${theme.error} 14%, transparent)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.errorSubtle;
                    }}
                  >
                    <Wrench size={15} color={theme.error} strokeWidth={2.4} />
                    <span style={{ ...TEXT_STYLE.buttonSm, fontFamily, color: theme.error }}>
                      {t("need.tab.report")}
                    </span>
                  </button>
                )}
              </div>
              {tab !== "mine" && (
                <p style={{ ...TEXT_STYLE.body, fontFamily, color: theme.textMuted, marginTop: 4 }}>
                  {t(subKey)}
                </p>
              )}
            </div>

            {tab === "mine" ? (
              requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center gap-4 min-h-[360px]">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: theme.radiusFull,
                      backgroundColor: theme.primarySubtle,
                    }}
                  >
                    <Inbox size={44} color={theme.primary} strokeWidth={1.8} />
                  </div>
                  <p style={{ ...TEXT_STYLE.sectionTitle, fontFamily, color: theme.textHeading }}>
                    {t("need.empty.title")}
                  </p>
                  <p style={{ ...TEXT_STYLE.body, fontFamily, color: theme.textMuted, maxWidth: 420 }}>
                    {t("need.empty.body")}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {requests.map((r) => {
                    const status = deriveStatus(r.createdAt, now);
                    const st = STATUS_STYLE[status];
                    const isComplaint = r.kind === "report";
                    const typeColor = isComplaint ? theme.accent : theme.primary;
                    const RowIcon = ICON_BY_KEY[r.itemKey];
                    return (
                      <div
                        key={r.id}
                        className="flex items-center gap-5"
                        style={{
                          backgroundColor: theme.surface,
                          borderRadius: theme.radiusLg,
                          border: `1px solid ${theme.borderDefault}`,
                          padding: "18px 22px",
                        }}
                      >
                        <div
                          className="shrink-0 flex items-center justify-center"
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: theme.radiusMd,
                            backgroundColor: theme.primaryLight,
                            fontSize: 30,
                            lineHeight: 1,
                          }}
                        >
                          {RowIcon ? (
                            <RowIcon size={30} color={theme.primary} strokeWidth={1.8} />
                          ) : (
                            r.emoji
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span
                            className="inline-flex items-center mb-1.5"
                            style={{
                              padding: "3px 12px",
                              borderRadius: theme.radiusFull,
                              backgroundColor: `color-mix(in srgb, ${typeColor} 14%, transparent)`,
                              color: typeColor,
                              fontFamily,
                              fontSize: TYPE_SCALE.sm,
                              fontWeight: WEIGHT.bold,
                              letterSpacing: "0.6px",
                              textTransform: "uppercase",
                              lineHeight: 1.35,
                            }}
                          >
                            {isComplaint ? t("need.type.complaint") : t("need.type.request")}
                          </span>
                          <p style={{ ...TEXT_STYLE.cardTitle, fontFamily, color: theme.textHeading }}>
                            {t(r.itemKey)}
                          </p>
                          {r.note ? (
                            <p
                              className="truncate"
                              style={{ ...TEXT_STYLE.caption, fontFamily, color: theme.textMuted, marginTop: 3 }}
                            >
                              “{r.note}”
                            </p>
                          ) : null}
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Clock size={14} color={theme.textDisabled} />
                            <span style={{ ...TEXT_STYLE.caption, fontFamily, color: theme.textMuted }}>
                              {t("need.requestedOn")} {formatDateTime(r.createdAt)}
                            </span>
                          </div>
                          <span
                            style={{
                              display: "block",
                              marginTop: 4,
                              fontFamily,
                              fontSize: TYPE_SCALE.sm,
                              fontWeight: WEIGHT.normal,
                              color: theme.textDisabled,
                              letterSpacing: "0.2px",
                            }}
                          >
                            {t("need.ref", refFor(r))}
                          </span>
                        </div>
                        <div
                          className="shrink-0 flex items-center gap-2.5"
                          style={{
                            padding: "12px 22px",
                            borderRadius: theme.radiusFull,
                            backgroundColor: `color-mix(in srgb, ${st.fg} 16%, transparent)`,
                            border: `1.5px solid color-mix(in srgb, ${st.fg} 32%, transparent)`,
                          }}
                        >
                          <span style={{ fontSize: 18, lineHeight: 1 }}>{st.emoji}</span>
                          <span
                            style={{
                              fontFamily,
                              fontSize: TYPE_SCALE.base,
                              fontWeight: WEIGHT.bold,
                              color: st.fg,
                              whiteSpace: "nowrap",
                              lineHeight: 1,
                            }}
                          >
                            {statusLabel(r.kind, status)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <div
                  className="grid w-full"
                  style={{
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gridTemplateRows: "repeat(2, 1fr)",
                    columnGap: "24px",
                    rowGap: "28px",
                    maxHeight: "82%",
                    height: "100%",
                    maxWidth: "100%",
                  }}
                >
                {gridItems.map((card) => {
                  const CardIcon = card.Icon;
                  return (
                    <button
                      key={card.key}
                      onClick={() => openSheet(card, gridKind)}
                      className="ns-card flex flex-col items-stretch cursor-pointer"
                      style={{
                        backgroundColor: theme.surface,
                        borderRadius: theme.radiusCard,
                        border: `1.5px solid ${theme.borderDefault}`,
                        boxShadow: SHADOW.sm,
                        padding: 0,
                        outline: "none",
                        overflow: "hidden",
                        minHeight: 0,
                      }}
                    >
                      {card.image ? (
                        /* Product photo — fills the top of the card, flexes to available height */
                        <div
                          style={{
                            flex: 1,
                            minHeight: 0,
                            overflow: "hidden",
                            backgroundColor: "#f5f5f5",
                          }}
                        >
                          <img
                            src={card.image}
                            alt={t(card.key)}
                            loading="lazy"
                            draggable={false}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        </div>
                      ) : (
                        /* Fallback icon box (Report an Issue items) */
                        <div
                          className="ns-iconbox flex items-center justify-center"
                          style={{
                            flex: 1,
                            minHeight: 0,
                            backgroundColor: theme.primaryLight,
                          }}
                        >
                          <CardIcon size={48} color={theme.primary} strokeWidth={1.8} />
                        </div>
                      )}
                      <span
                        className="shrink-0 text-center"
                        style={{
                          ...TEXT_STYLE.cardTitle,
                          fontFamily,
                          color: theme.textHeading,
                          padding: "14px 8px 16px",
                        }}
                      >
                        {t(card.key)}
                      </span>
                    </button>
                  );
                })}
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* ─── Notes dialog ─── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center px-8"
            style={{ backgroundColor: theme.overlay }}
            onClick={closeSheet}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              dir={isRTL ? "rtl" : "ltr"}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 600,
                maxWidth: "100%",
                backgroundColor: theme.surface,
                borderRadius: theme.radiusXl,
                boxShadow: SHADOW["2xl"],
                border: theme.cardBorder,
                padding: SPACE[4],
              }}
            >
              {/* Header: item + prompt */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: theme.radiusMd,
                    backgroundColor: theme.primaryLight,
                    fontSize: 34,
                    lineHeight: 1,
                  }}
                >
                  <selected.card.Icon size={34} color={theme.primary} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ ...TEXT_STYLE.sectionTitle, fontFamily, color: theme.textHeading }}>
                    {t(selected.card.key)}
                  </p>
                  <p style={{ ...TEXT_STYLE.body, fontFamily, color: theme.textMuted, marginTop: 2 }}>
                    {t("need.notes.title")}
                  </p>
                </div>
              </div>

              <textarea
                className="ns-textarea w-full"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("need.notes.placeholder")}
                rows={3}
                dir={isRTL ? "rtl" : "ltr"}
                style={{
                  resize: "none",
                  borderRadius: theme.radiusMd,
                  border: `1.5px solid ${theme.borderDefault}`,
                  backgroundColor: theme.background,
                  padding: "16px 18px",
                  fontFamily,
                  ...TEXT_STYLE.body,
                  color: theme.textHeading,
                  outline: "none",
                  textAlign: isRTL ? "right" : "left",
                }}
              />
              <p style={{ ...TEXT_STYLE.helper, fontFamily, color: theme.textMuted, marginTop: 8 }}>
                {t("need.notes.optional")}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={closeSheet}
                  className="flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform"
                  style={{
                    flex: "0 0 auto",
                    height: 60,
                    padding: "0 28px",
                    borderRadius: theme.radiusMd,
                    backgroundColor: theme.surface,
                    border: `1.5px solid ${theme.borderDefault}`,
                    outline: "none",
                  }}
                >
                  <X size={20} color={theme.textMuted} strokeWidth={2.4} />
                  <span style={{ ...TEXT_STYLE.buttonSm, fontFamily, color: theme.textMuted }}>
                    {t("need.cancel")}
                  </span>
                </button>
                <button
                  onClick={sendRequest}
                  className="flex-1 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] transition-transform"
                  style={{
                    height: 60,
                    borderRadius: theme.radiusMd,
                    backgroundColor: theme.primary,
                    border: "1.5px solid transparent",
                    boxShadow: SHADOW.md,
                    outline: "none",
                  }}
                >
                  <Send
                    size={20}
                    color={theme.textInverse}
                    strokeWidth={2.4}
                    style={isRTL ? { transform: "scaleX(-1)" } : undefined}
                  />
                  <span style={{ ...TEXT_STYLE.button, fontFamily, color: theme.textInverse }}>
                    {selected.kind === "report" ? t("need.report.submit") : t("need.send")}
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
