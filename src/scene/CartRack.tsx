import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { applyCanvasTexture, tintCart } from "../assets/hardware";
import { createCartLabel } from "../textures/cartLabel";
import { GAMES, type GameId } from "../theme";
import { Mascot } from "./Mascot";

const SLOT = new THREE.Vector3(-0.646, 0.31, 0.125);
const SLOT_YAW = 0.18;

const DOCKS: Record<GameId, { pos: THREE.Vector3; yaw: number }> = {
  snake: { pos: new THREE.Vector3(-1.34, 0.09, 0.56), yaw: 0.42 },
  breakout: { pos: new THREE.Vector3(-1.1, 0.09, 0.78), yaw: 0.16 },
  blocks: { pos: new THREE.Vector3(-0.84, 0.09, 0.54), yaw: -0.08 },
};

type Props = {
  carts: THREE.Group[];
  plugged: GameId | null;
  interactive: boolean;
  reducedMotion: boolean;
  onPlug: (id: GameId) => void;
};

export function CartRack({
  carts,
  plugged,
  interactive,
  reducedMotion,
  onPlug,
}: Props) {
  return (
    <group>
      {GAMES.map((game, i) => (
        <RackCart
          key={game.id}
          object={carts[i]}
          id={game.id}
          color={game.color}
          seated={plugged === game.id}
          interactive={interactive}
          reducedMotion={reducedMotion}
          onPlug={onPlug}
        />
      ))}
    </group>
  );
}

function RackCart({
  object,
  id,
  color,
  seated,
  interactive,
  reducedMotion,
  onPlug,
}: {
  object: THREE.Group;
  id: GameId;
  color: string;
  seated: boolean;
  interactive: boolean;
  reducedMotion: boolean;
  onPlug: (id: GameId) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const dock = DOCKS[id];

  useEffect(() => {
    tintCart(object, color);
    applyCanvasTexture(object, "LabelPanel", createCartLabel(id));
  }, [object, color, id]);

  const dest = useRef(new THREE.Vector3());

  useFrame((state, dt) => {
    const group = ref.current;
    if (!group) return;
    const target = seated ? SLOT : dock.pos;
    const yaw = seated ? SLOT_YAW : dock.yaw;
    const lift = hover && interactive && !seated ? 0.06 : 0;
    const bob =
      !seated && !reducedMotion
        ? Math.sin(state.clock.elapsedTime * 1.3 + target.x) * 0.01
        : 0;
    dest.current.copy(target);
    dest.current.y += lift + bob;
    if (reducedMotion) {
      group.position.copy(dest.current);
      group.rotation.y = yaw;
      return;
    }
    group.position.lerp(dest.current, 1 - Math.exp(-dt * 9));
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, yaw, 8, dt);
    group.rotation.x = THREE.MathUtils.damp(
      group.rotation.x,
      hover && interactive ? -0.08 : 0,
      8,
      dt,
    );
  });

  return (
    <group
      ref={ref}
      position={(seated ? SLOT : dock.pos).toArray()}
      rotation={[0, seated ? SLOT_YAW : dock.yaw, 0]}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerOver={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        onPlug(id);
      }}
    >
      <primitive object={object} />
      <group position={[0, 0.11, 0]}>
        <Mascot reducedMotion={reducedMotion} />
      </group>
    </group>
  );
}
