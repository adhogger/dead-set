(function () {
  // The arsenal. rate = seconds between shots; pellets fired per shot spread
  // across `fan` radians; jitter = random aim wobble; pierce = bullet passes
  // through zombies (hits each once); dmg = hp removed per hit.
  DA.GUNS = {
    pistol:  { label: 'PISTOL',  color: '#e8d44d', rate: 0.11,  pellets: 1, fan: 0,    jitter: 0,    speed: 700,  dmg: 1 },
    triple:  { label: 'TRIPLE',  color: '#ff9f1c', rate: 0.14,  pellets: 3, fan: 0.44, jitter: 0,    speed: 700,  dmg: 1 },
    smg:     { label: 'SMG',     color: '#7ee081', rate: 0.06,  pellets: 1, fan: 0,    jitter: 0.09, speed: 780,  dmg: 1 },
    shotgun: { label: 'SHOTGUN', color: '#c95d63', rate: 0.55,  pellets: 7, fan: 0.55, jitter: 0.05, speed: 620,  dmg: 1 },
    minigun: { label: 'MINIGUN', color: '#5bc8d6', rate: 0.045, pellets: 1, fan: 0,    jitter: 0.18, speed: 720,  dmg: 1 },
    railgun: { label: 'RAILGUN', color: '#b78bff', rate: 0.45,  pellets: 1, fan: 0,    jitter: 0,    speed: 1200, dmg: 3, pierce: true }
  };

  DA.fireBullet = function (arr, x, y, dx, dy, gun) {
    var g = gun || DA.GUNS.pistol;
    arr.push({ x: x, y: y, dx: dx, dy: dy, r: g.dmg > 1 ? 5 : 4, speed: g.speed,
               dmg: g.dmg, pierce: !!g.pierce, hit: g.pierce ? [] : null,
               color: g.color, gunLabel: g.label });
  };
  DA.updateBullets = function (arr, dt) {
    for (var i = arr.length - 1; i >= 0; i--) {
      var b = arr[i];
      b.x += b.dx * b.speed * dt; b.y += b.dy * b.speed * dt;
      if (b.x < DA.ARENA.x0 || b.x > DA.ARENA.x1 || b.y < DA.ARENA.y0 || b.y > DA.ARENA.y1) arr.splice(i, 1);
    }
  };
  // returns how many bullets left the barrel (for the accuracy stat)
  DA.tryPlayerFire = function (p, arr) {
    if (!p.firing || p.fireCooldown > 0) return 0;
    var g = DA.GUNS[p.gun] || DA.GUNS.pistol;
    p.fireCooldown = g.rate;
    var base = Math.atan2(p.aimY, p.aimX);
    for (var i = 0; i < g.pellets; i++) {
      var off = g.pellets > 1 ? (i - (g.pellets - 1) / 2) * (g.fan / (g.pellets - 1)) : 0;
      var a = base + off + DA.rand(-g.jitter, g.jitter);
      var dx = Math.cos(a), dy = Math.sin(a);
      DA.fireBullet(arr, p.x + dx * 20, p.y + dy * 20, dx, dy, g);
    }
    if (DA.audio) DA.audio.shot();
    return g.pellets;
  };
  DA.drawBullets = function (ctx, arr) {
    for (var i = 0; i < arr.length; i++) {
      var b = arr[i];
      ctx.fillStyle = b.color || '#ffd94a';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
    }
  };

  // ---- enemy projectiles (the boss's "paparazzi flashes") ----
  var EB_SPEED = 200;
  DA.fireEnemyBullet = function (arr, x, y, dx, dy) {
    arr.push({ x: x, y: y, dx: dx, dy: dy, r: 6 });
  };
  // st is optional (sims/tests may omit it) — used for combo reset on hit
  DA.updateEnemyBullets = function (arr, player, dt, st) {
    for (var i = arr.length - 1; i >= 0; i--) {
      var b = arr[i];
      b.x += b.dx * EB_SPEED * dt; b.y += b.dy * EB_SPEED * dt;
      if (b.x < DA.ARENA.x0 || b.x > DA.ARENA.x1 || b.y < DA.ARENA.y0 || b.y > DA.ARENA.y1) {
        arr.splice(i, 1);
        continue;
      }
      if (!DA.circleHit(b.x, b.y, b.r, player.x, player.y, player.r)) continue;
      if (player.shieldT > 0) {                 // the shield eats the flash
        arr.splice(i, 1);
        if (DA.burst) DA.burst(b.x, b.y, '#9ad7ff', 6);
        continue;
      }
      if (player.invuln <= 0) {
        arr.splice(i, 1);
        player.hearts--;
        player.invuln = 1.5;
        if (st && DA.resetCombo) DA.resetCombo(st);
        if (DA.onPlayerHurt) DA.onPlayerHurt({ player: player });
      }
    }
  };
  DA.drawEnemyBullets = function (ctx, arr) {
    for (var i = 0; i < arr.length; i++) {
      var b = arr[i];
      ctx.fillStyle = '#ff7b54';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
      ctx.fillStyle = '#ffe8d6';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 0.45, 0, 7); ctx.fill();
    }
  };
})();
