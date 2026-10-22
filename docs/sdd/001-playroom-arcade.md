# SDD: Playroom browser arcade

- **Repo:** `playroom`
- **Status:** `implemented`
- **Date:** 2026-09-10
- **Related:** [architecture.md](../architecture.md)

## 1. Context / current architecture

`playroom/` is empty. No app, assets, or architecture. This SDD is the first product spec.

## 2. Problem and non-goals

**Problem:** Need a complete, playable in-browser arcade — not a static 3D mock. Late-80s hardware (CRT, deck, pad, carts) as a photographed object; restrained editorial chrome; three real games after a continuous camera transition.

**Non-goals:**

- Accounts, multiplayer, leaderboards beyond local high scores
- Audio soundtrack / chip-tune engine in v1 (optional later)
- Using the Tetris name, assets, or copying JTETRIS from `phaser-examples`
- Neon cyberpunk, glossy dashboard cards, heavy gradients
- Backend, CMS, or Notion
- Native apps / Electron

## 3. Questions asked and answers

| Question | Answer |
| --- | --- |
| UI language? | English editorial chrome (`PLAYROOM`, `POWER ON`, `PLAYER ONE`) + bilingual cart titles (`SNAKE / 贪吃蛇`, `BREAKOUT / 打砖块`, `BLOCKS / 方块`). Locked on plan approval. |
| Mascot marks? | Small rounded TV-head creature; **yellow T** and **white V** on the face (TV pun). Same marks on CRT idle pixels and 3D cart-top mascots. Locked on plan approval. |

## 4. Proposed approach, pros / cons, rejected alternatives

**Approach:** Vite + React 19 + TypeScript + Three.js + React Three Fiber. Static `dist/` for GitHub Pages-style hosting and Vercel.

### Art direction

| Token | Use |
| --- | --- |
| Warm off-white | Page / studio backdrop |
| Aged ivory plastic | Hardware shells |
| Charcoal | Bezels, vents, type |
| Desaturated sage | Snake cart + accents |
| Dusty terracotta | Breakout cart |
| Faded blue | Blocks cart |
| Space Grotesk | Titles |
| DM Mono | Small labels, tech callouts |

Plenty of whitespace, hairline rules, compact nav. No neon, no glassmorphism cards, no stacked gradients.

### 3D hero (product still)

Load **four separate GLBs** from `public/models/`:

| File | Role |
| --- | --- |
| `crt.glb` | CRT, named `Screen`, `Bezel`, `CrtBody` |
| `console.glb` | Deck, named `CartridgeSlot`, `PowerLed`, `PortAv`, `PortController`, `ConsoleBody` |
| `controller.glb` | Pad, named `PadBody`, `DPad`, `Buttons` |
| `cartridge.glb` | Shared cart mesh, cloned; named `CartBody`, `LabelPanel`, `MascotAnchor` |

Layout (camera facing the set): CRT prominent **right**, console **left**, one cart standing **seated in the slot**, controller **in front**. Arced cables with ends in real ports (AV CRT↔console, controller cable into `PortController`). Soft directional light, contact shadows, rounded edges, slightly rough plastic. No mesh intersection.

Idle: slow cinematic yaw (left–right). Drag-orbit then ease back to idle. Restrained data-pulse motes near selected hardware details. `prefers-reduced-motion`: freeze idle orbit, skip pulses, shorten transitions.

CRT `Screen` uses a **runtime canvas texture** (not baked in the GLB): looping pixel idle — small mascot, faint scanlines, `PLAYER ONE`. Yellow T + white V on the face must match the 3D mascot.

### Named parts and fallbacks

Keep exported node names. Animate mascot at `MascotAnchor` (bob / blink). If a GLB fails, swap in procedural meshes with the same node names so Power On, slot, and games still work. Show a loading line; on failure, a short notice plus the fallback set.

Cart labels and CRT pixels stay **runtime textures** so type stays sharp at any resolution.

### Transition: Power On → collection

Triggers: primary **POWER ON** button, or click the console. One continuous shot — no hard camera cuts, no sudden full-screen mask:

1. Letterbox bars already cover top and bottom (stay for the whole beat).
2. Camera eases into the CRT face.
3. Animated data streams intensify.
4. Scene / overlay expands to fill the viewport.
5. Lighting eases (hero still → dimmer collection wash).
6. Three standing carts: sage Snake, terracotta Breakout, faded-blue Blocks.

### Collection

