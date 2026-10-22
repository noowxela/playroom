import * as THREE from "three";
import { drawPixelText } from "./pixelFont";

export type CrtPhase = "off" | "bars" | "load";

export function createCrtScreen() {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 240;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable");
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  const draw = (
    time: number,
    phase: CrtPhase,
    load: number,
    title = "PLAYROOM",
  ) => {
    if (phase === "off") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 320, 240);
      texture.needsUpdate = true;
      return;
    }

    if (phase === "bars") {
      drawBars(ctx, time, load);
      texture.needsUpdate = true;
      return;
    }

    drawPs2Load(ctx, time, load, title);
    texture.needsUpdate = true;
  };

  draw(0, "off", 0);
  return { canvas, texture, draw };
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  time: number,
  local: number,
) {
  const w = 320;
  const h = 240;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);

  if (local < 0.14) {
    const thick = Math.max(1, (local / 0.14) * 10);
    ctx.fillStyle = "#f3f3f3";
    ctx.fillRect(0, h / 2 - thick / 2, w, thick);
    return;
  }

  if (local < 0.32) {
    const u = (local - 0.14) / 0.18;
    const hh = Math.max(10, u * h);
    ctx.fillStyle = "#ececec";
    ctx.fillRect(0, h / 2 - hh / 2, w, hh);
    ctx.fillStyle = "#111111";
    for (let y = h / 2 - hh / 2; y < h / 2 + hh / 2; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }
    return;
  }

  const offset = time * 110;
  for (let y = 0; y < h; y += 1) {
    const band = Math.floor((y + offset) / 7) % 2;
    ctx.fillStyle = band ? "#f1f1f1" : "#0c0c0c";
    ctx.fillRect(0, y, w, 1);
  }
  for (let i = 0; i < 90; i += 1) {
    const x = Math.floor((Math.sin(time * 9 + i * 3.1) * 0.5 + 0.5) * w);
    const y = Math.floor((Math.cos(time * 7 + i * 1.7) * 0.5 + 0.5) * h);
    ctx.fillStyle = i % 2 ? "#ffffff" : "#000000";
    ctx.fillRect(x, y, 2, 1);
  }
}

function drawPs2Load(
  ctx: CanvasRenderingContext2D,
  time: number,
  load: number,
  title: string,
) {
  const w = 320;
  const h = 240;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#161616";
  ctx.fillRect(0, 52, w, 1);

  const spin = time * 2.2;
  ctx.save();
  ctx.translate(160, 88);
  ctx.rotate(spin);
  ctx.strokeStyle = "#e8e8e8";
  ctx.lineWidth = 2;
  ctx.strokeRect(-10, -10, 20, 20);
  ctx.restore();

  drawPixelText(ctx, "PLAYROOM", 92, 118, 4, "#f2f2f2");
  drawPixelText(ctx, title, 160 - title.length * 8, 148, 3, "#b0b0b0");
  drawPixelText(ctx, "NOW LOADING", 68, 176, 3, "#e6e6e6");

  const barX = 48;
  const barY = 202;
  const barW = 224;
  ctx.strokeStyle = "#e8e8e8";
  ctx.strokeRect(barX + 0.5, barY + 0.5, barW, 10);
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(barX + 2, barY + 2, Math.max(0, (barW - 4) * load), 6);

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  for (let y = 0; y < h; y += 2) ctx.fillRect(0, y, w, 1);
}
