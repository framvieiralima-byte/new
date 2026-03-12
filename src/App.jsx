import { Canvas } from '@react-three/fiber';
import { GameProvider, useGame } from './context/GameContext';
import World from './components/World';
import './App.css';

function CoinsOverlay() {
  const { collectedCoinIds } = useGame();
  return (
    <div className="coins-overlay">
      Coins: <strong>{collectedCoinIds.length}</strong> / 10
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <div className="game-container">
        <Canvas
          shadows
          camera={{ position: [0, 14, 2], fov: 50, near: 0.1, far: 1000 }}
          gl={{ antialias: true }}
        >
          <World />
        </Canvas>
        <CoinsOverlay />
      </div>
    </GameProvider>
  );
}

export default App;
