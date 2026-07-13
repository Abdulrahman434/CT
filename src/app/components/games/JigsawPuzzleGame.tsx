import { ImageJigsawGame } from "./ImageJigsawGame";

export function JigsawPuzzleGame({ onClose, onBackToGames }: { onClose: () => void; onBackToGames: () => void }) {
  return <ImageJigsawGame onClose={onClose} onBackToGames={onBackToGames} />;
}
