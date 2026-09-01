import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW, LEADING, type ThemeConfig } from "./ThemeContext";
import { useLocale, type Locale } from "./i18n";
import {
  ClipboardList, UtensilsCrossed, Users, Clock, HeartHandshake,
  ShieldCheck, MessageSquarePlus, Check, CheckCircle2,
  ChevronLeft, ChevronRight, X,
} from "lucide-react";
import { QuestionProgress, QuestionProgressBar } from "./QuestionProgress";

/* ═══════════════════════════════════════════════════════════════════════════
 * Patient Preferences Form (source: Patient Preference Form V12)
 *
 * Replaces the old welcome slideshow in the onboarding consent step. Filled
 * within 24 hours of admission so patient preferences reach the care plan.
 *
 * LAYOUT — ONE QUESTION PER SCREEN, IN A CONTAINED DIALOG.
 * The form is a centred card on a dimmed backdrop, never a page: capped at
 * 680px wide and 85% of the height it is given, floored at 540px so it does
 * not resize under the patient between questions, and otherwise as tall as
 * the screen it is showing. Opened from the home screen it mounts inside the
 * kiosk's transformed 1920×1080 canvas (DESIGN_W / DESIGN_H in App.tsx), so
 * its share of the panel is the same however useScreenScale() scales it.
 *
 * Vertical budget, measured at 1920×1080:
 *
 *   header row                    ~62px
 *   progress block (shared,dense) ~124px
 *   question body                 ~290px on the ordinary screens
 *   footer (Back / Next)          ~62px
 *
 * The body scrolls rather than clips: at the design size nothing needs to
 * (the tallest screen is 788px against a 918px cap), but the wizard that
 * opens this renders outside the scaled canvas, so on a short panel the cap
 * binds and the content has to stay reachable.
 *
 * Arabic and Urdu run longer than English, so every size below is chosen for
 * the longest of the three, not for English. The tallest screen is the
 * care-partner agreement, then Q5, the doctors' rounds question: a wrapped
 * question over the wheel picker. Measure those, not a one-line English
 * question, before trusting a change to the budget.
 *
 * ANSWERS — two shapes. Most questions are yes/no with an optional note, and
 * the two timing questions (Q5 doctors' rounds, Q10 daily bath) are asked
 * open-ended and answered on the wheel time picker alone. Nothing on either
 * shape is answered in advance: no pill is highlighted and no time is
 * recorded until the patient taps or turns something — no pills, no note, the wheel on screen from
 * the moment the question is. Their answer is a time, so a yes/no over a note
 * would only ask the patient to write in words what the wheel records exactly.
 * The note is not a reveal either: on every yes/no question it is on screen
 * from the moment the question is, in a fixed place under the pills, so
 * tapping Yes or No changes the pills and nothing else. That makes the
 * note-open case the ONLY case to measure — there is no shorter variant of
 * those screens to fall back on.
 * The `choice` and `text` branches are still wired into renderControl but no
 * question reaches either — restoring one is a change to the question list
 * alone. `text` was last used by the favourite-colour question, removed from
 * the form; records written before that still carry its answer.
 *
 * TYPOGRAPHY — one hierarchy, one source. Section chip (TYPE_SCALE.base,
 * semibold) sits under the question (TYPE_SCALE.md, semibold), which sits
 * over the answer pills (TYPE_SCALE.base). Every question heading on every
 * screen reads its style from the single `questionHeading` object below;
 * nothing sets question type per screen, so no screen can drift from the
 * rest.
 *
 * The steps between those three are deliberately one scale notch each. A
 * questionnaire is not a poster: the reader already knows the big centred
 * line is the question, so rank is all the size difference has to carry, and
 * anything wider makes the short questions look shouted and the long ones
 * look like a wall.
 *
 * Question text is TYPE_SCALE.md (22px) at the 1920x1080 design scale, and
 * that is the floor for this screen rather than a starting point: patients
 * here are elderly or unwell, so anything under ~20px is not readable from a
 * bed. If a future translation stops fitting, cut words or let it wrap — do
 * not go under it.
 *
 * COLOUR — no hex literals anywhere. Every content icon is the per-hospital
 * secondary on a theme.accentSubtle chip, so icons re-brand with the active
 * hospital. See iconColor below for why the exact token depends on light/dark
 * mode. (The favourite-colour question was the one exception, holding raw
 * swatches as answer options; it is gone, so the rule has no exceptions.)
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

/** Was stored when the patient tapped "No preference". Nothing writes it any
 *  more — the last question that offered that pill (favourite colour) has been
 *  removed from the form — but older records still carry it, so the value
 *  stays defined and documented rather than becoming a bare string nobody can
 *  trace. */
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
 * A wheel, not a grid of pills. The grid spent two rows on sixteen hour
 * buttons and still only reached the half hour; the wheel reaches any quarter
 * hour of the day in one column, and a scroll is an easier gesture from a bed
 * than aiming at one pill among sixteen.
 *
 * The STORED value is unchanged — a 24-hour "HH:MM" string — so a record
 * written by the old grid loads straight into the wheels. */
