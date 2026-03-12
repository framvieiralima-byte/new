import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getOrCreateProfileByWallet, getOrCreateProfileByUsername } from '../lib/profiles';

/**
 * Loads profile from Supabase when identity (wallet or username) is set.
 */
export default function ProfileLoader() {
  const { identity, setProfile } = useGame();

  useEffect(() => {
    if (!identity?.value) {
      setProfile(null);
      return;
    }
    const fn = identity.type === 'wallet' ? getOrCreateProfileByWallet : getOrCreateProfileByUsername;
    fn(identity.value)
      .then(({ data, error }) => {
        if (error) console.error('Profile load error:', error);
        else setProfile(data);
      });
  }, [identity?.type, identity?.value, setProfile]);

  return null;
}
