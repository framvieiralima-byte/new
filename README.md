# pete-verse

3D pet simulator built with React, Vite, and [@react-three/fiber](https://github.com/pmndrs/react-three-fiber).

- **Player**: Blue box moved with WASD
- **Pet**: Rounded box that follows the player; bounces when idle and circles around you when you stop
- **Coins**: 10 yellow spheres; the pet collects them on touch and the UI counter updates
- **Environment**: Green floor, sun light, top-down follow camera

## Run locally

```bash
npm install
npm run dev
```

Open **http://localhost:5174** (or the port Vite prints).

## Env (optional)

Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` if you use Supabase.

## Supabase profiles

The game can save progress to a `profiles` table: `wallet_address` or `username`, `coin_count`, `unlocked_pets` (JSON array).

1. In Supabase Dashboard go to **SQL Editor** and run the script in `supabase/migrations/001_profiles.sql`.
2. In the game UI, enter a username or wallet address and click **Save progress**. Coins collected in the round are synced to your profile; total coins and `unlocked_pets` are shown in the overlay.

## Stack

- React 18, Vite 8
- Three.js, @react-three/fiber, @react-three/drei
- Supabase (optional)
