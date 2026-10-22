export type Brick = {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  power?: "wide" | "multi";
};

export type Ball = { x: number; y: number; vx: number; vy: number; r: number };
export type Drop = { x: number; y: number; kind: "wide" | "multi" };

export type BreakoutState = {
  bricks: Brick[];
  balls: Ball[];
  drops: Drop[];
  paddleX: number;
  paddleW: number;
  wideTtl: number;
  launched: boolean;
  score: number;
  lives: number;
  layout: number;
  over: boolean;
  won: boolean;
};

export const FIELD = { w: 480, h: 320 };
const PADDLE_Y = 300;
const PADDLE_H = 8;

export function layouts(): Brick[][] {
  const mk = (
    rows: number,
    cols: number,
    gap: number,
    offsetY: number,
    pattern: (r: number, c: number) => boolean,
  ): Brick[] => {
    const bw = (FIELD.w - 40 - (cols - 1) * gap) / cols;
    const bh = 14;
    const out: Brick[] = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if (!pattern(r, c)) continue;
        out.push({
          x: 20 + c * (bw + gap),
          y: offsetY + r * (bh + gap),
          w: bw,
          h: bh,
          hp: 1 + (r % 2),
          power: (r + c) % 7 === 0 ? (c % 2 === 0 ? "wide" : "multi") : undefined,
        });
      }
    }
    return out;
  };
  return [
    mk(5, 8, 6, 28, () => true),
    mk(6, 9, 5, 24, (r, c) => c >= r && c < 9 - r),
    mk(6, 10, 4, 22, (r, c) => (r + c) % 2 === 0),
  ];
}

export function createBreakout(layout = 0): BreakoutState {
  const sets = layouts();
  const i = ((layout % sets.length) + sets.length) % sets.length;
  return {
    bricks: sets[i].map((b) => ({ ...b })),
    balls: [{ x: FIELD.w / 2, y: PADDLE_Y - 14, vx: 0, vy: 0, r: 5 }],
    drops: [],
    paddleX: FIELD.w / 2,
    paddleW: 72,
    wideTtl: 0,
    launched: false,
    score: 0,
    lives: 3,
    layout: i,
    over: false,
    won: false,
  };
}

export function setPaddle(state: BreakoutState, x: number) {
  const w = state.paddleW;
  state.paddleX = Math.max(w / 2, Math.min(FIELD.w - w / 2, x));
  if (!state.launched && state.balls[0]) {
    state.balls[0].x = state.paddleX;
    state.balls[0].y = PADDLE_Y - 14;
  }
}

export function launch(state: BreakoutState) {
  if (state.launched || state.over) return;
  state.launched = true;
  const ball = state.balls[0];
  ball.vx = 140;
  ball.vy = -190;
}

function bounceBallBrick(ball: Ball, brick: Brick) {
  const overlapX =
    ball.r + brick.w / 2 - Math.abs(ball.x - (brick.x + brick.w / 2));
  const overlapY =
    ball.r + brick.h / 2 - Math.abs(ball.y - (brick.y + brick.h / 2));
  if (overlapX < overlapY) ball.vx *= -1;
  else ball.vy *= -1;
}

export function stepBreakout(state: BreakoutState, dt: number) {
  if (state.over || state.won) return;
  if (state.wideTtl > 0) {
    state.wideTtl -= dt;
    if (state.wideTtl <= 0) state.paddleW = 72;
  }

  state.drops.forEach((d) => {
    d.y += 70 * dt;
  });
  state.drops = state.drops.filter((d) => {
    if (d.y > FIELD.h) return false;
    const hit =
      d.y + 6 >= PADDLE_Y &&
      d.y <= PADDLE_Y + PADDLE_H &&
      Math.abs(d.x - state.paddleX) < state.paddleW / 2 + 6;
    if (!hit) return true;
    if (d.kind === "wide") {
      state.paddleW = 110;
      state.wideTtl = 8;
    } else {
      const seed = state.balls[0];
      if (seed && state.balls.length < 3) {
        state.balls.push({
          x: seed.x,
          y: seed.y,
          vx: -seed.vx,
          vy: seed.vy,
          r: 5,
        });
      }
    }
    return false;
  });

  if (!state.launched) return;

  for (const ball of state.balls) {
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    if (ball.x < ball.r) {
      ball.x = ball.r;
      ball.vx *= -1;
    }
    if (ball.x > FIELD.w - ball.r) {
      ball.x = FIELD.w - ball.r;
      ball.vx *= -1;
    }
    if (ball.y < ball.r) {
      ball.y = ball.r;
      ball.vy *= -1;
    }
    if (
      ball.vy > 0 &&
      ball.y + ball.r >= PADDLE_Y &&
      ball.y - ball.r <= PADDLE_Y + PADDLE_H &&
      Math.abs(ball.x - state.paddleX) <= state.paddleW / 2 + ball.r
    ) {
      const t = (ball.x - state.paddleX) / (state.paddleW / 2);
      ball.vy = -Math.abs(ball.vy);
      ball.vx = t * 210;
      ball.y = PADDLE_Y - ball.r - 0.5;
    }

    for (const brick of state.bricks) {
      if (brick.hp <= 0) continue;
      const cx = brick.x + brick.w / 2;
      const cy = brick.y + brick.h / 2;
      const dx = Math.abs(ball.x - cx) - brick.w / 2;
      const dy = Math.abs(ball.y - cy) - brick.h / 2;
      if (dx < ball.r && dy < ball.r) {
        bounceBallBrick(ball, brick);
        brick.hp -= 1;
        if (brick.hp <= 0) {
          state.score += 12;
          if (brick.power) {
            state.drops.push({
              x: cx,
              y: cy,
              kind: brick.power,
            });
          }
        }
      }
    }
  }

  state.bricks = state.bricks.filter((b) => b.hp > 0);
  const before = state.balls.length;
  state.balls = state.balls.filter((b) => b.y < FIELD.h + 20);
  if (state.balls.length === 0) {
    state.lives -= 1;
    if (state.lives <= 0) {
      state.over = true;
      return;
    }
    state.launched = false;
    state.balls = [
      { x: state.paddleX, y: PADDLE_Y - 14, vx: 0, vy: 0, r: 5 },
    ];
  } else if (state.balls.length < before && state.balls.length > 0) {
    /* extra ball lost */
  }

  if (state.bricks.length === 0) {
    const next = createBreakout(state.layout + 1);
    next.score = state.score + 80;
    next.lives = state.lives;
    Object.assign(state, next);
  }
}
