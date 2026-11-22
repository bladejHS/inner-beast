/* GENESIS (2026-11-22), the opening of ZENITH. The user: "fă animația de la început mai spectaculoasă și mai uimitoare,
   extrem de complexă, cu foarte multe detalii". Replaces THE ASCENT. Scene time T, in seconds (ZEN = the ignition):
     0     HYPERSPACE: a jump through the stars; hundreds of streaks and rings of light rush past from the centre, a
           targeting HUD wakes in the corners (brackets, a turning reticle, coordinates, an altitude counter)
     1.45  DROP-OUT: the jump ends in a soft bloom; the streaks settle into a deep starfield, a nebula and a milky band
           glow up behind it, aurora curtains ripple in, the horizon line ignites
     1.5   THE RANGE: three ranges of faceted mountains rise on both sides, their ridges drawn in light, beacons on
           the summits; the altitude counter climbs to 8848 m
     1.7   THE GATHERING: sparks spiral in from a vortex round the peak and settle into the mark's exact pixels; a
           constellation draws the peak's outline; three orbit rings close in on the dial; a comet climbs a helix to
           the tip; lines of light converge, the sky darkens, a countdown runs
     3.0   ZENITH: a white-out, an anamorphic flare across the screen, an eight-point star, lens ghosts, three chromatic
           shock rings and a ground wave along the horizon, god rays, debris and embers, the ranges' ridges flash,
           the camera shakes; the page shows the mark and stamps the name (onImpact)
     3.0+  AFTERGLOW: rays turning, a light running twice round the dial, sparks orbiting it, shooting stars, dust,
           the HUD reports SUMMIT REACHED and fades
     exit  the stars streak upward (warp), the black parts and the mark flies into the tab bar
   The mark is the page's own image (.sp-stage img): the sparks sample its pixels, so they land exactly on it.
   API (unchanged): BeastIgnite.create({ canvas, stage, root, onImpact, color, hot }) → { start(), still(T), at(T), burst(), destroy() } */
