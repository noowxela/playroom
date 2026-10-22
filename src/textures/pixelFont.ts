type Glyph = readonly [number, number, number, number, number];

const GLYPHS: Record<string, Glyph> = {
  A: [0b010, 0b101, 0b111, 0b101, 0b101],
  B: [0b110, 0b101, 0b110, 0b101, 0b110],
  C: [0b011, 0b100, 0b100, 0b100, 0b011],
  D: [0b110, 0b101, 0b101, 0b101, 0b110],
  E: [0b111, 0b100, 0b110, 0b100, 0b111],
  F: [0b111, 0b100, 0b110, 0b100, 0b100],
  G: [0b011, 0b100, 0b101, 0b101, 0b011],
  H: [0b101, 0b101, 0b111, 0b101, 0b101],
  I: [0b111, 0b010, 0b010, 0b010, 0b111],
  J: [0b111, 0b001, 0b001, 0b101, 0b010],
  K: [0b101, 0b101, 0b110, 0b101, 0b101],
  L: [0b100, 0b100, 0b100, 0b100, 0b111],
  M: [0b101, 0b111, 0b111, 0b101, 0b101],
  N: [0b101, 0b111, 0b111, 0b111, 0b101],
  O: [0b010, 0b101, 0b101, 0b101, 0b010],
  P: [0b111, 0b101, 0b111, 0b100, 0b100],
  Q: [0b010, 0b101, 0b101, 0b111, 0b011],
  R: [0b110, 0b101, 0b110, 0b101, 0b101],
  S: [0b011, 0b100, 0b010, 0b001, 0b110],
  T: [0b111, 0b010, 0b010, 0b010, 0b010],
  U: [0b101, 0b101, 0b101, 0b101, 0b111],
  V: [0b101, 0b101, 0b101, 0b101, 0b010],
  W: [0b101, 0b101, 0b111, 0b111, 0b101],
  X: [0b101, 0b101, 0b010, 0b101, 0b101],
  Y: [0b101, 0b101, 0b010, 0b010, 0b010],
  Z: [0b111, 0b001, 0b010, 0b100, 0b111],
  " ": [0, 0, 0, 0, 0],
};

export function drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  originX: number,
  originY: number,
  pixel: number,
  color: string,
) {
  ctx.fillStyle = color;
  let x = originX;
  for (const ch of text.toUpperCase()) {
    const glyph = GLYPHS[ch] ?? GLYPHS[" "];
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        if (glyph[row] & (1 << (2 - col))) {
          ctx.fillRect(x + col * pixel, originY + row * pixel, pixel, pixel);
        }
      }
    }
    x += 4 * pixel;
  }
}

export function drawMascotFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  p: number,
  blink: boolean,
) {
  ctx.fillStyle = "#2b2724";
  ctx.fillRect(x, y, p * 12, p * 10);
  ctx.fillStyle = "#1b2416";
  ctx.fillRect(x + p, y + p, p * 10, p * 8);

  ctx.fillStyle = "#e6c54a";
  ctx.fillRect(x + p * 2, y + p * 2, p * 4, p);
  ctx.fillRect(x + p * 3.5, y + p * 2, p, p * 5);

  ctx.fillStyle = "#f4f1ea";
  ctx.fillRect(x + p * 7, y + p * 2, p, p * 3);
  ctx.fillRect(x + p * 9, y + p * 2, p, p * 3);
  ctx.fillRect(x + p * 8, y + p * 5, p, p * 2);

  if (!blink) {
    ctx.fillStyle = "#d7c9a8";
    ctx.fillRect(x + p * 3, y + p * 7, p, p);
    ctx.fillRect(x + p * 8, y + p * 7, p, p);
  } else {
    ctx.fillStyle = "#2b2724";
    ctx.fillRect(x + p * 2, y + p * 7, p * 8, p);
  }
}
