import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PALETTE } from "../theme";

function bezierPoint(
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
  t: number,
  out: THREE.Vector3,
) {
  const u = 1 - t;
  out.set(
    u * u * a.x + 2 * u * t * b.x + t * t * c.x,
    u * u * a.y + 2 * u * t * b.y + t * t * c.y,
    u * u * a.z + 2 * u * t * b.z + t * t * c.z,
  );
  return out;
}

type CableSpec = {
  start: THREE.Vector3;
  mid: THREE.Vector3;
  end: THREE.Vector3;
};

function Cable({ start, mid, end }: CableSpec) {
  const geom = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return new THREE.TubeGeometry(curve, 32, 0.011, 8, false);
  }, [start, mid, end]);
  return (
    <mesh geometry={geom} castShadow>
      <meshStandardMaterial
        color={PALETTE.cable}
        roughness={0.42}
        metalness={0.08}
      />
    </mesh>
  );
}

export function Cables({
  av,
  pad,
}: {
  av: CableSpec;
  pad: CableSpec;
}) {
  return (
    <group>
      <Cable {...av} />
      <Cable {...pad} />
    </group>
  );
}

export function DataPulses({
  av,
  pad,
  intensityRef,
  reducedMotion,
}: {
  av: CableSpec;
  pad: CableSpec;
  intensityRef: { current: number };
  reducedMotion: boolean;
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: PALETTE.sage,
        emissive: PALETTE.sage,
        emissiveIntensity: 0.35,
        roughness: 0.4,
      }),
    [],
  );
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    const intensity = intensityRef.current;
    const speed = 0.06 + intensity * 0.2;
    mat.emissiveIntensity = 0.28 + intensity * 0.55;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const cable = i < 6 ? av : pad;
      const u = (t * speed + i * 0.09) % 1;
      bezierPoint(cable.start, cable.mid, cable.end, u, tmp);
      mesh.position.copy(tmp);
      const s = 1 + intensity * 0.45;
      mesh.scale.setScalar(s);
    });
  });

  if (reducedMotion) return null;

  return (
    <group>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh
          key={i}
          ref={(node) => {
            refs.current[i] = node;
          }}
          material={mat}
        >
          <sphereGeometry args={[0.012, 8, 8]} />
        </mesh>
      ))}
    </group>
  );
}

export function cableFrom(
  start: THREE.Vector3,
  end: THREE.Vector3,
  lift: number,
): CableSpec {
  const mid = start.clone().lerp(end, 0.48);
  mid.y += lift;
  mid.z += lift * 0.15;
  return { start: start.clone(), mid, end: end.clone() };
}
