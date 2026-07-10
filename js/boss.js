(function () {
  // THE PRODUCER — struts along the top of the stage barking orders.
  // Phase 1: radial flash bursts + shambler minions.
  // Phase 2 (under 50% hp): faster bursts, aimed 3-shot spreads, sprinter minions.
  DA.makeBoss = function () {
    return { type: 'producer', isBoss: true, x: DA.W / 2, y: 190, r: 38,
             speed: 80, hp: 180, maxHp: 180, score: 10000, color: '#d4a017',
             wobble: 0, burstT: 2.5, aimedT: 2, minionT: 6 };
  };
  DA.bossPhase = function (b) { return b.hp <= b.maxHp / 2 ? 2 : 1; };
  DA.updateBoss = function (b, st, dt) {
    var phase = DA.bossPhase(b);
    // strut horizontally toward the player's column, bob vertically
    var want = DA.clamp(st.player.x, 200, DA.W - 200);
    b.x += DA.clamp(want - b.x, -1, 1) * b.speed * (phase === 2 ? 1.5 : 1) * dt;
    b.wobble += dt;
    b.y = 190 + Math.sin(b.wobble * 1.7) * 40;
    DA.clampToArena(b);

    b.burstT -= dt;
    if (b.burstT <= 0) {
      b.burstT = phase === 2 ? 2.2 : 3.2;
      var n = phase === 2 ? 14 : 10;
      for (var i = 0; i < n; i++) {
        var a = (i / n) * 6.283 + DA.rand(0, 0.3);
        DA.fireEnemyBullet(st.enemyBullets, b.x, b.y, Math.cos(a), Math.sin(a));
      }
      if (DA.audio) DA.audio.roar();
    }
    if (phase === 2) {
      b.aimedT -= dt;
      if (b.aimedT <= 0) {
        b.aimedT = 1.6;
        var at = Math.atan2(st.player.y - b.y, st.player.x - b.x);
        [-0.18, 0, 0.18].forEach(function (off) {
          DA.fireEnemyBullet(st.enemyBullets, b.x, b.y, Math.cos(at + off), Math.sin(at + off));
        });
      }
    }
    b.minionT -= dt;
    if (b.minionT <= 0) {
      b.minionT = phase === 2 ? 6 : 8;
      for (var m = 0; m < 3; m++) DA.spawnAtDoor(st.enemies, 'shambler');
      if (phase === 2) DA.spawnAtDoor(st.enemies, 'sprinter', 170);
      if (DA.announce) DA.announce('GET ME MORE EXTRAS!');
    }
  };
  DA.drawBoss = function (ctx, b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.fillStyle = b.color;                          // body
    ctx.beginPath(); ctx.arc(0, 0, b.r, 0, 7); ctx.fill();
    ctx.fillStyle = '#f2f2e9';                        // shirt
    ctx.beginPath(); ctx.arc(0, b.r * 0.35, b.r * 0.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#8c1c2c';                        // power tie
    ctx.fillRect(-4, b.r * 0.1, 8, b.r * 0.7);
    ctx.fillStyle = '#111';                           // sunglasses
    ctx.fillRect(-b.r * 0.62, -b.r * 0.3, b.r * 0.5, b.r * 0.26);
    ctx.fillRect(b.r * 0.12, -b.r * 0.3, b.r * 0.5, b.r * 0.26);
    ctx.fillRect(-b.r * 0.15, -b.r * 0.24, b.r * 0.3, 4);
    ctx.restore();
  };
  DA.drawBossBar = function (ctx, b) {
    var w = 420, h = 14, x = (DA.W - w) / 2, y = 46;
    ctx.fillStyle = 'rgba(10,10,15,0.7)';
    ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
    ctx.fillStyle = '#3a3a48';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = DA.bossPhase(b) === 2 ? '#d43a4b' : '#d4a017';
    ctx.fillRect(x, y, w * Math.max(0, b.hp / b.maxHp), h);
    ctx.fillStyle = '#f2f2e9';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('THE PRODUCER', DA.W / 2, y - 8);
  };
})();
