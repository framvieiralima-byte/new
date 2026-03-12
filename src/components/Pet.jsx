import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, MeshWobbleMaterial } from '@react-three/drei';
import { useGame } from '../context/GameContext';
import { useGameStore, FORMATION_OFFSETS } from '../store/gameStore';

const LERP_FACTOR = 5;
const PET_BASE_HEIGHT = 0.4;
const BOBBING_AMPLITUDE = 0.06;
const BOBBING_SPEED = 4;
const ORBIT_RADIUS = 1.8;
const ORBIT_SPEED = 1.2;
const ORBIT_MOVE_LERP = 4;

const STAGE_SCALE = {
  Baby: 0.5,
  Teen: 1,
  Mega: 2,
};

const LEVEL_UP_POP_DURATION = 0.35;
const LEVEL_UP_POP_SCALE = 1.5;

/**
 * Compute formation target in world space from player position and facing.
 * offset: { x, z } in player-local space (+x = right, +z = forward).
 */
function formationTarget(playerPosition, playerFacing, offset) {
  const cos = Math.cos(playerFacing);
  const sin = Math.sin(playerFacing);
  const worldX = playerPosition.x + offset.x * cos - offset.z * sin;
  const worldZ = playerPosition.z + offset.x * sin + offset.z * cos;
  return { x: worldX, z: worldZ };
}

function lerp(a, b, t) {
  return a + (b - a) * Math.min(1, t);
}

/**
 * Single pet that follows the player with formation offset, lerp movement, and bobbing.
 * Evolution: Baby (1–3) → Teen (4–9) → Mega (10+).
 */
export default function Pet({ index = 0 }) {
  const groupRef = useRef(null);
  const orbitAngleRef = useRef(0);
  const prevLevelRef = useRef(1);
  const levelUpStartRef = useRef(null);

  const { playerPosition, playerFacing, isPlayerMoving, petStats } = useGame();
  const setPetPosition = useGameStore((s) => s.setPetPosition);

  const evolutionStage =
    petStats.level < 4 ? 'Baby' : petStats.level < 10 ? 'Teen' : 'Mega';
  const baseScale = STAGE_SCALE[evolutionStage];
  const offset = FORMATION_OFFSETS[index] ?? { x: 0, z: 0 };

  useEffect(() => {
    if (petStats.level > prevLevelRef.current) {
      levelUpStartRef.current = performance.now() / 1000;
      prevLevelRef.current = petStats.level;
    }
  }, [petStats.level]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const elapsed = state.clock.elapsedTime;

    // Level-up pop
    let scaleMult = 1;
    if (levelUpStartRef.current != null) {
      const levelElapsed = performance.now() / 1000 - levelUpStartRef.current;
      if (levelElapsed < LEVEL_UP_POP_DURATION) {
        const t = levelElapsed / LEVEL_UP_POP_DURATION;
        scaleMult = 1 + (LEVEL_UP_POP_SCALE - 1) * (1 - t);
      } else {
        levelUpStartRef.current = null;
      }
    }
    group.scale.setScalar(baseScale * scaleMult);

    // Bobbing: phase offset per pet so they don't all bob in sync
    const bob = Math.sin(elapsed * BOBBING_SPEED + index * 1.5) * BOBBING_AMPLITUDE;
    group.position.y = PET_BASE_HEIGHT + bob;

    let targetX, targetZ;
    if (isPlayerMoving) {
      const t = formationTarget(playerPosition, playerFacing, offset);
      targetX = t.x;
      targetZ = t.z;
      orbitAngleRef.current = Math.atan2(
        group.position.z - playerPosition.z,
        group.position.x - playerPosition.x
      );
    } else {
      orbitAngleRef.current += delta * ORBIT_SPEED;
      const t = formationTarget(playerPosition, playerFacing, offset);
      const orbitX = playerPosition.x + Math.cos(orbitAngleRef.current) * ORBIT_RADIUS;
      const orbitZ = playerPosition.z + Math.sin(orbitAngleRef.current) * ORBIT_RADIUS;
      targetX = lerp(t.x, orbitX, 0.5);
      targetZ = lerp(t.z, orbitZ, 0.5);
    }

    const speed = isPlayerMoving ? LERP_FACTOR : ORBIT_MOVE_LERP;
    group.position.x = lerp(group.position.x, targetX, speed * delta);
    group.position.z = lerp(group.position.z, targetZ, speed * delta);

    const dx = targetX - group.position.x;
    const dz = targetZ - group.position.z;
    if (dx !== 0 || dz !== 0) {
      group.rotation.y = Math.atan2(-dx, -dz);
    }

    setPetPosition(index, { x: group.position.x, z: group.position.z });
  });

  const isMega = evolutionStage === 'Mega';
  const isTeen = evolutionStage === 'Teen';
  const initialPos = formationTarget(playerPosition, playerFacing, offset);

  return (
    <group
      ref={groupRef}
      position={[initialPos.x, PET_BASE_HEIGHT, initialPos.z]}
    >
      <RoundedBox
        args={[0.5, 0.5, 0.5]}
        radius={0.08}
        smoothness={4}
        castShadow
        receiveShadow
      >
        {isMega ? (
          <MeshWobbleMaterial
            color="#ffd700"
            factor={0.4}
            speed={4}
            roughness={0.2}
            metalness={0.3}
            emissive="#ffaa00"
            emissiveIntensity={0.4}
          />
        ) : (
          <meshStandardMaterial
            color={evolutionStage === 'Baby' ? '#ff8a65' : '#ff8a65'}
            roughness={0.6}
            metalness={0.1}
          />
        )}
      </RoundedBox>
      {isTeen && <Horns />}
    </group>
  );
}

function Horns() {
  return (
    <group position={[0, 0.4, 0]}>
      <mesh position={[-0.15, 0.35, 0]} rotation={[0, 0, Math.PI * 0.3]}>
        <coneGeometry args={[0.06, 0.2, 3]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.6} />
      </mesh>
      <mesh position={[0.15, 0.35, 0]} rotation={[0, 0, -Math.PI * 0.3]}>
        <coneGeometry args={[0.06, 0.2, 3]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.6} />
      </mesh>
    </group>
  );
}