const WHEEL_HOURS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const;
const WHEEL_MINUTES = ["00", "15", "30", "45"] as const;

interface WheelState { hour: number; minute: string; pm: boolean }

/** Where the wheels start when the question has no answer yet. */
const WHEEL_REST: WheelState = { hour: 7, minute: "00", pm: false };

/** "HH:MM" (24h) → wheel position. The old grid could only store :00 and :30,
 *  but any minute off the wheel is pulled to the nearest quarter rather than
 *  dropped, so no previously stored answer is silently lost. */
const toWheel = (hhmm: string): WheelState => {
  const h24 = Number(hhmm.slice(0, 2));
  const mins = Number(hhmm.slice(3));
  if (!Number.isFinite(h24) || !Number.isFinite(mins)) return WHEEL_REST;
  const minute = WHEEL_MINUTES.reduce((best, m) =>
    Math.abs(Number(m) - mins) < Math.abs(Number(best) - mins) ? m : best);
  return { hour: ((h24 + 11) % 12) + 1, minute, pm: h24 >= 12 };
};

const fromWheel = (w: WheelState) =>
  `${String((w.hour % 12) + (w.pm ? 12 : 0)).padStart(2, "0")}:${w.minute}`;

/** Three rows: the chosen value plus the one either side of it. Any more and
 *  the wheel outgrows the body budget documented at the top of this file. */
const WHEEL_ROWS = 3;

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
      { id: "handover.presence", kind: "yesno" },
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
      { id: "other.otherPreference", kind: "yesno" },
      { id: "other.virtualRoom", kind: "yesno" },
    ],
  },
] as const;

/** The question whose "yes" inserts the care-partner agreement screen. */
const CARE_PARTNER_TRIGGER = "partner.participate";

/** The last submitted record, or null when the form has never been finished.
 *  Never throws: a blocked or corrupt store reads as "no record". */
