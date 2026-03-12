import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '../context/GameContext';

const MOVE_SPEED = 5;
const ROTATE_SPEED = 10;
const FLOOR_Y = 0.5;

/**
 * Simple 3D Player: a box moved with WASD. Updates game context for camera and pet.
 */
export default function Player() {
  const groupRef = useRef(null);
  const targetRotationRef = useRef(0);
  const keysRef = useRef({ w: false, a: false, s: false, d: false });
  const { setPlayerPosition, setIsPlayerMoving } = useGame();

  useEffect(() => {
    const keys = keysRef.current;
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w') keys.w = true;
      if (k === 'a') keys.a = true;
      if (k === 's') keys.s = true;
      if (k === 'd') keys.d = true;
    };
    const onKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w') keys.w = false;
      if (k === 'a') keys.a = false;
      if (k === 's') keys.s = false;
      if (k === 'd') keys.d = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const group = groupRef.current;
    const keys = keysRef.current;
    if (!group) return;

    let dx = 0;
    let dz = 0;
    if (keys.w) dz -= 1;
    if (keys.s) dz += 1;
    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;

    const moving = dx !== 0 || dz !== 0;
    setIsPlayerMoving(moving);
    if (moving) {
      const len = Math.sqrt(dx * dx + dz * dz);
      dx /= len;
      dz /= len;
      targetRotationRef.current = Math.atan2(-dx, -dz);
    }

    const rot = group.rotation.y;
    let rotDelta = targetRotationRef.current - rot;
    while (rotDelta > Math.PI) rotDelta -= Math.PI * 2;
    while (rotDelta < -Math.PI) rotDelta += Math.PI * 2;
    group.rotation.y += rotDelta * Math.min(1, ROTATE_SPEED * delta);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(group.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(group.quaternion);
    const move = right
      .multiplyScalar(dx * MOVE_SPEED * delta)
      .add(forward.multiplyScalar(-dz * MOVE_SPEED * delta));
    group.position.x += move.x;
    group.position.z += move.z;
    group.position.y = FLOOR_Y;

    setPlayerPosition({ x: group.position.x, z: group.position.z });
  });

  return (
    <group ref={groupRef} position={[0, FLOOR_Y, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#4a90d9" roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  );
}
