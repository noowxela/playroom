# SDD: GitHub and GitHub Pages for Playroom

- **Repo:** `01_project/zzz_not_active/playroom`
- **Status:** `implemented`
- **Date:** 2026-10-22
- **Related:** [architecture.md](../architecture.md), [001-playroom-arcade.md](./001-playroom-arcade.md)

## 1. Context / current architecture

Playroom is a single-page Vite + React + React Three Fiber arcade. It is not a git repo. `vite.config.ts` has no `base`. Hardware GLBs load from `/models/<name>.glb`. The README and architecture note describe a Vercel import; `vercel.json` rewrites every path to `index.html`. There is no client-side router.

## 2. Problem and non-goals

**Problem:** The arcade has no GitHub remote and no public URL.

**Non-goals:**

- Adding Playroom to the portfolio gallery
- Removing `vercel.json` or the Vercel notes
- Changing the games, the camera, or the hardware models

## 3. Questions asked and answers

| Question | Answer |
| --- | --- |
| Where should it go? | Public repo `noowxela/playroom`, Pages at `https://noowxela.github.io/playroom/`. Same shape as Shichen. |

## 4. Proposed approach, pros / cons, rejected alternatives

**Approach:** Set Vite `base` to `/playroom/` only when `GITHUB_ACTIONS` is set. Load GLBs and the favicon from `import.meta.env.BASE_URL` / `%BASE_URL%`. Add `.github/workflows/pages.yml` that builds `dist/` and deploys it. Init git, push `main`, and enable Pages with the GitHub Actions source.

**Pros:**

- Local `npm run dev` stays at `/`
- The models keep loading after the site moves under `/playroom/`
- A push to `main` republishes the site

**Cons / risks:**

- A root-absolute `/models/` URL would 404 on Pages and the scene would fall back to procedural hardware
- Renaming the repo without updating `base` breaks asset URLs
- Google Fonts are a third-party request. A blocked font falls back to the browser default

**Rejected alternatives:**

| Alternative | Why not |
| --- | --- |
| Hardcode `base: '/playroom/'` for local dev | `npm run dev` would only work under that path |
| Leave GLB URLs at `/models/` | Pages would not find the files |
| Deploy only through Vercel | The user asked for GitHub and GitHub Pages |

## 5. Acceptance criteria and verification

- [x] `https://github.com/noowxela/playroom` exists and `main` is pushed
- [x] `https://noowxela.github.io/playroom/` returns 200, with scripts under `/playroom/assets/`
- [x] The page shows the hardware still, and the GLB requests are under `/playroom/models/`
- [x] A local build without `GITHUB_ACTIONS` still emits `/assets/` and `/models/`

Verified 2026-10-22. `curl -sI https://noowxela.github.io/playroom/` is 200. The HTML loads `/playroom/assets/index-2k2r-yZv.js` and `/playroom/models/crt.glb` is 200. A local build without `GITHUB_ACTIONS` emits `/assets/` and `/favicon.svg`. In the browser the WebGL canvas is 2332×1419, all four GLBs load from `/playroom/models/`, and POWER ON opens Snake. Vitest: 8 tests passed.

## 6. Status history

| Date | Status | Note |
| --- | --- | --- |
| 2026-10-22 | approved | User asked to deploy this repo to GitHub and GitHub Pages |
| 2026-10-22 | implemented | Public repo and Pages are live at /playroom/ |
