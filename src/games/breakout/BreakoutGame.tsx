import { useEffect, useRef } from "react";
import {
  FIELD,
  createBreakout,
  launch,
  setPaddle,
  stepBreakout,
  type BreakoutState,
} from "./logic";

type Props = {
  paused: boolean;
  restartKey: number;
  onScore: (score: number, over: boolean) => void;
};

export function BreakoutGame({ paused, restartKey, onScore }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<BreakoutState>(createBreakout(0));
  const keys = useRef({ left: false, right: false });

  useEffect(() => {
    stateRef.current = createBreakout(0);
    onScore(0, false);
  }, [restartKey, onScore]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.current.left = e.type === "keydown";
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.current.right = e.type === "keydown";
      if (e.key === "ArrowUp") {
        e.preventDefault();
        launch(stateRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let last = performance.now();
    let raf = 0;

    const pointer = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * FIELD.w;
      setPaddle(stateRef.current, x);
    };

    const onPointer = (e: PointerEvent) => {
      pointer(e.clientX);
      launch(stateRef.current);
    };

    canvas.addEventListener("pointerdown", onPointer);
    canvas.addEventListener("pointermove", onPointer);

    const draw = () => {
      const s = stateRef.current;
      ctx.fillStyle = "#efeae1";
      ctx.fillRect(0, 0, FIELD.w, FIELD.h);
      s.bricks.forEach((b) => {
        ctx.fillStyle = b.hp > 1 ? "#8c5d45" : "#b07a5c";
        ctx.fillRect(b.x, b.y, b.w, b.h);
      });
      s.drops.forEach((d) => {
        ctx.fillStyle = d.kind === "wide" ? "#7d8c73" : "#6a7d90";
        ctx.fillRect(d.x - 7, d.y - 7, 14, 14);
      });
      ctx.fillStyle = "#2b2724";
      ctx.fillRect(s.paddleX - s.paddleW / 2, 300, s.paddleW, 8);
      s.balls.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const loop = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const s = stateRef.current;
      if (!paused && !s.over) {
        if (keys.current.left) setPaddle(s, s.paddleX - 280 * dt);
        if (keys.current.right) setPaddle(s, s.paddleX + 280 * dt);
        stepBreakout(s, dt);
        onScore(s.score, s.over);
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onPointer);
      canvas.removeEventListener("pointermove", onPointer);
    };
  }, [paused, onScore]);

  return (
    <>
      <canvas
        className="wide"
        ref={canvasRef}
        width={FIELD.w}
        height={FIELD.h}
        aria-label="Breakout playfield"
      />
      <div className="touch-pad" aria-hidden>
        <button
          type="button"
          onPointerDown={() => {
            keys.current.left = true;
          }}
          onPointerUp={() => {
            keys.current.left = false;
          }}
        >
          Left
        </button>
        <button type="button" onPointerDown={() => launch(stateRef.current)}>
          Launch
        </button>
        <button
          type="button"
          onPointerDown={() => {
            keys.current.right = true;
          }}
          onPointerUp={() => {
            keys.current.right = false;
          }}
        >
          Right
        </button>
        <span />
      </div>
    </>
  );
}
