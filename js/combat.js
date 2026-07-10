(function () {
  // Effect/announcer hooks (DA.onKill, DA.onPlayerHurt) are optional so this
  // file stays testable without the effects layer loaded.
  DA.resolveCombat = function (st) {
    var p = st.player;
    for (var i = st.enemies.length - 1; i >= 0; i--) {
      var e = st.enemies[i];
      var killed = false;
      for (var j = st.bullets.length - 1; j >= 0; j--) {
        var b = st.bullets[j];
        if (DA.circleHit(e.x, e.y, e.r, b.x, b.y, b.r)) {
          st.bullets.splice(j, 1);
          e.hp--;
          if (e.hp <= 0) { killed = true; break; }
        }
      }
      if (killed) {
        st.enemies.splice(i, 1);
        st.score += e.score * st.combo;
        if (DA.bumpCombo) DA.bumpCombo(st);
        if (DA.onKill) DA.onKill(st, e);
        continue;
      }
      if (p.invuln <= 0 && DA.circleHit(e.x, e.y, e.r, p.x, p.y, p.r)) {
        p.hearts--;
        p.invuln = 1.5;
        var v = DA.norm(e.x - p.x, e.y - p.y); // knock enemy back
        e.x += v.x * 60; e.y += v.y * 60;
        DA.clampToArena(e);
        if (DA.onPlayerHurt) DA.onPlayerHurt(st);
      }
    }
  };
})();
