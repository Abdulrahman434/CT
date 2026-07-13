import { useState, useCallback, useEffect } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "../ThemeContext";
import { useLocale } from "../i18n";
import GameLanguageToggle from "./GameLanguageToggle";
import { Trophy, RotateCcw, Timer, ArrowLeft } from "lucide-react";
import { GAME_TRANSLATIONS } from "./gameTranslations";

interface ColorOption {
  color: string;
  name: string;
}

const COLORS: ColorOption[] = [
  { color: "#FF6B6B", name: "Red" },
  { color: "#4ECDC4", name: "Cyan" },
  { color: "#45B7D1", name: "Blue" },
  { color: "#FFA07A", name: "Orange" },
  { color: "#98D8C8", name: "Mint" },
  { color: "#F7DC6F", name: "Yellow" },
  { color: "#BB8FCE", name: "Purple" },
  { color: "#85C1E2", name: "Sky" },
];

export function ColorMatchGame({ onClose, onBackToGames }: { onClose: () => void; onBackToGames: () => void }) {
  const { theme } = useTheme();
  const { fontFamily, isRTL, dir, locale } = useLocale();
  const [gameLang, setGameLang] = useState<string>(localStorage.getItem('game-lang-color-match') ?? (locale === 'ar' ? 'ar' : 'en'));
  const gt = GAME_TRANSLATIONS[gameLang === 'ar' ? 'ar' : 'en'];
  const LOCALIZED_COLORS = [
    { color: "#FF6B6B", name: gt.colorRed },
    { color: "#4ECDC4", name: gt.colorCyan },
    { color: "#45B7D1", name: gt.colorBlue },
    { color: "#FFA07A", name: gt.colorOrange },
    { color: "#98D8C8", name: gt.colorMint },
    { color: "#F7DC6F", name: gt.colorYellow },
    { color: "#BB8FCE", name: gt.colorPurple },
    { color: "#85C1E2", name: gt.colorSky },
  ];
  const [targetColor, setTargetColor] = useState<ColorOption>(COLORS[0]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('color-match-high-score');
    console.log('=== LOAD GAME STATE ===', 'color-match-high-score', saved);
    if (saved) setHighScore(parseInt(saved));
    
    const savedState = localStorage.getItem('color-match-game-state');
    console.log('=== LOAD GAME STATE ===', 'color-match-game-state', savedState);
    if (savedState) {
      setHasSavedGame(true);
      setShowResumeModal(true);
    }
  }, []);

  const saveGameState = useCallback(() => {
    if (!isPlaying || (timeLeft <= 0 || lives <= 0)) return;
    const state = {
      score,
      timeLeft,
      lives,
      combo,
      speedMultiplier,
      targetColor,
      timestamp: Date.now()
    };
    localStorage.setItem('color-match-game-state', JSON.stringify(state));
    console.log('=== SAVE ===', state);
    console.log('=== SAVE GAME STATE ===', 'color-match-game-state', JSON.stringify(state));
  }, [isPlaying, score, timeLeft, lives, combo, speedMultiplier, targetColor]);

  const loadGameState = () => {
    const saved = localStorage.getItem('color-match-game-state');
    console.log('=== LOAD GAME STATE ===', 'color-match-game-state', saved);
    if (saved) {
      const state = JSON.parse(saved);
      setScore(state.score);
      setTimeLeft(state.timeLeft);
      setLives(state.lives);
      setCombo(state.combo);
      setSpeedMultiplier(state.speedMultiplier);
      setTargetColor(state.targetColor);
      setIsPlaying(true);
      setShowResumeModal(false);
    }
  };

  const clearGameState = () => {
    localStorage.removeItem('color-match-game-state');
  };

  useEffect(() => {
    saveGameState();
  }, [saveGameState]);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(30);
    setLives(3);
    setCombo(0);
    setSpeedMultiplier(1);
    setIsPlaying(true);
    setTargetColor(LOCALIZED_COLORS[Math.floor(Math.random() * LOCALIZED_COLORS.length)]);
    clearGameState();
  }, []);

  const handleNewGame = () => {
    clearGameState();
    setHasSavedGame(false);
    setShowResumeModal(false);
    startGame();
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0 && lives > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => Math.max(0, prev - 1 * speedMultiplier)), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft <= 0 || lives <= 0) {
      setIsPlaying(false);
      clearGameState();
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('color-match-high-score', score.toString());
    console.log('=== SAVE GAME STATE ===', 'color-match-high-score', score.toString());
      }
    }
  }, [isPlaying, timeLeft, lives, speedMultiplier, score, highScore]);

  const handleColorClick = useCallback(
    (selectedColor: ColorOption) => {
      if (!isPlaying) return;

      if (selectedColor.color === targetColor.color) {
        const points = combo >= 5 ? 2 : 1;
        setScore(prev => prev + points);
        setCombo(prev => prev + 1);
        setShowCorrect(true);
        setTimeout(() => setShowCorrect(false), 300);
        
        // Speed increase every 5 correct
        if ((score + 1) % 5 === 0) {
          setSpeedMultiplier(prev => prev + 0.2);
        }

        // Set new target color
        const newColor = LOCALIZED_COLORS[Math.floor(Math.random() * LOCALIZED_COLORS.length)];
        setTargetColor(newColor);
      } else {
        setLives(prev => prev - 1);
        setCombo(0);
        setShowWrong(true);
        setTimeout(() => setShowWrong(false), 300);
      }
    },
    [isPlaying, targetColor, score, combo]
  );

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      dir={dir}
      style={{
        backgroundColor: theme.background,
      }}
    >
      {/* Header */}
      <div
        className="shrink-0 flex items-center justify-between px-8"
        style={{
          height: "88px",
          backgroundColor: theme.surface,
          borderBottom: theme.cardBorder,
          boxShadow: SHADOW.lg,
        }}
      >
        <div className="flex items-center gap-4">
          <GameLanguageToggle gameKey="color-match" initial={locale === 'ar' ? 'ar' : 'en'} onChange={(l) => setGameLang(l)} />
          <button
            onClick={onBackToGames}
            className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            style={{
              width: "56px",
              height: "56px",
              backgroundColor: theme.surfaceElevated,
              borderRadius: theme.radiusMd,
              border: "none",
              outline: "none",
            }}
          >
            <ArrowLeft size={24} color={theme.textHeading} className={isRTL ? 'rotate-180' : ''} />
          </button>
          <h1
            style={{
              fontFamily: fontFamily,
              fontSize: TYPE_SCALE.xl,
              fontWeight: WEIGHT.bold,
              color: theme.textHeading,
            }}
          >
            {gt.colorMatch}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span style={{ fontFamily, fontSize: '12px', color: theme.textMuted }}>{gt.highScore}: {highScore}</span>
            <span style={{ fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.bold, color: theme.primary }}>{gt.combo}: {combo}x</span>
          </div>
          <div
            className="flex items-center gap-2 px-6 py-3"
            style={{
              backgroundColor: theme.primarySubtle,
              borderRadius: theme.radiusFull,
            }}
          >
            <Timer size={20} color={theme.primary} />
            <span
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.md,
                fontWeight: WEIGHT.semibold,
                color: theme.primary,
              }}
            >
              {Math.ceil(timeLeft)}s
            </span>
          </div>
          <div
            className="flex items-center gap-2 px-6 py-3"
            style={{
              backgroundColor: "#FEE2E2",
              borderRadius: theme.radiusFull,
            }}
          >
            <span
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.md,
                fontWeight: WEIGHT.bold,
                color: "#EF4444",
              }}
            >
              {gt.lives}: {lives}
            </span>
          </div>
          <div
            className="px-6 py-3"
            style={{
              backgroundColor: theme.accentSubtle,
              borderRadius: theme.radiusFull,
            }}
          >
            <span
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.md,
                fontWeight: WEIGHT.semibold,
                color: theme.accent,
              }}
            >
              {gt.score}: {score}
            </span>
          </div>
          <button
            onClick={handleNewGame}
            className="flex items-center gap-2 px-6 py-3 cursor-pointer active:scale-95 transition-transform"
            style={{
              backgroundColor: theme.primary,
              borderRadius: theme.radiusMd,
              border: "none",
              outline: "none",
            }}
          >
            <RotateCcw size={20} color={theme.textInverse} />
            <span
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.base,
                fontWeight: WEIGHT.semibold,
                color: theme.textInverse,
              }}
            >
              {isPlaying ? gt.restart : gt.startGame}
            </span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            style={{
              width: "56px",
              height: "56px",
              backgroundColor: theme.surfaceElevated,
              borderRadius: theme.radiusMd,
              border: "none",
              outline: "none",
            }}
          >
            <span style={{ fontSize: "24px", color: theme.textHeading }}>×</span>
          </button>
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-16 px-16 py-12">
        {!isPlaying && timeLeft === 30 ? (
          /* Start Screen */
          <div className="flex flex-col items-center gap-8">
            <div
              className="w-48 h-48 flex items-center justify-center"
              style={{
                backgroundColor: theme.primarySubtle,
                borderRadius: "50%",
              }}
            >
              <span style={{ fontSize: "96px" }}>🎨</span>
            </div>
            <h2
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE["2xl"],
                fontWeight: WEIGHT.bold,
                color: theme.textHeading,
                textAlign: "center",
              }}
            >
              {gt.matchColors}
            </h2>
            <p
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.md,
                fontWeight: WEIGHT.medium,
                color: theme.textMuted,
                textAlign: "center",
                maxWidth: "600px",
              }}
            >
              {gt.colorInstructions}
            </p>
            <button
              onClick={startGame}
              className="px-12 py-5 cursor-pointer active:scale-95 transition-transform"
              style={{
                backgroundColor: theme.primary,
                borderRadius: theme.radiusMd,
                border: "none",
                outline: "none",
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.lg,
                fontWeight: WEIGHT.bold,
                color: theme.textInverse,
              }}
            >
              {gt.startGame}
            </button>
          </div>
        ) : (timeLeft <= 0 || lives <= 0) ? (
          /* Game Over Screen */
          <div className="flex flex-col items-center gap-8">
            <Trophy size={120} color={theme.primary} strokeWidth={1.5} />
            <h2
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE["2xl"],
                fontWeight: WEIGHT.bold,
                color: theme.textHeading,
              }}
            >
              {lives <= 0 ? gt.noMoreLives : gt.timesUp}
            </h2>
            <div className="flex flex-col items-center gap-2">
              <p style={{ fontFamily, fontSize: TYPE_SCALE.xl, fontWeight: WEIGHT.semibold, color: theme.primary }}>
                {gt.finalScore}: {score}
              </p>
              <p style={{ fontFamily, fontSize: TYPE_SCALE.md, color: theme.textMuted }}>
                {gt.highScore}: {highScore}
              </p>
            </div>
            <button
              onClick={startGame}
              className="px-12 py-5 cursor-pointer active:scale-95 transition-transform"
              style={{
                backgroundColor: theme.primary,
                borderRadius: theme.radiusMd,
                border: "none",
                outline: "none",
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.lg,
                fontWeight: WEIGHT.bold,
                color: theme.textInverse,
              }}
            >
              {gt.playAgain}
            </button>
          </div>
        ) : (
          /* Playing Screen */
          <>
            {/* Target Color Name */}
            <div
              className="px-16 py-8"
              style={{
                backgroundColor: theme.surface,
                borderRadius: theme.radiusCard,
                border: theme.cardBorder,
                boxShadow: SHADOW.xl,
              }}
            >
              <p
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.base,
                  fontWeight: WEIGHT.medium,
                  color: theme.textMuted,
                  textAlign: "center",
                  marginBottom: "8px",
                }}
              >
                {gt.clickOn}
              </p>
              <h2
                style={{
                  fontFamily: fontFamily,
                  fontSize: "64px",
                  fontWeight: WEIGHT.extrabold,
                  color: theme.textHeading,
                  textAlign: "center",
                }}
              >
                {targetColor.name}
              </h2>
            </div>

            {/* Color Grid */}
            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns: "repeat(4, 180px)",
                gridTemplateRows: "repeat(2, 180px)",
              }}
            >
              {LOCALIZED_COLORS.map((colorOption) => (
                <button
                  key={colorOption.color}
                  onClick={() => handleColorClick(colorOption)}
                  className="cursor-pointer transition-all duration-200 active:scale-95"
                  style={{
                    backgroundColor: colorOption.color,
                    borderRadius: theme.radiusLg,
                    border: "none",
                    boxShadow: SHADOW.md,
                    outline: "none",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Feedback Animation */}
      {showCorrect && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{
            backgroundColor: "rgba(74, 222, 128, 0.2)",
            animation: "feedbackFade 0.3s ease-out",
          }}
        >
          <span
            style={{
              fontSize: "120px",
              animation: "feedbackScale 0.3s ease-out",
            }}
          >
            ✓
          </span>
        </div>
      )}

      {showWrong && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.2)",
            animation: "feedbackFade 0.3s ease-out",
          }}
        >
          <span
            style={{
              fontSize: "120px",
              animation: "feedbackScale 0.3s ease-out",
            }}
          >
            ✗
          </span>
        </div>
      )}

      {/* Resume Modal */}
      {showResumeModal && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            zIndex: 150,
          }}
        >
          <div
            className="flex flex-col items-center gap-8 px-16 py-12"
            style={{
              backgroundColor: theme.surface,
              borderRadius: theme.radiusCard,
              boxShadow: SHADOW["2xl"],
              border: theme.cardBorder,
              maxWidth: "500px",
              width: "90%"
            }}
          >
            <div className="w-24 h-24 rounded-full bg-primarySubtle flex items-center justify-center" style={{ backgroundColor: theme.primarySubtle }}>
              <RotateCcw size={48} color={theme.primary} />
            </div>
            
            <div className="text-center gap-2 flex flex-col">
              <h2 style={{ fontFamily, fontSize: TYPE_SCALE["2xl"], fontWeight: WEIGHT.bold, color: theme.textHeading }}>
                {gt.resumeGame}
              </h2>
              <p style={{ fontFamily, fontSize: TYPE_SCALE.md, color: theme.textMuted }}>
                {gt.resumeDesc}
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <button
                onClick={loadGameState}
                className="w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:brightness-110 active:scale-95"
                style={{ backgroundColor: theme.primary, color: theme.textInverse, fontSize: TYPE_SCALE.md }}
              >
                {gt.continuePlaying}
              </button>
              <button
                onClick={handleNewGame}
                className="w-full py-5 rounded-2xl font-bold transition-all hover:bg-black/5 active:scale-95"
                style={{ backgroundColor: theme.surfaceElevated, color: theme.textHeading, border: theme.cardBorder, fontSize: TYPE_SCALE.md }}
              >
                {gt.startNewGame}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes feedbackFade {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes feedbackScale {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}