import Environment from './Environment';
import Player from './Player';
import Pet from './Pet';
import Coins from './Coins';
import FollowCamera from './FollowCamera';

/**
 * 3D pet simulator world:
 * - Player (box) moved with WASD
 * - Pet (rounded box) follows player with delay
 * - 10 collectible coins (yellow spheres); pet collects on touch, UI counter updates
 * - Green floor, sun light, top-down follow camera
 */
export default function World() {
  return (
    <>
      <Environment />
      <Player />
      <Pet />
      <Coins />
      <FollowCamera />
    </>
  );
}
