import { useState, useCallback, useEffect } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "../ThemeContext";
import { useLocale } from "../i18n";
import GameLanguageToggle from "./GameLanguageToggle";
import { Trophy, RotateCcw, Circle, X, ArrowLeft } from "lucide-react";
import { GAME_TRANSLATIONS } from "./gameTranslations";

type Player = "X" | "O" | null;
type GameMode = "friend" | "computer";

function calculateWinner(squares: Player[]): Player {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export function TicTacToeGame({ onClose, onBackToGames }: { onClose: () => void; onBackToGames: () => void }) {
  const { theme } = useTheme();
  const { fontFamily, isRTL, dir, locale } = useLocale();
  const [gameLang, setGameLang] = useState<string>(localStorage.getItem('game-lang-tictactoe') ?? (locale === 'ar' ? 'ar' : 'en'));
  const gt = GAME_TRANSLATIONS[gameLang === 'ar' ? 'ar' : 'en'];
  const [squares, setSquares] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>("friend");
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [showStartScreen, setShowStartScreen] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every((square) => square !== null);

  const getBestMove = useCallback((board: Player[]) => {
    // 1. Try to win
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        const testBoard = [...board];
        testBoard[i] = "O";
        if (calculateWinner(testBoard) === "O") return i;
      }
    }
    // 2. Block player
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        const testBoard = [...board];
        testBoard[i] = "X";
        if (calculateWinner(testBoard) === "X") return i;
      }
    }
    // 3. Take center
    if (!board[4]) return 4;
    // 4. Random available
    const available = board.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
    return available[Math.floor(Math.random() * available.length)];
  }, []);

  const saveGameState = useCallback(() => {
    const state = {
      squares,
      xIsNext,
      scores,
      gameMode,
      timestamp: Date.now()
    };
    localStorage.setItem('tictactoe-game-state', JSON.stringify(state));
    console.log('=== SAVE ===', state);
    console.log('=== SAVE GAME STATE ===', 'tictactoe-game-state', JSON.stringify(state));
  }, [squares, xIsNext, scores, gameMode]);

  const loadGameState = () => {
    const saved = localStorage.getItem('tictactoe-game-state');
    console.log('=== LOAD GAME STATE ===', 'tictactoe-game-state', saved);
    if (saved) {
      const state = JSON.parse(saved);
      setSquares(state.squares);
      setXIsNext(state.xIsNext);
      setScores(state.scores);
      setGameMode(state.gameMode);
      setShowStartScreen(false);
    }
  };

  const clearGameState = () => {
    localStorage.removeItem('tictactoe-game-state');
  };

  useEffect(() => {
    const saved = localStorage.getItem('tictactoe-game-state');
    if (saved) {
      const state = JSON.parse(saved);
      // Keep scores but start a fresh grid
      setScores(state.scores);
      setGameMode(state.gameMode);
    }
    setShowStartScreen(false);
  }, []);

  useEffect(() => {
    saveGameState();
  }, [saveGameState]);

  const handleClick = useCallback(
    (i: number) => {
      if (squares[i] || winner || (gameMode === "computer" && !xIsNext)) return;
      
      const newSquares = squares.slice();
      newSquares[i] = "X";
      setSquares(newSquares);
      setXIsNext(false);

      const checkGameOver = (currentSquares: Player[]) => {
        const newWinner = calculateWinner(currentSquares);
        if (newWinner) {
          setScores((prev) => ({ ...prev, [newWinner]: prev[newWinner] + 1 }));
          return true;
        } else if (currentSquares.every((s) => s !== null)) {
          setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
          return true;
        }
        return false;
      };

      if (checkGameOver(newSquares)) return;

      if (gameMode === "computer") {
        setTimeout(() => {
          const aiMove = getBestMove(newSquares);
          const aiSquares = newSquares.slice();
          aiSquares[aiMove] = "O";
          setSquares(aiSquares);
          setXIsNext(true);
          checkGameOver(aiSquares);
        }, 600);
      } else {
        setXIsNext(false);
      }
    },
    [squares, xIsNext, winner, gameMode, getBestMove]
  );

  // Re-define handleClick for "Play with Friend" mode properly
  const handleFriendClick = useCallback((i: number) => {
    if (squares[i] || winner) return;
    const newSquares = squares.slice();
    newSquares[i] = xIsNext ? "X" : "O";
    setSquares(newSquares);
    setXIsNext(!xIsNext);

    const newWinner = calculateWinner(newSquares);
    if (newWinner) {
      setScores((prev) => ({ ...prev, [newWinner]: prev[newWinner] + 1 }));
    } else if (newSquares.every((s) => s !== null)) {
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
    }
  }, [squares, xIsNext, winner]);

  const onSquareClick = gameMode === "computer" ? handleClick : handleFriendClick;

  const resetGame = useCallback(() => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    clearGameState();
  }, []);

  const handleNewGame = () => {
    clearGameState();
    setHasSavedGame(false);
    setShowStartScreen(false);
    resetGame();
    setScores({ X: 0, O: 0, draws: 0 });
  };

  const resetScores = useCallback(() => {
    setScores({ X: 0, O: 0, draws: 0 });
    resetGame();
  }, [resetGame]);

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
            {gt.ticTacToe}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <GameLanguageToggle gameKey="tictactoe" initial={locale === 'ar' ? 'ar' : 'en'} onChange={(l) => setGameLang(l)} />
          <button
            onClick={resetGame}
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
              {gt.newRound}
            </span>
          </button>
          <button
            onClick={resetScores}
            className="px-6 py-3 cursor-pointer active:scale-95 transition-transform"
            style={{
              backgroundColor: theme.surfaceElevated,
              borderRadius: theme.radiusMd,
              border: theme.cardBorder,
              outline: "none",
              fontFamily: fontFamily,
              fontSize: TYPE_SCALE.base,
              fontWeight: WEIGHT.semibold,
              color: theme.textHeading,
            }}
          >
            {gt.resetScores}
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
      <div className="flex-1 flex items-center justify-center gap-16 px-16 py-12">
        {/* Game Board */}
        <div className="flex flex-col items-center gap-8">
          {/* Status */}
          <div
            className="px-8 py-4"
            style={{
              backgroundColor: theme.primarySubtle,
              borderRadius: theme.radiusFull,
              minWidth: "280px",
              textAlign: "center",
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
              {winner ? gt.winner(winner) : isDraw ? gt.itsADraw : gt.next(xIsNext ? "X" : "O")}
            </span>
          </div>

          {/* Board */}
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(3, 180px)",
              gridTemplateRows: "repeat(3, 180px)",
            }}
          >
            {squares.map((square, i) => (
              <button
                key={i}
                onClick={() => onSquareClick(i)}
                disabled={!!square || !!winner || (gameMode === "computer" && !xIsNext)}
                className="flex items-center justify-center cursor-pointer active:scale-95 transition-all duration-200"
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: theme.radiusLg,
                  border: theme.cardBorder,
                  boxShadow: SHADOW.md,
                  outline: "none",
                }}
              >
                {square === "X" && <X size={80} color={theme.primary} strokeWidth={3} />}
                {square === "O" && <Circle size={80} color={theme.accent} strokeWidth={3} />}
              </button>
            ))}
          </div>

          {/* Game Mode Selection - Under the board */}
          <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl" style={{ backgroundColor: theme.surfaceElevated, border: theme.cardBorder }}>
            <button
              onClick={() => { setGameMode("friend"); resetScores(); }}
              className="px-6 py-3 rounded-xl font-bold transition-all"
              style={{
                backgroundColor: gameMode === "friend" ? theme.primary : "transparent",
                color: gameMode === "friend" ? theme.textInverse : theme.textMuted,
                fontSize: TYPE_SCALE.sm
              }}
            >
              {gt.playWithFriend}
            </button>
            <button
              onClick={() => { setGameMode("computer"); resetScores(); }}
              className="px-6 py-3 rounded-xl font-bold transition-all"
              style={{
                backgroundColor: gameMode === "computer" ? theme.primary : "transparent",
                color: gameMode === "computer" ? theme.textInverse : theme.textMuted,
                fontSize: TYPE_SCALE.sm
              }}
            >
              {gt.playWithComputer}
            </button>
          </div>
        </div>

        {/* Scoreboard */}
        <div
          className="flex flex-col gap-6 px-10 py-8"
          style={{
            backgroundColor: theme.surface,
            borderRadius: theme.radiusCard,
            border: theme.cardBorder,
            boxShadow: SHADOW.md,
            minWidth: "320px",
          }}
        >
          <h2
            style={{
              fontFamily: fontFamily,
              fontSize: TYPE_SCALE.lg,
              fontWeight: WEIGHT.bold,
              color: theme.textHeading,
              textAlign: "center",
            }}
          >
            {gt.scoreboard}
          </h2>
          <div className="flex flex-col gap-4">
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{
                backgroundColor: theme.primarySubtle,
                borderRadius: theme.radiusMd,
              }}
            >
              <div className="flex items-center gap-3">
                <X size={28} color={theme.primary} strokeWidth={3} />
                <span
                  style={{
                    fontFamily: fontFamily,
                    fontSize: TYPE_SCALE.md,
                    fontWeight: WEIGHT.semibold,
                    color: theme.textHeading,
                  }}
                >
                  {gameMode === "computer" ? gt.youX : gt.playerX}
                </span>
              </div>
              <span
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.lg,
                  fontWeight: WEIGHT.bold,
                  color: theme.primary,
                }}
              >
                {scores.X}
              </span>
            </div>
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{
                backgroundColor: theme.accentSubtle,
                borderRadius: theme.radiusMd,
              }}
            >
              <div className="flex items-center gap-3">
                <Circle size={28} color={theme.accent} strokeWidth={3} />
                <span
                  style={{
                    fontFamily: fontFamily,
                    fontSize: TYPE_SCALE.md,
                    fontWeight: WEIGHT.semibold,
                    color: theme.textHeading,
                  }}
                >
                  {gameMode === "computer" ? gt.computerO : gt.playerO}
                </span>
              </div>
              <span
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.lg,
                  fontWeight: WEIGHT.bold,
                  color: theme.accent,
                }}
              >
                {scores.O}
              </span>
            </div>
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{
                backgroundColor: theme.surfaceElevated,
                borderRadius: theme.radiusMd,
              }}
            >
              <span
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.md,
                  fontWeight: WEIGHT.semibold,
                  color: theme.textHeading,
                }}
              >
                {gt.draws}
              </span>
              <span
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.lg,
                  fontWeight: WEIGHT.bold,
                  color: theme.textMuted,
                }}
              >
                {scores.draws}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Win/Draw Notification */}
      {(winner || isDraw) && (
        <div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4 px-10 py-5"
          style={{
            backgroundColor: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(12px)",
            borderRadius: theme.radiusLg,
            border: "1px solid rgba(255,255,255,0.1)",
            animation: "slideUp 0.3s ease-out",
          }}
        >
          {winner && <Trophy size={32} color="#FFD700" />}
          <span
            style={{
              fontFamily: fontFamily,
              fontSize: TYPE_SCALE.md,
              fontWeight: WEIGHT.bold,
              color: "#fff",
            }}
          >
            {winner ? gt.playerWins(winner) : gt.drawMessage}
          </span>
        </div>
      )}

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

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}