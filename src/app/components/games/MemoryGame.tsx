import { useState, useEffect, useCallback } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW, SPACE } from "../ThemeContext";
import { useLocale } from "../i18n";
import GameLanguageToggle from "./GameLanguageToggle";
import { Trophy, RotateCcw, ArrowLeft } from "lucide-react";
import { GAME_TRANSLATIONS } from "./gameTranslations";

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

type Difficulty = 'easy' | 'medium' | 'hard';
type Theme = 'animals' | 'food' | 'sports' | 'flags';

const THEMES: Record<Theme, string[]> = {
  animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞"],
  food: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌽", "🥕", "🥔", "🍠", "🥐", "🍞", "🥖", "🥨", "🥯", "🥞", "🧀", "🍖"],
  sports: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🏒", "🏑", "🏏", "🏹", "🎣", "🥊", "🥋", "🥅", "⛳", "⛸", "🎣", "🚣", "🏊", "🏄", "🛀", "🚴", "🚵", "🏇", "🏆", "🥇", "🥈"],
  flags: ["🏳️", "🏴", "🏁", "🚩", "🏳️‍🌈", "🇦🇫", "🇦🇽", "🇦🇱", "🇩🇿", "🇦🇸", "🇦🇩", "🇦🇴", "🇦🇮", "🇦🇶", "🇦🇬", "🇦🇷", "🇦🇲", "🇦🇼", "🇦🇺", "🇦🇹", "🇦🇿", "🇧🇸", "🇧🇭", "🇧🇩", "🇧🇧", "🇧🇾", "🇧🇪", "🇧🇿", "🇧🇯", "🇧🇲", "🇧🇹", "🇧🇴"]
};

const DIFFICULTY_CONFIG: Record<Difficulty, { grid: number; pairs: number }> = {
  easy: { grid: 4, pairs: 8 },
  medium: { grid: 6, pairs: 18 },
  hard: { grid: 8, pairs: 32 }
};

