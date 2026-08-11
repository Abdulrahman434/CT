import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, PanInfo } from "motion/react";
import {
  HandHelping, Wrench, ClipboardList,
  CheckCircle2, Clock, X, Send, Inbox, Globe,
  ChevronLeft, ChevronRight, Check,
  CircleDot, UserRound, Truck,
  // Unified Patient Services icon set — clean, outlined, single-stroke lucide
  // glyphs replacing the old emoji illustrations (matches Entertainment / Home).
  BedDouble, GlassWater, BedSingle, Shirt, SprayCan, Layers, Footprints,
  AirVent, Lightbulb, Tv, ShowerHead, Plug,
  Ear, Eye, Accessibility, ShieldCheck, BookOpen, PersonStanding,
  Scissors, Brush, Droplets, Sparkles, Trash2,
  createLucideIcon, type LucideIcon,
} from "lucide-react";
import { useTheme, TYPE_SCALE, WEIGHT, TEXT_STYLE, SHADOW, SPACE, LEADING } from "./ThemeContext";
import { useLocale } from "./i18n";
import { InternalPageHeader } from "./InternalPageHeader";
import { ApiImage } from "./ApiImage";

/* ── Housekeeping product photos (compressed JPEG — 12-31 KB each) ── */
import imgBlanket from "../../assets/Housekeeping/blanket.jpg";
import imgWater from "../../assets/Housekeeping/water.jpg";
import imgPillow from "../../assets/Housekeeping/pillow.jpg";
import imgTowel from "../../assets/Housekeeping/towels.jpg";
import imgToiletries from "../../assets/Housekeeping/toiletries.jpg";
import imgTissues from "../../assets/Housekeeping/tissues.jpg";
import imgSheets from "../../assets/Housekeeping/bedsheets.jpg";
import imgSlippers from "../../assets/Housekeeping/slippers.jpg";
import imgEarplugs from "../../assets/Housekeeping/Earplugs.jpg";
import imgSleepMask from "../../assets/Housekeeping/Sleep Mask.jpg";
import imgWheelchair from "../../assets/Housekeeping/Wheelchair.jpg";
import imgFaceMask from "../../assets/Housekeeping/face mask.jpg";
import imgPrayerMat from "../../assets/Housekeeping/prayer matt.jpg";
import imgQuran from "../../assets/Housekeeping/quran.jpg";
import imgWalker from "../../assets/Housekeeping/walker.jpg";
import imgWalkingStick from "../../assets/Housekeeping/walking stick.jpg";
import imgCrutches from "../../assets/Housekeeping/crutches.jpg";
import imgDentalKit from "../../assets/Housekeeping/dental kit.jpg";
import imgComb from "../../assets/Housekeeping/comb.jpg";
import imgWetWipes from "../../assets/Housekeeping/wet wipes.jpg";

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
  kind: "request" | "report" | "roomcare";
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

/* Prayer mat icon (carpet with fringe detail) — no lucide equivalent */
const PrayerMatIcon: LucideIcon = createLucideIcon("PrayerMat", [
  ["rect", { x: "4", y: "6", width: "16", height: "12", rx: "1.5", key: "mat" }],
  ["path", { d: "M7 6V4.5M10 6V4.5M14 6V4.5M17 6V4.5M7 18V19.5M10 18V19.5M14 18V19.5M17 18V19.5", key: "fringe" }],
  ["path", { d: "M12 9 C10 11 10 13 12 15 C14 13 14 11 12 9", key: "arch" }],
]);

interface CardDef {
  key: string; // i18n label key
  emoji: string; // retained for back-compat with requests persisted before the redesign
  Icon: LucideIcon; // unified vector icon shown in the light-blue container
  image?: string; // optional product photo — replaces the icon box in the grid
  subtitle?: string; // short issue hints (shown beneath the title on report cards)
}

