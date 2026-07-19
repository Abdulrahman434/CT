import React, { useMemo, useState } from "react";
import { useTheme, SHADOW, buildTheme } from "./ThemeContext";
import { useLocale, type Locale } from "./i18n";
import { toast } from "sonner";
import {
  Hand, Globe, UserRound, Shield, BellRing, SlidersHorizontal,
  Moon, Sun, DatabaseZap, Volume2, VolumeX, Bluetooth, MonitorPause,
  FileCheck2, Check, ChevronLeft, Home,
} from "lucide-react";
import { useNurseStore } from "./NurseDataStore";
import { markOnboardingComplete } from "../lib/onboardingStore";
import { isAccountSet } from "../lib/accountAuth";
import { MyPreferencesDialog } from "./MyAccountDialog";
import { BluetoothDialog } from "./SettingsPanel";
import { bluetooth as bluetoothBridge, isAndroidApp } from "../utils/androidBridge";

/* ═══════════════════════════════════════════════════════════════════════════
 * First-run onboarding — "Setup your Preferences"
 *
 * Full-screen page (not a popup). Its visual language mirrors the other
 * internal pages (Patient Services / Meal Ordering): a brand-gradient canvas,
 * a white page header with a home button + language switcher, and a large
 * rounded white content card that presents one question at a time with clear,
 * tappable answer cards.
 *
 * Data-driven step machine: STEP_SEQUENCE is the single source of truth for
 * order and branching. Steps marked extendedOnly appear only on the
 * "Yes, continue setup" branch; both branches end on the shared Consent step.
 * ═══════════════════════════════════════════════════════════════════════════ */

type StepId =
  | "welcome" | "language" | "displayName" | "pin" | "prayer" | "decision"
  | "theme" | "dataClear" | "notifications" | "bluetooth" | "screensaver"
  | "consent";

interface StepDef {
  id: StepId;
  /** Only shown on the "Yes, continue setup" branch. */
  extendedOnly?: boolean;
}

const STEP_SEQUENCE: StepDef[] = [
  { id: "welcome" },
  { id: "language" },
  { id: "displayName" },
  { id: "pin" },
  { id: "prayer" },
  { id: "decision" },
  { id: "theme", extendedOnly: true },
  { id: "dataClear", extendedOnly: true },
  { id: "notifications", extendedOnly: true },
  { id: "bluetooth", extendedOnly: true },
  { id: "screensaver", extendedOnly: true },
  { id: "consent" },
];

const STEP_ICONS: Record<StepId, React.ComponentType<{ size?: number | string; style?: React.CSSProperties }>> = {
  welcome: Hand,
  language: Globe,
  displayName: UserRound,
  pin: Shield,
  prayer: BellRing,
  decision: SlidersHorizontal,
  theme: Moon,
  dataClear: DatabaseZap,
  notifications: Volume2,
  bluetooth: Bluetooth,
  screensaver: MonitorPause,
  consent: FileCheck2,
};

const readLS = (k: string): string | null => {
  try { return localStorage.getItem(k); } catch { return null; }
};

