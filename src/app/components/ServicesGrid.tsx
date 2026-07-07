import { useState } from "react";
import { ApiImage } from "./ApiImage";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW, TEXT_STYLE, SPACE } from "./ThemeContext";
import { useLocale } from "./i18n";
import { useRipple } from "./useRipple";
import svgPaths from "../../imports/svg-ca68x68c4i";
import { Stethoscope, BookOpenText, MessageSquareMore, Soup } from "lucide-react";
import roomControlIcon from "@/assets/room-control-icon.png";
import quranIcon from "@/assets/5303963df7d14bbca33ccffa43f982a464344809.png";
import mirrorIcon from "@/assets/0ab7565691ddb8401a21da44af1864e8f4058536.png";
import podcastIcon from "@/assets/5513479d879a8c3fcdd1f6832dd30ce350c81789.png";
import caremedicalicon from "@/assets/caremedicalicon.png";
import dallahPodcastIcon from "@/assets/dallah-podcast.png";
import patientPortalIcon from "@/assets/patient-portal.png";
import burjeelLogo from "@/assets/c8626cd3ed1ce90e9b3bab4a5f97a7315203f204.png";
import careinnAdminPortalIcon from "@/assets/careinn-admin-icon.png";
import { Lock } from "lucide-react";
import { useLockedApps } from "../lib/lockedApps";
import { useLongPress } from "../lib/useLongPress";
import { AppLockMenu } from "./AppLockMenu";
import { LockBadge } from "./LockBadge";

export interface SectionVisibility {
  show_iptv: boolean;
  show_care_plan: boolean;
  show_about_us: boolean;
  show_prayer_times: boolean;
  show_food_menu: boolean;
  show_resources: boolean;
  show_care_team: boolean;
}

const DEFAULT_VISIBILITY: SectionVisibility = {
  show_iptv: true,
  show_care_plan: true,
  show_about_us: true,
  show_prayer_times: true,
  show_food_menu: true,
  show_resources: true,
  show_care_team: true,
};

interface ShortcutItem {
  labelKey: string;
  icon: string;
  url: string;
}

const getShortcutItems = (hospitalId: string): ShortcutItem[] => {
  let podcastData;
  if (hospitalId === "careinn") {
    podcastData = { labelKey: "shortcut.adminPortal", icon: careinnAdminPortalIcon, url: "https://dashboard.careinn.com" };
  } else if (hospitalId === "caremed") {
    podcastData = { labelKey: "shortcut.podcast", icon: caremedicalicon, url: "https://www.youtube.com/playlist?list=PLbWY8VfHuoBSK7XeJJtutBSTeY_e7Kut3" };
  } else if (hospitalId === "dallah") {
    podcastData = { labelKey: "shortcut.dallahPodcast", icon: dallahPodcastIcon, url: "https://www.youtube.com/watch?v=FTacFGIn8aA&list=PLptiCCjrXsQt5lExxVzvUx61Hd65Tsefg" };
  } else if (hospitalId === "burjeel") {
    podcastData = { labelKey: "shortcut.burjeelPodcast", icon: burjeelLogo, url: "https://www.youtube.com/watch?v=OH71A4YxCG4&list=PL6o7wstkQMs50lz5esnwetX5fbgP7G8im" };
  } else {
    podcastData = { labelKey: "shortcut.podcast", icon: podcastIcon, url: "https://www.youtube.com/watch?v=1WKyerFH34U&list=PL_JVZV-KlG7oFe-fUAMnbYsWyTU9k8ljF" };
  }

  return [
    { labelKey: "shortcut.roomControl", icon: roomControlIcon, url: "roomcontrol" },
    hospitalId === "burjeel"
      ? { labelKey: "shortcut.patientPortal", icon: patientPortalIcon, url: "https://patientportal.vpshealth.com/home/login" }
      : { labelKey: "shortcut.quran", icon: quranIcon, url: "https://app.quranflash.com/book/Medina1?ar#/reader/chapter/3" },
    hospitalId === "caremed"
      ? { labelKey: "shortcut.academy", icon: caremedicalicon, url: "https://care.classera.com/explore/courses?lang=en" }
      : hospitalId === "dallah"
      ? { labelKey: "shortcut.patientPortal", icon: patientPortalIcon, url: "https://www.dallah-hospital.com/arabic/book-an-appointment/home" }
      : { labelKey: "shortcut.mirror", icon: mirrorIcon, url: "" },
    podcastData,
  ];
};

/* ─── Hub item SVG icon paths from Figma ─── */
const hubSvgIcons: Record<string, { paths: { d: string; clipId?: string }[]; viewBox?: string }> = {
  Media: { paths: [{ d: svgPaths.p262abc00 }] },
  Reading: { paths: [{ d: "M10 5.83333V17.5" }, { d: svgPaths.p25713000 }] },
  Social: { paths: [{ d: svgPaths.p245c2480 }, { d: svgPaths.p1b9ecd80 }, { d: svgPaths.p30483c80 }, { d: svgPaths.p37f93a00 }, { d: svgPaths.p26fdf80 }] },
  Games: { paths: [{ d: "M5 9.16667H8.33333" }, { d: "M6.66667 7.5V10.8333" }, { d: "M12.5 10H12.5083" }, { d: "M15 8.33333H15.0083" }, { d: svgPaths.p3fcc8f00 }] },
  Meeting: { paths: [{ d: svgPaths.p24bc3d00 }, { d: svgPaths.p3e238c80 }] },
  Internet: { paths: [{ d: svgPaths.p14d24500, clipId: "clip_internet" }, { d: svgPaths.p17212180 }, { d: "M1.66667 10H18.3333" }] },
  Tools: { paths: [{ d: svgPaths.p794da00 }] },
  Education: { paths: [{ d: svgPaths.p462d500 }, { d: "M22 10V16" }, { d: svgPaths.p2b645f80 }], viewBox: "0 0 24 24" },
  "About Us": { paths: [{ d: svgPaths.p14d24500, clipId: "clip_about" }, { d: "M10 13.3333V10" }, { d: "M10 6.66667H10.0083" }] },
};

