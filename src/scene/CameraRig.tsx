import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { ArcadeView } from "../app/useArcade";

const HERO_LOOK = new THREE.Vector3(0.08, 0.32, 0.12);
const HERO_RADIUS = 5.6;
const HERO_HEIGHT = 2.15;
const CRT_LOOK = new THREE.Vector3(0.82, 0.52, 0.08);
const CRT_CAM = new THREE.Vector3(0.68, 0.55, 1.15);

function smooth(t: number) {
  const x = THREE.MathUtils.clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

type Props = {
  view: ArcadeView;
  reducedMotion: boolean;
  powerRef: MutableRefObject<number>;
  onPowerComplete: () => void;
  onExitComplete: () => void;
};

export function CameraRig({
  view,
  reducedMotion,
  powerRef,
  onPowerComplete,
  onExitComplete,
}: Props) {
  const { camera, gl, invalidate } = useThree();
  const extraYaw = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const power = useRef(0);
  const fired = useRef(false);
  const exitFired = useRef(false);
  const heroPos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (view === "hero") {
      power.current = 0;
      powerRef.current = 0;
      fired.current = false;
      exitFired.current = false;
    }
    if (view === "exiting") {
      exitFired.current = false;
    }
    if (view === "powering") {
      fired.current = false;
    }
    invalidate();
  }, [view, powerRef, invalidate]);

  useEffect(() => {
    if (view !== "hero") return;
    const el = gl.domElement;
    const onDown = (e: PointerEvent) => {
      dragging.current = true;
      lastX.current = e.clientX;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      extraYaw.current = THREE.MathUtils.clamp(
        extraYaw.current + (e.clientX - lastX.current) * 0.0045,
        -0.9,
        0.9,
      );
      lastX.current = e.clientX;
    };
    const onUp = () => {
      dragging.current = false;
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [gl, view]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const idle = reducedMotion ? 0 : Math.sin(t * 0.14) * 0.18;
    if (!dragging.current) {
      extraYaw.current = THREE.MathUtils.damp(extraYaw.current, 0, 1.35, dt);
    }
    const yaw = idle + extraYaw.current;
    heroPos.set(
      HERO_LOOK.x + Math.sin(yaw) * HERO_RADIUS,
      HERO_HEIGHT,
      HERO_LOOK.z + Math.cos(yaw) * HERO_RADIUS,
    );

    if (view === "powering") {
      const duration = reducedMotion ? 1.7 : 5.4;
      power.current = Math.min(1, power.current + dt / duration);
      powerRef.current = power.current;
      if (power.current >= 1 && !fired.current) {
        fired.current = true;
        onPowerComplete();
      }
    } else if (view === "game") {
      power.current = 1;
      powerRef.current = 1;
    } else if (view === "exiting") {
      const duration = reducedMotion ? 0.9 : 2.6;
      power.current = Math.max(0, power.current - dt / duration);
      powerRef.current = power.current;
      if (power.current <= 0 && !exitFired.current) {
        exitFired.current = true;
        onExitComplete();
      }
    }

    if (view === "hero") {
      camera.position.copy(heroPos);
      camera.lookAt(HERO_LOOK);
      return;
    }

    const hold = reducedMotion ? 0.12 : 0.22;
    const toCrt = smooth((power.current - hold) / 0.55);
    camera.position.copy(heroPos).lerp(CRT_CAM, toCrt);
    look.copy(HERO_LOOK).lerp(CRT_LOOK, toCrt);
    camera.lookAt(look);
  });

  return null;
}
