# Playroom

A playable late-80s hardware arcade in the browser: product-shot CRT, deck, pad, and carts, then three games (Snake, Breakout, Blocks).

## Run locally

```bash
npm install
npm run dev
```

Primary GLBs are authored in Blender (`scripts/blender_hardware.py` / `blender/playroom_hardware.blend`). `npm run export-models` only writes missing files unless `FORCE_MODELS=1`.

```bash
npm test
npm run build
npm run preview
```

Live site: [noowxela.github.io/playroom](https://noowxela.github.io/playroom/).

## Deploy

GitHub Actions publishes `dist/` from `main` to GitHub Pages. Local builds stay at `/`.

`vercel.json` still rewrites unknown paths to `index.html` for a Vercel import. The app itself is one page, so Pages does not need that rewrite.

## Controls

| Game | Keyboard | Touch |
| --- | --- | --- |
| Snake | Arrows / WASD | D-pad |
| Breakout | Arrows / A D, click-drag | Left / right, drag playfield |
| Blocks | Arrows / WASD, Up rotate, Space hard drop (when not pausing the shell), Shift soft drop | Move, rotate, down, drop |

Space pauses in the game shell. Best scores stay in `localStorage` (`playroom:highscore:*`).