const hubItems = [
  { label: "Media", labelKey: "hub.media", desc: "hub.media.desc" },
  { label: "Reading", labelKey: "hub.reading", desc: "hub.reading.desc" },
  { label: "Social", labelKey: "hub.social", desc: "hub.social.desc" },
  { label: "Games", labelKey: "hub.games", desc: "hub.games.desc" },
  { label: "Meeting", labelKey: "hub.meeting", desc: "hub.meeting.desc" },
  { label: "Internet", labelKey: "hub.internet", desc: "hub.internet.desc" },
  { label: "Tools", labelKey: "hub.tools", desc: "hub.tools.desc" },
  { label: "Education", labelKey: "hub.education", desc: "hub.education.desc" },
];

const serviceItems = [
  { label: "Consultation", labelKey: "service.consultation", svgPaths: [] as string[], lucideIcon: Stethoscope },
  { label: "Housekeeping", labelKey: "service.housekeeping", svgPaths: [svgPaths.p24941500, "M16.6667 2.5V5.83333", "M18.3333 4.16667H15", "M3.33333 14.1667V15.8333", "M4.16667 15H2.5"], clipId: "clip_house" },
  { label: "Order Food", labelKey: "service.orderFood", svgPaths: [] as string[], lucideIcon: Soup },
  { label: "Call", labelKey: "service.call", svgPaths: [svgPaths.p1a7ce800], clipId: "clip_call" },
];

const surveyItem = {
  label: "Survey",
  svgPaths: [
    "M9 11L12 14L22 4",
    "M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16",
  ],
};

/* ─── Hub Icon (32px rendered inside viewBox for scale) ─── */
function HubIcon({ label, color }: { label: string; color?: string }) {
  const { theme } = useTheme();
  const iconColor = color || theme.primary;

  /* Education uses lucide BookOpenText instead of SVG paths */
  if (label === "Education") {
    return (
      <div className="relative shrink-0" style={{ width: SPACE[5], height: SPACE[5] }}>
        <BookOpenText size={40} color={iconColor} strokeWidth={1.5} />
      </div>
    );
  }

  const config = hubSvgIcons[label];
  if (!config) return null;
  const vb = config.viewBox || "0 0 20 20";
  const sw = vb === "0 0 24 24" ? "2" : "1.66667";
  return (
    <div className="relative shrink-0" style={{ width: SPACE[5], height: SPACE[5] }}>
      <svg className="block size-full" fill="none" viewBox={vb}>
        {config.paths[0]?.clipId ? (
          <g clipPath={`url(#${config.paths[0].clipId})`}>
            {config.paths.map((p, i) => (
              <path key={i} d={p.d} stroke={iconColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth={sw} />
            ))}
          </g>
        ) : (
          <g>
            {config.paths.map((p, i) => (
              <path key={i} d={p.d} stroke={iconColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth={sw} />
            ))}
          </g>
        )}
        {config.paths[0]?.clipId && (
          <defs>
            <clipPath id={config.paths[0].clipId}>
              <rect fill="white" height={vb === "0 0 24 24" ? "24" : "20"} width={vb === "0 0 24 24" ? "24" : "20"} />
            </clipPath>
          </defs>
        )}
      </svg>
    </div>
  );
}

/* ─── Engagement Hub Card — square-ish tile for touchscreen ─── */
function HubCard({
  item,
  onTap,
  contained,
  compact,
  onLongPress,
  isLocked
}: {
  item: (typeof hubItems)[0];
  onTap: () => void;
  contained?: boolean;
  compact?: boolean;
  onLongPress: () => void;
  isLocked: boolean;
}) {
  const { theme } = useTheme();
  const { t, fontFamily } = useLocale();
  const { onPointerDown, rippleElements } = useRipple("rgba(255,255,255,0.12)");
  const [pressed, setPressed] = useState(false);

  const iconBoxSize = compact ? "48px" : "72px";
  const iconRadius = compact ? theme.radiusMd : theme.radiusLg;

  const { handlers, handleClick } = useLongPress(onLongPress, 600);

  return (
    <button
      data-nav="true"
      onPointerDown={(e) => { onPointerDown(e); handlers.onPointerDown(); setPressed(true); }}
      onPointerUp={() => { handlers.onPointerUp(); setPressed(false); }}
      onPointerLeave={() => { handlers.onPointerLeave(); setPressed(false); }}
      onClick={() => handleClick(onTap)}
      className={`relative overflow-hidden flex flex-col items-center justify-center ${compact ? "gap-1.5" : "gap-3"} transition-transform duration-100 ease-out cursor-pointer h-full w-full`}
      style={{
        backgroundColor: pressed ? theme.primary : contained ? theme.surfaceElevated : theme.surface,
        borderRadius: theme.radiusCard,
        boxShadow: pressed
          ? `0px 2px 8px 0px ${theme.primarySubtle}`
          : contained
          ? "none"
          : SHADOW.md,
        outline: "none",
        transform: pressed ? "scale(0.96)" : "scale(1)",
        border: contained && !pressed ? `1px solid ${theme.primarySubtle}` : pressed ? "none" : theme.cardBorder,
      }}
      aria-label={`${t(item.labelKey)}: ${t(item.desc)}`}
    >
      {rippleElements}
      {isLocked && <LockBadge />}
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: iconBoxSize,
          height: iconBoxSize,
          borderRadius: iconRadius,
          backgroundColor: pressed ? "rgba(255,255,255,0.2)" : theme.primaryLight,
          transition: "background-color 0.1s ease-out",
        }}
      >
        <HubIcon label={item.label} color={pressed ? theme.textInverse : theme.primary} />
      </div>
      {/* Label */}
      <span
        style={{
          fontFamily: fontFamily,
          fontSize: compact ? TYPE_SCALE.sm : TEXT_STYLE.pageTitle.fontSize,
          fontWeight: WEIGHT.semibold,
          color: pressed ? theme.textInverse : theme.textHeading,
          lineHeight: compact ? "18px" : "26px",
          textAlign: "center",
          transition: "color 0.1s ease-out",
        }}
      >
        {t(item.labelKey)}
      </span>
    </button>
  );
}

