import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { PALETTE } from "../theme";

export function Mascot({
  reducedMotion,
  scale = 1,
}: {
  reducedMotion: boolean;
  scale?: number;
}) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const bob = reducedMotion ? 0 : Math.sin(t * 2.1) * 0.008;
    ref.current.position.y = bob;
    ref.current.rotation.y = reducedMotion ? 0.2 : Math.sin(t * 1.2) * 0.15;
  });

  return (
    <group ref={ref} scale={scale}>
      <mesh position={[0, 0.028, 0]} castShadow>
        <boxGeometry args={[0.046, 0.038, 0.022]} />
        <meshStandardMaterial color={PALETTE.charcoal} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.028, 0.012]}>
        <planeGeometry args={[0.034, 0.026]} />
        <meshStandardMaterial color="#1b2416" roughness={0.4} />
      </mesh>
      <mesh position={[-0.007, 0.032, 0.013]}>
        <boxGeometry args={[0.012, 0.004, 0.002]} />
        <meshStandardMaterial
          color={PALETTE.yellowT}
          emissive={PALETTE.yellowT}
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[-0.007, 0.024, 0.013]}>
        <boxGeometry args={[0.004, 0.012, 0.002]} />
        <meshStandardMaterial
          color={PALETTE.yellowT}
          emissive={PALETTE.yellowT}
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0.008, 0.03, 0.013]} rotation={[0, 0, 0.45]}>
        <boxGeometry args={[0.003, 0.014, 0.002]} />
        <meshStandardMaterial color={PALETTE.whiteV} />
      </mesh>
      <mesh position={[0.013, 0.03, 0.013]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[0.003, 0.014, 0.002]} />
        <meshStandardMaterial color={PALETTE.whiteV} />
      </mesh>
      <mesh position={[0, 0.004, 0]} castShadow>
        <sphereGeometry args={[0.016, 12, 12]} />
        <meshStandardMaterial color={PALETTE.ivoryDark} roughness={0.8} />
      </mesh>
    </group>
  );
}
