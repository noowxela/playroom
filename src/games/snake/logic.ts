export type Point = { x: number; y: number };

export const SNAKE_COLS = 18;
export const SNAKE_ROWS = 14;

export type ChainFood = { pos: Point; seq: number };

export type SnakeState = {
  snake: Point[];
  dir: Point;
  pending: Point;
  chain: ChainFood[];
  nextSeq: number;
  combo: number;
  fruit: { pos: Point; ttl: number } | null;
  fruitCooldown: number;
  score: number;
  alive: boolean;
  tickMs: number;
};

function eq(a: Point, b: Point) {
  return a.x === b.x && a.y === b.y;
}

function occupied(state: SnakeState, p: Point) {
  if (state.snake.some((s) => eq(s, p))) return true;
  if (state.chain.some((c) => eq(c.pos, p))) return true;
  if (state.fruit && eq(state.fruit.pos, p)) return true;
  return false;
}

function randomEmpty(state: SnakeState): Point {
  for (let i = 0; i < 80; i += 1) {
    const p = {
      x: Math.floor(Math.random() * SNAKE_COLS),
      y: Math.floor(Math.random() * SNAKE_ROWS),
    };
    if (!occupied(state, p)) return p;
  }
  return { x: 0, y: 0 };
}

export function createSnake(): SnakeState {
  const state: SnakeState = {
    snake: [
      { x: 6, y: 7 },
      { x: 5, y: 7 },
      { x: 4, y: 7 },
    ],
    dir: { x: 1, y: 0 },
    pending: { x: 1, y: 0 },
    chain: [],
    nextSeq: 0,
    combo: 0,
    fruit: null,
    fruitCooldown: 10,
    score: 0,
    alive: true,
    tickMs: 140,
  };
  state.chain = [
    { pos: { x: 12, y: 4 }, seq: 0 },
    { pos: { x: 10, y: 10 }, seq: 1 },
    { pos: { x: 14, y: 8 }, seq: 2 },
  ];
  return state;
}

export function queueDir(state: SnakeState, dir: Point) {
  if (dir.x === -state.dir.x && dir.y === -state.dir.y) return;
  if (dir.x === 0 && dir.y === 0) return;
  state.pending = dir;
}

export function tickSnake(state: SnakeState) {
  if (!state.alive) return;
  state.dir = state.pending;
  const head = state.snake[0];
  const next = { x: head.x + state.dir.x, y: head.y + state.dir.y };
  if (
    next.x < 0 ||
    next.y < 0 ||
    next.x >= SNAKE_COLS ||
    next.y >= SNAKE_ROWS ||
    state.snake.some((s) => eq(s, next))
  ) {
    state.alive = false;
    return;
  }

  state.snake.unshift(next);
  let grew = false;

  const food = state.chain.find((c) => eq(c.pos, next));
  if (food) {
    grew = true;
    if (food.seq === state.nextSeq) {
      state.combo += 1;
      state.score += 10 * state.combo;
      state.nextSeq = (state.nextSeq + 1) % 3;
    } else {
      state.combo = 0;
      state.score += 2;
    }
    food.pos = randomEmpty(state);
  }

  if (state.fruit && eq(state.fruit.pos, next)) {
    grew = true;
    state.score += 40;
    state.fruit = null;
    state.fruitCooldown = 12;
  }

  if (!grew) state.snake.pop();

  state.fruitCooldown -= 1;
  if (state.fruit) {
    state.fruit.ttl -= 1;
    if (state.fruit.ttl <= 0) {
      state.fruit = null;
      state.fruitCooldown = 8;
    }
  } else if (state.fruitCooldown <= 0) {
    state.fruit = { pos: randomEmpty(state), ttl: 18 };
    state.fruitCooldown = 16;
  }

  state.tickMs = Math.max(70, 140 - Math.floor(state.score / 40) * 4);
}