/* ─── Service Card — CareMe / Call / Education ─── */
function ServiceCard({ item, onTap, square, contained, compact, onLongPress, isLocked }: { item: (typeof serviceItems)[0] & { viewBox?: string }; onTap?: () => void; square?: boolean; contained?: boolean; compact?: boolean; onLongPress: () => void; isLocked: boolean }) {
  const { theme } = useTheme();
  const { t, fontFamily } = useLocale();
  const { onPointerDown, rippleElements } = useRipple("rgba(255,255,255,0.12)");
  const [pressed, setPressed] = useState(false);

  const iconBoxSize = compact ? "48px" : "72px";
  const iconSize = compact ? 28 : 40;
  const iconRadius = compact ? theme.radiusMd : theme.radiusLg;
  const gapSize = compact ? 2 : 3;

  const { handlers, handleClick } = useLongPress(onLongPress, 600);

  return (
    <button
      data-nav="true"
      onPointerDown={(e) => { onPointerDown(e); handlers.onPointerDown(); setPressed(true); }}
      onPointerUp={() => { handlers.onPointerUp(); setPressed(false); }}
      onPointerLeave={() => { handlers.onPointerLeave(); setPressed(false); }}
      onClick={() => handleClick(() => onTap?.())}
      className={`relative overflow-hidden flex flex-col items-center justify-center gap-${gapSize} transition-transform duration-100 ease-out cursor-pointer${square ? " flex-1 w-full" : " w-full h-full"}`}
      style={{
        height: square ? undefined : undefined,
        padding: square ? "0 28px 0 18px" : "0",
        backgroundColor: pressed ? theme.primary : contained ? theme.surfaceElevated : theme.surface,
        borderRadius: compact ? theme.radiusXl : theme.radiusCard,
        boxShadow: pressed
          ? `0px 2px 8px 0px ${theme.primarySubtle}`
          : contained
          ? "none"
          : SHADOW.md,
        outline: "none",
        transform: pressed ? "scale(0.97)" : "scale(1)",
        border: contained && !pressed ? `1px solid ${theme.primarySubtle}` : pressed ? "none" : theme.cardBorder,
      }}
      aria-label={item.label}
    >
      {rippleElements}
      {isLocked && <LockBadge />}
      {/* Icon */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: iconBoxSize,
          height: iconBoxSize,
          borderRadius: iconRadius,
          backgroundColor: pressed ? "rgba(255,255,255,0.2)" : theme.primary,
          transition: "background-color 0.1s ease-out",
        }}
      >
        {item.lucideIcon ? (
          <item.lucideIcon size={iconSize} color={theme.textInverse} />
        ) : (
          <svg width={iconSize} height={iconSize} viewBox={item.viewBox || "0 0 20 20"} fill="none">
            {item.clipId ? (
              <g clipPath={`url(#${item.clipId})`}>
                {item.svgPaths.map((d, i) => (
                  <path key={i} d={d} stroke={theme.textInverse} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                ))}
              </g>
            ) : (
              <g>
                {item.svgPaths.map((d, i) => (
                  <path key={i} d={d} stroke={theme.textInverse} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                ))}
              </g>
            )}
            {item.clipId && (
              <defs>
                <clipPath id={item.clipId}>
                  <rect fill="white" height="20" width="20" />
                </clipPath>
              </defs>
            )}
          </svg>
        )}
      </div>
      {/* Label */}
      <span
        style={{
          fontFamily: fontFamily,
          fontSize: compact ? "12px" : TEXT_STYLE.button.fontSize,
          fontWeight: WEIGHT.semibold,
          color: pressed ? theme.textInverse : theme.textHeading,
          textAlign: "center",
          lineHeight: compact ? "14px" : undefined,
          transition: "color 0.1s ease-out",
        }}
      >
        {t(item.labelKey)}
      </span>
    </button>
  );
}

/* ─── Survey Card — filled version for ShortcutsColumn ─── */
function SurveyCardFilled({ onOpen, compact, onLongPress, isLocked }: { onOpen: () => void; compact?: boolean; onLongPress: () => void; isLocked: boolean }) {
  const { theme } = useTheme();
  const { t, fontFamily } = useLocale();
  const { onPointerDown, rippleElements } = useRipple("rgba(255,255,255,0.12)");
  const [pressed, setPressed] = useState(false);

  const iconBoxSize = compact ? "48px" : "72px";
  const iconSize = compact ? 28 : 40;
  const iconRadius = compact ? theme.radiusMd : theme.radiusLg;

  const { handlers, handleClick } = useLongPress(onLongPress, 600);

  return (
    <button
      data-nav="true"
      onPointerDown={(e) => { onPointerDown(e); handlers.onPointerDown(); setPressed(true); }}
      onPointerUp={() => { handlers.onPointerUp(); setPressed(false); }}
      onPointerLeave={() => { handlers.onPointerLeave(); setPressed(false); }}
      onClick={() => handleClick(onOpen)}
      className={`relative overflow-hidden flex flex-col items-center justify-center ${compact ? "gap-1" : "gap-3"} w-full h-full transition-transform duration-150 cursor-pointer`}
      style={{
        backgroundColor: pressed ? theme.accent : theme.surface,
        borderRadius: theme.radiusCard,
        boxShadow: pressed
          ? `0px 2px 8px 0px ${theme.accentSubtle}`
          : SHADOW.md,
        outline: "none",
        transform: pressed ? "scale(0.96)" : "scale(1)",
        border: pressed ? "none" : theme.cardBorder,
      }}
      aria-label="Survey"
    >
      {rippleElements}
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: iconBoxSize,
          height: iconBoxSize,
          borderRadius: iconRadius,
          backgroundColor: pressed ? "rgba(255,255,255,0.2)" : theme.accent,
          transition: "background-color 0.15s",
        }}
      >
        <MessageSquareMore size={iconSize} color={theme.textInverse} strokeWidth={1.5} />
      </div>
      <span
        style={{
          fontFamily: fontFamily,
          ...TEXT_STYLE.button,
          fontWeight: WEIGHT.semibold,
          color: pressed ? theme.textInverse : theme.textHeading,
          transition: "color 0.15s",
        }}
      >{t("service.shareFeedback")}</span>
    </button>
  );
}

