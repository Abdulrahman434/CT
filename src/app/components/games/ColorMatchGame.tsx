import { useState, useCallback, useEffect } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "../ThemeContext";
import { useLocale } from "../i18n";
import { Trophy, RotateCcw, Timer, ArrowLeft } from "lucide-react";

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
  const { fontFamily } = useLocale();
  const [targetColor, setTargetColor] = useState<ColorOption>(COLORS[0]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [showWrong, setShowWrong] = useState(false);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setTargetColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  }, []);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
    }
  }, [isPlaying, timeLeft]);

  const handleColorClick = useCallback(
    (selectedColor: ColorOption) => {
      if (!isPlaying) return;

      if (selectedColor.color === targetColor.color) {
        setScore(score + 1);
        setShowCorrect(true);
        setTimeout(() => setShowCorrect(false), 300);
        // Set new target color
        const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        setTargetColor(newColor);
      } else {
        setShowWrong(true);
        setTimeout(() => setShowWrong(false), 300);
      }
    },
    [isPlaying, targetColor, score]
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
            Color Match
          </h1>
        </div>
        <div className="flex items-center gap-4">
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
              {timeLeft}s
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
              Score: {score}
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
              {isPlaying ? "Restart" : "Start Game"}
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
              Match the colors as fast as you can!
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
              Click on the color that matches the color name shown above. You have 30 seconds to score as many points as possible!
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
        ) : timeLeft === 0 ? (
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
              Time's Up! 🎉
            </h2>
            <p
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.xl,
                fontWeight: WEIGHT.semibold,
                color: theme.primary,
              }}
            >
              Final Score: {score}
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
              Play Again
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
                Click on:
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
              {COLORS.map((colorOption) => (
                <button
                  key={colorOption.color}
                  onClick={() => handleColorClick(colorOption)}
                  className="cursor-pointer transition-transform duration-200 active:scale-95"
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