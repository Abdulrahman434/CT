import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "../ThemeContext";
import { useLocale } from "../i18n";
import GameLanguageToggle from "./GameLanguageToggle";
import { Trophy, RotateCcw, ArrowLeft, Play } from "lucide-react";
import { GAME_TRANSLATIONS } from "./gameTranslations";

const CLASSIC_COLORS = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B"];
const HARD_COLORS = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#A855F7", "#EC4899"];

type Speed = 'slow' | 'normal' | 'fast';
type Mode = 'classic' | 'hard';

const SPEED_CONFIG: Record<Speed, number> = {
  slow: 1000,
  normal: 600,
  fast: 300
};

export function SimonSaysGame({ onClose, onBackToGames }: { onClose: () => void; onBackToGames: () => void }) {
  const { theme } = useTheme();
  const { fontFamily, isRTL, dir, locale } = useLocale();
  const [gameLang, setGameLang] = useState<string>(localStorage.getItem('game-lang-simon-says') ?? (locale === 'ar' ? 'ar' : 'en'));
  const gt = GAME_TRANSLATIONS[gameLang === 'ar' ? 'ar' : 'en'];
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [message, setMessage] = useState<string>(gt.simonMsgPress);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [speed, setSpeed] = useState<Speed>('normal');
  const [mode, setMode] = useState<Mode>('classic');
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('simon-high-score');
    console.log('=== LOAD GAME STATE ===', 'simon-high-score', saved);
    if (saved) setHighScore(parseInt(saved));

    const savedState = localStorage.getItem('simon-game-state');
    console.log('=== LOAD GAME STATE ===', 'simon-game-state', savedState);
    if (savedState) {
      setHasSavedGame(true);
      setShowResumeModal(true);
    }
  }, []);

  const saveGameState = useCallback(() => {
    if (sequence.length === 0 || isComplete) return;
    const state = {
      sequence,
      score,
      speed,
      mode,
      timestamp: Date.now()
    };
    localStorage.setItem('simon-game-state', JSON.stringify(state));
    console.log('=== SAVE ===', state);
    console.log('=== SAVE GAME STATE ===', 'simon-game-state', JSON.stringify(state));
  }, [sequence, score, speed, mode, isComplete]);

  const loadGameState = () => {
    const saved = localStorage.getItem('simon-game-state');
    console.log('=== LOAD GAME STATE ===', 'simon-game-state', saved);
    if (saved) {
      const state = JSON.parse(saved);
      setSequence(state.sequence);
      setScore(state.score);
      setSpeed(state.speed);
      setMode(state.mode);
      setPlayerSequence([]);
      setMessage(gt.simonMsgTurn);
      setShowResumeModal(false);
    }
  };

  const clearGameState = () => {
    localStorage.removeItem('simon-game-state');
  };

  useEffect(() => {
    saveGameState();
  }, [saveGameState]);

  const playSound = (index: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      const frequencies = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // Musical notes C4, E4, G4, C5, E5, G5
      oscillator.frequency.setValueAtTime(frequencies[index], audioContext.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {}
  };

  // Play a single color
  const playColor = useCallback((index: number) => {
    setActiveColor(index);
    playSound(index);
    setTimeout(() => {
      setActiveColor(null);
    }, 400);
  }, []);

  // Play the entire sequence
  const playSequence = useCallback((seq: number[]) => {
    setIsPlaying(true);
    let i = 0;
    const intervalTime = SPEED_CONFIG[speed];
    const interval = setInterval(() => {
      playColor(seq[i]);
      i++;
      if (i >= seq.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsPlaying(false);
          setMessage(gt.simonMsgTurn);
        }, intervalTime / 2);
      }
    }, intervalTime);
  }, [playColor, speed]);

  // Start new round
  const startRound = useCallback((currentSeq: number[]) => {
    const colorsCount = mode === 'classic' ? 4 : 6;
    const nextColor = Math.floor(Math.random() * colorsCount);
    const newSeq = [...currentSeq, nextColor];
    setSequence(newSeq);
    setPlayerSequence([]);
    setMessage(gt.simonMsgWatch);
    setTimeout(() => playSequence(newSeq), 1000);
  }, [playSequence, mode]);
  const startGame = () => {
    setScore(0);
    setIsComplete(false);
    startRound([]);
    clearGameState();
  };

  const handleNewGame = () => {
    clearGameState();
    setHasSavedGame(false);
    setShowResumeModal(false);
    startGame();
  };

  const handleColorClick = (index: number) => {
    if (isPlaying || sequence.length === 0) return;

    playColor(index);
    const newPlayerSeq = [...playerSequence, index];
    setPlayerSequence(newPlayerSeq);

    // Check if wrong
    if (sequence[newPlayerSeq.length - 1] !== index) {
      setMessage(gt.simonMsgOver);
      setIsComplete(true);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('simon-high-score', score.toString());
    console.log('=== SAVE GAME STATE ===', 'simon-high-score', score.toString());
      }
      clearGameState();
      return;
    }

    // Check if sequence completed
    if (newPlayerSeq.length === sequence.length) {
      setScore(score + 1);
      setMessage(gt.simonMsgCorrect);
      setIsPlaying(true);
      setTimeout(() => startRound(sequence), 1000);
    }
  };

  const currentColors = mode === 'classic' ? CLASSIC_COLORS : HARD_COLORS;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      dir={dir}
      style={{ backgroundColor: theme.background }}
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
            <GameLanguageToggle gameKey="simon-says" initial={locale === 'ar' ? 'ar' : 'en'} onChange={(l) => setGameLang(l)} />
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
            {gt.simonSays}
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {/* Settings */}
          <div className="flex items-center gap-3">
            <select 
              value={speed}
              onChange={(e) => setSpeed(e.target.value as Speed)}
              style={{
                fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.medium,
                padding: '8px 12px', borderRadius: theme.radiusMd, border: theme.cardBorder,
                backgroundColor: theme.surfaceElevated, color: theme.textHeading, outline: 'none'
              }}
            >
              <option value="slow">{gt.simonSlow}</option>
              <option value="normal">{gt.simonNormal}</option>
              <option value="fast">{gt.simonFast}</option>
            </select>
            <select 
              value={mode}
              onChange={(e) => {
                setMode(e.target.value as Mode);
                startGame();
              }}
              style={{
                fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.medium,
                padding: '8px 12px', borderRadius: theme.radiusMd, border: theme.cardBorder,
                backgroundColor: theme.surfaceElevated, color: theme.textHeading, outline: 'none'
              }}
            >
              <option value="classic">{gt.simonClassic}</option>
              <option value="hard">{gt.simonHard}</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span style={{ fontFamily, fontSize: '12px', color: theme.textMuted }}>{gt.best}: {highScore}</span>
              <span style={{ fontFamily, fontSize: TYPE_SCALE.sm, fontWeight: WEIGHT.bold, color: theme.primary }}>{gt.score}: {score}</span>
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
              <Play size={20} color={theme.textInverse} />
              <span
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.base,
                  fontWeight: WEIGHT.semibold,
                  color: theme.textInverse,
                }}
              >
                Start
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
      </div>

      {/* Game Board */}
      <div className="flex-1 flex flex-col items-center justify-center px-16 py-12 gap-8">
        <h2
          style={{
            fontFamily: fontFamily,
            fontSize: TYPE_SCALE.xl,
            color: theme.textHeading,
            fontWeight: WEIGHT.medium,
          }}
        >
          {message}
        </h2>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${mode === 'classic' ? 2 : 3}, 160px)`,
            gridTemplateRows: `repeat(${mode === 'classic' ? 2 : 2}, 160px)`,
          }}
        >
          {currentColors.map((color, index) => (
            <button
              key={index}
              onClick={() => handleColorClick(index)}
              className="relative rounded-2xl cursor-pointer transition-all duration-150"
              style={{
                backgroundColor: color,
                opacity: activeColor === index ? 1 : 0.6,
                transform: activeColor === index ? "scale(1.05)" : "scale(1)",
                boxShadow: activeColor === index ? `0 0 20px ${color}` : SHADOW.md,
                border: "none",
                outline: "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Game Over Modal */}
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
              {gt.simonMsgOver}
            </h2>
            <p
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.md,
                fontWeight: WEIGHT.medium,
                color: theme.textMuted,
              }}
            >
              {gt.simonReached(score)} 
            </p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={startGame}
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