/* ─── Survey Card — outline version for QuickActionsRow ─── */
function SurveyCard({ square, contained, onOpen, onLongPress, isLocked }: { square?: boolean; contained?: boolean; onOpen: () => void; onLongPress: () => void; isLocked: boolean }) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { onPointerDown, rippleElements } = useRipple("rgba(255,255,255,0.12)");
  const [pressed, setPressed] = useState(false);

  const { handlers, handleClick } = useLongPress(onLongPress, 600);

  return (
    <button
      onPointerDown={(e) => { onPointerDown(e); handlers.onPointerDown(); setPressed(true); }}
      onPointerUp={() => { handlers.onPointerUp(); setPressed(false); }}
      onPointerLeave={() => { handlers.onPointerLeave(); setPressed(false); }}
      onClick={() => handleClick(onOpen)}
      className={`relative overflow-hidden flex flex-col items-center justify-center gap-3 w-full transition-transform duration-150 cursor-pointer${square ? " flex-1" : ""}`}
      style={{
        backgroundColor: pressed ? theme.accent : contained ? theme.accentSubtle : theme.surface,
        borderRadius: theme.radiusCard,
        boxShadow: pressed
          ? `0px 2px 8px 0px ${theme.accentSubtle}`
          : contained
          ? "none"
          : SHADOW.md,
        outline: "none",
        transform: pressed ? "scale(0.96)" : "scale(1)",
        border: pressed ? "none" : theme.cardBorder,
      }}
      aria-label="Survey"
    >
      {rippleElements}
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: "72px",
          height: "72px",
          borderRadius: theme.radiusLg,
          backgroundColor: pressed ? "rgba(255,255,255,0.2)" : theme.accentSubtle,
          transition: "background-color 0.15s",
        }}
      >
        <MessageSquareMore size={40} color={pressed ? theme.textInverse : theme.accent} strokeWidth={1.5} />
      </div>
      <span
        style={{
          fontFamily: theme.fontFamily,
          ...TEXT_STYLE.pageTitle,
          fontWeight: WEIGHT.semibold,
          color: pressed ? theme.textInverse : theme.accent,
          lineHeight: "26px",
          textAlign: "center",
          transition: "color 0.15s",
        }}
      >
        {t("service.survey")}
      </span>
    </button>
  );
}

function ShortcutTile({ item, contained, onTap, onLongPress, isLocked }: { item: ShortcutItem; contained?: boolean; onTap: () => void; onLongPress: () => void; isLocked: boolean }) {
  const { theme } = useTheme();
  const { t, fontFamily } = useLocale();
  const [pressed, setPressed] = useState(false);

  // handleTap removed, using onTap from props

  const { handlers, handleClick } = useLongPress(onLongPress, 600);

  return (
    <button
      onPointerDown={() => { handlers.onPointerDown(); setPressed(true); }}
      onPointerUp={() => { handlers.onPointerUp(); setPressed(false); }}
      onPointerLeave={() => { handlers.onPointerLeave(); setPressed(false); }}
      onClick={() => handleClick(onTap)}
      className="relative overflow-hidden flex flex-col items-center justify-center gap-2 transition-transform duration-150 cursor-pointer w-full h-full"
      style={{
        borderRadius: theme.radiusCard,
        backgroundColor: pressed ? theme.primary : contained ? theme.surfaceElevated : theme.surface,
        boxShadow: pressed
          ? `0px 2px 8px 0px ${theme.primarySubtle}`
          : contained
          ? "none"
          : SHADOW.md,
        outline: "none",
        transform: pressed ? "scale(0.96)" : "scale(1)",
        border: contained && !pressed ? `1px solid ${theme.primarySubtle}` : "none",
      }}
      aria-label={t(item.labelKey)}
    >
      {isLocked && <LockBadge />}
      {item.labelKey === "shortcut.patientPortal" || item.labelKey === "shortcut.dallahPodcast" || item.labelKey === "shortcut.burjeelPodcast" || item.labelKey === "shortcut.adminPortal" ? (
        <div 
          style={{
            width: SPACE[12],
            height: SPACE[12],
            backgroundColor: (item.labelKey === "shortcut.dallahPodcast" || item.labelKey === "shortcut.burjeelPodcast") ? "#00A3C1" : item.labelKey === "shortcut.adminPortal" ? "#4EBEE3" : "#fff",
            borderRadius: theme.radiusXl,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
            border: "1px solid #eeeeee",
          }}
        >
          <ApiImage
            src={item.icon}
            alt={t(item.labelKey)}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              filter: (item.labelKey === "shortcut.dallahPodcast" || item.labelKey === "shortcut.burjeelPodcast" || item.labelKey === "shortcut.adminPortal") ? "brightness(0) invert(1)" : "none",
            }}
          />
        </div>
      ) : (
        <ApiImage
          src={item.icon}
          alt={t(item.labelKey)}
          style={{
            width: SPACE[12],
            height: SPACE[12],
            borderRadius: theme.radiusXl,
            objectFit: "cover",
          }}
        />
      )}
      <span
        style={{
          fontFamily: fontFamily,
          ...TEXT_STYLE.label,
          fontWeight: WEIGHT.bold,
          color: pressed ? theme.textInverse : theme.textMuted,
          lineHeight: "16px",
        }}
      >
        {t(item.labelKey)}
      </span>
    </button>
  );
}

