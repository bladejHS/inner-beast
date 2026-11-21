/* THE ASCENT (2026-11-21), the opening of ZENITH. The user: "intro-ul ... ceva spectaculos, extraordinar și impresionant".
   A night sky over a horizon. Scene time T, in seconds:
     0     black; stars fade in, the horizon line glows awake across the screen
     .25   a stream of light lifts off the horizon: hundreds of sparks rise on curving paths and settle into the mark's
           shape while a comet climbs the middle, faster and faster, towards the peak
     1.35  ZENITH: the comet reaches the tip; a white flash, a four-point lens flare, two shock rings, a light running
           once round the dial, the stars jump; the page shows the mark and stamps the name (onImpact)
     1.6   the sparks melt into the picture, a few keep glittering; sparks orbit the dial; aurora waves above
     ~3.4  the page leaves: the stars streak upward (warp), the black parts and the mark flies into the tab bar
   The mark is the page's own image (.sp-stage img): the sparks sample its pixels, so they land exactly on it.
   API (unchanged from the old opening): BeastIgnite.create({ canvas, stage, root, onImpact, color, hot })
     → { start(), still(T), at(T), burst(), destroy() } */
(function () {
  'use strict';
  var ZEN = 1.35;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mix(a, b, u) { return a + (b - a) * u; }
  function easeIn(x) { return x * x * x; }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + clamp(a, 0, 1).toFixed(3) + ')'; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function create(o) {
    var cv = o.canvas, c = cv.getContext('2d');
    var blue = o.color || [120, 151, 192], hot = o.hot || [159, 192, 236], white = [244, 248, 255];
    var W = 0, H = 0, dpr = 1, raf = 0, last = 0, T = 0, live = true, hit = false, warp = 0, shake = 0;
    var st = { x: 0, y: 0, w: 0, h: 0 }, apex = [0, 0], ring = [0, 0, 0], horizon = 0;
    var stars = [], parts = [], sparks = [], rings = [], orbit = [];

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth || innerWidth; H = cv.clientHeight || innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      var r = o.stage && o.stage.getBoundingClientRect();
      st = r && r.width ? { x: r.left, y: r.top, w: r.width, h: r.height } : { x: W / 2 - 150, y: H * 0.1, w: 300, h: 353 };
      // where the mark's parts sit in the 680 × 801 picture (scripts/forge.mjs)
      apex = [st.x + st.w * 0.5, st.y + st.h * 0.272];
      ring = [st.x + st.w * 0.5, st.y + st.h * 0.5, st.w * 0.387];
      horizon = st.y + st.h * 0.728;
    }

    function makeStars() {
      stars = [];
      var n = Math.round(clamp(W * H / 2600, 120, 320));
      for (var i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, z: rnd(0.2, 1), f: rnd(0, 6.28), s: rnd(0.6, 3.2) });
    }

    // the mark's opaque pixels are where the sparks land; bright ones (the peak's lit side, the star) burn whiter
    function sample(img) {
      var k = 120, ow = k, oh = Math.round(k * (img.naturalHeight || 801) / (img.naturalWidth || 680));
      var oc = document.createElement('canvas'); oc.width = ow; oc.height = oh;
      var x = oc.getContext('2d'); x.drawImage(img, 0, 0, ow, oh);
      var d; try { d = x.getImageData(0, 0, ow, oh).data; } catch (e) { return []; }
      var pts = [];
      for (var yy = 0; yy < oh; yy++) for (var xx = 0; xx < ow; xx++) {
        var i = (yy * ow + xx) * 4;
        if (d[i + 3] < 140) continue;
        var lum = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255;
        if (lum < 0.12 && Math.random() < 0.7) continue;
        pts.push([xx / ow, yy / oh, lum]);
      }
      return pts;
    }

    function makeParts() {
      parts = [];
      var img = o.stage && o.stage.querySelector('img');
      var pts = img && img.complete && img.naturalWidth ? sample(img) : [];
      var want = Math.min(pts.length, o.count || 1100);
      for (var i = 0; i < want; i++) {
        var p = pts[Math.floor(Math.random() * pts.length)];
        var tx = st.x + p[0] * st.w, ty = st.y + p[1] * st.h;
        var sx = mix(tx, W / 2, 0.35) + rnd(-W * 0.6, W * 0.6), sy = H + rnd(10, H * 0.35);
        parts.push({ sx: sx, sy: sy, tx: tx, ty: ty, cx: mix(sx, tx, 0.5) + rnd(-W * 0.35, W * 0.35), cy: mix(sy, ty, 0.5) + rnd(-40, 80),
          t0: 0.22 + (1 - p[1]) * 0.15 + Math.random() * 0.45, dur: rnd(0.55, 0.85), l: p[2], x: sx, y: sy, px: sx, py: sy, glit: Math.random() < 0.06 });
      }
      orbit = [];
      for (var k = 0; k < 46; k++) orbit.push({ a: rnd(0, 6.28), v: rnd(0.25, 0.6) * (Math.random() < 0.5 ? 1 : -1), r: rnd(0.96, 1.18), s: rnd(0.6, 1.8), f: rnd(0, 6.28) });
    }

    function zenith() {
      hit = true; shake = 7;
      rings.push({ t: 0, r0: 4, r1: Math.max(W, H) * 0.9, life: 1.1, w: 3 }, { t: -0.08, r0: 4, r1: ring[2] * 2.2, life: 0.7, w: 2 });
      for (var k = 0; k < 140; k++) {
        var a = Math.random() * Math.PI * 2, v = rnd(80, 620);
        sparks.push({ x: apex[0], y: apex[1], px: apex[0], py: apex[1], vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, t: 0, life: rnd(0.4, 1.1), w: rnd(0.8, 2) });
      }
      if (o.onImpact) try { o.onImpact(); } catch (e) { /* the page's part */ }
    }

    function update(dt) {
      var was = T; T += dt;
      if (was < ZEN && T >= ZEN && !hit) zenith();
      shake *= Math.pow(0.002, dt);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], u = clamp((T - p.t0) / p.dur, 0, 1), e = easeOut(u);
        p.px = p.x; p.py = p.y;
        // a quadratic curve from below the screen to the pixel
        p.x = (1 - e) * (1 - e) * p.sx + 2 * (1 - e) * e * p.cx + e * e * p.tx;
        p.y = (1 - e) * (1 - e) * p.sy + 2 * (1 - e) * e * p.cy + e * e * p.ty;
        p.u = u;
      }
      for (var j = sparks.length - 1; j >= 0; j--) {
        var s = sparks[j]; s.t += dt;
        if (s.t > s.life) { sparks.splice(j, 1); continue; }
        s.px = s.x; s.py = s.y; s.vx *= Math.pow(0.18, dt); s.vy = s.vy * Math.pow(0.18, dt) + 90 * dt;
        s.x += s.vx * dt; s.y += s.vy * dt;
      }
      for (var k = rings.length - 1; k >= 0; k--) { rings[k].t += dt; if (rings[k].t > rings[k].life) rings.splice(k, 1); }
      for (var m = 0; m < orbit.length; m++) orbit[m].a += orbit[m].v * dt;
      for (var n = 0; n < stars.length; n++) {
        var sv = stars[n];
        sv.y += (6 + warp * 1400) * sv.z * dt;
        if (sv.y > H + 20) { sv.y = -20; sv.x = Math.random() * W; }
      }
      if (warp > 0) warp = Math.min(1, warp + dt * 2.2);
    }

    function draw() {
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      if (shake > 0.3) c.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      var aw = clamp(T / 0.6, 0, 1), afterZ = hit ? clamp((T - ZEN) / 0.6, 0, 1) : 0;
      // aurora waves above the mark: soft ribbons, each stroked wide and faint, then narrower and brighter
      c.globalCompositeOperation = 'lighter';
      c.lineCap = 'round'; c.lineJoin = 'round';
      for (var b = 0; b < 3; b++) {
        var yb = st.y + st.h * (0.0 + b * 0.08), amp = 16 + b * 9, base = (0.018 + afterZ * 0.02) * aw;
        var col = b === 1 ? [150, 135, 235] : hot;
        c.beginPath();
        for (var xx = -20; xx <= W + 20; xx += 14) { var yy = yb + Math.sin(xx / (130 + b * 40) + T * (0.5 + b * 0.2) + b) * amp; if (xx === -20) c.moveTo(xx, yy); else c.lineTo(xx, yy); }
        var widths = [70, 44, 24, 10];
        for (var q = 0; q < widths.length; q++) { c.strokeStyle = rgba(col, base * (1 + q * 0.6)); c.lineWidth = widths[q]; c.stroke(); }
      }
      // stars, streaking when the warp starts
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i], tw = 0.55 + 0.45 * Math.sin(T * s.s + s.f), a = aw * s.z * tw * (hit && T - ZEN < 0.4 ? 1.6 : 1);
        if (warp > 0.02) {
          c.strokeStyle = rgba(white, a); c.lineWidth = s.z * 1.4;
          c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(s.x, s.y - warp * 90 * s.z); c.stroke();
        } else { c.fillStyle = rgba(s.z > 0.8 ? white : hot, a); c.fillRect(s.x, s.y, s.z * 1.6, s.z * 1.6); }
      }
      // the horizon
      var hg = c.createLinearGradient(0, 0, W, 0);
      hg.addColorStop(0, rgba(hot, 0)); hg.addColorStop(0.5, rgba(white, 0.9 * aw)); hg.addColorStop(1, rgba(hot, 0));
      c.fillStyle = hg; c.fillRect(0, horizon - 1, W, 2);
      var hb = c.createRadialGradient(W / 2, horizon, 0, W / 2, horizon, W * 0.7);
      hb.addColorStop(0, rgba(hot, 0.22 * aw + afterZ * 0.1)); hb.addColorStop(1, rgba(blue, 0));
      c.save(); c.translate(0, horizon); c.scale(1, 0.18); c.translate(0, -horizon); c.fillStyle = hb; c.beginPath(); c.arc(W / 2, horizon, W * 0.7, 0, 6.29); c.fill(); c.restore();
      // the rising sparks; once the page shows the mark they melt into it, a few keep glittering
      var fade = hit ? 1 - clamp((T - ZEN - 0.05) / 0.45, 0, 1) : 1;
      for (var j = 0; j < parts.length; j++) {
        var p = parts[j];
        if (T < p.t0) continue;
        var keep = p.glit ? 0.6 + 0.4 * Math.sin(T * 7 + j) : fade;
        if (keep <= 0.01) continue;
        var col = p.l > 0.75 ? white : p.l > 0.4 ? hot : blue;
        if (p.u < 1) {
          c.strokeStyle = rgba(col, 0.75 * keep); c.lineWidth = 1.3;
          c.beginPath(); c.moveTo(p.px, p.py + (p.py - p.y) * 2); c.lineTo(p.x, p.y); c.stroke();
        } else { c.fillStyle = rgba(col, 0.85 * keep * (p.glit && hit ? 0.8 : 1)); c.fillRect(p.x - 1, p.y - 1, 2, 2); }
      }
      // the comet climbing the middle to the peak
      if (T < ZEN + 0.05) {
        var u = clamp((T - 0.3) / (ZEN - 0.3), 0, 1), e = easeIn(u);
        if (u > 0) {
          var cy = mix(H + 30, apex[1], e), tail = 40 + e * 220;
          var tg = c.createLinearGradient(0, cy, 0, cy + tail);
          tg.addColorStop(0, rgba(white, 1)); tg.addColorStop(0.2, rgba(hot, 0.7)); tg.addColorStop(1, rgba(blue, 0));
          c.fillStyle = tg; c.fillRect(apex[0] - 1.6, cy, 3.2, tail);
          var hd = c.createRadialGradient(apex[0], cy, 0, apex[0], cy, 22);
          hd.addColorStop(0, rgba(white, 1)); hd.addColorStop(0.35, rgba(hot, 0.6)); hd.addColorStop(1, rgba(blue, 0));
          c.fillStyle = hd; c.beginPath(); c.arc(apex[0], cy, 22, 0, 6.29); c.fill();
        }
      }
      // the zenith: flash, lens flare, shock rings, the light round the dial
      if (hit) {
        var z = T - ZEN;
        var fl = Math.exp(-z * 3.2);
        var fx = c.createRadialGradient(apex[0], apex[1], 0, apex[0], apex[1], 160);
        fx.addColorStop(0, rgba(white, fl)); fx.addColorStop(0.25, rgba(hot, 0.5 * fl)); fx.addColorStop(1, rgba(blue, 0));
        c.fillStyle = fx; c.beginPath(); c.arc(apex[0], apex[1], 160, 0, 6.29); c.fill();
        var lw = W * (0.2 + 0.8 * easeOut(clamp(z / 0.35, 0, 1))) * (0.35 + 0.65 * fl);
        var lh = c.createLinearGradient(apex[0] - lw, 0, apex[0] + lw, 0);
        lh.addColorStop(0, rgba(hot, 0)); lh.addColorStop(0.5, rgba(white, 0.9 * (0.3 + 0.7 * fl))); lh.addColorStop(1, rgba(hot, 0));
        c.fillStyle = lh; c.fillRect(apex[0] - lw, apex[1] - 1.5, lw * 2, 3);
        var vh = lw * 0.45, lv = c.createLinearGradient(0, apex[1] - vh, 0, apex[1] + vh);
        lv.addColorStop(0, rgba(hot, 0)); lv.addColorStop(0.5, rgba(white, 0.8 * (0.3 + 0.7 * fl))); lv.addColorStop(1, rgba(hot, 0));
        c.fillStyle = lv; c.fillRect(apex[0] - 1.2, apex[1] - vh, 2.4, vh * 2);
        for (var r = 0; r < rings.length; r++) {
          var R = rings[r]; if (R.t < 0) continue;
          var q = easeOut(R.t / R.life), rad = mix(R.r0, R.r1, q);
          c.strokeStyle = rgba(r ? hot : white, (1 - q) * 0.8); c.lineWidth = R.w * (1 - q) + 0.5;
          c.beginPath(); c.arc(apex[0], apex[1], rad, 0, 6.29); c.stroke();
        }
        var sw = clamp(z / 0.9, 0, 1);
        if (sw > 0 && sw < 1) {
          var a0 = -Math.PI / 2 + sw * Math.PI * 2;
          c.strokeStyle = rgba(white, 0.9 * (1 - sw * 0.6)); c.lineWidth = 3; c.lineCap = 'round';
          c.beginPath(); c.arc(ring[0], ring[1], ring[2], a0 - 0.5, a0); c.stroke();
          var dot = c.createRadialGradient(ring[0] + Math.cos(a0) * ring[2], ring[1] + Math.sin(a0) * ring[2], 0, ring[0] + Math.cos(a0) * ring[2], ring[1] + Math.sin(a0) * ring[2], 16);
          dot.addColorStop(0, rgba(white, 1)); dot.addColorStop(1, rgba(hot, 0));
          c.fillStyle = dot; c.beginPath(); c.arc(ring[0] + Math.cos(a0) * ring[2], ring[1] + Math.sin(a0) * ring[2], 16, 0, 6.29); c.fill();
        }
        for (var k = 0; k < sparks.length; k++) {
          var sp = sparks[k], la = 1 - sp.t / sp.life;
          c.strokeStyle = rgba(la > 0.5 ? white : hot, la); c.lineWidth = sp.w;
          c.beginPath(); c.moveTo(sp.px, sp.py); c.lineTo(sp.x, sp.y); c.stroke();
        }
        // sparks orbiting the dial
        for (var m = 0; m < orbit.length; m++) {
          var ob = orbit[m], oa = afterZ * (0.5 + 0.5 * Math.sin(T * 3 + ob.f));
          c.fillStyle = rgba(ob.s > 1.3 ? white : hot, oa);
          c.beginPath(); c.arc(ring[0] + Math.cos(ob.a) * ring[2] * ob.r, ring[1] + Math.sin(ob.a) * ring[2] * ob.r, ob.s, 0, 6.29); c.fill();
        }
      }
      c.globalCompositeOperation = 'source-over';
    }

    function frame(now) {
      if (!live) return;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      update(dt); draw();
      raf = requestAnimationFrame(frame);
    }
    function onResize() { size(); makeStars(); }
    size(); makeStars(); makeParts();
    addEventListener('resize', onResize);
    return {
      at: function (at) { live = false; while (T < at) update(1 / 60); draw(); },
      start: function () { live = true; last = 0; raf = requestAnimationFrame(frame); },
      // the still poster: the sky with the mark in place, no motion
      still: function (at) { live = false; var cb = o.onImpact; o.onImpact = null; while (T < (at || 2.4)) update(1 / 30); o.onImpact = cb; draw(); },
      burst: function () { warp = 0.03; },
      destroy: function () { live = false; cancelAnimationFrame(raf); removeEventListener('resize', onResize); }
    };
  }
  window.BeastIgnite = { create: create };
})();
