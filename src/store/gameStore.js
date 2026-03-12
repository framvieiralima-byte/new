import { create } from 'zustand';

/**
 * Formation offsets in player-local space:
 * +x = right, +z = forward (where player looks).
 * Pet 0: 2 units left. Pet 1: 2 units right. Pet 2: 4 units back.
 */
export const FORMATION_OFFSETS = [
  { x: -2, z: 0 },   // Pet 0: left
  { x: 2, z: 0 },    // Pet 1: right
  { x: 0, z: -4 },   // Pet 2: back
  { x: -2, z: -3 },  // Pet 3: left-back
  { x: 2, z: -3 },   // Pet 4: right-back
];

export const useGameStore = create((set) => ({
  equippedPets: ['default'],
  petPositions: [{ x: 0, z: 0 }],

  setEquippedPets: (pets) =>
    set({
      equippedPets: Array.isArray(pets) ? pets : [],
      petPositions: (Array.isArray(pets) ? pets : []).map(() => ({ x: 0, z: 0 })),
    }),

  setPetPosition: (index, pos) =>
    set((state) => {
      const next = [...(state.petPositions || [])];
      while (next.length <= index) next.push({ x: 0, z: 0 });
      next[index] = { ...pos };
      return { petPositions: next };
    }),

  /**
   * Hatch an egg: roll rarity from the egg's table and add a new pet to equippedPets.
   * Returns the pet id that was added (e.g. 'common', 'rare', 'epic', 'legendary').
   */
  hatch: (eggType) => {
    const tables = {
      common: [
        { chance: 0.8, pet: 'common' },
        { chance: 0.2, pet: 'rare' },
      ],
      rare: [
        { chance: 0.7, pet: 'rare' },
        { chance: 0.3, pet: 'epic' },
      ],
      legendary: [
        { chance: 0.1, pet: 'epic' },
        { chance: 0.9, pet: 'legendary' },
      ],
    };
    const table = tables[eggType] || tables.common;
    const roll = Math.random();
    let acc = 0;
    let chosen = table[0].pet;
    for (const row of table) {
      acc += row.chance;
      if (roll < acc) {
        chosen = row.pet;
        break;
      }
    }
    set((state) => ({
      equippedPets: [...(state.equippedPets || []), chosen],
      petPositions: [...(state.petPositions || []), { x: 0, z: 0 }],
    }));
    return chosen;
  },
}));