/* ─── Shortcut Tile — compact version for right column ─── */
function ShortcutTileCompact({ item, onTap, onLongPress, isLocked }: { item: ShortcutItem; onTap: () => void; onLongPress: () => void; isLocked: boolean }) {
  const { theme } = useTheme();
  const { t, fontFamily } = useLocale();
  const [pressed, setPressed] = useState(false);

  // handleTap removed, using onTap from props

  const { handlers, handleClick } = useLongPress(onLongPress, 600);

  return (
    <button
      data-nav="true"
      onPointerDown={() => { handlers.onPointerDown(); setPressed(true); }}
      onPointerUp={() => { handlers.onPointerUp(); setPressed(false); }}
      onPointerLeave={() => { handlers.onPointerLeave(); setPressed(false); }}
      onClick={() => handleClick(onTap)}
      className="relative overflow-hidden flex flex-col items-center justify-center gap-2.5 transition-transform duration-150 cursor-pointer w-full h-full"
      style={{
        borderRadius: theme.radiusLg,
        backgroundColor: pressed ? theme.primary : "transparent",
        boxShadow: "none",
        outline: "none",
        transform: pressed ? "scale(0.96)" : "scale(1)",
        border: "none",
      }}
      aria-label={t(item.labelKey)}
    >
      {isLocked && <LockBadge />}
      {item.labelKey === "shortcut.patientPortal" || item.labelKey === "shortcut.dallahPodcast" || item.labelKey === "shortcut.burjeelPodcast" || item.labelKey === "shortcut.adminPortal" ? (
        <div 
          style={{
            width: "88px",
            height: "88px",
            backgroundColor: (item.labelKey === "shortcut.dallahPodcast" || item.labelKey === "shortcut.burjeelPodcast") ? "#00A3C1" : item.labelKey === "shortcut.adminPortal" ? "#4EBEE3" : "#fff",
            borderRadius: theme.radiusLg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 6,
            border: "1px solid #eeeeee",
          }}
        >
          <ApiImage
            src={item.icon}
            alt={t(item.labelKey)}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              filter: (item.labelKey === "shortcut.dallahPodcast" || item.labelKey === "shortcut.burjeelPodcast" || item.labelKey === "shortcut.adminPortal") ? "brightness(0) invert(1)" : "none",
            }}
          />
        </div>
      ) : (
        <ApiImage
          src={item.icon}
          alt={t(item.labelKey)}
          style={{
            width: "88px",
            height: "88px",
            borderRadius: theme.radiusLg,
            objectFit: "cover",
          }}
        />
      )}
      <span
        style={{
          fontFamily: fontFamily,
          fontSize: TYPE_SCALE.base,
          fontWeight: WEIGHT.semibold,
          color: pressed ? theme.textInverse : theme.textMuted,
          textAlign: "center",
          transition: "color 0.15s",
        }}
      >
        {t(item.labelKey)}
      </span>
    </button>
  );
}

/* ─── Shortcut Tile — bare version for bottom row ─── */
function ShortcutTileBare({ item, onTap, onLongPress, isLocked }: { item: ShortcutItem; onTap: () => void; onLongPress: () => void; isLocked: boolean }) {
  const { theme } = useTheme();
  const { t, fontFamily } = useLocale();
  const [pressed, setPressed] = useState(false);

  // handleTap removed, using onTap from props

  const { handlers, handleClick } = useLongPress(onLongPress, 600);

  return (
    <button
      data-nav="true"
      onPointerDown={() => { handlers.onPointerDown(); setPressed(true); }}
      onPointerUp={() => { handlers.onPointerUp(); setPressed(false); }}
      onPointerLeave={() => { handlers.onPointerLeave(); setPressed(false); }}
      onClick={() => handleClick(onTap)}
      className="relative overflow-hidden flex flex-col items-center justify-center gap-2 transition-transform duration-150 cursor-pointer w-full h-full"
      style={{
        borderRadius: theme.radiusXl,
        backgroundColor: pressed ? theme.primary : "transparent",
        boxShadow: "none",
        outline: "none",
        transform: pressed ? "scale(0.96)" : "scale(1)",
        border: "none",
      }}
      aria-label={t(item.labelKey)}
    >
      {isLocked && <LockBadge />}
      <ApiImage
        src={item.icon}
        alt={t(item.labelKey)}
        style={{
          width: "120px",
          height: "120px",
          borderRadius: theme.radiusXl,
          objectFit: "cover",
        }}
      />
      <span
        style={{
          fontFamily: fontFamily,
          fontSize: TYPE_SCALE.base,
          fontWeight: WEIGHT.bold,
          color: pressed ? theme.textInverse : theme.textMuted,
          textAlign: "center",
          transition: "color 0.15s",
        }}
      >
        {t(item.labelKey)}
      </span>
    </button>
  );
}

/* ─── About Us Button — horizontal pill button ─── */
function AboutUsButton({ onTap, onLongPress, isLocked }: { onTap: () => void; onLongPress: () => void; isLocked: boolean }) {
  const { theme } = useTheme();
  const { t, fontFamily } = useLocale();
  const { onPointerDown, rippleElements } = useRipple("rgba(255,255,255,0.12)");
  const [pressed, setPressed] = useState(false);

  const { handlers, handleClick } = useLongPress(onLongPress, 600);

  return (
    <button
      data-nav="true"
      onPointerDown={(e) => { onPointerDown(e); handlers.onPointerDown(); setPressed(true); }}
      onPointerUp={() => { handlers.onPointerUp(); setPressed(false); }}
      onPointerLeave={() => { handlers.onPointerLeave(); setPressed(false); }}
      onClick={() => handleClick(onTap)}
      className="relative overflow-hidden flex items-center gap-3 transition-transform duration-150 cursor-pointer w-full h-full"
      style={{
        backgroundColor: pressed ? theme.primary : theme.surface,
        borderRadius: theme.radiusCard,
        padding: "12px 24px 12px 16px",
        boxShadow: pressed
          ? `0px 2px 8px 0px ${theme.primarySubtle}`
          : SHADOW.md,
        outline: "none",
        transform: pressed ? "scale(0.96)" : "scale(1)",
        border: pressed ? "none" : theme.cardBorder,
      }}
      aria-label="About Us"
    >
      {rippleElements}
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: SPACE[6],
          height: SPACE[6],
          borderRadius: theme.radiusLg,
          backgroundColor: pressed ? "rgba(255,255,255,0.2)" : theme.primaryLight,
          transition: "background-color 0.15s",
        }}
      >
        <HubIcon label="About Us" color={pressed ? theme.textInverse : theme.primary} />
      </div>
      <span
        style={{
          fontFamily: fontFamily,
          ...TEXT_STYLE.pageTitle,
          fontWeight: WEIGHT.semibold,
          color: pressed ? theme.textInverse : theme.textHeading,
          lineHeight: "26px",
          transition: "color 0.15s",
        }}
      >
        {t("general.aboutUs")}
      </span>
    </button>
  );
}