/* Issue-type chip options for the report dialog */
const ISSUE_CHIPS: Record<string, string[]> = {
  "need.issue.ac": ["need.chip.notCooling", "need.chip.tooCold", "need.chip.noise"],
  "need.issue.lights": ["need.chip.notWorking", "need.chip.flickering", "need.chip.tooDim", "need.chip.broken", "need.chip.other"],
  "need.issue.tv": ["need.chip.notWorking", "need.chip.noSignal"],
  "need.issue.bed": ["need.chip.uncomfortable", "need.chip.broken"],
  "need.issue.bathroom": ["need.chip.leaking", "need.chip.clogged", "need.chip.dirty"],
  "need.issue.power": ["need.chip.notWorking", "need.chip.loose", "need.chip.sparking"],
};

const REQUEST_ITEMS: CardDef[] = [
  /* ── Page 1 ── */
  { key: "need.item.blanket", emoji: "🛏️", Icon: BedDouble, image: imgBlanket },
  { key: "need.item.water", emoji: "💧", Icon: GlassWater, image: imgWater },
  { key: "need.item.pillow", emoji: "🧸", Icon: BedSingle, image: imgPillow },
  { key: "need.item.towel", emoji: "🧺", Icon: Shirt, image: imgTowel },
  { key: "need.item.toiletries", emoji: "🧼", Icon: SprayCan, image: imgToiletries },
  { key: "need.item.tissues", emoji: "🧻", Icon: TissueBox, image: imgTissues },
  { key: "need.item.sheets", emoji: "🛌", Icon: Layers, image: imgSheets },
  { key: "need.item.slippers", emoji: "🩴", Icon: Footprints, image: imgSlippers },
  /* ── Page 2 ── */
  { key: "need.item.earplugs", emoji: "👂", Icon: Ear, image: imgEarplugs },
  { key: "need.item.sleepmask", emoji: "😴", Icon: Eye, image: imgSleepMask },
  { key: "need.item.wheelchair", emoji: "♿", Icon: Accessibility, image: imgWheelchair },
  { key: "need.item.facemask", emoji: "😷", Icon: ShieldCheck, image: imgFaceMask },
  { key: "need.item.prayermat", emoji: "🧎", Icon: PrayerMatIcon, image: imgPrayerMat },
  { key: "need.item.quran", emoji: "📖", Icon: BookOpen, image: imgQuran },
  { key: "need.item.crutches", emoji: "🩼", Icon: PersonStanding, image: imgCrutches },
  { key: "need.item.walkingcane", emoji: "🦯", Icon: PersonStanding, image: imgWalkingStick },
  /* ── Page 3 ── */
  { key: "need.item.dentalkit", emoji: "🪥", Icon: Brush, image: imgDentalKit },
  { key: "need.item.comb", emoji: "💇", Icon: Scissors, image: imgComb },
  { key: "need.item.wetwipes", emoji: "🧴", Icon: Droplets, image: imgWetWipes },
  { key: "need.item.walker", emoji: "🚶", Icon: PersonStanding, image: imgWalker },
];

const REPORT_ITEMS: CardDef[] = [
  { key: "need.issue.ac", emoji: "❄️", Icon: AirVent, subtitle: "need.issue.ac.sub" },
  { key: "need.issue.lights", emoji: "💡", Icon: Lightbulb, subtitle: "need.issue.lights.sub" },
  { key: "need.issue.tv", emoji: "📺", Icon: Tv, subtitle: "need.issue.tv.sub" },
  { key: "need.issue.bed", emoji: "🛏️", Icon: BedDouble, subtitle: "need.issue.bed.sub" },
  { key: "need.issue.bathroom", emoji: "🚿", Icon: ShowerHead, subtitle: "need.issue.bathroom.sub" },
  { key: "need.issue.power", emoji: "🔌", Icon: Plug, subtitle: "need.issue.power.sub" },
];

/* Look up the unified icon for a persisted request by its i18n item key, so the
   "My Requests" list and dialogs render the same vector set as the grid cards. */
