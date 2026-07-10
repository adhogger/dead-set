# Dead Air — Design Document

**Date:** 2026-07-10
**Status:** Approved

## Concept

A browser-based twin-stick shooter in the spirit of Smash TV (SNES). The player is a
contestant on a post-apocalypse zombie game show: clear single-screen rooms of zombies
while an announcer eggs you on ("BIG MONEY! BIG BRAINS!") and audience "sponsors" throw
power-ups into the arena.

## Core decisions

| Decision | Choice |
|---|---|
| Theme | Zombie game show ("Dead Air") |
| Controls | Gamepad (two sticks) as default; WASD + mouse as fallback. Whichever input was touched last wins. |
| Scope roadmap | 1. Single test room → 2. Episode 1 (6–8 rooms + boss) → 3. Endless Arena (unlocked by beating Episode 1) → 4. More episodes later |
| Visuals | Vector shapes drawn in code on `<canvas>`, plus "juice": screen shake, particles, blood splats, muzzle flash, announcer text popups |
| Tech | Plain JavaScript, no frameworks, no build tools. Open `index.html` to play. |
| Location | `~/Projects/dead-air` — separate from all other projects |

## Architecture

### Rendering
- Fixed internal resolution of **1280×720**, scaled to fit the browser window
  (letterboxed). One room always fits one screen — no scrolling, like Smash TV.
- Game loop via `requestAnimationFrame`: update all actors, then draw, ~60fps.

### Files
| File | Purpose |
|---|---|
| `index.html` | Page + canvas element |
| `style.css` | Page styling (centering, retro font, letterbox background) |
| `js/main.js` | Game loop, game states (title / playing / game over / winner) |
| `js/input.js` | Gamepad API + keyboard/mouse, exposes a unified move/aim/fire state |
| `js/player.js` | Player movement, health (3 hearts), firing |
| `js/enemies.js` | Enemy types + behaviors (shambler, sprinter; more later) |
| `js/bullets.js` | Projectile movement + collision |
| `js/effects.js` | Particles, screen shake, blood splats, announcer popups |
| `js/rooms.js` | Room layouts + wave definitions as plain data objects |

### Rooms as data
Each room is a plain object: wall layout, spawn-door positions, and a list of waves
(each wave = which enemy types, how many, spawn timing). Growing the game = adding
data, not code. Exit doors between rooms arrive in the Episode 1 milestone.

## Version 0.1 — the test room
- One arena with walls and four spawn doors.
- Three escalating waves: shamblers → shamblers + sprinters → bigger mixed wave.
- Player: 3 hearts, brief invincibility after being hit, bullets fire toward aim.
- Score with combo multiplier; announcer quips on kills/milestones.
- Clear all waves → WINNER screen; die → game over; both offer restart.
- Purpose: prove the controls and combat *feel* right before adding content.

## Testing approach
Verified by playing: run in browser preview during development; the user playtests
each milestone (and is the only one who can test real gamepad hardware).
