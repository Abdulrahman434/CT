import { useState, useCallback, useEffect } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "../ThemeContext";
import { useLocale } from "../i18n";
import { Trophy, RotateCcw, Shuffle, ArrowLeft } from "lucide-react";

interface Tile {
  id: number;
  currentPosition: number;
  correctPosition: number;
}

const GRID_SIZE = 3; // 3x3 puzzle
const TILE_COUNT = GRID_SIZE * GRID_SIZE;

export function JigsawPuzzleGame({ onClose, onBackToGames }: { onClose: () => void; onBackToGames: () => void }) {
  const { theme } = useTheme();
  const { fontFamily } = useLocale();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const initializeGame = useCallback(() => {
    // Create tiles array
    const initialTiles: Tile[] = Array.from({ length: TILE_COUNT }, (_, i) => ({
      id: i,
      currentPosition: i,
      correctPosition: i,
    }));

    // Shuffle tiles
    const shuffled = [...initialTiles];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Update current positions after shuffle
    shuffled.forEach((tile, index) => {
      tile.currentPosition = index;
    });

    setTiles(shuffled);
    setMoves(0);
    setIsComplete(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const checkWin = useCallback((currentTiles: Tile[]) => {
    return currentTiles.every((tile) => tile.currentPosition === tile.correctPosition);
  }, []);

  const handleTileClick = useCallback(
    (clickedIndex: number) => {
      const emptyIndex = tiles.findIndex((tile) => tile.id === TILE_COUNT - 1);
      const clickedTile = tiles[clickedIndex];

      // Check if clicked tile is adjacent to empty space
      const emptyRow = Math.floor(emptyIndex / GRID_SIZE);
      const emptyCol = emptyIndex % GRID_SIZE;
      const clickedRow = Math.floor(clickedIndex / GRID_SIZE);
      const clickedCol = clickedIndex % GRID_SIZE;

      const isAdjacent =
        (Math.abs(emptyRow - clickedRow) === 1 && emptyCol === clickedCol) ||
        (Math.abs(emptyCol - clickedCol) === 1 && emptyRow === clickedRow);

      if (isAdjacent) {
        const newTiles = [...tiles];
        const emptyTile = newTiles[emptyIndex];

        // Swap positions
        const tempPosition = clickedTile.currentPosition;
        clickedTile.currentPosition = emptyTile.currentPosition;
        emptyTile.currentPosition = tempPosition;

        // Swap in array
        [newTiles[clickedIndex], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[clickedIndex]];

        setTiles(newTiles);
        setMoves(moves + 1);

        if (checkWin(newTiles)) {
          setIsComplete(true);
        }
      }
    },
    [tiles, moves, checkWin]
  );

  const getTileColor = (tileId: number) => {
    const colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A",
      "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B739"
    ];
    return colors[tileId];
  };

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
            Sliding Puzzle
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
              Moves: {moves}
            </span>
          </div>
          <button
            onClick={initializeGame}
            className="flex items-center gap-2 px-6 py-3 cursor-pointer active:scale-95 transition-transform"
            style={{
              backgroundColor: theme.primary,
              borderRadius: theme.radiusMd,
              border: "none",
              outline: "none",
            }}
          >
            <Shuffle size={20} color={theme.textInverse} />
            <span
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.base,
                fontWeight: WEIGHT.semibold,
                color: theme.textInverse,
              }}
            >
              Shuffle
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

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center px-16 py-12">
        <div className="flex gap-16 items-center">
          {/* Current Puzzle */}
          <div className="flex flex-col items-center gap-6">
            <div
              className="px-6 py-2"
              style={{
                backgroundColor: theme.surfaceElevated,
                borderRadius: theme.radiusFull,
              }}
            >
              <span
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.base,
                  fontWeight: WEIGHT.semibold,
                  color: theme.textMuted,
                }}
              >
                Current Puzzle
              </span>
            </div>
            <div
              className="grid gap-3 p-6"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, 180px)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 180px)`,
                backgroundColor: theme.surface,
                borderRadius: theme.radiusCard,
                border: theme.cardBorder,
                boxShadow: SHADOW.md,
              }}
            >
              {tiles.map((tile, index) => (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(index)}
                  disabled={tile.id === TILE_COUNT - 1}
                  className="flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-95 select-none"
                  style={{
                    backgroundColor: tile.id === TILE_COUNT - 1 ? "transparent" : getTileColor(tile.id),
                    borderRadius: theme.radiusMd,
                    border: tile.id === TILE_COUNT - 1 ? "2px dashed rgba(255,255,255,0.1)" : "none",
                    boxShadow: tile.id === TILE_COUNT - 1 ? "none" : SHADOW.sm,
                    outline: "none",
                    opacity: tile.id === TILE_COUNT - 1 ? 0.3 : 1,
                    WebkitTapHighlightColor: "transparent",
                    touchAction: "manipulation",
                  }}
                >
                  {tile.id !== TILE_COUNT - 1 && (
                    <span
                      style={{
                        fontFamily: fontFamily,
                        fontSize: "72px",
                        fontWeight: WEIGHT.extrabold,
                        color: "#fff",
                        textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      {tile.id + 1}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Solution Reference */}
          <div className="flex flex-col items-center gap-6">
            <div
              className="px-6 py-2"
              style={{
                backgroundColor: theme.primarySubtle,
                borderRadius: theme.radiusFull,
              }}
            >
              <span
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.base,
                  fontWeight: WEIGHT.semibold,
                  color: theme.primary,
                }}
              >
                Solution
              </span>
            </div>
            <div
              className="grid gap-2 p-4"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, 120px)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 120px)`,
                backgroundColor: theme.surface,
                borderRadius: theme.radiusCard,
                border: theme.cardBorder,
                boxShadow: SHADOW.sm,
                opacity: 0.5,
              }}
            >
              {Array.from({ length: TILE_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center"
                  style={{
                    backgroundColor: i === TILE_COUNT - 1 ? "transparent" : getTileColor(i),
                    borderRadius: theme.radiusSm,
                    border: i === TILE_COUNT - 1 ? "2px dashed rgba(255,255,255,0.1)" : "none",
                  }}
                >
                  {i !== TILE_COUNT - 1 && (
                    <span
                      style={{
                        fontFamily: fontFamily,
                        fontSize: "48px",
                        fontWeight: WEIGHT.bold,
                        color: "#fff",
                        textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      {i + 1}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
              Puzzle Solved! 🎉
            </h2>
            <p
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.md,
                fontWeight: WEIGHT.medium,
                color: theme.textMuted,
              }}
            >
              You completed the puzzle in {moves} moves!
            </p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={initializeGame}
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
                Play Again
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}