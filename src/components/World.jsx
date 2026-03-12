import Environment from './Environment';
import Player from './Player';
import Pet from './Pet';
import Coins from './Coins';
import FollowCamera from './FollowCamera';
import { useGameStore } from '../store/gameStore';

/**
 * 3D pet simulator world:
 * - Player (box) moved with WASD
 * - Multi-pet formation: each pet has an offset (left/right/back), lerp follow, bobbing
 * - 10 collectible coins; any equipped pet can collect on touch
 * - Green floor, sun light, top-down follow camera
 */
export default function World() {
  const equippedPets = useGameStore((s) => s.equippedPets);

  return (
    <>
      <Environment />
      <Player />
      {equippedPets.map((petId, index) => (
        <Pet key={`${petId}-${index}`} index={index} />
      ))}
      <Coins />
      <FollowCamera />
    </>
  );
}
