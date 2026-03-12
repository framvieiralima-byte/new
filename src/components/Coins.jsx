import { useFrame } from '@react-three/fiber';
import { useGame } from '../context/GameContext';

const COIN_POSITIONS = [
  [-8, -6],
  [6, -8],
  [-5, 7],
  [9, 2],
  [-10, 0],
  [0, -9],
  [7, 6],
  [-7, 8],
  [4, -4],
  [-3, 5],
];

const COLLECT_RADIUS = 0.8;
const COIN_Y = 0.35;

/**
 * 10 yellow sphere coins. When the Pet touches one, it disappears and the Coins counter increases.
 */
export default function Coins() {
  const { petPosition, collectedCoinIds, collectCoin } = useGame();

  useFrame(() => {
    COIN_POSITIONS.forEach(([x, z], id) => {
      if (collectedCoinIds.includes(id)) return;
      const dx = petPosition.x - x;
      const dz = petPosition.z - z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < COLLECT_RADIUS) {
        collectCoin(id);
      }
    });
  });

  return (
    <group>
      {COIN_POSITIONS.map(([x, z], id) => {
        if (collectedCoinIds.includes(id)) return null;
        return (
          <mesh key={id} position={[x, COIN_Y, z]} castShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial
              color="#ffd700"
              metalness={0.4}
              roughness={0.3}
              emissive="#886600"
            />
          </mesh>
        );
      })}
    </group>
  );
}
