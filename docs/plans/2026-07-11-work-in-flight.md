# Work in flight — 11 Jul 2026

Two sessions are editing this tree today. To avoid collisions:

**Conventions (settled):** entity ids via `DA.newId()` (reset each run in `newGame`);
fixed 60 Hz tick in `main.js frame()`; seeded randomness via `DA.makeRng(seed)` +
`DA.hashSeed(str)`. Combo: step 6, window 4s, hits halve via `DA.comboHit`.

**This session is building (new files where possible):**
- `js/procgen.js` — Syndication mode: seeded monotone-lattice episodes
- `js/net.js`, `server/relay.js`, `server/worker.js` — Phase 2 relay + client netcode
- wiring in `main.js`: title entries, guest frame branch (already in), seed plumbing

If you're the other session: shout in this file before touching those.
