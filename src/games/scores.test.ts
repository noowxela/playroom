import { describe, expect, it } from "vitest";
import { readBest, writeBest } from "./scores";

describe("high scores", () => {
  it("stores a best score and never decreases it", () => {
    localStorage.removeItem("playroom:highscore:snake");
    expect(readBest("snake")).toBe(0);
    expect(writeBest("snake", 120)).toBe(120);
    expect(writeBest("snake", 40)).toBe(120);
    expect(readBest("snake")).toBe(120);
  });
});
