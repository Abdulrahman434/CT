import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW, LEADING } from "./ThemeContext";
import { useLocale, type Locale } from "./i18n";
import {
  ClipboardList, UtensilsCrossed, Users, Clock, HeartHandshake,
  ShieldCheck, MessageSquarePlus, Check, CheckCircle2,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { InternalPageHeader } from "./InternalPageHeader";
import { ApiImage } from "./ApiImage";
import { QuestionProgress, QuestionProgressBar } from "./QuestionProgress";

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
 *   header (InternalPageHeader)   ~120px
 *   progress block (shared)       ~185px
 *   question body (centered)      ~530px   ← all content must fit here
 *   footer (Back / Next)          ~104px
 *
 * Arabic and Urdu run longer than English, so every size below is chosen for
 * the longest of the three, not for English. The tallest screen is Q6
 * (bedside handover): 4 lines of question text in English, 3 in Arabic/Urdu.
 *
 * Question text is TYPE_SCALE.lg (26px) at the 1920x1080 design scale, and
 * that is the floor for this screen rather than a starting point: patients
 * here are elderly or unwell, so anything under ~20px is not readable from a
 * bed. If a future translation stops fitting, widen the body or cut words —
 * do not go under it.
 *
 * COLOUR — no hex literals anywhere. Every content icon is the per-hospital
 * secondary on a theme.accentSubtle chip, so icons re-brand with the active
 * hospital. See iconColor below for why the exact token depends on light/dark
 * mode. (The favourite-colour question used to be the one exception, holding
 * raw swatches as answer options; it is a free-text field now, so the rule has
 * no exceptions left.)
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
  /** "yes" | "no" for yes/no questions, an option id for choices, a 24-hour
   *  "HH:MM" string for times, or NO_PREFERENCE when the patient deliberately
   *  declined to choose. */
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

/** Stored when the patient taps "No preference". A real, deliberate answer —
 *  distinct from an unanswered question, which is what Next now blocks on. */
export const NO_PREFERENCE = "no-preference";

type ControlKind = "yesno" | "time" | "choice" | "text";

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

/* ── Time ─────────────────────────────────────────────────────────────
 * Every choice is a button already on screen. The native <input type="time">
 * was a dropdown with minute-by-minute scrolling — the wrong control for a
 * bedside panel — and its calendar-picker glyph was the duplicate clock icon.
 * Both are gone with the native control.
 *
 * 6 AM - 9 PM covers doctors' rounds and the daily bath; the half hour is one
 * further tap, so every offered time is at most two taps away. */
const TIME_HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21] as const;

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
      { id: "other.favouriteColour", kind: "text" },
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

  /* ── THE layout constraint ────────────────────────────────────────────
   * The card is pinned to the viewport and never scrolls, so its content has
   * to fit whatever height the card is given. That height is not always the
   * 1920x1080 design budget: this form is opened by the onboarding wizard,
   * which App.tsx renders OUTSIDE the scaled design canvas, so on a panel
   * shorter than 1080 CSS px the card gets correspondingly less.
   *
   * So the card measures itself, and below the design height every vertical
   * gap on every screen tightens together — one rule, no per-question
   * exceptions. Font sizes are deliberately NOT part of it: 26px question
   * text is the floor for a bedside screen, not a starting point. */
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardHeight, setCardHeight] = useState(0);
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setCardHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  /* 920px is the card at the design canvas; below that, tighten. */
  const dense = cardHeight > 0 && cardHeight < 900;

  /** Every vertical measurement the constraint moves, in one place. */
  const M = dense
    ? { progressTop: "10px", progressGap: "8px", chip: 40, chipIcon: 20, chipGap: "8px",
        qGap: "12px", stackGap: "6px", notesTop: "10px", notesH: "48px",
        footerY: "12px", reserved: "46px", timeH: "46px", pillY: "10px" }
    : { progressTop: "24px", progressGap: "14px", chip: 48, chipIcon: 24, chipGap: "14px",
        qGap: "20px", stackGap: "12px", notesTop: "16px", notesH: "64px",
        footerY: "20px", reserved: "56px", timeH: "56px", pillY: "14px" };

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

  /** Tapping the selected pill again clears it. Next then blocks again, which
   *  is the point: an answer is only recorded when the patient chose it. */
  const setValue = (id: string, value: string) =>
    patch(id, { value: answers[id]?.value === value ? undefined : value });

  /** Notes and free text are the only place a raw language string is stored,
   *  so tag them with the locale they were written in. */
  const setTagged = (id: string, field: "note" | "text", raw: string) =>
    patch(id, { [field]: raw.trim() ? { text: raw, lang: locale } : undefined });

  /* ── Can this screen be left? ─────────────────────────────────────────
   * Next is gated on a real answer so nothing is recorded as "skipped" that
   * the patient never saw. That only works if every screen HAS an answer the
   * patient can give, so every control that cannot be satisfied by tapping an
   * option — both time questions and the free-text one — carries an explicit
   * "No preference". Notes are never consulted: they stay optional. */
  const canAdvance = (() => {
    if (screen.kind === "comments") return true;          // closing screen, optional by design
    if (screen.kind === "carePartner") return partner.accepted;
    const a = answers[screen.q.id];
    if (screen.q.kind === "text") return a?.value === NO_PREFERENCE || !!a?.text?.text.trim();
    return !!a?.value;
  })();

  const goNext = () => {
    if (!canAdvance) return;
    isLast ? handleSubmit() : setIndex(safeIndex + 1);
  };
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
        padding: `${M.pillY} 40px`,
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
   *  Two rows: it is the last thing in the body, so any growth here is what
   *  reaches the footer first. Never gates Next. */
  const renderNotesField = (id: string) => (
    <div className="shrink-0" style={{ width: "100%", maxWidth: "760px", marginTop: M.notesTop }}>
      <span style={{
        fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.medium,
        color: theme.textMuted, display: "block", marginBottom: "6px",
        textAlign: isRTL ? "right" : "left",
      }}>
        {`${t("ppf.notes.label")} · ${t("ppf.optional")}`}
      </span>
      <textarea
        rows={2}
        value={answers[id]?.note?.text ?? ""}
        onChange={(e) => setTagged(id, "note", e.target.value)}
        placeholder={t("ppf.notes.placeholder")}
        className="ppf-field"
        style={fieldStyle(M.notesH)}
      />
    </div>
  );

  /** The deliberate way out of a question with nothing to enter. Same pill as
   *  every other option, so it reads as an answer and not as a skip link. */
  const renderNoPreference = (id: string) =>
    renderPill(NO_PREFERENCE, answers[id]?.value === NO_PREFERENCE,
      () => setValue(id, NO_PREFERENCE), t("ppf.noPreference"));

  /** Free-text questions share one control; only the prompt differs. Falls
   *  back to the generic placeholder for questions that need no special one. */
  const placeholderFor = (id: string) => {
    const key = `ppf.placeholder.${id}`;
    const localized = t(key);
    return localized === key ? t("ppf.freeText.placeholder") : localized;
  };

  /** "6:00 AM" / "٦:٠٠ ص" — the display form of a stored "HH:MM". */
  const timeLabel = (h24: number, minutes: string) =>
    `${((h24 + 11) % 12) + 1}:${minutes} ${t(h24 < 12 ? "ppf.time.am" : "ppf.time.pm")}`;

  /** Big, always-visible time button. */
  const renderTimeButton = (key: string, selected: boolean, onClick: () => void, label: string, width?: string) => (
    <button
      key={key}
      onClick={onClick}
      data-ppf-time={key}
      className="transition-transform duration-200 active:scale-[0.96] cursor-pointer"
      style={{
        height: M.timeH, width, padding: "0 12px",
        borderRadius: theme.radiusLg,
        border: selected ? `2px solid ${theme.accent}` : `1.5px solid ${theme.borderDefault}`,
        backgroundColor: selected ? theme.accentSubtle : theme.surface,
        fontFamily, fontSize: TYPE_SCALE.md,
        fontWeight: selected ? WEIGHT.bold : WEIGHT.medium,
        color: selected ? iconColor : theme.textBody,
        outline: "none",
      }}
    >
      {label}
    </button>
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

      case "time": {
        /* Tap 1 picks the hour (and answers the question at ":00"); tap 2 is
           the optional half hour. The minute row only exists once an hour is
           chosen, so it can never be a control that does nothing — but its
           height is reserved either way, so nothing below it moves. */
        const value = answers[q.id]?.value;
        const picked = value && value !== NO_PREFERENCE ? value : undefined;
        const pickedHour = picked ? Number(picked.slice(0, 2)) : undefined;
        const pickedMinutes = picked ? picked.slice(3) : "00";
        return (
          <div className="flex flex-col items-center w-full" style={{ gap: M.stackGap }}>
            <span style={{ fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.medium, color: theme.textMuted }}>
              {t("ppf.time.hint")}
            </span>
            <div
              style={{
                display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "10px",
                width: "100%", maxWidth: "1400px",
              }}
            >
              {TIME_HOURS.map((h) =>
                renderTimeButton(
                  String(h),
                  pickedHour === h,
                  () => setValue(q.id, `${String(h).padStart(2, "0")}:${pickedHour === h ? pickedMinutes : "00"}`),
                  timeLabel(h, pickedHour === h ? pickedMinutes : "00")
                )
              )}
            </div>
            <div className="flex items-center justify-center gap-3" style={{ height: M.reserved }}>
              {pickedHour !== undefined && ["00", "30"].map((mm) =>
                renderTimeButton(
                  `m${mm}`,
                  pickedMinutes === mm,
                  () => patch(q.id, { value: `${String(pickedHour).padStart(2, "0")}:${mm}` }),
                  timeLabel(pickedHour, mm),
                  "170px"
                )
              )}
            </div>
            {renderNoPreference(q.id)}
          </div>
        );
      }

      case "text":
        /* Typing is the answer here, so a patient with nothing to add would
           have no way forward without the pill. Typing clears it, and picking
           it clears what was typed — the record never holds both. */
        return (
          <div className="flex flex-col items-center w-full" style={{ gap: M.stackGap }}>
            <div style={{ width: "100%", maxWidth: "760px" }}>
              <textarea
                rows={2}
                value={answers[q.id]?.text?.text ?? ""}
                onChange={(e) => {
                  setTagged(q.id, "text", e.target.value);
                  if (e.target.value.trim()) patch(q.id, { value: undefined });
                }}
                placeholder={placeholderFor(q.id)}
                className="ppf-field"
                style={fieldStyle(M.notesH)}
              />
            </div>
            {renderPill(
              NO_PREFERENCE,
              answers[q.id]?.value === NO_PREFERENCE,
              () => {
                const on = answers[q.id]?.value === NO_PREFERENCE;
                patch(q.id, { value: on ? undefined : NO_PREFERENCE, text: on ? answers[q.id]?.text : undefined });
              },
              t("ppf.noPreference")
            )}
          </div>
        );
    }
  };

  /** Section chip + name, shown above every question so the patient keeps
   *  their bearings now that only one question is on screen at a time. */
  const renderSectionBadge = (section: SectionDef) => {
    const Icon = section.icon;
    return (
      <div className="flex items-center justify-center gap-3 shrink-0" style={{ marginBottom: M.chipGap }}>
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: M.chip, height: M.chip, borderRadius: theme.radiusFull, backgroundColor: theme.accentSubtle }}
        >
          <Icon size={M.chipIcon} style={{ color: iconColor }} />
        </div>
        <span style={{
          fontFamily, fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.semibold,
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
        fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold,
        color: theme.textHeading, lineHeight: LEADING.snug,
        textAlign: "center", maxWidth: "1180px", margin: `0 0 ${M.qGap}`,
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
        maxWidth: "980px", margin: "0 0 14px",
      }}>
        {t("ppf.partner.agreement.intro")}
      </p>

      <ul style={{ margin: "0 0 14px", padding: 0, listStyle: "none", maxWidth: "1000px", width: "100%" }}>
        {["clause1", "clause2", "clause3", "clause4"].map((c) => (
          <li key={c} className="flex items-start gap-3" style={{ marginBottom: "6px" }}>
            <Check size={20} strokeWidth={3} style={{ color: iconColor, flexShrink: 0, marginTop: "3px" }} />
            <span style={{ fontFamily, fontSize: TYPE_SCALE.base, color: theme.textBody, lineHeight: LEADING.normal }}>
              {t(`ppf.partner.agreement.${c}`)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex gap-4 w-full shrink-0" style={{ maxWidth: "1000px", marginBottom: "12px" }}>
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
        data-ppf="accept"
        className="flex items-center gap-4 cursor-pointer transition-transform duration-200 active:scale-[0.99]"
        style={{
          width: "100%", maxWidth: "1000px",
          padding: "14px 20px",
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
      <div className="flex items-center justify-center gap-4 shrink-0" style={{ marginBottom: M.chipGap }}>
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: M.chip, height: M.chip, borderRadius: theme.radiusFull, backgroundColor: theme.accentSubtle }}
        >
          <ClipboardList size={M.chipIcon} style={{ color: iconColor }} />
        </div>
      </div>
      <h2 style={{
        fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold,
        color: theme.textHeading, lineHeight: LEADING.snug,
        textAlign: "center", margin: "0 0 8px",
      }}>
        {t("ppf.comments.label")}
      </h2>
      <p style={{
        fontFamily, fontSize: TYPE_SCALE.base, color: theme.textMuted,
        textAlign: "center", margin: "0 0 16px",
      }}>
        {t("ppf.optional")}
      </p>
      <div style={{ width: "100%", maxWidth: "860px" }}>
        <textarea
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder={t("ppf.comments.placeholder")}
          className="ppf-field"
          style={fieldStyle("96px")}
        />
      </div>
    </>
  );

  /* ── navigation ─────────────────────────────────────────────────────────
   * Next waits for an answer, so nothing is stored as answered that the
   * patient never chose. Every screen has an answer they can give — see
   * canAdvance — so waiting can never become being stuck. Notes are not part
   * of it. Back is present on every screen but the first, so an answer can
   * always be revised. */

  const navButton = (
    label: string,
    onClick: () => void,
    variant: "ghost" | "primary",
    leadingIcon: React.ReactNode,
    trailingIcon: React.ReactNode,
    disabled = false,
  ) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      data-ppf={variant === "primary" ? "next" : "back"}
      className={`flex items-center gap-2 transition-transform duration-200 ${disabled ? "" : "cursor-pointer active:scale-[0.96]"}`}
      style={{
        height: "56px", padding: "0 32px", borderRadius: "14px",
        fontFamily, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.semibold,
        backgroundColor: disabled ? theme.tileInactiveBg : variant === "primary" ? theme.primary : theme.surface,
        color: disabled ? theme.textDisabled : variant === "primary" ? theme.textInverse : theme.textMuted,
        border: variant === "primary" || disabled ? "none" : `1.5px solid ${theme.borderDefault}`,
        boxShadow: variant === "primary" && !disabled ? SHADOW.md : "none",
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
      !canAdvance,
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

      <div className="flex-1 min-h-0 px-12 pt-2 pb-6 relative z-10 flex flex-col">
        <div
          ref={cardRef}
          className="flex-1 min-h-0 flex flex-col overflow-hidden relative"
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

  return renderShell(
    <>
      {/* ─── Progress — the Share Your Experience design, shared component ─── */}
      <QuestionProgressBar current={safeIndex + 1} total={screens.length} />
      <div
        className="shrink-0"
        style={{ paddingTop: M.progressTop }}
        data-ppf="progress"
        data-ppf-progress-count={screens.length}
      >
        <QuestionProgress
          current={safeIndex + 1}
          total={screens.length}
          marginBottom={M.progressGap}
          dense={dense}
        />
      </div>

      {/* ─── Question body — centered, never scrolls (see header comment) ─── */}
      <div
        key={safeIndex}
        data-ppf="body"
        className="flex-1 min-h-0 overflow-hidden flex flex-col px-16 pb-2"
      >
        {/* Auto block margins, not justify-center. Centred while there is
            room; collapsed to zero when there is not, so a question that wraps
            to more lines than fit can only ever overflow downward — it can
            never ride up over the badge and counter above it. This is the one
            rule that keeps every screen off the header, at any card height and
            any number of wrapped lines. */}
        <div
          data-ppf="content"
          className="flex flex-col items-center w-full"
          style={{ marginTop: "auto", marginBottom: "auto" }}
        >
          {screen.kind === "question" && renderQuestionScreen(screen.section, screen.q)}
          {screen.kind === "carePartner" && renderCarePartnerScreen(screen.section)}
          {screen.kind === "comments" && renderCommentsScreen()}
        </div>
      </div>

      {/* ─── Footer ─── */}
      <div
        className="shrink-0 flex items-center justify-between px-16"
        style={{ paddingTop: M.footerY, paddingBottom: M.footerY, borderTop: `1.5px solid ${theme.borderSubtle}` }}
        data-ppf="footer"
      >
        {renderBack()}
        {renderNext()}
      </div>
    </>
  );
}
