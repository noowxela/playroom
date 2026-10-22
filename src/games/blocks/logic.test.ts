import { describe, expect, it } from "vitest";
import {
  COLS,
  createBlocks,
  moveBlocks,
  rotateBlocks,
  shapeOf,
  tickBlocks,
} from "./logic";

describe("blocks", () => {
  it("keeps a 10-wide well and a next piece", () => {
    const s = createBlocks();
    expect(s.grid[0]).toHaveLength(COLS);
    expect(s.nextType).toBeGreaterThanOrEqual(0);
    expect(s.nextType).toBeLessThan(7);
  });

  it("rotation stays inside the well with kicks", () => {
    const s = createBlocks();
    s.current = { type: 0, x: 0, y: 0, rot: 0 };
    rotateBlocks(s);
    const shape = shapeOf(s.current.type, s.current.rot);
    for (let y = 0; y < shape.length; y += 1) {
      for (let x = 0; x < shape[y].length; x += 1) {
        if (!shape[y][x]) continue;
        expect(s.current.x + x).toBeGreaterThanOrEqual(0);
        expect(s.current.x + x).toBeLessThan(COLS);
      }
    }
  });

  it("gravity drops the piece by one row", () => {
    const s = createBlocks();
    const y = s.current.y;
    tickBlocks(s);
    expect(s.current.y === y + 1 || s.over).toBe(true);
    moveBlocks(s, 0);
  });
});
