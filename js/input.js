(function () {
  var DEAD = 0.2;
  DA.applyDeadzone = function (v) {
    var a = Math.abs(v);
    if (a < DEAD) return 0;
    return Math.sign(v) * (a - DEAD) / (1 - DEAD);
  };
  DA.screenToCanvas = function (sx, sy, winW, winH) {
    var scale = Math.min(winW / DA.W, winH / DA.H);
    var offX = (winW - DA.W * scale) / 2, offY = (winH - DA.H * scale) / 2;
    return { x: (sx - offX) / scale, y: (sy - offY) / scale };
  };

  var keys = {}, mouse = { x: DA.W / 2, y: DA.H / 2, down: false };
  var device = 'keyboard'; // or 'gamepad'

  window.addEventListener('keydown', function (e) { keys[e.code] = true; device = 'keyboard'; });
  window.addEventListener('keyup', function (e) { keys[e.code] = false; });
  window.addEventListener('mousemove', function (e) {
    var p = DA.screenToCanvas(e.clientX, e.clientY, window.innerWidth, window.innerHeight);
    mouse.x = p.x; mouse.y = p.y; device = 'keyboard';
  });
  window.addEventListener('mousedown', function () { mouse.down = true; device = 'keyboard'; });
  window.addEventListener('mouseup', function () { mouse.down = false; });

  // playerX/playerY: needed to turn mouse position into an aim direction
  DA.input = {
    state: function (playerX, playerY) {
      var pads = navigator.getGamepads ? navigator.getGamepads() : [];
      var pad = null;
      for (var i = 0; i < pads.length; i++) if (pads[i] && pads[i].connected) { pad = pads[i]; break; }
      if (pad) {
        var gx = DA.applyDeadzone(pad.axes[0]), gy = DA.applyDeadzone(pad.axes[1]);
        var ax = DA.applyDeadzone(pad.axes[2]), ay = DA.applyDeadzone(pad.axes[3]);
        var trigger = pad.buttons[7] && pad.buttons[7].pressed;
        if (gx || gy || ax || ay || trigger) device = 'gamepad';
        if (device === 'gamepad') {
          var aim = DA.norm(ax, ay);
          return { moveX: gx, moveY: gy, aimX: aim.x, aimY: aim.y,
                   firing: (ax !== 0 || ay !== 0 || trigger), device: 'gamepad' };
        }
      }
      var mx = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
      var my = (keys.KeyS ? 1 : 0) - (keys.KeyW ? 1 : 0);
      var maim = DA.norm(mouse.x - playerX, mouse.y - playerY);
      return { moveX: mx, moveY: my, aimX: maim.x, aimY: maim.y,
               firing: mouse.down, device: 'keyboard' };
    },
    gamepadConnected: function () {
      var pads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (var i = 0; i < pads.length; i++) if (pads[i] && pads[i].connected) return true;
      return false;
    }
  };
})();
