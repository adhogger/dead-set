# DEAD SET 🧟📺

*New America's #1 post-apocalyptic game show!*

(The project folder is still called `dead-air` — the show got renamed mid-season.)

A browser twin-stick shooter in the spirit of Smash TV. You're a contestant fighting
through the studios of a zombie-infested TV network — 8 connected rooms with exit-door
choices, audience power-up drops, and **The Producer** waiting on Sound Stage 5.

## Play

Open `index.html` in any browser. No install, no build step, no server needed.

**Gamepad (recommended):** left stick moves; push the right stick in any direction to fire
that way (right trigger also fires). Press **G** for a raw controller readout if inputs act oddly.
**Keyboard + mouse:** WASD moves, mouse aims, click (hold) fires.
Whichever you touched last wins. **M** mutes sound.

Clear a room and the exit doors glow green — walk into one to pick your route (+1 heart,
+$1000). The audience throws gifts: **gun crates** (TRIPLE, SMG, SHOTGUN, MINIGUN, and the
piercing RAILGUN — each lasts 30 combat-seconds, then back to your pistol), speed boots,
and extra hearts (never when your 5-heart meter is full). Your current gun shows under
the heart meter.

## Tests

Open `tests.html` — every pure-logic function (collision, input mapping, waves, combo)
is asserted there. Green ✅ means healthy; the tab title shows the verdict.

## Project layout

- `js/util.js` — the `DA` namespace + math helpers
- `js/input.js` — unified gamepad / keyboard+mouse input (auto-detects odd right-stick axes)
- `js/player.js`, `js/enemies.js`, `js/bullets.js` — the actors + projectiles
- `js/combat.js` — collision resolution, score, combo
- `js/rooms.js` — the episode: rooms, exits, and waves as plain data (add content here)
- `js/boss.js` — The Producer
- `js/powerups.js` — audience drops
- `js/audio.js` — all-synthesized WebAudio sound (no audio files)
- `js/effects.js` — particles, screen shake, splats, announcer
- `js/main.js` — game loop, states, room transitions, rendering, HUD
- `devserver.py` — optional no-cache dev server (`python3 devserver.py`)
- `docs/plans/` — design docs and implementation plans

## Roadmap

v0.1: single test studio ✅ → v0.2 (this): Episode 1 — 8 rooms, exit choices, swarmers &
brutes, power-ups, sound, The Producer ✅ → Endless Arena (unlock) → more episodes.