const ROOM_CARE_ITEMS: CardDef[] = [
  { key: "need.care.bedlinen", emoji: "🛏️", Icon: BedSingle, subtitle: "need.care.bedlinen.sub" },
  { key: "need.care.trash", emoji: "🗑️", Icon: Trash2, subtitle: "need.care.trash.sub" },
  { key: "need.care.spill", emoji: "💧", Icon: Droplets, subtitle: "need.care.spill.sub" },
  { key: "need.care.bathroom", emoji: "🚿", Icon: ShowerHead, subtitle: "need.care.bathroom.sub" },
];

const ICON_BY_KEY: Record<string, LucideIcon> = Object.fromEntries(
  [...REQUEST_ITEMS, ...REPORT_ITEMS, ...ROOM_CARE_ITEMS].map((c) => [c.key, c.Icon]),
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

type Tab = "request" | "roomcare" | "report";

interface NeedSomethingProps {
  onClose: () => void;
  /** When provided, opens directly to this tab (e.g. "mine" for My Requests) */
  initialTab?: Tab | "mine";
}

export function NeedSomething({ onClose, initialTab }: NeedSomethingProps) {
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
  const STATUS_STYLE: Record<StatusKey, { fg: string; Icon: typeof Check }> = {
    sent: { fg: theme.textMuted, Icon: CircleDot },
    preparing: { fg: theme.info, Icon: UserRound },
    onway: { fg: theme.warning, Icon: Truck },
    delivered: { fg: theme.success, Icon: CheckCircle2 },
  };

  /* ── View state ── */
  const [tab, setTab] = useState<Tab>(initialTab && initialTab !== "mine" ? initialTab : "request");
  const [showRequestsOverlay, setShowRequestsOverlay] = useState(initialTab === "mine");
  const [selected, setSelected] = useState<{ card: CardDef; kind: "request" | "report" | "roomcare" } | null>(null);
  const [note, setNote] = useState("");
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [success, setSuccess] = useState<null | "request" | "report" | "roomcare">(null);

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
      setTab("request");
      setShowRequestsOverlay(true);
    }, 3000);
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    };
  }, [success]);

  const openSheet = (card: CardDef, kind: "request" | "report" | "roomcare") => {
    setSelected({ card, kind });
    setNote("");
    setSelectedChip(null);
  };

  const closeSheet = () => {
    setSelected(null);
    setNote("");
    setSelectedChip(null);
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
    setSelectedChip(null);
    setSuccess(kind);
  };

  const backToMine = () => {
    if (successTimer.current) clearTimeout(successTimer.current);
    setSuccess(null);
    setShowRequestsOverlay(true);
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

  const allGridItems = tab === "report" ? REPORT_ITEMS : tab === "roomcare" ? ROOM_CARE_ITEMS : REQUEST_ITEMS;
  const gridKind: "request" | "report" | "roomcare" = tab === "report" ? "report" : tab === "roomcare" ? "roomcare" : "request";

  /* ── Pagination (8 items per page) ── */
  const ITEMS_PER_PAGE = 8;
  const [gridPage, setGridPage] = useState(0);
  const totalPages = Math.ceil(allGridItems.length / ITEMS_PER_PAGE);
  const gridItems = allGridItems.slice(gridPage * ITEMS_PER_PAGE, (gridPage + 1) * ITEMS_PER_PAGE);

  /* Reset to page 0 when switching tabs */
  const prevTab = useRef(tab);
  useEffect(() => {
    if (prevTab.current !== tab) { setGridPage(0); prevTab.current = tab; }
  }, [tab]);

  const goPage = useCallback((pg: number) => {
    /* Infinite wrap: going past the end wraps to 0 and vice-versa */
    if (totalPages <= 1) return;
    setGridPage(((pg % totalPages) + totalPages) % totalPages);
  }, [totalPages]);

  /* ── Swipe / drag gesture for infinite slider ── */
  const SWIPE_THRESHOLD = 50; // min px to trigger page change
  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      if (info.offset.x < 0) {
        // Swiped left → next page (or right in RTL)
        goPage(gridPage + (isRTL ? -1 : 1));
      } else {
        // Swiped right → prev page (or next in RTL)
        goPage(gridPage + (isRTL ? 1 : -1));
      }
    }
  }, [goPage, gridPage, isRTL]);

  const tabs: { key: Tab; Icon: typeof HandHelping; label: string; count?: number }[] = [
    { key: "request", Icon: HandHelping, label: t("need.tab.request") },
    { key: "roomcare", Icon: Sparkles, label: t("need.tab.roomcare") },
    { key: "report", Icon: Wrench, label: t("need.tab.report") },
  ];

  const titleKey =
    tab === "report" ? "need.title.report" : tab === "roomcare" ? "need.title.roomcare" : "need.title.request";
  const subKey = tab === "report" ? "need.sub.report" : tab === "roomcare" ? "need.sub.roomcare" : "need.sub.request";

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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* My Requests — same style as FoodOrdering "My Orders" */}
            <button
              onClick={() => setShowRequestsOverlay(true)}
              className="cursor-pointer active:scale-95 transition-transform"
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: "12px", padding: "10px 16px",
                color: "#fff", fontFamily, fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.15)",
                outline: "none",
              }}
            >
              <ClipboardList size={20} />
              {t("need.tab.mine")}
            </button>
            {/* Language switcher — icon only */}
            <button
              onClick={toggleLanguage}
              aria-label={t("settings.language")}
              className="cursor-pointer active:scale-95 transition-transform"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 42, height: 42,
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: "10px",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.15)",
                outline: "none",
              }}
            >
              <Globe size={20} />
            </button>
          </div>
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
              const isReportTab = tb.key === "report";
              const activeBg = isReportTab ? theme.error : theme.primary;
              return (
                <button
                  key={tb.key}
                  onClick={() => setTab(tb.key)}
                  className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
                  style={{
                    padding: "13px 22px",
                    borderRadius: theme.radiusFull,
                    backgroundColor: active ? activeBg : theme.surface,
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
              <p style={{ ...TEXT_STYLE.body, fontFamily, color: theme.textMuted, marginTop: 4 }}>
                  {t(subKey)}
                </p>
            </div>

              <div className="flex-1 min-h-0 flex flex-col">
                {/* Cards grid — lifted up to make room for pagination */}
                <div className="flex-1 min-h-0 flex items-start justify-center pt-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`page-${gridPage}-${tab}`}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      drag={tab === "request" && totalPages > 1 ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.18}
                      onDragEnd={handleDragEnd}
                      className="grid w-full"
                      style={{
                        gridTemplateColumns: (tab === "report" || tab === "roomcare") ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
                        gridTemplateRows: "repeat(2, 1fr)",
                        columnGap: "24px",
                        rowGap: "20px",
                        maxHeight: "92%",
                        height: "100%",
                        maxWidth: "100%",
                        cursor: tab === "request" && totalPages > 1 ? "grab" : undefined,
                        touchAction: "pan-y",
                      }}
                    >
                    {gridItems.map((card) => {
                      const CardIcon = card.Icon;
                      const isCompactCard = tab === "report" || tab === "roomcare";
                      const isReport = tab === "report";
                      const isCardSelected = isCompactCard && selected?.card.key === card.key;
                      /* Dynamic colour: red for report, brand primary for room care */
                      const accentColor = isReport ? theme.error : theme.primary;
                      const accentSubtle = isReport ? theme.errorSubtle : theme.primaryLight;

                      return (
                        <button
                          key={card.key}
                          onClick={() => openSheet(card, gridKind)}
                          className="ns-card flex flex-col items-stretch cursor-pointer relative"
                          style={{
                            backgroundColor: theme.surface,
                            borderRadius: theme.radiusCard,
                            border: isCardSelected
                              ? `2px solid ${accentColor}`
                              : `1px solid rgba(0,0,0,0.10)`,
                            boxShadow: isCardSelected ? `0 0 0 1px ${accentColor}` : "none",
                            padding: 0,
                            outline: "none",
                            overflow: "hidden",
                            minHeight: 0,
                          }}
                        >
                          {card.image ? (
                            /* Product photo — fills the top of the card, flexes to available height */
                            <>
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
                              <div
                                className="shrink-0 text-center"
                                style={{ padding: "10px 8px 12px" }}
                              >
                                <span
                                  style={{
                                    ...TEXT_STYLE.cardTitle,
                                    fontFamily,
                                    color: theme.textHeading,
                                    display: "block",
                                  }}
                                >
                                  {t(card.key)}
                                </span>
                              </div>
                            </>
                          ) : isCompactCard ? (
                            /* Compact card (Report / Room Care) — white bg, circle icon, stacked text */
                            <div
                              className="flex flex-col items-center justify-center"
                              style={{ flex: 1, minHeight: 0, padding: "20px 12px 14px" }}
                            >
                              <div
                                style={{
                                  width: 88,
                                  height: 88,
                                  borderRadius: "50%",
                                  backgroundColor: accentSubtle,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginBottom: 12,
                                }}
                              >
                                <CardIcon size={42} color={accentColor} strokeWidth={2.2} />
                              </div>
                              <span
                                style={{
                                  ...TEXT_STYLE.cardTitle,
                                  fontFamily,
                                  color: theme.textHeading,
                                  display: "block",
                                  textAlign: "center",
                                }}
                              >
                                {t(card.key)}
                              </span>
                              {card.subtitle && (
                                <span
                                  style={{
                                    fontFamily,
                                    fontSize: TYPE_SCALE.sm,
                                    color: theme.textMuted,
                                    display: "block",
                                    marginTop: 6,
                                    lineHeight: 1.3,
                                    textAlign: "center",
                                  }}
                                >
                                  {t(card.subtitle)}
                                </span>
                              )}
                            </div>
                          ) : (
                            /* Request fallback icon box */
                            <>
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
                              <div
                                className="shrink-0 text-center"
                                style={{ padding: "12px 8px 14px" }}
                              >
                                <span
                                  style={{
                                    ...TEXT_STYLE.cardTitle,
                                    fontFamily,
                                    color: theme.textHeading,
                                    display: "block",
                                  }}
                                >
                                  {t(card.key)}
                                </span>
                              </div>
                            </>
                          )}
                        </button>
                      );
                    })}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Pagination: dots only (no arrows) — swipe to navigate */}
                {totalPages > 1 && (
                  <div className="shrink-0 flex items-center justify-center gap-3 py-3">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goPage(i)}
                        className="rounded-full cursor-pointer transition-all duration-300"
                        style={{
                          width: i === gridPage ? "24px" : "8px",
                          height: "8px",
                          backgroundColor: i === gridPage ? theme.primary : "rgba(0,0,0,0.10)",
                          border: "none",
                          outline: "none",
                          padding: 0,
                          transition: "width 0.3s ease, background-color 0.3s ease",
                        }}
                        aria-label={`Page ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
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
                    backgroundColor: selected.kind === "report" ? theme.errorSubtle : theme.primaryLight,
                    fontSize: 34,
                    lineHeight: 1,
                  }}
                >
                  <selected.card.Icon size={34} color={selected.kind === "report" ? theme.error : theme.primary} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ ...TEXT_STYLE.sectionTitle, fontFamily, color: theme.textHeading }}>
                    {t(selected.card.key)}
                  </p>
                  <p style={{ ...TEXT_STYLE.body, fontFamily, color: theme.textMuted, marginTop: 2 }}>
                    {selected.kind === "report" ? t("need.report.whatIssue") : t("need.notes.title")}
                  </p>
                </div>
              </div>

              {/* Issue-type chip selector (report only) */}
              {selected.kind === "report" && ISSUE_CHIPS[selected.card.key] && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {ISSUE_CHIPS[selected.card.key].map((chipKey) => {
                    const isActive = selectedChip === chipKey;
                    return (
                      <button
                        key={chipKey}
                        onClick={() => setSelectedChip(isActive ? null : chipKey)}
                        className="cursor-pointer active:scale-95 transition-transform"
                        style={{
                          padding: "8px 16px",
                          borderRadius: theme.radiusFull,
                          backgroundColor: isActive ? theme.errorSubtle : theme.surface,
                          border: `1.5px solid ${isActive ? theme.error : theme.borderDefault}`,
                          outline: "none",
                          fontFamily,
                          fontSize: TYPE_SCALE.base,
                          fontWeight: isActive ? WEIGHT.bold : WEIGHT.medium,
                          color: isActive ? theme.error : theme.textHeading,
                        }}
                      >
                        {t(chipKey)}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Details label */}
              {selected.kind === "report" && (
                <p style={{ ...TEXT_STYLE.body, fontFamily, color: theme.textMuted, marginBottom: 8 }}>
                  {t("need.report.addDetails")}
                </p>
              )}

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
              {selected.kind === "request" && (
                <p style={{ ...TEXT_STYLE.helper, fontFamily, color: theme.textMuted, marginTop: 8 }}>
                  {t("need.notes.optional")}
                </p>
              )}

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
                    backgroundColor: selected.kind === "report" ? theme.error : theme.primary,
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

      {/* ─── My Requests overlay (popup, same pattern as FoodOrdering My Orders) ─── */}
      <AnimatePresence>
        {showRequestsOverlay && (
          <motion.div
            key="requests-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 flex flex-col"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          >
            <div
              className="flex-1 flex flex-col m-8 mt-4 rounded-[28px] overflow-hidden"
              style={{ backgroundColor: "#fff", boxShadow: "0 12px 48px rgba(0,0,0,0.25)" }}
            >
              {/* Overlay header */}
              <div className="shrink-0 flex items-center justify-between px-8 py-5" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                <div className="flex items-center gap-3">
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    backgroundColor: theme.primaryLight,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <ClipboardList size={20} color={theme.primary} />
                  </div>
                  <span style={{ fontFamily, fontSize: "20px", fontWeight: WEIGHT.bold, color: theme.textHeading }}>
                    {t("need.tab.mine")}
                  </span>
                </div>
                <button
                  onClick={() => setShowRequestsOverlay(false)}
                  className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    backgroundColor: "rgba(0,0,0,0.05)", border: "none", outline: "none",
                    color: theme.textMuted, fontSize: "20px",
                  }}
                >
                  ✕
                </button>
              </div>
              {/* Overlay content */}
              <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
                {requests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center gap-4 min-h-[300px]">
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 96, height: 96,
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
                      const StatusIcon = st.Icon;
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
                            border: `1px solid rgba(0,0,0,0.08)`,
                            padding: "18px 22px",
                          }}
                        >
                          <div
                            className="shrink-0 flex items-center justify-center"
                            style={{
                              width: 60, height: 60,
                              borderRadius: theme.radiusMd,
                              backgroundColor: theme.primaryLight,
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
                                "{r.note}"
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
                            className="shrink-0 flex items-center gap-2"
                            style={{
                              padding: "10px 18px",
                              borderRadius: theme.radiusFull,
                              backgroundColor: `color-mix(in srgb, ${st.fg} 12%, transparent)`,
                              border: `1.5px solid color-mix(in srgb, ${st.fg} 28%, transparent)`,
                            }}
                          >
                            <StatusIcon size={18} color={st.fg} strokeWidth={2.2} />
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
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
