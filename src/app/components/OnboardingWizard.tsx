import React, { useMemo, useState } from "react";
import { useTheme, SHADOW, buildTheme } from "./ThemeContext";
import { useLocale, type Locale } from "./i18n";
import { toast } from "sonner";
import {
  Hand, Globe, Shield, SlidersHorizontal, ClipboardList,
  FileCheck2, Check, ChevronLeft, Home,
} from "lucide-react";
import { markOnboardingComplete } from "../lib/onboardingStore";
import { isAccountSet } from "../lib/accountAuth";
import { MyPreferencesDialog } from "./MyAccountDialog";
import { PatientPreferenceForm, PREFS_ANSWERS_KEY } from "./PatientPreferenceForm";

import imgLockAppPages from "../../assets/lock app pages..jpg";
import imgLanguage from "../../assets/language.jpg";

const STEP_BACKGROUNDS: Record<string, string> = {
  language: imgLanguage,
  pin: imgLockAppPages,
};

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
 * order, the progress bar and the step counter. The flow asks two questions
 * only — language and PIN — then introduces the Patient Preference Form and
 * ends on the consent step.
 * ═══════════════════════════════════════════════════════════════════════════ */

type StepId = "welcome" | "language" | "pin" | "prefsForm" | "consent";

const STEP_SEQUENCE: StepId[] = [
  "welcome",
  "language",
  "pin",
  "prefsForm",
  "consent",
];

const STEP_ICONS: Record<StepId, any> = {
  welcome: Hand,
  language: Globe,
  pin: Shield,
  prefsForm: ClipboardList,
  consent: FileCheck2,
};

