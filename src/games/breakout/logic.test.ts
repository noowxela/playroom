import { describe, expect, it } from "vitest";
import { createBreakout, launch, layouts, stepBreakout } from "./logic";

describe("breakout", () => {
  it("defines three brick layouts", () => {
    expect(layouts()).toHaveLength(3);
    expect(layouts()[0].length).toBeGreaterThan(8);
  });

  it("launches the ball and keeps score at zero until a hit", () => {
    const s = createBreakout(0);
    expect(s.launched).toBe(false);
    launch(s);
    expect(s.launched).toBe(true);
    stepBreakout(s, 0.016);
    expect(s.balls[0].y).toBeLessThan(300);
  });
});