/* ─── Engagement Grid: 4×2 hub + bottom row ─── */
export function ServicesGrid({ 
  onOpenCategory, 
  onLaunchTool, 
  contained, 
  swapped, 
  compact,
  visibility = DEFAULT_VISIBILITY,
  onRequestPinSetup,
  lockMenu,
  onLockMenuChange: setLockMenu = () => {}
}: { 
  onOpenCategory?: (key: string) => void; 
  onLaunchTool?: (id: string) => void; 
  contained?: boolean; 
  swapped?: boolean; 
  compact?: boolean;
  visibility?: SectionVisibility;
  onRequestPinSetup?: () => void;
  lockMenu?: string | null;
  onLockMenuChange?: (val: string | null) => void;
}) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const lockedIds = useLockedApps();

  const shortcutItems = getShortcutItems(theme.id);
  const gridGap = compact ? "gap-3" : "gap-6";
  const bottomHeight = compact ? "140px" : "192px";

  const isHubItemVisible = (label: string) => {
    if (label === "Media") return visibility.show_iptv;
    if (label === "Reading") return visibility.show_resources;
    return true;
  };

  const isServiceVisible = (label: string) => {
    if (label === "Consultation") return visibility.show_care_plan;
    if (label === "Order Food") return visibility.show_food_menu;
    if (label === "Call") return visibility.show_care_team;
    return true;
  };

  return (
    <div className={`flex flex-col flex-1 min-h-0`}>
      {/* 4×2 hub grid */}
      <div className={`grid grid-cols-4 ${gridGap} flex-1 min-h-0`}>
        {[0, 1, 2, 3].map((col) => {
          const top = hubItems[col];
          const bottom = hubItems[col + 4];
          return (
            <div
              key={col}
              className={`flex flex-col ${gridGap}`}
            >
              <div className="flex-1 min-h-0">
                {isHubItemVisible(top.label) ? (
                  <HubCard
                    item={top}
                    onTap={() => {
                      if (lockedIds.has(top.labelKey)) setLockMenu(top.labelKey + "__open");
                      else onOpenCategory?.(top.label);
                    }}
                    onLongPress={() => setLockMenu(top.labelKey)}
                    isLocked={lockedIds.has(top.labelKey)}
                    contained={contained}
                    compact={compact}
                  />
                ) : <div className="w-full h-full" />}
              </div>
              <div className="flex-1 min-h-0">
                {isHubItemVisible(bottom.label) ? (
                  <HubCard
                    item={bottom}
                    onTap={() => {
                      if (lockedIds.has(bottom.labelKey)) setLockMenu(bottom.labelKey + "__open");
                      else onOpenCategory?.(bottom.label);
                    }}
                    onLongPress={() => setLockMenu(bottom.labelKey)}
                    isLocked={lockedIds.has(bottom.labelKey)}
                    contained={contained}
                    compact={compact}
                  />
                ) : <div className="w-full h-full" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Small fixed gap between hub grid and bottom row */}
      <div className="shrink-0" style={{ height: compact ? SPACE[2] : SPACE[4] }} />

      {/* Bottom row — services (default) or shortcuts (swapped) */}
      <div
        className={`grid grid-cols-4 ${gridGap} shrink-0 items-center`}
        style={{ height: bottomHeight }}
      >
        {swapped
          ? (
            <div
              className="col-span-4 grid grid-cols-4 gap-2 h-full items-center"
              style={{
                backgroundColor: theme.surface,
                borderRadius: theme.radiusCard,
                boxShadow: SHADOW.md,
                border: theme.cardBorder,
                padding: "12px 16px",
              }}
            >
              {shortcutItems.map((item) => (
                <ShortcutTileBare
                  key={item.labelKey}
                  item={item}
                  onTap={() => {
                    if (lockedIds.has(item.labelKey)) setLockMenu(item.labelKey + "__open");
                    else {
                      if (item.labelKey === "shortcut.mirror" && onLaunchTool) onLaunchTool("mirror");
                      else if (item.url === "roomcontrol" && onLaunchTool) onLaunchTool("roomcontrol");
                      else if (item.url) window.open(item.url, "_blank", "noopener,noreferrer");
                    }
                  }}
                  onLongPress={() => setLockMenu(item.labelKey)}
                  isLocked={lockedIds.has(item.labelKey)}
                />
              ))}
            </div>
          )
          : serviceItems.map((item) => (
              isServiceVisible(item.label) ? (
                <ServiceCard
                  key={item.label}
                  item={item}
                  contained={contained}
                  compact={compact}
                  onTap={() => {
                    if (lockedIds.has(item.label)) setLockMenu(item.label + "__open");
                    else onOpenCategory?.(item.label);
                  }}
                  onLongPress={() => setLockMenu(item.label)}
                  isLocked={lockedIds.has(item.label)}
                />
              ) : <div key={item.label} className="w-full h-full" />
            ))
        }
      </div>

      {lockMenu && (
        <AppLockMenu
          appId={lockMenu.replace("__open", "")}
          appName={t(lockMenu.replace("__open", ""))}
          isCurrentlyLocked={lockedIds.has(lockMenu.replace("__open", ""))}
          anchorRect={null}
          onClose={() => setLockMenu(null)}
          onRequestPinSetup={onRequestPinSetup || (() => {})}
          onOpenApp={lockMenu.endsWith("__open") 
            ? () => {
                const id = lockMenu.replace("__open", "");
                const hub = hubItems.find(h => h.labelKey === id || h.label === id);
                if (hub) onOpenCategory?.(hub.label);
                const svc = serviceItems.find(s => s.label === id);
                if (svc) onOpenCategory?.(svc.label);
                const sc = shortcutItems.find(s => s.labelKey === id);
                if (sc) {
                  if (sc.labelKey === "shortcut.mirror" && onLaunchTool) onLaunchTool("mirror");
                  else if (sc.url === "roomcontrol" && onLaunchTool) onLaunchTool("roomcontrol");
                  else if (sc.url) window.open(sc.url, "_blank", "noopener,noreferrer");
                }
              } 
            : undefined}
        />
      )}
    </div>
  );
}

/* ─── Right Column — shortcuts (default) or services (swapped) ─── */
export function ShortcutsColumn({ contained, onOpenSurvey, onLaunchTool, swapped, onRequestPinSetup }: { contained?: boolean; onOpenSurvey?: () => void; onLaunchTool?: (id: string) => void; swapped?: boolean; onRequestPinSetup?: () => void }) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const lockedIds = useLockedApps();
  const [lockMenu, setLockMenu] = useState<string | null>(null);

  const shortcutItems = getShortcutItems(theme.id);
  if (swapped) {
    return (
      <div className="flex flex-col h-full" style={{ gap: "36px" }}>
        {/* Services section — matches hub grid height (flex-1) */}
        <div className="flex flex-col gap-6 flex-1 min-h-0 justify-end">
          {serviceItems.map((item) => (
            <div key={item.label} className="flex-1 min-h-0">
              <ServiceCard
                item={item}
                contained={contained}
                compact
                onTap={() => {
                  if (lockedIds.has(item.label)) setLockMenu(item.label + "__open");
                }}
                onLongPress={() => setLockMenu(item.label)}
                isLocked={lockedIds.has(item.label)}
              />
            </div>
          ))}
        </div>

        {/* Share Feedback — fixed 192px to align with shortcuts row */}
        <div className="shrink-0" style={{ height: "192px" }}>
          <SurveyCardFilled
            onOpen={() => {
              if (lockedIds.has("service.shareFeedback")) setLockMenu("service.shareFeedback__open");
              else onOpenSurvey?.();
            }}
            onLongPress={() => setLockMenu("service.shareFeedback")}
            isLocked={lockedIds.has("service.shareFeedback")}
          />
        </div>
        {lockMenu && (
          <AppLockMenu
            appId={lockMenu.replace("__open", "")}
            appName={t(lockMenu.replace("__open", ""))}
            isCurrentlyLocked={lockedIds.has(lockMenu.replace("__open", ""))}
            anchorRect={null}
            onClose={() => setLockMenu(null)}
            onRequestPinSetup={onRequestPinSetup || (() => {})}
            onOpenApp={lockMenu.endsWith("__open") ? () => {
              const id = lockMenu.replace("__open", "");
              if (id === "service.shareFeedback") onOpenSurvey?.();
              else onOpenSurvey?.(); // fallback
            } : undefined}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ gap: "36px" }}>
      {/* Shortcuts container — single white card behind all */}
      <div
        className="flex flex-col gap-3 flex-1 min-h-0"
        style={{
          backgroundColor: contained ? "transparent" : theme.surface,
          borderRadius: theme.radiusCard,
          boxShadow: contained ? "none" : SHADOW.md,
          border: contained ? "none" : theme.cardBorder,
          padding: "16px",
        }}
      >
        {/* Vertical tiles */}
        <div className="flex flex-col gap-2 flex-1">
          {shortcutItems.map((item) => (
            <ShortcutTileCompact
              key={item.labelKey}
              item={item}
              onTap={() => {
                if (lockedIds.has(item.labelKey)) setLockMenu(item.labelKey + "__open");
                else {
                  if (item.labelKey === "shortcut.mirror" && onLaunchTool) onLaunchTool("mirror");
                  else if (item.url === "roomcontrol" && onLaunchTool) onLaunchTool("roomcontrol");
                  else if (item.url) window.open(item.url, "_blank", "noopener,noreferrer");
                }
              }}
              onLongPress={() => setLockMenu(item.labelKey)}
              isLocked={lockedIds.has(item.labelKey)}
            />
          ))}
        </div>
      </div>

      {/* Survey — separate card, same height as services row (190px) */}
      <div className="shrink-0" style={{ height: "192px" }}>
        <SurveyCardFilled
          onOpen={() => {
            if (lockedIds.has("service.shareFeedback")) setLockMenu("service.shareFeedback__open");
            else onOpenSurvey?.();
          }}
          onLongPress={() => setLockMenu("service.shareFeedback")}
          isLocked={lockedIds.has("service.shareFeedback")}
        />
      </div>
      {lockMenu && (
        <AppLockMenu
          appId={lockMenu.replace("__open", "")}
          appName={t(lockMenu.replace("__open", ""))}
          isCurrentlyLocked={lockedIds.has(lockMenu.replace("__open", ""))}
          anchorRect={null}
          onClose={() => setLockMenu(null)}
          onRequestPinSetup={onRequestPinSetup || (() => {})}
          onOpenApp={lockMenu.endsWith("__open") ? () => {
            const id = lockMenu.replace("__open", "");
            if (id === "service.shareFeedback") onOpenSurvey?.();
            else {
              const sc = shortcutItems.find(s => s.labelKey === id);
              if (sc) {
                if (sc.labelKey === "shortcut.mirror" && onLaunchTool) onLaunchTool("mirror");
                else if (sc.url === "roomcontrol" && onLaunchTool) onLaunchTool("roomcontrol");
                else if (sc.url) window.open(sc.url, "_blank", "noopener,noreferrer");
              }
            }
          } : undefined}
        />
      )}
    </div>
  );
}

/* ─── Quick Actions Row — horizontal stack for bottom row ─── */
export function QuickActionsRow({ vertical, contained, onOpenSurvey, onRequestPinSetup }: { vertical?: boolean; contained?: boolean; onOpenSurvey?: () => void; onRequestPinSetup?: () => void }) {
  const { t } = useLocale();
  const lockedIds = useLockedApps();
  const [lockMenu, setLockMenu] = useState<string | null>(null);

  return (
    <div className={`flex flex-col gap-3 ${vertical ? "h-full" : "shrink-0"}`}>
      <div
        className={vertical ? "flex flex-col gap-3 flex-1" : "grid grid-cols-4 gap-3"}
        style={vertical ? undefined : { height: "110px" }}
      >
        {serviceItems.map((item) => (
          <ServiceCard
            key={item.label}
            item={item}
            square={vertical}
            contained={contained}
            onTap={() => {
              if (lockedIds.has(item.label)) setLockMenu(item.label + "__open");
            }}
            onLongPress={() => setLockMenu(item.label)}
            isLocked={lockedIds.has(item.label)}
          />
        ))}
        {vertical && (
          <SurveyCard
            square
            contained={contained}
            onOpen={() => {
              if (lockedIds.has("service.survey")) setLockMenu("service.survey__open");
              else onOpenSurvey?.();
            }}
            onLongPress={() => setLockMenu("service.survey")}
            isLocked={lockedIds.has("service.survey")}
          />
        )}
      </div>
      {lockMenu && (
        <AppLockMenu
          appId={lockMenu.replace("__open", "")}
          appName={t(lockMenu.replace("__open", ""))}
          isCurrentlyLocked={lockedIds.has(lockMenu.replace("__open", ""))}
          anchorRect={null}
          onClose={() => setLockMenu(null)}
          onRequestPinSetup={onRequestPinSetup || (() => {})}
          onOpenApp={lockMenu.endsWith("__open") ? () => {
            const id = lockMenu.replace("__open", "");
            if (id === "service.survey") onOpenSurvey?.();
          } : undefined}
        />
      )}
    </div>
  );
}

/* ─── V3 Hub Grid: 2 cols × 4 rows for left sidebar ─── */
const v3HubOrder = [
  hubItems[3], hubItems[7],  // Games, Education
  hubItems[0], hubItems[2],  // Media, Social
  hubItems[1], hubItems[5],  // Reading, Internet
  hubItems[4], hubItems[6],  // Meeting, Tools
];

export function HubGridCompact({ 
  onOpenCategory,
  visibility = DEFAULT_VISIBILITY,
  onRequestPinSetup
}: { 
  onOpenCategory?: (key: string) => void;
  visibility?: SectionVisibility;
  onRequestPinSetup?: () => void;
}) {
  const { t } = useLocale();
  const lockedIds = useLockedApps();
  const [lockMenu, setLockMenu] = useState<string | null>(null);

  const isHubItemVisible = (label: string) => {
    if (label === "Media") return visibility.show_iptv;
    if (label === "Reading") return visibility.show_resources;
    return true;
  };

  return (
    <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
      {v3HubOrder.map((item) => (
        isHubItemVisible(item.label) ? (
          <HubCard
            key={item.label}
            item={item}
            onTap={() => {
              if (lockedIds.has(item.labelKey)) setLockMenu(item.labelKey + "__open");
              else onOpenCategory?.(item.label);
            }}
            onLongPress={() => setLockMenu(item.labelKey)}
            isLocked={lockedIds.has(item.labelKey)}
          />
        ) : <div key={item.label} className="w-full h-full" />
      ))}
      {lockMenu && (
        <AppLockMenu
          appId={lockMenu.replace("__open", "")}
          appName={t(lockMenu.replace("__open", ""))}
          isCurrentlyLocked={lockedIds.has(lockMenu.replace("__open", ""))}
          anchorRect={null}
          onClose={() => setLockMenu(null)}
          onRequestPinSetup={onRequestPinSetup || (() => {})}
          onOpenApp={lockMenu.endsWith("__open") ? () => {
            const id = lockMenu.replace("__open", "");
            const hub = hubItems.find(h => h.labelKey === id);
            if (hub) onOpenCategory?.(hub.label);
          } : undefined}
        />
      )}
    </div>
  );
}

/* ─── V3 Service Cards Row: standalone bottom row ─── */
export function ServiceCardsRow({ 
  onOpenCategory,
  visibility = DEFAULT_VISIBILITY,
  onRequestPinSetup
}: { 
  onOpenCategory?: (key: string) => void;
  visibility?: SectionVisibility;
  onRequestPinSetup?: () => void;
}) {
  const { t } = useLocale();
  const lockedIds = useLockedApps();
  const [lockMenu, setLockMenu] = useState<string | null>(null);

  const isServiceVisible = (label: string) => {
    if (label === "Consultation") return visibility.show_care_plan;
    if (label === "Order Food") return visibility.show_food_menu;
    if (label === "Call") return visibility.show_care_team;
    return true;
  };

  return (
    <div className="grid grid-cols-4 gap-6 shrink-0 items-center" style={{ height: "192px" }}>
      {serviceItems.map((item) => (
        isServiceVisible(item.label) ? (
          <ServiceCard
            key={item.label}
            item={item}
            onTap={() => {
              if (lockedIds.has(item.label)) setLockMenu(item.label + "__open");
              else onOpenCategory?.(item.label);
            }}
            onLongPress={() => setLockMenu(item.label)}
            isLocked={lockedIds.has(item.label)}
          />
        ) : <div key={item.label} className="w-full h-full" />
      ))}
      {lockMenu && (
        <AppLockMenu
          appId={lockMenu.replace("__open", "")}
          appName={t(lockMenu.replace("__open", ""))}
          isCurrentlyLocked={lockedIds.has(lockMenu.replace("__open", ""))}
          anchorRect={null}
          onClose={() => setLockMenu(null)}
          onRequestPinSetup={onRequestPinSetup || (() => {})}
          onOpenApp={lockMenu.endsWith("__open") ? () => {
            const id = lockMenu.replace("__open", "");
            const svc = serviceItems.find(s => s.label === id);
            if (svc) onOpenCategory?.(svc.label);
          } : undefined}
        />
      )}
    </div>
  );
}
