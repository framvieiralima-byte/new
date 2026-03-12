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

const EXP_PER_LEVEL = 100;
const EXP_PER_COIN = 20;

export function GameProvider({ children }) {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, z: 0 });
  const [playerFacing, setPlayerFacing] = useState(0);
  const [petPosition, setPetPosition] = useState({ x: 0.6, z: 0.6 });
  const [isPlayerMoving, setIsPlayerMoving] = useState(false);
  const [collectedCoinIds, setCollectedCoinIds] = useState([]);
  const [profile, setProfile] = useState(null);
  const [identity, setIdentityState] = useState(loadIdentity);
  const [petStats, setPetStats] = useState({ level: 1, exp: 0 });
  const coinsSyncedRef = useRef(0);
  const expAwardedForCoinsRef = useRef(0);

  const setIdentity = useCallback((type, value) => {
    const next = value ? { type, value: value.trim() } : null;
    saveIdentity(next);
    setIdentityState(next);
    setProfile(null);
    coinsSyncedRef.current = 0;
  }, []);

  const addPetExp = useCallback((amount) => {
    setPetStats((prev) => {
      let newExp = prev.exp + amount;
      let newLevel = prev.level;
      while (newExp >= EXP_PER_LEVEL) {
        newExp -= EXP_PER_LEVEL;
        newLevel += 1;
      }
      return { level: newLevel, exp: newExp };
    });
  }, []);

  const collectCoin = useCallback((id) => {
    setCollectedCoinIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  // Award EXP when pet collects coins (20 EXP per coin)
  useEffect(() => {
    const count = collectedCoinIds.length;
    if (count <= expAwardedForCoinsRef.current) return;
    const delta = count - expAwardedForCoinsRef.current;
    expAwardedForCoinsRef.current = count;
    addPetExp(delta * EXP_PER_COIN);
  }, [collectedCoinIds.length, addPetExp]);

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
    playerFacing,
    setPlayerFacing,
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
    petStats,
    addPetExp,
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
