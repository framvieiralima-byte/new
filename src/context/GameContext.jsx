import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { addCoinsToProfile } from '../lib/profiles';

const STORAGE_KEY = 'petverse_identity';

function loadIdentity() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { type, value } = JSON.parse(raw);
    if ((type === 'wallet' || type === 'username') && value) return { type, value };
  } catch (_) {}
  return null;
}

function saveIdentity(identity) {
  if (!identity) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ type: identity.type, value: identity.value }));
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, z: 0 });
  const [petPosition, setPetPosition] = useState({ x: 0.6, z: 0.6 });
  const [isPlayerMoving, setIsPlayerMoving] = useState(false);
  const [collectedCoinIds, setCollectedCoinIds] = useState([]);
  const [profile, setProfile] = useState(null);
  const [identity, setIdentityState] = useState(loadIdentity);
  const coinsSyncedRef = useRef(0);

  const setIdentity = useCallback((type, value) => {
    const next = value ? { type, value: value.trim() } : null;
    saveIdentity(next);
    setIdentityState(next);
    setProfile(null);
    coinsSyncedRef.current = 0;
  }, []);

  const collectCoin = useCallback((id) => {
    setCollectedCoinIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  // Sync new coins to Supabase when collectedCoinIds grows
  useEffect(() => {
    if (!profile || collectedCoinIds.length <= coinsSyncedRef.current) return;
    const delta = collectedCoinIds.length - coinsSyncedRef.current;
    addCoinsToProfile(profile.id, delta)
      .then(({ data }) => {
        if (data) setProfile(data);
      })
      .catch(console.error);
    coinsSyncedRef.current = collectedCoinIds.length;
  }, [profile, collectedCoinIds.length]);

  const value = {
    playerPosition,
    setPlayerPosition,
    petPosition,
    setPetPosition,
    isPlayerMoving,
    setIsPlayerMoving,
    collectedCoinIds,
    collectCoin,
    profile,
    setProfile,
    identity,
    setIdentity,
    // Total coins: persisted + collected this session
    coinCountTotal: (profile?.coin_count ?? 0) + collectedCoinIds.length,
    unlockedPets: profile?.unlocked_pets ?? [],
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
