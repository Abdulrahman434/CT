import React, { useMemo, useState } from "react";
import { useTheme, SHADOW } from "./ThemeContext";
import { useLocale, type Locale } from "./i18n";
import { toast } from "sonner";
import {
  Hand, Globe, UserRound, Shield, BellRing, SlidersHorizontal,
  Moon, Sun, DatabaseZap, Volume2, VolumeX, Bluetooth, MonitorPause,
  FileCheck2, Check, ChevronLeft,
} from "lucide-react";
import { useNurseStore } from "./NurseDataStore";
import { markOnboardingComplete } from "../lib/onboardingStore";
import { isAccountSet } from "../lib/accountAuth";
import { MyPreferencesDialog } from "./MyAccountDialog";
import { BluetoothDialog } from "./SettingsPanel";
import { bluetooth as bluetoothBridge, isAndroidApp } from "../utils/androidBridge";

/* ═══════════════════════════════════════════════════════════════════════════
 * First-run onboarding wizard
 *
 * Data-driven step machine: STEP_SEQUENCE below is the single source of
 * truth for order and branching. Steps marked extendedOnly appear only when
 * the patient answers Yes at the "decision" step; both branches end on the
 * shared Consent step. Visuals follow the existing overlay language
 * (AppLockMenu / MyPreferencesDialog): dimmed blurred backdrop, white card.
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

export function OnboardingWizard({
  admitRef,
  onComplete,
  onStartTour,
  hidden = false,
}: {
  admitRef: string | null;
  onComplete: () => void;
  onStartTour: () => void;
  /** Keeps the wizard mounted (state intact) but invisible — used while
   *  the welcome tour plays on top of it. */
  hidden?: boolean;
}) {
  const { theme: t, setLocale, setDarkMode, setPrayerAlarm } = useTheme();
  const { t: tr, isRTL, dir, fontFamily } = useLocale();
  const nurseStore = useNurseStore();

  const [stepId, setStepId] = useState<StepId>("welcome");
  const [extended, setExtended] = useState(false);

  /* per-step answers */
  const [selLocale, setSelLocale] = useState<Locale>("en");
  const [useFileName, setUseFileName] = useState(true);
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [selDark, setSelDark] = useState(false);
  const [selPolicy, setSelPolicy] = useState<"daily" | "24h-idle" | "discharge" | null>(null);
  const [selSound, setSelSound] = useState<"sound" | "silent" | null>(null);
  const [selSaver, setSelSaver] = useState<"30s" | "1m" | "5m" | null>(null);
  const [tourSeen, setTourSeen] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

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

  /* ── shared UI bits ── */

  const OptionTile = ({
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
      className="flex items-center gap-3 w-full cursor-pointer active:scale-[0.98] transition-transform"
      style={{
        padding: "16px",
        borderRadius: t.radiusLg,
        backgroundColor: selected ? t.primarySubtle : t.tileInactiveBg,
        border: selected ? `2px solid ${t.primary}` : "2px solid transparent",
        textAlign: isRTL ? "right" : "left",
      }}
    >
      {icon && (
        <div style={{ padding: "8px", borderRadius: t.radiusMd, backgroundColor: selected ? "#FFFFFF" : t.primarySubtle }}>
          {icon}
        </div>
      )}
      <div className="flex flex-col flex-1">
        <span style={{ fontFamily, fontSize: "16px", fontWeight: 700, color: t.textHeading }}>
          {label}
        </span>
        {sublabel && (
          <span style={{ fontFamily, fontSize: "13px", color: t.textMuted }}>
            {sublabel}
          </span>
        )}
      </div>
      {selected && <Check size={20} style={{ color: t.primary }} />}
    </button>
  );

  const PrimaryButton = ({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center w-full py-3.5 transition-transform"
      style={{
        backgroundColor: t.primary,
        borderRadius: t.radiusLg,
        border: "none",
        color: "#FFFFFF",
        fontFamily,
        fontWeight: 700,
        fontSize: "16px",
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
      className="flex items-center justify-center w-full py-3.5 cursor-pointer active:scale-95 transition-transform"
      style={{
        backgroundColor: "transparent",
        borderRadius: t.radiusLg,
        border: `1.5px solid ${t.borderDefault}`,
        color: t.textMuted,
        fontFamily,
        fontWeight: 600,
        fontSize: "16px",
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
    <div className="flex items-center gap-3 w-full" style={{ padding: "4px 0" }}>
      <button
        onClick={onToggle}
        className="flex items-center justify-center shrink-0 cursor-pointer active:scale-90 transition-transform"
        style={{
          width: "26px", height: "26px",
          borderRadius: "8px",
          border: checked ? "none" : `2px solid ${t.borderDefault}`,
          backgroundColor: checked ? t.primary : "transparent",
        }}
        aria-checked={checked}
        role="checkbox"
      >
        {checked && <Check size={16} color="#FFFFFF" />}
      </button>
      <span style={{ fontFamily, fontSize: "15px", color: t.textBody, textAlign: isRTL ? "right" : "left" }}>
        {before}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onLinkClick?.(); }}
          style={{ color: t.primary, fontWeight: 700, textDecoration: "underline" }}
        >
          {link}
        </a>
        {after}
      </span>
    </div>
  );

  /* ── step content ── */

  const renderStep = () => {
    switch (stepId) {
      case "welcome":
        return (
          <>
            <p style={{ fontFamily, fontSize: "16px", color: t.textBody, textAlign: "center", lineHeight: 1.6, margin: "0 0 28px" }}>
              {tr("onboarding.welcome.body")}
            </p>
            <PrimaryButton label={tr("onboarding.welcome.start")} onClick={() => goNext()} />
          </>
        );

      case "language":
        return (
          <>
            <div className="flex flex-col gap-3 w-full" style={{ marginBottom: "24px" }}>
              <OptionTile
                selected={selLocale === "en"}
                onClick={() => applyLocale("en")}
                label="English"
              />
              <OptionTile
                selected={selLocale === "ar"}
                onClick={() => applyLocale("ar")}
                label="العربية"
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
            <div className="flex flex-col gap-3 w-full" style={{ marginBottom: "20px" }}>
              <OptionTile
                selected={useFileName}
                onClick={() => setUseFileName(!useFileName)}
                icon={<UserRound size={20} style={{ color: t.primary }} />}
                label={tr("onboarding.displayName.useFile")}
                sublabel={fileName || undefined}
              />
              {!useFileName && (
                <>
                  <input
                    type="text"
                    dir="ltr"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder={tr("onboarding.displayName.nameEn")}
                    style={{
                      width: "100%", padding: "14px", borderRadius: t.radiusMd,
                      border: `1px solid ${t.borderDefault}`, backgroundColor: t.surfaceElevated,
                      fontFamily, fontSize: "15px", outline: "none",
                    }}
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder={tr("onboarding.displayName.nameAr")}
                    style={{
                      width: "100%", padding: "14px", borderRadius: t.radiusMd,
                      border: `1px solid ${t.borderDefault}`, backgroundColor: t.surfaceElevated,
                      fontFamily, fontSize: "15px", outline: "none",
                    }}
                  />
                </>
              )}
            </div>
            <div className="flex flex-col gap-3 w-full">
              <PrimaryButton
                label={tr("onboarding.next")}
                onClick={() => saveDisplayName(useFileName ? "auto" : "custom")}
              />
              <GhostButton
                label={tr("onboarding.skip")}
                onClick={() => saveDisplayName("skipped")}
              />
            </div>
          </>
        );
      }

      case "pin":
        return (
          <>
            {isAccountSet() && (
              <p style={{ fontFamily, fontSize: "14px", color: t.textMuted, textAlign: "center", margin: "0 0 16px" }}>
                {tr("onboarding.pin.alreadySet")}
              </p>
            )}
            <div className="flex flex-col gap-3 w-full">
              <PrimaryButton
                label={tr("onboarding.yes")}
                onClick={() => setOverlay("pin")}
              />
              <GhostButton
                label={tr("onboarding.skip")}
                onClick={() => {
                  toast(tr("onboarding.pin.skipToast"));
                  goNext();
                }}
              />
            </div>
          </>
        );

      case "prayer":
        return (
          <div className="flex flex-col gap-3 w-full">
            <PrimaryButton label={tr("onboarding.yes")} onClick={() => savePrayer(true)} />
            <GhostButton label={tr("onboarding.no")} onClick={() => savePrayer(false)} />
          </div>
        );

      case "decision":
        return (
          <div className="flex flex-col gap-3 w-full">
            <PrimaryButton
              label={tr("onboarding.yes")}
              onClick={() => { setExtended(true); goNext(STEP_SEQUENCE); }}
            />
            <GhostButton
              label={tr("onboarding.no")}
              onClick={() => { setExtended(false); goNext(STEP_SEQUENCE.filter(s => !s.extendedOnly)); }}
            />
          </div>
        );

      case "theme":
        return (
          <>
            <div className="flex flex-col gap-3 w-full" style={{ marginBottom: "24px" }}>
              <OptionTile
                selected={!selDark}
                onClick={() => applyTheme(false)}
                icon={<Sun size={20} style={{ color: t.primary }} />}
                label={tr("onboarding.theme.light")}
              />
              <OptionTile
                selected={selDark}
                onClick={() => applyTheme(true)}
                icon={<Moon size={20} style={{ color: t.primary }} />}
                label={tr("onboarding.theme.dark")}
              />
            </div>
            <PrimaryButton label={tr("onboarding.next")} onClick={() => goNext()} />
          </>
        );

      case "dataClear":
        return (
          <>
            <div className="flex flex-col gap-3 w-full" style={{ marginBottom: "12px" }}>
              <OptionTile
                selected={selPolicy === "daily"}
                onClick={() => savePolicy("daily")}
                label={tr("onboarding.dataClear.daily")}
              />
              <OptionTile
                selected={selPolicy === "24h-idle"}
                onClick={() => savePolicy("24h-idle")}
                label={tr("onboarding.dataClear.idle")}
              />
              <OptionTile
                selected={selPolicy === "discharge"}
                onClick={() => savePolicy("discharge")}
                label={tr("onboarding.dataClear.discharge")}
              />
            </div>
            <p style={{ fontFamily, fontSize: "13px", color: t.textMuted, textAlign: "center", margin: "0 0 20px" }}>
              {tr("onboarding.dataClear.note")}
            </p>
            <PrimaryButton
              label={tr("onboarding.next")}
              disabled={!selPolicy}
              onClick={() => goNext()}
            />
          </>
        );

      case "notifications":
        return (
          <>
            <div className="flex flex-col gap-3 w-full" style={{ marginBottom: "24px" }}>
              <OptionTile
                selected={selSound === "sound"}
                onClick={() => { setSelSound("sound"); localStorage.setItem("careinn-notification-sound", "sound"); }}
                icon={<Volume2 size={20} style={{ color: t.primary }} />}
                label={tr("onboarding.notifications.sound")}
              />
              <OptionTile
                selected={selSound === "silent"}
                onClick={() => { setSelSound("silent"); localStorage.setItem("careinn-notification-sound", "silent"); }}
                icon={<VolumeX size={20} style={{ color: t.primary }} />}
                label={tr("onboarding.notifications.silent")}
              />
            </div>
            <PrimaryButton label={tr("onboarding.next")} disabled={!selSound} onClick={() => goNext()} />
          </>
        );

      case "bluetooth":
        return (
          <div className="flex flex-col gap-3 w-full">
            <PrimaryButton label={tr("onboarding.yes")} onClick={() => setOverlay("bluetooth")} />
            <GhostButton label={tr("onboarding.no")} onClick={() => goNext()} />
          </div>
        );

      case "screensaver":
        return (
          <>
            <div className="flex flex-col gap-3 w-full" style={{ marginBottom: "24px" }}>
              <OptionTile
                selected={selSaver === "30s"}
                onClick={() => saveSaver("30s")}
                label={tr("onboarding.screensaver.30s")}
              />
              <OptionTile
                selected={selSaver === "1m"}
                onClick={() => saveSaver("1m")}
                label={tr("onboarding.screensaver.1m")}
              />
              <OptionTile
                selected={selSaver === "5m"}
                onClick={() => saveSaver("5m")}
                label={tr("onboarding.screensaver.5m")}
              />
            </div>
            <div className="flex flex-col gap-3 w-full">
              <PrimaryButton label={tr("onboarding.next")} disabled={!selSaver} onClick={() => goNext()} />
              <GhostButton label={tr("onboarding.skip")} onClick={() => goNext()} />
            </div>
          </>
        );

      case "consent":
        return (
          <>
            <div className="flex flex-col gap-2 w-full" style={{ marginBottom: "24px" }}>
              <ConsentCheckbox
                checked={tourSeen}
                onToggle={() => setTourSeen(!tourSeen)}
                before={tr("onboarding.consent.tour.before")}
                link={tr("onboarding.consent.tour.link")}
                after={tr("onboarding.consent.tour.after")}
                onLinkClick={onStartTour}
              />
              <ConsentCheckbox
                checked={termsAgreed}
                onToggle={() => setTermsAgreed(!termsAgreed)}
                before={tr("onboarding.consent.terms.before")}
                link={tr("onboarding.consent.terms.link")}
                after={tr("onboarding.consent.terms.after")}
              />
            </div>
            <div className="flex flex-col gap-3 w-full">
              <PrimaryButton
                label={tr("onboarding.consent.startWithTour")}
                disabled={!tourSeen || !termsAgreed}
                onClick={() => finish(true)}
              />
              <PrimaryButton
                label={tr("onboarding.consent.startNow")}
                disabled={!tourSeen || !termsAgreed}
                onClick={() => finish(false)}
              />
            </div>
          </>
        );
    }
  };

  const Icon = STEP_ICONS[stepId];

  return (
    <div
      className="fixed inset-0 z-[8000] items-center justify-center"
      dir={dir}
      style={{
        display: hidden ? "none" : "flex",
        backgroundColor: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        className="relative flex flex-col items-center"
        style={{
          width: "480px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "32px 28px 28px",
          borderRadius: t.radiusXl,
          backgroundColor: "#FFFFFF",
          boxShadow: SHADOW.xl,
          animation: "onboardingCardIn 0.2s ease-out",
        }}
      >
        {/* back */}
        {stepIndex > 0 && (
          <button
            onClick={goBack}
            className="absolute flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
            style={{
              top: "16px",
              [isRTL ? "right" : "left"]: "16px",
              width: "36px", height: "36px",
              borderRadius: t.radiusFull,
              backgroundColor: t.tileInactiveBg,
              border: "none",
            }}
            aria-label={tr("general.back")}
          >
            <ChevronLeft size={20} style={{ color: t.textHeading, transform: isRTL ? "rotate(180deg)" : "" }} />
          </button>
        )}

        <div
          className="flex items-center justify-center"
          style={{
            width: "64px", height: "64px",
            borderRadius: t.radiusFull,
            backgroundColor: t.primarySubtle,
            marginBottom: "16px",
          }}
        >
          <Icon size={32} style={{ color: t.primary }} />
        </div>

        <span
          style={{
            fontFamily, fontSize: "22px", fontWeight: 700, color: t.textHeading,
            textAlign: "center", marginBottom: "20px",
          }}
        >
          {tr(`onboarding.${stepId}.title`)}
        </span>

        <div className="w-full">{renderStep()}</div>

        {/* progress dots */}
        <div className="flex items-center justify-center gap-1.5" style={{ marginTop: "24px" }}>
          {visibleSteps.map((s, i) => (
            <div
              key={s.id}
              style={{
                width: i === stepIndex ? "20px" : "8px",
                height: "8px",
                borderRadius: "4px",
                backgroundColor: i === stepIndex ? t.primary : t.borderDefault,
                transition: "width 0.2s",
              }}
            />
          ))}
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

      <style>{`
        @keyframes onboardingCardIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
