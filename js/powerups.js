(function () {
  // Audience drops: the crowd throws sponsor gifts into the arena mid-combat.
  var TYPES = ['spread', 'boots', 'heart'];
  var COLORS = { spread: '#ff9f1c', boots: '#4cc9f0', heart: '#d43a4b' };
  var DURATION = 8;      // seconds of spread/boots effect
  var LIFETIME = 12;     // seconds before an unclaimed drop despawns

  DA.applyPowerup = function (player, type) {
    if (type === 'spread') player.spreadT = DURATION;
    else if (type === 'boots') player.bootsT = DURATION;
    else if (type === 'heart') player.hearts = Math.min(player.hearts + 1, DA.MAX_HEARTS);
  };

  DA.updatePowerups = function (st, dt) {
    if (st.powerupT === undefined) st.powerupT = DA.rand(8, 14);
    // only drop while there's a fight happening
    if (st.enemies.length > 0) {
      st.powerupT -= dt;
      if (st.powerupT <= 0) {
        st.powerupT = DA.rand(12, 18);
        var type = TYPES[Math.floor(Math.random() * TYPES.length)];
        st.powerups.push({ type: type, t: LIFETIME,
                           x: DA.rand(DA.ARENA.x0 + 120, DA.ARENA.x1 - 120),
                           y: DA.rand(DA.ARENA.y0 + 120, DA.ARENA.y1 - 120) });
        if (DA.announce) DA.announce('SPONSOR DROP!');
        if (DA.burst) DA.burst(st.powerups[st.powerups.length - 1].x,
                               st.powerups[st.powerups.length - 1].y, COLORS[type], 10);
      }
    }
    for (var i = st.powerups.length - 1; i >= 0; i--) {
      var pu = st.powerups[i];
      pu.t -= dt;
      if (pu.t <= 0) { st.powerups.splice(i, 1); continue; }
      if (DA.circleHit(pu.x, pu.y, 14, st.player.x, st.player.y, st.player.r)) {
        DA.applyPowerup(st.player, pu.type);
        if (DA.burst) DA.burst(pu.x, pu.y, COLORS[pu.type], 14);
        if (DA.audio) DA.audio.pickup();
        st.powerups.splice(i, 1);
      }
    }
  };

  DA.drawPowerups = function (ctx, arr) {
    for (var i = 0; i < arr.length; i++) {
      var pu = arr[i];
      var blink = pu.t < 3 && Math.floor(pu.t * 5) % 2 === 0; // hurry-up blink
      if (blink) continue;
      var pulse = 1 + Math.sin(performance.now() / 150) * 0.12;
      ctx.save();
      ctx.translate(pu.x, pu.y);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = COLORS[pu.type];
      if (pu.type === 'spread') {                     // fan of three notches
        ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(11, 9); ctx.lineTo(-11, 9); ctx.closePath(); ctx.fill();
      } else if (pu.type === 'boots') {               // boot-ish block
        ctx.fillRect(-9, -11, 10, 16); ctx.fillRect(-9, 5, 18, 7);
      } else {                                        // heart
        ctx.beginPath();
        ctx.arc(-5, -3, 6.5, 0, 7); ctx.arc(5, -3, 6.5, 0, 7);
        ctx.moveTo(-11, 0); ctx.lineTo(0, 13); ctx.lineTo(11, 0); ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  };

  // HUD labels for timed effects
  DA.powerupHudLines = function (player) {
    var lines = [];
    if (player.spreadT > 0) lines.push({ text: 'SPREAD ' + Math.ceil(player.spreadT) + 's', color: COLORS.spread });
    if (player.bootsT > 0) lines.push({ text: 'BOOTS ' + Math.ceil(player.bootsT) + 's', color: COLORS.boots });
    return lines;
  };
})();
