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
  rand: function (lo, hi) { return lo + Math.random() * (hi - lo); },
  // deterministic RNG (mulberry32): same seed, same episode — for procedural
  // generation and, later, the shared seed both online players build from
  makeRng: function (seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },
  // monotonic entity ids: network snapshots will reference enemies and drops by these
  _id: 1,
  newId: function () { return DA._id++; },
  hashSeed: function (str) {          // any string (a date, a room code) to a 32-bit seed
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i); h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
};
