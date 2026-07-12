(function () {
  // The presenter has an ARC. Twelve years of selling murder as light
  // entertainment, and tonight is the first episode he can't control:
  //   Act 1 (Ep 1)          — the professional. Polished, amoral, selling.
  //   Act 2 (Ep 2)          — tiny cracks. Improvising, still smiling.
  //   Act 3 (Ep 2 boss +    — losing control. Talking to the control room
  //          early Ep 3)      more than the audience.
  //   Act 4 (late Ep 3)     — the broadcast collapses. Narrating his own fear.
  //   Act 5 (the finale)    — no audience voice left. An ordered confession,
  //                           dripped line by line during the Algorithm fight.
  // Tone: Black Mirror / Banksy / Monkey Dust. He jokes about TELEVISION,
  // not monsters — people built this. Executives. Marketing. Algorithms.
  var ACT1 = [
    'GOOD EVENING, HUMANITY. WE CHECKED OUR MORALS AT RECEPTION. AGAIN.',
    'OUR LEGAL DEPARTMENT HAS OFFICIALLY STOPPED ANSWERING THE PHONE.',
    'EVERY SCREAM YOU HEAR HAS BEEN PROFESSIONALLY MIKED.',
    'THE AUDIENCE WANTED AUTHENTICITY. WE MAY HAVE OVERDELIVERED.',
    'SMILE FOR CAMERA THREE. YOUR OBITUARY MIGHT USE THE FOOTAGE.',
    'SOMEWHERE, A SHAREHOLDER IS CALLING THIS A SUCCESS.',
    'THE BLOOD IS REAL. THE SMILES ARE CONTRACTUAL.',
    "IF THIS FEELS UNFAIR — CONGRATULATIONS. YOU'VE UNDERSTOOD THE FORMAT.",
    'THIS IS WHAT HAPPENS WHEN QUARTERLY PROFITS BECOME A RELIGION.',
    'FOCUS GROUPS AGREED THAT EMPATHY TESTED POORLY WITH OUR CORE DEMOGRAPHIC.',
    'ETHICS WERE REMOVED AFTER SEASON FOUR TO IMPROVE PACING.',
    'EVERY DEATH TONIGHT HAS BEEN OPTIMISED FOR VIEWER ENGAGEMENT.',
    'THE EXECUTIVES ARE WATCHING FROM A SECURE BUNKER. NATURALLY.',
    'THE CREW REQUESTED HAZARD PAY. WE GAVE THEM COMMEMORATIVE MUGS.',
    "REMEMBER — IF YOU'RE STILL ALIVE, YOU'RE TECHNICALLY UNDERPERFORMING.",
    "TONIGHT'S SUFFERING IS SPONSORED BY RECORD-BREAKING AUDIENCE RETENTION.",
    'OUR ADVERTISERS LEFT YEARS AGO. FORTUNATELY, HUMAN CURIOSITY IS FREE.',
    'NOTHING BOOSTS VIEWING FIGURES QUITE LIKE IRREVERSIBLE MISTAKES.',
    "WE ASKED THE AI TO MAXIMISE RATINGS. IT MISUNDERSTOOD THE WORD 'LIMIT'.",
    'YOUR PANIC IS BEING TRANSLATED LIVE INTO SEVENTEEN LANGUAGES.'
  ];
  var ACT2 = [
    "WELL... THAT WASN'T SCHEDULED.",
    'CONTROL ASSURES ME EVERYTHING REMAINS UNDER... ACCEPTABLE LEVELS.',
    'ONE MOMENT — APPARENTLY OUR AI HAS BECOME CREATIVELY INDEPENDENT.',
    'INTERESTING. CAMERA TWELVE HAS GONE OFFLINE.',
    'WE APPEAR TO BE MISSING SEVERAL MEMBERS OF OUR PRODUCTION CREW.',
    "NO NEED FOR ALARM. WE'VE PREPARED FOR ALMOST EVERY EVENTUALITY.",
    '...ALMOST.',
    'THE AI DIRECTOR ASSURES US EVERYTHING IS PROCEEDING CATASTROPHICALLY.',
    "THAT WASN'T A SCRIPTED EXPLOSION... BUT WE'LL ABSOLUTELY PRETEND IT WAS.",
    'EVERY MONSTER REPRESENTS YEARS OF INNOVATION AND ONE CATASTROPHIC OVERSIGHT.',
    'THIS EPISODE HAS EXCEEDED OUR PROJECTED CASUALTY TARGETS. CONGRATULATIONS, EVERYONE.',
    'SOMEWHERE IN THIS BUILDING IS AN EMERGENCY EXIT. IT TESTED POORLY WITH AUDIENCES.'
  ];
  var ACT3 = [
    'CONTROL... WHO AUTHORISED OPENING SECTOR NINE?',
    "THAT CREATURE WASN'T CLEARED FOR BROADCAST.",
    "...THAT'S IMPOSSIBLE.",
    'WHY ARE CONTAINMENT DOORS OPENING BY THEMSELVES?',
    'CAMERA FIVE... STOP FILMING THAT.',
    'DIRECTOR? ...DIRECTOR?',
    '...WHAT AN EXCITING TWIST FOR OUR VIEWERS.',
    "THE RATINGS NOW TRACK THE BODY COUNT EXACTLY. MARKETING CALLS THAT 'BRAND CONSISTENCY'."
  ];
  var ACT4 = [
    "CONTROL ISN'T ANSWERING.",
    'THERE SHOULD STILL BE SAFETY TEAMS.',
    'WHERE IS EVERYONE?',
    'SOMEONE IS SUPPOSED TO STOP THIS.',
    '...ANYONE?',
    "THE NETWORK IS DYING TONIGHT. YOU'RE JUST DOING IT MORE PUBLICLY.",
    "IF CIVILISATION SURVIVES THIS BROADCAST, WE'D APPRECIATE A FAVOURABLE REVIEW."
  ];
  // Act 5 is a SCRIPT, not a pool: dripped in order during the finale fight.
  var ACT5 = [
    'WE THOUGHT PEOPLE WANTED MONSTERS.',
    'IT TURNED OUT THEY WANTED US.',
    'I USED TO TELL CONTESTANTS THIS WAS JUST TELEVISION.',
    '...I STOPPED BELIEVING THAT YEARS AGO.',
    'WE KEPT ASKING HOW FAR WE COULD PUSH PEOPLE.',
    "WE NEVER ASKED HOW FAR WE'D PUSH OURSELVES.",
    'THE FUNNY THING ABOUT SPECTACLES...',
    '...IS EVENTUALLY THE FIRE REACHES THE STAGE.',
    "IF YOU'RE HEARING THIS...",
    "...YOU'RE NO LONGER THE CONTESTANT."
  ];
  var ACTS = [null, ACT1, ACT2, ACT3, ACT4, ACT5];

  // Which act is the show in? Follows the campaign's actual structure.
  DA.presenterAct = function (st) {
    var room = st && st.room;
    if (!room) return 1;
    var ep = room.ep || 1;
    if (ep === 1) return 1;
    if (ep === 2) return room.boss ? 3 : 2;
    if (ep === 3) {
      if (room.boss) return 5;
      var depth = room.map ? room.map.x + room.map.y : 0;
      return depth >= 3 ? 4 : 3;
    }
    return 1;                       // Syndication/Endless: the show at its confident best
  };

  DA.fx = { particles: [], splats: [], popups: [], queue: [], corpses: [], dust: [], rings: [], host: null, shake: 0 };

  // The presenter appears ON CAMERA: a HOST CAM window in the corner with his
  // talking head and the line as a caption — his quips live there now, so the
  // centre of the screen stays clear for gameplay callouts.
  DA.hostSay = function (text) {
    if (!text) return;
    DA.fx.host = { text: text, lines: null, t: 4.6, max: 4.6 };
  };
  try { DA.fx.shakeOn = localStorage.getItem('deadset_shake') !== '0'; }
  catch (e) { DA.fx.shakeOn = true; }

  // a felled zombie shatters into flying shards instead of blinking out —
  // or deflating: this reads as glass breaking, not a balloon losing air
  DA.corpse = function (x, y, r, color) {
    var n = 7 + Math.floor(r / 2.5);
    for (var i = 0; i < n; i++) {
      var a = DA.rand(0, 6.283), speed = DA.rand(70, 240);
      DA.fx.corpses.push({
        x: x, y: y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - DA.rand(30, 90),
        rot: DA.rand(0, 6.283), rotV: DA.rand(-9, 9),
        w: DA.rand(3, Math.max(4, r * 0.5)), h: DA.rand(3, Math.max(4, r * 0.5)),
        color: color, t: 0.55, max: 0.55, grav: 320
      });
    }
    if (DA.fx.corpses.length > 320) DA.fx.corpses.splice(0, DA.fx.corpses.length - 320);
  };

  DA.burst = function (x, y, color, n, dx, dy) {
    for (var i = 0; i < n; i++) {
      var a = DA.rand(0, 6.28), s = DA.rand(60, 260);
      DA.fx.particles.push({ x: x, y: y,
                             vx: Math.cos(a) * s + (dx || 0) * 170,   // spray follows the shot
                             vy: Math.sin(a) * s + (dy || 0) * 170,
                             life: 0.5, maxLife: 0.5, color: color, r: DA.rand(2, 5) });
    }
  };

  DA.shockwave = function (x, y, maxR) {   // expanding, fading blast ring (rocket explosions)
    DA.fx.rings.push({ x: x, y: y, maxR: maxR || 100, life: 0.32, maxLife: 0.32 });
  };

  DA.dust = function (x, y) {              // tiny footstep puff, drawn under the player
    DA.fx.dust.push({ x: x, y: y, r: DA.rand(2, 4), vy: -8, life: 0.32, maxLife: 0.32 });
    if (DA.fx.dust.length > 60) DA.fx.dust.shift();
  };

  DA.splat = function (x, y) {
    var blobs = [];
    var n = 2 + Math.floor(DA.rand(0, 3));
    for (var i = 0; i < n; i++) {
      blobs.push({ dx: DA.rand(-14, 14), dy: DA.rand(-14, 14), r: DA.rand(6, 16) });
    }
    DA.fx.splats.push({ x: x, y: y, blobs: blobs });
    if (DA.fx.splats.length > 200) DA.fx.splats.shift();
  };

  // announcements queue up and show ONE at a time; when the booth is backed up
  // (2 already waiting), extra messages are dropped rather than going stale
  DA.announce = function (text) {
    if (DA.fx.queue.length >= 2) return;
    DA.fx.queue.push(text);
  };

  DA.addShake = function (amount) {
    if (DA.fx.shakeOn === false) return;
    DA.fx.shake = Math.max(DA.fx.shake, amount);
  };

  // Haptics: gamepad rumble (Chrome dual-rumble) + phone vibration (Android;
  // iOS Safari has no vibrate API, so it degrades silently there).
  var hapticsOn = true;
  try { hapticsOn = localStorage.getItem('deadset_haptics') !== '0'; } catch (e) {}
  DA.hapticsOn = function () { return hapticsOn; };
  DA.toggleHaptics = function () {
    hapticsOn = !hapticsOn;
    try { localStorage.setItem('deadset_haptics', hapticsOn ? '1' : '0'); } catch (e) {}
    if (DA.announce) DA.announce(hapticsOn ? 'HAPTICS ON' : 'HAPTICS OFF');
    if (hapticsOn) DA.haptic(0.8, 120);      // a demo thump so the toggle is felt
    return hapticsOn;
  };
  DA.haptic = function (strength, ms) {
    if (!hapticsOn) return;
    try {
      if (navigator.vibrate && DA.input && DA.input.touchActive && DA.input.touchActive()) {
        navigator.vibrate(ms);
      }
      var pads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (var i = 0; i < pads.length; i++) {
        var p = pads[i];
        if (p && p.connected && p.vibrationActuator && p.vibrationActuator.playEffect) {
          p.vibrationActuator.playEffect('dual-rumble',
            { duration: ms, strongMagnitude: strength, weakMagnitude: Math.min(1, strength + 0.2) });
          break;
        }
      }
    } catch (e) {}
  };

  DA.updateFx = function (dt) {
    var fx = DA.fx;
    for (var i = fx.particles.length - 1; i >= 0; i--) {
      var p = fx.particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (p.life <= 0) fx.particles.splice(i, 1);
    }
    for (var j = fx.popups.length - 1; j >= 0; j--) {
      var pop = fx.popups[j];
      pop.y -= 25 * dt; pop.life -= dt;
      if (pop.life <= 0) fx.popups.splice(j, 1);
    }
    if (fx.popups.length === 0 && fx.queue.length > 0) {  // promote the next message
      var py = DA.state && DA.state.mode === 'title' ? 318 : 130;  // clear of the logo
      fx.popups.push({ text: fx.queue.shift(), y: py, life: 3.4, maxLife: 3.4 });
      if (DA.audio) DA.audio.sting();
    }
    for (var c = fx.corpses.length - 1; c >= 0; c--) {
      var sh = fx.corpses[c];
      sh.t -= dt;
      if (sh.t <= 0) { fx.corpses.splice(c, 1); continue; }
      sh.vy += sh.grav * dt;
      sh.x += sh.vx * dt; sh.y += sh.vy * dt;
      sh.rot += sh.rotV * dt;
    }
    if (fx.shake > 0) fx.shake = Math.max(0, fx.shake - 30 * dt);
    for (var d = fx.dust.length - 1; d >= 0; d--) {
      var du = fx.dust[d];
      du.y += du.vy * dt; du.life -= dt;
      if (du.life <= 0) fx.dust.splice(d, 1);
    }
    for (var r = fx.rings.length - 1; r >= 0; r--) {
      fx.rings[r].life -= dt;
      if (fx.rings[r].life <= 0) fx.rings.splice(r, 1);
    }
    if (fx.host) {
      // hold the host's entrance while a room title card owns that corner
      if (!(DA.state && DA.state.introCardT > 0)) fx.host.t -= dt;
      if (fx.host.t <= 0) fx.host = null;
    }
  };

  DA.drawFxUnder = function (ctx) {   // floor stains + deflating corpses, under actors
    var dust = DA.fx.dust;
    ctx.fillStyle = 'rgba(210, 200, 180, 0.5)';
    for (var du = 0; du < dust.length; du++) {
      var d = dust[du];
      ctx.globalAlpha = (d.life / d.maxLife) * 0.5;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(110, 20, 30, 0.55)';
    var splats = DA.fx.splats;
    for (var i = 0; i < splats.length; i++) {
      var s = splats[i];
      for (var b = 0; b < s.blobs.length; b++) {
        var blob = s.blobs[b];
        ctx.beginPath(); ctx.arc(s.x + blob.dx, s.y + blob.dy, blob.r, 0, 7); ctx.fill();
      }
    }
    var corpses = DA.fx.corpses;                     // flying glass-shard fragments
    for (var c = 0; c < corpses.length; c++) {
      var sh = corpses[c];
      var k = sh.t / sh.max;
      ctx.save();
      ctx.translate(sh.x, sh.y);
      ctx.rotate(sh.rot);
      ctx.globalAlpha = Math.max(0, k);
      ctx.fillStyle = sh.color;
      ctx.fillRect(-sh.w / 2, -sh.h / 2, sh.w, sh.h);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-sh.w / 2, -sh.h / 2, sh.w, sh.h);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  };

  DA.drawFxOver = function (ctx) {    // particles + announcer, over actors
    var fx = DA.fx;
    for (var rg = 0; rg < fx.rings.length; rg++) {
      var ring = fx.rings[rg];
      var k = 1 - ring.life / ring.maxLife;
      ctx.globalAlpha = (1 - k) * 0.7;
      ctx.strokeStyle = '#ffb347';
      ctx.lineWidth = 4 * (1 - k) + 1;
      ctx.beginPath(); ctx.arc(ring.x, ring.y, ring.maxR * k, 0, 7); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (var i = 0; i < fx.particles.length; i++) {
      var p = fx.particles[i];
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    for (var j = 0; j < fx.popups.length; j++) {
      var pop = fx.popups[j];
      ctx.globalAlpha = Math.min(1, pop.life / (pop.maxLife * 0.5));
      ctx.font = 'bold 40px monospace';
      ctx.fillStyle = '#e8d44d';
      if (!pop.lines) {                 // wrap once, on first draw — long announcer
        pop.lines = [];                 // lines were running off the screen edges
        var words = pop.text.split(' '), cur = '';
        for (var w = 0; w < words.length; w++) {
          var tryLine = cur ? cur + ' ' + words[w] : words[w];
          if (cur && ctx.measureText(tryLine).width > DA.W - 120) { pop.lines.push(cur); cur = words[w]; }
          else cur = tryLine;
        }
        if (cur) pop.lines.push(cur);
      }
      for (var li = 0; li < pop.lines.length; li++) {
        ctx.fillText(pop.lines[li], DA.W / 2, pop.y + li * 46);
      }
    }
    ctx.globalAlpha = 1;
  };

  // Act 1-4 draw at random from the act's pool; Act 5 delivers its confession
  // in order, one line per call, then falls silent.
  DA.presenterQuip = function (st) {
    var act = DA.presenterAct(st);
    if (act === 5) {
      if (!st) return ACT5[0];
      st.act5Idx = st.act5Idx || 0;
      if (st.act5Idx >= ACT5.length) return null;   // he has nothing left to say
      return ACT5[st.act5Idx++];
    }
    var pool = ACTS[act];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // one-line threat callouts, announced the first time each type appears in a run
  var THREATS = {
    shambler: 'SHAMBLER — SLOW. WEAK. THERE ARE SO MANY.',
    swarmer:  'SWARMER — WEAK ALONE. NEVER ALONE.',
    sprinter: 'SPRINTER — FAST. DO NOT STAND STILL.',
    boomer:   "BOOMER — DON'T LET IT GET CLOSE. SHOOT FROM RANGE.",
    stalker:  'STALKER — FADES OUT. FASTER WHEN YOU CAN BARELY SEE IT.',
    brute:    'BRUTE — SLOW, BUT IT HITS LIKE A CANCELLED CONTRACT.',
    spitter:  'SPITTER — LOBS BILE FROM ACROSS THE SET. SIDESTEP OR CLOSE IN.',
    gusher:   'GUSHER — HOSES A THREE-GLOB FAN. ONE SIDESTEP IS NOT ENOUGH.'
  };
  DA.threatLine = function (type) { return THREATS[type]; };

  // Game-event hooks fired by combat.js / rooms.js
  DA.onKill = function (st, e, b) {          // b: the killing bullet, if any
    st.kills = (st.kills || 0) + 1;
    DA.burst(e.x, e.y, e.color, e.isBoss ? 60 : 12, b && b.dx, b && b.dy);
    if (e.isBoss || e.r >= 20) DA.fx.hitStop = 0.05;
    DA.splat(e.x, e.y);
    DA.corpse(e.x, e.y, e.r, e.color);
    DA.addShake(e.isBoss ? 14 : 3);
    if (DA.haptic && e.isBoss) DA.haptic(1, 350);
    if (DA.audio) DA.audio.splat(e.r);
    if (e.elite && st.powerups && DA.pickDropType && st.powerups.length < 3) {
      // a champion pays out — but never floods the floor, and rerolls
      // rather than duplicating a gift type already lying there
      var dtype = DA.pickDropType(st.player, st.lastGunDrop);
      for (var rr = 0; rr < 3; rr++) {
        var dupe = st.powerups.some(function (pu) { return pu.type === dtype; });
        if (!dupe) break;
        dtype = DA.pickDropType(st.player, st.lastGunDrop);
      }
      if (dtype.indexOf('gun_') === 0) st.lastGunDrop = dtype;
      st.powerups.push({ id: DA.newId(), type: dtype, t: 12, x: e.x, y: e.y });
      DA.burst(e.x, e.y, '#e8d44d', 18);
      if (DA.audio && DA.audio.elite) DA.audio.elite();
    }
    if (st.kills % 25 === 0) DA.hostSay(DA.presenterQuip(st));
  };
  DA.onPlayerHurt = function (st, sx, sy) {
    var p = st.player;
    DA.addShake(10);
    if (DA.haptic) DA.haptic(0.9, 130);
    DA.burst(p.x, p.y, '#c0392b', 16);
    p.hurtDir = (sx != null) ? Math.atan2(sy - p.y, sx - p.x) : null;
    p.hurtFlashT = 0.35;
    if (DA.audio) DA.audio.hurt();
  };
  DA.onWaveStart = function (n) {
    if (n > 1) DA.announce('WAVE ' + n);   // wave 1 follows the room name: let it breathe
    if (DA.audio) DA.audio.wave();
  };
})();
