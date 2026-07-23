import { useEffect, useState } from "react";
import { ApiImage } from "./ApiImage";
import { Settings, Globe, Bell, Cast, AlertTriangle } from "lucide-react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW, TEXT_STYLE, SPACE } from "./ThemeContext";
import { useLocale } from "./i18n";
import svgPaths from "../../imports/svg-ca68x68c4i";
import { getPrayerTimes, PRAYER_KEYS, PRAYER_NAMES, formatPrayerTime, getPrayerStatus } from "../utils/prayerUtils";
import { Prayer } from "adhan";
import { ConnectionStatus } from "./ConnectionStatus";
import { useLongPress } from "../lib/useLongPress";
import { useNurseStore, nurseActions } from "./NurseDataStore";
import { fetchPatientForDevice } from "../lib/hospitalApi";
import { getDeviceInfo } from "../utils/androidBridge";

// Removed hardcoded prayerTimes

// Removed getNextPrayerIndex helper as we use prayerUtils now

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

export function TopBar({ showPrayer = true, onFajrTap, onDhuhrTap, onAsrTap, onMaghribTap, onIshaTap, onWeatherTap, onSettingsTap, onBellTap, unreadCount = 3, logoUrl, hideSettings = false, greeting }: { showPrayer?: boolean; onFajrTap?: () => void; onDhuhrTap?: () => void; onAsrTap?: () => void; onMaghribTap?: () => void; onIshaTap?: () => void; onWeatherTap?: () => void; onSettingsTap?: () => void; onBellTap?: () => void; unreadCount?: number; logoUrl?: string; hideSettings?: boolean; greeting?: string }) {
  const { theme, castDevice, setLocale, locale: currentLocale } = useTheme();
  const { t, locale, isRTL, fontFamily } = useLocale();
  const [time, setTime] = useState(new Date());
  const [prayerData, setPrayerData] = useState(() => getPrayerStatus(new Date()));
  const [temperature, setTemperature] = useState<number | null>(null);

  const nurseStore = useNurseStore();
  const [showConnDetails, setShowConnDetails] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);

  const handleRetryConnection = () => {
    setRetryLoading(true);
    const info = getDeviceInfo();
    const serial = info?.serial || "";
    if (serial) {
      fetchPatientForDevice(serial)
        .then((result) => {
          if (result) {
            const p = result.patient;
            nurseActions.updatePatientFromApi({
              name: p.name || undefined,
              nameAr: p.nameAr || undefined,
              mrn: p.mrn || undefined,
              room: p.room || undefined,
              bed: p.bed || undefined,
              sex: p.sex || undefined,
              dob: p.dob || undefined,
              admissionDate: p.admissionDate || undefined,
              dischargeDate: p.dischargeDate || undefined,
            });
            nurseActions.setHisConnected(true);
            setShowConnDetails(false);
          }
        })
        .finally(() => setRetryLoading(false));
    } else {
      setRetryLoading(false);
    }
  };

  const weatherLongPress = useLongPress(() => {
    window.location.reload();
  }, 1000);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const city = theme.location || "Jeddah";
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=01a477912e47daf2010808cc62015829`
        );
        const data = await response.json();
        if (data.main && data.main.temp !== undefined) {
          setTemperature(Math.round(data.main.temp));
        }
      } catch (error) {
        console.error("Weather fetch error:", error);
      }
    };

    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, [theme.location]);


  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now);
      setPrayerData(getPrayerStatus(now, theme.location));
    }, 1000);
    return () => clearInterval(interval);
  }, []);



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
      <div className="flex items-center gap-4 h-full">
        <a 
          href={theme.id === "imc" ? `https://www.imc.med.sa/${locale}` : theme.hospitalWebsiteUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-start h-full transition-opacity hover:opacity-80 active:opacity-60"
        >
          <ApiImage
            alt={theme.hospitalName}
            src={logoUrl || theme.logoUrl}
            style={{ height: SPACE[10], width: "auto", maxWidth: "300px", objectFit: "contain" }}
          />
        </a>
        <ConnectionStatus />
      </div>

      {/* Center: Prayer Times — always dead-center on screen */}
      {showPrayer ? (
        <div className="flex items-center justify-center gap-1">
          {PRAYER_KEYS.map((pKey) => {
            const isNext = pKey === prayerData.next;
            const prayerName = t(PRAYER_NAMES[pKey]);
            const prayerTime = formatPrayerTime(prayerData.times.timeForPrayer(pKey), locale);
            
            let onTap = undefined;
            if (pKey === Prayer.Fajr) onTap = onFajrTap;
            else if (pKey === Prayer.Dhuhr) onTap = onDhuhrTap;
            else if (pKey === Prayer.Asr) onTap = onAsrTap;
            else if (pKey === Prayer.Maghrib) onTap = onMaghribTap;
            else if (pKey === Prayer.Isha) onTap = onIshaTap;

            return (
              <div key={pKey} className="flex items-center">
                <div
                  className={`flex flex-col items-center px-4 py-1.5 rounded-xl${onTap ? " cursor-pointer" : ""}`}
                  style={{ backgroundColor: "transparent" }}
                  onClick={onTap}
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
                    {prayerTime}
                  </span>
                </div>
                {pKey !== PRAYER_KEYS[PRAYER_KEYS.length - 1] && (
                  <div style={{ width: "1px", height: "26px", backgroundColor: "rgba(0,0,0,0.12)", borderRadius: "1px", flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div />
      )}

      {/* Right: Clock/Date + Weather + Lang + Settings — always right-aligned */}
      <div className="flex items-center justify-end gap-4">
        {/* Optional friendly greeting (kids layout) — renders only when provided */}
        {greeting && (
          <span
            style={{
              fontFamily: fontFamily,
              ...TEXT_STYLE.bodyEmphasis,
              fontWeight: WEIGHT.bold,
              color: theme.textHeading,
              whiteSpace: "nowrap",
            }}
          >
            {greeting}
          </span>
        )}

        {/* Clock + Date stacked (with connection warning icon beside clock) */}
        <div className="relative flex items-center gap-2.5">
          {!nurseStore.isHisConnected && (
            <div className="relative">
              <button
                onClick={() => setShowConnDetails(!showConnDetails)}
                className="flex items-center justify-center rounded-full cursor-pointer transition-transform hover:scale-110 active:scale-95"
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#EF4444",
                }}
                title={t("connection.failed")}
                aria-label={t("connection.failed")}
              >
                <AlertTriangle size={17} className="animate-pulse" />
              </button>

              {showConnDetails && (
                <div
                  className="absolute right-0 top-full mt-2 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-left"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.95)",
                    color: "#fff",
                    borderColor: "rgba(255, 255, 255, 0.25)",
                    backdropFilter: "blur(12px)",
                    minWidth: "260px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <AlertTriangle size={18} className="shrink-0 animate-pulse" />
                  <div className="flex flex-col text-xs flex-1">
                    <span className="font-bold">{t("connection.failed")}</span>
                    <span className="opacity-90">{t("connection.showingDemo")}</span>
                  </div>
                  <button
                    onClick={handleRetryConnection}
                    disabled={retryLoading}
                    className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {retryLoading ? "..." : t("connection.retry")}
                  </button>
                </div>
              )}
            </div>
          )}

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
          {...weatherLongPress.handlers}
          onClick={() => weatherLongPress.handleClick(onWeatherTap || (() => {}))}
        >
          <SunIcon />
          <span
            style={{
              fontFamily: fontFamily,
              ...TEXT_STYLE.bodyEmphasis,
              color: theme.textHeading,
            }}
          >
            {temperature !== null ? `${temperature}°C` : "38°C"}

          </span>
        </div>

        {/* Lang */}
        <div className="relative">
          <button
            data-nav="true"
            onClick={() => {
              if (currentLocale === "en") setLocale("ar");
              else setLocale("en");
            }}
            className="rounded-full cursor-pointer flex items-center justify-center transition-transform active:scale-90"
            style={{ 
              backgroundColor: theme.primarySubtle, 
              width: theme.touchTargetMin, 
              height: theme.touchTargetMin,
              outline: 'none',
              border: 'none',
            }}
            aria-label="Language"
          >
            <Globe size={20} style={{ color: theme.primary }} />
          </button>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            data-nav="true"
            className="rounded-full cursor-pointer flex items-center justify-center transition-transform active:scale-90"
            style={{ 
              backgroundColor: theme.primarySubtle, 
              width: theme.touchTargetMin, 
              height: theme.touchTargetMin,
              outline: 'none',
              border: 'none',
            }}
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
        </div>

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

        {/* Settings — hidden in the kids layout (hideSettings) */}
        {!hideSettings && (
          <div className="relative">
            <button
              data-nav="true"
              className="rounded-full cursor-pointer flex items-center justify-center transition-transform active:scale-90"
              style={{
                backgroundColor: theme.primarySubtle,
                width: theme.touchTargetMin,
                height: theme.touchTargetMin,
                outline: 'none',
                border: 'none',
              }}
              aria-label="Settings"
              onClick={onSettingsTap}
            >
              <Settings size={20} style={{ color: theme.primary }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}