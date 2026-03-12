import { supabase } from './supabase';

/**
 * Find or create profile by wallet_address.
 */
export async function getOrCreateProfileByWallet(walletAddress) {
  const normalized = (walletAddress || '').trim().toLowerCase();
  if (!normalized) return { data: null, error: new Error('Wallet address required') };

  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('wallet_address', normalized)
    .maybeSingle();

  if (existing) return { data: existing, error: null };

  const { data: inserted, error } = await supabase
    .from('profiles')
    .insert({ wallet_address: normalized, coin_count: 0, unlocked_pets: [] })
    .select()
    .single();

  return { data: inserted, error };
}

/**
 * Find or create profile by username.
 */
export async function getOrCreateProfileByUsername(username) {
  const normalized = (username || '').trim();
  if (!normalized) return { data: null, error: new Error('Username required') };

  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', normalized)
    .maybeSingle();

  if (existing) return { data: existing, error: null };

  const { data: inserted, error } = await supabase
    .from('profiles')
    .insert({ username: normalized, coin_count: 0, unlocked_pets: [] })
    .select()
    .single();

  return { data: inserted, error };
}

/**
 * Add coins to a profile and return updated profile.
 */
export async function addCoinsToProfile(profileId, amount = 1) {
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('coin_count')
    .eq('id', profileId)
    .single();

  if (fetchError || !profile) return { data: null, error: fetchError || new Error('Profile not found') };

  const newCount = (profile.coin_count ?? 0) + amount;
  const { data: updated, error } = await supabase
    .from('profiles')
    .update({ coin_count: newCount })
    .eq('id', profileId)
    .select()
    .single();

  return { data: updated, error };
}

/**
 * Update unlocked_pets for a profile. pets = array of strings, e.g. ['default', 'cat'].
 */
export async function setUnlockedPets(profileId, pets) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ unlocked_pets: Array.isArray(pets) ? pets : [] })
    .eq('id', profileId)
    .select()
    .single();

  return { data, error };
}

/**
 * Fetch profile by id.
 */
export async function getProfileById(profileId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  return { data, error };
}
