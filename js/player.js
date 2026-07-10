(function () {
  DA.ARENA = { x0: 40, y0: 40, x1: 1240, y1: 680 };
  DA.makePlayer = function () {
    return { x: DA.W / 2, y: DA.H / 2, r: 16, speed: 320,
             hearts: 3, invuln: 0, aimX: 1, aimY: 0, fireCooldown: 0, firing: false };
  };
  DA.clampToArena = function (e) {
    e.x = DA.clamp(e.x, DA.ARENA.x0 + e.r, DA.ARENA.x1 - e.r);
    e.y = DA.clamp(e.y, DA.ARENA.y0 + e.r, DA.ARENA.y1 - e.r);
  };
  DA.updatePlayer = function (p, dt) {
    var s = DA.input.state(p.x, p.y);
    var mv = DA.norm(s.moveX, s.moveY);
    p.x += mv.x * p.speed * dt;
    p.y += mv.y * p.speed * dt;
    DA.clampToArena(p);
    if (s.aimX || s.aimY) { p.aimX = s.aimX; p.aimY = s.aimY; }
    p.firing = s.firing;
    if (p.invuln > 0) p.invuln -= dt;
    if (p.fireCooldown > 0) p.fireCooldown -= dt;
  };
  DA.drawPlayer = function (ctx, p) {
    if (p.invuln > 0 && Math.floor(p.invuln * 10) % 2 === 0) return; // blink when hit
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.atan2(p.aimY, p.aimX));
    ctx.fillStyle = '#f2f2e9';                       // body
    ctx.beginPath(); ctx.arc(0, 0, p.r, 0, 7); ctx.fill();
    ctx.fillStyle = '#e8d44d';                       // contestant sash
    ctx.fillRect(-p.r, -4, p.r * 2, 8);
    ctx.fillStyle = '#333';                          // gun
    ctx.fillRect(p.r - 4, -3, 14, 6);
    ctx.restore();
  };
})();
