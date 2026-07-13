import { useState, useEffect, useCallback } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "../ThemeContext";
import { useLocale } from "../i18n";
import GameLanguageToggle from "./GameLanguageToggle";
import { Trophy, RotateCcw, ArrowLeft, Search } from "lucide-react";
import { GAME_TRANSLATIONS } from "./gameTranslations";

const WORD_CATEGORIES = {
  Animals: ["LION", "TIGER", "BEAR", "WOLF", "ZEBRA", "GIRAFFE", "MONKEY", "PANDA", "ELEPHANT", "KANGAROO", "DOLPHIN", "SHARK", "PENGUIN", "EAGLE", "SNAKE"],
  Food: ["APPLE", "PIZZA", "BURGER", "PASTA", "SUSHI", "DONUT", "STEAK", "SALAD", "BREAD", "CHEESE", "BANANA", "ORANGE", "CHICKEN", "TACO", "COOKIES"],
  Sports: ["SOCCER", "TENNIS", "BOXING", "GOLF", "HOCKEY", "CHESS", "RUGBY", "CRICKET", "SKATING", "DIVING", "KARATE", "SAILING", "SKIING", "SURFING", "CYCLING"],
  Countries: ["SAUDI", "JORDAN", "EGYPT", "KUWAIT", "FRANCE", "BRAZIL", "CANADA", "JAPAN", "ITALY", "SPAIN", "CHINA", "INDIA", "MEXICO", "GREECE", "TURKEY"],
  BodyParts: ["HEART", "LIVER", "BRAIN", "LUNGS", "SKULL", "BONE", "NERVE", "SKIN", "HAND", "FOOT", "EYES", "NOSE", "EARS", "NECK", "BACK"],
  Colors: ["PURPLE", "YELLOW", "ORANGE", "INDIGO", "SILVER", "GOLDEN", "BRONZE", "VIOLET", "MAROON", "CYAN", "MAGENTA", "BROWN", "BLACK", "WHITE", "GRAY"],
  Medical: ["NURSE", "DOCTOR", "XRAY", "BLOOD", "SCAN", "FEVER", "COUGH", "PILLS", "CHEST", "PULSE", "ORGAN", "CELLS", "VIRUS", "GERMS", "CLINIC"]
};

const WORD_CATEGORIES_AR = {
  Animals: ["اسد", "نمر", "دب", "ذئب", "زرافة", "فيل", "حمار", "جمل", "ثعبان", "طاووس", "بطريق", "نحلة", "فراشة", "عصفور", "ببغاء"],
  Food: ["تفاح", "بيتزا", "برغر", "باستا", "سوشي", "دونات", "ستيك", "سلطة", "خبز", "جبن", "موز", "برتقال", "دجاج", "تاكو", "كوكيز"],
  Sports: ["كرة", "تنس", "ملاكمة", "غولف", "هوكي", "شطرنج", "ركبي", "كريكيت", "تزلج", "غوص", "جودو", "ابحار", "سباحة", "رماية", "دراجات"],
  Countries: ["السعودية", "مصر", "اليمن", "الكويت", "فرنسا", "البرازيل", "كندا", "اليابان", "إيطاليا", "إسبانيا", "الصين", "الهند", "المكسيك", "اليونان", "تركيا"],
  BodyParts: ["قلب", "كبد", "دماغ", "رئة", "عين", "يد", "قدم", "أنف", "أذن", "شعر", "جلد", "فم", "أسنان", "ركبة", "معدة"],
  Colors: ["أحمر", "أزرق", "أخضر", "أصفر", "أسود", "أبيض", "زهري", "بنفسجي", "برتقالي", "بني", "رمادي", "ذهبي", "فضي", "فيروزي", "تركواز"],
  Medical: ["طبيب", "ممرضة", "مستشفى", "دواء", "فيروس", "بكتيريا", "علاج", "حقنة", "جراحة", "عيادة", "رعاية", "دم", "مرض", "ألم", "نوم"]
};

