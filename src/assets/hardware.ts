import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { PALETTE } from "../theme";

function plastic(color: string, roughness = 0.8, metalness = 0.03) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
  });
}

function mesh(
  name: string,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position?: [number, number, number],
  rotation?: [number, number, number],
) {
  const m = new THREE.Mesh(geometry, material);
  m.name = name;
  m.castShadow = true;
  m.receiveShadow = true;
  if (position) m.position.set(...position);
  if (rotation) m.rotation.set(...rotation);
  return m;
}

function empty(name: string, position: [number, number, number]) {
  const o = new THREE.Object3D();
  o.name = name;
  o.position.set(...position);
  return o;
}

function portJack(name: string, position: [number, number, number], rotation: [number, number, number]) {
  const g = new THREE.Group();
  g.name = name;
  g.position.set(...position);
  g.rotation.set(...rotation);
  const ring = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.03, 0.018, 18),
    plastic(PALETTE.charcoal, 0.45, 0.12),
  );
  ring.castShadow = true;
  const pin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.03, 12),
    plastic("#8a8680", 0.35, 0.4),
  );
  pin.position.y = 0.01;
  g.add(ring, pin);
  return g;
}

function panasonicScreen() {
  const geo = new THREE.PlaneGeometry(0.64, 0.48, 22, 16);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, 0.058 - x * x * 0.2 - y * y * 0.16);
  }
  geo.computeVertexNormals();
  return geo;
}

export function buildCrt(): THREE.Group {
  const root = new THREE.Group();
  root.name = "Crt";

  const silver = plastic(PALETTE.panasonic, 0.48, 0.08);
  const silverDark = plastic("#4f5357", 0.55, 0.06);
  const charcoal = plastic("#1a1b1d", 0.42, 0.04);
  const grille = plastic("#2c2e31", 0.7);

  root.add(
    mesh("CrtBody", new RoundedBoxGeometry(0.98, 0.9, 0.88, 5, 0.05), silver),
  );
  root.add(
    mesh(
      "CrtRear",
      new RoundedBoxGeometry(0.78, 0.7, 0.28, 3, 0.04),
      silverDark,
      [0, -0.02, -0.52],
    ),
  );
  root.add(
    mesh("Bezel", new RoundedBoxGeometry(0.82, 0.62, 0.06, 3, 0.018), charcoal, [
      0,
      0.1,
      0.42,
    ]),
  );
  const screen = mesh(
    "Screen",
    panasonicScreen(),
    new THREE.MeshStandardMaterial({
      color: "#050505",
      roughness: 0.28,
      metalness: 0.04,
      emissive: "#050505",
      emissiveIntensity: 0.15,
    }),
    [0, 0.1, 0.455],
  );
  screen.userData.canvasFlipY = true;
  root.add(screen);

  root.add(
    mesh(
      "SpeakerBar",
      new RoundedBoxGeometry(0.94, 0.18, 0.07, 2, 0.012),
      silverDark,
      [0, -0.34, 0.42],
    ),
  );
  for (let i = 0; i < 14; i += 1) {
    root.add(
      mesh(
        `Grille${i}`,
        new THREE.BoxGeometry(0.038, 0.11, 0.008),
        grille,
        [-0.36 + i * 0.052, -0.34, 0.458],
      ),
    );
  }
  root.add(
    mesh(
      "PowerKey",
      new THREE.CylinderGeometry(0.012, 0.012, 0.01, 16),
      charcoal,
      [0.4, -0.34, 0.46],
      [Math.PI / 2, 0, 0],
    ),
  );
  root.add(
    mesh("Badge", new THREE.BoxGeometry(0.12, 0.02, 0.004), charcoal, [
      0,
      -0.34,
      0.458,
    ]),
  );
  root.add(
    mesh("CrtFootL", new RoundedBoxGeometry(0.16, 0.04, 0.2, 2, 0.01), silverDark, [
      -0.32,
      -0.47,
      0.12,
    ]),
  );
  root.add(
    mesh("CrtFootR", new RoundedBoxGeometry(0.16, 0.04, 0.2, 2, 0.01), silverDark, [
      0.32,
      -0.47,
      0.12,
    ]),
  );
  root.add(
    mesh(
      "CrtVents",
      new THREE.BoxGeometry(0.02, 0.32, 0.4),
      charcoal,
      [0.5, 0.02, -0.08],
    ),
  );
  root.add(portJack("CrtJack", [-0.5, -0.16, -0.18], [0, 0, Math.PI / 2]));

  return root;
}

