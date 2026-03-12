import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useGame } from '../context/GameContext';

const FOLLOW_SPEED = 3;
const PET_BASE_HEIGHT = 0.4;
const BOUNCE_AMPLITUDE = 0.06;
const BOUNCE_SPEED = 6;
const ORBIT_RADIUS = 1.8;
const ORBIT_SPEED = 1.2;
const ORBIT_MOVE_SPEED = 4;

/**
 * Pet that follows the player with a slight delay.
 * - Idle: bounces up and down slightly.
 * - When player stops: circles around the player playfully.
 * - When player moves: follows the player.
 */
export default function Pet() {
  const groupRef = useRef(null);
  const timeRef = useRef(0);
  const orbitAngleRef = useRef(0);
  const { playerPosition, isPlayerMoving, setPetPosition } = useGame();

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    timeRef.current += delta;

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
        <meshStandardMaterial color="#ff8a65" roughness={0.6} metalness={0.1} />
      </RoundedBox>
    </group>
  );
}