export function readPreferenceRecord(): PreferenceFormRecord | null {
  try {
    const raw = localStorage.getItem(PREFS_ANSWERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PreferenceFormRecord;
    return parsed && typeof parsed === "object" && parsed.answers ? parsed : null;
  } catch {
    return null;
  }
}

/** The questions the form gates Next on — every question now, since the one
 *  free-text question is gone. The closing comments screen stays optional by
 *  design (see canAdvance), so a record without it is still a finished form;
 *  anything gated missing means the patient never got through it. */
const REQUIRED_QUESTION_IDS: readonly string[] = SECTIONS.flatMap((s) =>
  s.questions.filter((q) => q.kind !== "text").map((q) => q.id));

/** A record exists as soon as the patient submits, which is not the same as
 *  having answered the form — so completion is measured from the answers
 *  themselves, not from the presence of the record. */
export function isPreferenceFormComplete(record: PreferenceFormRecord | null): boolean {
  if (!record) return false;
  const answers = record.answers ?? {};
  const answered = (id: string) => !!answers[id]?.value;
  if (!REQUIRED_QUESTION_IDS.every(answered)) return false;
  /* The agreement screen is part of the form whenever its trigger is "yes". */
  if (answers[CARE_PARTNER_TRIGGER]?.value === "yes" && !record.carePartner?.accepted) return false;
  return true;
}

type Screen =
  | { kind: "question"; section: SectionDef; q: QuestionDef }
  | { kind: "carePartner"; section: SectionDef }
  | { kind: "comments" };

/** One scroll-snapping column.
 *
 *  It is UNCONTROLLED while the finger is down: the browser's own snap and
 *  momentum decide where it lands, and the parent is only told afterwards.
 *  The parent pushes a position back in one case only — the value changed
 *  somewhere else (a quick-pick chip) — which `reported` tells apart from
 *  this column's own landing echoing back through props. */
function WheelColumn({
  items, index, onIndex, itemH, width, ariaLabel, theme, fontFamily, activeColor,
}: {
  items: readonly string[];
  index: number;
  onIndex: (i: number) => void;
  itemH: number;
  width: number;
  ariaLabel: string;
  theme: ThemeConfig;
  fontFamily: string;
  activeColor: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const settle = useRef<number | undefined>(undefined);
  const reported = useRef(index);
  const [centre, setCentre] = useState(index);

  const scrollToIndex = (i: number, smooth: boolean) =>
    ref.current?.scrollTo({ top: i * itemH, behavior: smooth ? "smooth" : "auto" });

  useEffect(() => {
    scrollToIndex(index, false);
    return () => window.clearTimeout(settle.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (index === reported.current) return;
    reported.current = index;
    setCentre(index);
    scrollToIndex(index, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const nearestIndex = () => {
    const el = ref.current;
    if (!el) return index;
    return Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / itemH)));
  };

  /* Styling follows the scroll live; the answer is written only once the wheel
     has come to rest, so a flick past six values records one, not six. */
  const handleScroll = () => {
    setCentre(nearestIndex());
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const i = nearestIndex();
      if (i === reported.current) return;
      reported.current = i;
      onIndex(i);
    }, 140);
  };

  const pad = ((WHEEL_ROWS - 1) / 2) * itemH;

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      role="listbox"
      aria-label={ariaLabel}
      className="ppf-wheel"
      style={{
        position: "relative", zIndex: 1,
        width, height: itemH * WHEEL_ROWS,
        overflowY: "auto",
        scrollSnapType: "y mandatory",
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        direction: "ltr",
      }}
    >
      <div aria-hidden style={{ height: pad }} />
      {items.map((item, i) => {
        const active = i === centre;
        return (
          <div
            key={item}
            role="option"
            aria-selected={active}
            onClick={() => {
              reported.current = i;
              setCentre(i);
              scrollToIndex(i, true);
              onIndex(i);
            }}
            className="flex items-center justify-center cursor-pointer"
            style={{
              height: itemH,
              scrollSnapAlign: "center",
              fontFamily,
              fontSize: active ? TYPE_SCALE.xl : TYPE_SCALE.md,
              fontWeight: active ? WEIGHT.bold : WEIGHT.medium,
              color: active ? activeColor : theme.textMuted,
              opacity: active ? 1 : 0.5,
              fontVariantNumeric: "tabular-nums",
              transition: "font-size 140ms ease, opacity 140ms ease",
            }}
          >
            {item}
          </div>
        );
      })}
      <div aria-hidden style={{ height: pad }} />
    </div>
  );
}

/** Three wheels — hour, minute, AM/PM — reading and snapping the same way, so
 *  the whole time is set with one gesture rather than a scroll plus a tap on a
 *  differently-shaped control. Every path — a scroll or a tap on a visible row
 *  — writes the same single stored value, so no two columns can disagree with
 *  the record. */
