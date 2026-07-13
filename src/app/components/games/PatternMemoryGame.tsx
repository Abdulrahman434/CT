import { useState, useCallback, useEffect } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "../ThemeContext";
import { useLocale } from "../i18n";
import GameLanguageToggle from "./GameLanguageToggle";
import { Trophy, RotateCcw, ArrowLeft } from "lucide-react";
import { GAME_TRANSLATIONS } from "./gameTranslations";

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"];

type GameState = "idle" | "showing" | "playing" | "correct" | "wrong" | "gameover";

export function PatternMemoryGame({ onClose, onBackToGames }: { onClose: () => void; onBackToGames: () => void }) {
  const { theme } = useTheme();
  const { fontFamily, isRTL, dir, locale } = useLocale();
  const [gameLang, setGameLang] = useState<string>(localStorage.getItem('game-lang-pattern-memory') ?? (locale === 'ar' ? 'ar' : 'en'));
  const gt = GAME_TRANSLATIONS[gameLang === 'ar' ? 'ar' : 'en'];
  const [pattern, setPattern] = useState<number[]>([]);
  const [playerPattern, setPlayerPattern] = useState<number[]>([]);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [level, setLevel] = useState(1);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [highScore, setHighScore] = useState(0);
  const [canWatchAgain, setCanWatchAgain] = useState(true);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pattern-high-score');
    console.log('=== LOAD GAME STATE ===', 'pattern-high-score', saved);
    if (saved) setHighScore(parseInt(saved));

    const savedState = localStorage.getItem('pattern-memory-game-state');
    console.log('=== LOAD GAME STATE ===', 'pattern-memory-game-state', savedState);
    if (savedState) {
      setHasSavedGame(true);
      setShowResumeModal(true);
    }
  }, []);

  const saveGameState = useCallback(() => {
    if (gameState === "idle" || gameState === "gameover" || gameState === "wrong") return;
    const state = {
      pattern,
      playerPattern,
      level,
      canWatchAgain,
      gameState: gameState === "correct" ? "showing" : gameState, // Don't save transient "correct" state
      timestamp: Date.now()
    };
    localStorage.setItem('pattern-memory-game-state', JSON.stringify(state));
    console.log('=== SAVE ===', state);
    console.log('=== SAVE GAME STATE ===', 'pattern-memory-game-state', JSON.stringify(state));
  }, [pattern, playerPattern, level, canWatchAgain, gameState]);

  const loadGameState = () => {
    const saved = localStorage.getItem('pattern-memory-game-state');
    console.log('=== LOAD GAME STATE ===', 'pattern-memory-game-state', saved);
    if (saved) {
      const state = JSON.parse(saved);
      setPattern(state.pattern);
      setPlayerPattern(state.playerPattern);
      setLevel(state.level);
      setCanWatchAgain(state.canWatchAgain);
      setGameState(state.gameState);
      setShowResumeModal(false);
    }
  };

  const clearGameState = () => {
    localStorage.removeItem('pattern-memory-game-state');
  };

  useEffect(() => {
    saveGameState();
  }, [saveGameState]);

  const playSound = (index: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
      oscillator.frequency.setValueAtTime(frequencies[index % 8], audioContext.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {}
  };

  const startGame = useCallback(() => {
    const newPattern = [Math.floor(Math.random() * 8)];
    setPattern(newPattern);
    setPlayerPattern([]);
    setLevel(1);
    setCanWatchAgain(true);
    setGameState("showing");
    clearGameState();
  }, []);

  const handleNewGame = () => {
    clearGameState();
    setHasSavedGame(false);
    setShowResumeModal(false);
    startGame();
  };

  const watchAgain = () => {
    if (canWatchAgain && gameState === "playing") {
      setCanWatchAgain(false);
      setGameState("showing");
    }
  };

  // Show pattern to player
  useEffect(() => {
    if (gameState === "showing") {
      let index = 0;
      const showNext = () => {
        if (index < pattern.length) {
          setActiveCell(pattern[index]);
          playSound(pattern[index]);
          setTimeout(() => {
            setActiveCell(null);
            index++;
            if (index < pattern.length) {
              setTimeout(showNext, 300);
            } else {
              setTimeout(() => setGameState("playing"), 500);
            }
          }, 600);
        }
      };
      setTimeout(showNext, 500);
    }
  }, [gameState, pattern]);

  const handleCellClick = useCallback(
    (cellIndex: number) => {
      if (gameState !== "playing") return;

      const newPlayerPattern = [...playerPattern, cellIndex];
      setPlayerPattern(newPlayerPattern);

      // Flash the cell and play sound
      setActiveCell(cellIndex);
      playSound(cellIndex);
      setTimeout(() => setActiveCell(null), 200);

      // Check if correct
      if (cellIndex !== pattern[newPlayerPattern.length - 1]) {
        // Wrong!
        setGameState("wrong");
        setTimeout(() => {
          setGameState("gameover");
          clearGameState();
          if (level > highScore) {
            setHighScore(level);
            localStorage.setItem('pattern-high-score', level.toString());
    console.log('=== SAVE GAME STATE ===', 'pattern-high-score', level.toString());
          }
        }, 1000);
      } else if (newPlayerPattern.length === pattern.length) {
        // Completed this level!
        setGameState("correct");
        setTimeout(() => {
          const newLevel = level + 1;
          setLevel(newLevel);
          const newPattern = [...pattern, Math.floor(Math.random() * 8)];
          setPattern(newPattern);
          setPlayerPattern([]);
          setCanWatchAgain(true); // Reset watch again for new level
          setGameState("showing");
        }, 1000);
      }
    },
    [gameState, playerPattern, pattern, level, highScore]
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
          <GameLanguageToggle gameKey="pattern-memory" initial={locale === 'ar' ? 'ar' : 'en'} onChange={(l) => setGameLang(l)} />
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
            {gt.patternMemory}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div
            className="px-6 py-3"
            style={{
              backgroundColor: theme.primarySubtle,
              borderRadius: theme.radiusFull,
            }}
          >
            <span
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.md,
                fontWeight: WEIGHT.semibold,
                color: theme.primary,
              }}
            >
              {gt.level}: {level}
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
              {gt.best}: {highScore}
            </span>
          </div>
          <button
            onClick={watchAgain}
            disabled={!canWatchAgain || gameState !== "playing"}
            className="flex items-center gap-2 px-6 py-3 cursor-pointer active:scale-95 transition-transform"
            style={{
              backgroundColor: canWatchAgain && gameState === "playing" ? theme.accent : theme.surfaceElevated,
              borderRadius: theme.radiusMd,
              border: theme.cardBorder,
              outline: "none",
              opacity: canWatchAgain && gameState === "playing" ? 1 : 0.5,
            }}
          >
            <span
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.base,
                fontWeight: WEIGHT.semibold,
                color: canWatchAgain && gameState === "playing" ? "#fff" : theme.textMuted,
              }}
            >
              {gt.patternWatchAgain} {canWatchAgain ? "(1)" : "(0)"}
            </span>
          </button>
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
              {gameState === "idle" ? gt.startGame : gt.restart}
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
      <div className="flex-1 flex flex-col items-center justify-center gap-12 px-16 py-12">
        {gameState === "idle" ? (
          /* Start Screen */
          <div className="flex flex-col items-center gap-8">
            <div
              className="w-48 h-48 flex items-center justify-center"
              style={{
                backgroundColor: theme.primarySubtle,
                borderRadius: "50%",
              }}
            >
              <span style={{ fontSize: "96px" }}>🧠</span>
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
              {gt.patternRemember}
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
              {gt.patternDesc}
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
        ) : gameState === "gameover" ? (
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
              {gt.patternWrongMsg}
            </h2>
            <p
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.xl,
                fontWeight: WEIGHT.semibold,
                color: theme.primary,
              }}
            >
              {gt.simonReached(level - 1)}
            </p>
            {level > highScore && (
              <p
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.md,
                  fontWeight: WEIGHT.medium,
                  color: theme.accent,
                }}
              >
                {gt.patternNewHighScore}
              </p>
            )}
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
            {/* Status Message */}
            <div
              className="px-12 py-4"
              style={{
                backgroundColor: theme.surface,
                borderRadius: theme.radiusCard,
                border: theme.cardBorder,
                boxShadow: SHADOW.md,
                minWidth: "400px",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.lg,
                  fontWeight: WEIGHT.bold,
                  color: theme.textHeading,
                }}
              >
                {gameState === "showing" && gt.patternWatchMsg}
                {gameState === "playing" && gt.patternTurnMsg}
                {gameState === "correct" && gt.patternCorrectMsg}
                {gameState === "wrong" && gt.patternWrongMsg}
              </h3>
            </div>

            {/* Pattern Grid */}
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: "repeat(4, 180px)",
                gridTemplateRows: "repeat(2, 180px)",
              }}
            >
              {COLORS.map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleCellClick(index)}
                  disabled={gameState !== "playing"}
                  className="cursor-pointer transition-all duration-200 active:scale-95"
                  style={{
                    backgroundColor: activeCell === index ? color : `${color}80`,
                    borderRadius: theme.radiusLg,
                    border: activeCell === index ? `4px solid ${color}` : "none",
                    boxShadow: activeCell === index ? `0 0 40px ${color}` : SHADOW.md,
                    outline: "none",
                    opacity: gameState === "playing" ? 1 : 0.6,
                    transform: activeCell === index ? "scale(1.1)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Feedback Overlay */}
      {gameState === "correct" && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{
            backgroundColor: "rgba(74, 222, 128, 0.2)",
            animation: "feedbackFade 0.5s ease-out",
          }}
        >
          <span
            style={{
              fontSize: "120px",
              animation: "feedbackScale 0.5s ease-out",
            }}
          >
            ✓
          </span>
        </div>
      )}

      {gameState === "wrong" && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.2)",
            animation: "feedbackFade 0.5s ease-out",
          }}
        >
          <span
            style={{
              fontSize: "120px",
              animation: "feedbackScale 0.5s ease-out",
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
