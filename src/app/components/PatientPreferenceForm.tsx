import { useState } from "react";
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
 * Visual language is deliberately identical to SurveyModal ("Share Your
 * Experience"): brand-gradient canvas + faint hero photo, InternalPageHeader,
 * one large white rounded card, circular pastel icon chips and the same
 * TYPE_SCALE / WEIGHT pairings as the Quick Survey / Raise a Concern /
 * Send Appreciation cards.
 *
 * LANGUAGE: renders in whatever locale the patient picked at the wizard's
 * language step (read from useLocale — there is deliberately no picker here).
 * Answers are stored as LANGUAGE-NEUTRAL keys ("yes"/"no", option ids, ISO
 * "HH:MM" times, colour ids) so staff can read the record whatever language
 * the patient used. Free-text notes are the exception — they can only be
 * stored verbatim, so each is tagged with the locale it was written in.
 *
 * Sub-views are plain render functions (not nested components), matching
 * SurveyModal — a nested component would be a new type on every keystroke and
 * the notes textareas would lose focus.
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
  /** Optional note column from the paper form — never blocks submission. */
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

/* ── Section accents ───────────────────────────────────────────────────────
 * Fixed (non brand-variable) accent hues, following the CONCERN_COLOR /
 * APPRECIATION_COLOR precedent in SurveyModal. `subtle` is the same 8%
 * pastel wash used for the circular icon chips on the feedback hub cards. */
const ACCENT = {
  food:      { color: "#B26A00", subtle: "rgba(178,106,0,0.08)",  border: "rgba(178,106,0,0.18)" },
  partner:   { color: "#1B7F5A", subtle: "rgba(27,127,90,0.08)",  border: "rgba(27,127,90,0.18)" },
  handover:  { color: "#2563A8", subtle: "rgba(37,99,168,0.08)",  border: "rgba(37,99,168,0.18)" },
  religious: { color: "#6D4AA8", subtle: "rgba(109,74,168,0.08)", border: "rgba(109,74,168,0.18)" },
  comfort:   { color: "#0E7C86", subtle: "rgba(14,124,134,0.08)", border: "rgba(14,124,134,0.18)" },
  other:     { color: "#8A5A2B", subtle: "rgba(138,90,43,0.08)",  border: "rgba(138,90,43,0.18)" },
} as const;

type AccentKey = keyof typeof ACCENT;
type Accent = typeof ACCENT[AccentKey];
type ControlKind = "yesno" | "time" | "choice" | "text" | "color";

interface QuestionDef {
  /** Stable, language-neutral question id — this is what gets stored. */
  id: string;
  kind: ControlKind;
  /** Option ids for `choice` questions (stored verbatim, translated for display). */
  options?: readonly string[];
}

interface SectionDef {
  id: AccentKey;
  icon: any;
  questions: readonly QuestionDef[];
}

/** Favourite-colour swatches. The id is stored; the hex is display only. */
const COLOR_SWATCHES = [
  { id: "red",    hex: "#D64545" },
  { id: "orange", hex: "#E08A2E" },
  { id: "yellow", hex: "#E8C33F" },
  { id: "green",  hex: "#3E9E6B" },
  { id: "teal",   hex: "#2AA3A8" },
  { id: "blue",   hex: "#3B7DD8" },
  { id: "purple", hex: "#8256C4" },
  { id: "pink",   hex: "#D96BA0" },
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

export function PatientPreferenceForm({
  onClose,
  onSubmitted,
}: {
  onClose: () => void;
  /** Fired after a successful save — the consent checkbox ticks itself. */
  onSubmitted?: (record: PreferenceFormRecord) => void;
}) {
  const { theme } = useTheme();
  const { t, locale, isRTL, fontFamily } = useLocale();

  const [answers, setAnswers] = useState<Record<string, PreferenceAnswer>>({});
  const [comments, setComments] = useState("");
  const [partner, setPartner] = useState<CarePartnerAgreement>({
    name: "", relationship: "", accepted: false, acceptedAt: null,
  });
  const [submitted, setSubmitted] = useState(false);

  const showCarePartnerAgreement = answers["partner.participate"]?.value === "yes";

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

  const handleSubmit = () => {
    const record: PreferenceFormRecord = {
      formVersion: "V12",
      locale,
      completedAt: new Date().toISOString(),
      answers,
      ...(comments.trim() ? { comments: { text: comments, lang: locale } } : {}),
      ...(showCarePartnerAgreement ? { carePartner: partner } : {}),
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

  const fieldStyle = (accent: Accent, height: string) => ({
    width: "100%",
    height,
    padding: "16px 20px",
    borderRadius: theme.radiusLg,
    border: `1.5px solid ${theme.borderDefault}`,
    backgroundColor: theme.surface,
    fontFamily,
    fontSize: TYPE_SCALE.base,
    color: theme.textHeading,
    resize: "none" as const,
    outline: "none",
    direction: isRTL ? ("rtl" as const) : ("ltr" as const),
    textAlign: isRTL ? ("right" as const) : ("left" as const),
    ["--ppf-accent" as any]: accent.color,
  });

  /** Selectable pill — same geometry as the concern "area" chips. */
  const renderPill = (key: string, selected: boolean, onClick: () => void, label: string, accent: Accent) => (
    <button
      key={key}
      onClick={onClick}
      className="transition-transform duration-200 active:scale-[0.96] cursor-pointer"
      style={{
        padding: "12px 32px",
        borderRadius: theme.radiusLg,
        border: selected ? `2px solid ${accent.color}` : `1.5px solid ${theme.borderDefault}`,
        backgroundColor: selected ? accent.subtle : theme.surface,
        fontFamily,
        fontSize: TYPE_SCALE.base,
        fontWeight: selected ? WEIGHT.bold : WEIGHT.medium,
        color: selected ? accent.color : theme.textBody,
        outline: "none",
      }}
    >
      {label}
    </button>
  );

  /** Optional notes field — mirrors the "Notes / ملاحظات" column on the paper
   *  form. Present on every question, always optional, never gates submit. */
  const renderNotesField = (id: string, accent: Accent) => (
    <div style={{ marginTop: "16px" }}>
      <span style={{
        fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.medium,
        color: theme.textMuted, display: "block", marginBottom: "8px",
      }}>
        {`${t("ppf.notes.label")} · ${t("ppf.optional")}`}
      </span>
      <textarea
        value={answers[id]?.note?.text ?? ""}
        onChange={(e) => setTagged(id, "note", e.target.value)}
        placeholder={t("ppf.notes.placeholder")}
        className="ppf-field"
        style={fieldStyle(accent, "84px")}
      />
    </div>
  );

  const renderControl = (q: QuestionDef, accent: Accent) => {
    switch (q.kind) {
      case "yesno":
        return (
          <div className="flex flex-wrap gap-3">
            {renderPill("yes", answers[q.id]?.value === "yes", () => setValue(q.id, "yes"), t("ppf.yes"), accent)}
            {renderPill("no", answers[q.id]?.value === "no", () => setValue(q.id, "no"), t("ppf.no"), accent)}
          </div>
        );

      case "choice":
        return (
          <div className="flex flex-wrap gap-3">
            {q.options!.map((opt) =>
              renderPill(opt, answers[q.id]?.value === opt, () => setValue(q.id, opt), t(`ppf.option.${q.id}.${opt}`), accent)
            )}
          </div>
        );

      case "time":
        return (
          <div className="flex items-center gap-3" style={{ direction: "ltr" }}>
            <Clock size={22} style={{ color: accent.color }} />
            <input
              type="time"
              value={answers[q.id]?.value ?? ""}
              onChange={(e) => patch(q.id, { value: e.target.value || undefined })}
              aria-label={t("ppf.time.label")}
              className="ppf-field"
              style={{
                ...fieldStyle(accent, "56px"),
                width: "200px",
                padding: "0 20px",
                direction: "ltr",
                textAlign: "left",
                fontWeight: WEIGHT.semibold,
              }}
            />
          </div>
        );

      case "text":
        return (
          <textarea
            value={answers[q.id]?.text?.text ?? ""}
            onChange={(e) => setTagged(q.id, "text", e.target.value)}
            placeholder={t("ppf.freeText.placeholder")}
            className="ppf-field"
            style={fieldStyle(accent, "110px")}
          />
        );

      case "color":
        return (
          <div className="flex flex-wrap gap-4">
            {COLOR_SWATCHES.map((c) => {
              const selected = answers[q.id]?.value === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setValue(q.id, c.id)}
                  title={t(`ppf.color.${c.id}`)}
                  aria-label={t(`ppf.color.${c.id}`)}
                  className="flex flex-col items-center gap-2 cursor-pointer transition-transform duration-200 active:scale-[0.96]"
                  style={{ background: "none", border: "none", outline: "none", padding: 0 }}
                >
                  <span
                    className="flex items-center justify-center"
                    style={{
                      width: 56, height: 56,
                      borderRadius: theme.radiusFull,
                      backgroundColor: c.hex,
                      border: selected ? `3px solid ${theme.textHeading}` : `1.5px solid ${theme.borderDefault}`,
                      boxShadow: selected ? SHADOW.md : SHADOW.sm,
                    }}
                  >
                    {selected && <Check size={24} color="#FFFFFF" strokeWidth={3} />}
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

  const renderQuestionCard = (q: QuestionDef, accent: Accent) => (
    <div
      style={{
        padding: "26px 28px",
        borderRadius: theme.radiusLg,
        backgroundColor: theme.surface,
        border: `1.5px solid ${theme.borderDefault}`,
        boxShadow: SHADOW.sm,
      }}
    >
      <p style={{
        fontFamily, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.semibold,
        color: theme.textHeading, lineHeight: LEADING.compact, margin: "0 0 18px",
      }}>
        {t(`ppf.q.${q.id}`)}
      </p>
      {renderControl(q, accent)}
      {renderNotesField(q.id, accent)}
    </div>
  );

  /** Care Partner agreement — surfaced inline the moment the patient answers
   *  "yes" to the programme, so it can be completed in the same flow. */
  const renderCarePartnerAgreement = () => {
    const accent = ACCENT.partner;
    return (
      <div
        style={{
          padding: "28px 30px",
          borderRadius: theme.radiusLg,
          backgroundColor: accent.subtle,
          border: `1.5px solid ${accent.border}`,
        }}
      >
        <div className="flex items-center gap-4" style={{ marginBottom: "16px" }}>
          <div className="flex items-center justify-center shrink-0"
            style={{ width: 44, height: 44, borderRadius: theme.radiusFull, backgroundColor: theme.surface }}>
            <HeartHandshake size={22} style={{ color: accent.color }} />
          </div>
          <span style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, color: theme.textHeading }}>
            {t("ppf.partner.agreement.title")}
          </span>
        </div>

        <p style={{ fontFamily, fontSize: TYPE_SCALE.base, color: theme.textBody, lineHeight: LEADING.relaxed, margin: "0 0 16px" }}>
          {t("ppf.partner.agreement.intro")}
        </p>

        <ul style={{ margin: "0 0 24px", padding: 0, listStyle: "none" }}>
          {["clause1", "clause2", "clause3", "clause4"].map((c) => (
            <li key={c} className="flex items-start gap-3" style={{ marginBottom: "10px" }}>
              <Check size={20} strokeWidth={3} style={{ color: accent.color, flexShrink: 0, marginTop: "4px" }} />
              <span style={{ fontFamily, fontSize: TYPE_SCALE.base, color: theme.textBody, lineHeight: LEADING.relaxed }}>
                {t(`ppf.partner.agreement.${c}`)}
              </span>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-4" style={{ marginBottom: "20px" }}>
          <div>
            <span style={{ fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.medium, color: theme.textMuted, display: "block", marginBottom: "8px" }}>
              {`${t("ppf.partner.agreement.name")} · ${t("ppf.optional")}`}
            </span>
            <input
              value={partner.name}
              onChange={(e) => setPartner((p) => ({ ...p, name: e.target.value }))}
              placeholder={t("ppf.partner.agreement.namePlaceholder")}
              className="ppf-field"
              style={{ ...fieldStyle(accent, "56px"), padding: "0 20px" }}
            />
          </div>
          <div>
            <span style={{ fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.medium, color: theme.textMuted, display: "block", marginBottom: "8px" }}>
              {`${t("ppf.partner.agreement.relationship")} · ${t("ppf.optional")}`}
            </span>
            <input
              value={partner.relationship}
              onChange={(e) => setPartner((p) => ({ ...p, relationship: e.target.value }))}
              placeholder={t("ppf.partner.agreement.relationshipPlaceholder")}
              className="ppf-field"
              style={{ ...fieldStyle(accent, "56px"), padding: "0 20px" }}
            />
          </div>
        </div>

        <button
          onClick={() => setPartner((p) => ({
            ...p,
            accepted: !p.accepted,
            acceptedAt: !p.accepted ? new Date().toISOString() : null,
          }))}
          className="flex items-center gap-4 w-full cursor-pointer transition-transform duration-200 active:scale-[0.99]"
          style={{
            padding: "18px 20px",
            borderRadius: theme.radiusLg,
            backgroundColor: theme.surface,
            border: partner.accepted ? `2px solid ${accent.color}` : `2px solid ${theme.borderDefault}`,
            textAlign: isRTL ? "right" : "left",
            outline: "none",
          }}
        >
          <span
            className="flex items-center justify-center shrink-0"
            style={{
              width: "28px", height: "28px", borderRadius: "9px",
              border: partner.accepted ? "none" : `2px solid ${theme.borderDefault}`,
              backgroundColor: partner.accepted ? accent.color : "transparent",
            }}
          >
            {partner.accepted && <Check size={18} color="#FFFFFF" strokeWidth={3} />}
          </span>
          <span style={{ fontFamily, fontSize: TYPE_SCALE.base, color: theme.textBody, flex: 1, lineHeight: LEADING.relaxed }}>
            {t("ppf.partner.agreement.accept")}
          </span>
        </button>
      </div>
    );
  };

  const renderBackButton = () => (
    <button
      onClick={onClose}
      className="flex items-center gap-2 cursor-pointer transition-transform duration-200 active:scale-[0.96]"
      style={{
        border: `1.5px solid ${theme.borderDefault}`, height: "52px", padding: "0 24px",
        borderRadius: "14px", backgroundColor: theme.surface, fontFamily,
        fontSize: "18px", fontWeight: WEIGHT.semibold, color: theme.textMuted, outline: "none",
      }}
    >
      {!isRTL && <ChevronLeft size={22} />}
      {t("ppf.back")}
      {isRTL && <ChevronRight size={22} />}
    </button>
  );

  const renderSubmitButton = () => (
    <button
      onClick={handleSubmit}
      className="flex items-center gap-2 transition-transform duration-200 active:scale-[0.96] cursor-pointer"
      style={{
        fontFamily, fontSize: "18px", fontWeight: WEIGHT.semibold, color: "#fff",
        height: "52px", padding: "0 28px", borderRadius: "14px",
        backgroundColor: theme.primary, border: `1px solid rgba(255,255,255,0.35)`,
        boxShadow: SHADOW.md, outline: "none",
      }}
    >
      {isRTL && <ChevronLeft size={22} />}
      {t("ppf.submit")}
      {!isRTL && <ChevronRight size={22} />}
    </button>
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
        .ppf-field:focus { border-color: var(--ppf-accent) !important; }
        .ppf-field::placeholder { color: ${theme.textDisabled}; }
        .ppf-scroll::-webkit-scrollbar { width: 10px; }
        .ppf-scroll::-webkit-scrollbar-thumb { background: ${theme.borderDefault}; border-radius: 999px; }
      `}</style>

      {/* ─── Header (white text on brand gradient) ─── */}
      <InternalPageHeader
        title={t("ppf.title")}
        subtitle={theme.hospitalName}
        icon={<ClipboardList size={24} />}
        onClose={onClose}
      />

      {/* ─── Main content — large white rounded card ─── */}
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

  /* ═══════════════════ main render ═══════════════════ */

  if (submitted) {
    return renderShell(
      <div className="flex-1 flex flex-col items-center justify-center text-center px-16">
        <div className="flex items-center justify-center mb-8"
          style={{ width: 72, height: 72, borderRadius: theme.radiusFull, backgroundColor: theme.primarySubtle }}>
          <CheckCircle2 size={36} style={{ color: theme.primary }} />
        </div>
        <h2 style={{ fontFamily, fontSize: TYPE_SCALE["2xl"], fontWeight: WEIGHT.bold, color: theme.textHeading, marginBottom: "16px" }}>
          {t("ppf.done.title")}
        </h2>
        <p style={{ fontFamily, fontSize: TYPE_SCALE.md, color: theme.textMuted, maxWidth: "560px", lineHeight: LEADING.relaxed, marginBottom: "32px" }}>
          {t("ppf.done.body")}
        </p>
        <button
          onClick={onClose}
          className="transition-transform duration-200 active:scale-[0.96] cursor-pointer"
          style={{
            padding: "14px 48px", borderRadius: theme.radiusMd,
            backgroundColor: theme.primary, border: "none", boxShadow: SHADOW.md,
          }}
        >
          <span style={{ fontFamily, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.bold, color: "#fff" }}>
            {t("ppf.done.close")}
          </span>
        </button>
      </div>
    );
  }

  return renderShell(
    <>
      <div className="ppf-scroll flex-1 min-h-0 overflow-y-auto px-16 pt-10 pb-8">
        <div className="w-full max-w-[1120px] mx-auto flex flex-col" style={{ gap: "48px" }}>
          <p style={{
            fontFamily, fontSize: TYPE_SCALE.base, color: theme.textMuted,
            lineHeight: LEADING.relaxed, margin: 0,
          }}>
            {t("ppf.intro")}
          </p>

          {SECTIONS.map((section) => {
            const accent = ACCENT[section.id];
            const Icon = section.icon;
            return (
              <div key={section.id}>
                {/* Section header — circular pastel icon chip */}
                <div className="flex items-center gap-5" style={{ marginBottom: "20px" }}>
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{ width: 64, height: 64, borderRadius: theme.radiusFull, backgroundColor: accent.subtle }}
                  >
                    <Icon size={32} style={{ color: accent.color }} />
                  </div>
                  <div className="flex flex-col">
                    <span style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, color: theme.textHeading, marginBottom: "4px" }}>
                      {t(`ppf.section.${section.id}.title`)}
                    </span>
                    <span style={{ fontFamily, fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.medium, color: theme.textMuted }}>
                      {t(`ppf.section.${section.id}.subtitle`)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col" style={{ gap: "16px" }}>
                  {section.questions.map((q) => (
                    <div key={q.id} className="flex flex-col" style={{ gap: "16px" }}>
                      {renderQuestionCard(q, accent)}
                      {q.id === "partner.participate" && showCarePartnerAgreement && renderCarePartnerAgreement()}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* ─── General comments ─── */}
          <div>
            <h3 style={{
              fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold,
              color: theme.textHeading, margin: "0 0 8px",
            }}>
              {t("ppf.comments.label")}
            </h3>
            <span style={{
              fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.medium,
              color: theme.textMuted, display: "block", marginBottom: "12px",
            }}>
              {t("ppf.optional")}
            </span>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={t("ppf.comments.placeholder")}
              className="ppf-field"
              style={fieldStyle(ACCENT.other, "140px")}
            />
          </div>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <div
        className="shrink-0 flex items-center justify-between px-10 py-5"
        style={{ borderTop: `1.5px solid ${theme.borderSubtle}`, direction: "ltr" }}
      >
        {isRTL ? (
          <>{renderSubmitButton()}{renderBackButton()}</>
        ) : (
          <>{renderBackButton()}{renderSubmitButton()}</>
        )}
      </div>
    </>
  );
}
