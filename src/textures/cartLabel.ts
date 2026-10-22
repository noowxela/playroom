import * as THREE from "three";
import { GAMES, type GameId } from "../theme";

export function createCartLabel(id: GameId) {
  const game = GAMES.find((g) => g.id === id)!;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable");

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;

  const paint = () => {
    ctx.fillStyle = game.deep;
    ctx.fillRect(0, 0, 256, 320);
    ctx.fillStyle = "#efe8dc";
    ctx.fillRect(10, 10, 236, 300);

    ctx.fillStyle = game.color;
    ctx.fillRect(10, 10, 236, 8);
    ctx.fillRect(10, 302, 236, 8);

    ctx.fillStyle = "#2b2724";
    ctx.font = "600 36px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(game.title, 128, 130);

    ctx.font = "400 22px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#4a453f";
    ctx.fillText(game.subtitle, 128, 168);

    ctx.font = "400 13px 'DM Mono', monospace";
    ctx.fillStyle = "rgba(43, 39, 36, 0.55)";
    ctx.fillText(game.catalog, 128, 250);
    ctx.fillText("PLAYROOM · 8-BIT", 128, 274);

    texture.needsUpdate = true;
  };

  const ready = document.fonts?.ready ?? Promise.resolve();
  void ready.then(paint);
  paint();
  return texture;
}
