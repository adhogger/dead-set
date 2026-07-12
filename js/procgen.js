(function () {
  // SYNDICATION: a new studio every night. Episodes are generated on the same
  // forward-grid rule the hand-authored seasons follow — doors only east or
  // south to the adjacent cell — so every route to the boss is automatically
  // the same length and the minimap can never draw a crossing line.
  // Everything flows from one seed: share it, and two machines (or two online
  // players) build the identical studio.

  var THEMES = [
    { decor: 'stage',    floor: '#1c1c26', names: ['STUDIO 7', 'SOUND STAGE 2', 'REHEARSAL HALL', 'THE COLD OPEN'] },
    { decor: 'crates',   floor: '#20201a', names: ['PROP VAULT', 'LOADING DOCK', 'SET STORAGE', 'BACKLOT ANNEX'] },
    { decor: 'tables',   floor: '#1a1f22', names: ['THE COMMISSARY', 'WRAP PARTY HALL', 'CRAFT SERVICES B'] },
    { decor: 'monitors', floor: '#221d1a', names: ['MASTER CONTROL', 'PLAYBACK BAY', 'THE GALLERY ANNEX'] },
    { decor: 'racks',    floor: '#241e1c', names: ['COSTUME VAULT', 'THE FITTING ROOMS', 'WARDROBE ANNEX'] },
    { decor: 'papers',   floor: '#1e1c24', names: ['SCRIPT ARCHIVE', 'THE BULLPEN', 'STANDARDS & PRACTICES'] },
    { decor: 'desks',    floor: '#1d1a22', names: ['EDIT SUITE 4', 'THE CUTTING ROOM', 'FOLEY STAGE'] },
    { decor: 'mirrors',  floor: '#221a20', names: ['MAKEUP TWO', 'HAIR & PROSTHETICS', 'THE GREEN MIRROR'] },
    { decor: 'servers',  floor: '#181e26', names: ['TAPE ARCHIVE', 'RENDER FARM', 'THE MAINFRAME'] }
  ];
  var GIFT_NAMES = ["SPONSOR'S LOUNGE", 'HOSPITALITY SUITE', 'THE GIFTING ROOM'];
  var BOSS_NAMES = ['SOUND STAGE 13', 'THE PENTHOUSE SET', 'THE FINALE FLOOR'];
  var SHAPES = [{ w: 3, h: 1 }, { w: 4, h: 1 }, { w: 3, h: 2 }, { w: 2, h: 2 }, { w: 4, h: 2 }];

  // spawn-group templates per type; costs express lethality per body
  var COST = { shambler: 1, swarmer: 0.6, sprinter: 2.5, boomer: 4, stalker: 5, brute: 6, spitter: 4.5, gusher: 8 };
  var UNLOCK = { swarmer: 1, sprinter: 1, boomer: 2, brute: 2, stalker: 3, spitter: 2, gusher: 4 };
  var MINIMUM = { swarmer: 16, sprinter: 8, boomer: 2, brute: 3, stalker: 3, spitter: 2, gusher: 1 };

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

  function makeWaves(depth, rng, budgetScale) {
    var waves = [];
    for (var i = 0; i < 2; i++) {
      var budget = (88 + depth * 46 + i * 24) * (0.85 + rng() * 0.3) * (budgetScale || 1);
      var share = Math.max(0.55, 1 - (depth * 0.13 + i * 0.05 + rng() * 0.1));
      var groups = [{ type: 'shambler', count: Math.max(30, Math.round(budget * share)),
                      interval: 1.1, burst: 7 }];
      var rest = budget * (1 - share);
      var pool = [];
      for (var t in UNLOCK) if (depth >= UNLOCK[t]) pool.push(t);
      var picks = Math.min(pool.length, 1 + Math.floor(rng() * 2) + (depth >= 3 ? 1 : 0));
      for (var k = 0; k < picks && rest > 1 && pool.length; k++) {
        var type = pool.splice(Math.floor(rng() * pool.length), 1)[0];
        var spend = k === picks - 1 ? rest : rest * (0.4 + rng() * 0.35);
        rest -= spend;
        var count = Math.max(MINIMUM[type], Math.round(spend / COST[type]));
        var g = { type: type, count: count };
        if (type === 'swarmer') { g.interval = 1.3; g.burst = 5; }
        else if (type === 'sprinter') { g.interval = Math.max(1.0, 1.9 - depth * 0.15);
                                        g.speed = Math.min(110 + depth * 14, 180); }
        else if (type === 'boomer') g.interval = Math.max(4.5, 8 - depth * 0.7);
        else if (type === 'brute') g.interval = Math.max(4.5, 8 - depth * 0.6);
        else if (type === 'stalker') g.interval = Math.max(1.7, 2.6 - depth * 0.2);
        else if (type === 'spitter') g.interval = Math.max(4, 7 - depth * 0.5);
        else if (type === 'gusher') g.interval = 8;
        groups.push(g);
      }
      waves.push({ doors: DA.clamp(1 + depth + i, 1, 3), groups: groups });
    }
    return waves;
  }

  // carve a valid studio: full w x h lattice, optionally drop 1-2 interior
  // cells, keep only shapes where the boss is the sole dead end and every
  // room both reaches the boss and is reachable from the start
  function carveCells(rng) {
    for (var attempt = 0; attempt < 20; attempt++) {
      var shape = pick(rng, SHAPES);
      var cells = {};
      for (var x = 0; x <= shape.w; x++) {
        for (var y = 0; y <= shape.h; y++) cells[x + ',' + y] = true;
      }
      var drops = Math.floor(rng() * 4);           // 0..3 missing cells
      for (var d = 0; d < drops; d++) {
        var dx = Math.floor(rng() * (shape.w + 1));
        var dy = Math.floor(rng() * (shape.h + 1));
        if ((dx === 0 && dy === 0) || (dx === shape.w && dy === shape.h)) continue;
        delete cells[dx + ',' + dy];
      }
      if (validCells(cells, shape)) return { cells: cells, shape: shape };
    }
    var full = {};                                  // fallback: the whole rectangle
    for (x = 0; x <= 3; x++) for (y = 0; y <= 1; y++) full[x + ',' + y] = true;
    return { cells: full, shape: { w: 3, h: 1 } };
  }
  function validCells(cells, shape) {
    var boss = shape.w + ',' + shape.h;
    var canReachBoss = {}; canReachBoss[boss] = true;
    var ids = Object.keys(cells);
    for (var pass = 0; pass < ids.length; pass++) {  // fixed-point backward pass
      for (var c in cells) {
        var p = c.split(','), x = +p[0], y = +p[1];
        if (canReachBoss[(x + 1) + ',' + y] || canReachBoss[x + ',' + (y + 1)]) canReachBoss[c] = true;
      }
    }
    for (c in cells) {
      p = c.split(','); x = +p[0]; y = +p[1];
      var hasExit = cells[(x + 1) + ',' + y] || cells[x + ',' + (y + 1)];
      if (c !== boss && !hasExit) return false;      // a dead end that isn't the boss
      if (!canReachBoss[c]) return false;            // a room that can't finish the show
    }
    var seen = { '0,0': true }, frontier = ['0,0'];  // forward reachability
    while (frontier.length) {
      p = frontier.pop().split(','); x = +p[0]; y = +p[1];
      [[x + 1, y], [x, y + 1]].forEach(function (n) {
        var k = n[0] + ',' + n[1];
        if (cells[k] && !seen[k]) { seen[k] = true; frontier.push(k); }
      });
    }
    for (c in cells) if (!seen[c]) return false;
    return true;
  }

  DA.generateEpisode = function (seedStr) {
    var rng = DA.makeRng(DA.hashSeed(String(seedStr)));
    for (var id in DA.ROOMS) {                       // clear last night's studio
      if (DA.ROOMS[id].ep === 'syn') delete DA.ROOMS[id];
    }
    var carved = carveCells(rng);
    var cells = carved.cells, shape = carved.shape;
    var bossKey = shape.w + ',' + shape.h;
    var themes = THEMES.slice();                     // deal decors without repeats
    for (var i = themes.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = themes[i]; themes[i] = themes[j]; themes[j] = tmp;
    }
    var giftKeys = Object.keys(cells).filter(function (k) {
      return k !== '0,0' && k !== bossKey;
    });
    var giftKey = giftKeys.length ? giftKeys[Math.floor(rng() * giftKeys.length)] : null;
    var bossType = rng() < 0.5 ? 'producer' : 'executive';
    var n = 0;
    for (var key in cells) {
      var p = key.split(','), x = +p[0], y = +p[1];
      var rid = 'syn_' + x + '_' + y;
      var depth = x + y;
      var room = { ep: 'syn', map: { x: x, y: y }, seed: String(seedStr), exits: {} };
      if (cells[(x + 1) + ',' + y]) room.exits.E = 'syn_' + (x + 1) + '_' + y;
      if (cells[x + ',' + (y + 1)]) room.exits.S = 'syn_' + x + '_' + (y + 1);
      if (key === bossKey) {
        room.name = pick(rng, BOSS_NAMES);
        room.decor = 'bossfloor'; room.floor = '#241a1a';
        room.boss = bossType; room.waves = [];
      } else if (key === giftKey) {
        room.name = pick(rng, GIFT_NAMES);
        room.decor = 'lounge'; room.floor = '#1a2119';
        room.gift = true;
        room.waves = makeWaves(depth, rng, 0.4);     // the sponsors go easy on you
      } else if (key === '0,0') {
        room.name = 'STUDIO ' + (1 + Math.floor(rng() * 9));
        room.decor = 'stage'; room.floor = '#1c1c26';
        room.waves = makeWaves(depth, rng, 1);
      } else {
        var theme = themes[n++ % themes.length];
        room.name = pick(rng, theme.names);
        room.decor = theme.decor; room.floor = theme.floor;
        room.waves = makeWaves(depth, rng, 1);
      }
      DA.ROOMS[rid] = room;
    }
    return { startId: 'syn_0_0', seedStr: String(seedStr) };
  };

  DA.dailySeed = function () {                       // tonight's broadcast, UTC
    var d = new Date();
    return d.getUTCFullYear() + '-' +
           ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' +
           ('0' + d.getUTCDate()).slice(-2);
  };
})();