function TimeWheelPicker({
  value, onPickTime, theme, t, fontFamily, iconColor, itemH, gap,
}: {
  /** The stored answer: a 24-hour "HH:MM", or nothing yet. */
  value: string | undefined;
  onPickTime: (hhmm: string) => void;
  theme: ThemeConfig;
  t: (key: string, ...args: (string | number)[]) => string;
  fontFamily: string;
  iconColor: string;
  itemH: number;
  gap: string;
}) {
  /* Anything that is not a time reaching this control — nothing stored yet, or
     a record from when this question still offered a "no preference" answer —
     starts the wheels at their resting value instead. */
  const stored = value && /^\d{2}:\d{2}$/.test(value) ? value : undefined;

  const [draft, setDraft] = useState<WheelState>(() => (stored ? toWheel(stored) : WHEEL_REST));

  const commit = (next: WheelState) => {
    setDraft(next);
    onPickTime(fromWheel(next));
  };

  /* Nothing is committed on mount. The wheel used to write its resting value
     the moment the screen opened, so a patient who never touched it still had
     "7:00 AM" recorded as their preference and Next already enabled — the same
     thing a pre-selected pill does, and it reached the care plan as a choice
     they never made. A scroll or a tap on any visible row commits; until one
     of those happens the question is unanswered and Next stays shut. */

  const period = (pm: boolean) => t(pm ? "ppf.time.pm" : "ppf.time.am");
  const readout = `${draft.hour}:${draft.minute} ${period(draft.pm)}`;

  /* AM before PM, so the column reads in clock order like the two beside it. */
  const periodItems = [period(false), period(true)];

  return (
    <div className="flex flex-col items-center w-full" style={{ gap, maxWidth: "760px" }}>
      <span
        data-ppf-readout=""
        aria-hidden={!stored}
        style={{
          fontFamily, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.semibold,
          color: iconColor, lineHeight: LEADING.snug,
          /* Hidden, not removed: the line reserves its own height so the card
             is the same size before and after the first turn of the wheel. */
          visibility: stored ? "visible" : "hidden",
        }}
      >
        {`${t("ppf.time.selected")}: ${readout}`}
      </span>

      <div className="flex items-center justify-center">
        <div
          className="flex items-center justify-center relative"
          style={{
            padding: "0 18px",
            borderRadius: theme.radiusLg,
            border: `1.5px solid ${theme.borderDefault}`,
            /* The wheel sits on the dimmed surface and the band on the plain
               one, so the selected row is the brightest thing in the control
               even before its border is read. */
            backgroundColor: theme.tileInactiveBg,
            /* Arabic and Urdu write a clock time hour-first like English, so
               the two columns must not mirror with the rest of the page. */
            direction: "ltr",
          }}
        >
          {/* Fixed selection band — the wheels move behind it, it does not move. */}
          <div
            aria-hidden
            style={{
              position: "absolute", left: "8px", right: "8px", top: "50%",
              height: itemH, transform: "translateY(-50%)",
              borderRadius: theme.radiusMd,
              backgroundColor: theme.surface,
              border: `3px solid ${theme.accent}`,
              boxShadow: SHADOW.md,
              pointerEvents: "none", zIndex: 0,
            }}
          />
          <WheelColumn
            items={WHEEL_HOURS}
            index={draft.hour - 1}
            onIndex={(i) => commit({ ...draft, hour: i + 1 })}
            itemH={itemH}
            width={Math.round(itemH * 1.9)}
            ariaLabel={t("ppf.time.hour")}
            theme={theme}
            fontFamily={fontFamily}
            activeColor={iconColor}
          />
          <span
            aria-hidden
            style={{
              position: "relative", zIndex: 1, padding: "0 4px",
              fontFamily, fontSize: TYPE_SCALE.xl, fontWeight: WEIGHT.bold,
              color: iconColor,
            }}
          >
            :
          </span>
          <WheelColumn
            items={WHEEL_MINUTES}
            index={Math.max(0, WHEEL_MINUTES.indexOf(draft.minute as (typeof WHEEL_MINUTES)[number]))}
            onIndex={(i) => commit({ ...draft, minute: WHEEL_MINUTES[i] })}
            itemH={itemH}
            width={Math.round(itemH * 1.9)}
            ariaLabel={t("ppf.time.minute")}
            theme={theme}
            fontFamily={fontFamily}
            activeColor={iconColor}
          />
          <div aria-hidden style={{ width: "10px" }} />
          <WheelColumn
            items={periodItems}
            index={draft.pm ? 1 : 0}
            onIndex={(i) => commit({ ...draft, pm: i === 1 })}
            itemH={itemH}
            width={Math.round(itemH * 1.9)}
            ariaLabel={t("ppf.time.period")}
            theme={theme}
            fontFamily={fontFamily}
            activeColor={iconColor}
          />
        </div>
      </div>
    </div>
  );
}

