import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { useGameStore } from '../store/gameStore';

const EGGS = [
  {
    id: 'common',
    name: 'Common Egg',
    price: 50,
    description: '80% Common, 20% Rare',
    color: 'bg-amber-100 border-amber-400 text-amber-900',
    eggType: 'common',
  },
  {
    id: 'rare',
    name: 'Rare Egg',
    price: 200,
    description: '70% Rare, 30% Epic',
    color: 'bg-blue-100 border-blue-400 text-blue-900',
    eggType: 'rare',
  },
  {
    id: 'legendary',
    name: 'Legendary Egg',
    price: 1000,
    description: '10% Epic, 90% Legendary',
    color: 'bg-purple-100 border-purple-400 text-purple-900',
    eggType: 'legendary',
  },
];

export default function PetShop() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(null);

  const { playerCoins, spendCoins } = useGame();
  const hatch = useGameStore((s) => s.hatch);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggle]);

  const buyEgg = (egg) => {
    if (playerCoins < egg.price) {
      setMessage(`Not enough coins. Need ${egg.price}.`);
      return;
    }
    spendCoins(egg.price);
    const pet = hatch(egg.eggType);
    setMessage(`You hatched a ${pet}!`);
    setTimeout(() => setMessage(null), 2500);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={toggle}
        className="fixed bottom-4 right-4 z-50 rounded-xl bg-amber-500 px-4 py-2 font-semibold text-white shadow-lg transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
      >
        Shop
      </button>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl bg-slate-800 p-6 shadow-2xl ring-1 ring-white/10"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pet-shop-title"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 id="pet-shop-title" className="text-xl font-bold text-white">
              Pet Shop
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Close shop"
            >
              <span className="text-2xl leading-none">&times;</span>
            </button>
          </div>

          <p className="mb-4 text-sm text-slate-300">
            Your coins: <strong className="text-amber-400">{playerCoins}</strong>
          </p>

          {message && (
            <p className="mb-4 rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-300">
              {message}
            </p>
          )}

          <ul className="space-y-4">
            {EGGS.map((egg) => {
              const canAfford = playerCoins >= egg.price;
              return (
                <li
                  key={egg.id}
                  className={`rounded-xl border-2 p-4 ${egg.color} transition opacity-90 hover:opacity-100`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="font-semibold">{egg.name}</div>
                    <p className="text-sm opacity-90">{egg.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-bold">{egg.price} Coins</span>
                      <button
                        type="button"
                        onClick={() => buyEgg(egg)}
                        disabled={!canAfford}
                        className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-700 disabled:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="mt-4 text-center text-xs text-slate-500">
            Press <kbd className="rounded bg-slate-700 px-1.5 py-0.5">P</kbd> to
            toggle shop · <kbd className="rounded bg-slate-700 px-1.5 py-0.5">Esc</kbd> to close
          </p>
        </div>
      </div>
    </>
  );
}
