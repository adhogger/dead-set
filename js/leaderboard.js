(function () {
  // Global leaderboard client. One board per Syndication seed — the daily
  // seed makes tonight's episode a worldwide competition. Scores go to the
  // same Worker that runs the co-op relay (HTTP side of it).
  function apiBase() {
    var relay = (typeof window !== 'undefined' && window.SLASHTV_RELAY) || null;
    try {
      var q = location.search.match(/[?&]relay=([^&]+)/);
      if (q) relay = decodeURIComponent(q[1]);
    } catch (e) {}
    if (!relay) return null;
    return relay.replace(/^ws:/, 'http:').replace(/^wss:/, 'https:');
  }

  var LB = DA.lb = { today: null, todaySeed: null, myRank: null };

  LB.initials = function () {
    try { return localStorage.getItem('deadset_initials') || ''; } catch (e) { return ''; }
  };
  LB.setInitials = function (v) {
    v = String(v || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 8).trim();
    try { localStorage.setItem('deadset_initials', v); } catch (e) {}
    return v;
  };

  LB.fetchTop = function (seed, cb) {
    var base = apiBase();
    if (!base) { if (cb) cb(null); return; }
    fetch(base + '/lb?seed=' + encodeURIComponent(seed))
      .then(function (r) { return r.json(); })
      .then(function (d) { if (cb) cb(d.top || []); })
      .catch(function () { if (cb) cb(null); });
  };

  LB.submit = function (seed, entry, cb) {
    var base = apiBase();
    if (!base) { if (cb) cb(null); return; }
    fetch(base + '/lb?seed=' + encodeURIComponent(seed), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (cb) cb(d); })
      .catch(function () { if (cb) cb(null); });
  };

  // Warm tonight's board for the title screen (fire-and-forget on load).
  LB.warm = function () {
    if (!DA.dailySeed) return;
    var seed = DA.dailySeed();
    LB.fetchTop(seed, function (top) { LB.today = top; LB.todaySeed = seed; });
  };
  if (typeof window !== 'undefined') setTimeout(LB.warm, 500);
})();