export function OnboardingWizard({
  admitRef,
  onComplete,
  onStartTour,
  onStartSlideshow,
  hidden = false,
}: {
  admitRef: string | null;
  onComplete: () => void;
  onStartTour: () => void;
  onStartSlideshow: () => void;
  /** Keeps the wizard mounted (state intact) but invisible — used while
   *  the welcome tour plays on top of it. */
  hidden?: boolean;
}) {
  const {
    theme: activeTheme, allConfigs, activeConfigId, locale, darkMode,
    setLocale, setDarkMode, setPrayerAlarm,
  } = useTheme();
  const { t: tr, isRTL, dir } = useLocale();

  // Always render the card in the active hospital's LIGHT theme so it stays
  // readable on the white surface even when the app is in dark mode.
  const t = useMemo(() => {
    const activeConfig = allConfigs?.find(c => c.id === activeConfigId);
    if (!activeConfig) return activeTheme;
    const baseLight = buildTheme(activeConfig, false);
    return {
      ...baseLight,
      fontFamily: locale === "ar" ? baseLight.fontFamilyAr : baseLight.fontFamily,
    };
  }, [allConfigs, activeConfigId, activeTheme, locale]);

  const fontFamily = t.fontFamily;
  const nurseStore = useNurseStore();

  const [stepId, setStepId] = useState<StepId>("welcome");
  const [extended, setExtended] = useState(() => readLS("careinn-data-clear-policy") != null);

  /* per-step answers — pre-filled from storage so re-opening shows current choices */
  const [selLocale, setSelLocale] = useState<Locale>(() => (readLS("careinn-locale") as Locale) || locale || "en");
  const [useFileName, setUseFileName] = useState(() => readLS("careinn-display-name-mode") !== "custom");
  const [nameEn, setNameEn] = useState(() => readLS("careinn-display-name") || "");
  const [nameAr, setNameAr] = useState(() => readLS("careinn-display-name-ar") || "");
  const [selDark, setSelDark] = useState(() => {
    const v = readLS("careinn-theme-mode");
    return v ? v === "dark" : darkMode;
  });
  const [selPolicy, setSelPolicy] = useState<"daily" | "24h-idle" | "discharge" | null>(
    () => (readLS("careinn-data-clear-policy") as any) || null
  );
  const [selSound, setSelSound] = useState<"sound" | "silent" | null>(
    () => (readLS("careinn-notification-sound") as any) || null
  );
  const [selSaver, setSelSaver] = useState<"30s" | "1m" | "5m" | null>(
    () => (readLS("careinn-screensaver-timeout") as any) || null
  );
  const [tourSeen, setTourSeen] = useState(() => !!readLS("careinn-consent-tour-seen"));
  const [termsAgreed, setTermsAgreed] = useState(() => !!readLS("careinn-consent-terms-agreed"));

  /* reused native flows rendered on top of the wizard */
  const [overlay, setOverlay] = useState<"pin" | "bluetooth" | null>(null);
  const [btDevice, setBtDevice] = useState<string | null>(null);

  const visibleSteps = useMemo(
    () => STEP_SEQUENCE.filter(s => !s.extendedOnly || extended),
    [extended]
  );
  const stepIndex = visibleSteps.findIndex(s => s.id === stepId);

  const goNext = (fromSteps?: StepDef[]) => {
    const steps = fromSteps ?? visibleSteps;
    const i = steps.findIndex(s => s.id === stepId);
    if (i >= 0 && i < steps.length - 1) setStepId(steps[i + 1].id);
  };
  const goBack = () => {
    if (stepIndex > 0) setStepId(visibleSteps[stepIndex - 1].id);
  };

  /* ── answer handlers (write storage + apply via existing setters) ── */

  const applyLocale = (l: Locale) => {
    setSelLocale(l);
    setLocale(l); // existing ThemeContext setter — persists under active-locale
    localStorage.setItem("careinn-locale", l);
  };
  const toggleLanguage = () => applyLocale(locale === "en" ? "ar" : "en");

  const saveDisplayName = (mode: "auto" | "custom" | "skipped") => {
    localStorage.setItem("careinn-display-name-mode", mode);
    if (mode === "custom") {
      localStorage.setItem("careinn-display-name", nameEn.trim());
      localStorage.setItem("careinn-display-name-ar", nameAr.trim());
    } else {
      localStorage.removeItem("careinn-display-name");
      localStorage.removeItem("careinn-display-name-ar");
    }
    window.dispatchEvent(new CustomEvent("display-name-changed"));
    goNext();
  };

  const savePrayer = (on: boolean) => {
    setPrayerAlarm(on); // existing "Alarm me" toggle — persists under prayer-alarm
    localStorage.setItem("careinn-prayer-alarm", on ? "true" : "false");
    goNext();
  };

  const applyTheme = (dark: boolean) => {
    setSelDark(dark);
    setDarkMode(dark); // applies immediately via ThemeContext
    localStorage.setItem("careinn-theme-mode", dark ? "dark" : "light");
  };

  const savePolicy = (p: "daily" | "24h-idle" | "discharge") => {
    setSelPolicy(p);
    localStorage.setItem("careinn-data-clear-policy", p);
    if (p === "daily") {
      // anchor the daily cycle now so it doesn't fire on the next tick
      localStorage.setItem("careinn-last-scheduled-clear", String(Date.now()));
    }
  };

  const saveSaver = (v: "30s" | "1m" | "5m") => {
    setSelSaver(v);
    localStorage.setItem("careinn-screensaver-timeout", v);
    // picked up by the existing idle timer in App.tsx
    window.dispatchEvent(new CustomEvent("screensaver-timeout-changed"));
  };

  const finish = (withTour: boolean) => {
    const now = String(Date.now());
    markOnboardingComplete(admitRef);
    localStorage.setItem("careinn-consent-tour-seen", now);
    localStorage.setItem("careinn-consent-terms-agreed", now);
    onComplete();
    if (withTour) onStartTour();
  };

  /* ═══════════════════ shared UI bits ═══════════════════ */

  /** Large, tappable answer card. */
  const OptionCard = ({
    selected, onClick, icon, label, sublabel,
  }: {
    selected?: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
    label: string;
    sublabel?: string;
  }) => (
    <button
      onClick={onClick}
      className="ob-card flex items-center gap-4 w-full cursor-pointer"
      style={{
        padding: "20px 22px",
        borderRadius: t.radiusLg,
        backgroundColor: selected ? t.primarySubtle : t.surface,
        border: selected ? `2px solid ${t.primary}` : `2px solid ${t.borderSubtle}`,
        textAlign: isRTL ? "right" : "left",
        boxShadow: selected ? "none" : SHADOW.sm,
      }}
    >
      {icon && (
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: "48px", height: "48px",
            borderRadius: t.radiusMd,
            backgroundColor: selected ? "#FFFFFF" : t.primarySubtle,
          }}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <span style={{ fontFamily, fontSize: "18px", fontWeight: 700, color: t.textHeading }}>
          {label}
        </span>
        {sublabel && (
          <span style={{ fontFamily, fontSize: "14px", color: t.textMuted, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {sublabel}
          </span>
        )}
      </div>
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: "28px", height: "28px",
          borderRadius: t.radiusFull,
          border: selected ? "none" : `2px solid ${t.borderDefault}`,
          backgroundColor: selected ? t.primary : "transparent",
        }}
      >
        {selected && <Check size={18} color="#FFFFFF" strokeWidth={3} />}
      </div>
    </button>
  );

  const PrimaryButton = ({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="ob-primary flex items-center justify-center w-full"
      style={{
        height: "58px",
        backgroundColor: t.primary,
        borderRadius: t.radiusLg,
        border: "none",
        color: "#FFFFFF",
        fontFamily,
        fontWeight: 700,
        fontSize: "17px",
        boxShadow: disabled ? "none" : SHADOW.md,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {label}
    </button>
  );

  const GhostButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-full cursor-pointer active:scale-[0.98] transition-transform"
      style={{
        height: "58px",
        backgroundColor: "transparent",
        borderRadius: t.radiusLg,
        border: `1.5px solid ${t.borderDefault}`,
        color: t.textMuted,
        fontFamily,
        fontWeight: 600,
        fontSize: "17px",
      }}
    >
      {label}
    </button>
  );

  const ConsentCheckbox = ({
    checked, onToggle, before, link, after, onLinkClick,
  }: {
    checked: boolean;
    onToggle: () => void;
    before: string;
    link: string;
    after: string;
    onLinkClick?: () => void;
  }) => (
    <button
      onClick={onToggle}
      className="ob-card flex items-center gap-4 w-full cursor-pointer"
      style={{
        padding: "18px 20px",
        borderRadius: t.radiusLg,
        backgroundColor: checked ? t.primarySubtle : t.surface,
        border: checked ? `2px solid ${t.primary}` : `2px solid ${t.borderSubtle}`,
        textAlign: isRTL ? "right" : "left",
      }}
    >
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: "28px", height: "28px",
          borderRadius: "9px",
          border: checked ? "none" : `2px solid ${t.borderDefault}`,
          backgroundColor: checked ? t.primary : "transparent",
        }}
      >
        {checked && <Check size={18} color="#FFFFFF" strokeWidth={3} />}
      </div>
      <span style={{ fontFamily, fontSize: "16px", color: t.textBody, flex: 1 }}>
        {before}
        <span
          onClick={(e) => { e.stopPropagation(); onLinkClick?.(); }}
          style={{ color: t.primary, fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}
        >
          {link}
        </span>
        {after}
      </span>
    </button>
  );

  /* ═══════════════════ step content ═══════════════════ */

  const renderStep = () => {
    switch (stepId) {
      case "welcome":
        return (
          <>
            <p style={{ fontFamily, fontSize: "18px", color: t.textBody, textAlign: "center", lineHeight: 1.65, margin: "0 0 8px" }}>
              {tr("onboarding.welcome.body")}
            </p>
            <div style={{ height: "8px" }} />
            <PrimaryButton label={tr("onboarding.welcome.start")} onClick={() => goNext()} />
          </>
        );

      case "language":
        return (
          <>
            <div className="grid grid-cols-2 gap-4 w-full" style={{ marginBottom: "8px" }}>
              <OptionCard
                selected={selLocale === "en"}
                onClick={() => applyLocale("en")}
                icon={<Globe size={22} style={{ color: t.primary }} />}
                label="English"
                sublabel="English"
              />
              <OptionCard
                selected={selLocale === "ar"}
                onClick={() => applyLocale("ar")}
                icon={<Globe size={22} style={{ color: t.primary }} />}
                label="العربية"
                sublabel="Arabic"
              />
            </div>
            <PrimaryButton
              label={tr("onboarding.next")}
              onClick={() => { applyLocale(selLocale); goNext(); }}
            />
          </>
        );

      case "displayName": {
        const filePatient = nurseStore.patient;
        const fileName = isRTL && filePatient.nameAr ? filePatient.nameAr : filePatient.name;
        return (
          <>
            <div className="flex flex-col gap-4 w-full" style={{ marginBottom: "8px" }}>
              <OptionCard
                selected={useFileName}
                onClick={() => setUseFileName(true)}
                icon={<UserRound size={22} style={{ color: t.primary }} />}
                label={tr("onboarding.displayName.useFile")}
                sublabel={fileName || undefined}
              />
              <OptionCard
                selected={!useFileName}
                onClick={() => setUseFileName(false)}
                icon={<UserRound size={22} style={{ color: t.primary }} />}
                label={tr("onboarding.displayName.custom")}
              />
              {!useFileName && (
                <div className="flex flex-col gap-3 w-full">
                  <input
                    type="text"
                    dir="ltr"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder={tr("onboarding.displayName.nameEn")}
                    style={{
                      width: "100%", padding: "16px", borderRadius: t.radiusMd,
                      border: `1.5px solid ${t.borderDefault}`, backgroundColor: t.surfaceElevated,
                      color: t.textBody, fontFamily, fontSize: "16px", outline: "none",
                    }}
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder={tr("onboarding.displayName.nameAr")}
                    style={{
                      width: "100%", padding: "16px", borderRadius: t.radiusMd,
                      border: `1.5px solid ${t.borderDefault}`, backgroundColor: t.surfaceElevated,
                      color: t.textBody, fontFamily, fontSize: "16px", outline: "none",
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1"><GhostButton label={tr("onboarding.skip")} onClick={() => saveDisplayName("skipped")} /></div>
              <div className="flex-1"><PrimaryButton label={tr("onboarding.next")} onClick={() => saveDisplayName(useFileName ? "auto" : "custom")} /></div>
            </div>
          </>
        );
      }

      case "pin":
        return (
          <>
            {isAccountSet() && (
              <p style={{ fontFamily, fontSize: "15px", color: t.textMuted, textAlign: "center", margin: "0 0 8px" }}>
                {tr("onboarding.pin.alreadySet")}
              </p>
            )}
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1"><GhostButton label={tr("onboarding.skip")} onClick={() => { toast(tr("onboarding.pin.skipToast")); goNext(); }} /></div>
              <div className="flex-1"><PrimaryButton label={tr("onboarding.yes")} onClick={() => setOverlay("pin")} /></div>
            </div>
          </>
        );

      case "prayer":
        return (
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1"><GhostButton label={tr("onboarding.no")} onClick={() => savePrayer(false)} /></div>
            <div className="flex-1"><PrimaryButton label={tr("onboarding.yes")} onClick={() => savePrayer(true)} /></div>
          </div>
        );

      case "decision":
        return (
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1"><GhostButton label={tr("onboarding.decision.no")} onClick={() => { setExtended(false); goNext(STEP_SEQUENCE.filter(s => !s.extendedOnly)); }} /></div>
            <div className="flex-1"><PrimaryButton label={tr("onboarding.yes")} onClick={() => { setExtended(true); goNext(STEP_SEQUENCE); }} /></div>
          </div>
        );

      case "theme":
        return (
          <>
            <div className="grid grid-cols-2 gap-4 w-full" style={{ marginBottom: "8px" }}>
              <OptionCard
                selected={!selDark}
                onClick={() => applyTheme(false)}
                icon={<Sun size={22} style={{ color: t.primary }} />}
                label={tr("onboarding.theme.light")}
              />
              <OptionCard
                selected={selDark}
                onClick={() => applyTheme(true)}
                icon={<Moon size={22} style={{ color: t.primary }} />}
                label={tr("onboarding.theme.dark")}
              />
            </div>
            <PrimaryButton label={tr("onboarding.next")} onClick={() => goNext()} />
          </>
        );

      case "dataClear":
        return (
          <>
            <div className="flex flex-col gap-4 w-full" style={{ marginBottom: "4px" }}>
              <OptionCard selected={selPolicy === "daily"} onClick={() => savePolicy("daily")} icon={<DatabaseZap size={22} style={{ color: t.primary }} />} label={tr("onboarding.dataClear.daily")} />
              <OptionCard selected={selPolicy === "24h-idle"} onClick={() => savePolicy("24h-idle")} icon={<DatabaseZap size={22} style={{ color: t.primary }} />} label={tr("onboarding.dataClear.idle")} />
              <OptionCard selected={selPolicy === "discharge"} onClick={() => savePolicy("discharge")} icon={<DatabaseZap size={22} style={{ color: t.primary }} />} label={tr("onboarding.dataClear.discharge")} />
            </div>
            <p style={{ fontFamily, fontSize: "14px", color: t.textMuted, textAlign: "center", margin: "0 0 4px" }}>
              {tr("onboarding.dataClear.note")}
            </p>
            <PrimaryButton label={tr("onboarding.next")} disabled={!selPolicy} onClick={() => goNext()} />
          </>
        );

      case "notifications":
        return (
          <>
            <div className="grid grid-cols-2 gap-4 w-full" style={{ marginBottom: "8px" }}>
              <OptionCard
                selected={selSound === "sound"}
                onClick={() => { setSelSound("sound"); localStorage.setItem("careinn-notification-sound", "sound"); }}
                icon={<Volume2 size={22} style={{ color: t.primary }} />}
                label={tr("onboarding.notifications.sound")}
              />
              <OptionCard
                selected={selSound === "silent"}
                onClick={() => { setSelSound("silent"); localStorage.setItem("careinn-notification-sound", "silent"); }}
                icon={<VolumeX size={22} style={{ color: t.primary }} />}
                label={tr("onboarding.notifications.silent")}
              />
            </div>
            <PrimaryButton label={tr("onboarding.next")} disabled={!selSound} onClick={() => goNext()} />
          </>
        );

      case "bluetooth":
        return (
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1"><GhostButton label={tr("onboarding.no")} onClick={() => goNext()} /></div>
            <div className="flex-1"><PrimaryButton label={tr("onboarding.yes")} onClick={() => setOverlay("bluetooth")} /></div>
          </div>
        );

      case "screensaver":
        return (
          <>
            <div className="grid grid-cols-3 gap-4 w-full" style={{ marginBottom: "8px" }}>
              <OptionCard selected={selSaver === "30s"} onClick={() => saveSaver("30s")} label={tr("onboarding.screensaver.30s")} />
              <OptionCard selected={selSaver === "1m"} onClick={() => saveSaver("1m")} label={tr("onboarding.screensaver.1m")} />
              <OptionCard selected={selSaver === "5m"} onClick={() => saveSaver("5m")} label={tr("onboarding.screensaver.5m")} />
            </div>
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1"><GhostButton label={tr("onboarding.skip")} onClick={() => goNext()} /></div>
              <div className="flex-1"><PrimaryButton label={tr("onboarding.next")} disabled={!selSaver} onClick={() => goNext()} /></div>
            </div>
          </>
        );

      case "consent":
        return (
          <>
            <div className="flex flex-col gap-3 w-full" style={{ marginBottom: "8px" }}>
              <ConsentCheckbox
                checked={tourSeen}
                onToggle={() => setTourSeen(!tourSeen)}
                before={tr("onboarding.consent.tour.before")}
                link={tr("onboarding.consent.tour.link")}
                after={tr("onboarding.consent.tour.after")}
                onLinkClick={onStartSlideshow}
              />
              <ConsentCheckbox
                checked={termsAgreed}
                onToggle={() => setTermsAgreed(!termsAgreed)}
                before={tr("onboarding.consent.terms.before")}
                link={tr("onboarding.consent.terms.link")}
                after={tr("onboarding.consent.terms.after")}
              />
            </div>
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1"><GhostButton label={tr("onboarding.consent.startWithTour")} onClick={() => (tourSeen && termsAgreed) && finish(true)} /></div>
              <div className="flex-1"><PrimaryButton label={tr("onboarding.consent.startNow")} disabled={!tourSeen || !termsAgreed} onClick={() => finish(false)} /></div>
            </div>
          </>
        );
    }
  };

  const Icon = STEP_ICONS[stepId];
  const stepIndexInFull = STEP_SEQUENCE.findIndex(s => s.id === stepId);
  const totalSteps = STEP_SEQUENCE.length;
  const progress = totalSteps > 1 ? (stepIndexInFull + 1) / totalSteps : 1;

  const HeaderButton = ({ onClick, children, ariaLabel }: { onClick: () => void; children: React.ReactNode; ariaLabel: string }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex items-center justify-center transition-transform cursor-pointer active:scale-95"
      style={{
        width: "52px", height: "52px",
        borderRadius: "14px",
        backgroundColor: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.16)",
        outline: "none",
      }}
    >
      {children}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[8000] flex flex-col overflow-hidden"
      dir={dir}
      style={{
        display: hidden ? "none" : "flex",
        background: `linear-gradient(160deg, ${t.primary} 0%, ${t.primaryDark} 100%)`,
        fontFamily,
      }}
    >
      <style>{`
        .ob-card { transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
        .ob-card:hover { border-color: ${t.primary}; box-shadow: ${SHADOW.md}; transform: translateY(-2px); }
        .ob-card:active { transform: scale(0.99); }
        .ob-primary { transition: transform .12s ease, filter .18s ease; }
        .ob-primary:hover:not(:disabled) { filter: brightness(1.05); }
        .ob-primary:active:not(:disabled) { transform: scale(0.985); }
        .ob-scroll::-webkit-scrollbar { width: 10px; }
        .ob-scroll::-webkit-scrollbar-track { background: transparent; }
        .ob-scroll::-webkit-scrollbar-thumb { background: ${t.borderDefault}; border-radius: 100px; border: 3px solid transparent; background-clip: content-box; }
        @keyframes obStepIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ─── Page header (white on brand gradient) ─── */}
      <div className="shrink-0 flex items-center gap-5 px-10 pt-8 pb-5 relative z-10">
        <HeaderButton
          onClick={() => {
            if (stepId !== "consent") {
              setStepId("consent");
            }
          }}
          ariaLabel={tr("general.close")}
        >
          <Home size={22} style={{ color: "#fff" }} />
        </HeaderButton>
        <div style={{ width: "1.5px", height: "32px", backgroundColor: "rgba(255,255,255,0.18)", borderRadius: "1px" }} />
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center justify-center shrink-0" style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "rgba(255,255,255,0.12)" }}>
            <SlidersHorizontal size={24} style={{ color: "#fff" }} />
          </div>
          <div className="min-w-0">
            <h2 style={{ fontFamily, fontSize: "30px", fontWeight: 800, color: "#FFFFFF", lineHeight: "34px" }}>
              {tr("onboarding.header.title")}
            </h2>
            <p style={{ fontFamily, fontSize: "15px", color: "rgba(255,255,255,0.6)", marginTop: "2px" }}>
              {tr("onboarding.header.subtitle")}
            </p>
          </div>
        </div>
        {stepId !== "consent" && (
          <button
            onClick={() => setStepId("consent")}
            className="shrink-0 cursor-pointer active:scale-95 transition-transform"
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: "14px",
              padding: "10px 18px",
              color: "#fff",
              outline: "none",
            }}
          >
            <span style={{ fontFamily, fontSize: "15px", fontWeight: 600, color: "#fff" }}>
              {tr("onboarding.skipAll")}
            </span>
          </button>
        )}
      </div>

      {/* ─── Content — large white rounded card ─── */}
      <div className="flex-1 min-h-0 px-10 pb-8 relative z-10 flex flex-col">
        <div
          className="ob-scroll flex-1 min-h-0 flex flex-col overflow-y-auto relative"
          style={{
            backgroundColor: t.surface,
            borderRadius: t.radiusXl,
            boxShadow: SHADOW.xl,
            border: t.cardBorder,
          }}
        >
          {stepId === "welcome" && (
            <div
              className="absolute inset-y-0 w-1/2 overflow-hidden pointer-events-none z-0"
              style={{
                right: isRTL ? "auto" : 0,
                left: isRTL ? 0 : "auto",
              }}
            >
              <img
                src={t.heroImageUrl}
                alt="Hospital Hero"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: t.heroCropPosition || "50% 50%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: isRTL
                    ? `linear-gradient(to right, transparent 0%, ${t.surface} 100%)`
                    : `linear-gradient(to left, transparent 0%, ${t.surface} 100%)`,
                }}
              />
            </div>
          )}

          {/* progress strip */}
          <div className="shrink-0 flex items-center gap-4 px-10 pt-7 relative z-10">
            {stepIndex > 0 ? (
              <button
                onClick={goBack}
                aria-label={tr("general.back")}
                className="flex items-center justify-center shrink-0 cursor-pointer active:scale-90 transition-transform"
                style={{ width: "44px", height: "44px", borderRadius: t.radiusFull, backgroundColor: t.tileInactiveBg, border: "none" }}
              >
                <ChevronLeft size={22} style={{ color: t.textHeading, transform: isRTL ? "rotate(180deg)" : "" }} />
              </button>
            ) : <div style={{ width: "44px" }} />}
            <div className="flex-1">
              <div style={{ height: "8px", borderRadius: "100px", backgroundColor: t.tileInactiveBg, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress * 100}%`, backgroundColor: t.primary, borderRadius: "100px", transition: "width 0.25s ease" }} />
              </div>
            </div>
            <span className="shrink-0" style={{ fontFamily, fontSize: "14px", fontWeight: 700, color: t.textMuted, minWidth: "72px", textAlign: isRTL ? "left" : "right" }}>
              {tr("onboarding.progress", stepIndexInFull + 1, totalSteps)}
            </span>
          </div>

          {/* centered step body */}
          <div
            className="flex-1 min-h-0 flex flex-col justify-center px-10 py-8 relative z-10"
            style={{
              alignItems: stepId === "welcome" ? (isRTL ? "flex-end" : "flex-start") : "center",
              paddingLeft: stepId === "welcome" && !isRTL ? "8%" : "2.5rem",
              paddingRight: stepId === "welcome" && isRTL ? "8%" : "2.5rem",
            }}
          >
            <div key={stepId} className="flex flex-col items-center w-full" style={{ maxWidth: "620px", animation: "obStepIn 0.25s ease-out" }}>
              <div
                className="flex items-center justify-center"
                style={{ width: "80px", height: "80px", borderRadius: t.radiusFull, backgroundColor: t.primarySubtle, marginBottom: "22px" }}
              >
                <Icon size={38} style={{ color: t.primary }} />
              </div>
              <h3
                style={{ fontFamily, fontSize: "28px", fontWeight: 800, color: t.textHeading, textAlign: "center", lineHeight: "34px", marginBottom: "24px" }}
              >
                {tr(`onboarding.${stepId}.title`)}
              </h3>
              <div className="w-full flex flex-col gap-4">{renderStep()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reused PIN setup flow (existing MyPreferencesDialog machinery) */}
      {overlay === "pin" && (
        <MyPreferencesDialog
          open
          mode="pin-setup"
          onClose={() => {
            setOverlay(null);
            if (isAccountSet()) goNext();
          }}
        />
      )}

      {/* Reused Bluetooth pairing flow (existing SettingsPanel dialog) */}
      {overlay === "bluetooth" && (
        <BluetoothDialog
          onClose={() => { setOverlay(null); goNext(); }}
          connectedId={btDevice}
          onConnect={(id) => setBtDevice(id)}
          onDisconnect={() => {
            if (isAndroidApp() && btDevice) bluetoothBridge.disconnect(btDevice);
            setBtDevice(null);
          }}
        />
      )}
    </div>
  );
}
