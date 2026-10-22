import type { GameId } from "../theme";

const keyFor = (id: GameId) => `playroom:highscore:${id}`;

export function readBest(id: GameId): number {
  try {
    const raw = localStorage.getItem(keyFor(id));
    const n = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function writeBest(id: GameId, score: number): number {
  const best = Math.max(readBest(id), Math.max(0, Math.floor(score)));
  try {
    localStorage.setItem(keyFor(id), String(best));
  } catch {
    /* private mode */
  }
  return best;
}
