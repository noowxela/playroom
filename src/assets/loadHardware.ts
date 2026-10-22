import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  HARDWARE_BUILDERS,
  cloneGroup,
  ensureNamedParts,
  type HardwareName,
} from "./hardware";

export type HardwareSet = {
  crt: THREE.Group;
  console: THREE.Group;
  controller: THREE.Group;
  cartridge: THREE.Group;
};

const NAMES: HardwareName[] = ["crt", "console", "controller", "cartridge"];

function asGroup(obj: THREE.Object3D): THREE.Group {
  if (obj instanceof THREE.Group) return obj;
  const g = new THREE.Group();
  g.name = obj.name || "Root";
  g.add(obj);
  return g;
}

export async function loadHardware(): Promise<{
  models: HardwareSet;
  failures: HardwareName[];
}> {
  const loader = new GLTFLoader();
  const failures: HardwareName[] = [];
  const models = {} as HardwareSet;

  await Promise.all(
    NAMES.map(async (name) => {
      try {
        const gltf = await loader.loadAsync(
          `${import.meta.env.BASE_URL}models/${name}.glb`,
        );
        const group = asGroup(gltf.scene);
        group.traverse((obj) => {
          obj.castShadow = true;
          obj.receiveShadow = true;
          if (obj instanceof THREE.Mesh) {
            const screenish =
              obj.name === "Screen" || obj.name === "LabelPanel";
            if (screenish) obj.userData.canvasFlipY = false;
          }
        });
        ensureNamedParts(group, name);
        models[name] = group;
      } catch {
        failures.push(name);
        models[name] = HARDWARE_BUILDERS[name]();
      }
    }),
  );

  return { models, failures };
}

export function makeCarts(template: THREE.Group, count: number) {
  return Array.from({ length: count }, () => cloneGroup(template));
}