(function () {
  'use strict';
  var ZEN = 3.0, DROP = 1.45, TAU = Math.PI * 2;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mix(a, b, u) { return a + (b - a) * u; }
  function easeIn(x) { return x * x * x; }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + clamp(a, 0, 1).toFixed(3) + ')'; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function seg(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }

  /* a soft round glow, drawn once, stamped many times */
  function sprite(col) {
    var s = document.createElement('canvas'); s.width = s.height = 64;
    var x = s.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.18, rgba(col, 0.85)); g.addColorStop(0.5, rgba(col, 0.22)); g.addColorStop(1, rgba(col, 0));
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    return s;
  }
  /* a vertical ray for the aurora curtains: bright foot, fading up */
  function raySprite(col) {
    var s = document.createElement('canvas'); s.width = 4; s.height = 128;
    var x = s.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, rgba(col, 0)); g.addColorStop(0.55, rgba(col, 0.35)); g.addColorStop(0.9, rgba(col, 0.9)); g.addColorStop(1, rgba(col, 0));
    x.fillStyle = g; x.fillRect(0, 0, 4, 128);
    return s;
  }

  function create(o) {
    var cv = o.canvas, c = cv.getContext('2d');
    var blue = o.color || [120, 151, 192], hot = o.hot || [159, 192, 236], white = [244, 248, 255];
    var violet = [160, 140, 240], cyan = [130, 215, 235], deep = [60, 90, 170];
    var W = 0, H = 0, dpr = 1, raf = 0, last = 0, T = 0, live = true, hit = false, warp = 0, shake = 0, small = false;
    var st = { x: 0, y: 0, w: 0, h: 0 }, apex = [0, 0], ring = [0, 0, 0], horizon = 0, F = 1;
    var stars = [], tunnel = [], parts = [], debris = [], embers = [], rings = [], orbit = [], ranges = [], beacons = [], meteors = [], dust = [], conv = [], cons = [], nebula = null, mc = null, mctx = null;
    var G = { w: sprite(white), h: sprite(hot), v: sprite(violet), c: sprite(cyan) };
    var RAY = [raySprite(cyan), raySprite(hot), raySprite(violet)];
    var nextMeteor = ZEN + 0.4;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth || innerWidth; H = cv.clientHeight || innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      small = W * H < 500000;
      var r = o.stage && o.stage.getBoundingClientRect();
      st = r && r.width ? { x: r.left, y: r.top, w: r.width, h: r.height } : { x: W / 2 - 150, y: H * 0.1, w: 300, h: 353 };
      // where the mark's parts sit in the 680 × 801 picture (scripts/forge.mjs)
      apex = [st.x + st.w * 0.5, st.y + st.h * 0.272];
      ring = [st.x + st.w * 0.5, st.y + st.h * 0.5, st.w * 0.387];
      horizon = st.y + st.h * 0.728;
      F = Math.min(W, H) * 0.55;
    }

    /* the stars live in 3D during the jump; afterwards they are the sky */
    function makeStars() {
      stars = [];
      var n = Math.round(clamp(W * H / 1700, 180, 460));
      for (var i = 0; i < n; i++) {
        var z = rnd(0.08, 1.6);
        stars.push({ x: rnd(-1.6, 1.6), y: rnd(-1.6, 1.6), z: z, f: rnd(0, TAU), s: rnd(0.6, 3.2), m: rnd(0.4, 1), col: Math.random() < 0.15 ? violet : Math.random() < 0.2 ? cyan : Math.random() < 0.5 ? white : hot, oy: 0 });
      }
      tunnel = [];
      for (var k = 0; k < 9; k++) tunnel.push({ z: 0.2 + k * 0.16, r: rnd(0.9, 1.3), col: [cyan, hot, violet][k % 3], tw: rnd(0, TAU) });
      dust = [];
      for (var d = 0; d < 70; d++) dust.push({ x: Math.random() * W, y: Math.random() * H, v: rnd(4, 16), r: rnd(0.4, 1.3), f: rnd(0, TAU) });
    }

    /* the nebula and the milky band, painted once at a quarter of the size */
    function makeNebula() {
      var q = 1, nw = Math.max(2, Math.round(W / q)), nh = Math.max(2, Math.round(H / q));
      var n = document.createElement('canvas'); n.width = nw; n.height = nh;
      var x = n.getContext('2d');
      x.globalCompositeOperation = 'lighter';
      for (var i = 0; i < 70; i++) {
        var u = Math.random(), bx = mix(-0.1, 1.1, u) * nw, by = (mix(0.62, 0.02, u) + rnd(-0.12, 0.12)) * nh * 0.85;
        var r = rnd(0.06, 0.28) * Math.max(nw, nh), col = [deep, violet, cyan, blue][i % 4];
        var g = x.createRadialGradient(bx, by, 0, bx, by, r);
        g.addColorStop(0, rgba(col, rnd(0.05, 0.13))); g.addColorStop(1, rgba(col, 0));
        x.fillStyle = g; x.beginPath(); x.arc(bx, by, r, 0, TAU); x.fill();
      }
      // the band's grain: thousands of faint specks
      for (var k = 0; k < 900; k++) {
        var v = Math.random(), sx = v * nw, sy = (mix(0.62, 0.02, v) + (Math.random() + Math.random() - 1) * 0.1) * nh * 0.85;
        x.fillStyle = rgba(white, rnd(0.05, 0.3)); x.beginPath(); x.arc(sx, sy, rnd(0.3, 0.8), 0, TAU); x.fill();
      }
      nebula = n;
    }

    /* three ranges either side of the mark, a valley where the mark stands */
    function makeRanges() {
      ranges = []; beacons = [];
      for (var L = 0; L < 3; L++) {
        var pts = [], n = 34, amp = H * [0.11, 0.16, 0.22][L], base = horizon;
        for (var i = 0; i <= n; i++) {
          var x = mix(-0.06, 1.06, i / n) * W, d = Math.abs(x - apex[0]);
          var valley = smooth(st.w * (0.16 + L * 0.04), st.w * (0.8 + L * 0.1), d);
          var h = amp * valley * (0.3 + 0.7 * Math.abs(Math.sin(i * (0.9 + L * 0.37) + L * 2.1))) * (0.85 + Math.random() * 0.3);
          pts.push([x, base - h, valley]);
        }
        var len = 0;
        for (var j = 1; j < pts.length; j++) len += Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]);
        var facets = [];
        for (var f = 1; f < pts.length - 1; f++) if (pts[f][2] > 0.15 && pts[f][1] < pts[f - 1][1] && pts[f][1] < pts[f + 1][1]) {
          facets.push([pts[f][0], pts[f][1], pts[f][0] + rnd(-30, 30), base]);
          facets.push([pts[f][0], pts[f][1], pts[f - 1][0], base - (base - pts[f - 1][1]) * 0.3]);
          if (Math.random() < 0.8) beacons.push({ x: pts[f][0], y: pts[f][1], L: L, f: rnd(0, TAU), s: rnd(2, 4) });
        }
        ranges.push({ pts: pts, len: len, base: base, facets: facets, L: L });
      }
      mc = document.createElement('canvas'); mc.width = cv.width; mc.height = cv.height; mctx = mc.getContext('2d');
    }

    // the mark's opaque pixels are where the sparks land; bright ones (the peak's lit side, the star) burn whiter
    function sample(img) {
      var k = 130, ow = k, oh = Math.round(k * (img.naturalHeight || 801) / (img.naturalWidth || 680));
      var oc = document.createElement('canvas'); oc.width = ow; oc.height = oh;
      var x = oc.getContext('2d'); x.drawImage(img, 0, 0, ow, oh);
      var d; try { d = x.getImageData(0, 0, ow, oh).data; } catch (e) { return []; }
      var pts = [];
      for (var yy = 0; yy < oh; yy++) for (var xx = 0; xx < ow; xx++) {
        var i = (yy * ow + xx) * 4;
        if (d[i + 3] < 140) continue;
        var lum = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255;
        if (lum < 0.12 && Math.random() < 0.7) continue;
        // an edge pixel (a neighbour is transparent) can carry a constellation star
        var edge = (xx > 0 && d[i - 1] < 140) || (xx < ow - 1 && d[i + 7] < 140) || (yy > 0 && d[i - ow * 4 + 3] < 140) || (yy < oh - 1 && d[i + ow * 4 + 3] < 140);
        pts.push([xx / ow, yy / oh, lum, edge]);
      }
      return pts;
    }

    function makeParts() {
      parts = []; cons = [];
      var img = o.stage && o.stage.querySelector('img');
      var pts = img && img.complete && img.naturalWidth ? sample(img) : [];
      var want = Math.min(pts.length, small ? 1100 : 1500);
      for (var i = 0; i < want; i++) {
        var p = pts[Math.floor(Math.random() * pts.length)];
        var tx = st.x + p[0] * st.w, ty = st.y + p[1] * st.h;
        // a spiral from the vortex: start far out at an angle, wind in to the pixel
        var a0 = Math.atan2(ty - apex[1], tx - apex[0]) + rnd(2.2, 4.4), r0 = Math.max(W, H) * rnd(0.55, 1.1);
        parts.push({ tx: tx, ty: ty, a0: a0, r0: r0, t0: 1.6 + (1 - p[1]) * 0.25 + Math.random() * 0.6, dur: rnd(0.65, 1.0), l: p[2], x: 0, y: 0, px: 0, py: 0, u: 0, glit: Math.random() < 0.07 });
      }
      // the constellation: the mark's top outline, walked from left to right through the apex
      var edges = pts.filter(function (p) { return p[3] && p[1] < 0.74; });
      var picks = [];
      for (var s = 0; s < 13 && edges.length; s++) {
        var e = edges[Math.floor(Math.random() * edges.length)];
        picks.push([st.x + e[0] * st.w, st.y + e[1] * st.h]);
      }
      picks.push([apex[0], apex[1]]);
      picks.sort(function (a, b) { return Math.atan2(a[1] - ring[1], a[0] - ring[0]) - Math.atan2(b[1] - ring[1], b[0] - ring[0]); });
      cons = picks;
      orbit = [];
      for (var k = 0; k < 60; k++) orbit.push({ a: rnd(0, TAU), v: rnd(0.25, 0.7) * (Math.random() < 0.5 ? 1 : -1), r: rnd(0.94, 1.22), s: rnd(0.6, 2), f: rnd(0, TAU) });
      conv = [];
      for (var q = 0; q < 34; q++) { var a = rnd(0, TAU), d = Math.max(W, H) * rnd(0.5, 0.9); conv.push({ x: apex[0] + Math.cos(a) * d, y: apex[1] + Math.sin(a) * d, t0: rnd(2.3, 2.85), col: [white, hot, cyan, violet][q % 4] }); }
    }

    function zenith() {
      hit = true; shake = 11;
      rings.push(
        { t: 0, r0: 4, r1: Math.max(W, H) * 1.05, life: 1.25, w: 4, col: white, k: 1 },
        { t: -0.05, r0: 4, r1: Math.max(W, H) * 0.98, life: 1.2, w: 3, col: cyan, k: 1 },
        { t: -0.1, r0: 4, r1: Math.max(W, H) * 0.9, life: 1.15, w: 3, col: violet, k: 1 },
        { t: -0.12, r0: 4, r1: ring[2] * 2.4, life: 0.75, w: 2, col: hot, k: 1 },
        { t: 0.05, r0: 10, r1: W * 1.2, life: 1.1, w: 3, col: hot, k: 0.12, y: horizon }
      );
      var nd = small ? 220 : 320;
      for (var k = 0; k < nd; k++) {
        var a = Math.random() * TAU, v = rnd(80, 900) * (Math.random() < 0.2 ? 1.4 : 1);
        debris.push({ x: apex[0], y: apex[1], px: apex[0], py: apex[1], vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, t: 0, life: rnd(0.5, 1.6), w: rnd(0.7, 2.4), col: [white, hot, cyan, violet][k % 4] });
      }
      for (var e = 0; e < 70; e++) embers.push({ x: apex[0] + rnd(-30, 30), y: apex[1] + rnd(-10, 30), vx: rnd(-50, 50), vy: rnd(-120, -30), t: 0, life: rnd(1.4, 3), r: rnd(0.8, 2.2), f: rnd(0, TAU) });
      if (o.onImpact) try { o.onImpact(); } catch (e2) { /* the page's part */ }
    }

    function speed(t) { return t < DROP ? 2.4 * Math.pow(1 - t / DROP, 1.6) + 0.02 : 0; }

    function update(dt) {
      var was = T; T += dt;
      if (was < ZEN && T >= ZEN && !hit) zenith();
      shake *= Math.pow(0.002, dt);
      var v = speed(T);
      for (var n = 0; n < stars.length; n++) {
        var s = stars[n];
        s.pz = s.z;
        if (v > 0) { s.z -= v * dt; if (s.z < 0.06) { s.z += 1.5; s.pz = s.z; s.x = rnd(-1.6, 1.6); s.y = rnd(-1.6, 1.6); } }
        if (warp > 0) s.oy -= (200 + warp * 1600) * s.m * dt;
      }
      for (var k = 0; k < tunnel.length; k++) { var tn = tunnel[k]; tn.pz = tn.z; tn.z -= v * 0.9 * dt; if (tn.z < 0.05 && T < DROP - 0.35) tn.z += 1.45; }
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], u = clamp((T - p.t0) / p.dur, 0, 1), e = easeInOut(u);
        p.px = p.x; p.py = p.y;
        var ang = p.a0 * (1 - e) + Math.atan2(p.ty - apex[1], p.tx - apex[0]) * e;
        var rad = mix(p.r0, Math.hypot(p.tx - apex[0], p.ty - apex[1]), easeOut(u));
        var sx = apex[0] + Math.cos(ang) * rad, sy = apex[1] + Math.sin(ang) * rad;
        p.x = mix(sx, p.tx, e * e); p.y = mix(sy, p.ty, e * e);
        if (!p.u && u > 0) { p.px = p.x; p.py = p.y; }
        p.u = u;
      }
      for (var j = debris.length - 1; j >= 0; j--) {
        var d = debris[j]; d.t += dt;
        if (d.t > d.life) { debris.splice(j, 1); continue; }
        d.px = d.x; d.py = d.y; d.vx *= Math.pow(0.16, dt); d.vy = d.vy * Math.pow(0.16, dt) + 140 * dt;
        d.x += d.vx * dt; d.y += d.vy * dt;
      }
      for (var m = embers.length - 1; m >= 0; m--) { var em = embers[m]; em.t += dt; if (em.t > em.life) { embers.splice(m, 1); continue; } em.vx += Math.sin(T * 3 + em.f) * 30 * dt; em.x += em.vx * dt; em.y += em.vy * dt; em.vy *= Math.pow(0.6, dt); }
      for (var r = rings.length - 1; r >= 0; r--) { rings[r].t += dt; if (rings[r].t > rings[r].life) rings.splice(r, 1); }
      for (var b = 0; b < orbit.length; b++) orbit[b].a += orbit[b].v * dt;
      for (var q = 0; q < dust.length; q++) { var du = dust[q]; du.y -= du.v * dt; du.x += Math.sin(T + du.f) * 4 * dt; if (du.y < -5) { du.y = H + 5; du.x = Math.random() * W; } }
      if (T > nextMeteor && live) { meteors.push({ x: rnd(0.15, 1) * W, y: rnd(0, 0.35) * H, a: Math.PI * rnd(0.72, 0.86), t: 0, v: rnd(700, 1100) }); nextMeteor = T + rnd(0.5, 1.1); }
      for (var mt = meteors.length - 1; mt >= 0; mt--) { meteors[mt].t += dt; if (meteors[mt].t > 0.7) meteors.splice(mt, 1); }
      if (warp > 0) warp = Math.min(1, warp + dt * 2.2);
    }

    function stamp(spr, x, y, r, a) { if (a <= 0.004) return; c.globalAlpha = clamp(a, 0, 1); c.drawImage(spr, x - r, y - r, r * 2, r * 2); c.globalAlpha = 1; }
    function line(x0, y0, x1, y1, col, a, w) { c.strokeStyle = rgba(col, a); c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
    function text(s, x, y, a, align, size, col) {
      if (a <= 0.01) return;
      c.font = '700 ' + (size || 10) + 'px Saira, "Arial Narrow", system-ui, sans-serif';
      c.textAlign = align || 'left'; c.fillStyle = rgba(col || hot, a);
      if ('letterSpacing' in c) c.letterSpacing = '2px';
      c.fillText(s, x, y);
    }

    function draw() {
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      if (shake > 0.3) c.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      var z = T - ZEN, flash = hit ? Math.exp(-z * 3) : 0, after = hit ? seg(z, 0, 0.6) : 0;
      var sky = seg(T, DROP - 0.2, DROP + 0.9), v = speed(T);
      var cx = apex[0], cy = mix(H * 0.46, apex[1], 0.5);
      c.globalCompositeOperation = 'lighter';
      c.lineCap = 'round'; c.lineJoin = 'round';

      /* 1 the nebula and the milky band */
      if (nebula && sky > 0) {
        var zs = 1.12 - 0.12 * easeOut(sky) + 0.02 * Math.sin(T * 0.3);
        c.globalAlpha = sky * (0.85 + 0.25 * flash);
        c.drawImage(nebula, W / 2 - W * zs / 2, H / 2 - H * zs / 2 - T * 2, W * zs, H * zs);
        c.globalAlpha = 1;
      }

      /* 2 aurora curtains: hundreds of rays rippling */
      var au = seg(T, 1.0, 2.2) * (1 - 0.3 * seg(T, 2.4, ZEN)) + after * 0.25;
      if (au > 0) {
        var step = small ? 7 : 5;
        for (var b = 0; b < 3; b++) {
          var yb = st.y + st.h * (-0.04 + b * 0.07), spr = RAY[b];
          for (var x = -10; x < W + 10; x += step) {
            var w1 = Math.sin(x / (160 + b * 50) + T * (0.6 + b * 0.25) + b * 2), w2 = Math.sin(x / 47 + T * 1.7 + b);
            var top = yb + w1 * (26 + b * 10) - 40 - b * 12, len = 90 + 50 * (0.5 + 0.5 * w2) + b * 20;
            var a = au * (0.09 + 0.08 * (0.5 + 0.5 * Math.sin(x / 23 + T * 2.3 + b * 4))) * (1 - Math.abs(x / W - 0.5) * 0.6);
            c.globalAlpha = clamp(a, 0, 1); c.drawImage(spr, x, top, step, len);
          }
        }
        c.globalAlpha = 1;
      }

      /* 3 the stars: streaks during the jump, a twinkling sky after it, streaking up on the way out */
      var sa = seg(T, 0, 0.25);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var x1 = cx + (s.x / s.z) * F, y1 = cy + (s.y / s.z) * F + s.oy;
        if (x1 < -40 || x1 > W + 40 || y1 < -60 || y1 > H + 40) continue;
        var near = clamp(1.3 - s.z, 0.1, 1);
        if (v > 0.05) {
          var x0 = cx + (s.x / (s.z + v * 0.07)) * F, y0 = cy + (s.y / (s.z + v * 0.07)) * F;
          line(x0, y0, x1, y1, s.col, sa * near * 0.95, 0.5 + near * 1.6);
        } else if (warp > 0.02) {
          line(x1, y1, x1, y1 + warp * 110 * s.m, s.col, near, s.m * 1.4);
        } else {
          var tw = 0.5 + 0.5 * Math.sin(T * s.s + s.f), a2 = near * (0.35 + 0.65 * tw) * (hit && z < 0.45 ? 1.7 : 1) * (1 - 0.4 * seg(T, 2.4, ZEN) * (1 - after));
          c.fillStyle = rgba(s.col, a2); var sz = 0.6 + near * 1.6; c.fillRect(x1 - sz / 2, y1 - sz / 2, sz, sz);
          if (near > 0.85 && tw > 0.85) { line(x1 - 5, y1, x1 + 5, y1, white, (tw - 0.85) * 4, 0.6); line(x1, y1 - 5, x1, y1 + 5, white, (tw - 0.85) * 4, 0.6); }
        }
      }
      /* the tunnel: rings of light rushing past */
      if (T < DROP) {
        for (var k = 0; k < tunnel.length; k++) {
          var tn = tunnel[k], rr = (tn.r / tn.z) * F * 0.5, ta = sa * clamp(1 - tn.z / 1.5, 0, 1) * clamp(tn.z * 4, 0, 1) * (1 - seg(T, DROP - 0.4, DROP));
          if (rr > Math.max(W, H) * 1.5 || ta <= 0.01) continue;
          c.strokeStyle = rgba(tn.col, ta * 0.5); c.lineWidth = 1 + 2 / tn.z;
          c.beginPath(); c.ellipse(cx, cy, rr, rr * 0.92, T * 0.6 + tn.tw, 0, TAU); c.stroke();
          c.setLineDash([rr * 0.08, rr * 0.22]); c.strokeStyle = rgba(white, ta * 0.4); c.lineWidth = 0.8;
          c.beginPath(); c.arc(cx, cy, rr * 1.04, -T * 1.4, -T * 1.4 + TAU); c.stroke(); c.setLineDash([]);
        }
        stamp(G.c, cx, cy, 60 + 40 * Math.sin(T * 9), sa * 0.5 * (1 - seg(T, 1, DROP)));
      }
      /* the drop-out bloom */
      var drop = T > DROP - 0.1 ? Math.exp(-(T - DROP + 0.1) * 4.5) : 0;
      if (drop > 0.01) stamp(G.h, cx, cy, Math.max(W, H) * (0.4 + (T - DROP) * 0.8), drop * 0.8);

      /* 4 god rays from the apex once it has ignited */
      if (hit) {
        c.save(); c.translate(apex[0], apex[1]); c.rotate(z * 0.12);
        var ga = 0.045 + flash * 0.45;
        for (var g = 0; g < 28; g++) {
          var an = g / 28 * TAU, ln = Math.max(W, H) * (0.6 + 0.35 * Math.sin(g * 3.7 + T * 0.8)) * easeOut(seg(z, 0, 0.5)), wd = 0.035 + 0.02 * Math.sin(g * 1.3);
          var gr = c.createLinearGradient(0, 0, Math.cos(an) * ln, Math.sin(an) * ln);
          gr.addColorStop(0, rgba(white, ga * (g % 2 ? 0.6 : 1))); gr.addColorStop(1, rgba(g % 3 ? hot : violet, 0));
          c.fillStyle = gr; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(an - wd) * ln, Math.sin(an - wd) * ln); c.lineTo(Math.cos(an + wd) * ln, Math.sin(an + wd) * ln); c.fill();
        }
        c.restore();
      }

      /* 5 the ranges rise, ridges drawn in light, facets, beacons; drawn on their own layer so that, once the mark
         is lit, a soft hole opens where it stands */
      if (mctx && T > 1.4) {
        var X = mctx;
        X.setTransform(1, 0, 0, 1, 0, 0); X.clearRect(0, 0, mc.width, mc.height); X.setTransform(dpr, 0, 0, dpr, 0, 0);
        X.lineCap = 'round'; X.lineJoin = 'round';
        for (var L = 2; L >= 0; L--) {
          var R = ranges[L], ru = easeOut(seg(T, 1.45 + L * 0.12, 2.35 + L * 0.12));
          if (!R || ru <= 0) continue;
          X.save(); X.translate(0, (1 - ru) * H * 0.3);
          X.globalCompositeOperation = 'source-over';
          var fill = X.createLinearGradient(0, horizon - H * 0.22, 0, H);
          fill.addColorStop(0, ['#0c1526', '#132039', '#1b2b49'][L]); fill.addColorStop(0.35, '#080d18'); fill.addColorStop(1, '#05070c');
          X.fillStyle = fill; X.globalAlpha = ru;
          X.beginPath(); X.moveTo(R.pts[0][0], R.pts[0][1]);
          for (var p1 = 1; p1 < R.pts.length; p1++) X.lineTo(R.pts[p1][0], R.pts[p1][1]);
          X.lineTo(W + 20, H + 20); X.lineTo(-20, H + 20); X.closePath(); X.fill();
          X.globalAlpha = 1; X.globalCompositeOperation = 'lighter';
          var dr = seg(T, 1.6 + L * 0.1, 2.5 + L * 0.1), rim = (0.55 - L * 0.13) + flash * 0.9;
          for (var fa = 0; fa < R.facets.length; fa++) {
            var Fc = R.facets[fa];
            X.strokeStyle = rgba(hot, (0.12 + flash * 0.25) * ru); X.lineWidth = 0.8;
            X.beginPath(); X.moveTo(Fc[0], Fc[1]); X.lineTo(mix(Fc[0], Fc[2], dr), mix(Fc[1], Fc[3], dr)); X.stroke();
          }
          X.setLineDash([R.len * dr, R.len]);
          var eg = X.createLinearGradient(0, horizon - H * 0.22, 0, horizon);
          eg.addColorStop(0, rgba(white, rim)); eg.addColorStop(1, rgba(hot, rim * 0.35));
          X.strokeStyle = eg; X.lineWidth = 1.5 - L * 0.3;
          X.beginPath(); X.moveTo(R.pts[0][0], R.pts[0][1]);
          for (var p3 = 1; p3 < R.pts.length; p3++) X.lineTo(R.pts[p3][0], R.pts[p3][1]);
          X.stroke(); X.setLineDash([]);
          for (var bc = 0; bc < beacons.length; bc++) {
            var B = beacons[bc]; if (B.L !== L) continue;
            var ba = seg(T, 2.3, 2.6) * (0.5 + 0.5 * Math.sin(T * B.s + B.f));
            if (ba > 0.01 || flash > 0.01) { X.globalAlpha = clamp(ba * 0.9 + flash * 0.6, 0, 1); X.drawImage(G.w, B.x - 7, B.y - 9, 14, 14); X.globalAlpha = 1; }
          }
          X.restore();
        }
        if (hit) {
          X.globalCompositeOperation = 'destination-out';
          var hole = X.createRadialGradient(ring[0], ring[1], ring[2] * 0.7, ring[0], ring[1], ring[2] * 1.25);
          hole.addColorStop(0, 'rgba(0,0,0,' + after.toFixed(3) + ')'); hole.addColorStop(1, 'rgba(0,0,0,0)');
          X.fillStyle = hole; X.fillRect(ring[0] - ring[2] * 1.3, ring[1] - ring[2] * 1.3, ring[2] * 2.6, ring[2] * 2.6);
          X.globalCompositeOperation = 'source-over';
        }
        c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.drawImage(mc, 0, 0); c.restore();
        c.globalCompositeOperation = 'lighter';
      }

      /* 6 the horizon line and its glow; the ground wave */
      var hz = seg(T, DROP - 0.1, DROP + 0.5);
      if (hz > 0) {
        var hg = c.createLinearGradient(0, 0, W, 0);
        hg.addColorStop(0, rgba(hot, 0)); hg.addColorStop(0.5, rgba(white, 0.95 * hz)); hg.addColorStop(1, rgba(hot, 0));
        c.fillStyle = hg; c.fillRect(W / 2 - W / 2 * easeOut(hz), horizon - 1, W * easeOut(hz), 2);
        c.save(); c.translate(W / 2, horizon); c.scale(1, 0.14); stamp(G.h, 0, 0, W * 0.7, 0.35 * hz + after * 0.2 + flash * 0.4); c.restore();
      }

      /* 7 the orbit rings closing in on the dial */
      var oc = seg(T, 1.7, ZEN);
      if (oc > 0 && (!hit || z < 1.2)) {
        var oa = Math.sin(oc * Math.PI * 0.5) * (hit ? 1 - seg(z, 0, 1.2) : 1);
        for (var or = 0; or < 3; or++) {
          var rad = ring[2] * mix(3.2 - or * 0.4, 1.02 + or * 0.07, easeInOut(oc)), tilt = [0.35, -0.5, 1.2][or] + T * [0.4, -0.3, 0.25][or];
          c.strokeStyle = rgba([cyan, hot, violet][or], 0.45 * oa); c.lineWidth = 1.2;
          c.beginPath(); c.ellipse(ring[0], ring[1], rad, rad * 0.3, tilt, 0, TAU); c.stroke();
          for (var bd = 0; bd < 3; bd++) {
            var ba2 = T * (1.4 + or * 0.5) + bd * TAU / 3, ex = Math.cos(ba2) * rad, ey = Math.sin(ba2) * rad * 0.3;
            stamp(G.w, ring[0] + ex * Math.cos(tilt) - ey * Math.sin(tilt), ring[1] + ex * Math.sin(tilt) + ey * Math.cos(tilt), 8, oa);
          }
        }
      }

      /* 8 the charge: lines of light converging on the apex, a growing core */
      if (!hit) {
        for (var cc = 0; cc < conv.length; cc++) {
          var C = conv[cc], cu = seg(T, C.t0, C.t0 + 0.3);
          if (cu <= 0 || cu >= 1) continue;
          var hx = mix(C.x, apex[0], easeIn(cu)), hy = mix(C.y, apex[1], easeIn(cu)), tx2 = mix(C.x, apex[0], easeIn(Math.max(0, cu - 0.25))), ty2 = mix(C.y, apex[1], easeIn(Math.max(0, cu - 0.25)));
          line(tx2, ty2, hx, hy, C.col, 0.8, 1.3);
        }
        var core = seg(T, 2.2, ZEN);
        if (core > 0) { stamp(G.h, apex[0], apex[1], 20 + 70 * easeIn(core) + 6 * Math.sin(T * 30), core * 0.9); stamp(G.w, apex[0], apex[1], 8 + 18 * core, core); }
      }

      /* 9 the constellation drawing the peak */
      var cn = seg(T, 1.7, 2.6), cf = 1 - seg(T, ZEN - 0.1, ZEN + 0.4);
      if (cn > 0 && cf > 0 && cons.length > 1) {
        var drawn = cn * (cons.length - 1);
        for (var ci = 0; ci < cons.length - 1 && ci < drawn; ci++) {
          var qq = Math.min(1, drawn - ci), A = cons[ci], Bp = cons[ci + 1];
          line(A[0], A[1], mix(A[0], Bp[0], qq), mix(A[1], Bp[1], qq), hot, 0.55 * cf, 1);
        }
        for (var cj = 0; cj < cons.length; cj++) if (cj <= drawn + 0.5) stamp(G.w, cons[cj][0], cons[cj][1], 10 + 3 * Math.sin(T * 6 + cj), cf);
      }

      /* 10 the gathering sparks; once the page shows the mark they melt into it, a few keep glittering */
      var fade = hit ? 1 - seg(z, 0.05, 0.55) : 1;
      for (var j = 0; j < parts.length; j++) {
        var P = parts[j];
        if (T < P.t0) continue;
        var keep = P.glit ? 0.6 + 0.4 * Math.sin(T * 7 + j) : fade;
        if (keep <= 0.01) continue;
        var col = P.l > 0.75 ? white : P.l > 0.4 ? hot : (j % 5 ? blue : violet);
        if (P.u < 1) line(P.px - (P.x - P.px) * 2.5, P.py - (P.y - P.py) * 2.5, P.x, P.y, col, 0.8 * keep, 1.2);
        else { c.fillStyle = rgba(col, 0.9 * keep); c.fillRect(P.x - 1, P.y - 1, 2, 2); }
      }

      /* 11 the comet: a helix up the middle to the tip */
      if (T > 2.0 && T < ZEN + 0.05) {
        var cu2 = easeIn(seg(T, 2.0, ZEN));
        for (var tl = 0; tl < 26; tl++) {
          var uu = Math.max(0, cu2 - tl * 0.012), yy = mix(H + 30, apex[1], uu), xx = apex[0] + Math.sin(uu * 14) * 40 * (1 - uu);
          stamp(tl ? G.h : G.w, xx, yy, (tl ? 9 : 22) * (1 - tl / 30), (1 - tl / 26) * (tl ? 0.6 : 1));
        }
      }

      /* 12 the ignition */
      if (hit) {
        stamp(G.w, apex[0], apex[1], 60 + 200 * flash, flash);
        stamp(G.h, apex[0], apex[1], 40 + 30 * Math.sin(T * 5), 0.5 * after);
        // the anamorphic streak across the whole screen
        var lw = W * (0.3 + 1.2 * easeOut(seg(z, 0, 0.4))) * (0.4 + 0.6 * flash);
        var lh = c.createLinearGradient(apex[0] - lw, 0, apex[0] + lw, 0);
        lh.addColorStop(0, rgba(cyan, 0)); lh.addColorStop(0.35, rgba(hot, 0.5 * (0.25 + flash))); lh.addColorStop(0.5, rgba(white, 0.3 + 0.7 * flash)); lh.addColorStop(0.65, rgba(hot, 0.5 * (0.25 + flash))); lh.addColorStop(1, rgba(violet, 0));
        c.fillStyle = lh; c.fillRect(apex[0] - lw, apex[1] - 1.5 - 4 * flash, lw * 2, 3 + 8 * flash);
        // the eight-point star
        c.save(); c.translate(apex[0], apex[1]); c.rotate(z * 0.4);
        for (var sp = 0; sp < 8; sp++) {
          var sl = (sp % 2 ? 60 : 130) * (0.6 + flash * 1.4) + 10 * Math.sin(T * 4 + sp);
          var sg = c.createLinearGradient(0, 0, sl, 0); sg.addColorStop(0, rgba(white, 0.95)); sg.addColorStop(1, rgba(hot, 0));
          c.fillStyle = sg; c.beginPath(); c.moveTo(0, -2); c.lineTo(sl, 0); c.lineTo(0, 2); c.fill(); c.rotate(TAU / 8);
        }
        c.restore();
        // lens ghosts along the line through the screen's centre
        var gx = W / 2 - apex[0], gy = H / 2 - apex[1];
        for (var gh = 0; gh < 6; gh++) {
          var gk = [0.5, 0.9, 1.3, 1.6, 2.0, 2.4][gh];
          stamp([G.c, G.v, G.h][gh % 3], apex[0] + gx * gk * 2, apex[1] + gy * gk * 2, [14, 30, 10, 46, 20, 70][gh], (0.18 + flash * 0.4) * (1 - seg(z, 0.4, 2.2)));
        }
        // the shock rings, chromatic, and the ground wave along the horizon
        for (var r2 = 0; r2 < rings.length; r2++) {
          var RR = rings[r2]; if (RR.t < 0) continue;
          var q2 = easeOut(RR.t / RR.life), rad2 = mix(RR.r0, RR.r1, q2);
          c.strokeStyle = rgba(RR.col, (1 - q2) * 0.85); c.lineWidth = RR.w * (1 - q2) + 0.5;
          c.beginPath(); c.ellipse(apex[0], RR.y || apex[1], rad2, rad2 * RR.k, 0, 0, TAU); c.stroke();
        }
        // the light running twice round the dial
        var swp = seg(z, 0, 1.4);
        if (swp > 0 && swp < 1) {
          var a0 = -Math.PI / 2 + easeOut(swp) * TAU * 2;
          c.strokeStyle = rgba(white, 0.95 * (1 - swp * 0.7)); c.lineWidth = 3;
          c.beginPath(); c.arc(ring[0], ring[1], ring[2], a0 - 0.6, a0); c.stroke();
          stamp(G.w, ring[0] + Math.cos(a0) * ring[2], ring[1] + Math.sin(a0) * ring[2], 18, 1 - swp * 0.5);
        }
        for (var dd = 0; dd < debris.length; dd++) { var D = debris[dd], la = 1 - D.t / D.life; line(D.px, D.py, D.x, D.y, la > 0.6 ? white : D.col, la, D.w); }
        for (var ee = 0; ee < embers.length; ee++) { var E = embers[ee], el = 1 - E.t / E.life; stamp(ee % 3 ? G.h : G.v, E.x, E.y, E.r * 5, el * (0.5 + 0.5 * Math.sin(T * 8 + E.f))); }
        for (var ob = 0; ob < orbit.length; ob++) {
          var O = orbit[ob], oa2 = after * (0.5 + 0.5 * Math.sin(T * 3 + O.f));
          c.fillStyle = rgba(O.s > 1.4 ? white : hot, oa2);
          c.beginPath(); c.arc(ring[0] + Math.cos(O.a) * ring[2] * O.r, ring[1] + Math.sin(O.a) * ring[2] * O.r, O.s, 0, TAU); c.fill();
        }
      }

      /* 13 shooting stars and dust after the ignition */
      for (var mt = 0; mt < meteors.length; mt++) {
        var M = meteors[mt], mu = M.t / 0.7, mx = M.x + Math.cos(M.a) * M.v * M.t, my = M.y + Math.sin(M.a) * M.v * M.t, ml = 120;
        var mg = c.createLinearGradient(mx, my, mx - Math.cos(M.a) * ml, my - Math.sin(M.a) * ml);
        mg.addColorStop(0, rgba(white, Math.sin(mu * Math.PI))); mg.addColorStop(1, rgba(hot, 0));
        c.strokeStyle = mg; c.lineWidth = 1.5; c.beginPath(); c.moveTo(mx, my); c.lineTo(mx - Math.cos(M.a) * ml, my - Math.sin(M.a) * ml); c.stroke();
      }
      if (sky > 0) for (var du = 0; du < dust.length; du++) { var Du = dust[du]; c.fillStyle = rgba(hot, sky * 0.35 * (0.5 + 0.5 * Math.sin(T * 2 + Du.f))); c.fillRect(Du.x, Du.y, Du.r, Du.r); }

      /* 14 the HUD */
      c.globalCompositeOperation = 'source-over';
      var hud = seg(T, 0.15, 0.5) * (1 - seg(T, ZEN + 1.3, ZEN + 1.9)) * (1 - clamp(warp * 4, 0, 1));
      if (hud > 0) {
        var m = 14, top2 = Math.max(56, st.y * 0.5 + 40), bot = H * 0.62, bl = 16;
        c.strokeStyle = rgba(hot, 0.55 * hud); c.lineWidth = 1.2;
        [[m, top2, 1, 1], [W - m, top2, -1, 1], [m, bot, 1, -1], [W - m, bot, -1, -1]].forEach(function (k2) {
          c.beginPath(); c.moveTo(k2[0], k2[1] + bl * k2[3]); c.lineTo(k2[0], k2[1]); c.lineTo(k2[0] + bl * k2[2], k2[1]); c.stroke();
        });
        // the scan line
        var sy2 = mix(top2, bot, (T * 0.7) % 1);
        var sl2 = c.createLinearGradient(0, 0, W, 0); sl2.addColorStop(0, rgba(hot, 0)); sl2.addColorStop(0.5, rgba(hot, 0.16 * hud)); sl2.addColorStop(1, rgba(hot, 0));
        c.fillStyle = sl2; c.fillRect(m, sy2, W - 2 * m, 1);
        // the reticle round the apex
        var rr2 = 34 + 10 * Math.sin(T * 2), ra = hud * (hit ? 1 - seg(z, 0, 0.5) : 1);
        c.strokeStyle = rgba(cyan, 0.6 * ra); c.lineWidth = 1;
        c.beginPath(); c.arc(apex[0], apex[1], rr2, T * 1.5, T * 1.5 + 1.2); c.stroke();
        c.beginPath(); c.arc(apex[0], apex[1], rr2, T * 1.5 + Math.PI, T * 1.5 + Math.PI + 1.2); c.stroke();
        c.strokeStyle = rgba(hot, 0.35 * ra);
        for (var tk = 0; tk < 48; tk++) { var tka = tk / 48 * TAU - T * 0.5, r1 = rr2 + 8, r3 = r1 + (tk % 4 ? 3 : 7); c.beginPath(); c.moveTo(apex[0] + Math.cos(tka) * r1, apex[1] + Math.sin(tka) * r1); c.lineTo(apex[0] + Math.cos(tka) * r3, apex[1] + Math.sin(tka) * r3); c.stroke(); }
        // readouts
        var alt = Math.round(8848 * easeInOut(seg(T, DROP, ZEN)));
        var cd = Math.max(0, ZEN - T);
        text('ZENITH // GENESIS', m + 4, top2 + 18, 0.8 * hud, 'left', 9.5, white);
        text(T < DROP ? 'JUMP · ' + (v * 1000).toFixed(0) + ' c' : hit ? 'SUMMIT REACHED' : 'APPROACH', m + 4, top2 + 32, 0.6 * hud, 'left', 9, hit ? white : hot);
        text('ALT ' + ('00000' + alt).slice(-5) + ' M', W - m - 4, top2 + 18, 0.8 * hud, 'right', 9.5, white);
        text('45.52° N · 25.36° E', W - m - 4, top2 + 32, 0.5 * hud, 'right', 9, hot);
        text(hit ? 'IGNITION ✓' : 'T−' + cd.toFixed(2), m + 4, bot - 8, 0.75 * hud, 'left', 9.5, hit ? white : cyan);
        text('RUN · LIFT · ASCEND', W - m - 4, bot - 8, 0.5 * hud, 'right', 9, hot);
        // a level bar climbing with the altitude
        var bh = (bot - top2) - 80, bx = W - m - 2, by = top2 + 44, fillH = bh * (alt / 8848);
        c.fillStyle = rgba(hot, 0.12 * hud); c.fillRect(bx - 2, by, 2, bh);
        c.fillStyle = rgba(white, 0.8 * hud); c.fillRect(bx - 2, by + bh - fillH, 2, fillH);
        for (var lv = 0; lv <= 8; lv++) { c.fillStyle = rgba(hot, 0.4 * hud); c.fillRect(bx - (lv % 2 ? 5 : 8), by + bh * lv / 8, lv % 2 ? 3 : 6, 1); }
      }

      /* 15 the sky darkens before the ignition, the white-out after it */
      var dark = seg(T, 2.35, ZEN) * (hit ? 0 : 1);
      if (dark > 0) {
        var vg = c.createRadialGradient(apex[0], apex[1], 40, apex[0], apex[1], Math.max(W, H) * 0.8);
        vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,' + (0.55 * dark).toFixed(3) + ')');
        c.fillStyle = vg; c.fillRect(0, 0, W, H);
      }
      if (hit && z < 0.5) { c.fillStyle = 'rgba(240,246,255,' + (0.85 * Math.exp(-z * 9)).toFixed(3) + ')'; c.fillRect(-20, -20, W + 40, H + 40); }
    }

    function frame(now) {
      if (!live) return;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      update(dt); draw();
      raf = requestAnimationFrame(frame);
    }
    function onResize() { size(); makeStars(); makeNebula(); makeRanges(); }
    size(); makeStars(); makeNebula(); makeRanges(); makeParts();
    addEventListener('resize', onResize);
    return {
      at: function (at) { live = false; while (T < at) update(1 / 60); draw(); },
      start: function () { live = true; last = 0; raf = requestAnimationFrame(frame); },
      // the still poster: the sky with the mark in place, no motion
      still: function (at) { live = false; var cb = o.onImpact; o.onImpact = null; while (T < (at || ZEN + 1.6)) update(1 / 30); o.onImpact = cb; draw(); },
      burst: function () { warp = 0.03; },
      destroy: function () { live = false; cancelAnimationFrame(raf); removeEventListener('resize', onResize); }
    };
  }
  window.BeastIgnite = { create: create, ZEN: ZEN };
})();
