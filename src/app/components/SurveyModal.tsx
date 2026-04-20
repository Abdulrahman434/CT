import { useTheme, TYPE_SCALE, WEIGHT, SHADOW, LEADING, TEXT_STYLE } from "./ThemeContext";
import { useLocale } from "./i18n";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, FileText, AlertTriangle, Heart, Mic, CheckCircle2, Play, Pause, Square, RotateCcw, Trash2 } from "lucide-react";
import thankYouImage from "../../assets/23db5e568918c9a319b272caa7a9e865d4fbd418.png";

/* ═══════════════════════════════════════════════════════════════
 * REAL VOICE RECORDER (uses MediaRecorder API)
 * ═══════════════════════════════════════════════════════════════ */
function VoiceRecorder({ color, label, onRecordingChange }: {
  color: string;
  label: string;
  onRecordingChange?: (hasRecording: boolean) => void;
}) {
  const { fontFamily } = useLocale();
  const [state, setState] = useState<"idle" | "recording" | "recorded" | "playing">("idle");
  const [duration, setDuration] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioUrlRef = useRef<string | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      if (audioElRef.current) { audioElRef.current.pause(); audioElRef.current = null; }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setDuration(0);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = URL.createObjectURL(blob);
        setState("recorded");
        onRecordingChange?.(true);
      };

      mediaRecorder.start();
      setState("recording");

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      console.warn("Microphone access denied or unavailable");
    }
  }, [onRecordingChange]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    mediaRecorderRef.current?.stop();
  }, []);

  const playRecording = useCallback(() => {
    if (!audioUrlRef.current) return;
    const audio = new Audio(audioUrlRef.current);
    audioElRef.current = audio;
    setPlaybackProgress(0);
    setState("playing");

    audio.play();
    playbackTimerRef.current = setInterval(() => {
      if (audio.duration) {
        setPlaybackProgress((audio.currentTime / audio.duration) * 100);
      }
    }, 100);

    audio.onended = () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      setPlaybackProgress(0);
      setState("recorded");
    };
  }, []);

  const pausePlayback = useCallback(() => {
    audioElRef.current?.pause();
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    setState("recorded");
  }, []);

  const deleteRecording = useCallback(() => {
    if (audioElRef.current) { audioElRef.current.pause(); audioElRef.current = null; }
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null; }
    chunksRef.current = [];
    setDuration(0);
    setPlaybackProgress(0);
    setState("idle");
    onRecordingChange?.(false);
  }, [onRecordingChange]);

  /* ── Idle: show "Record voice" button ── */
  if (state === "idle") {
    return (
      <button
        onClick={startRecording}
        className="flex items-center gap-2 mt-4 cursor-pointer transition-transform duration-200 active:scale-[0.98]"
        style={{ padding: "10px 20px", borderRadius: "100px", border: `1.5px solid ${color}`, backgroundColor: `${color}08`, width: "fit-content" }}
      >
        <Mic size={18} style={{ color }} />
        <span style={{ fontFamily, fontSize: "14px", fontWeight: 700, color }}>{label}</span>
      </button>
    );
  }

  /* ── Recording in progress ── */
  if (state === "recording") {
    return (
      <div className="flex items-center gap-3 mt-4" style={{ padding: "8px 20px", width: "fit-content", borderRadius: "100px", border: "1.5px solid #D10044", backgroundColor: "rgba(209,0,68,0.06)" }}>
        <button
          onClick={stopRecording}
          className="cursor-pointer bg-white rounded flex items-center justify-center shadow-sm"
          style={{ width: 28, height: 28, border: "none" }}
        >
          <Square size={12} style={{ color: "#D10044" }} fill="#D10044" />
        </button>
        <div className="animate-pulse" style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#D10044" }} />
        <span style={{ fontFamily, fontSize: "13px", fontWeight: 700, color: "#D10044", minWidth: "36px" }}>
          {formatTime(duration)}
        </span>
      </div>
    );
  }

  /* ── Recorded / Playing ── */
  return (
    <div className="flex items-center gap-3 mt-4" style={{ padding: "8px 20px", width: "fit-content", borderRadius: "100px", border: `1.5px solid ${color}`, backgroundColor: `${color}08` }}>
      {/* Play / Pause */}
      <button
        onClick={state === "playing" ? pausePlayback : playRecording}
        className="cursor-pointer bg-white rounded-full flex items-center justify-center shadow-sm"
        style={{ width: 32, height: 32, border: "none" }}
      >
        {state === "playing"
          ? <Pause size={14} style={{ color }} fill={color} />
          : <Play size={14} style={{ color, marginLeft: 2 }} fill={color} />
        }
      </button>

      {/* Waveform / progress */}
      <div style={{ position: "relative", width: "80px", height: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2px", height: "100%" }}>
          {[30, 60, 45, 80, 55, 90, 40, 75, 35, 65, 50, 85].map((h, i) => (
            <div
              key={i}
              style={{
                width: "3px",
                height: `${h}%`,
                backgroundColor: color,
                borderRadius: "2px",
                opacity: state === "playing" && (i / 12) * 100 <= playbackProgress ? 1 : 0.35,
                transition: "opacity 0.15s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Duration */}
      <span style={{ fontFamily, fontSize: "12px", fontWeight: 700, color, minWidth: "32px" }}>
        {formatTime(duration)}
      </span>

      {/* Delete / Redo */}
      <button
        onClick={deleteRecording}
        className="cursor-pointer flex items-center justify-center transition-opacity hover:opacity-100"
        style={{ width: 28, height: 28, border: "none", background: "none", opacity: 0.6 }}
      >
        <Trash2 size={16} style={{ color }} />
      </button>
    </div>
  );
}

interface SurveyModalProps {
  onClose: () => void;
}

/* ═══════════════════════════════════════════════════════════════
 * SURVEY QUESTIONS (kept from original)
 * ═══════════════════════════════════════════════════════════════ */
const questions = [
  {
    id: 1,
    questionKey: "survey.q1",
    optionKeys: ["survey.opt.extremelyDissatisfied", "survey.opt.dissatisfied", "survey.opt.neutral", "survey.opt.satisfied", "survey.opt.extremelySatisfied"],
    type: "satisfaction" as const,
  },
  {
    id: 2,
    questionKey: "survey.q2",
    optionKeys: ["survey.opt.veryPoor", "survey.opt.poor", "survey.opt.average", "survey.opt.good", "survey.opt.excellent"],
    type: "rating" as const,
  },
  {
    id: 3,
    questionKey: "survey.q3",
    optionKeys: ["survey.opt.stronglyDisagree", "survey.opt.disagree", "survey.opt.neutral", "survey.opt.agree", "survey.opt.stronglyAgree"],
    type: "agreement" as const,
  },
  {
    id: 4,
    questionKey: "survey.q4",
    optionKeys: ["survey.opt.veryPoor", "survey.opt.poor", "survey.opt.average", "survey.opt.good", "survey.opt.excellent"],
    type: "rating" as const,
  },
  {
    id: 5,
    questionKey: "survey.q5",
    optionKeys: ["survey.opt.stronglyDisagree", "survey.opt.disagree", "survey.opt.neutral", "survey.opt.agree", "survey.opt.stronglyAgree"],
    type: "agreement" as const,
  },
  {
    id: 6,
    questionKey: "survey.q6",
    optionKeys: ["survey.opt.extremelyDissatisfied", "survey.opt.dissatisfied", "survey.opt.neutral", "survey.opt.satisfied", "survey.opt.extremelySatisfied"],
    type: "satisfaction" as const,
  },
  {
    id: 7,
    questionKey: "survey.q7",
    optionKeys: ["😞", "😕", "😐", "🙂", "😊"],
    type: "emoji" as const,
  },
];

/* ═══════════════════════════════════════════════════════════════
 * CONCERN & APPRECIATION DATA
 * ═══════════════════════════════════════════════════════════════ */
const concernAreas = [
  "concern.area.nursing",
  "concern.area.food",
  "concern.area.room",
  "concern.area.medical",
  "concern.area.wait",
  "concern.area.other",
];

const appreciationTargets = [
  "appreciation.who.specific",
  "appreciation.who.nursing",
  "appreciation.who.doctor",
  "appreciation.who.hospital",
];

/* ═══════════════════════════════════════════════════════════════
 * COLOR CONSTANTS
 * ═══════════════════════════════════════════════════════════════ */
const CONCERN_COLOR = "#C4571A";
const CONCERN_SUBTLE = "rgba(196,87,26,0.08)";
const CONCERN_BORDER = "rgba(196,87,26,0.18)";

const APPRECIATION_COLOR = "#1B7F5A";
const APPRECIATION_SUBTLE = "rgba(27,127,90,0.08)";
const APPRECIATION_BORDER = "rgba(27,127,90,0.18)";

type FeedbackPath = "hub" | "survey" | "concern" | "appreciation";

export function SurveyModal({ onClose }: SurveyModalProps) {
  const { theme } = useTheme();
  const { t, isRTL, fontFamily } = useLocale();

  const BRAND = theme.primary;
  const BRAND_DARK = theme.primaryDark;

  // Hub state
  const [path, setPath] = useState<FeedbackPath>("hub");

  // Survey state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [feedbackText, setFeedbackText] = useState("");

  // Concern state
  const [concernArea, setConcernArea] = useState<string | null>(null);
  const [concernText, setConcernText] = useState("");
  const [concernSubmitted, setConcernSubmitted] = useState(false);
  const [concernHasRecording, setConcernHasRecording] = useState(false);

  // Appreciation state
  const [appreciationTarget, setAppreciationTarget] = useState<string | null>(null);
  const [appreciationText, setAppreciationText] = useState("");
  const [appreciationSubmitted, setAppreciationSubmitted] = useState(false);
  const [appreciationHasRecording, setAppreciationHasRecording] = useState(false);

  /* ─── Survey Navigation ─── */
  const totalSlides = 9; // 7 questions + feedback + thank you (no intro, survey starts directly)

  const handleNext = () => {
    if (currentSlide < totalSlides) setCurrentSlide(currentSlide + 1);
  };

  const handlePrevious = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const handleAnswer = (questionId: number, answer: string | number) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSurveySubmit = () => {
    console.log("Survey submitted:", { answers, feedbackText });
    handleNext();
  };

  /* ─── Concern Submit ─── */
  const handleConcernSubmit = () => {
    console.log("Concern submitted:", { area: concernArea, text: concernText, hasRecording: concernHasRecording });
    setConcernSubmitted(true);
  };

  /* ─── Appreciation Submit ─── */
  const handleAppreciationSubmit = () => {
    console.log("Appreciation submitted:", { target: appreciationTarget, text: appreciationText, hasRecording: appreciationHasRecording });
    setAppreciationSubmitted(true);
  };

  const resetAppreciation = () => {
    setAppreciationTarget(null);
    setAppreciationText("");
    setAppreciationSubmitted(false);
  };

  /* ═══════════════════════════════════════════════════════════════
   * RENDER: HUB SCREEN (3 cards side-by-side)
   * ═══════════════════════════════════════════════════════════════ */
  const renderHubScreen = () => (
    <div className="flex flex-col items-center justify-center h-full px-16 text-center">
      <h2
        style={{
          fontFamily,
          fontSize: TYPE_SCALE["2xl"],
          fontWeight: WEIGHT.bold,
          color: theme.textHeading,
          marginBottom: "48px",
          lineHeight: LEADING.tight,
        }}
      >
        {t("survey.intro")}
      </h2>

      <div className="flex items-center justify-center gap-6 w-full max-w-[1000px]">
        {/* Quick Survey Card */}
        <button
          onClick={() => setPath("survey")}
          className="flex-1 flex flex-col items-center cursor-pointer transition-all duration-200 active:scale-[0.98]"
          style={{
            padding: "48px 24px",
            borderRadius: "24px",
            backgroundColor: theme.surface,
            border: `1.5px solid ${theme.borderDefault}`,
            boxShadow: SHADOW.sm,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = BRAND;
            e.currentTarget.style.boxShadow = SHADOW.md;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.borderDefault;
            e.currentTarget.style.boxShadow = SHADOW.sm;
          }}
        >
          <div
            className="flex items-center justify-center mb-6"
            style={{ width: 80, height: 80, borderRadius: "50%", backgroundColor: theme.primarySubtle }}
          >
            <FileText size={40} style={{ color: BRAND }} />
          </div>
          <span style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, color: theme.textHeading, marginBottom: "8px" }}>
            {t("feedback.quickSurvey")}
          </span>
          <span style={{ fontFamily, fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.medium, color: theme.textMuted }}>
            {isRTL ? "عن إقامتك · دقيقتان" : "About your stay · 2 min"}
          </span>
        </button>

        {/* Raise a Concern Card */}
        <button
          onClick={() => setPath("concern")}
          className="flex-1 flex flex-col items-center cursor-pointer transition-all duration-200 active:scale-[0.98]"
          style={{
            padding: "48px 24px",
            borderRadius: "24px",
            backgroundColor: theme.surface,
            border: `1.5px solid ${theme.borderDefault}`,
            boxShadow: SHADOW.sm,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = CONCERN_COLOR;
            e.currentTarget.style.boxShadow = SHADOW.md;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.borderDefault;
            e.currentTarget.style.boxShadow = SHADOW.sm;
          }}
        >
          <div
            className="flex items-center justify-center mb-6"
            style={{ width: 80, height: 80, borderRadius: "50%", backgroundColor: CONCERN_SUBTLE }}
          >
            <AlertTriangle size={40} style={{ color: CONCERN_COLOR }} />
          </div>
          <span style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, color: theme.textHeading, marginBottom: "8px" }}>
            {t("feedback.raiseConcern")}
          </span>
          <span style={{ fontFamily, fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.medium, color: theme.textMuted }}>
            {isRTL ? "بلغ عن مشكلة · دقيقة واحدة" : "Report an issue · 1 min"}
          </span>
        </button>

        {/* Send Appreciation Card */}
        <button
          onClick={() => setPath("appreciation")}
          className="flex-1 flex flex-col items-center cursor-pointer transition-all duration-200 active:scale-[0.98]"
          style={{
            padding: "48px 24px",
            borderRadius: "24px",
            backgroundColor: theme.surface,
            border: `1.5px solid ${theme.borderDefault}`,
            boxShadow: SHADOW.sm,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = APPRECIATION_COLOR;
            e.currentTarget.style.boxShadow = SHADOW.md;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.borderDefault;
            e.currentTarget.style.boxShadow = SHADOW.sm;
          }}
        >
          <div
            className="flex items-center justify-center mb-6"
            style={{ width: 80, height: 80, borderRadius: "50%", backgroundColor: APPRECIATION_SUBTLE }}
          >
            <Heart size={40} style={{ color: APPRECIATION_COLOR }} />
          </div>
          <span style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, color: theme.textHeading, marginBottom: "8px" }}>
            {t("feedback.sendAppreciation")}
          </span>
          <span style={{ fontFamily, fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.medium, color: theme.textMuted }}>
            {isRTL ? "اشكر فريقنا · ٣٠ ثانية" : "Thank our team · 30 sec"}
          </span>
        </button>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
   * RENDER: SURVEY PATH (questions)
   * ═══════════════════════════════════════════════════════════════ */
  const renderSurveyProgressBar = () => {
    const progress = ((currentSlide + 1) / totalSlides) * 100;
    return (
      <div
        className="absolute top-0 left-0 right-0 h-2"
        style={{ backgroundColor: theme.primarySubtle, zIndex: 20 }}
      >
        <div
          className="h-full transition-transform duration-500 ease-out"
          style={{ width: `${progress}%`, backgroundColor: BRAND }}
        />
      </div>
    );
  };

  const renderQuestionSlide = (questionIndex: number) => {
    const question = questions[questionIndex];
    const currentAnswer = answers[question.id];

    return (
      <div className="flex flex-col items-center justify-center h-full px-16">
        {/* Question number badge */}
        <div
          className="flex items-center justify-center rounded-full mb-6"
          style={{ width: "96px", height: "96px", backgroundColor: theme.primarySubtle }}
        >
          <span style={{ fontFamily, fontSize: "40px", fontWeight: WEIGHT.bold, color: BRAND }}>
            {question.id}
          </span>
        </div>

        {/* Question counter */}
        <p style={{ fontFamily, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.medium, color: theme.textMuted, marginBottom: "40px" }}>
          {t("survey.questionOf", question.id, questions.length)}
        </p>

        {/* Question text */}
        <h3 style={{
          fontFamily,
          fontSize: TYPE_SCALE["2xl"],
          fontWeight: WEIGHT.bold,
          color: theme.textHeading,
          marginBottom: "64px",
          textAlign: "center",
          maxWidth: "1000px",
          lineHeight: LEADING.compact,
        }}>
          {t(question.questionKey)}
        </h3>

        {/* Options */}
        <div className="flex flex-wrap items-center justify-center gap-5 max-w-[1100px]">
          {question.type === "emoji" ? (
            question.optionKeys.map((option, idx) => {
              const isSelected = currentAnswer === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(question.id, idx)}
                  className="transition-transform duration-200"
                  style={{
                    width: "140px", height: "140px",
                    borderRadius: theme.radiusXl,
                    border: isSelected ? `3px solid ${BRAND}` : `2px solid ${theme.borderDefault}`,
                    backgroundColor: isSelected ? theme.primarySubtle : theme.surface,
                    fontSize: "64px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    transform: isSelected ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  {option}
                </button>
              );
            })
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-center gap-5 w-full">
                {question.optionKeys.slice(0, 4).map((option, idx) => {
                  const isSelected = currentAnswer === option;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(question.id, option)}
                      className="transition-transform duration-200"
                      style={{
                        minWidth: "220px", padding: "20px 32px",
                        borderRadius: theme.radiusXl,
                        border: isSelected ? `3px solid ${BRAND}` : `2px solid ${theme.borderDefault}`,
                        backgroundColor: isSelected ? theme.primarySubtle : theme.surface,
                        fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold,
                        color: isSelected ? BRAND : theme.textBody,
                        cursor: "pointer",
                        transform: isSelected ? "scale(1.03)" : "scale(1)",
                      }}
                    >
                      {t(option)}
                    </button>
                  );
                })}
              </div>
              {question.optionKeys.length > 4 && (
                <div className="flex justify-center w-full mt-2">
                  {question.optionKeys.slice(4).map((option, idx) => {
                    const isSelected = currentAnswer === option;
                    return (
                      <button
                        key={idx + 4}
                        onClick={() => handleAnswer(question.id, option)}
                        className="transition-transform duration-200"
                        style={{
                          minWidth: "220px", padding: "20px 32px",
                          borderRadius: theme.radiusXl,
                          border: isSelected ? `3px solid ${BRAND}` : `2px solid ${theme.borderDefault}`,
                          backgroundColor: isSelected ? theme.primarySubtle : theme.surface,
                          fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold,
                          color: isSelected ? BRAND : theme.textBody,
                          cursor: "pointer",
                          transform: isSelected ? "scale(1.03)" : "scale(1)",
                        }}
                      >
                        {t(option)}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderSurveyFeedbackSlide = () => (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <h3 style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, color: theme.textHeading, marginBottom: "16px", textAlign: "center" }}>
        {t("survey.additionalFeedback")}
      </h3>
      <p style={{ fontFamily, fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.normal, color: theme.textMuted, marginBottom: "48px" }}>
        (Optional)
      </p>

      <textarea
        value={feedbackText}
        onChange={(e) => { if (e.target.value.length <= 500) setFeedbackText(e.target.value); }}
        placeholder={t("survey.feedbackPlaceholder")}
        style={{
          width: "100%", maxWidth: "800px", height: "220px", padding: "24px",
          borderRadius: theme.radiusXl, border: `2px solid ${theme.borderDefault}`,
          fontFamily, fontSize: TYPE_SCALE.base, color: theme.textHeading,
          resize: "none", outline: "none",
          direction: isRTL ? "rtl" : "ltr", textAlign: isRTL ? "right" : "left",
        }}
        onFocus={(e) => { e.target.style.borderColor = BRAND; }}
        onBlur={(e) => { e.target.style.borderColor = theme.borderDefault; }}
      />
      <p style={{ fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.normal, color: theme.textMuted, marginTop: "16px", maxWidth: "800px", width: "100%", textAlign: isRTL ? "right" : "left" }}>
        {feedbackText.length} / 500 characters
      </p>
    </div>
  );

  const renderSurveyThankYou = () => (
    <div className="flex flex-col items-center justify-center h-full px-16 text-center"
      style={{ backgroundColor: theme.primarySubtle }}>
      {/* Check icon */}
      <div className="flex items-center justify-center mb-8"
        style={{ width: 72, height: 72, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.4)", border: `2px solid ${BRAND}30` }}>
        <CheckCircle2 size={36} style={{ color: BRAND }} />
      </div>
      <h2 style={{ fontFamily, fontSize: TYPE_SCALE["2xl"], fontWeight: WEIGHT.bold, color: theme.textHeading, marginBottom: "16px", lineHeight: LEADING.tight }}>
        {t("survey.thankYou")}
      </h2>
      <p style={{ fontFamily, ...TEXT_STYLE.body, fontSize: TYPE_SCALE.md, color: theme.textMuted, lineHeight: LEADING.relaxed, maxWidth: "500px", marginBottom: "40px" }}>
        {t("survey.thankYouDesc")}
      </p>
      {/* Close button */}
      <button onClick={onClose} className="transition-transform duration-200 active:scale-[0.96] cursor-pointer"
        style={{ padding: "14px 48px", borderRadius: theme.radiusMd, backgroundColor: BRAND, border: "none", boxShadow: `0 4px 16px ${BRAND}40` }}>
        <span style={{ fontFamily, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.bold, color: "#fff" }}>{t("survey.close")}</span>
      </button>
    </div>
  );

  const renderSurveyPath = () => (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {renderSurveyProgressBar()}

      {/* Main content */}
      <div className="flex-1 overflow-hidden" style={{ paddingTop: "2px" }}>
        {currentSlide >= 0 && currentSlide <= 6 && renderQuestionSlide(currentSlide)}
        {currentSlide === 7 && renderSurveyFeedbackSlide()}
        {currentSlide === 8 && renderSurveyThankYou()}
      </div>

      {/* Survey footer nav */}
      {currentSlide < 8 && (
        <div
          className="flex items-center justify-between px-12 py-8 border-t"
          style={{ borderColor: theme.borderDefault, zIndex: 20, direction: "ltr" }}
        >
          {/* LTR left = Previous / RTL left = Next */}
          {isRTL ? (
            currentSlide === 7 ? (
              <button onClick={handleSurveySubmit} className="flex items-center gap-2 transition-transform duration-200"
                style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold, color: theme.textInverse, cursor: "pointer", padding: "12px 32px", borderRadius: theme.radiusMd, backgroundColor: BRAND }}>
                <ChevronLeft size={22} />
                {t("survey.submit")}
              </button>
            ) : (
              <button onClick={handleNext} className="flex items-center gap-2 transition-transform duration-200"
                style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold, color: theme.textInverse, cursor: "pointer", padding: "12px 32px", borderRadius: theme.radiusMd, backgroundColor: BRAND }}>
                <ChevronLeft size={22} />
                {t("survey.next")}
              </button>
            )
          ) : (
            <button
              onClick={currentSlide === 0 ? () => setPath("hub") : handlePrevious}
              className="flex items-center gap-2 transition-transform duration-200"
              style={{
                fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold,
                color: BRAND, cursor: "pointer",
                padding: "12px 24px", borderRadius: theme.radiusMd,
                backgroundColor: theme.primarySubtle,
              }}
            >
              <ChevronLeft size={22} />
              {currentSlide === 0 ? t("feedback.back") : t("survey.previous")}
            </button>
          )}

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalSlides - 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-transform duration-300"
                style={{
                  width: i === currentSlide ? "28px" : "8px",
                  height: "8px",
                  backgroundColor: i === currentSlide ? BRAND : theme.borderDefault,
                }}
              />
            ))}
          </div>

          {/* LTR right = Next / RTL right = Previous */}
          {isRTL ? (
            <button
              onClick={currentSlide === 0 ? () => setPath("hub") : handlePrevious}
              className="flex items-center gap-2 transition-transform duration-200"
              style={{
                fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold,
                color: BRAND, cursor: "pointer",
                padding: "12px 24px", borderRadius: theme.radiusMd,
                backgroundColor: theme.primarySubtle,
              }}
            >
              {currentSlide === 0 ? t("feedback.back") : t("survey.previous")}
              <ChevronRight size={22} />
            </button>
          ) : currentSlide === 7 ? (
            <button onClick={handleSurveySubmit} className="flex items-center gap-2 transition-transform duration-200"
              style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold, color: theme.textInverse, cursor: "pointer", padding: "12px 32px", borderRadius: theme.radiusMd, backgroundColor: BRAND }}>
              {t("survey.submit")}
              <ChevronRight size={22} />
            </button>
          ) : (
            <button onClick={handleNext} className="flex items-center gap-2 transition-transform duration-200"
              style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold, color: theme.textInverse, cursor: "pointer", padding: "12px 32px", borderRadius: theme.radiusMd, backgroundColor: BRAND }}>
              {t("survey.next")}
              <ChevronRight size={22} />
            </button>
          )}
        </div>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
   * RENDER: CONCERN PATH
   * ═══════════════════════════════════════════════════════════════ */
  const renderConcernPath = () => {
    if (concernSubmitted) {
      const refNumber = `CR-${Math.floor(10000 + Math.random() * 90000)}`;
      return (
        <div className="flex-1 flex flex-col items-center justify-center px-16 text-center"
          style={{ backgroundColor: "rgba(196,87,26,0.03)" }}>
          {/* Check icon */}
          <div className="flex items-center justify-center mb-8"
            style={{ width: 72, height: 72, borderRadius: "50%", backgroundColor: CONCERN_SUBTLE, border: `2px solid ${CONCERN_BORDER}` }}>
            <CheckCircle2 size={36} style={{ color: CONCERN_COLOR }} />
          </div>
          <h2 style={{ fontFamily, fontSize: TYPE_SCALE["2xl"], fontWeight: WEIGHT.bold, color: theme.textHeading, marginBottom: "16px" }}>
            {t("concern.received")}
          </h2>
          <p style={{ fontFamily, fontSize: TYPE_SCALE.md, color: theme.textMuted, maxWidth: "500px", lineHeight: LEADING.relaxed, marginBottom: "32px" }}>
            {t("concern.receivedDesc")}
          </p>
          {/* Reference number */}
          <div className="flex items-center gap-4 px-6 py-3 mb-10"
            style={{ borderRadius: theme.radiusLg, border: `1.5px solid ${CONCERN_BORDER}`, backgroundColor: theme.surface }}>
            <span style={{ fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.medium, color: theme.textMuted }}>{t("concern.refNumber")}</span>
            <span style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, color: theme.textHeading }}>#{refNumber}</span>
          </div>
          {/* Close button */}
          <button onClick={onClose} className="transition-transform duration-200 active:scale-[0.96] cursor-pointer"
            style={{ padding: "14px 48px", borderRadius: theme.radiusMd, backgroundColor: CONCERN_COLOR, border: "none", boxShadow: `0 4px 16px ${CONCERN_SUBTLE}` }}>
            <span style={{ fontFamily, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.bold, color: "#fff" }}>{t("survey.close")}</span>
          </button>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-hidden items-center justify-center">
          <div className="w-full max-w-[800px] flex flex-col h-full shrink-0">
            {/* Header */}
            <div className="shrink-0 flex items-center gap-4 px-0 pt-10 pb-4">
              <div className="flex items-center justify-center"
                style={{ width: 44, height: 44, borderRadius: theme.radiusLg, backgroundColor: CONCERN_SUBTLE }}>
                <AlertTriangle size={22} style={{ color: CONCERN_COLOR }} />
              </div>
              <div className="flex flex-col">
                <span style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, color: theme.textHeading }}>
                  {t("concern.title")}
                </span>
                <span style={{ fontFamily, fontSize: TYPE_SCALE.sm, color: theme.textMuted }}>
                  {t("concern.subtitle")}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-0 pb-6 scrollbar-width-none">
              {/* Area question */}
              <h3 style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, color: theme.textHeading, marginBottom: "20px", marginTop: "24px" }}>
                {t("concern.areaQuestion")}
              </h3>
              <div className="flex flex-wrap gap-3 mb-10">
                {concernAreas.map((area) => {
                  const isSelected = concernArea === area;
                  return (
                    <button
                      key={area}
                      onClick={() => setConcernArea(area)}
                      className="transition-transform duration-200 active:scale-[0.96] cursor-pointer"
                      style={{
                        padding: "12px 24px",
                        borderRadius: theme.radiusLg,
                        border: isSelected ? `2px solid ${CONCERN_COLOR}` : `1.5px solid ${theme.borderDefault}`,
                        backgroundColor: isSelected ? CONCERN_SUBTLE : theme.surface,
                        fontFamily,
                        fontSize: TYPE_SCALE.base,
                        fontWeight: isSelected ? WEIGHT.bold : WEIGHT.medium,
                        color: isSelected ? CONCERN_COLOR : theme.textBody,
                      }}
                    >
                      {t(area)}
                    </button>
                  );
                })}
              </div>

              {/* Tell us */}
              <h3 style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, color: theme.textHeading, marginBottom: "16px" }}>
                {t("concern.tellUs")}
              </h3>
              <div className="relative">
                <textarea
                  value={concernText}
                  onChange={(e) => setConcernText(e.target.value)}
                  placeholder={t("concern.placeholder")}
                  style={{
                    width: "100%", height: "140px", padding: "20px",
                    borderRadius: theme.radiusLg,
                    border: `1.5px solid ${theme.borderDefault}`,
                    fontFamily, fontSize: TYPE_SCALE.base, color: theme.textHeading,
                    resize: "none", outline: "none",
                    direction: isRTL ? "rtl" : "ltr", textAlign: isRTL ? "right" : "left",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = CONCERN_COLOR; }}
                  onBlur={(e) => { e.target.style.borderColor = theme.borderDefault; }}
                />
                <VoiceRecorder color={CONCERN_COLOR} label={t("concern.recordVoice") || "Record voice"} onRecordingChange={setConcernHasRecording} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-12 py-8 border-t" style={{ borderColor: theme.borderDefault, direction: "ltr" }}>
          {isRTL ? (
            <>
              <button
                onClick={handleConcernSubmit}
                disabled={!concernArea || (!concernText.trim() && !concernHasRecording)}
                className="flex items-center gap-2 transition-transform duration-200 active:scale-[0.96] cursor-pointer"
                style={{
                  fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold, color: "#fff",
                  padding: "12px 32px", borderRadius: theme.radiusMd,
                  backgroundColor: (!concernArea || (!concernText.trim() && !concernHasRecording)) ? theme.textDisabled : CONCERN_COLOR,
                  border: "none", opacity: (!concernArea || (!concernText.trim() && !concernHasRecording)) ? 0.5 : 1,
                  boxShadow: `0 4px 16px ${CONCERN_SUBTLE}`,
                }}
              >
                <ChevronLeft size={22} />
                {t("survey.submit")}
              </button>
              <button onClick={() => setPath("hub")} className="flex items-center gap-2 cursor-pointer transition-transform duration-200"
                style={{ background: "none", border: "none", padding: "12px 24px", borderRadius: theme.radiusMd, backgroundColor: "transparent", fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold, color: theme.textMuted }}>
                {t("feedback.back")}
                <ChevronRight size={22} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setPath("hub")} className="flex items-center gap-2 cursor-pointer transition-transform duration-200"
                style={{ background: "none", border: "none", padding: "12px 24px", borderRadius: theme.radiusMd, backgroundColor: "transparent", fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold, color: theme.textMuted }}>
                <ChevronLeft size={22} />
                {t("feedback.back")}
              </button>
              <button
                onClick={handleConcernSubmit}
                disabled={!concernArea || (!concernText.trim() && !concernHasRecording)}
                className="flex items-center gap-2 transition-transform duration-200 active:scale-[0.96] cursor-pointer"
                style={{
                  fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold, color: "#fff",
                  padding: "12px 32px", borderRadius: theme.radiusMd,
                  backgroundColor: (!concernArea || (!concernText.trim() && !concernHasRecording)) ? theme.textDisabled : CONCERN_COLOR,
                  border: "none", opacity: (!concernArea || (!concernText.trim() && !concernHasRecording)) ? 0.5 : 1,
                  boxShadow: `0 4px 16px ${CONCERN_SUBTLE}`,
                }}
              >
                {t("survey.submit")}
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════
   * RENDER: APPRECIATION PATH
   * ═══════════════════════════════════════════════════════════════ */
  const renderAppreciationPath = () => {
    if (appreciationSubmitted) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center px-16 text-center"
          style={{ backgroundColor: APPRECIATION_SUBTLE }}>
          {/* Heart icon */}
          <div className="flex items-center justify-center mb-8"
            style={{ width: 72, height: 72, borderRadius: "50%", backgroundColor: "rgba(27,127,90,0.12)", border: `2px solid ${APPRECIATION_BORDER}` }}>
            <Heart size={36} style={{ color: APPRECIATION_COLOR }} />
          </div>
          <h2 style={{ fontFamily, fontSize: TYPE_SCALE["2xl"], fontWeight: WEIGHT.bold, color: theme.textHeading, marginBottom: "16px" }}>
            {t("appreciation.delivered")}
          </h2>
          <p style={{ fontFamily, fontSize: TYPE_SCALE.md, color: theme.textMuted, maxWidth: "500px", lineHeight: LEADING.relaxed, marginBottom: "40px" }}>
            {t("appreciation.deliveredDesc")}
          </p>
          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <button onClick={() => { resetAppreciation(); }} className="transition-transform duration-200 active:scale-[0.96] cursor-pointer"
              style={{ padding: "14px 32px", borderRadius: theme.radiusMd, backgroundColor: theme.surface, border: `1.5px solid ${APPRECIATION_BORDER}` }}>
              <span style={{ fontFamily, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.bold, color: APPRECIATION_COLOR }}>{t("appreciation.sendAnother")}</span>
            </button>
            <button onClick={onClose} className="transition-transform duration-200 active:scale-[0.96] cursor-pointer"
              style={{ padding: "14px 40px", borderRadius: theme.radiusMd, backgroundColor: APPRECIATION_COLOR, border: "none", boxShadow: `0 4px 16px ${APPRECIATION_SUBTLE}` }}>
              <span style={{ fontFamily, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.bold, color: "#fff" }}>{t("survey.close")}</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-hidden items-center justify-center">
          <div className="w-full max-w-[800px] flex flex-col h-full shrink-0">
            {/* Header */}
            <div className="shrink-0 flex items-center gap-4 px-0 pt-10 pb-4">
              <div className="flex items-center justify-center"
                style={{ width: 44, height: 44, borderRadius: theme.radiusLg, backgroundColor: APPRECIATION_SUBTLE }}>
                <Heart size={22} style={{ color: APPRECIATION_COLOR }} />
              </div>
              <div className="flex flex-col">
                <span style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, color: theme.textHeading }}>
                  {t("appreciation.title")}
                </span>
                <span style={{ fontFamily, fontSize: TYPE_SCALE.sm, color: theme.textMuted }}>
                  {t("appreciation.subtitle")}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-0 pb-6 scrollbar-width-none">
              {/* Who to thank */}
              <h3 style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, color: theme.textHeading, marginBottom: "20px", marginTop: "24px" }}>
                {t("appreciation.whoQuestion")}
              </h3>
              <div className="flex flex-wrap gap-3 mb-10">
                {appreciationTargets.map((target) => {
                  const isSelected = appreciationTarget === target;
                  return (
                    <button
                      key={target}
                      onClick={() => setAppreciationTarget(target)}
                      className="transition-transform duration-200 active:scale-[0.96] cursor-pointer"
                      style={{
                        padding: "12px 24px",
                        borderRadius: theme.radiusLg,
                        border: isSelected ? `2px solid ${APPRECIATION_COLOR}` : `1.5px solid ${theme.borderDefault}`,
                        backgroundColor: isSelected ? APPRECIATION_SUBTLE : theme.surface,
                        fontFamily,
                        fontSize: TYPE_SCALE.base,
                        fontWeight: isSelected ? WEIGHT.bold : WEIGHT.medium,
                        color: isSelected ? APPRECIATION_COLOR : theme.textBody,
                      }}
                    >
                      {t(target)}
                    </button>
                  );
                })}
              </div>

              {/* Message */}
              <h3 style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, color: theme.textHeading, marginBottom: "16px" }}>
                {t("appreciation.yourMessage")}
              </h3>
              <div className="relative">
                <textarea
                  value={appreciationText}
                  onChange={(e) => setAppreciationText(e.target.value)}
                  placeholder={t("appreciation.placeholder")}
                  style={{
                    width: "100%", height: "140px", padding: "20px",
                    borderRadius: theme.radiusLg,
                    border: `1.5px solid ${theme.borderDefault}`,
                    fontFamily, fontSize: TYPE_SCALE.base, color: theme.textHeading,
                    resize: "none", outline: "none",
                    direction: isRTL ? "rtl" : "ltr", textAlign: isRTL ? "right" : "left",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = APPRECIATION_COLOR; }}
                  onBlur={(e) => { e.target.style.borderColor = theme.borderDefault; }}
                />
                <VoiceRecorder color={APPRECIATION_COLOR} label={t("appreciation.recordVoice") || "Record voice"} onRecordingChange={setAppreciationHasRecording} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-12 py-8 border-t" style={{ borderColor: theme.borderDefault, direction: "ltr" }}>
          {isRTL ? (
            <>
              <button
                onClick={handleAppreciationSubmit}
                disabled={!appreciationTarget || (!appreciationText.trim() && !appreciationHasRecording)}
                className="flex items-center gap-2 transition-transform duration-200 active:scale-[0.96] cursor-pointer"
                style={{
                  fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold, color: "#fff",
                  padding: "12px 32px", borderRadius: theme.radiusMd,
                  backgroundColor: (!appreciationTarget || (!appreciationText.trim() && !appreciationHasRecording)) ? theme.textDisabled : APPRECIATION_COLOR,
                  border: "none", opacity: (!appreciationTarget || (!appreciationText.trim() && !appreciationHasRecording)) ? 0.5 : 1,
                  boxShadow: `0 4px 16px ${APPRECIATION_SUBTLE}`,
                }}
              >
                <ChevronLeft size={22} />
                {t("appreciation.send")}
              </button>
              <button onClick={() => setPath("hub")} className="flex items-center gap-2 cursor-pointer transition-transform duration-200"
                style={{ background: "none", border: "none", padding: "12px 24px", borderRadius: theme.radiusMd, backgroundColor: "transparent", fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold, color: theme.textMuted }}>
                {t("feedback.back")}
                <ChevronRight size={22} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setPath("hub")} className="flex items-center gap-2 cursor-pointer transition-transform duration-200"
                style={{ background: "none", border: "none", padding: "12px 24px", borderRadius: theme.radiusMd, backgroundColor: "transparent", fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold, color: theme.textMuted }}>
                <ChevronLeft size={22} />
                {t("feedback.back")}
              </button>
              <button
                onClick={handleAppreciationSubmit}
                disabled={!appreciationTarget || (!appreciationText.trim() && !appreciationHasRecording)}
                className="flex items-center gap-2 transition-transform duration-200 active:scale-[0.96] cursor-pointer"
                style={{
                  fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.semibold, color: "#fff",
                  padding: "12px 32px", borderRadius: theme.radiusMd,
                  backgroundColor: (!appreciationTarget || (!appreciationText.trim() && !appreciationHasRecording)) ? theme.textDisabled : APPRECIATION_COLOR,
                  border: "none", opacity: (!appreciationTarget || (!appreciationText.trim() && !appreciationHasRecording)) ? 0.5 : 1,
                  boxShadow: `0 4px 16px ${APPRECIATION_SUBTLE}`,
                }}
              >
                {t("appreciation.send")}
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════
   * MAIN RENDER
   * ═══════════════════════════════════════════════════════════════ */
  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        backgroundColor: theme.surface,
        zIndex: 1000,
        direction: isRTL ? "rtl" : "ltr",
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-8 p-3 transition-transform duration-200"
        style={{
          borderRadius: theme.radiusLg,
          backgroundColor: theme.tileInactiveBg,
          zIndex: 30,
          ...(isRTL ? { left: "32px" } : { right: "32px" }),
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.sliderBg; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.tileInactiveBg; }}
      >
        <X size={28} style={{ color: theme.textMuted }} />
      </button>

      {/* Main content area */}
      {path === "hub" && renderHubScreen()}
      {path === "survey" && renderSurveyPath()}
      {path === "concern" && renderConcernPath()}
      {path === "appreciation" && renderAppreciationPath()}
    </div>
  );
}