export function MemoryGame({ onClose, onBackToGames }: { onClose: () => void; onBackToGames: () => void }) {
  const { theme } = useTheme();
  const { t, fontFamily, isRTL, dir, locale } = useLocale();
  const [gameLang, setGameLang] = useState<string>(localStorage.getItem('game-lang-memory-match') ?? (locale === 'ar' ? 'ar' : 'en'));
  const gt = GAME_TRANSLATIONS[gameLang === 'ar' ? 'ar' : 'en'];
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [currentTheme, setCurrentTheme] = useState<Theme>('animals');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [bestScores, setBestScores] = useState<Record<Difficulty, number>>({
    easy: 0,
    medium: 0,
    hard: 0
  });
  const [showStartScreen, setShowStartScreen] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  const clearGameState = useCallback((diff?: Difficulty) => {
    const targetDiff = diff || difficulty;
    localStorage.removeItem(`memory-match-${targetDiff}-state`);
  }, [difficulty]);

  const saveBestScore = useCallback((diff: Difficulty, score: number) => {
    const newScores = { ...bestScores };
    if (newScores[diff] === 0 || score < newScores[diff]) {
      newScores[diff] = score;
      setBestScores(newScores);
      localStorage.setItem('memory-best-scores', JSON.stringify(newScores));
      console.log('=== SAVE GAME STATE ===', 'memory-best-scores', JSON.stringify(newScores));
    }
  }, [bestScores]);

  const saveGameState = useCallback(() => {
    if (!isActive || isComplete) return;
    const state = {
      difficulty,
      currentTheme,
      cards,
      moves,
      matches,
      timer,
      timestamp: Date.now()
    };
    localStorage.setItem(`memory-match-${difficulty}-state`, JSON.stringify(state));
  }, [difficulty, currentTheme, cards, moves, matches, timer, isActive, isComplete]);

  const initializeGame = useCallback((newDiff?: Difficulty, newTheme?: Theme) => {
    const targetDiff = newDiff || difficulty;
    const targetTheme = newTheme || currentTheme;
    
    // Check for saved game when switching difficulty
    if (newDiff) {
      const saved = localStorage.getItem(`memory-match-${targetDiff}-state`);
      if (saved) {
        setDifficulty(targetDiff);
        setCurrentTheme(targetTheme);
        setHasSavedGame(true);
        setShowStartScreen(true);
        setIsActive(false);
        return;
      }
    }

    const config = DIFFICULTY_CONFIG[targetDiff];
    const themeEmojis = THEMES[targetTheme].slice(0, config.pairs);
    const emojis = [...themeEmojis, ...themeEmojis];
    const shuffled = emojis
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsComplete(false);
    setTimer(0);
    setIsActive(false);
    setDifficulty(targetDiff);
    setCurrentTheme(targetTheme);
    setShowStartScreen(false);
    setHasSavedGame(false);
  }, [difficulty, currentTheme]);

  const handleNewGame = useCallback(() => {
    clearGameState();
    setHasSavedGame(false);
    setShowStartScreen(false);
    initializeGame();
  }, [clearGameState, initializeGame]);

  const loadGameState = useCallback(() => {
    try {
      const saved = localStorage.getItem(`memory-match-${difficulty}-state`);
      if (saved) {
        const state = JSON.parse(saved);
        if (state && state.cards) {
          setDifficulty(state.difficulty);
          setCurrentTheme(state.currentTheme);
          setCards(state.cards);
          setMoves(state.moves);
          setMatches(state.matches);
          setTimer(state.timer);
          setIsActive(true);
          setHasSavedGame(false);
          setShowStartScreen(false);
        }
      }
    } catch (e) {
      console.error("Failed to load game state:", e);
      clearGameState();
      handleNewGame();
    }
  }, [difficulty, clearGameState, handleNewGame]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('memory-best-scores');
      console.log('=== LOAD GAME STATE ===', 'memory-best-scores', saved);
      if (saved) setBestScores(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load best scores:", e);
    }
  }, []);

  // Initial mount: Check for saved game or auto-start
  useEffect(() => {
    const saved = localStorage.getItem(`memory-match-${difficulty}-state`);
    if (saved) {
      setHasSavedGame(true);
      setShowStartScreen(true);
    } else {
      initializeGame();
    }
    setIsBootstrapped(true);
  }, []);

  // Save game state whenever relevant values change
  useEffect(() => {
    if (isActive && !isComplete && isBootstrapped) {
      saveGameState();
    }
  }, [isActive, isComplete, moves, matches, timer, saveGameState, isBootstrapped]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && !isComplete) {
      interval = setInterval(() => {
        setTimer((timer) => timer + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, isComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || cards[cardId].isFlipped || cards[cardId].isMatched) {
      return;
    }

    if (!isActive) setIsActive(true);

    const newCards = [...cards];
    newCards[cardId].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlippedCards;
      if (newCards[first].emoji === newCards[second].emoji) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          const newMatches = matches + 1;
          setMatches(newMatches);
          if (newMatches === DIFFICULTY_CONFIG[difficulty].pairs) {
            setIsComplete(true);
            saveBestScore(difficulty, timer);
            clearGameState();
          }
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          const unflippedCards = [...cards];
          unflippedCards[first].isFlipped = false;
          unflippedCards[second].isFlipped = false;
          setCards(unflippedCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

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
            {gt.memoryMatch}
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {/* Controls */}
          <div className="flex items-center gap-3">
            <select
              value={difficulty}
              onChange={(e) => initializeGame(e.target.value as Difficulty, currentTheme)}
              style={{
                fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.medium,
                padding: '8px 12px', borderRadius: theme.radiusMd, border: theme.cardBorder,
                backgroundColor: theme.surfaceElevated, color: theme.textHeading, outline: 'none'
              }}
            >
              <option value="easy">{gt.diffEasy}</option>
              <option value="medium">{gt.diffMedium}</option>
              <option value="hard">{gt.diffHard}</option>
            </select>
            <select
              value={currentTheme}
              onChange={(e) => initializeGame(difficulty, e.target.value as Theme)}
              style={{
                fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.medium,
                padding: '8px 12px', borderRadius: theme.radiusMd, border: theme.cardBorder,
                backgroundColor: theme.surfaceElevated, color: theme.textHeading, outline: 'none'
              }}
            >
              <option value="animals">{gt.themeAnimals}</option>
              <option value="food">{gt.themeFood}</option>
              <option value="sports">{gt.themeSports}</option>
              <option value="flags">{gt.themeFlags}</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span style={{ fontFamily, fontSize: '12px', color: theme.textMuted }}>{gt.best}: {bestScores[difficulty] ? formatTime(bestScores[difficulty]) : '--:--'}</span>
              <span style={{ fontFamily, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.bold, color: theme.primary }}>{formatTime(timer)}</span>
            </div>
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
                {gt.moves}: {moves}
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
                {gt.newGame}
              </span>
            </button>
            <GameLanguageToggle gameKey="memory-match" initial={locale === 'ar' ? 'ar' : 'en'} onChange={(l) => setGameLang(l)} />
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
      </div>

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-8">
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${DIFFICULTY_CONFIG[difficulty].grid}, ${difficulty === 'hard' ? '80px' : difficulty === 'medium' ? '110px' : '150px'})`,
            gridTemplateRows: `repeat(${DIFFICULTY_CONFIG[difficulty].grid}, ${difficulty === 'hard' ? '80px' : difficulty === 'medium' ? '110px' : '150px'})`,
          }}
        >
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched}
              className="relative overflow-hidden cursor-pointer transition-all duration-300"
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: card.isFlipped || card.isMatched ? theme.surface : theme.primary,
                borderRadius: theme.radiusMd,
                border: theme.cardBorder,
                boxShadow: SHADOW.sm,
                outline: "none",
                transform: card.isFlipped || card.isMatched ? "rotateY(0deg)" : "rotateY(0deg)",
                opacity: card.isMatched ? 0.5 : 1,
              }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  fontSize: difficulty === 'hard' ? '32px' : difficulty === 'medium' ? '48px' : '64px',
                  transition: "opacity 0.3s",
                  opacity: card.isFlipped || card.isMatched ? 1 : 0,
                }}
              >
                {card.emoji}
              </div>
              {!card.isFlipped && !card.isMatched && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    fontSize: "24px",
                    color: theme.textInverse,
                    opacity: 0.3,
                  }}
                >
                  ?
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Start Screen / Resume Modal */}
      {showStartScreen && (
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

      {/* Win Modal */}
      {isComplete && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            zIndex: 100,
          }}
        >
          <div
            className="flex flex-col items-center gap-6 px-12 py-10"
            style={{
              backgroundColor: theme.surface,
              borderRadius: theme.radiusCard,
              boxShadow: SHADOW["2xl"],
              border: theme.cardBorder,
            }}
          >
            <Trophy size={80} color={theme.primary} strokeWidth={1.5} />
            <h2
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE["2xl"],
                fontWeight: WEIGHT.bold,
                color: theme.textHeading,
              }}
            >
              {gt.congratulations}
            </h2>
            <p
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.md,
                fontWeight: WEIGHT.medium,
                color: theme.textMuted,
                textAlign: 'center'
              }}
            >
              {gt.memoryWin(difficulty, moves)}<br />
              {gt.finalTime}: <span style={{ color: theme.primary, fontWeight: WEIGHT.bold }}>{formatTime(timer)}</span><br />
              {gt.bestTime}: <span style={{ color: theme.primary, fontWeight: WEIGHT.bold }}>{formatTime(bestScores[difficulty])}</span>
            </p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => initializeGame()}
                className="px-8 py-4 cursor-pointer active:scale-95 transition-transform"
                style={{
                  backgroundColor: theme.primary,
                  borderRadius: theme.radiusMd,
                  border: "none",
                  outline: "none",
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.md,
                  fontWeight: WEIGHT.semibold,
                  color: theme.textInverse,
                }}
              >
                {gt.playAgain}
              </button>
              <button
                onClick={onClose}
                className="px-8 py-4 cursor-pointer active:scale-95 transition-transform"
                style={{
                  backgroundColor: theme.surfaceElevated,
                  borderRadius: theme.radiusMd,
                  border: theme.cardBorder,
                  outline: "none",
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.md,
                  fontWeight: WEIGHT.semibold,
                  color: theme.textHeading,
                }}
              >
                {gt.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}