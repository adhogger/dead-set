var DA = {
  W: 1280, H: 720,
  clamp: function (v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); },
  dist2: function (ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; },
  // circle-vs-circle hit test
  circleHit: function (ax, ay, ar, bx, by, br) {
    var r = ar + br; return DA.dist2(ax, ay, bx, by) <= r * r;
  },
  // normalize a vector; returns {x,y,len}. Zero-length stays zero.
  norm: function (x, y) {
    var len = Math.sqrt(x * x + y * y);
    if (len < 0.0001) return { x: 0, y: 0, len: 0 };
    return { x: x / len, y: y / len, len: len };
  },
  rand: function (lo, hi) { return lo + Math.random() * (hi - lo); }
};
