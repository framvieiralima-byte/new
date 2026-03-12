import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, MeshWobbleMaterial } from '@react-three/drei';
import { useGame } from '../context/GameContext';

const FOLLOW_SPEED = 3;
const PET_BASE_HEIGHT = 0.4;
const BOUNCE_AMPLITUDE = 0.06;
const BOUNCE_SPEED = 6;
const ORBIT_RADIUS = 1.8;
const ORBIT_SPEED = 1.2;
const ORBIT_MOVE_SPEED = 4;

const STAGE_SCALE = {
  Baby: 0.5,
  Teen: 1,
  Mega: 2,
};

const LEVEL_UP_POP_DURATION = 0.35;
const LEVEL_UP_POP_SCALE = 1.5;

/**
 * Pet that follows the player. Evolution: Baby (1–3) → Teen (4–9) → Mega (10+).
 * Gains 20 EXP per coin; every 100 EXP = level up. Level-up pop effect.
 */
export default function Pet() {
  const groupRef = useRef(null);
  const timeRef = useRef(0);
  const orbitAngleRef = useRef(0);
  const prevLevelRef = useRef(1);
  const levelUpStartRef = useRef(null);

  const { playerPosition, isPlayerMoving, setPetPosition, petStats } = useGame();

  const evolutionStage =
    petStats.level < 4 ? 'Baby' : petStats.level < 10 ? 'Teen' : 'Mega';
  const baseScale = STAGE_SCALE[evolutionStage];

  // Detect level up and start pop animation
  useEffect(() => {
    if (petStats.level > prevLevelRef.current) {
      levelUpStartRef.current = performance.now() / 1000;
      prevLevelRef.current = petStats.level;
    }
  }, [petStats.level]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    timeRef.current += delta;

    // Level-up pop: briefly scale to 1.5x then lerp back
    let scaleMult = 1;
    if (levelUpStartRef.current != null) {
      const elapsed = performance.now() / 1000 - levelUpStartRef.current;
      if (elapsed < LEVEL_UP_POP_DURATION) {
        const t = elapsed / LEVEL_UP_POP_DURATION;
        scaleMult = 1 + (LEVEL_UP_POP_SCALE - 1) * (1 - t);
      } else {
        levelUpStartRef.current = null;
      }
    }
    const finalScale = baseScale * scaleMult;
    group.scale.setScalar(finalScale);

    // Idle bounce (always on)
    const bounceY = Math.sin(timeRef.current * BOUNCE_SPEED) * BOUNCE_AMPLITUDE;
    group.position.y = PET_BASE_HEIGHT + bounceY;

    let targetX, targetZ;

    if (isPlayerMoving) {
      targetX = playerPosition.x;
      targetZ = playerPosition.z;
      orbitAngleRef.current = Math.atan2(
        group.position.z - playerPosition.z,
        group.position.x - playerPosition.x
      );
    } else {
      orbitAngleRef.current += delta * ORBIT_SPEED;
      targetX = playerPosition.x + Math.cos(orbitAngleRef.current) * ORBIT_RADIUS;
      targetZ = playerPosition.z + Math.sin(orbitAngleRef.current) * ORBIT_RADIUS;
    }

    const dx = targetX - group.position.x;
    const dz = targetZ - group.position.z;
    const speed = isPlayerMoving ? FOLLOW_SPEED : ORBIT_MOVE_SPEED;
    group.position.x += dx * Math.min(1, speed * delta);
    group.position.z += dz * Math.min(1, speed * delta);

    if (dx !== 0 || dz !== 0) {
      group.rotation.y = Math.atan2(-dx, -dz);
    }

    setPetPosition({ x: group.position.x, z: group.position.z });
  });

  const isMega = evolutionStage === 'Mega';
  const isTeen = evolutionStage === 'Teen';

  return (
    <group
      ref={groupRef}
      position={[playerPosition.x, PET_BASE_HEIGHT, playerPosition.z]}
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

/** Two small horn triangles on top for Teen stage */
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
