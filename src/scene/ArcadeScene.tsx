import { ContactShadows } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { ArcadeView } from "../app/useArcade";
import { cloneGroup } from "../assets/hardware";
import { loadHardware, type HardwareSet } from "../assets/loadHardware";
import type { GameId } from "../theme";
import { PALETTE } from "../theme";
import { CameraRig } from "./CameraRig";
import { HeroSet } from "./HeroSet";

type Props = {
  view: ArcadeView;
  plugged: GameId | null;
  reducedMotion: boolean;
  onPowerOn: () => void;
  onPowerComplete: () => void;
  onExitComplete: () => void;
  onPlug: (id: GameId) => void;
  onLoad: (note: string, fallback: boolean) => void;
};

export function ArcadeScene(props: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      frameloop="always"
      style={{ pointerEvents: props.view === "hero" ? "auto" : "none" }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      camera={{ fov: 36, near: 0.1, far: 50, position: [0.08, 2.15, 5.72] }}
    >
      <SceneBody {...props} />
    </Canvas>
  );
}

function SceneBody({
  view,
  plugged,
  reducedMotion,
  onPowerOn,
  onPowerComplete,
  onExitComplete,
  onPlug,
  onLoad,
}: Props) {
  const [models, setModels] = useState<HardwareSet | null>(null);
  const powerRef = useRef(0);
  const reported = useRef(false);

  useEffect(() => {
    let alive = true;
    void loadHardware().then(({ models: next, failures }) => {
      if (!alive) return;
      setModels(next);
      if (!reported.current) {
        reported.current = true;
        if (failures.length === 0) onLoad("", false);
        else onLoad(`Procedural fallback for ${failures.join(", ")}`, true);
      }
    });
    return () => {
      alive = false;
    };
  }, [onLoad]);

  const carts = useMemo(() => {
    if (!models) return [];
    return [0, 1, 2].map(() => cloneGroup(models.cartridge));
  }, [models]);

  if (!models || carts.length < 3) return null;

  return (
    <>
      <Lights powerRef={powerRef} view={view} />
      <CameraRig
        view={view}
        reducedMotion={reducedMotion}
        powerRef={powerRef}
        onPowerComplete={onPowerComplete}
        onExitComplete={onExitComplete}
      />
      <HeroSet
        crt={models.crt}
        console={models.console}
        controller={models.controller}
        carts={carts}
        view={view}
        plugged={plugged}
        powerRef={powerRef}
        reducedMotion={reducedMotion}
        onPowerOn={onPowerOn}
        onPlug={onPlug}
      />
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.32}
        scale={12}
        blur={2.6}
        far={5}
        color="#4a453f"
      />
    </>
  );
}

function Lights({
  powerRef,
  view,
}: {
  powerRef: { current: number };
  view: ArcadeView;
}) {
  const key = useRef<THREE.DirectionalLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const bg = useMemo(() => new THREE.Color(PALETTE.studio), []);
  const dim = useMemo(() => new THREE.Color(PALETTE.studioDim), []);
  const mix = useMemo(() => new THREE.Color(), []);

  useFrame(({ scene }) => {
    const p = view === "hero" ? 0 : powerRef.current;
    const wash = p * p * (3 - 2 * p);
    mix.copy(bg).lerp(dim, wash);
    scene.background = mix;
    if (key.current) key.current.intensity = 1.32 - wash * 0.42;
    if (amb.current) amb.current.intensity = 0.46 - wash * 0.1;
  });

  return (
    <>
      <color attach="background" args={[PALETTE.studio]} />
      <ambientLight ref={amb} intensity={0.46} />
      <hemisphereLight args={["#f3ece2", "#b7a894", 0.3]} />
      <directionalLight
        ref={key}
        castShadow
        position={[2.15, 3.5, 2.55]}
        intensity={1.32}
        color="#fff3e4"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-camera-near={0.5}
        shadow-camera-far={14}
        shadow-camera-left={-3.5}
        shadow-camera-right={3.5}
        shadow-camera-top={3.5}
        shadow-camera-bottom={-3.5}
      />
      <directionalLight
        position={[-2.4, 1.5, 1.3]}
        intensity={0.3}
        color="#d5ddd0"
      />
    </>
  );
}
