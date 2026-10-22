import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "../public/models");
mkdirSync(outDir, { recursive: true });

const names = ["crt", "console", "controller", "cartridge"] as const;

for (const name of names) {
  const dest = join(outDir, `${name}.glb`);
  if (existsSync(dest) && process.env.FORCE_MODELS !== "1") {
    console.log("skip existing", dest);
    continue;
  }
  const { HARDWARE_BUILDERS } = await import("../src/assets/hardware.ts");
  const { GLTFExporter } = await import("three/addons/exporters/GLTFExporter.js");
  const group = HARDWARE_BUILDERS[name]();
  const exporter = new GLTFExporter();
  const result = await exporter.parseAsync(group, { binary: true });
  const buffer = result instanceof ArrayBuffer ? result : Buffer.from(JSON.stringify(result));
  writeFileSync(dest, Buffer.from(buffer as ArrayBuffer));
  console.log("wrote", dest);
}
