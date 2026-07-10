(function () {
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');

  function fit() {
    var scale = Math.min(window.innerWidth / DA.W, window.innerHeight / DA.H);
    canvas.style.width = Math.floor(DA.W * scale) + 'px';
    canvas.style.height = Math.floor(DA.H * scale) + 'px';
  }
  window.addEventListener('resize', fit);
  fit();

  var last = performance.now();
  function frame(now) {
    var dt = Math.min((now - last) / 1000, 0.05); // cap dt: tab-switch safety
    last = now;
    update(dt);
    render(ctx);
    requestAnimationFrame(frame);
  }

  function update(dt) { /* filled in by later tasks */ }

  function render(ctx) {
    ctx.fillStyle = '#14141c';
    ctx.fillRect(0, 0, DA.W, DA.H);
    ctx.fillStyle = '#e8d44d';
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DEAD AIR', DA.W / 2, DA.H / 2);
  }

  DA.update = update; DA.render = render; // replaced by later tasks
  requestAnimationFrame(frame);
})();
