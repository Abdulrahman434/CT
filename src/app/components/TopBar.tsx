import { useEffect, useState } from "react";
import { Settings, Globe, Bell, Cast } from "lucide-react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW, TEXT_STYLE, SPACE } from "./ThemeContext";
import { useLocale } from "./i18n";
import svgPaths from "../../imports/svg-ca68x68c4i";

const prayerTimes = [
  { nameKey: "prayer.fajr", time: "05:46", hour: 5, min: 46 },
  { nameKey: "prayer.dhuhr", time: "12:36", hour: 12, min: 36 },
  { nameKey: "prayer.asr", time: "15:56", hour: 15, min: 56 },
  { nameKey: "prayer.maghrib", time: "18:26", hour: 18, min: 26 },
  { nameKey: "prayer.isha", time: "19:27", hour: 19, min: 27 },
];

function getNextPrayerIndex(now: Date): number {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < prayerTimes.length; i++) {
    const pm = prayerTimes[i].hour * 60 + prayerTimes[i].min;
    if (currentMinutes < pm) return i;
  }
  return 0;
}

function SunIcon() {
  return (
    <div className="relative shrink-0 size-[22px]">
      <svg className="block size-full" fill="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip_sun)">
          <path d={svgPaths.p3adb3b00} stroke="#E8A530" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 1.33333V2.66667" stroke="#E8A530" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 13.3333V14.6667" stroke="#E8A530" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p11bc9dc0} stroke="#E8A530" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p191ca260} stroke="#E8A530" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M1.33333 8H2.66667" stroke="#E8A530" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M13.3333 8H14.6667" stroke="#E8A530" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.pe73b76f} stroke="#E8A530" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1df25380} stroke="#E8A530" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip_sun">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

export function TopBar({ showPrayer = true, onFajrTap, onDhuhrTap, onWeatherTap, onSettingsTap, onBellTap, onIshaTap, onMaghribTap, unreadCount = 3 }: { showPrayer?: boolean; onFajrTap?: () => void; onDhuhrTap?: () => void; onWeatherTap?: () => void; onSettingsTap?: () => void; onBellTap?: () => void; onIshaTap?: () => void; onMaghribTap?: () => void; unreadCount?: number }) {
  const { theme, castDevice, setLocale, locale: currentLocale } = useTheme();
  const { t, locale, isRTL, fontFamily } = useLocale();
  const [time, setTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState(() => getNextPrayerIndex(new Date()));
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
      setNextPrayer(getNextPrayerIndex(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /* Click on logo area to open Care Medical website */
  const handleLogoTap = () => {
    window.open("https://care.med.sa/", "_blank");
  };

  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? t("topbar.pm") : t("topbar.am");
  const displayHours = hours % 12 || 12;

  const dateStr = time.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="grid shrink-0 w-full items-center"
      style={{
        height: "104px",
        backgroundColor: theme.surface,
        padding: `${SPACE[2]} ${SPACE[4]}`,
        boxShadow: SHADOW.lg,
        borderBottom: theme.cardBorder !== "none" ? theme.cardBorder : undefined,
        gridTemplateColumns: "1fr auto 1fr",
      }}
    >
      {/* Left: Logo — always left-aligned within its column */}
      <div className="flex items-center justify-start h-full" onClick={handleLogoTap}>
        <img
          alt={theme.hospitalName}
          src={theme.logoUrl}
          style={{ height: SPACE[10], width: "auto", maxWidth: "300px", objectFit: "contain" }}
        />
      </div>

      {/* Center: Prayer Times — always dead-center on screen */}
      {showPrayer ? (
        <div className="flex items-center justify-center gap-1">
          {prayerTimes.map((p, i) => {
            const isNext = i === nextPrayer;
            const prayerName = t(p.nameKey);
            return (
              <div key={p.nameKey} className="flex items-center">
                <div
                  className={`flex flex-col items-center px-4 py-1.5 rounded-xl${p.nameKey === "prayer.fajr" || p.nameKey === "prayer.dhuhr" || p.nameKey === "prayer.isha" || p.nameKey === "prayer.maghrib" ? " cursor-pointer" : ""}`}
                  style={{
                    backgroundColor: "transparent",
                  }}
                  onClick={p.nameKey === "prayer.fajr" ? onFajrTap : p.nameKey === "prayer.dhuhr" ? onDhuhrTap : p.nameKey === "prayer.isha" ? onIshaTap : p.nameKey === "prayer.maghrib" ? onMaghribTap : undefined}
                >
                  <span
                    style={{
                      fontFamily: fontFamily,
                      ...TEXT_STYLE.micro,
                      letterSpacing: isRTL ? "0px" : "0.5px",
                      color: isNext ? theme.accent : theme.textMuted,
                      lineHeight: "15px",
                    }}
                  >
                    {prayerName}
                  </span>
                  <span
                    style={{
                      fontFamily: fontFamily,
                      ...TEXT_STYLE.bodyEmphasis,
                      fontWeight: WEIGHT.bold,
                      color: isNext ? theme.accent : theme.textHeading,
                      lineHeight: "20px",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {p.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div />
      )}

      {/* Right: Clock/Date + Weather + Lang + Settings — always right-aligned */}
      <div className="flex items-center justify-end gap-4">
        {/* Clock + Date stacked */}
        <div className="flex flex-col items-end">
          <span
            style={{
              fontFamily: fontFamily,
              ...TEXT_STYLE.pageTitle,
              color: theme.textHeading,
              lineHeight: "25px",
              textAlign: "end",
            }}
          >
            {displayHours}:{minutes} {ampm}
          </span>
          <span
            style={{
              fontFamily: fontFamily,
              ...TEXT_STYLE.caption,
              fontWeight: WEIGHT.normal,
              color: theme.textMuted,
              lineHeight: "16px",
              textAlign: "end",
            }}
          >
            {dateStr}
          </span>
        </div>

        {/* Weather */}
        <div
          data-nav="true"
          tabIndex={0}
          className="flex items-center gap-2 cursor-pointer rounded-full"
          style={{
            backgroundColor: "rgba(232,165,48,0.10)",
            height: theme.touchTargetMin,
            padding: `0 ${SPACE[2]}`,
          }}
          onClick={onWeatherTap}
        >
          <SunIcon />
          <span
            style={{
              fontFamily: fontFamily,
              ...TEXT_STYLE.bodyEmphasis,
              color: theme.textHeading,
            }}
          >
            38°C
          </span>
        </div>

        {/* Lang */}
        <button
          data-nav="true"
          onClick={() => setLocale(currentLocale === "en" ? "ar" : "en")}
          className="rounded-full cursor-pointer flex items-center justify-center"
          style={{ backgroundColor: theme.primarySubtle, width: theme.touchTargetMin, height: theme.touchTargetMin }}
          aria-label="Language"
        >
          <Globe size={20} style={{ color: theme.primary }} />
        </button>

        {/* Notifications Bell */}
        <button
          data-nav="true"
          className="rounded-full cursor-pointer flex items-center justify-center relative"
          style={{ backgroundColor: theme.primarySubtle, width: theme.touchTargetMin, height: theme.touchTargetMin }}
          aria-label="Notifications"
          onClick={onBellTap}
        >
          <Bell size={20} style={{ color: theme.primary }} />
          {unreadCount > 0 && (
            <div
              className="absolute flex items-center justify-center"
              style={{
                top: "-2px",
                right: "-2px",
                minWidth: "18px",
                height: "18px",
                borderRadius: theme.radiusFull,
                backgroundColor: "#D10044",
                border: `2px solid ${theme.surface}`,
                padding: "0 4px",
              }}
            >
              <span
                style={{
                  fontFamily: theme.fontFamily,
                  ...TEXT_STYLE.micro,
                  fontWeight: WEIGHT.bold,
                  color: theme.textInverse,
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </div>
          )}
        </button>

        {/* Cast indicator — pulsing when actively casting */}
        {castDevice && (
          <button
            data-nav="true"
            className="rounded-full cursor-pointer flex items-center justify-center relative"
            style={{
              backgroundColor: theme.primarySubtle,
              width: theme.touchTargetMin,
              height: theme.touchTargetMin,
              animation: "castPulse 2s ease-in-out infinite",
            }}
            aria-label="Casting"
            onClick={onSettingsTap}
          >
            <Cast size={20} style={{ color: theme.primary }} />
            {/* Active dot */}
            <div
              className="absolute"
              style={{
                top: "6px",
                right: "6px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: theme.primary,
                border: `2px solid ${theme.surface}`,
              }}
            />
          </button>
        )}

        {/* Settings — always visible */}
        <button
          data-nav="true"
          className="rounded-full cursor-pointer flex items-center justify-center"
          style={{ backgroundColor: theme.primarySubtle, width: theme.touchTargetMin, height: theme.touchTargetMin }}
          aria-label="Settings"
          onClick={onSettingsTap}
        >
          <Settings size={20} style={{ color: theme.primary }} />
        </button>
      </div>
    </div>
  );
}