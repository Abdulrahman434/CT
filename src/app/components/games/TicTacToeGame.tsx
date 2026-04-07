import { useState, useCallback } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "../ThemeContext";
import { useLocale } from "../i18n";
import { Trophy, RotateCcw, Circle, X, ArrowLeft } from "lucide-react";

type Player = "X" | "O" | null;

function calculateWinner(squares: Player[]): Player {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
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
  const { fontFamily } = useLocale();
  const [squares, setSquares] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every((square) => square !== null);

  const handleClick = useCallback(
    (i: number) => {
      if (squares[i] || winner) return;
      const newSquares = squares.slice();
      newSquares[i] = xIsNext ? "X" : "O";
      setSquares(newSquares);
      setXIsNext(!xIsNext);

      // Check if this move wins
      const newWinner = calculateWinner(newSquares);
      if (newWinner) {
        setTimeout(() => {
          setScores((prev) => ({
            ...prev,
            [newWinner]: prev[newWinner] + 1,
          }));
        }, 500);
      } else if (newSquares.every((square) => square !== null)) {
        // Draw
        setTimeout(() => {
          setScores((prev) => ({
            ...prev,
            draws: prev.draws + 1,
          }));
        }, 500);
      }
    },
    [squares, xIsNext, winner]
  );

  const resetGame = useCallback(() => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  }, []);

  const resetScores = useCallback(() => {
    setScores({ X: 0, O: 0, draws: 0 });
    resetGame();
  }, [resetGame]);

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
            Tic-Tac-Toe
          </h1>
        </div>
        <div className="flex items-center gap-4">
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
              New Round
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
            Reset Scores
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
              {winner ? `Winner: ${winner}` : isDraw ? "It's a Draw!" : `Next: ${xIsNext ? "X" : "O"}`}
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
                onClick={() => handleClick(i)}
                disabled={!!square || !!winner}
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
            Scoreboard
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
                  Player X
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
                  Player O
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
                Draws
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
            {winner ? `🎉 Player ${winner} wins!` : "🤝 It's a draw!"}
          </span>
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