export function PatientPreferenceForm({
  onClose,
  onSubmitted,
  variant = "page",
}: {
  onClose: () => void;
  /** Fired after a successful save — the consent checkbox ticks itself. */
  onSubmitted?: (record: PreferenceFormRecord) => void;
  /** Legacy, accepted and ignored. The form is one shape now — a contained
   *  dialog over whatever opened it. "page" used to mean a full-canvas
   *  presentation under the tall brand header; that read as a second screen
   *  rather than a dialog, so it is gone. */
  variant?: "page" | "modal";
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

  /* The form always opens unanswered — no pill pre-selected, no note
     pre-filled, on every screen. It used to load the last submitted record
     back so a second visit read as a review, but that put a highlighted Yes
     under a patient who had not chosen anything yet on this visit, which is
     the one thing an answer control must never do. The record is still
     written on submit and still readable (readPreferenceRecord), so the
     wizard's "completed" check and anything downstream are unaffected. */
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
        qGap: "12px", stackGap: "6px", notesH: "84px",
        footerY: "12px", reserved: "46px", wheelItem: 46, pillY: "10px" }
    : { progressTop: "24px", progressGap: "14px", chip: 48, chipIcon: 24, chipGap: "14px",
        qGap: "20px", stackGap: "12px", notesH: "92px",
        footerY: "20px", reserved: "56px", wheelItem: 56, pillY: "14px" };

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

  /** Free text is the only place a raw language string is stored, so tag it
   *  with the locale it was written in. */
  const setTagged = (id: string, field: "note" | "text", raw: string) =>
    patch(id, { [field]: raw.trim() ? { text: raw, lang: locale } : undefined });

  /* ── Can this screen be left? ─────────────────────────────────────────
   * Next is gated on a real answer so nothing is recorded as "skipped" that
   * the patient never saw. That only works if every screen HAS an answer the
   * patient can give: a yes/no question has its two pills, and a time
   * question is answered by the wheels themselves, which always read as a
   * time. Nothing is pre-selected, so the gate is what the patient chose on
   * this visit and nothing else. */
  const canAdvance = (() => {
    if (screen.kind === "comments") return true;          // closing screen, optional by design
    if (screen.kind === "carePartner") return partner.accepted;
    /* Free text is not gated — no question uses it now, but a restored one
       would have no answer to gate on. The optional note is never gated
       either: only the yes/no is. */
    if (screen.q.kind === "text") return true;
    return !!answers[screen.q.id]?.value;
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
    /* Rounder than the cards around it on purpose: at this size the field is
       the only rectangle on the screen, and radiusLg still read as a box. */
    borderRadius: theme.radiusXl,
    border: `1.5px solid ${theme.borderDefault}`,
    backgroundColor: theme.surface,
    fontFamily,
    fontSize: TYPE_SCALE.base,
    lineHeight: LEADING.normal,
    color: theme.textHeading,
    /* No grip while the text still fits — an idle drag handle on an optional
       note reads as something the patient is expected to deal with. The
       handler below turns it on for the one field that outgrows itself; see
       .ppf-field[data-grow] in the shell's stylesheet. */
    resize: "none" as const,
    overflowY: "auto" as const,
    outline: "none",
    direction: isRTL ? ("rtl" as const) : ("ltr" as const),
    textAlign: isRTL ? ("right" as const) : ("left" as const),
  });

  /** Shows the resize grip only once the text no longer fits. Called from
   *  every field's onChange, so the rule is the same on all of them. */
  const markGrown = (el: HTMLTextAreaElement) => {
    if (el.scrollHeight > el.clientHeight + 1) el.dataset.grow = "true";
    else delete el.dataset.grow;
  };

  /** THE question typography, for every screen in the form — all fourteen
   *  questions, the care-partner agreement and the closing comments screen.
   *  It lives here, not at each call site, so the questionnaire can only ever
   *  have one question type: change this object and every screen moves with
   *  it.
   *
   *  The four values are one set, and they are chosen for the *longest*
   *  question rather than the shortest — anything sized to look right on
   *  "What time do you usually wake up?" turns Q6 into a wall of text.
   *
   *  md, not lg: the question only has to out-rank the section chip above it
   *  (base) and the answer pills below it (base). One step in each direction
   *  reads as a hierarchy; past that the question stops being a question and
   *  starts being a headline.
   *
   *  Semibold, not bold: at 600 the question is plainly the primary text on
   *  the card without the shouting 700 adds at this size.
   *
   *  Normal leading, not snug: 1.3 is a display value, and it packs a
   *  four-line question into a dense block. 1.5 gives every wrapped line the
   *  air a one-line question already has, which is what makes a long screen
   *  and a short one feel like the same form.
   *
   *  760px, not 1180px: it caps the measure at roughly 60 characters instead
   *  of ~95, so a long question wraps to more, shorter lines rather than
   *  spanning the card. It is also the width the note fields and free-text
   *  boxes below already use, so question and answer share one column. */
  const questionHeading = {
    fontFamily,
    fontSize: TYPE_SCALE.md,
    fontWeight: WEIGHT.semibold,
    color: theme.textHeading,
    lineHeight: LEADING.normal,
    textAlign: "center" as const,
    maxWidth: "760px",
  };

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
        /* One step under the question, so the answers read as answers to it
           rather than as a second heading. The pill's geometry is unchanged —
           its padding, radius and border above are what size it. */
        fontSize: TYPE_SCALE.base,
        fontWeight: selected ? WEIGHT.bold : WEIGHT.medium,
        color: selected ? iconColor : theme.textBody,
        outline: "none",
      }}
    >
      {label}
    </button>
  );

  /** Free-text questions share one control; only the prompt differs. Falls
   *  back to the generic placeholder for questions that need no special one. */
  const placeholderFor = (id: string) => {
    const key = `ppf.placeholder.${id}`;
    const localized = t(key);
    return localized === key ? t("ppf.freeText.placeholder") : localized;
  };

  /** The optional note every yes/no question carries.
   *
   *  It sits in one fixed place — directly under the pills, same width, same
   *  height — and it is there from the moment the screen opens, before either
   *  pill is tapped and whichever one is. Nothing below it moves when the
   *  answer changes, so a patient who taps Yes then No sees the pills swap
   *  highlight and nothing else. Nothing reveals it and nothing hides it: a
   *  box that appears and vanishes as the patient taps moves the ground under
   *  them and reads as a demand to justify the answer they just gave, where a
   *  box that is simply always there reads as an invitation.
   *
   *  A field that is always present has to say what it is, so it carries a
   *  visible "Notes · Optional" label.
   *
   *  Optional in the strict sense: it is not part of canAdvance, so leaving it
   *  empty can never hold the patient on the screen. Each question gets its own
   *  prompt, falling back to the generic one, so the box always says what
   *  belongs in it. */
  const renderNote = (q: QuestionDef) => {
    const key = `ppf.note.${q.id}`;
    const prompt = t(key);
    const fieldId = `ppf-note-${q.id}`;
    return (
      <div style={{ width: "100%", maxWidth: "760px" }}>
        <label
          htmlFor={fieldId}
          style={{
            display: "block",
            marginBottom: "6px",
            fontFamily,
            fontSize: TYPE_SCALE.sm,
            fontWeight: WEIGHT.semibold,
            color: theme.textMuted,
            letterSpacing: "0.02em",
            textAlign: isRTL ? "right" : "left",
          }}
        >
          {t("ppf.notes.optionalLabel")}
        </label>
        <textarea
          id={fieldId}
          rows={2}
          value={answers[q.id]?.note?.text ?? ""}
          onChange={(e) => { setTagged(q.id, "note", e.target.value); markGrown(e.currentTarget); }}
          placeholder={prompt === key ? t("ppf.notes.placeholder") : prompt}
          aria-label={t("ppf.notes.label")}
          className="ppf-field"
          style={fieldStyle(M.notesH)}
        />
      </div>
    );
  };

  const renderControl = (q: QuestionDef) => {
    switch (q.kind) {
      case "yesno":
        return (
          <div className="flex flex-col items-center w-full" style={{ gap: M.stackGap }}>
            <div className="flex flex-wrap justify-center gap-4">
              {renderPill("yes", answers[q.id]?.value === "yes", () => setValue(q.id, "yes"), t("ppf.yes"))}
              {renderPill("no", answers[q.id]?.value === "no", () => setValue(q.id, "no"), t("ppf.no"))}
            </div>
            {renderNote(q)}
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
          <TimeWheelPicker
            value={answers[q.id]?.value}
            onPickTime={(hhmm) => patch(q.id, { value: hhmm })}
            theme={theme}
            t={t}
            fontFamily={fontFamily}
            iconColor={iconColor}
            itemH={M.wheelItem}
            gap={M.stackGap}
          />
        );

      case "text":
        /* The field and nothing else — no pill, no alternate option under it.
           Typing is the whole answer, and typing nothing is a valid outcome
           (see canAdvance), so there is nothing for a second control to say. */
        return (
          <div className="flex flex-col items-center w-full" style={{ gap: M.stackGap }}>
            <div style={{ width: "100%", maxWidth: "760px" }}>
              <textarea
                rows={2}
                value={answers[q.id]?.text?.text ?? ""}
                onChange={(e) => { setTagged(q.id, "text", e.target.value); markGrown(e.currentTarget); }}
                placeholder={placeholderFor(q.id)}
                className="ppf-field"
                style={fieldStyle(M.notesH)}
              />
            </div>
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
      <h2 style={{ ...questionHeading, margin: `0 0 ${M.qGap}` }}>
        {t(`ppf.q.${q.id}`, appName)}
      </h2>
      {renderControl(q)}
    </>
  );

  /** Care Partner agreement — its own screen, reached immediately after the
   *  patient answers "yes", so it is completed in the same flow. */
  const renderCarePartnerScreen = (section: SectionDef) => (
    <>
      {renderSectionBadge(section)}
      <h2 style={{ ...questionHeading, margin: "0 0 12px" }}>
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
      <h2 style={{ ...questionHeading, margin: "0 0 8px" }}>
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
          onChange={(e) => { setComments(e.target.value); markGrown(e.currentTarget); }}
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
   * canAdvance — so waiting can never become being stuck. Back is present on
   * every screen but the first, so an answer can always be revised. */

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

  /* The chrome: one white card centred on a dimmed backdrop, under a compact
   * header row (icon, title, subtitle, square close). It carries the same
   * visual weight as the app's other dialogs — the menu reader in
   * FoodOrdering, the welcome tour card — rather than reading as a second
   * screen laid over the first.
   *
   * The card is sized by its content and capped: never wider than
   * MODAL_MAX_W, never taller than MODAL_MAX_H, never shorter than
   * MODAL_MIN_H, and otherwise no taller than the screen it is showing needs —
   * so a short question makes a short dialog instead of padding itself out to
   * fill a fixed frame. The screens that outgrow the cap scroll inside the
   * card rather than clipping; see the layout note at the top of this file. */

  /* Percentages, not vh: opened from the home screen the form mounts inside
     App.tsx's transformed 1920×1080 canvas, so the fixed overlay it sits on is
     that canvas and not the window — vh would measure the wrong box. A percent
     of the overlay is the dialog's share of the screen either way. */
  const MODAL_MAX_W = "680px";
  const MODAL_MAX_H = "85%";
  /* A floor as well as a cap. Twelve of the sixteen screens land within 40px
     of this, so holding them all at one height stops the dialog resizing under
     the patient between questions; the four that need more still grow. */
  const MODAL_MIN_H = "540px";

  /* Body, header and footer gutters — sized for a 680px card. */
  const padX = "28px";

  const renderShell = (body: React.ReactNode) => {
    const fieldCss = (
      <style>{`
        .ppf-wheel::-webkit-scrollbar { display: none; }
        .ppf-wheel {
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 24%, #000 76%, transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0%, #000 24%, #000 76%, transparent 100%);
        }
        .ppf-scroll::-webkit-scrollbar { width: 6px; }
        .ppf-scroll::-webkit-scrollbar-thumb { background: ${theme.borderDefault}; border-radius: 3px; }
        .ppf-field:focus { border-color: ${theme.accent} !important; }
        /* Beats the inline resize:none the field carries by default. */
        .ppf-field[data-grow] { resize: vertical !important; }
        .ppf-field::placeholder { color: ${theme.textDisabled}; }
      `}</style>
    );

    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{
          zIndex: 8600, // above the onboarding wizard (z-8000) that opens it
          padding: "24px", // the backdrop stays visible on all four sides
          backgroundColor: theme.overlay,
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          direction: isRTL ? "rtl" : "ltr",
          animation: "ppfModalIn 0.2s ease-out",
        }}
      >
        <style>{`
          @keyframes ppfModalIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes ppfCardIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: none; } }
        `}</style>
        {fieldCss}

        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("ppf.title")}
          data-ppf="modal-card"
          className="flex flex-col overflow-hidden"
          style={{
            width: "100%",
            maxWidth: MODAL_MAX_W,
            /* Content-driven, so there is no empty space to fill: the card is
               as tall as the screen it shows, up to the cap. */
            height: "auto",
            minHeight: MODAL_MIN_H,
            maxHeight: MODAL_MAX_H,
            backgroundColor: theme.surface,
            borderRadius: theme.radiusXl,
            boxShadow: SHADOW.xl,
            border: theme.cardBorder,
            animation: "ppfCardIn 0.2s ease-out",
          }}
        >
          {/* Header — what the form is, whose it is, and the way out. One
              row on the card itself: at dialog size a full-bleed brand bar
              would take the top eighth of the card to repeat what the
              patient just tapped to open. */}
          <div
            className="shrink-0 flex items-center gap-3"
            style={{ padding: `12px ${padX}`, borderBottom: `1px solid ${theme.borderSubtle}` }}
            data-ppf="modal-header"
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{ width: "36px", height: "36px", borderRadius: theme.radiusSm, backgroundColor: theme.accentSubtle }}
            >
              <ClipboardList size={18} style={{ color: iconColor }} />
            </div>
            <div className="flex-1 min-w-0" style={{ textAlign: isRTL ? "right" : "left" }}>
              <h2 style={{
                fontFamily, fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.bold,
                color: theme.textHeading, margin: 0, lineHeight: LEADING.tight,
              }}>
                {t("ppf.title")}
              </h2>
              <p style={{
                fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.medium,
                color: theme.textMuted, margin: "1px 0 0", lineHeight: LEADING.none,
              }}>
                {theme.hospitalName}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label={t("general.close")}
              data-ppf="close"
              className="shrink-0 flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
              style={{
                width: "34px", height: "34px", borderRadius: theme.radiusSm,
                backgroundColor: theme.tileInactiveBg, border: "none", outline: "none",
              }}
            >
              <X size={18} style={{ color: theme.textMuted }} />
            </button>
          </div>

          {/* The form itself. This is the region the layout budget is
              measured against, so it — not the whole card — is what cardRef
              watches. "flex: 1 1 auto", not flex-1: the card's height is
              content-driven, and a zero flex-basis in an auto-height column
              would collapse this to nothing. */}
          <div
            ref={cardRef}
            className="min-h-0 flex flex-col overflow-hidden relative"
            style={{ flex: "1 1 auto" }}
          >
            {body}
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════ thank-you screen ═══════════════════ */

  if (submitted) {
    return renderShell(
      <div
        className="flex-1 flex flex-col items-center justify-center text-center"
        style={{ padding: `32px ${padX}` }}
      >
        <div className="flex items-center justify-center"
          style={{
            width: 56, height: 56,
            marginBottom: "16px",
            borderRadius: theme.radiusFull, backgroundColor: theme.accentSubtle,
          }}>
          <CheckCircle2 size={28} style={{ color: iconColor }} />
        </div>
        <h2 style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, color: theme.textHeading, marginBottom: "10px" }}>
          {t("ppf.done.title")}
        </h2>
        <p style={{ fontFamily, fontSize: TYPE_SCALE.base, color: theme.textMuted, maxWidth: "620px", lineHeight: LEADING.relaxed, marginBottom: "20px" }}>
          {t("ppf.done.body")}
        </p>
        <button
          onClick={onClose}
          className="transition-transform duration-200 active:scale-[0.96] cursor-pointer"
          style={{
            padding: "12px 36px", borderRadius: theme.radiusMd,
            backgroundColor: theme.primary, border: "none", boxShadow: SHADOW.md,
          }}
        >
          <span style={{ fontFamily, fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.bold, color: theme.textInverse }}>
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

      {/* ─── Question body ───────────────────────────────────────────────
          The card is only as tall as this content, so there is nothing to
          centre in; it scrolls only on the screens that hit the height cap. */}
      <div
        key={safeIndex}
        data-ppf="body"
        className="ppf-scroll min-h-0 flex flex-col overflow-y-auto"
        style={{
          flex: "1 1 auto",
          paddingLeft: padX, paddingRight: padX,
          paddingBottom: "4px",
        }}
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
        className="shrink-0 flex items-center justify-between"
        style={{
          paddingLeft: padX, paddingRight: padX,
          paddingTop: M.footerY, paddingBottom: M.footerY,
          borderTop: `1.5px solid ${theme.borderSubtle}`,
        }}
        data-ppf="footer"
      >
        {renderBack()}
        {renderNext()}
      </div>
    </>
  );
}
