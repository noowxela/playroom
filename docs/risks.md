# Risks

- The Pages site is served at `/playroom/`. Renaming the GitHub repo without changing the Vite `base` breaks script, style, and GLB URLs.
- If a GLB request fails, the scene substitutes procedural hardware. The page still opens, but it is no longer the Blender still.
- The UI loads Space Grotesk and DM Mono from Google Fonts. A blocked font request falls back to the browser’s default face.
