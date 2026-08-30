import { useTheme, TYPE_SCALE, WEIGHT } from "./ThemeContext";
import { useLocale } from "./i18n";

/* ═══════════════════════════════════════════════════════════════════════════
 * Shared "Question X of Y" progress design.
 *
 * Extracted from SurveyModal (Share Your Experience) so the Patient
 * Preferences Form shows the identical pattern instead of a second copy that
 * can drift: a thin bar pinned to the top of the card, plus a centered
 * circular badge carrying the step number with the counter beneath it.
 *
 * Both pieces default to the active hospital's primary colour, so they
 * re-brand with the theme like everything else.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Thin fill bar for the top edge of the card. The parent must be
 *  `position: relative` — this pins itself to its top edge. */
export function QuestionProgressBar({
  current,
  total,
}: {
  /** 1-based. */
  current: number;
  total: number;
}) {
  const { theme } = useTheme();
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div
      className="absolute top-0 left-0 right-0 h-2"
      style={{ backgroundColor: theme.primarySubtle, zIndex: 20 }}
    >
      <div
        className="h-full transition-transform duration-500 ease-out"
        style={{ width: `${pct}%`, backgroundColor: theme.primary }}
      />
    </div>
  );
}

/** Circular step badge + "Question X of Y" beneath it. */
export function QuestionProgress({
  current,
  total,
  marginBottom = "40px",
  dense = false,
}: {
  /** 1-based — shown inside the badge and in the counter. */
  current: number;
  total: number;
  /** Gap to the content below. The survey wants 40px; a denser screen can
   *  ask for less without forking the component. */
  marginBottom?: string;
  /** Same design, sized for a card shorter than the 1080 design canvas.
   *  Used by the preferences form, which is not always given full height. */
  dense?: boolean;
}) {
  const { theme } = useTheme();
  const { t, fontFamily } = useLocale();
  const size = dense ? "68px" : "96px";
  return (
    <div className="flex flex-col items-center shrink-0" style={{ marginBottom }}>
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: size, height: size,
          marginBottom: dense ? "10px" : "24px",
          backgroundColor: theme.primarySubtle,
        }}
      >
        <span style={{ fontFamily, fontSize: dense ? "30px" : "40px", fontWeight: WEIGHT.bold, color: theme.primary }}>
          {current}
        </span>
      </div>
      <p style={{
        fontFamily,
        fontSize: dense ? TYPE_SCALE.base : TYPE_SCALE.md,
        fontWeight: WEIGHT.medium, color: theme.textMuted, margin: 0,
      }}>
        {t("survey.questionOf", current, total)}
      </p>
    </div>
  );
}
