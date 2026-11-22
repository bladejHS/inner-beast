/* ZENITH · the living skies (2026-11-22; the user: "vreau să elimini animațiile cu personaje care fac anumite
   activități. Fă ceva mai wow"). Replaces the arena's stick figures on the mastheads, the Azi stage and the Plan
   banners: no characters, only the night: a starfield that breathes, aurora ribbons, shooting stars, and one scene
   that carries the day:
   - summit:        a faceted peak drawn in light, lights climbing its ridges to the star on its tip;
   - orbit:         a lit planet with tilted rings, bodies orbiting with comet tails (strength days);
   - trail:         a road of light running to the horizon under a rising moon, the ground streaming past (long runs);
   - pulse:         a heartbeat line sweeping the screen, every beat a shockwave from the core (threshold, engine);
   - constellation: star trails turning round the pole, a constellation drawing itself line by line (recovery, Minte).
   API: ZenithSky.mount(canvas, { color:[r,g,b], hot:[r,g,b], still:bool }) → { stop() }.
   The canvas carries data-scene, data-seed, data-fx / data-fy (the focus, 0..1) and data-base (the horizon, 0..1).
   Still (reduced motion, lite mode, the non-today banners): one frame, drawn at a moment that shows the whole scene. */
(function () {
  'use strict';
  var TAU = Math.PI * 2;

  function rng(seed) {
    var s = (seed >>> 0) || 1;
    return function () { s = (s + 0x6d2b79f5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a < 0 ? 0 : a > 1 ? 1 : a).toFixed(3) + ')'; }
  function num(v, d) { var n = parseFloat(v); return isFinite(n) ? n : d; }

  function mount(cv, o) {
    o = o || {};
    var c = cv.getContext('2d');
    if (!c) return { stop: function () {} };
    var ds = cv.dataset;
    var scene = ds.scene || 'summit';
    var seed = num(ds.seed, 7) * 977 + scene.length * 131;
    var R = rng(seed);
    var fx = num(ds.fx, 0.5), fy = num(ds.fy, 0.42), base = num(ds.base, 0.74);
    var col = o.color || [111, 151, 208], hot = o.hot || [185, 211, 245], ice = [233, 241, 251], white = [255, 255, 255];
    var W = 0, H = 0, u = 1, t = 0, live = !o.still, raf = 0, last = 0, seen = true;

    /* the sky every scene shares */
    var stars = [];
    for (var i = 0; i < 150; i++) stars.push({ x: R(), y: Math.pow(R(), 1.3) * base, r: 0.35 + Math.pow(R(), 3) * 1.4, f: R() * TAU, s: 0.6 + R() * 2.2 });
    var bands = [0, 1, 2].map(function (k) { return { y: 0.12 + k * 0.09 + R() * 0.04, a: 0.03 + R() * 0.03, f: 1.6 + R() * 2.4, p: R() * TAU, v: 0.12 + R() * 0.18, h: 0.07 + R() * 0.05, hue: k === 1 ? [150, 130, 235] : k === 2 ? [120, 210, 230] : col }; });
    var meteor = null, nextMeteor = 1.5 + R() * 4;

    /* summit: the ridge (normalized), its climbers */
    var ridge = [], peakI = 0, climbers = [];
    if (scene === 'summit') {
      var py = Math.max(0.14, base - 0.5);
      var key = [[-0.06, base - 0.1], [fx - 0.34, base - 0.24], [fx - 0.2, base - 0.15], [fx - 0.09, base - 0.3], [fx, py], [fx + 0.07, py + 0.12], [fx + 0.16, base - 0.27], [fx + 0.3, base - 0.17], [1.06, base - 0.08]];
      ridge = [key[0]];
      for (var k = 1; k < key.length; k++) {
        var a0 = key[k - 1], a1 = key[k], n = 4;
        for (var j = 1; j <= n; j++) {
          var q = j / n, jit = j < n ? (R() - 0.5) * 0.035 : 0;
          ridge.push([a0[0] + (a1[0] - a0[0]) * q, a0[1] + (a1[1] - a0[1]) * q + jit]);
        }
        if (k === 4) peakI = ridge.length - 1;
      }
      for (var m = 0; m < 9; m++) climbers.push({ side: m % 2, s: R(), v: 0.05 + R() * 0.07 });
    }
    /* orbit: three tilted rings and their bodies */
    var rings = [];
    if (scene === 'orbit') {
      var tilt = -0.5 + R() * 0.4;
      for (var g = 0; g < 3; g++) rings.push({ r: 1.25 + g * 0.42, k: 0.22 + g * 0.05, tl: tilt + g * 0.22, v: (0.5 - g * 0.12) * (g === 1 ? -1 : 1), b: [R() * TAU, R() * TAU] });
    }
    /* constellation: the figure and the turning trails */
    var figure = [], trails = [];
    if (scene === 'constellation') {
      var pts = [];
      for (var p = 0; p < 11; p++) { var an = R() * TAU, rr = 0.25 + R() * 0.75; pts.push([fx + Math.cos(an) * rr * 0.3, fy + Math.sin(an) * rr * 0.22]); }
      var used = [pts.shift()];
      while (pts.length) {
        var lastP = used[used.length - 1], bi = 0, bd = 9;
        for (var e = 0; e < pts.length; e++) { var dx = pts[e][0] - lastP[0], dy = pts[e][1] - lastP[1], dd = dx * dx + dy * dy; if (dd < bd) { bd = dd; bi = e; } }
        used.push(pts.splice(bi, 1)[0]);
      }
      figure = used;
      for (var s2 = 0; s2 < 90; s2++) trails.push({ r: 0.08 + Math.sqrt(R()) * 1.3, a: R() * TAU, l: 0.05 + R() * 0.14, w: 0.4 + R() * 0.9, al: 0.15 + R() * 0.45 });
    }
    /* trail: the streaks running at you */
    var streaks = [];
    if (scene === 'trail') for (var z = 0; z < 14; z++) streaks.push({ z: R(), side: R() < 0.5 ? -1 : 1, v: 0.25 + R() * 0.3 });
    /* pulse */
    var waves = [], beatAt = 0;

    function size() {
      var w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return false;
      u = Math.min(window.devicePixelRatio || 1, 2);
      var nw = Math.round(w * u), nh = Math.round(h * u);
      if (nw > 4096 || nh > 4096) return false;
      if (cv.width !== nw || cv.height !== nh) { cv.width = nw; cv.height = nh; }
      W = nw; H = nh;
      return true;
    }
    function glow(x, y, r, stops) {
      var g = c.createRadialGradient(x, y, 0, x, y, r);
      for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    }
    function flare(x, y, L, a, rot) {
      c.save(); c.translate(x, y); c.rotate(rot || 0);
      for (var i = 0; i < 4; i++) {
        var len = i % 2 ? L * 0.62 : L;
        var g = c.createLinearGradient(0, 0, len, 0);
        g.addColorStop(0, rgba(white, a)); g.addColorStop(1, rgba(hot, 0));
        c.fillStyle = g; c.beginPath(); c.moveTo(0, -1.3 * u); c.lineTo(len, 0); c.lineTo(0, 1.3 * u); c.fill();
        c.rotate(TAU / 4);
      }
      c.restore();
      glow(x, y, L * 0.28, [[0, rgba(white, a)], [0.3, rgba(ice, a * 0.6)], [1, rgba(hot, 0)]]);
    }

    function sky(dt) {
      var sc = Math.min(W, H) / 400;
      /* aurora */
      for (var b = 0; b < bands.length; b++) {
        var B = bands[b], y0 = B.y * H, amp = B.a * H, th = B.h * H;
        var g = c.createLinearGradient(0, y0 - amp - th, 0, y0 + amp + th);
        g.addColorStop(0, rgba(B.hue, 0)); g.addColorStop(0.5, rgba(B.hue, 0.05 + 0.02 * Math.sin(t * 0.4 + b))); g.addColorStop(1, rgba(B.hue, 0));
        c.fillStyle = g; c.beginPath();
        var step = W / 24;
        for (var x = 0; x <= W + step; x += step) {
          var yy = y0 + Math.sin(x / W * B.f * TAU * 0.5 + B.p + t * B.v) * amp - th * (0.6 + 0.4 * Math.sin(x / W * 5 + t * B.v * 1.7));
          x === 0 ? c.moveTo(x, yy) : c.lineTo(x, yy);
        }
        for (var x2 = W + step; x2 >= -step; x2 -= step) c.lineTo(x2, y0 + Math.sin(x2 / W * B.f * TAU * 0.5 + B.p + t * B.v) * amp + th * 0.5);
        c.fill();
      }
      /* stars */
      if (scene !== 'constellation') {
        for (var i = 0; i < stars.length; i++) {
          var S = stars[i], tw = 0.55 + 0.45 * Math.sin(t * S.s + S.f);
          c.fillStyle = rgba(S.r > 1.2 ? ice : hot, 0.25 + tw * 0.65);
          c.beginPath(); c.arc(S.x * W, S.y * H, S.r * u * (0.8 + tw * 0.3), 0, TAU); c.fill();
          if (S.r > 1.45 && tw > 0.9) flare(S.x * W, S.y * H, 9 * u, (tw - 0.9) * 6, 0);
        }
      }
      /* a shooting star now and then */
      if (live) {
        nextMeteor -= dt;
        if (nextMeteor <= 0 && !meteor) { meteor = { x: (0.2 + R() * 0.7) * W, y: R() * base * 0.45 * H, a: Math.PI * (0.78 + R() * 0.12), l: 0, v: (500 + R() * 400) * u * sc }; nextMeteor = 4 + R() * 7; }
      }
      if (meteor) {
        meteor.l += dt * 1.4;
        var L = 140 * u * sc, hx = meteor.x + Math.cos(meteor.a) * meteor.v * meteor.l * 0.5, hy = meteor.y + Math.sin(meteor.a) * meteor.v * meteor.l * 0.5;
        var fade = Math.sin(Math.min(1, meteor.l) * Math.PI);
        var mg = c.createLinearGradient(hx, hy, hx - Math.cos(meteor.a) * L, hy - Math.sin(meteor.a) * L);
        mg.addColorStop(0, rgba(white, fade)); mg.addColorStop(1, rgba(hot, 0));
        c.strokeStyle = mg; c.lineWidth = 1.6 * u; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx - Math.cos(meteor.a) * L, hy - Math.sin(meteor.a) * L); c.stroke();
        if (meteor.l >= 1) meteor = null;
      }
    }

    /* ---- summit ---- */
    function ridgePt(i) { return [ridge[i][0] * W, ridge[i][1] * H]; }
    function climbPos(side, s) {
      /* side 0: from the left foot up to the peak; side 1: from the right foot */
      var n = side ? ridge.length - 1 - peakI : peakI, f = s * n, i = Math.floor(f), q = f - i;
      var a = side ? ridge.length - 1 - i : i, b = side ? a - 1 : a + 1;
      if (i >= n) return ridgePt(peakI);
      var A = ridgePt(a), Bp = ridgePt(b);
      return [A[0] + (Bp[0] - A[0]) * q, A[1] + (Bp[1] - A[1]) * q];
    }
    function summit(dt) {
      var P = ridgePt(peakI), sc = Math.min(W, H);
      /* light behind the peak, rays fanning up */
      glow(P[0], P[1], sc * 0.75, [[0, rgba(hot, 0.34)], [0.35, rgba(col, 0.14)], [1, rgba(col, 0)]]);
      c.save(); c.translate(P[0], P[1]);
      for (var r = 0; r < 7; r++) {
        var an = -Math.PI / 2 + (r - 3) * 0.32 + Math.sin(t * 0.25 + r) * 0.05, len = sc * (0.7 + 0.2 * Math.sin(t * 0.5 + r * 1.7));
        var rg = c.createLinearGradient(0, 0, Math.cos(an) * len, Math.sin(an) * len);
        rg.addColorStop(0, rgba(ice, 0.12)); rg.addColorStop(1, rgba(hot, 0));
        c.fillStyle = rg; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(an - 0.05) * len, Math.sin(an - 0.05) * len); c.lineTo(Math.cos(an + 0.05) * len, Math.sin(an + 0.05) * len); c.fill();
      }
      c.restore();
      /* a far range for depth */
      c.globalCompositeOperation = 'source-over';
      c.fillStyle = 'rgba(8,11,17,.62)'; c.beginPath(); c.moveTo(0, H);
      for (var x = 0; x <= 24; x++) c.lineTo(x / 24 * W, (base - 0.1 - 0.06 * Math.abs(Math.sin(x * 1.37 + seed))) * H);
      c.lineTo(W, H); c.fill();
      /* the mountain: dark body, lit faces, edge of light */
      var body = c.createLinearGradient(0, P[1], 0, base * H);
      body.addColorStop(0, '#16233b'); body.addColorStop(1, '#060a12');
      c.fillStyle = body; c.beginPath(); c.moveTo(-10, H);
      for (var i = 0; i < ridge.length; i++) { var p = ridgePt(i); c.lineTo(p[0], p[1]); }
      c.lineTo(W + 10, H); c.fill();
      /* the lit face to the right of the peak */
      var lit = c.createLinearGradient(P[0], P[1], P[0] + sc * 0.3, base * H);
      lit.addColorStop(0, rgba(hot, 0.3)); lit.addColorStop(1, rgba(col, 0));
      c.fillStyle = lit; c.beginPath(); c.moveTo(P[0], P[1]);
      for (var i2 = peakI + 1; i2 < ridge.length; i2++) { var p2 = ridgePt(i2); c.lineTo(p2[0], p2[1]); }
      c.lineTo(P[0] + sc * 0.05, base * H); c.fill();
      c.globalCompositeOperation = 'lighter';
      /* facets */
      c.lineWidth = u;
      for (var f = 0; f < ridge.length; f += 3) {
        var pf = ridgePt(f), d = Math.abs(f - peakI);
        if (!d) continue;
        c.strokeStyle = rgba(hot, 0.16 - d * 0.004);
        c.beginPath(); c.moveTo(pf[0], pf[1]); c.lineTo(P[0] + (pf[0] - P[0]) * 0.35, base * H); c.stroke();
      }
      /* the ridge line, brightest at the top */
      var edge = c.createLinearGradient(0, P[1], 0, base * H);
      edge.addColorStop(0, rgba(white, 0.95)); edge.addColorStop(0.5, rgba(hot, 0.55)); edge.addColorStop(1, rgba(col, 0.15));
      c.strokeStyle = edge; c.lineWidth = 1.6 * u; c.lineJoin = 'round'; c.beginPath();
      for (var i3 = 0; i3 < ridge.length; i3++) { var p3 = ridgePt(i3); i3 ? c.lineTo(p3[0], p3[1]) : c.moveTo(p3[0], p3[1]); }
      c.stroke();
      /* the climbers: lights going up both ridges */
      for (var k = 0; k < climbers.length; k++) {
        var C = climbers[k];
        if (live) C.s += C.v * dt;
        if (C.s >= 1) { C.s = 0; C.v = 0.05 + R() * 0.07; }
        var h = climbPos(C.side, C.s), tl = climbPos(C.side, Math.max(0, C.s - 0.06));
        var cg = c.createLinearGradient(tl[0], tl[1], h[0], h[1]);
        cg.addColorStop(0, rgba(hot, 0)); cg.addColorStop(1, rgba(white, 0.9));
        c.strokeStyle = cg; c.lineWidth = 2.2 * u; c.beginPath(); c.moveTo(tl[0], tl[1]); c.lineTo(h[0], h[1]); c.stroke();
        glow(h[0], h[1], 7 * u, [[0, rgba(white, 0.9)], [1, rgba(hot, 0)]]);
      }
      /* the star on the tip */
      var beat = 0.5 + 0.5 * Math.sin(t * 1.6);
      glow(P[0], P[1], sc * (0.16 + 0.03 * beat), [[0, rgba(white, 0.9)], [0.12, rgba(ice, 0.55)], [1, rgba(hot, 0)]]);
      flare(P[0], P[1] - 2 * u, sc * (0.2 + 0.04 * beat), 0.95, Math.sin(t * 0.3) * 0.08);
      flare(P[0], P[1] - 2 * u, sc * 0.1, 0.5, Math.PI / 4);
      /* mist on the foot */
      c.globalCompositeOperation = 'source-over';
      var mist = c.createLinearGradient(0, (base - 0.12) * H, 0, base * H);
      mist.addColorStop(0, 'rgba(120,160,220,0)'); mist.addColorStop(1, 'rgba(120,160,220,.16)');
      c.fillStyle = mist; c.fillRect(0, (base - 0.12) * H, W, 0.12 * H);
      c.fillStyle = '#05070c'; c.fillRect(0, base * H, W, H - base * H);
      c.globalCompositeOperation = 'lighter';
    }

    /* ---- orbit ---- */
    function orbit(dt) {
      var X = fx * W, Y = fy * H, r0 = Math.min(W, H * 1.3) * 0.15;
      glow(X, Y, r0 * 4.2, [[0, rgba(hot, 0.3)], [0.4, rgba(col, 0.12)], [1, rgba(col, 0)]]);
      function ringPt(Rg, a) {
        var rx = Rg.r * r0, ry = rx * Rg.k, x = Math.cos(a) * rx, y = Math.sin(a) * ry, ct = Math.cos(Rg.tl), st = Math.sin(Rg.tl);
        return [X + x * ct - y * st, Y + x * st + y * ct, Math.sin(a)];
      }
      function drawRing(Rg, front) {
        c.strokeStyle = rgba(front ? ice : hot, front ? 0.5 : 0.2); c.lineWidth = (front ? 1.4 : 1) * u;
        c.beginPath();
        for (var s = 0; s <= 48; s++) {
          var a = (front ? 0 : Math.PI) + s / 48 * Math.PI, p = ringPt(Rg, a);
          s ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]);
        }
        c.stroke();
      }
      function bodies(front) {
        for (var g = 0; g < rings.length; g++) {
          var Rg = rings[g];
          for (var b = 0; b < Rg.b.length; b++) {
            var a = Rg.b[b] + t * Rg.v, p = ringPt(Rg, a);
            if ((p[2] > 0) !== front) continue;
            var depth = 0.55 + 0.45 * p[2];
            for (var k = 1; k <= 10; k++) {
              var q = ringPt(Rg, a - k * 0.045 * Math.sign(Rg.v));
              c.fillStyle = rgba(hot, depth * (1 - k / 11) * 0.5);
              c.beginPath(); c.arc(q[0], q[1], (2.6 - k * 0.18) * u, 0, TAU); c.fill();
            }
            glow(p[0], p[1], 10 * u * depth, [[0, rgba(white, depth)], [1, rgba(hot, 0)]]);
          }
        }
      }
      for (var g = 0; g < rings.length; g++) drawRing(rings[g], false);
      bodies(false);
      /* the planet: lit from the upper left, a rim of light */
      c.globalCompositeOperation = 'source-over';
      var pl = c.createRadialGradient(X - r0 * 0.4, Y - r0 * 0.45, r0 * 0.1, X, Y, r0);
      pl.addColorStop(0, '#e9f1fb'); pl.addColorStop(0.25, rgba(hot, 1)); pl.addColorStop(0.7, '#2a4470'); pl.addColorStop(1, '#0b1424');
      c.fillStyle = pl; c.beginPath(); c.arc(X, Y, r0, 0, TAU); c.fill();
      /* bands on the planet */
      c.save(); c.beginPath(); c.arc(X, Y, r0, 0, TAU); c.clip();
      for (var s = 0; s < 4; s++) {
        var yy = Y - r0 * 0.6 + s * r0 * 0.4 + Math.sin(t * 0.3 + s) * r0 * 0.04;
        c.fillStyle = 'rgba(10,20,40,.18)'; c.fillRect(X - r0, yy, r0 * 2, r0 * 0.12);
      }
      c.restore();
      c.globalCompositeOperation = 'lighter';
      c.strokeStyle = rgba(ice, 0.55); c.lineWidth = 1.2 * u; c.beginPath(); c.arc(X, Y, r0, Math.PI * 0.9, Math.PI * 1.75); c.stroke();
      glow(X, Y, r0 * 1.6, [[0.6, rgba(hot, 0)], [0.66, rgba(hot, 0.22 + 0.08 * Math.sin(t * 1.2))], [1, rgba(col, 0)]]);
      for (var g2 = 0; g2 < rings.length; g2++) drawRing(rings[g2], true);
      bodies(true);
    }

    /* ---- trail ---- */
    function trail(dt) {
      var X = fx * W, Hz = base * H, gh = H - Hz, Rm = Math.min(W, H) * 0.26;
      /* the moon rising over the horizon, banded at its foot */
      glow(X, Hz, Rm * 2.6, [[0, rgba(hot, 0.3)], [0.5, rgba(col, 0.1)], [1, rgba(col, 0)]]);
      c.save(); c.beginPath(); c.rect(0, 0, W, Hz); c.clip();
      c.globalCompositeOperation = 'source-over';
      var my = Hz + Rm * 0.18 - Math.sin(t * 0.15) * Rm * 0.05;
      var mg = c.createLinearGradient(0, my - Rm, 0, my + Rm * 0.3);
      mg.addColorStop(0, '#f2f7fd'); mg.addColorStop(0.4, rgba(hot, 1)); mg.addColorStop(0.85, '#3d6299'); mg.addColorStop(1, '#22385e');
      c.fillStyle = mg; c.beginPath(); c.arc(X, my, Rm, 0, TAU); c.fill();
      c.globalCompositeOperation = 'destination-out';
      for (var s = 0; s < 6; s++) {
        var gy = my - Rm * 0.05 + s * Rm * 0.16 + ((t * 8 * u) % (Rm * 0.16));
        c.fillRect(X - Rm, gy, Rm * 2, (2 + s * 2.2) * u);
      }
      c.restore();
      c.globalCompositeOperation = 'lighter';
      /* the ground: lines to the vanishing point, rows streaming at you */
      c.fillStyle = '#05070c'; c.globalCompositeOperation = 'source-over'; c.fillRect(0, Hz, W, gh); c.globalCompositeOperation = 'lighter';
      c.lineWidth = u;
      for (var l = -10; l <= 10; l++) {
        var bx = X + l * W * 0.16;
        var lg = c.createLinearGradient(0, Hz, 0, H);
        lg.addColorStop(0, rgba(hot, 0)); lg.addColorStop(1, rgba(col, 0.4 - Math.abs(l) * 0.025));
        c.strokeStyle = lg; c.beginPath(); c.moveTo(X + l * W * 0.005, Hz); c.lineTo(bx, H); c.stroke();
      }
      var rows = 9;
      for (var k = 0; k < rows; k++) {
        var z = ((k + t * 0.6) % rows) / rows, y = Hz + gh * Math.pow(z, 2.4);
        c.strokeStyle = rgba(hot, z * 0.45); c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
      }
      /* the road of light winding to the horizon */
      function roadX(z, side) { return X + (Math.sin(z * 3 + t * 0.35) * 0.08 * W * z) + side * (0.006 + z * 0.16) * W; }
      for (var sd = -1; sd <= 1; sd += 2) {
        c.beginPath();
        for (var q = 0; q <= 30; q++) { var zz = q / 30, yq = Hz + gh * Math.pow(zz, 2.4); q ? c.lineTo(roadX(zz, sd), yq) : c.moveTo(roadX(zz, sd), yq); }
        var eg = c.createLinearGradient(0, Hz, 0, H);
        eg.addColorStop(0, rgba(white, 0.9)); eg.addColorStop(1, rgba(hot, 0.5));
        c.strokeStyle = eg; c.lineWidth = 1.8 * u; c.stroke();
      }
      /* streaks of light on the road, coming at you */
      for (var i = 0; i < streaks.length; i++) {
        var St = streaks[i];
        if (live) St.z += St.v * dt * (0.3 + St.z);
        if (St.z > 1) { St.z = 0.02; St.side = R() < 0.5 ? -1 : 1; }
        var z1 = St.z, z0 = Math.max(0, z1 - 0.08), off = St.side * 0.45;
        var x1 = roadX(z1, off), y1 = Hz + gh * Math.pow(z1, 2.4), x0 = roadX(z0, off), y0 = Hz + gh * Math.pow(z0, 2.4);
        var sg = c.createLinearGradient(x0, y0, x1, y1);
        sg.addColorStop(0, rgba(hot, 0)); sg.addColorStop(1, rgba(white, 0.9));
        c.strokeStyle = sg; c.lineWidth = (0.8 + z1 * 3) * u; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
      }
      /* the horizon line */
      var hg = c.createLinearGradient(0, 0, W, 0);
      hg.addColorStop(0, rgba(hot, 0)); hg.addColorStop(fx, rgba(white, 1)); hg.addColorStop(1, rgba(hot, 0));
      c.fillStyle = hg; c.fillRect(0, Hz - u, W, 2 * u);
    }

    /* ---- pulse ---- */
    function ecg(ph) {
      /* one beat over ph 0..1: flat, P, QRS spike, T */
      if (ph < 0.3) return 0;
      if (ph < 0.38) return -0.12 * Math.sin((ph - 0.3) / 0.08 * Math.PI);
      if (ph < 0.42) return 0.25 * ((ph - 0.38) / 0.04);
      if (ph < 0.46) return 0.25 - 1.25 * ((ph - 0.42) / 0.04);
      if (ph < 0.5) return -1 + 1.35 * ((ph - 0.46) / 0.04);
      if (ph < 0.53) return 0.35 - 0.35 * ((ph - 0.5) / 0.03);
      if (ph < 0.72) return -0.22 * Math.sin((ph - 0.56) / 0.16 * Math.PI) * (ph > 0.56 ? 1 : 0);
      return 0;
    }
    function pulse(dt) {
      var X = fx * W, Y = fy * H, sc = Math.min(W, H), per = 1.15;
      var bt = t / per, beatN = Math.floor(bt + 0.56);
      if (!live) waves = [0.2, 0.55];
      else if (beatN !== beatAt) { beatAt = beatN; waves.push(0); }
      glow(X, Y, sc * 0.6, [[0, rgba(hot, 0.28)], [0.5, rgba(col, 0.1)], [1, rgba(col, 0)]]);
      for (var w = waves.length - 1; w >= 0; w--) {
        if (live) waves[w] += dt / 2.4;
        var a = waves[w];
        if (a >= 1) { waves.splice(w, 1); continue; }
        c.strokeStyle = rgba(ice, (1 - a) * 0.55); c.lineWidth = (3 - a * 2.4) * u;
        c.beginPath(); c.ellipse(X, Y, a * sc * 0.75, a * sc * 0.75 * 0.62, 0, 0, TAU); c.stroke();
      }
      var kick = Math.max(0, 1 - ((bt + 0.56) % 1) * 4);
      glow(X, Y, sc * (0.1 + kick * 0.05), [[0, rgba(white, 0.95)], [0.3, rgba(ice, 0.6)], [1, rgba(hot, 0)]]);
      flare(X, Y, sc * (0.14 + kick * 0.08), 0.8, 0);
      /* the line: the head sweeps across, the trail fades behind it */
      var span = W / 2.2, amp = sc * 0.16, head = ((t / (per * 2.2)) % 1) * (W + 60 * u) - 30 * u;
      var ly = Y + sc * 0.02;
      c.lineWidth = 2 * u; c.lineJoin = 'round';
      var prev = null;
      for (var x = 0; x <= W; x += 3 * u) {
        var behind = head - x;
        if (behind < 0) behind += W + 60 * u;
        var al = Math.max(0, 1 - behind / (W * 0.9));
        var ph = ((x / span) + 0.15) % 1, y = ly + ecg(ph) * amp;
        if (prev && al > 0.01) { c.strokeStyle = rgba(behind < 30 * u ? white : hot, al * 0.9); c.beginPath(); c.moveTo(prev[0], prev[1]); c.lineTo(x, y); c.stroke(); }
        prev = [x, y];
      }
      var hy = ly + ecg(((head / span) + 0.15) % 1) * amp;
      glow(head, hy, 14 * u, [[0, rgba(white, 1)], [1, rgba(hot, 0)]]);
    }

    /* ---- constellation ---- */
    function constellation(dt) {
      var PX = fx * W, PY = -0.15 * H, D = Math.hypot(W, H);
      /* star trails turning round the pole */
      for (var i = 0; i < trails.length; i++) {
        var T = trails[i], a = T.a + t * 0.025;
        c.strokeStyle = rgba(i % 5 ? hot : ice, T.al); c.lineWidth = T.w * u;
        c.beginPath(); c.arc(PX, PY, T.r * D * 0.5, a, a + T.l); c.stroke();
      }
      glow(PX, PY, 40 * u, [[0, rgba(white, 0.7)], [1, rgba(hot, 0)]]);
      /* the figure drawing itself: 10 s a cycle, still shows it whole */
      var cyc = live ? (t % 12) / 12 : 0.7, n = figure.length - 1;
      var drawn = Math.min(1, cyc / 0.55) * n, fade = cyc > 0.85 ? 1 - (cyc - 0.85) / 0.15 : 1;
      glow(fx * W, fy * H, Math.min(W, H) * 0.55, [[0, rgba(col, 0.2)], [1, rgba(col, 0)]]);
      c.lineWidth = 1.3 * u;
      for (var k = 0; k < n; k++) {
        if (k >= drawn) break;
        var q = Math.min(1, drawn - k), A = figure[k], B = figure[k + 1];
        var ax = A[0] * W, ay = A[1] * H, bx = ax + (B[0] * W - ax) * q, by = ay + (B[1] * H - ay) * q;
        c.strokeStyle = rgba(hot, 0.6 * fade); c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
        if (q < 1) glow(bx, by, 9 * u, [[0, rgba(white, fade)], [1, rgba(hot, 0)]]);
      }
      for (var s = 0; s <= n; s++) {
        var P = figure[s], on = s <= drawn, tw = 0.7 + 0.3 * Math.sin(t * 2 + s);
        var x = P[0] * W, y = P[1] * H;
        if (on) flare(x, y, (s === 0 ? 26 : 14) * u * tw, 0.9 * fade + 0.1, 0);
        else { c.fillStyle = rgba(hot, 0.35); c.beginPath(); c.arc(x, y, 1.4 * u, 0, TAU); c.fill(); }
      }
    }

    var SCENES = { summit: summit, orbit: orbit, trail: trail, pulse: pulse, constellation: constellation };
    var draw = SCENES[scene] || summit;

    function frame(dt) {
      t += dt;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, W, H);
      c.globalCompositeOperation = 'lighter';
      sky(dt);
      draw(dt);
      c.globalCompositeOperation = 'source-over';
    }
    function loop(now) {
      if (!live) return;
      if (!cv.isConnected) { stop(); return; }
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      if (!document.hidden && seen) frame(dt);
      raf = requestAnimationFrame(loop);
    }
    var io = null, ro = null;
    function stop() { live = false; cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (io) io.disconnect(); }

    if (!size()) return { stop: function () {} };
    t = 6 + R() * 4;
    if (!live) frame(0);
    else {
      frame(0);
      raf = requestAnimationFrame(loop);
      if (typeof IntersectionObserver === 'function') { io = new IntersectionObserver(function (es) { seen = es[es.length - 1].isIntersecting; last = 0; }); io.observe(cv); }
    }
    if (typeof ResizeObserver === 'function') { ro = new ResizeObserver(function () { if (size()) frame(0); }); ro.observe(cv); }
    return { stop: stop };
  }

  window.ZenithSky = { mount: mount };
})();