const WORD_CATEGORIES_BY_LOCALE = {
  en: WORD_CATEGORIES,
  ar: WORD_CATEGORIES_AR
} as const;

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG: Record<Difficulty, { size: number; count: number }> = {
  easy: { size: 8, count: 5 },
  medium: { size: 12, count: 10 },
  hard: { size: 16, count: 15 }
};

const HIGHLIGHT_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2", "#F06292", "#AED581"];

export function WordSearchGame({ onClose, onBackToGames }: { onClose: () => void; onBackToGames: () => void }) {
  const { theme } = useTheme();
  const { fontFamily, isRTL, dir, locale } = useLocale();
  const [gameLang, setGameLang] = useState<string>(localStorage.getItem('game-lang-word-search') ?? (locale === 'ar' ? 'ar' : 'en'));
  const gt = GAME_TRANSLATIONS[gameLang === 'ar' ? 'ar' : 'en'];
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([]);
  const [currentCategory, setCurrentCategory] = useState<keyof typeof WORD_CATEGORIES>("Animals");
  const [foundCellsMap, setFoundCellsMap] = useState<Record<string, { r: number; c: number }[]>>({});
  const [wordLocations, setWordLocations] = useState<Record<string, { r: number; c: number }[]>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hintCells, setHintCells] = useState<{ r: number; c: number }[] | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [targetWords, setTargetWords] = useState<string[]>([]);

  const gridSize = DIFFICULTY_CONFIG[difficulty].size;
  const wordCount = DIFFICULTY_CONFIG[difficulty].count;

  const clearGameState = useCallback((diff?: Difficulty, localeKey?: string) => {
    const targetDiff = diff || difficulty;
    const localeSuffix = localeKey ?? (gameLang === 'ar' ? 'ar' : 'en');
    localStorage.removeItem(`word-search-${targetDiff}-${localeSuffix}-state`);
  }, [difficulty, gameLang]);

  const saveGameState = useCallback(() => {
    if (!isActive || isComplete) return;
    const localeSuffix = gameLang === 'ar' ? 'ar' : 'en';
    const state = {
      difficulty,
      grid,
      foundWords,
      currentCategory,
      foundCellsMap,
      wordLocations,
      targetWords,
      timer,
      timestamp: Date.now()
    };
    localStorage.setItem(`word-search-${difficulty}-${localeSuffix}-state`, JSON.stringify(state));
  }, [difficulty, grid, foundWords, currentCategory, foundCellsMap, targetWords, timer, isActive, isComplete, locale]);

  const initializeGame = useCallback((newDiff?: Difficulty, newCat?: keyof typeof WORD_CATEGORIES) => {
    const targetDiff = newDiff || difficulty;
    const targetCat = newCat || currentCategory;

    // Check for saved game when switching difficulty
    if (newDiff) {
      const localeSuffix = locale === 'ar' ? 'ar' : 'en';
      const saved = localStorage.getItem(`word-search-${targetDiff}-${localeSuffix}-state`);
      if (saved) {
        setDifficulty(targetDiff);
        setCurrentCategory(targetCat);
        setHasSavedGame(true);
        setShowResumeModal(true);
        setIsActive(false);
        return;
      }
    }

    const config = DIFFICULTY_CONFIG[targetDiff];
    const localeKey = gameLang === 'ar' ? 'ar' : 'en';
    const allWords = WORD_CATEGORIES_BY_LOCALE[localeKey][targetCat];
    const words = [...allWords].sort(() => Math.random() - 0.5).slice(0, config.count);
    const newGrid = Array(config.size).fill(null).map(() => Array(config.size).fill(""));
    const newWordLocations: Record<string, { r: number; c: number }[]> = {};
    
    words.forEach(word => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        attempts++;
        const directions = ["H", "V", "D"]; // Horizontal, Vertical, Diagonal
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * config.size);
        const col = Math.floor(Math.random() * config.size);
        
        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          const r = direction === "V" ? row + i : direction === "D" ? row + i : row;
          const c = direction === "H" ? col + i : direction === "D" ? col + i : col;
          
          if (r >= config.size || c >= config.size || (newGrid[r][c] !== "" && newGrid[r][c] !== word[i])) {
            canPlace = false;
            break;
          }
        }
        
        if (canPlace) {
          newWordLocations[word] = [];
          for (let i = 0; i < word.length; i++) {
            const r = direction === "V" ? row + i : direction === "D" ? row + i : row;
            const c = direction === "H" ? col + i : direction === "D" ? col + i : col;
            newGrid[r][c] = word[i];
            newWordLocations[word].push({ r, c });
          }
          placed = true;
        }
      }
    });
    
    // Fill empty cells
    const letters = localeKey === 'ar' ? "ابتثجحخدذرزسشصضطظعغفقكلمنهويئ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < config.size; r++) {
      for (let c = 0; c < config.size; c++) {
        if (newGrid[r][c] === "") {
          newGrid[r][c] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
    
    setGrid(newGrid);
    setTargetWords(words);
    setFoundWords([]);
    setSelectedCells([]);
    setFoundCellsMap({});
    setWordLocations(newWordLocations);
    setIsComplete(false);
    setTimer(0);
    setIsActive(false);
    setHintCells(null);
    setDifficulty(targetDiff);
    setCurrentCategory(targetCat);
    setShowResumeModal(false);
    setHasSavedGame(false);
  }, [currentCategory, difficulty, gameLang]);

  const handleNewGame = useCallback(() => {
    clearGameState();
    setHasSavedGame(false);
    setShowResumeModal(false);
    initializeGame();
  }, [clearGameState, initializeGame]);

  const loadGameState = useCallback(() => {
    try {
      const localeSuffix = gameLang === 'ar' ? 'ar' : 'en';
      const saved = localStorage.getItem(`word-search-${difficulty}-${localeSuffix}-state`);
      if (saved) {
        const state = JSON.parse(saved);
        if (state && state.grid) {
          setDifficulty(state.difficulty);
          setGrid(state.grid);
          setFoundWords(state.foundWords);
          setCurrentCategory(state.currentCategory);
          setFoundCellsMap(state.foundCellsMap);
          setTargetWords(state.targetWords);
          setTimer(state.timer);
          setIsActive(true);
          setHasSavedGame(false);
          setShowResumeModal(false);
        }
      }
    } catch (e) {
      console.error("Failed to load game state:", e);
      clearGameState();
      handleNewGame();
    }
  }, [difficulty, clearGameState, handleNewGame]);


  // Initial mount: Check for saved game or auto-start
  useEffect(() => {
    const localeSuffix = gameLang === 'ar' ? 'ar' : 'en';
    const saved = localStorage.getItem(`word-search-${difficulty}-${localeSuffix}-state`);
    if (saved) {
      setHasSavedGame(true);
      setShowResumeModal(true);
    } else {
      initializeGame();
    }
    setIsBootstrapped(true);
  }, [gameLang, initializeGame]);

  // Save game state whenever relevant values change
  useEffect(() => {
    if (isActive && !isComplete && isBootstrapped) {
      saveGameState();
    }
  }, [isActive, isComplete, grid, foundWords, timer, saveGameState, isBootstrapped]);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const handleCellClick = (r: number, c: number) => {
    if (!isActive) setIsActive(true);
    const isSelected = selectedCells.some(cell => cell.r === r && cell.c === c);
    let newSelection;
    
    if (isSelected) {
      newSelection = selectedCells.filter(cell => !(cell.r === r && cell.c === c));
    } else {
      newSelection = [...selectedCells, { r, c }];
    }
    
    setSelectedCells(newSelection);
    
    const selectedWord = newSelection.map(cell => grid[cell.r][cell.c]).join("");
    const reversedSelectedWord = [...newSelection].reverse().map(cell => grid[cell.r][cell.c]).join("");

    let matchedWord = targetWords.find(w => w === selectedWord || w === reversedSelectedWord);

    // If not matched by string (ordering may differ or RTL issues), try coordinate-based match
    if (!matchedWord) {
      const selSet = new Set(newSelection.map(cell => `${cell.r},${cell.c}`));
      for (const w of targetWords) {
        const coords = wordLocations[w];
        if (!coords || coords.length !== newSelection.length) continue;
        const coordSet = new Set(coords.map(c => `${c.r},${c.c}`));
        let allMatch = true;
        for (const k of coordSet) {
          if (!selSet.has(k)) { allMatch = false; break; }
        }
        if (allMatch) {
          matchedWord = w;
          break;
        }
      }
    }

    if (matchedWord && !foundWords.includes(matchedWord)) {
      setFoundWords(prev => [...prev, matchedWord]);
      setFoundCellsMap(prev => ({
        ...prev,
        [matchedWord]: wordLocations[matchedWord] || newSelection
      }));
      setSelectedCells([]);

      if (foundWords.length + 1 === targetWords.length) {
        setIsActive(false);
        clearGameState();
        setTimeout(() => setIsComplete(true), 500);
      }
    }
  };

  const showHint = () => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const remaining = targetWords.filter(w => !foundWords.includes(w));
    if (remaining.length === 0) return;

    const wordToHint = remaining[Math.floor(Math.random() * remaining.length)];
    const locations = wordLocations[wordToHint];
    if (!locations || locations.length === 0) return;

    setHintCells(locations);
    setTimeout(() => setHintCells(null), 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col" style={{ backgroundColor: theme.background }} dir={dir}>
      <div className="shrink-0 flex items-center justify-between px-8" style={{ height: "88px", backgroundColor: theme.surface, borderBottom: theme.cardBorder, boxShadow: SHADOW.lg }}>
        <div className="flex items-center gap-4">
          <button onClick={onBackToGames} className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform" style={{ width: "56px", height: "56px", backgroundColor: theme.surfaceElevated, borderRadius: theme.radiusMd, border: "none", outline: "none" }}>
            <ArrowLeft size={24} color={theme.textHeading} className={isRTL ? 'rotate-180' : ''} />
          </button>
          <h1 style={{ fontFamily: fontFamily, fontSize: TYPE_SCALE.xl, fontWeight: WEIGHT.bold, color: theme.textHeading }}>{gt.wordSearch}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={difficulty}
            onChange={(e) => initializeGame(e.target.value as Difficulty, currentCategory)}
            style={{ padding: "8px 12px", borderRadius: theme.radiusMd, border: theme.cardBorder, outline: "none", fontFamily: fontFamily }}
          >
            <option value="easy">{gt.wsEasy}</option>
            <option value="medium">{gt.wsMedium}</option>
            <option value="hard">{gt.wsHard}</option>
          </select>
          <select 
            value={currentCategory} 
            onChange={(e) => initializeGame(difficulty, e.target.value as any)}
            style={{ padding: "8px 12px", borderRadius: theme.radiusMd, border: theme.cardBorder, outline: "none", fontFamily: fontFamily }}
          >
            {Object.keys(WORD_CATEGORIES).map(cat => <option key={cat} value={cat}>{(gt[`ws${cat as keyof typeof WORD_CATEGORIES}` as keyof typeof gt] as string) || cat}</option>)}
          </select>
          <div className="px-4 py-2 bg-gray-100 rounded-lg font-mono">
            {formatTime(timer)}
          </div>
          <button onClick={handleNewGame} className="flex items-center gap-2 px-6 py-3 cursor-pointer active:scale-95 transition-transform" style={{ backgroundColor: theme.primary, borderRadius: theme.radiusMd, border: "none", outline: "none" }}>
            <RotateCcw size={20} color={theme.textInverse} />
            <span style={{ fontFamily: fontFamily, fontSize: TYPE_SCALE.base, fontWeight: WEIGHT.semibold, color: theme.textInverse }}>{gt.reset}</span>
          </button>
          <GameLanguageToggle gameKey="word-search" initial={locale === 'ar' ? 'ar' : 'en'} onChange={(l) => setGameLang(l)} />
          <button onClick={onClose} className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform" style={{ width: "56px", height: "56px", backgroundColor: theme.surfaceElevated, borderRadius: theme.radiusMd, border: "none", outline: "none" }}>
            <span style={{ fontSize: "24px", color: theme.textHeading }}>×</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex px-16 py-8 gap-8 overflow-hidden">
        <div className="flex-1 flex items-center justify-center overflow-auto">
          <div className="grid gap-1 bg-white p-4 rounded-xl shadow-inner" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
            {grid.map((row, r) => row.map((char, c) => {
              const isSelected = selectedCells.some(cell => cell.r === r && cell.c === c);
              const isHinted = hintCells?.some(cell => cell.r === r && cell.c === c);
              let foundColor = null;
              foundWords.forEach((word, idx) => {
                if (foundCellsMap[word]?.some(cell => cell.r === r && cell.c === c)) {
                  foundColor = HIGHLIGHT_COLORS[idx % HIGHLIGHT_COLORS.length];
                }
              });

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className="flex items-center justify-center font-bold rounded transition-all select-none"
                  style={{
                    width: difficulty === 'hard' ? '24px' : difficulty === 'medium' ? '32px' : '48px',
                    height: difficulty === 'hard' ? '24px' : difficulty === 'medium' ? '32px' : '48px',
                    fontSize: difficulty === 'hard' ? '12px' : difficulty === 'medium' ? '16px' : '20px',
                    backgroundColor: isSelected ? theme.primary : foundColor || (isHinted ? '#fde68a' : "transparent"),
                    color: isSelected ? theme.textInverse : foundColor ? "#2D3436" : isHinted ? '#92400e' : theme.textNormal,
                    border: "1px solid rgba(0,0,0,0.05)",
                    transform: isSelected ? "scale(1.1)" : "scale(1)",
                    zIndex: isSelected ? 1 : 0
                  }}
                >
                  {char}
                </button>
              );
            }))}
          </div>
        </div>
        
        <div className="w-80 flex flex-col gap-4 overflow-auto">
          <div className="flex items-center justify-between">
            <h2 style={{ fontFamily: fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, color: theme.textHeading }}>{gt.wsWords}</h2>
            <button 
              onClick={showHint}
              className="px-3 py-1 text-xs bg-amber-100 text-amber-700 rounded-full font-bold hover:bg-amber-200"
            >
              {gt.hint}
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {targetWords.map((word, idx) => {
              const fIdx = foundWords.indexOf(word);
              const isFound = fIdx !== -1;
              const color = isFound ? HIGHLIGHT_COLORS[fIdx % HIGHLIGHT_COLORS.length] : theme.textNormal;
              return (
                <div key={word} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: isFound ? `${color}20` : theme.surfaceElevated, opacity: isFound ? 0.8 : 1 }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isFound ? color : 'transparent' }} />
                  <span style={{ fontFamily: fontFamily, textDecoration: isFound ? "line-through" : "none", fontWeight: isFound ? WEIGHT.bold : WEIGHT.medium, color: isFound ? color : theme.textNormal }}>{word}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isComplete && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 100 }}>
          <div className="flex flex-col items-center gap-6 px-12 py-10" style={{ backgroundColor: theme.surface, borderRadius: theme.radiusCard, boxShadow: SHADOW["2xl"], border: theme.cardBorder }}>
            <Trophy size={80} color={theme.primary} strokeWidth={1.5} />
            <h2 style={{ fontFamily: fontFamily, fontSize: TYPE_SCALE["2xl"], fontWeight: WEIGHT.bold, color: theme.textHeading }}>{gt.wsCongrats}</h2>
            <p style={{ fontFamily: fontFamily, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.medium, color: theme.textMuted }}>{gt.wsAllFound}</p>
            <div className="flex gap-4 mt-4">
              <button onClick={() => initializeGame()} className="px-8 py-4 cursor-pointer active:scale-95 transition-transform" style={{ backgroundColor: theme.primary, borderRadius: theme.radiusMd, border: "none", outline: "none", fontFamily: fontFamily, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.semibold, color: theme.textInverse }}>{gt.playAgain}</button>
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
                  color: theme.textHeading 
                }}
              >
                {gt.close}
              </button>
            </div>
          </div>
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
    </div>
  );
}
