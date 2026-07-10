(function () {
  var SPEED = 700, RATE = 0.14; // seconds between shots
  var SPREAD_ANGLE = 0.22;      // radians between spread-shot bullets
  DA.fireBullet = function (arr, x, y, dx, dy) {
    arr.push({ x: x, y: y, dx: dx, dy: dy, r: 4 });
  };
  DA.updateBullets = function (arr, dt) {
    for (var i = arr.length - 1; i >= 0; i--) {
      var b = arr[i];
      b.x += b.dx * SPEED * dt; b.y += b.dy * SPEED * dt;
      if (b.x < DA.ARENA.x0 || b.x > DA.ARENA.x1 || b.y < DA.ARENA.y0 || b.y > DA.ARENA.y1) arr.splice(i, 1);
    }
  };
  DA.tryPlayerFire = function (p, arr) {
    if (!p.firing || p.fireCooldown > 0) return;
    p.fireCooldown = RATE;
    var base = Math.atan2(p.aimY, p.aimX);
    var angles = p.spreadT > 0 ? [base - SPREAD_ANGLE, base, base + SPREAD_ANGLE] : [base];
    for (var i = 0; i < angles.length; i++) {
      var dx = Math.cos(angles[i]), dy = Math.sin(angles[i]);
      DA.fireBullet(arr, p.x + dx * 20, p.y + dy * 20, dx, dy);
    }
    if (DA.audio) DA.audio.shot();
  };
  DA.drawBullets = function (ctx, arr) {
    ctx.fillStyle = '#ffd94a';
    for (var i = 0; i < arr.length; i++) {
      var b = arr[i];
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
    }
  };

  // ---- enemy projectiles (the boss's "paparazzi flashes") ----
  var EB_SPEED = 240;
  DA.fireEnemyBullet = function (arr, x, y, dx, dy) {
    arr.push({ x: x, y: y, dx: dx, dy: dy, r: 6 });
  };
  DA.updateEnemyBullets = function (arr, player, dt) {
    for (var i = arr.length - 1; i >= 0; i--) {
      var b = arr[i];
      b.x += b.dx * EB_SPEED * dt; b.y += b.dy * EB_SPEED * dt;
      if (b.x < DA.ARENA.x0 || b.x > DA.ARENA.x1 || b.y < DA.ARENA.y0 || b.y > DA.ARENA.y1) {
        arr.splice(i, 1);
        continue;
      }
      if (player.invuln <= 0 && DA.circleHit(b.x, b.y, b.r, player.x, player.y, player.r)) {
        arr.splice(i, 1);
        player.hearts--;
        player.invuln = 1.5;
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
