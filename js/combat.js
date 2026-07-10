(function () {
  // Effect/announcer hooks (DA.onKill, DA.onPlayerHurt) are optional so this
  // file stays testable without the effects layer loaded.
  // The multiplier is earned: every KILLS_PER_STEP kills in an unbroken chain
  // raise it one step; a 3s gap OR taking a hit resets it to x1.
  var COMBO_CAP = 9, COMBO_WINDOW = 3, KILLS_PER_STEP = 8;
  DA.bumpCombo = function (st) {
    st.comboKills = (st.comboKills || 0) + 1;
    st.comboTimer = COMBO_WINDOW;
    if (st.comboKills >= KILLS_PER_STEP) {
      st.comboKills = 0;
      st.combo = Math.min(st.combo + 1, COMBO_CAP);
    }
  };
  DA.updateCombo = function (st, dt) {
    if (st.comboTimer > 0) {
      st.comboTimer -= dt;
      if (st.comboTimer <= 0) { st.combo = 1; st.comboKills = 0; }
    }
  };
  DA.resetCombo = function (st) {
    st.combo = 1; st.comboKills = 0; st.comboTimer = 0;
  };
  DA.resolveCombat = function (st) {
    var p = st.player;
    for (var i = st.enemies.length - 1; i >= 0; i--) {
      var e = st.enemies[i];
      if (!e) continue; // a boomer chain-blast may have shrunk the list mid-loop
      var killed = false;
      for (var j = st.bullets.length - 1; j >= 0; j--) {
        var b = st.bullets[j];
        if (b.pierce && b.hit.indexOf(e) !== -1) continue; // railgun hits each zombie once
        if (DA.circleHit(e.x, e.y, e.r, b.x, b.y, b.r)) {
          if (b.pierce) b.hit.push(e);
          else st.bullets.splice(j, 1);
          e.hp -= (b.dmg || 1);
          if (st.stats) st.stats.hits++;
          if (e.hp <= 0) {
            if (st.stats && b.gunLabel) {
              st.stats.killsByGun[b.gunLabel] = (st.stats.killsByGun[b.gunLabel] || 0) + 1;
            }
            killed = true;
            break;
          }
        }
      }
      if (killed) {
        st.enemies.splice(i, 1);
        st.score += e.score * st.combo;
        if (e.isBoss) st.bossDead = true;
        if (DA.bumpCombo) DA.bumpCombo(st);
        if (DA.onKill) DA.onKill(st, e);
        if (e.type === 'boomer') DA.boomerBlast(st, e.x, e.y); // shot boomers still detonate
        continue;
      }
      if (p.invuln <= 0 && !(e.grace > 0) && !(p.shieldT > 0) &&
          DA.circleHit(e.x, e.y, e.r, p.x, p.y, p.r)) {
        p.hearts--;
        p.invuln = 1.5;
        DA.resetCombo(st);
        var v = DA.norm(e.x - p.x, e.y - p.y); // knock enemy back
        e.x += v.x * 60; e.y += v.y * 60;
        DA.clampToArena(e);
        if (DA.onPlayerHurt) DA.onPlayerHurt(st);
      }
    }
  };
})();