export function buildConsole(): THREE.Group {
  const root = new THREE.Group();
  root.name = "Console";
  const ivory = plastic(PALETTE.ivory, 0.82);
  const ivoryDark = plastic(PALETTE.ivoryDark, 0.86);
  const charcoal = plastic(PALETTE.charcoal, 0.5, 0.08);

  root.add(
    mesh("ConsoleBody", new RoundedBoxGeometry(1.18, 0.22, 0.74, 4, 0.04), ivory),
  );
  root.add(
    mesh(
      "ConsoleDeck",
      new RoundedBoxGeometry(1.12, 0.03, 0.58, 2, 0.012),
      ivoryDark,
      [0, 0.11, -0.02],
    ),
  );
  root.add(
    mesh(
      "SlotWell",
      new RoundedBoxGeometry(0.16, 0.08, 0.22, 2, 0.01),
      charcoal,
      [0.14, 0.14, 0.02],
    ),
  );
  root.add(empty("CartridgeSlot", [0.14, 0.2, 0.02]));

  const led = mesh(
    "PowerLed",
    new THREE.SphereGeometry(0.014, 12, 12),
    new THREE.MeshStandardMaterial({
      color: PALETTE.led,
      emissive: PALETTE.led,
      emissiveIntensity: 0.65,
      roughness: 0.3,
    }),
    [-0.46, 0.12, 0.28],
  );
  root.add(led);

  root.add(portJack("PortAv", [0.46, 0.0, -0.38], [Math.PI / 2, 0, 0]));
  root.add(portJack("PortController", [-0.08, 0.0, 0.38], [-Math.PI / 2, 0, 0]));

  root.add(
    mesh(
      "Door",
      new RoundedBoxGeometry(0.34, 0.02, 0.28, 2, 0.008),
      ivory,
      [-0.28, 0.125, 0.02],
    ),
  );

  return root;
}

export function buildController(): THREE.Group {
  const root = new THREE.Group();
  root.name = "Controller";
  const ivory = plastic(PALETTE.ivory, 0.8);
  const charcoal = plastic(PALETTE.charcoal, 0.48, 0.06);

  root.add(
    mesh("PadBody", new RoundedBoxGeometry(0.46, 0.065, 0.2, 4, 0.02), ivory),
  );

  const dpad = new THREE.Group();
  dpad.name = "DPad";
  dpad.position.set(-0.13, 0.038, 0);
  const dMat = charcoal;
  dpad.add(mesh("DPadH", new RoundedBoxGeometry(0.09, 0.02, 0.032, 2, 0.004), dMat));
  dpad.add(mesh("DPadV", new RoundedBoxGeometry(0.032, 0.02, 0.09, 2, 0.004), dMat));
  root.add(dpad);

  const buttons = new THREE.Group();
  buttons.name = "Buttons";
  buttons.position.set(0.14, 0.04, 0.01);
  buttons.add(
    mesh("ButtonA", new THREE.CylinderGeometry(0.018, 0.018, 0.012, 16), dMat, [
      0.028,
      0,
      0.016,
    ]),
  );
  buttons.add(
    mesh("ButtonB", new THREE.CylinderGeometry(0.018, 0.018, 0.012, 16), dMat, [
      -0.02,
      0,
      -0.018,
    ]),
  );
  root.add(buttons);
  root.add(portJack("PadJack", [0, 0.0, -0.11], [Math.PI / 2, 0, 0]));

  return root;
}

