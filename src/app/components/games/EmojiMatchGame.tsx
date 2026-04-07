import { useState, useCallback, useEffect } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "../ThemeContext";
import { useLocale } from "../i18n";
import { Trophy, RotateCcw, Timer, ArrowLeft } from "lucide-react";

interface EmojiPair {
  id: number;
  emoji: string;
  matched: boolean;
}

const EMOJI_LIST = ["🌟", "🎨", "🌸", "🦋", "🍀", "🎵", "☀️", "🌙", "🎭", "🎪", "🎨", "🎯"];

export function EmojiMatchGame({ onClose, onBackToGames }: { onClose: () => void; onBackToGames: () => void }) {
  const { theme } = useTheme();
  const { fontFamily } = useLocale();
  const [leftEmojis, setLeftEmojis] = useState<EmojiPair[]>([]);
  const [rightEmojis, setRightEmojis] = useState<EmojiPair[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [matches, setMatches] = useState(0);

  const startGame = useCallback(() => {
    // Select random emojis
    const selectedEmojis = EMOJI_LIST.sort(() => Math.random() - 0.5).slice(0, 6);
    
    // Create left column (shuffled)
    const left = selectedEmojis.map((emoji, index) => ({
      id: index,
      emoji,
      matched: false,
    })).sort(() => Math.random() - 0.5);

    // Create right column (differently shuffled)
    const right = selectedEmojis.map((emoji, index) => ({
      id: index,
      emoji,
      matched: false,
    })).sort(() => Math.random() - 0.5);

    setLeftEmojis(left);
    setRightEmojis(right);
    setSelectedLeft(null);
    setSelectedRight(null);
    setScore(0);
    setMatches(0);
    setTimeLeft(60);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
    }
  }, [isPlaying, timeLeft]);

  const handleLeftClick = useCallback(
    (index: number) => {
      if (!isPlaying || leftEmojis[index].matched) return;
      
      if (selectedLeft === index) {
        setSelectedLeft(null);
      } else {
        setSelectedLeft(index);
        
        // If right is already selected, check for match
        if (selectedRight !== null) {
          if (leftEmojis[index].emoji === rightEmojis[selectedRight].emoji) {
            // Match!
            const newLeft = [...leftEmojis];
            const newRight = [...rightEmojis];
            newLeft[index].matched = true;
            newRight[selectedRight].matched = true;
            setLeftEmojis(newLeft);
            setRightEmojis(newRight);
            setScore(score + 10);
            setMatches(matches + 1);
            
            // Check if all matched
            if (matches + 1 === leftEmojis.length) {
              setIsPlaying(false);
            }
          }
          
          // Reset selection after brief delay
          setTimeout(() => {
            setSelectedLeft(null);
            setSelectedRight(null);
          }, 500);
        }
      }
    },
    [isPlaying, leftEmojis, rightEmojis, selectedLeft, selectedRight, score, matches]
  );

  const handleRightClick = useCallback(
    (index: number) => {
      if (!isPlaying || rightEmojis[index].matched) return;
      
      if (selectedRight === index) {
        setSelectedRight(null);
      } else {
        setSelectedRight(index);
        
        // If left is already selected, check for match
        if (selectedLeft !== null) {
          if (leftEmojis[selectedLeft].emoji === rightEmojis[index].emoji) {
            // Match!
            const newLeft = [...leftEmojis];
            const newRight = [...rightEmojis];
            newLeft[selectedLeft].matched = true;
            newRight[index].matched = true;
            setLeftEmojis(newLeft);
            setRightEmojis(newRight);
            setScore(score + 10);
            setMatches(matches + 1);
            
            // Check if all matched
            if (matches + 1 === leftEmojis.length) {
              setIsPlaying(false);
            }
          }
          
          // Reset selection after brief delay
          setTimeout(() => {
            setSelectedLeft(null);
            setSelectedRight(null);
          }, 500);
        }
      }
    },
    [isPlaying, leftEmojis, rightEmojis, selectedLeft, selectedRight, score, matches]
  );

  const isGameComplete = matches === leftEmojis.length && leftEmojis.length > 0;

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
            Emoji Match
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
              {!isPlaying && leftEmojis.length === 0 ? "Start Game" : "Restart"}
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
        {!isPlaying && leftEmojis.length === 0 ? (
          /* Start Screen */
          <div className="flex flex-col items-center gap-8">
            <div
              className="w-48 h-48 flex items-center justify-center"
              style={{
                backgroundColor: theme.primarySubtle,
                borderRadius: "50%",
              }}
            >
              <span style={{ fontSize: "96px" }}>😊</span>
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
              Match the Emojis!
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
              Click on matching emojis from the left and right columns to connect them. Match all pairs before time runs out!
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
        ) : isGameComplete ? (
          /* Win Screen */
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
              Perfect Match! 🎉
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
            <p
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.md,
                fontWeight: WEIGHT.medium,
                color: theme.textMuted,
              }}
            >
              Time remaining: {timeLeft} seconds
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
        ) : timeLeft === 0 ? (
          /* Time's Up Screen */
          <div className="flex flex-col items-center gap-8">
            <div
              className="w-48 h-48 flex items-center justify-center"
              style={{
                backgroundColor: theme.accentSubtle,
                borderRadius: "50%",
              }}
            >
              <span style={{ fontSize: "96px" }}>⏰</span>
            </div>
            <h2
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE["2xl"],
                fontWeight: WEIGHT.bold,
                color: theme.textHeading,
              }}
            >
              Time's Up!
            </h2>
            <p
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.xl,
                fontWeight: WEIGHT.semibold,
                color: theme.primary,
              }}
            >
              Score: {score}
            </p>
            <p
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.md,
                fontWeight: WEIGHT.medium,
                color: theme.textMuted,
              }}
            >
              You matched {matches} out of {leftEmojis.length} pairs
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
              Try Again
            </button>
          </div>
        ) : (
          /* Playing Screen */
          <div className="flex gap-16 items-start">
            {/* Left Column */}
            <div className="flex flex-col gap-5">
              {leftEmojis.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleLeftClick(index)}
                  disabled={item.matched}
                  className="cursor-pointer transition-all duration-200 active:scale-95"
                  style={{
                    width: "200px",
                    height: "140px",
                    backgroundColor: item.matched 
                      ? theme.primarySubtle 
                      : selectedLeft === index 
                      ? theme.primary 
                      : theme.surface,
                    borderRadius: theme.radiusLg,
                    border: selectedLeft === index ? `3px solid ${theme.primary}` : theme.cardBorder,
                    boxShadow: selectedLeft === index ? `0 0 20px ${theme.primary}40` : SHADOW.md,
                    outline: "none",
                    fontSize: "72px",
                    opacity: item.matched ? 0.4 : 1,
                  }}
                >
                  {item.emoji}
                </button>
              ))}
            </div>

            {/* Center Indicator */}
            <div className="flex items-center" style={{ height: "840px" }}>
              <div
                className="flex flex-col items-center justify-center gap-4 px-8 py-6"
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: theme.radiusCard,
                  border: theme.cardBorder,
                  boxShadow: SHADOW.md,
                }}
              >
                <span style={{ fontSize: "48px" }}>↔️</span>
                <p
                  style={{
                    fontFamily: fontFamily,
                    fontSize: TYPE_SCALE.base,
                    fontWeight: WEIGHT.semibold,
                    color: theme.textMuted,
                    textAlign: "center",
                    maxWidth: "150px",
                  }}
                >
                  Match the pairs
                </p>
                <div
                  className="px-4 py-2"
                  style={{
                    backgroundColor: theme.primarySubtle,
                    borderRadius: theme.radiusFull,
                  }}
                >
                  <span
                    style={{
                      fontFamily: fontFamily,
                      fontSize: TYPE_SCALE.sm,
                      fontWeight: WEIGHT.bold,
                      color: theme.primary,
                    }}
                  >
                    {matches}/{leftEmojis.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-5">
              {rightEmojis.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleRightClick(index)}
                  disabled={item.matched}
                  className="cursor-pointer transition-all duration-200 active:scale-95"
                  style={{
                    width: "200px",
                    height: "140px",
                    backgroundColor: item.matched 
                      ? theme.primarySubtle 
                      : selectedRight === index 
                      ? theme.primary 
                      : theme.surface,
                    borderRadius: theme.radiusLg,
                    border: selectedRight === index ? `3px solid ${theme.primary}` : theme.cardBorder,
                    boxShadow: selectedRight === index ? `0 0 20px ${theme.primary}40` : SHADOW.md,
                    outline: "none",
                    fontSize: "72px",
                    opacity: item.matched ? 0.4 : 1,
                  }}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