Upright carts, clear cover type, tiny looping mascot on each top. Subtle vertical bob, hover lift + soft tilt. Select via 3D pick **or** an accessible text button under each cart (keyboard-focus visible).

### Games (HTML/canvas overlay, not WebGL HUD)

Shared chrome: how-to, score, pause, restart, back to collection. Keyboard + on-screen touch controls. High scores in `localStorage` (`playroom:highscore:snake|breakout|blocks`).

| Id | Look | Play |
| --- | --- | --- |
| `snake` | Sage | Grid snake; food chain (eat in sequence for combo); timed bonus fruit |
| `breakout` | Terracotta | Several brick layouts; paddle widen and multi-ball pickups |
| `blocks` | Blue | Falling tetromino-likes; next-piece preview; ghost drop; line-clear scoring. Brand as **BLOCKS**, never Tetris |

Games pause when the tab hides. Touch: D-pad / action cluster below the playfield on narrow viewports.

### Project layout

```text
playroom/
  docs/sdd/
  public/models/{crt,console,controller,cartridge}.glb
  public/fonts/  (or Google Fonts)
  src/
    app/            # shell, routes as view state (hero | collection | game)
    scene/          # R3F hero, cables, collection, camera rig
    assets/         # GLB loader + procedural fallback
    textures/       # CRT idle + cart label canvas
    games/          # snake, breakout, blocks + shared HUD
    ui/             # POWER ON, nav, loading, reduced-motion
    styles/
  scripts/export-models.ts   # optional GLB bake from Three primitives
  index.html
  vite.config.ts
  vercel.json
```

Single-page view machine: `hero` → `powering` → `collection` → `game`. No URL maze required; optional `?view=` for deep link later.

### Deploy

`npm run build` → `dist/`. `vercel.json` SPA fallback. README: GitHub repo + Vercel import. No secrets.

**Pros:**

- Matches shichen stack (Vite + R3F); HTML stays sharp for editorial UI and games
- GLBs + named nodes keep art swappable; procedural fallback keeps the arcade playable
- Runtime label/CRT textures avoid blurry baked fonts

**Cons / risks:**

- Authoring four convincing GLBs without Blender is the long pole — bake from Three + `GLTFExporter` and keep a fallback
- Camera + letterbox timing is easy to make janky
- Cable-to-port alignment is fiddly
- Trademark: Blocks must not say Tetris

**Rejected alternatives:**

| Alternative | Why not |
| --- | --- |
| Next.js App Router | Extra SSR surface for a 100% client WebGL toy |
| Games drawn on the CRT texture | Touch controls and a11y worse; type less sharp |
| One combined GLB | Brief asks separate CRT / console / pad / cart loads |
| Phaser / canvas-only mock, no 3D | Brief is a playable product shot, not a 2D gallery |
| Clone JTETRIS | Trademark + out of scope |

## 5. Acceptance criteria and verification

- [x] Hero still coded: CRT right, console left, seated cart, pad in front, arced cables into named ports
- [x] Slow idle yaw + drag-orbit ease-back (`CameraRig`)
- [x] CRT idle canvas: mascot, scanlines, `PLAYER ONE`, yellow T + white V
- [x] POWER ON and console click share the powering dolly; letterbox is always on
- [x] Collection: three carts, mascots, bob/hover; 3D pick + text buttons
- [x] Snake: food chain + timed fruit; pause / restart / back; `localStorage` best
- [x] Breakout: three layouts; wide paddle + multi-ball
- [x] Blocks: next preview, ghost, line score; branded **BLOCKS** only
- [x] Keyboard + touch pads; `:focus-visible`; `prefers-reduced-motion`
- [x] Loading line; GLB 404 uses procedural meshes with the same node names
- [x] Responsive HUD; touch pad on coarse pointers / narrow viewports
- [x] `npm test` (8) and `npm run build` succeed; README covers GitHub + Vercel
- [ ] Full browser click-through of Power On + three games — Chrome headless aborted in this sandbox. Run `npm run dev` and walk the flow locally.

Named GLB nodes verified with `GLTFLoader.parse` (Screen, CartridgeSlot, LabelPanel, MascotAnchor, ports).

## 6. Status history

| Date | Status | Note |
| --- | --- | --- |
| 2026-09-10 | draft | Greenfield arcade spec from product brief |
| 2026-09-10 | approved | Plan approval treated as SDD approval; language and mascot locked |
| 2026-09-10 | implemented | Blender MCP GLBs + Vite arcade; unit tests + production build |
