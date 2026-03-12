import { useFrame } from '@react-three/fiber';
import { useGame } from '../context/GameContext';
import { useGameStore } from '../store/gameStore';

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
 * 10 yellow sphere coins. When any equipped pet touches one, it disappears and the counter updates.
 */
export default function Coins() {
  const { collectedCoinIds, collectCoin } = useGame();
  const petPositions = useGameStore((s) => s.petPositions);

  useFrame(() => {
    const positions = petPositions?.length ? petPositions : [{ x: 0, z: 0 }];
    COIN_POSITIONS.forEach(([x, z], id) => {
      if (collectedCoinIds.includes(id)) return;
      for (const pos of positions) {
        const dx = pos.x - x;
        const dz = pos.z - z;
        if (Math.sqrt(dx * dx + dz * dz) < COLLECT_RADIUS) {
          collectCoin(id);
          return;
        }
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
