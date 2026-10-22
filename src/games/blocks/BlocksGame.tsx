import { useEffect, useRef } from "react";
import {
  COLS,
  PIECE_COLORS,
  ROWS,
  cellsOf,
  createBlocks,
  ghostY,
  hardDrop,
  moveBlocks,
  rotateBlocks,
  shapeOf,
  softDrop,
  tickBlocks,
  type BlocksState,
} from "./logic";

type Props = {
  paused: boolean;
  restartKey: number;
  onScore: (score: number, over: boolean) => void;
};

const CELL = 18;

export function BlocksGame({ paused, restartKey, onScore }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<BlocksState>(createBlocks());

  useEffect(() => {
    stateRef.current = createBlocks();
    onScore(0, false);
  }, [restartKey, onScore]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        moveBlocks(s, -1);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        moveBlocks(s, 1);
      } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        rotateBlocks(s);
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        softDrop(s);
        onScore(s.score, s.over);
      } else if (e.key === "Enter") {
        e.preventDefault();
        hardDrop(s);
        onScore(s.score, s.over);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let acc = 0;
    let last = performance.now();
    let raf = 0;

    const drawCell = (x: number, y: number, color: string, alpha = 1) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
      ctx.globalAlpha = 1;
    };

    const draw = () => {
      const s = stateRef.current;
      ctx.fillStyle = "#efeae1";
      ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
      for (let y = 0; y < ROWS; y += 1) {
        for (let x = 0; x < COLS; x += 1) {
          const cell = s.grid[y][x];
          if (cell !== null) drawCell(x, y, PIECE_COLORS[cell]);
        }
      }
      const gy = ghostY(s);
      cellsOf({ ...s.current, y: gy }).forEach((p) => {
        if (p.y >= 0) drawCell(p.x, p.y, PIECE_COLORS[s.current.type], 0.28);
      });
      cellsOf(s.current).forEach((p) => {
        if (p.y >= 0) drawCell(p.x, p.y, PIECE_COLORS[s.current.type]);
      });
    };

    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      const s = stateRef.current;
      if (!paused && !s.over) {
        acc += dt;
        if (acc >= s.dropMs) {
          acc = 0;
          tickBlocks(s);
          onScore(s.score, s.over);
        }
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [paused, onScore]);

  const nextNow = shapeOf(stateRef.current.nextType, 0);

  return (
    <div className="blocks-layout">
      <canvas
        ref={canvasRef}
        width={COLS * CELL}
        height={ROWS * CELL}
        aria-label="Blocks playfield"
      />
      <aside className="blocks-side">
        <p className="kicker">Next</p>
        <div className="next-grid" aria-hidden>
          {Array.from({ length: 16 }, (_, i) => {
            const x = i % 4;
            const y = Math.floor(i / 4);
            const on = Boolean(nextNow[y]?.[x]);
            return <span key={i} className={on ? "next-cell on" : "next-cell"} />;
          })}
        </div>
        <p className="kicker">Lines {stateRef.current.lines}</p>
      </aside>
      <div className="touch-pad" aria-hidden>
        <button type="button" onPointerDown={() => moveBlocks(stateRef.current, -1)}>
          Left
        </button>
        <button type="button" onPointerDown={() => rotateBlocks(stateRef.current)}>
          Rotate
        </button>
        <button type="button" onPointerDown={() => moveBlocks(stateRef.current, 1)}>
          Right
        </button>
        <button
          type="button"
          onPointerDown={() => {
            hardDrop(stateRef.current);
            onScore(stateRef.current.score, stateRef.current.over);
          }}
        >
          Drop
        </button>
      </div>
    </div>
  );
}