export function buildCartridge(): THREE.Group {
  const root = new THREE.Group();
  root.name = "Cartridge";
  const bodyMat = plastic(PALETTE.sage, 0.78);
  const charcoal = plastic(PALETTE.charcoal, 0.55);

  root.add(
    mesh("CartBody", new RoundedBoxGeometry(0.12, 0.168, 0.028, 3, 0.008), bodyMat),
  );
  root.add(
    mesh("CartRidge", new RoundedBoxGeometry(0.126, 0.018, 0.034, 2, 0.004), bodyMat, [
      0,
      0.078,
      0,
    ]),
  );
  root.add(
    mesh("CartConnector", new THREE.BoxGeometry(0.09, 0.028, 0.012), charcoal, [
      0,
      -0.09,
      0,
    ]),
  );
  const label = mesh(
    "LabelPanel",
    new THREE.PlaneGeometry(0.096, 0.112),
    new THREE.MeshStandardMaterial({
      color: "#efe8dc",
      roughness: 0.55,
    }),
    [0, 0.01, 0.015],
  );
  label.userData.canvasFlipY = true;
  root.add(label);
  root.add(empty("MascotAnchor", [0, 0.108, 0]));

  return root;
}

export const HARDWARE_BUILDERS = {
  crt: buildCrt,
  console: buildConsole,
  controller: buildController,
  cartridge: buildCartridge,
} as const;

export type HardwareName = keyof typeof HARDWARE_BUILDERS;

export const REQUIRED_NAMES: Record<HardwareName, string[]> = {
  crt: ["Screen", "Bezel", "CrtBody", "CrtJack"],
  console: [
    "CartridgeSlot",
    "PowerLed",
    "PortAv",
    "PortController",
    "ConsoleBody",
  ],
  controller: ["PadBody", "DPad", "Buttons", "PadJack"],
  cartridge: ["CartBody", "LabelPanel", "MascotAnchor"],
};

export function ensureNamedParts(root: THREE.Object3D, kind: HardwareName) {
  const fallback = HARDWARE_BUILDERS[kind]();
  for (const name of REQUIRED_NAMES[kind]) {
    if (!root.getObjectByName(name)) {
      const piece = fallback.getObjectByName(name);
      if (piece) root.add(piece.clone(true));
    }
  }
}

export function cloneGroup(src: THREE.Object3D): THREE.Group {
  const cloned = src.clone(true) as THREE.Group;
  cloned.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      const mat = obj.material;
      obj.material = Array.isArray(mat) ? mat.map((m) => m.clone()) : mat.clone();
    }
  });
  return cloned;
}

export function tintCart(root: THREE.Object3D, color: string) {
  const body = root.getObjectByName("CartBody");
  if (body instanceof THREE.Mesh) {
    const mat = body.material;
    if (Array.isArray(mat)) {
      mat.forEach((m) => {
        if ("color" in m) (m as THREE.MeshStandardMaterial).color.set(color);
      });
    } else if ("color" in mat) {
      (mat as THREE.MeshStandardMaterial).color.set(color);
    }
  }
  const ridge = root.getObjectByName("CartRidge");
  if (ridge instanceof THREE.Mesh && "color" in ridge.material) {
    (ridge.material as THREE.MeshStandardMaterial).color.set(color);
  }
}

export function applyCanvasTexture(
  object: THREE.Object3D,
  nodeName: string,
  texture: THREE.CanvasTexture,
) {
  const node = object.getObjectByName(nodeName);
  if (!(node instanceof THREE.Mesh)) return;
  texture.colorSpace = THREE.SRGBColorSpace;
  if ("canvasFlipY" in node.userData) {
    texture.flipY = Boolean(node.userData.canvasFlipY);
  }
  texture.needsUpdate = true;
  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.42,
    metalness: 0.02,
    emissive: "#ffffff",
    emissiveMap: texture,
    emissiveIntensity: nodeName === "Screen" ? 0.55 : 0.12,
  });
  node.material = mat;
}
