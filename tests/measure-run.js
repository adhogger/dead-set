// measure: how long does an episode actually take? Two invincible CAM-BOTs
// play through every room; we log per-room clear times. Exits are taken
// instantly on room-clear (players teleported onto the door), so the numbers
// are pure combat time — real players add walking/looting on top.
// Usage: node tests/measure-run.js [startRoom]   (default: Episode 1)
function stub() {
  var f = function () { return P; };
  var P = new Proxy(f, {
    get: function (t, k) { if (k === Symbol.toPrimitive) return function () { return 0; }; return P; },
    set: function () { return true; }, apply: function () { return P; }, construct: function () { return P; }
  });
  return P;
}
function gainNode() { return { connect: function(){}, gain: { value: 0, setValueAtTime: function(){}, exponentialRampToValueAtTime: function(){}, linearRampToValueAtTime: function(){}, cancelScheduledValues: function(){} } }; }
function AC() { var t0 = Date.now();
  return { get currentTime() { return (Date.now() - t0) / 1000; }, destination: {}, sampleRate: 44100, state: 'running', resume: function(){},
    createGain: gainNode,
    createOscillator: function () { var g = gainNode(); g.frequency = g.gain; g.start=function(){}; g.stop=function(){}; return g; },
    createBiquadFilter: function () { var g = gainNode(); g.frequency = g.gain; return g; },
    createBuffer: function () { return { getChannelData: function(){ return new Float32Array(64); } }; },
    createBufferSource: function () { var g = gainNode(); g.start=function(){}; g.stop=function(){}; return g; } };
}
global.window = { addEventListener: function () {}, innerWidth: 1280, innerHeight: 720, AudioContext: AC };
global.document = { getElementById: function () { return { getContext: function () { return stub(); }, style: {}, width: 1280, height: 720 }; },
  createElement: function () { return { getContext: function () { return stub(); }, style: {}, width: 0, height: 0 }; },
  addEventListener: function () {} };
global.navigator = { getGamepads: function () { return []; } };
global.performance = require('perf_hooks').performance;
global.requestAnimationFrame = function () {};
var fs = require('fs');
['util','input','audio','effects','broadcast','bullets','enemies','player','bot','rooms','procgen','hazards','combat','boss','powerups','main']
  .forEach(function (n) { (0, eval)(fs.readFileSync(__dirname + '/../js/' + n + '.js', 'utf8')); });

var startRoom = process.argv[2] || DA.START_ROOM;
var st = { mode: 'playing', player: DA.makePlayer(), score: 0, combo: 1, comboTimer: 0,
  kills: 0, roomsCleared: 0, groanT: 3, visited: {}, cleared: {}, seenTypes: {}, roomId: startRoom,
  stats: { shots: 0, hits: 0, killsByGun: {}, maxCombo: 1, start: performance.now() } };
st.player.bot = true;                       // both seats bot-driven
st.players = [st.player];
var buddy = DA.makePlayer(); buddy.bot = true; buddy.x += 40;
st.players.push(buddy);
st.room = DA.ROOMS[startRoom];
st.entryDir = null;
st.enemies = []; st.bullets = []; st.enemyBullets = []; st.powerups = [];
st.waveManager = DA.makeWaveManager(st.room);
st.roomCleared = false; st.bossDead = false; st.lastWave = 0;
DA.state = st;

var roomStart = 0, frame = 0, rows = [], lastRoom = st.roomId, lastKills = 0;
var MAX_FRAMES = 60 * 60 * 30;              // 30 minute safety net
while (DA.state.mode === 'playing' && frame < MAX_FRAMES) {
  DA.debugFrame(1 / 60);
  frame++;
  var s = DA.state;
  s.players.forEach(function (p) { p.hearts = Math.max(p.hearts, 5); });  // invincible timers
  if (DA.fx) DA.fx.hitStop = 0;              // don't let juice pauses skew the clock
  if (s.roomId !== lastRoom) {               // crossed into a new room
    rows.push({ room: lastRoom, secs: (frame - roomStart) / 60, kills: s.kills - lastKills });
    lastRoom = s.roomId; roomStart = frame; lastKills = s.kills;
  }
  if (s.roomCleared && !s.room.boss) {       // take the first exit immediately
    var dir = Object.keys(s.room.exits)[0];
    var d = dir && DA.doorByDir(dir);
    if (d) s.players.forEach(function (p) { p.x = d.x; p.y = d.y; });
  }
  if (s.bossDead && s.victoryExit) {         // walk into the finale exit
    var vd = DA.doorByDir(s.victoryExit);
    if (vd) s.players.forEach(function (p) { p.x = vd.x; p.y = vd.y; });
  }
}
rows.push({ room: lastRoom, secs: (frame - roomStart) / 60, kills: DA.state.kills - lastKills });
console.log('mode at end: ' + DA.state.mode + ' (winner = full clear)\n');
var total = 0;
rows.forEach(function (r) {
  total += r.secs;
  console.log((r.room + '                    ').slice(0, 20) + (r.secs.toFixed(1) + 's').padStart(8) +
              String(r.kills).padStart(6) + ' kills');
});
console.log('\nTOTAL: ' + (total / 60).toFixed(1) + ' minutes, ' + DA.state.kills + ' kills (combat time only, 2 bots)');
process.exit(0);
