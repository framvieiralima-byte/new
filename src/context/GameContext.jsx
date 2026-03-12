import { createContext, useContext, useState, useCallback } from 'react';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, z: 0 });
  const [petPosition, setPetPosition] = useState({ x: 0.6, z: 0.6 });
  const [isPlayerMoving, setIsPlayerMoving] = useState(false);
  const [collectedCoinIds, setCollectedCoinIds] = useState([]);

  const collectCoin = useCallback((id) => {
    setCollectedCoinIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const value = {
    playerPosition,
    setPlayerPosition,
    petPosition,
    setPetPosition,
    isPlayerMoving,
    setIsPlayerMoving,
    collectedCoinIds,
    collectCoin,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
