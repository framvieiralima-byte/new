import { useFrame, useThree } from '@react-three/fiber';
import { useGame } from '../context/GameContext';

const HEIGHT = 14;
const SMOOTH = 0.08;

/**
 * Camera that follows the player from a top-down angle.
 */
export default function FollowCamera() {
  const camera = useThree((s) => s.camera);
  const { playerPosition } = useGame();

  useFrame(() => {
    camera.position.x += (playerPosition.x - camera.position.x) * SMOOTH;
    camera.position.y += (HEIGHT - camera.position.y) * SMOOTH;
    camera.position.z += (playerPosition.z + 2 - camera.position.z) * SMOOTH;
    camera.lookAt(playerPosition.x, 0, playerPosition.z);
    camera.updateMatrixWorld();
  });

  return null;
}
