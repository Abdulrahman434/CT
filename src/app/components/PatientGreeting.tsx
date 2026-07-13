import { useState, useEffect } from "react";
import { fetchPatientForDevice } from "../lib/hospitalApi";
import { isAndroidApp, getDeviceInfo } from "../utils/androidBridge";
import { useTheme, WEIGHT, SHADOW, TEXT_STYLE, SPACE } from "./ThemeContext";
import { useLocale } from "./i18n";
import { useRipple } from "./useRipple";
import { HelpCircle, LogOut } from "lucide-react";
import { AutoCarousel } from "./AutoCarousel";
import { useNurseStore } from "./NurseDataStore";
import { ConfirmDialog } from "./ConfirmDialog";
import { useGuestMode } from "../lib/guestMode";
import { useAuth } from "./AuthContext";
import svgPaths from "../../imports/svg-ca68x68c4i";
import { getSavedHeroImage, isSlideshowEnabled } from "../lib/backgroundPrefs";

function AboutUsIcon({ color }: { color?: string }) {
  const { theme } = useTheme();
  const iconColor = color || theme.primary;
  return (
    <div className="relative shrink-0 size-[20px]">
      <svg className="block size-full" fill="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip_about_greeting)">
          <path d={svgPaths.p14d24500} stroke={iconColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 13.3333V10" stroke={iconColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 6.66667H10.0083" stroke={iconColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
        <defs>
          <clipPath id="clip_about_greeting">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

export function PatientGreeting({ 
  onOpenAboutUs, 
  onOpenTour, 
  fillImage,
  showAboutUs = true,
  onImageTap
}: { 
  onOpenAboutUs?: () => void; 
  onOpenTour?: () => void; 
  fillImage?: boolean;
  showAboutUs?: boolean;
  onImageTap?: (url: string) => void;
}) {
  const [pressed, setPressed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { theme } = useTheme();
  const { t, isRTL, fontFamily } = useLocale();
  const rippleElements = useRipple(theme.primarySubtle).rippleElements;
  const nurseStore = useNurseStore();
  const { isGuest } = useGuestMode();
  const { logout } = useAuth();

  // Data now comes from NurseDataStore (synchronized at App level)
  const p = nurseStore.patient;

  // Name: i18n demo key → manual/API name (with RTL/Arabic support)
  const displayName = isRTL && p.nameAr
    ? p.nameAr
    : (p.nameKey ? t(p.nameKey) : p.name);

  // Other fields
  const displayMrn    = p.mrn;
  const displayRoom   = p.room;
  const displayBed    = p.bed;
  const displayAdmit  = p.admissionDate;

  // Hero image fallback chain:
  // 1. User-saved image from Backgrounds preferences
  // 2. theme.heroImageUrls (hardcoded per hospital brand)
  const [heroImages, setHeroImages] = useState<string[]>(() => {
    const saved = getSavedHeroImage();
    if (saved && !isSlideshowEnabled()) return [saved];
    return theme.heroImageUrls ?? [];
  });

  useEffect(() => {
    const onHeroChange = (e: Event) => {
      const url = (e as CustomEvent<string | null>).detail;
      if (url) setHeroImages([url]);
      else setHeroImages(theme.heroImageUrls ?? []);
    };
    const onSlideshowChange = (e: Event) => {
      const enabled = (e as CustomEvent<boolean>).detail;
      if (enabled) setHeroImages(theme.heroImageUrls ?? []);
    };
    window.addEventListener("hero-image-changed",  onHeroChange);
    window.addEventListener("slideshow-changed",    onSlideshowChange);
    return () => {
      window.removeEventListener("hero-image-changed",  onHeroChange);
      window.removeEventListener("slideshow-changed",    onSlideshowChange);
    };
  }, [theme.heroImageUrls]);

  return (
    <div
      className={`relative overflow-hidden w-full ${fillImage ? "flex-1 flex flex-col min-h-0" : "shrink-0"}`}
      style={{
        textAlign: isRTL ? "right" : "left",
        backgroundColor: theme.surface,
        borderRadius: theme.radiusCard,
        boxShadow: SHADOW.md,
        border: theme.cardBorder,
      }}
    >
      {rippleElements}

      {/* Help / App Tour button */}
      <button
        className="absolute flex items-center justify-center rounded-full z-10 cursor-pointer active:scale-90 transition-transform"
        style={{
          [isRTL ? "left" : "right"]: SPACE[2],
          top: SPACE[2],
          width: theme.touchTargetMin,
          height: theme.touchTargetMin,
          backgroundColor: theme.primarySubtle,
          border: "none",
          outline: "none",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onOpenTour?.();
        }}
        aria-label="Application Tour"
      >
        <HelpCircle size={20} style={{ color: theme.primary }} strokeWidth={2} />
      </button>

      {/* Text content */}
      <div style={{ padding: `${theme.cardPadding} ${theme.cardPadding} ${SPACE[2]} ${theme.cardPadding}` }}>
        <p
          style={{
            fontFamily: fontFamily,
            ...TEXT_STYLE.subtitle,
            fontWeight: WEIGHT.medium,
            color: theme.textMuted,
          }}
        >
          {t("general.hello")}
        </p>
        {!isGuest && (
          <p
            style={{
              fontFamily: fontFamily,
              ...TEXT_STYLE.display,
              fontWeight: WEIGHT.extrabold,
              color: theme.textHeading,
            }}
          >
            {displayName}
          </p>
        )}
        <div style={{ paddingTop: SPACE[1] }}>
          <p
            style={{
              fontFamily: fontFamily,
              ...TEXT_STYLE.body,
              color: theme.textMuted,
              margin: 0,
            }}
          >{t("general.welcome", theme.hospitalShortName)}</p>
        </div>

        {/* Badges: [Room] [Ext] [Logout] */}
        {!isGuest && (
          <div className="flex items-center flex-wrap gap-2" style={{ paddingTop: SPACE[2] }}>
            <div
              className="flex items-center px-3 py-1.5"
              style={{ backgroundColor: theme.primarySubtle, borderRadius: theme.radiusFull }}
            >
              <span
                style={{
                  fontFamily: fontFamily,
                  ...TEXT_STYLE.pill,
                  color: theme.primary,
                }}
              >
                {t("greeting.mrn")} {displayMrn}
              </span>
            </div>
            <div
              className="flex items-center px-3 py-1.5"
              style={{ backgroundColor: theme.primarySubtle, borderRadius: theme.radiusFull }}
            >
              <span
                style={{
                  fontFamily: fontFamily,
                  ...TEXT_STYLE.pill,
                  color: theme.primary,
                }}
              >
                {t("greeting.room", displayRoom)}
              </span>
            </div>
            {displayBed && (
              <div
                className="flex items-center px-3 py-1.5"
                style={{
                  backgroundColor: theme.primarySubtle,
                  borderRadius: theme.radiusFull,
                }}
              >
                <span style={{
                  fontFamily,
                  ...TEXT_STYLE.pill,
                  color: theme.primary,
                }}>
                  {t("greeting.bed")} {displayBed}
                </span>
              </div>
            )}

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer active:scale-95 transition-transform border-none outline-none"
              style={{ 
                backgroundColor: "#FEE2E2", 
                borderRadius: theme.radiusFull,
              }}
            >
              <LogOut size={12} style={{ color: "#EF4444" }} />
              <span
                style={{
                  fontFamily: fontFamily,
                  ...TEXT_STYLE.pill,
                  color: "#EF4444",
                  fontWeight: WEIGHT.bold,
                }}
              >
                {t("general.logout")}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Hospital image */}
      <div
        className={`overflow-hidden mx-4 mb-4 ${fillImage ? "flex-1 min-h-[120px]" : "shrink-0"} ${
          onImageTap ? "cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all duration-200" : ""
        }`}
        style={{
          height: fillImage ? undefined : SPACE[12],
          borderRadius: theme.radiusLg,
          position: "relative",
        }}
      >
        <AutoCarousel
          images={heroImages}
          objectPosition={theme.heroCropPosition || "50% 15%"}
          objectFit="cover"
          intervalSeconds={theme.slideshowInterval}
          onImageClick={onImageTap}
        />
      </div>

      {/* About Us — pill below image */}
      {showAboutUs && (
        <div className="mx-4 mb-4" style={{ position: "relative", zIndex: 10 }}>
          <button
            data-nav="true"
            className="flex items-center justify-center gap-2.5 w-full py-3 cursor-pointer transition-transform duration-150"
            style={{
              backgroundColor: pressed ? theme.primaryDark : theme.primary,
              transform: pressed ? "scale(0.96)" : "scale(1)",
              border: "none",
              outline: "none",
              borderRadius: theme.radiusMd,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onOpenAboutUs?.();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              setPressed(true);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              setPressed(false);
            }}
            onPointerLeave={() => setPressed(false)}
          >
            <AboutUsIcon color={theme.textInverse} />
            <span
              style={{
                fontFamily: fontFamily,
                ...TEXT_STYLE.buttonSm,
                color: theme.textInverse,
                letterSpacing: "0.3px",
              }}
            >
              {t("general.aboutUs")}
            </span>
          </button>
        </div>
      )}

      <ConfirmDialog
        visible={showLogoutConfirm}
        title={t("general.logout")}
        message={t("settings.account.overview.removeConfirm")}
        confirmLabel={t("general.logout")}
        variant="danger"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