const readLS = (k: string): string | null => {
  try { return localStorage.getItem(k); } catch { return null; }
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
  const {
    theme: activeTheme, allConfigs, activeConfigId, locale, setLocale,
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

  const [stepId, setStepId] = useState<StepId>("welcome");

  /* per-step answers — pre-filled from storage so re-opening shows current choices */
  const [selLocale, setSelLocale] = useState<Locale>(() => (readLS("careinn-locale") as Locale) || locale || "en");
  /* Driven by the form's own saved answers, not by the wizard's completion
     flag — the flag is written for every finished onboarding, filled form
     or not. */
  const [prefsCompleted, setPrefsCompleted] = useState(() => !!readLS(PREFS_ANSWERS_KEY));
  const [termsAgreed, setTermsAgreed] = useState(() => !!readLS("careinn-consent-terms-agreed"));

  /* reused native flows rendered on top of the wizard */
  const [overlay, setOverlay] = useState<"pin" | "prefs" | null>(null);

  const stepIndex = STEP_SEQUENCE.indexOf(stepId);

  const goNext = () => {
    if (stepIndex >= 0 && stepIndex < STEP_SEQUENCE.length - 1) setStepId(STEP_SEQUENCE[stepIndex + 1]);
  };
  const goBack = () => {
    if (stepIndex > 0) setStepId(STEP_SEQUENCE[stepIndex - 1]);
  };

  /* ── answer handlers (write storage + apply via existing setters) ── */

  const applyLocale = (l: Locale) => {
    setSelLocale(l);
    setLocale(l); // existing ThemeContext setter — persists under active-locale
    localStorage.setItem("careinn-locale", l);
  };

  const finish = (withTour: boolean) => {
    const now = String(Date.now());
    markOnboardingComplete(admitRef);
    localStorage.setItem("careinn-prefs-completed", now);
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

      /* The form opens as a modal on top of the wizard, so closing or
         submitting it lands the patient back on this step with the flow
         and the progress bar untouched. */
      case "prefsForm":
        return (
          <>
            <p style={{ fontFamily, fontSize: "18px", color: t.textBody, textAlign: "center", lineHeight: 1.65, margin: "0 0 8px" }}>
              {tr("onboarding.prefsForm.body")}
            </p>
            {prefsCompleted && (
              <div
                className="flex items-center justify-center gap-2.5 w-full"
                style={{ padding: "12px 18px", borderRadius: t.radiusLg, backgroundColor: t.primarySubtle }}
              >
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{ width: "24px", height: "24px", borderRadius: t.radiusFull, backgroundColor: t.primary }}
                >
                  <Check size={15} color="#FFFFFF" strokeWidth={3} />
                </div>
                <span style={{ fontFamily, fontSize: "16px", fontWeight: 600, color: t.primary }}>
                  {tr("onboarding.prefsForm.completed")}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1">
                <GhostButton
                  label={prefsCompleted ? tr("onboarding.prefsForm.review") : tr("onboarding.skip")}
                  onClick={() => (prefsCompleted ? setOverlay("prefs") : goNext())}
                />
              </div>
              <div className="flex-1">
                <PrimaryButton
                  label={prefsCompleted ? tr("onboarding.next") : tr("onboarding.prefsForm.open")}
                  onClick={() => (prefsCompleted ? goNext() : setOverlay("prefs"))}
                />
              </div>
            </div>
          </>
        );

      case "consent":
        return (
          <>
            <div className="flex flex-col gap-3 w-full" style={{ marginBottom: "8px" }}>
              <ConsentCheckbox
                checked={termsAgreed}
                onToggle={() => setTermsAgreed(!termsAgreed)}
                before={tr("onboarding.consent.terms.before")}
                link={tr("onboarding.consent.terms.link")}
                after={tr("onboarding.consent.terms.after")}
              />
            </div>
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1"><GhostButton label={tr("onboarding.consent.startWithTour")} onClick={() => termsAgreed && finish(true)} /></div>
              <div className="flex-1"><PrimaryButton label={tr("onboarding.consent.startNow")} disabled={!termsAgreed} onClick={() => finish(false)} /></div>
            </div>
          </>
        );
    }
  };

  const Icon = STEP_ICONS[stepId];
  const totalSteps = STEP_SEQUENCE.length;
  const progress = totalSteps > 1 ? (stepIndex + 1) / totalSteps : 1;

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
          {/* Welcome step split hero image (fades out smoothly) */}
          <div
            className="absolute inset-y-0 w-1/2 overflow-hidden pointer-events-none z-0"
            style={{
              right: 0,
              left: "auto",
              opacity: stepId === "welcome" ? 1 : 0,
              transition: "opacity 0.4s ease-in-out",
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
                background: `linear-gradient(to left, transparent 0%, ${t.surface} 100%)`,
              }}
            />
          </div>

          {/* Stacked background images for smooth cross-fade transition */}
          {Object.entries(STEP_BACKGROUNDS).map(([id, src]) => {
            const isActive = stepId === id;
            return (
              <div
                key={id}
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                  backgroundImage: `url(${src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: isActive ? 0.07 : 0,
                  transition: "opacity 0.4s ease-in-out",
                }}
              />
            );
          })}

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
              {tr("onboarding.progress", stepIndex + 1, totalSteps)}
            </span>
          </div>

          {/* centered step body */}
          <div
            className="flex-1 min-h-0 flex flex-col justify-center px-10 py-8 relative z-10"
            style={{
              alignItems: stepId === "welcome" ? "flex-start" : "center",
              paddingLeft: stepId === "welcome" ? "8%" : "2.5rem",
              paddingRight: "2.5rem",
              direction: stepId === "welcome" ? "ltr" : undefined,
            }}
          >
            <div 
              key={stepId} 
              className="flex flex-col items-center w-full" 
              style={{ 
                maxWidth: "620px", 
                animation: "obStepIn 0.25s ease-out",
                direction: stepId === "welcome" && isRTL ? "rtl" : undefined,
              }}
            >
              <div
                className="flex items-center justify-center"
                style={{ width: "80px", height: "80px", borderRadius: t.radiusFull, backgroundColor: t.primarySubtle, marginBottom: "22px" }}
              >
                {typeof Icon === "string" ? (
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      backgroundColor: t.primary,
                      WebkitMaskImage: `url(${Icon})`,
                      maskImage: `url(${Icon})`,
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                    }}
                  />
                ) : (
                  <Icon size={38} style={{ color: t.primary }} />
                )}
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

      {/* Patient Preferences Form — a modal over the wizard, not a page the
          patient navigates away to. Closing it (X) or finishing it returns to
          the step it was opened from, wizard state and progress intact. */}
      {overlay === "prefs" && (
        <PatientPreferenceForm
          variant="modal"
          onClose={() => setOverlay(null)}
          onSubmitted={() => setPrefsCompleted(true)}
        />
      )}
    </div>
  );
}
