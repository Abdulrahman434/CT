import { useState, useCallback, useEffect } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "../ThemeContext";
import { useLocale } from "../i18n";
import { Trophy, RotateCcw, ArrowLeft } from "lucide-react";

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"];

type GameState = "idle" | "showing" | "playing" | "correct" | "wrong" | "gameover";

export function PatternMemoryGame({ onClose, onBackToGames }: { onClose: () => void; onBackToGames: () => void }) {
  const { theme } = useTheme();
  const { fontFamily } = useLocale();
  const [pattern, setPattern] = useState<number[]>([]);
  const [playerPattern, setPlayerPattern] = useState<number[]>([]);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [level, setLevel] = useState(1);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [highScore, setHighScore] = useState(0);

  const startGame = useCallback(() => {
    const newPattern = [Math.floor(Math.random() * 8)];
    setPattern(newPattern);
    setPlayerPattern([]);
    setLevel(1);
    setGameState("showing");
  }, []);

  // Show pattern to player
  useEffect(() => {
    if (gameState === "showing") {
      let index = 0;
      const showNext = () => {
        if (index < pattern.length) {
          setActiveCell(pattern[index]);
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

      // Flash the cell
      setActiveCell(cellIndex);
      setTimeout(() => setActiveCell(null), 200);

      // Check if correct
      if (cellIndex !== pattern[newPlayerPattern.length - 1]) {
        // Wrong!
        setGameState("wrong");
        setTimeout(() => {
          setGameState("gameover");
          if (level > highScore) {
            setHighScore(level);
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
          setGameState("showing");
        }, 1000);
      }
    },
    [gameState, playerPattern, pattern, level, highScore]
  );

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
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
            <ArrowLeft size={24} color={theme.textHeading} />
          </button>
          <h1
            style={{
              fontFamily: fontFamily,
              fontSize: TYPE_SCALE.xl,
              fontWeight: WEIGHT.bold,
              color: theme.textHeading,
            }}
          >
            Pattern Memory
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
              Level: {level}
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
              Best: {highScore}
            </span>
          </div>
          <button
            onClick={startGame}
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
              {gameState === "idle" ? "Start Game" : "Restart"}
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
              Remember the Pattern!
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
              Watch the pattern light up, then repeat it by clicking the squares in the same order. Each level adds one more step!
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
              Start Game
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
              Game Over!
            </h2>
            <p
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.xl,
                fontWeight: WEIGHT.semibold,
                color: theme.primary,
              }}
            >
              You reached Level {level}
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
                🎉 New High Score!
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
              Play Again
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
                {gameState === "showing" && "Watch the pattern..."}
                {gameState === "playing" && "Your turn!"}
                {gameState === "correct" && "✓ Correct! Next level..."}
                {gameState === "wrong" && "✗ Wrong pattern!"}
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
                  className="cursor-pointer transition-transform duration-200 active:scale-95"
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
