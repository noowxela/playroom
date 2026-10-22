import { useCallback, useEffect, useState } from "react";
import { gameById, type GameId } from "../theme";
import { BlocksGame } from "./blocks/BlocksGame";
import { BreakoutGame } from "./breakout/BreakoutGame";
import { readBest, writeBest } from "./scores";
import { SnakeGame } from "./snake/SnakeGame";

type Props = {
  id: GameId;
  leaving?: boolean;
  onBack: () => void;
};

export function GameShell({ id, leaving = false, onBack }: Props) {
  const meta = gameById(id);
  const [paused, setPaused] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => readBest(id));
  const [over, setOver] = useState(false);

  useEffect(() => {
    setScore(0);
    setOver(false);
    setPaused(false);
    setBest(readBest(id));
  }, [id, restartKey]);

  const onScore = useCallback(
    (next: number, isOver: boolean) => {
      setScore(next);
      setBest(writeBest(id, next));
      if (isOver) setOver(true);
    },
    [id],
  );

  useEffect(() => {
    const hide = () => {
      if (document.hidden) setPaused(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onBack();
        return;
      }
      if (e.target instanceof HTMLElement && e.target.closest("button")) return;
      if (e.key === "p" || e.key === "P" || e.code === "Space") {
        if (e.code === "Space") e.preventDefault();
        setPaused((v) => !v);
      }
    };
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("keydown", onKey);
    };
  }, [onBack]);

  const restart = () => {
    setRestartKey((n) => n + 1);
    setPaused(false);
    setOver(false);
    setScore(0);
  };

  return (
    <section
      className={leaving ? "game-overlay is-leaving" : "game-overlay"}
      aria-label={`${meta.title} game`}
      aria-hidden={leaving}
    >
      <header className="game-bar">
        <button type="button" className="desk-back" onClick={onBack}>
          ← Desk
        </button>
        <div className="game-bar-copy">
          <p className="kicker">{meta.catalog}</p>
          <h2>
            {meta.title} / {meta.subtitle}
          </h2>
          <p>{meta.howTo}</p>
        </div>
        <div className="game-bar-tools">
          <div className="score-row">
            <span className="score-chip">Score {score}</span>
            <span className="score-chip">Best {best}</span>
          </div>
          <div className="game-actions">
            <button type="button" onClick={() => setPaused((v) => !v)}>
              {paused ? "Resume" : "Pause"}
            </button>
            <button type="button" onClick={restart}>
              Restart
            </button>
          </div>
        </div>
      </header>
      <div className="playfield-wrap">
        {id === "snake" && (
          <SnakeGame paused={paused || over || leaving} restartKey={restartKey} onScore={onScore} />
        )}
        {id === "breakout" && (
          <BreakoutGame paused={paused || over || leaving} restartKey={restartKey} onScore={onScore} />
        )}
        {id === "blocks" && (
          <BlocksGame paused={paused || over || leaving} restartKey={restartKey} onScore={onScore} />
        )}
        {(paused || over) && (
          <div className="overlay-msg">{over ? "Game over" : "Paused"}</div>
        )}
      </div>
    </section>
  );
}
