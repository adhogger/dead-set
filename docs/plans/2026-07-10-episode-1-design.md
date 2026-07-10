# Dead Air — Episode 1 Design (v0.2)

**Date:** 2026-07-10 · Approved by Ben ("Go ahead with the next session")

## Playtest fixes folded in first
- **Staggered doors:** each wave declares how many spawn doors are active (1 → 2 → 3 → 4
  across the episode). Wave data becomes `{ doors: n, groups: [...] }`.
- **Red = green size:** sprinter radius 9 → 12. Speed stays their threat.
- **Smoother player:** speed 320 → 260, velocity now eases toward the input direction
  (acceleration smoothing) instead of snapping — kills the jerky feel.
- **Half the messages:** kill-milestone quips every 20 kills (was 10).

## Episode structure — 8 rooms, branching
```
studio1 ─E→ greenroom ─E→ props ──────E→ editing ─E→ controlroom ─E→ stage (BOSS)
   │S            │S          │S              ↑E
   └→ makeup ────┴──E→ cafeteria ────────────┘
```
- Clear a room → exits glow green → walk into one to move on (+$1000, +1 heart, max 5).
- Player enters the next room at the door opposite the exit taken.
- Difficulty ramps room by room: more doors, denser mixes, new types debut.

## Enemies
| Type | r | speed | hp | score | color | debut |
|---|---|---|---|---|---|---|
| shambler | 12 | 70 | 2 | 100 | green | studio1 |
| sprinter | 12 | 210 (slowed per wave via `speed`) | 1 | 250 | red | makeup |
| swarmer | 7 | 130 | 1 | 50 | cyan | greenroom |
| brute | 20 | 45 | 10 | 500 | purple | cafeteria |

## The Producer (boss, Sound Stage 5)
- r38, 180 hp, HP bar top-center. Strafes the top of the arena tracking the player.
- Radial "paparazzi flash" bullet bursts (enemy projectiles hurt 1 heart, i-frames apply).
- Every ~7s calls minions. **Phase 2 below 50% hp:** faster bursts + aimed 3-shot spread,
  sprinter minions. Death → "THAT'S A WRAP!" winner screen.

## Power-ups (audience drops, every 12–18s during combat)
- **Spread shot** (orange, 8s): fire 3 bullets in a fan.
- **Speed boots** (cyan, 8s): +40% move speed.
- **Extra heart** (red): +1 heart, cap 5.
Items despawn after 12s. HUD shows active timers.

## Sound — all synthesized (WebAudio, zero asset files)
Gunshot, splat, player hurt, ambient zombie groans, announcer sting on popups, wave drum,
pickup chime, boss roar. Master volume 0.4, **M** mutes. Audio unlocks on first input
(browser autoplay rules).

## Files
New: `js/boss.js`, `js/powerups.js`, `js/audio.js`. Reworked: `rooms.js` (episode data),
`main.js` (room transitions, boss flow, HUD). Tests updated + new coverage: door staggering,
room-graph integrity (BFS to boss), movement smoothing, power-up effects, boss firing,
enemy-bullet i-frames.
