import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { GameProvider, useGame } from './context/GameContext';
import World from './components/World';
import ProfileLoader from './components/ProfileLoader';
import './App.css';

function CoinsOverlay() {
  const { coinCountTotal, collectedCoinIds, unlockedPets } = useGame();
  return (
    <div className="coins-overlay">
      <div>Coins: <strong>{coinCountTotal}</strong> (this round: {collectedCoinIds.length} / 10)</div>
      {unlockedPets.length > 0 && (
        <div className="unlocked-pets">Pets: {unlockedPets.join(', ')}</div>
      )}
    </div>
  );
}

function IdentityForm() {
  const { identity, setIdentity } = useGame();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('username'); // 'wallet' | 'username'

  const submit = (e) => {
    e.preventDefault();
    if (input.trim()) setIdentity(mode, input.trim());
  };

  const clear = () => {
    setIdentity('', '');
    setInput('');
  };

  if (identity) {
    return (
      <div className="identity-bar">
        <span>{identity.type}: {identity.value}</span>
        <button type="button" onClick={clear} className="identity-clear">Sign out</button>
      </div>
    );
  }

  return (
    <form className="identity-form" onSubmit={submit}>
      <select value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="username">Username</option>
        <option value="wallet">Wallet</option>
      </select>
      <input
        type="text"
        placeholder={mode === 'wallet' ? '0x...' : 'Your username'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button type="submit">Save progress</button>
    </form>
  );
}

function App() {
  return (
    <GameProvider>
      <ProfileLoader />
      <div className="game-container">
        <Canvas
          shadows
          camera={{ position: [0, 14, 2], fov: 50, near: 0.1, far: 1000 }}
          gl={{ antialias: true }}
        >
          <World />
        </Canvas>
        <div className="ui-overlay">
          <IdentityForm />
          <CoinsOverlay />
        </div>
      </div>
    </GameProvider>
  );
}

export default App;
