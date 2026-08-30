import { useMemo, useState } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW, LEADING } from "./ThemeContext";
import { useLocale, type Locale } from "./i18n";
import {
  ClipboardList, UtensilsCrossed, Users, Clock, HeartHandshake,
  ShieldCheck, MessageSquarePlus, Check, CheckCircle2,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { InternalPageHeader } from "./InternalPageHeader";
import { ApiImage } from "./ApiImage";

/* ═══════════════════════════════════════════════════════════════════════════
 * Patient Preferences Form (source: Patient Preference Form V12)
 *
 * Replaces the old welcome slideshow in the onboarding consent step. Filled
 * within 24 hours of admission so patient preferences reach the care plan.
 *
 * LAYOUT — ONE QUESTION PER SCREEN, NEVER SCROLLS.
 * Designed against the kiosk's fixed 1920×1080 canvas (DESIGN_W / DESIGN_H in
 * App.tsx), which useScreenScale() scales to the physical panel. The card body
 * is `overflow: hidden` on purpose: if a translation ever outgrows its screen
 * the content clips visibly instead of silently growing a scrollbar, so the
 * regression is caught rather than shipped. Vertical budget per screen:
 *
 *   header (InternalPageHeader)   ~116px
 *   progress row                   ~72px
 *   question body (centered)      ~700px   ← all content must fit here
 *   footer (Back / Next)           ~92px
 *
 * Arabic and Urdu run longer than English, so BODY_MAX_* below are sized for
 * the longest of the three, not for English.
 *
 * COLOUR — no hex literals. Every content icon is the per-hospital secondary
 * on a theme.accentSubtle chip, so icons re-brand with the active hospital.
 * See iconColor below for why the exact token depends on light/dark mode.
 * The one deliberate exception is SWATCHES below: those are the *answer
 * options* for "what is your favourite colour", not styling — theming them
 * would make the question unanswerable.
 *
 * Sub-views are plain render functions, not nested components: a nested
 * component is a new type on every keystroke and the notes field would lose
 * focus after one character.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** The submitted record. The companion "completed" flag is owned by the
 *  onboarding wizard's consent step, which persists it in finish(). */
export const PREFS_ANSWERS_KEY = "careinn-prefs-answers";

/** A free-text note plus the language it was written in, so staff know when
 *  to involve a translator rather than silently mis-reading it. */
export interface NoteValue {
  text: string;
  lang: Locale;
}

export type YesNo = "yes" | "no";

/** Every answer value is language-neutral except `note` / `text`. */
export interface PreferenceAnswer {
  /** "yes" | "no" for yes/no questions, an option id for choices,
   *  an ISO "HH:MM" string for times, a colour id for the colour picker. */
  value?: string;
  /** Free text that IS the answer (Other section) — language-tagged. */
  text?: NoteValue;
  /** Optional note column from the paper form — never blocks progress. */
  note?: NoteValue;
}

export interface CarePartnerAgreement {
  name: string;
  relationship: string;
  accepted: boolean;
  acceptedAt: string | null;
}

export interface PreferenceFormRecord {
  formVersion: "V12";
  /** Locale the form was presented and answered in. */
  locale: Locale;
  completedAt: string;
  answers: Record<string, PreferenceAnswer>;
  comments?: NoteValue;
  carePartner?: CarePartnerAgreement;
}

type ControlKind = "yesno" | "time" | "choice" | "text" | "color";

interface QuestionDef {
  /** Stable, language-neutral question id — this is what gets stored. */
  id: string;
  kind: ControlKind;
  /** Option ids for `choice` questions (stored verbatim, translated for display). */
  options?: readonly string[];
}

interface SectionDef {
  id: string;
  icon: any;
  questions: readonly QuestionDef[];
}

/** Favourite-colour options. THE ONE PLACE raw colours are legitimate: these
 *  are the answers the patient picks between, not theme styling. A patient's
 *  favourite colour has to be red, not "the active hospital's red". */
const SWATCHES = [
  { id: "red",    css: "#D64545" },
  { id: "orange", css: "#E08A2E" },
  { id: "yellow", css: "#E8C33F" },
  { id: "green",  css: "#3E9E6B" },
  { id: "teal",   css: "#2AA3A8" },
  { id: "blue",   css: "#3B7DD8" },
  { id: "purple", css: "#8256C4" },
  { id: "pink",   css: "#D96BA0" },
] as const;

const SECTIONS: readonly SectionDef[] = [
  {
    id: "food",
    icon: UtensilsCrossed,
    questions: [
      { id: "food.mealTiming", kind: "yesno" },
      { id: "food.dietary", kind: "yesno" },
    ],
  },
  {
    id: "partner",
    icon: Users,
    questions: [
      { id: "partner.participate", kind: "yesno" },
      { id: "partner.appAccess", kind: "yesno" },
    ],
  },
  {
    id: "handover",
    icon: Clock,
    questions: [
      { id: "handover.roundTime", kind: "time" },
      { id: "handover.presence", kind: "choice", options: ["present", "summary"] },
    ],
  },
  {
    id: "religious",
    icon: HeartHandshake,
    questions: [
      { id: "religious.support", kind: "yesno" },
      { id: "religious.interpreter", kind: "yesno" },
    ],
  },
  {
    id: "comfort",
    icon: ShieldCheck,
    questions: [
      { id: "comfort.grooming", kind: "yesno" },
      { id: "comfort.bathingTime", kind: "time" },
      { id: "comfort.rights", kind: "yesno" },
    ],
  },
  {
    id: "other",
    icon: MessageSquarePlus,
    questions: [
      { id: "other.otherPreference", kind: "text" },
      { id: "other.virtualRoom", kind: "yesno" },
      { id: "other.favouriteColour", kind: "color" },
    ],
  },
] as const;

/** The question whose "yes" inserts the care-partner agreement screen. */
const CARE_PARTNER_TRIGGER = "partner.participate";

type Screen =
  | { kind: "question"; section: SectionDef; q: QuestionDef }
  | { kind: "carePartner"; section: SectionDef }
  | { kind: "comments" };

export function PatientPreferenceForm({
  onClose,
  onSubmitted,
}: {
  onClose: () => void;
  /** Fired after a successful save — the consent checkbox ticks itself. */
  onSubmitted?: (record: PreferenceFormRecord) => void;
}) {
  const { theme, activeConfigId, darkMode } = useTheme();
  const { t, locale, isRTL, fontFamily } = useLocale();

  /* Secondary-colour foreground (icons and their labels).
   *
   * accentDark is the more legible of the two on the white card — it raises
   * contrast for all 10 hospitals (e.g. Burjeel 2.27:1 -> 3.63:1). But the
   * ramp inverts on the dark surface, where accentDark is worse for all 10 and
   * would drop five hospitals below the 3:1 floor. The patient can turn on dark
   * mode at the wizard's theme step, which runs before this form opens, so both
   * surfaces are reachable and the choice has to follow the mode.
   *
   * Borders, fills and the progress bar stay on theme.accent — they are
   * decoration, not something the patient has to read. */
  const iconColor = darkMode ? theme.accent : theme.accentDark;

  /* Q4 names the hospital's app. ThemeConfig carries only an English
     hospitalName, so the localized brand name is looked up by active config id
     and falls back to the English name when that hospital has no entry. */
  const appName = useMemo(() => {
    const key = `ppf.appName.${activeConfigId}`;
    const localized = t(key);
    return localized === key ? theme.hospitalName : localized;
  }, [activeConfigId, theme.hospitalName, t]);

  const [answers, setAnswers] = useState<Record<string, PreferenceAnswer>>({});
  const [comments, setComments] = useState("");
  const [partner, setPartner] = useState<CarePartnerAgreement>({
    name: "", relationship: "", accepted: false, acceptedAt: null,
  });
  const [index, setIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const wantsCarePartner = answers[CARE_PARTNER_TRIGGER]?.value === "yes";

  /* ── Screen list. The care-partner agreement is spliced in directly after
   *    its trigger question, so answering "yes" grows the total *while the
   *    patient is still looking at that question* — the count changes in
   *    response to their own tap, never as a surprise on a later screen. ── */
  const screens = useMemo<Screen[]>(() => {
    const list: Screen[] = [];
    for (const section of SECTIONS) {
      for (const q of section.questions) {
        list.push({ kind: "question", section, q });
        if (q.id === CARE_PARTNER_TRIGGER && wantsCarePartner) {
          list.push({ kind: "carePartner", section });
        }
      }
    }
    list.push({ kind: "comments" });
    return list;
  }, [wantsCarePartner]);

  // Defensive: if the list shrinks (yes → no) while further along, stay in range.
  const safeIndex = Math.min(index, screens.length - 1);
  const screen = screens[safeIndex];
  const isFirst = safeIndex === 0;
  const isLast = safeIndex === screens.length - 1;

  /* ── answer setters — all values stay language-neutral ── */

  const patch = (id: string, next: Partial<PreferenceAnswer>) =>
    setAnswers((prev) => ({ ...prev, [id]: { ...prev[id], ...next } }));

  /** Tapping the selected pill again clears it — nothing here is mandatory. */
  const setValue = (id: string, value: string) =>
    patch(id, { value: answers[id]?.value === value ? undefined : value });

  /** Notes and free text are the only place a raw language string is stored,
   *  so tag them with the locale they were written in. */
  const setTagged = (id: string, field: "note" | "text", raw: string) =>
    patch(id, { [field]: raw.trim() ? { text: raw, lang: locale } : undefined });

  const goNext = () => (isLast ? handleSubmit() : setIndex(safeIndex + 1));
  const goBack = () => setIndex(Math.max(0, safeIndex - 1));

  const handleSubmit = () => {
    const record: PreferenceFormRecord = {
      formVersion: "V12",
      locale,
      completedAt: new Date().toISOString(),
      answers,
      ...(comments.trim() ? { comments: { text: comments, lang: locale } } : {}),
      ...(wantsCarePartner ? { carePartner: partner } : {}),
    };
    try {
      localStorage.setItem(PREFS_ANSWERS_KEY, JSON.stringify(record));
    } catch {
      /* Storage full / blocked — the patient still completed the form, so
         never trap them on this screen because of it. */
    }
    setSubmitted(true);
    onSubmitted?.(record);
  };

  /* ═══════════════════ shared UI bits ═══════════════════ */

  const fieldStyle = (height: string) => ({
    width: "100%",
    height,
    padding: "14px 18px",
    borderRadius: theme.radiusLg,
    border: `1.5px solid ${theme.borderDefault}`,
    backgroundColor: theme.surface,
    fontFamily,
    fontSize: TYPE_SCALE.base,
    lineHeight: LEADING.normal,
    color: theme.textHeading,
    resize: "none" as const,
    outline: "none",
    direction: isRTL ? ("rtl" as const) : ("ltr" as const),
    textAlign: isRTL ? ("right" as const) : ("left" as const),
  });

  /** Selectable pill — same geometry as the concern "area" chips. */
  const renderPill = (key: string, selected: boolean, onClick: () => void, label: string) => (
    <button
      key={key}
      onClick={onClick}
      data-ppf-pill={key}
      className="transition-transform duration-200 active:scale-[0.96] cursor-pointer"
      style={{
        padding: "14px 40px",
        borderRadius: theme.radiusLg,
        border: selected ? `2px solid ${theme.accent}` : `1.5px solid ${theme.borderDefault}`,
        backgroundColor: selected ? theme.accentSubtle : theme.surface,
        fontFamily,
        fontSize: TYPE_SCALE.md,
        fontWeight: selected ? WEIGHT.bold : WEIGHT.medium,
        color: selected ? iconColor : theme.textBody,
        outline: "none",
      }}
    >
      {label}
    </button>
  );

  /** Compact notes field — the "Notes / ملاحظات" column from the paper form.
   *  Deliberately ~3 rows so it never pushes the footer off-screen. */
  const renderNotesField = (id: string) => (
    <div style={{ width: "100%", maxWidth: "760px", marginTop: "28px" }}>
      <span style={{
        fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.medium,
        color: theme.textMuted, display: "block", marginBottom: "8px",
        textAlign: isRTL ? "right" : "left",
      }}>
        {`${t("ppf.notes.label")} · ${t("ppf.optional")}`}
      </span>
      <textarea
        rows={3}
        value={answers[id]?.note?.text ?? ""}
        onChange={(e) => setTagged(id, "note", e.target.value)}
        placeholder={t("ppf.notes.placeholder")}
        className="ppf-field"
        style={fieldStyle("92px")}
      />
    </div>
  );

  const renderControl = (q: QuestionDef) => {
    switch (q.kind) {
      case "yesno":
        return (
          <div className="flex flex-wrap justify-center gap-4">
            {renderPill("yes", answers[q.id]?.value === "yes", () => setValue(q.id, "yes"), t("ppf.yes"))}
            {renderPill("no", answers[q.id]?.value === "no", () => setValue(q.id, "no"), t("ppf.no"))}
          </div>
        );

      case "choice":
        return (
          <div className="flex flex-wrap justify-center gap-4">
            {q.options!.map((opt) =>
              renderPill(opt, answers[q.id]?.value === opt, () => setValue(q.id, opt), t(`ppf.option.${q.id}.${opt}`))
            )}
          </div>
        );

      case "time":
        return (
          <div className="flex items-center justify-center gap-3" style={{ direction: "ltr" }}>
            <Clock size={26} style={{ color: iconColor }} />
            <input
              type="time"
              value={answers[q.id]?.value ?? ""}
              onChange={(e) => patch(q.id, { value: e.target.value || undefined })}
              aria-label={t("ppf.time.label")}
              className="ppf-field"
              style={{
                ...fieldStyle("60px"),
                width: "220px",
                direction: "ltr",
                textAlign: "left",
                fontSize: TYPE_SCALE.md,
                fontWeight: WEIGHT.semibold,
              }}
            />
          </div>
        );

      case "text":
        return (
          <div style={{ width: "100%", maxWidth: "760px" }}>
            <textarea
              rows={3}
              value={answers[q.id]?.text?.text ?? ""}
              onChange={(e) => setTagged(q.id, "text", e.target.value)}
              placeholder={t("ppf.freeText.placeholder")}
              className="ppf-field"
              style={fieldStyle("92px")}
            />
          </div>
        );

      case "color":
        return (
          <div className="flex flex-wrap justify-center gap-5">
            {SWATCHES.map((c) => {
              const selected = answers[q.id]?.value === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setValue(q.id, c.id)}
                  aria-label={t(`ppf.color.${c.id}`)}
                  className="flex flex-col items-center gap-2 cursor-pointer transition-transform duration-200 active:scale-[0.96]"
                  style={{ background: "none", border: "none", outline: "none", padding: 0 }}
                >
                  <span
                    className="flex items-center justify-center"
                    style={{
                      width: 60, height: 60,
                      borderRadius: theme.radiusFull,
                      backgroundColor: c.css,
                      border: selected ? `3px solid ${theme.accent}` : `1.5px solid ${theme.borderDefault}`,
                      boxShadow: selected ? SHADOW.md : SHADOW.sm,
                    }}
                  >
                    {selected && <Check size={26} color={theme.textInverse} strokeWidth={3} />}
                  </span>
                  <span style={{
                    fontFamily, fontSize: TYPE_SCALE.sm,
                    fontWeight: selected ? WEIGHT.bold : WEIGHT.medium,
                    color: selected ? theme.textHeading : theme.textMuted,
                  }}>
                    {t(`ppf.color.${c.id}`)}
                  </span>
                </button>
              );
            })}
          </div>
        );
    }
  };

  /** Section chip + name, shown above every question so the patient keeps
   *  their bearings now that only one question is on screen at a time. */
  const renderSectionBadge = (section: SectionDef) => {
    const Icon = section.icon;
    return (
      <div className="flex items-center justify-center gap-4" style={{ marginBottom: "20px" }}>
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: 60, height: 60, borderRadius: theme.radiusFull, backgroundColor: theme.accentSubtle }}
        >
          <Icon size={30} style={{ color: iconColor }} />
        </div>
        <span style={{
          fontFamily, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.semibold,
          color: iconColor, letterSpacing: "0.02em",
        }}>
          {t(`ppf.section.${section.id}.title`)}
        </span>
      </div>
    );
  };

  const renderQuestionScreen = (section: SectionDef, q: QuestionDef) => (
    <>
      {renderSectionBadge(section)}
      <h2 style={{
        fontFamily, fontSize: TYPE_SCALE.xl, fontWeight: WEIGHT.bold,
        color: theme.textHeading, lineHeight: LEADING.snug,
        textAlign: "center", maxWidth: "1000px", margin: "0 0 32px",
      }}>
        {t(`ppf.q.${q.id}`, appName)}
      </h2>
      {renderControl(q)}
      {renderNotesField(q.id)}
    </>
  );

  /** Care Partner agreement — its own screen, reached immediately after the
   *  patient answers "yes", so it is completed in the same flow. */
  const renderCarePartnerScreen = (section: SectionDef) => (
    <>
      {renderSectionBadge(section)}
      <h2 style={{
        fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold,
        color: theme.textHeading, lineHeight: LEADING.snug,
        textAlign: "center", margin: "0 0 12px",
      }}>
        {t("ppf.partner.agreement.title")}
      </h2>
      <p style={{
        fontFamily, fontSize: TYPE_SCALE.base, color: theme.textMuted,
        lineHeight: LEADING.normal, textAlign: "center",
        maxWidth: "860px", margin: "0 0 20px",
      }}>
        {t("ppf.partner.agreement.intro")}
      </p>

      <ul style={{ margin: "0 0 20px", padding: 0, listStyle: "none", maxWidth: "900px", width: "100%" }}>
        {["clause1", "clause2", "clause3", "clause4"].map((c) => (
          <li key={c} className="flex items-start gap-3" style={{ marginBottom: "8px" }}>
            <Check size={20} strokeWidth={3} style={{ color: iconColor, flexShrink: 0, marginTop: "3px" }} />
            <span style={{ fontFamily, fontSize: TYPE_SCALE.base, color: theme.textBody, lineHeight: LEADING.normal }}>
              {t(`ppf.partner.agreement.${c}`)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex gap-4 w-full" style={{ maxWidth: "900px", marginBottom: "16px" }}>
        <input
          value={partner.name}
          onChange={(e) => setPartner((p) => ({ ...p, name: e.target.value }))}
          placeholder={t("ppf.partner.agreement.namePlaceholder")}
          aria-label={t("ppf.partner.agreement.name")}
          className="ppf-field"
          style={{ ...fieldStyle("58px"), flex: 1 }}
        />
        <input
          value={partner.relationship}
          onChange={(e) => setPartner((p) => ({ ...p, relationship: e.target.value }))}
          placeholder={t("ppf.partner.agreement.relationshipPlaceholder")}
          aria-label={t("ppf.partner.agreement.relationship")}
          className="ppf-field"
          style={{ ...fieldStyle("58px"), flex: 1 }}
        />
      </div>

      <button
        onClick={() => setPartner((p) => ({
          ...p,
          accepted: !p.accepted,
          acceptedAt: !p.accepted ? new Date().toISOString() : null,
        }))}
        className="flex items-center gap-4 cursor-pointer transition-transform duration-200 active:scale-[0.99]"
        style={{
          width: "100%", maxWidth: "900px",
          padding: "16px 20px",
          borderRadius: theme.radiusLg,
          backgroundColor: partner.accepted ? theme.accentSubtle : theme.surface,
          border: partner.accepted ? `2px solid ${theme.accent}` : `2px solid ${theme.borderDefault}`,
          textAlign: isRTL ? "right" : "left",
          outline: "none",
        }}
      >
        <span
          className="flex items-center justify-center shrink-0"
          style={{
            width: "28px", height: "28px", borderRadius: "9px",
            border: partner.accepted ? "none" : `2px solid ${theme.borderDefault}`,
            backgroundColor: partner.accepted ? iconColor : "transparent",
          }}
        >
          {partner.accepted && <Check size={18} color={theme.textInverse} strokeWidth={3} />}
        </span>
        <span style={{ fontFamily, fontSize: TYPE_SCALE.base, color: theme.textBody, flex: 1, lineHeight: LEADING.normal }}>
          {t("ppf.partner.agreement.accept")}
        </span>
      </button>
    </>
  );

  const renderCommentsScreen = () => (
    <>
      <div className="flex items-center justify-center gap-4" style={{ marginBottom: "20px" }}>
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: 60, height: 60, borderRadius: theme.radiusFull, backgroundColor: theme.accentSubtle }}
        >
          <ClipboardList size={30} style={{ color: iconColor }} />
        </div>
      </div>
      <h2 style={{
        fontFamily, fontSize: TYPE_SCALE.xl, fontWeight: WEIGHT.bold,
        color: theme.textHeading, lineHeight: LEADING.snug,
        textAlign: "center", margin: "0 0 12px",
      }}>
        {t("ppf.comments.label")}
      </h2>
      <p style={{
        fontFamily, fontSize: TYPE_SCALE.base, color: theme.textMuted,
        textAlign: "center", margin: "0 0 24px",
      }}>
        {t("ppf.optional")}
      </p>
      <div style={{ width: "100%", maxWidth: "860px" }}>
        <textarea
          rows={4}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder={t("ppf.comments.placeholder")}
          className="ppf-field"
          style={fieldStyle("128px")}
        />
      </div>
    </>
  );

  /* ── navigation ─────────────────────────────────────────────────────────
   * Next is ALWAYS enabled — every question, and every note, is optional.
   * Back is present on every screen but the first, so an answer can always
   * be revised; a patient is never trapped moving forward. */

  const navButton = (
    label: string,
    onClick: () => void,
    variant: "ghost" | "primary",
    leadingIcon: React.ReactNode,
    trailingIcon: React.ReactNode,
  ) => (
    <button
      onClick={onClick}
      data-ppf={variant === "primary" ? "next" : "back"}
      className="flex items-center gap-2 cursor-pointer transition-transform duration-200 active:scale-[0.96]"
      style={{
        height: "56px", padding: "0 32px", borderRadius: "14px",
        fontFamily, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.semibold,
        backgroundColor: variant === "primary" ? theme.primary : theme.surface,
        color: variant === "primary" ? theme.textInverse : theme.textMuted,
        border: variant === "primary" ? "none" : `1.5px solid ${theme.borderDefault}`,
        boxShadow: variant === "primary" ? SHADOW.md : "none",
        outline: "none",
      }}
    >
      {leadingIcon}
      {label}
      {trailingIcon}
    </button>
  );

  /* Chevrons are part of the button label and inherit its text colour —
     forcing the accent onto the white-on-primary Next button would fail
     contrast. Every *content* icon uses iconColor. */
  const backChevron = isRTL ? <ChevronRight size={24} /> : <ChevronLeft size={24} />;
  const nextChevron = isRTL ? <ChevronLeft size={24} /> : <ChevronRight size={24} />;

  const renderBack = () =>
    isFirst ? <div /> : navButton(t("ppf.back"), goBack, "ghost", !isRTL ? backChevron : null, isRTL ? backChevron : null);

  const renderNext = () =>
    navButton(
      isLast ? t("ppf.submit") : t("ppf.next"),
      goNext,
      "primary",
      isRTL ? nextChevron : null,
      !isRTL ? nextChevron : null,
    );

  /** Shared page chrome — gradient canvas, hero wash and the navy header. */
  const renderShell = (body: React.ReactNode) => (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
        zIndex: 8500, // above the onboarding wizard (z-8000) that opens it
        direction: isRTL ? "rtl" : "ltr",
      }}
    >
      <ApiImage
        src={theme.heroImageUrl}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        style={{ opacity: 0.08, mixBlendMode: "luminosity", userSelect: "none" }}
      />

      <style>{`
        .ppf-field:focus { border-color: ${theme.accent} !important; }
        .ppf-field::placeholder { color: ${theme.textDisabled}; }
      `}</style>

      <InternalPageHeader
        title={t("ppf.title")}
        subtitle={theme.hospitalName}
        icon={<ClipboardList size={24} />}
        onClose={onClose}
      />

      <div className="flex-1 min-h-0 px-12 pt-2 pb-8 relative z-10 flex flex-col">
        <div
          className="flex-1 min-h-0 flex flex-col overflow-hidden"
          style={{
            backgroundColor: theme.surface,
            borderRadius: theme.radiusXl,
            boxShadow: SHADOW.xl,
            border: theme.cardBorder,
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );

  /* ═══════════════════ thank-you screen ═══════════════════ */

  if (submitted) {
    return renderShell(
      <div className="flex-1 flex flex-col items-center justify-center text-center px-16">
        <div className="flex items-center justify-center mb-8"
          style={{ width: 72, height: 72, borderRadius: theme.radiusFull, backgroundColor: theme.accentSubtle }}>
          <CheckCircle2 size={36} style={{ color: iconColor }} />
        </div>
        <h2 style={{ fontFamily, fontSize: TYPE_SCALE["2xl"], fontWeight: WEIGHT.bold, color: theme.textHeading, marginBottom: "16px" }}>
          {t("ppf.done.title")}
        </h2>
        <p style={{ fontFamily, fontSize: TYPE_SCALE.md, color: theme.textMuted, maxWidth: "620px", lineHeight: LEADING.relaxed, marginBottom: "32px" }}>
          {t("ppf.done.body")}
        </p>
        <button
          onClick={onClose}
          className="transition-transform duration-200 active:scale-[0.96] cursor-pointer"
          style={{
            padding: "16px 52px", borderRadius: theme.radiusMd,
            backgroundColor: theme.primary, border: "none", boxShadow: SHADOW.md,
          }}
        >
          <span style={{ fontFamily, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.bold, color: theme.textInverse }}>
            {t("ppf.done.close")}
          </span>
        </button>
      </div>
    );
  }

  /* ═══════════════════ question screen ═══════════════════ */

  const progress = (safeIndex + 1) / screens.length;

  return renderShell(
    <>
      {/* ─── Progress (same pattern as OnboardingWizard) ─── */}
      <div className="shrink-0 flex items-center gap-5 px-16 pt-8 pb-2" data-ppf="progress">
        <div className="flex-1">
          <div style={{ height: "8px", borderRadius: "100px", backgroundColor: theme.tileInactiveBg, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${progress * 100}%`,
              backgroundColor: theme.accent, borderRadius: "100px",
              transition: "width 0.25s ease",
            }} />
          </div>
        </div>
        <span className="shrink-0" style={{
          fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.bold,
          color: theme.textMuted, minWidth: "110px", textAlign: isRTL ? "left" : "right",
        }}>
          {t("onboarding.progress", safeIndex + 1, screens.length)}
        </span>
      </div>

      {/* ─── Question body — centered, never scrolls (see header comment) ─── */}
      <div
        key={safeIndex}
        data-ppf="body"
        className="flex-1 min-h-0 overflow-hidden flex flex-col items-center justify-center px-16 py-4"
      >
        {screen.kind === "question" && renderQuestionScreen(screen.section, screen.q)}
        {screen.kind === "carePartner" && renderCarePartnerScreen(screen.section)}
        {screen.kind === "comments" && renderCommentsScreen()}
      </div>

      {/* ─── Footer ─── */}
      <div
        className="shrink-0 flex items-center justify-between px-16 py-6"
        style={{ borderTop: `1.5px solid ${theme.borderSubtle}` }}
        data-ppf="footer"
      >
        {renderBack()}
        {renderNext()}
      </div>
    </>
  );
}
