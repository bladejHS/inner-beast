/* THE IGNITION (2026-11-20), the opening of HYBRID FORGE. The user: "refă animația de la început ... ceva spectaculos".
   A forge in the dark. Scene time T, in seconds:
     0     black; a seam of molten light opens across the middle, embers start to rise
     .35   a vortex of molten sparks wheels in from the edges and spirals onto the crest's shape, white-hot as they land
     1.2   the hammer swings in from the upper right, faster and faster
     1.45  IMPACT: the hammer strikes the crest; white flash, two shock rings, a fountain of sparks, the camera shakes,
           time slows for a moment; the page shows the crest white-hot and lets it cool to gold and steel, and stamps
           the name (onImpact)
     1.8   the hammer recoils and fades; embers keep rising off the hot metal; a glint runs across the crest
     ~3.4  the page leaves: the black parts along the seam and the crest flies into the tab bar
   The crest is the page's own image (the .sp-emb element), so the particles sample it and land exactly on it.
   API: BeastIgnite.create({ canvas, stage, mark, root, onImpact, color, hot }) → { start(), still(T), burst(), destroy() } */
(function () {
  'use strict';
  var IMPACT = 1.45;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mix(a, b, u) { return a + (b - a) * u; }
  function ease3(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function easeIn(x) { return x * x * x; }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + clamp(a, 0, 1).toFixed(3) + ')'; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function create(o) {
    var cv = o.canvas, c = cv.getContext('2d');
    var gold = o.color || [184, 148, 67], hot = o.hot || [222, 156, 78], white = [250, 246, 236];
    var W = 0, H = 0, dpr = 1, raf = 0, last = 0, T = 0, real = 0, slow = 0, shake = 0, hitAt = -1, live = true, impacted = false;
    var parts = [], sparks = [], embers = [], rings = [], ghosts = [], st = { x: 0, y: 0, w: 0, h: 0 }, core = [0, 0];
    var COUNT = o.count || 1400;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth || innerWidth; H = cv.clientHeight || innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      var r = o.stage && o.stage.getBoundingClientRect();
      st = r && r.width ? { x: r.left, y: r.top, w: r.width, h: r.height } : { x: W / 2 - 150, y: H * 0.12, w: 300, h: 353 };
      core = [st.x + st.w * 0.5, st.y + st.h * 0.477];
    }

    // the crest's opaque pixels are where the sparks land; bright pixels (gold, the flame) get the hottest sparks
    function sample(img) {
      var SW = 120, SH = Math.round(SW * (img.naturalHeight || 801) / (img.naturalWidth || 680));
      var cc = document.createElement('canvas'); cc.width = SW; cc.height = SH;
      var g = cc.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, 0, 0, SW, SH);
      var d = g.getImageData(0, 0, SW, SH).data, all = [];
      for (var y = 0; y < SH; y++) for (var x = 0; x < SW; x++) {
        var i = (y * SW + x) * 4;
        if (d[i + 3] < 140) continue;
        all.push({ u: (x + 0.5) / SW, v: (y + 0.5) / SH, lit: clamp((d[i] + d[i + 1] - d[i + 2]) / 300, 0, 1) });
      }
      for (var k = all.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var tmp = all[k]; all[k] = all[j]; all[j] = tmp; }
      var pick = all.slice(0, COUNT), R = Math.hypot(W, H) * 0.6;
      parts = pick.map(function (p) {
        var tx = st.x + p.u * st.w, ty = st.y + p.v * st.h;
        var dx = tx - core[0], dy = ty - core[1];
        return {
          tx: tx, ty: ty, tr: Math.hypot(dx, dy), ta: Math.atan2(dy, dx),
          r0: R * rnd(0.7, 1.15), a0: rnd(0, Math.PI * 2), spin: rnd(0.9, 1.5) * Math.PI,
          d0: 0.3 + rnd(0, 0.45), dur: rnd(0.55, 0.8), lit: p.lit, px: NaN, py: NaN, w: rnd(0.8, 1.9),
        };
      });
    }
    function loadMark() {
      var img = o.stage && o.stage.querySelector('img');
      if (!img) return;
      if (img.complete && img.naturalWidth) sample(img);
      else img.addEventListener('load', function () { sample(img); }, { once: true });
    }

    function spawnEmber(fromCore) {
      embers.push({ x: fromCore ? core[0] + rnd(-st.w * 0.3, st.w * 0.3) : rnd(0, W), y: fromCore ? core[1] + rnd(-st.h * 0.2, st.h * 0.3) : H + 10, vx: rnd(-12, 12), vy: rnd(-90, -30), t: 0, life: rnd(1.4, 3), r: rnd(0.8, 2.2), f: rnd(0, 6) });
    }
    function burstAt(x, y, n, power) {
      for (var i = 0; i < n; i++) {
        var a = rnd(-Math.PI, 0) + rnd(-0.4, 0.4), v = power * rnd(0.2, 1.1);
        sparks.push({ x: x, y: y, px: x, py: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: rnd(0.4, 1.1), w: rnd(1, 2.4) });
      }
    }

    /** The hammer: the pivot off-screen at the upper right, the head arriving on the crest's top at IMPACT. */
    function hammer() {
      var hit = [core[0] + st.w * 0.04, st.y + st.h * 0.1];
      var piv = [W * 1.15, -H * 0.12];
      var len = Math.hypot(hit[0] - piv[0], hit[1] - piv[1]), a1 = Math.atan2(hit[1] - piv[1], hit[0] - piv[0]);
      var ang, alpha;
      if (T < 1.15) return null;
      if (T < IMPACT) { var u = easeIn((T - 1.15) / (IMPACT - 1.15)); ang = a1 - 1.25 * (1 - u); alpha = clamp((T - 1.15) / 0.12, 0, 1); }
      else { var r = clamp((T - IMPACT) / 0.45, 0, 1); ang = a1 - 0.35 * Math.sin(r * Math.PI * 0.6); alpha = 1 - clamp((T - IMPACT - 0.2) / 0.4, 0, 1); }
      return { piv: piv, len: len, ang: ang, alpha: alpha };
    }
    function drawHammer(h, a) {
      var s = Math.min(W, H) / 400;
      c.save();
      c.translate(h.piv[0], h.piv[1]); c.rotate(h.ang);
      c.globalAlpha = a;
      // the handle
      c.fillStyle = '#060607'; c.strokeStyle = rgba(gold, 0.7); c.lineWidth = 1.4;
      c.beginPath(); c.rect(0, -6 * s, h.len - 16 * s, 12 * s); c.fill(); c.stroke();
      // the head, across the handle at its end
      var hx = h.len - 40 * s, hw = 76 * s, hh = 160 * s;
      var g = c.createLinearGradient(hx, -hh / 2, hx + hw, hh / 2);
      g.addColorStop(0, '#3b3c42'); g.addColorStop(0.5, '#15161a'); g.addColorStop(1, '#2a2b30');
      c.fillStyle = g; c.beginPath(); c.rect(hx, -hh / 2, hw, hh); c.fill();
      c.shadowColor = rgba(hot, 0.9); c.shadowBlur = 14;
      c.strokeStyle = rgba(white, 0.85); c.lineWidth = 2;
      c.beginPath(); c.moveTo(hx, -hh / 2); c.lineTo(hx + hw, -hh / 2); c.lineTo(hx + hw, hh / 2); c.stroke();
      c.shadowBlur = 0; c.strokeStyle = rgba(gold, 0.6); c.lineWidth = 1.2;
      c.beginPath(); c.rect(hx + 6 * s, -hh / 2 + 6 * s, hw - 12 * s, hh - 12 * s); c.stroke();
      c.restore();
    }

    function update(dt) {
      real += dt;
      var rate = slow > 0 ? 0.18 : 1;
      if (slow > 0) slow -= dt;
      T += dt * rate;
      shake *= Math.pow(0.002, dt);
      if (!impacted && T >= IMPACT) {
        impacted = true; hitAt = real; slow = 0.32; shake = 14;
        var hx = core[0] + st.w * 0.04, hy = st.y + st.h * 0.12;
        burstAt(hx, hy, 260, 900);
        burstAt(core[0], core[1], 120, 520);
        rings.push({ x: core[0], y: core[1], t: 0, k: 1 }, { x: core[0], y: core[1], t: -0.08, k: 1.6 });
        for (var e = 0; e < 40; e++) spawnEmber(true);
        if (o.root) { o.root.style.setProperty('--ix', hx.toFixed(0) + 'px'); o.root.style.setProperty('--iy', hy.toFixed(0) + 'px'); }
        if (o.onImpact) try { o.onImpact(); } catch (er) { /* the page's part */ }
      }
      if (Math.random() < dt * (impacted ? 26 : 10)) spawnEmber(impacted && Math.random() < 0.7);
      var h = hammer();
      if (h && T < IMPACT) { ghosts.push({ ang: h.ang, t: real }); while (ghosts.length && real - ghosts[0].t > 0.09) ghosts.shift(); } else ghosts = [];
      var k = dt * (slow > 0 ? 0.3 : 1);
      for (var i = sparks.length - 1; i >= 0; i--) {
        var p = sparks[i];
        p.t += k; if (p.t > p.life) { sparks.splice(i, 1); continue; }
        p.px = p.x; p.py = p.y; p.vy += 1100 * k; p.vx *= Math.pow(0.3, k); p.vy *= Math.pow(0.55, k); p.x += p.vx * k; p.y += p.vy * k;
      }
      for (var j = embers.length - 1; j >= 0; j--) { var m = embers[j]; m.t += dt; if (m.t > m.life) { embers.splice(j, 1); continue; } m.x += (m.vx + Math.sin(real * 3 + m.f) * 10) * dt; m.y += m.vy * dt; }
      for (var r = rings.length - 1; r >= 0; r--) { rings[r].t += dt; if (rings[r].t > 0.8) rings.splice(r, 1); }
      return h;
    }

    function draw(h) {
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      if (shake > 0.3) c.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      c.globalCompositeOperation = 'lighter';
      // the forge's heat: a glow that grows under the crest, flaring at the strike
      var flare = hitAt >= 0 ? Math.max(0, 1 - (real - hitAt) / 0.9) : 0;
      var heat = clamp((T - 0.2) / 1.2, 0, 1) * 0.55 + flare * 0.6;
      var gl = c.createRadialGradient(core[0], core[1], 0, core[0], core[1], Math.max(W, H) * 0.6);
      gl.addColorStop(0, rgba(hot, 0.14 * heat)); gl.addColorStop(0.35, rgba(gold, 0.08 * heat)); gl.addColorStop(1, rgba(gold, 0));
      c.fillStyle = gl; c.fillRect(0, 0, W, H);
      // the seam of molten light across the middle, before the vortex takes over
      var seam = clamp(T / 0.35, 0, 1) * (1 - clamp((T - 0.6) / 0.5, 0, 1));
      if (seam > 0) {
        var half = W * 0.55 * ease3(clamp(T / 0.4, 0, 1));
        var sg = c.createLinearGradient(core[0] - half, 0, core[0] + half, 0);
        sg.addColorStop(0, rgba(hot, 0)); sg.addColorStop(0.5, rgba(white, 0.95 * seam)); sg.addColorStop(1, rgba(hot, 0));
        c.fillStyle = sg; c.fillRect(core[0] - half, core[1] - 1.5, half * 2, 3);
        c.fillStyle = rgba(hot, 0.18 * seam); c.fillRect(core[0] - half, core[1] - 14, half * 2, 28);
      }
      // the vortex: every spark spirals from its place on the ring to its place on the crest
      var fade = impacted ? 1 - clamp((real - hitAt) / 0.25, 0, 1) : 1;
      if (fade > 0) {
        c.lineCap = 'round';
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i], u = clamp((T - p.d0) / p.dur, 0, 1);
          if (u <= 0) continue;
          var e = ease3(u), rr = mix(p.r0, p.tr, e), aa = mix(p.a0, p.ta, e) + p.spin * (1 - e) * (1 - e);
          var x = core[0] + Math.cos(aa) * rr, y = core[1] + Math.sin(aa) * rr;
          if (u >= 1) { x = p.tx; y = p.ty; }
          var col = u >= 1 ? (p.lit > 0.4 ? gold : [150, 150, 158]) : u > 0.75 ? white : hot;
          var a = (u >= 1 ? 0.55 + 0.35 * Math.sin(real * 9 + i) : 0.9) * fade;
          if (!isNaN(p.px) && u < 1) {
            // a short comet tail in the direction of travel, never a line across the screen
            var dx = x - p.px, dy = y - p.py, dl = Math.hypot(dx, dy), mx = 16 + 10 * (1 - e);
            if (dl > mx) { dx *= mx / dl; dy *= mx / dl; }
            c.strokeStyle = rgba(col, a * 0.8); c.lineWidth = p.w;
            c.beginPath(); c.moveTo(x - dx, y - dy); c.lineTo(x, y); c.stroke();
          } else { c.fillStyle = rgba(col, a); c.fillRect(x - p.w / 2, y - p.w / 2, p.w, p.w); }
          p.px = x; p.py = y;
        }
      }
      // embers rising
      for (var j = 0; j < embers.length; j++) {
        var m = embers[j], v = m.t / m.life, fl = 0.6 + 0.4 * Math.sin(real * 14 + m.f);
        c.fillStyle = rgba(v < 0.3 ? white : hot, (1 - v) * fl * 0.9);
        c.beginPath(); c.arc(m.x, m.y, m.r, 0, Math.PI * 2); c.fill();
      }
      c.globalCompositeOperation = 'source-over';
      // the hammer, with its motion ghosts
      if (h && h.alpha > 0) {
        for (var g = 0; g < ghosts.length; g++) drawHammer({ piv: h.piv, len: h.len, ang: ghosts[g].ang }, 0.12 * h.alpha * (g + 1) / ghosts.length);
        drawHammer(h, h.alpha);
      }
      c.globalCompositeOperation = 'lighter';
      // sparks: streaks from where they were to where they are
      c.lineCap = 'round';
      for (var s = 0; s < sparks.length; s++) {
        var q = sparks[s], w = q.t / q.life;
        c.strokeStyle = w < 0.3 ? rgba(white, 1 - w) : rgba(w < 0.6 ? hot : gold, 1 - w);
        c.lineWidth = q.w; c.beginPath(); c.moveTo(q.px, q.py); c.lineTo(q.x + (q.x - q.px) * 0.6, q.y + (q.y - q.py) * 0.6); c.stroke();
      }
      for (var r = 0; r < rings.length; r++) {
        var rg = rings[r];
        if (rg.t < 0) continue;
        var t = rg.t / 0.8, rad = (20 + t * 260) * rg.k;
        c.strokeStyle = rgba(rg.k > 1 ? hot : white, (1 - t) * 0.85); c.lineWidth = 4 * (1 - t) + 0.5;
        c.beginPath(); c.ellipse(rg.x, rg.y, rad, rad * 0.86, 0, 0, Math.PI * 2); c.stroke();
      }
      // the white of the strike
      if (flare > 0.6) { c.fillStyle = rgba(white, (flare - 0.6) * 1.6); c.fillRect(-20, -20, W + 40, H + 40); }
      c.globalCompositeOperation = 'source-over';
      if (o.stage && live) {
        var sx = (Math.random() - 0.5) * shake * 0.6, sy = (Math.random() - 0.5) * shake * 0.6;
        o.stage.style.transform = 'translate(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px) scale(' + (1 + (impacted ? 0.04 * Math.exp(-(real - hitAt) * 4) : 0)).toFixed(4) + ')';
      }
    }

    function frame(now) {
      if (!live) return;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      draw(update(dt));
      raf = requestAnimationFrame(frame);
    }
    function onResize() { size(); }
    size(); loadMark();
    addEventListener('resize', onResize);
    var api = {
      /** One frame at scene time `at`, simulated from the start (for checking frames). */
      at: function (at) { live = false; var h = null; while (T < at) h = update(1 / 60), draw(h); },
      start: function () { live = true; last = 0; raf = requestAnimationFrame(frame); },
      /** The calm poster: the crest already forged, a few embers in the heat. */
      still: function () {
        live = false; T = 2.4; impacted = true; hitAt = -10;
        for (var i = 0; i < 40; i++) { spawnEmber(true); embers[embers.length - 1].t = rnd(0, 1); }
        parts = [];
        draw(null);
      },
      burst: function () { /* the exit is the page's */ },
      destroy: function () { live = false; cancelAnimationFrame(raf); removeEventListener('resize', onResize); }
    };
    return api;
  }
  window.BeastIgnite = { create: create };
})();
