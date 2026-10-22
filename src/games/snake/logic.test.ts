import { describe, expect, it } from "vitest";
import { createSnake, tickSnake } from "./logic";

describe("snake", () => {
  it("grows and scores a combo when eating the next chain food", () => {
    const s = createSnake();
    s.snake = [
      { x: 11, y: 4 },
      { x: 10, y: 4 },
    ];
    s.dir = { x: 1, y: 0 };
    s.pending = { x: 1, y: 0 };
    s.nextSeq = 0;
    const len = s.snake.length;
    tickSnake(s);
    expect(s.alive).toBe(true);
    expect(s.snake.length).toBe(len + 1);
    expect(s.combo).toBe(1);
    expect(s.score).toBe(10);
    expect(s.nextSeq).toBe(1);
  });

  it("dies on wall collision", () => {
    const s = createSnake();
    s.snake = [{ x: 0, y: 0 }];
    s.dir = { x: -1, y: 0 };
    s.pending = { x: -1, y: 0 };
    tickSnake(s);
    expect(s.alive).toBe(false);
  });
});
