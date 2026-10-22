export const COLS = 10;
export const ROWS = 20;

export type Cell = number | null;
export type Shape = number[][];
export type Piece = { type: number; x: number; y: number; rot: number };

const SHAPES: Shape[] = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
];

export const PIECE_COLORS = [
  "#6a7d90",
  "#8a9aa8",
  "#5d6b55",
  "#b07a5c",
  "#7d8c73",
  "#4f6173",
  "#c4b49a",
];

export type BlocksState = {
  grid: Cell[][];
  current: Piece;
  nextType: number;
  score: number;
  lines: number;
  over: boolean;
  dropMs: number;
};

function rotateShape(shape: Shape): Shape {
  const h = shape.length;
  const w = shape[0].length;
  const out: Shape = Array.from({ length: w }, () => Array(h).fill(0));
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      out[x][h - 1 - y] = shape[y][x];
    }
  }
  return out;
}

export function shapeOf(type: number, rot: number): Shape {
  let s = SHAPES[type];
  const n = ((rot % 4) + 4) % 4;
  for (let i = 0; i < n; i += 1) s = rotateShape(s);
  return s;
}

function emptyGrid(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));
}

function collides(grid: Cell[][], piece: Piece) {
  const shape = shapeOf(piece.type, piece.rot);
  for (let y = 0; y < shape.length; y += 1) {
    for (let x = 0; x < shape[y].length; x += 1) {
      if (!shape[y][x]) continue;
      const gx = piece.x + x;
      const gy = piece.y + y;
      if (gx < 0 || gx >= COLS || gy >= ROWS) return true;
      if (gy >= 0 && grid[gy][gx] !== null) return true;
    }
  }
  return false;
}

function spawn(type: number): Piece {
  const shape = shapeOf(type, 0);
  return {
    type,
    rot: 0,
    x: Math.floor((COLS - shape[0].length) / 2),
    y: 0,
  };
}

export function createBlocks(): BlocksState {
  const first = Math.floor(Math.random() * SHAPES.length);
  const next = Math.floor(Math.random() * SHAPES.length);
  const current = spawn(first);
  const grid = emptyGrid();
  return {
    grid,
    current,
    nextType: next,
    score: 0,
    lines: 0,
    over: collides(grid, current),
    dropMs: 720,
  };
}

export function ghostY(state: BlocksState): number {
  const p = { ...state.current };
  while (!collides(state.grid, { ...p, y: p.y + 1 })) p.y += 1;
  return p.y;
}

function lock(state: BlocksState) {
  const shape = shapeOf(state.current.type, state.current.rot);
  for (let y = 0; y < shape.length; y += 1) {
    for (let x = 0; x < shape[y].length; x += 1) {
      if (!shape[y][x]) continue;
      const gy = state.current.y + y;
      const gx = state.current.x + x;
      if (gy < 0) {
        state.over = true;
        return;
      }
      state.grid[gy][gx] = state.current.type;
    }
  }
  let cleared = 0;
  state.grid = state.grid.filter((row) => {
    const full = row.every((c) => c !== null);
    if (full) cleared += 1;
    return !full;
  });
  while (state.grid.length < ROWS) {
    state.grid.unshift(Array<Cell>(COLS).fill(null));
  }
  const table = [0, 100, 300, 500, 800];
  state.score += table[cleared] ?? 800;
  state.lines += cleared;
  state.dropMs = Math.max(140, 720 - state.lines * 18);
  state.current = spawn(state.nextType);
  state.nextType = Math.floor(Math.random() * SHAPES.length);
  if (collides(state.grid, state.current)) state.over = true;
}

export function moveBlocks(state: BlocksState, dx: number) {
  if (state.over) return;
  const next = { ...state.current, x: state.current.x + dx };
  if (!collides(state.grid, next)) state.current = next;
}

export function rotateBlocks(state: BlocksState) {
  if (state.over) return;
  const kicks = [0, -1, 1, -2, 2];
  for (const k of kicks) {
    const next = {
      ...state.current,
      rot: state.current.rot + 1,
      x: state.current.x + k,
    };
    if (!collides(state.grid, next)) {
      state.current = next;
      return;
    }
  }
}

export function softDrop(state: BlocksState) {
  if (state.over) return false;
  const next = { ...state.current, y: state.current.y + 1 };
  if (!collides(state.grid, next)) {
    state.current = next;
    state.score += 1;
    return true;
  }
  lock(state);
  return false;
}

export function hardDrop(state: BlocksState) {
  if (state.over) return;
  while (softDrop(state)) {
    state.score += 1;
  }
}

export function tickBlocks(state: BlocksState) {
  if (state.over) return;
  const next = { ...state.current, y: state.current.y + 1 };
  if (!collides(state.grid, next)) state.current = next;
  else lock(state);
}

export function cellsOf(piece: Piece): Point[] {
  const shape = shapeOf(piece.type, piece.rot);
  const out: Point[] = [];
  for (let y = 0; y < shape.length; y += 1) {
    for (let x = 0; x < shape[y].length; x += 1) {
      if (shape[y][x]) out.push({ x: piece.x + x, y: piece.y + y });
    }
  }
  return out;
}

type Point = { x: number; y: number };
