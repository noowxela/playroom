import { useEffect, useRef } from "react";
import {
  createSnake,
  queueDir,
  tickSnake,
  SNAKE_COLS,
  SNAKE_ROWS,
  type SnakeState,
} from "./logic";

type Props = {
  paused: boolean;
  restartKey: number;
  onScore: (score: number, over: boolean) => void;
};

export function SnakeGame({ paused, restartKey, onScore }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<SnakeState>(createSnake());
  const held = useRef({ x: 0, y: 0 });

  useEffect(() => {
    stateRef.current = createSnake();
    onScore(0, false);
  }, [restartKey, onScore]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, { x: number; y: number }> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
        W: { x: 0, y: -1 },
        S: { x: 0, y: 1 },
        A: { x: -1, y: 0 },
        D: { x: 1, y: 0 },
      };
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      queueDir(stateRef.current, dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let acc = 0;
    let last = performance.now();
    let raf = 0;

    const draw = () => {
      const s = stateRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const cw = w / SNAKE_COLS;
      const ch = h / SNAKE_ROWS;
      ctx.fillStyle = "#efeae1";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(43,39,36,0.08)";
      for (let x = 0; x <= SNAKE_COLS; x += 1) {
        ctx.beginPath();
        ctx.moveTo(x * cw, 0);
        ctx.lineTo(x * cw, h);
        ctx.stroke();
      }
      for (let y = 0; y <= SNAKE_ROWS; y += 1) {
        ctx.beginPath();
        ctx.moveTo(0, y * ch);
        ctx.lineTo(w, y * ch);
        ctx.stroke();
      }
      s.chain.forEach((food) => {
        ctx.fillStyle = food.seq === s.nextSeq ? "#7d8c73" : "#c4b49a";
        ctx.fillRect(food.pos.x * cw + 2, food.pos.y * ch + 2, cw - 4, ch - 4);
        ctx.fillStyle = "#2b2724";
        ctx.font = "12px 'DM Mono', monospace";
        ctx.fillText(
          String(food.seq + 1),
          food.pos.x * cw + cw * 0.32,
          food.pos.y * ch + ch * 0.7,
        );
      });
      if (s.fruit) {
        ctx.fillStyle = "#b07a5c";
        ctx.beginPath();
        ctx.arc(
          (s.fruit.pos.x + 0.5) * cw,
          (s.fruit.pos.y + 0.5) * ch,
          Math.min(cw, ch) * 0.32,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      s.snake.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? "#5d6b55" : "#7d8c73";
        ctx.fillRect(p.x * cw + 1.5, p.y * ch + 1.5, cw - 3, ch - 3);
      });
    };

    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      if (!paused && stateRef.current.alive) {
        acc += dt;
        while (acc >= stateRef.current.tickMs) {
          acc -= stateRef.current.tickMs;
          tickSnake(stateRef.current);
          onScore(stateRef.current.score, !stateRef.current.alive);
        }
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [paused, onScore]);

  const nudge = (x: number, y: number) => {
    held.current = { x, y };
    queueDir(stateRef.current, { x, y });
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={540}
        height={420}
        aria-label="Snake playfield"
      />
      <div className="touch-pad" aria-hidden>
        <button type="button" onPointerDown={() => nudge(0, -1)}>
          Up
        </button>
        <button type="button" onPointerDown={() => nudge(-1, 0)}>
          Left
        </button>
        <button type="button" onPointerDown={() => nudge(1, 0)}>
          Right
        </button>
        <button type="button" onPointerDown={() => nudge(0, 1)}>
          Down
        </button>
      </div>
    </>
  );
}
