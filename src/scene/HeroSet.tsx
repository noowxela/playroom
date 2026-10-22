import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ArcadeView } from "../app/useArcade";
import { applyCanvasTexture } from "../assets/hardware";
import { createCrtScreen, type CrtPhase } from "../textures/crtIdle";
import { GAMES, type GameId } from "../theme";
import { Cables, DataPulses, cableFrom } from "./Cables";
import { CartRack } from "./CartRack";

const CONSOLE_POS: [number, number, number] = [-0.78, 0.11, 0.08];
const CONSOLE_ROT: [number, number, number] = [0, 0.18, 0];
const CRT_POS: [number, number, number] = [0.95, 0.45, -0.22];
const CRT_ROT: [number, number, number] = [0, -0.42, 0];
const PAD_POS: [number, number, number] = [0.16, 0.033, 0.86];
const PAD_ROT: [number, number, number] = [0, 0.18, 0];

type Props = {
  crt: THREE.Group;
  console: THREE.Group;
  controller: THREE.Group;
  carts: THREE.Group[];
  view: ArcadeView;
  plugged: GameId | null;
  powerRef: MutableRefObject<number>;
  reducedMotion: boolean;
  onPowerOn: () => void;
  onPlug: (id: GameId) => void;
};

export function HeroSet({
  crt,
  console,
  controller,
  carts,
  view,
  plugged,
  powerRef,
  reducedMotion,
  onPowerOn,
  onPlug,
}: Props) {
  const root = useRef<THREE.Group>(null);
  const consoleRef = useRef<THREE.Group>(null);
  const crtRef = useRef<THREE.Group>(null);
  const padRef = useRef<THREE.Group>(null);
  const screen = useMemo(() => createCrtScreen(), []);
  const [cables, setCables] = useState<ReturnType<typeof measureCables> | null>(
    null,
  );

  useEffect(() => {
    applyCanvasTexture(crt, "Screen", screen.texture);
  }, [crt, screen.texture]);

  useLayoutEffect(() => {
    consoleRef.current?.updateMatrixWorld(true);
    crtRef.current?.updateMatrixWorld(true);
    padRef.current?.updateMatrixWorld(true);
    setCables(
      measureCables(consoleRef.current, crtRef.current, padRef.current),
    );
  }, [crt, console, controller]);

  useFrame((state) => {
    const p = powerRef.current;
    const title =
      GAMES.find((g) => g.id === plugged)?.title ?? "PLAYROOM";
    let phase: CrtPhase = "off";
    let local = 0;
    if (view === "powering" || view === "game" || view === "exiting") {
      const hold = reducedMotion ? 0.12 : 0.22;
      if (p < hold) {
        phase = "bars";
        local = hold > 0 ? p / hold : 1;
      } else {
        phase = "load";
        local = Math.min(1, (p - hold) / 0.55);
      }
    }
    screen.draw(state.clock.elapsedTime, phase, local, title);

    const screenMesh = crt.getObjectByName("Screen");
    if (screenMesh instanceof THREE.Mesh) {
      const mat = screenMesh.material;
      if (!Array.isArray(mat) && "emissiveIntensity" in mat) {
        mat.emissiveIntensity = phase === "off" ? 0.02 : 0.72;
      }
    }
    const led = console.getObjectByName("PowerLed");
    if (led instanceof THREE.Mesh) {
      const mat = led.material;
      if (!Array.isArray(mat) && "emissiveIntensity" in mat) {
        mat.emissiveIntensity = 0.06 + p * 1.04;
      }
    }
  });

  const canSwap = view === "hero";

  return (
    <group ref={root}>
      <group
        ref={consoleRef}
        position={CONSOLE_POS}
        rotation={CONSOLE_ROT}
        onClick={(e) => {
          e.stopPropagation();
          onPowerOn();
        }}
      >
        <primitive object={console} />
      </group>
      <CartRack
        carts={carts}
        plugged={plugged}
        interactive={canSwap}
        reducedMotion={reducedMotion}
        onPlug={onPlug}
      />
      <group ref={crtRef} position={CRT_POS} rotation={CRT_ROT}>
        <primitive object={crt} />
      </group>
      <group ref={padRef} position={PAD_POS} rotation={PAD_ROT}>
        <primitive object={controller} />
      </group>
      {cables && (
        <>
          <Cables av={cables.av} pad={cables.pad} />
          <DataPulses
            av={cables.av}
            pad={cables.pad}
            intensityRef={powerRef}
            reducedMotion={reducedMotion}
          />
        </>
      )}
    </group>
  );
}

function worldOf(
  obj: THREE.Object3D | undefined,
  name: string,
  fallback: THREE.Vector3,
) {
  const node = obj?.getObjectByName(name);
  if (!node) return fallback;
  const v = new THREE.Vector3();
  node.getWorldPosition(v);
  return v;
}

function measureCables(
  consoleObj: THREE.Object3D | null,
  crtObj: THREE.Object3D | null,
  padObj: THREE.Object3D | null,
) {
  const avStart = worldOf(
    consoleObj ?? undefined,
    "PortAv",
    new THREE.Vector3(-0.26, 0.11, -0.22),
  );
  const avEnd = worldOf(
    crtObj ?? undefined,
    "CrtJack",
    new THREE.Vector3(0.48, 0.31, -0.06),
  );
  const padStart = worldOf(
    consoleObj ?? undefined,
    "PortController",
    new THREE.Vector3(-0.9, 0.11, 0.44),
  );
  const padEnd = worldOf(
    padObj ?? undefined,
    "PadJack",
    new THREE.Vector3(0.18, 0.03, 0.76),
  );
  return {
    av: cableFrom(avStart, avEnd, 0.28),
    pad: cableFrom(padStart, padEnd, 0.16),
  };
}
