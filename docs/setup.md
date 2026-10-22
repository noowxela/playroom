# Setup

```bash
npm install
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server at `/` |
| `npm test` | Vitest |
| `npm run build` | Typecheck, then production build into `dist/` |
| `npm run preview` | Serve the production build at `/` |
| `npm run export-models` | Write missing GLBs. `FORCE_MODELS=1` overwrites them |

No env vars are required locally.

GitHub Pages publishes `main` from `.github/workflows/pages.yml`. The live site is [https://noowxela.github.io/playroom/](https://noowxela.github.io/playroom/). On that host, Vite uses `base` `/playroom/`.
