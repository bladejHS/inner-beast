// Show pieces: the claw swipe between tabs, the round-start slam, the "day done" celebration and the number count-ups.
// All of it moves only transform and opacity (the sparks draw on one canvas), and all of it is skipped or cut short
// when the phone asks for reduced motion or the user picked "Reduse" in Settings (html[data-motion=lite]).

import { CLAWS } from './claws.ts';

const BASE = import.meta.env.BASE_URL;

export function lite(): boolean {
  return document.documentElement.dataset.motion === 'lite' || matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Restarts a CSS animation that hangs on a class. */
function replay(el: Element, cls: string): void {
  el.classList.remove(cls);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(cls);
}

/** Three claw marks rip across the screen when the tab changes; dir > 0 when moving right in the tab bar. */
export function clawSwipe(dir: number): void {
  if (lite()) return;
  const el = document.getElementById('swipe');
  if (!el) return;
  el.dataset.dir = dir < 0 ? 'l' : 'r';
  replay(el, 'go');
}

/** "RUNDA 2": slams onto the timer with claws and a shock ring, and the screen shakes once. */
export function slam(text: string, sub = ''): void {
  if (lite()) return;
  // on body, not in the player: the player re-renders right after the phase change
  const el = document.createElement('div');
  el.className = 'slam';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<i class="slam-bg"></i><span class="slam-claws"><i></i><i></i><i></i></span><i class="slam-ring"></i><b>${text}</b>${sub ? `<span class="slam-sub">${sub}</span>` : ''}`;
  document.body.appendChild(el);
  window.setTimeout(() => {
    // take the colours of the phase that is starting
    const pl = document.querySelector('.pl');
    if (pl) {
      const cs = getComputedStyle(pl);
      el.style.color = cs.color;
      el.style.setProperty('--bg', cs.backgroundColor);
    }
    const ov = document.getElementById('ov');
    if (ov) {
      replay(ov, 'shake');
      window.setTimeout(() => ov.classList.remove('shake'), 500);
    }
  }, 0);
  window.setTimeout(() => el.remove(), 1250);
}

/** A number climbs from `from` to `to` (integers only). */
export function countUp(el: HTMLElement, from: number, to: number, ms = 750): void {
  if (lite() || from === to || !Number.isFinite(from) || !Number.isFinite(to)) {
    el.textContent = String(to);
    return;
  }
  const t0 = performance.now();
  el.textContent = String(from);
  const step = (t: number): void => {
    const k = Math.min(1, (t - t0) / ms);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = String(Math.round(from + (to - from) * e));
    if (k < 1 && el.isConnected) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Full-screen celebration when the last block of the day is done: the wolf lands, claws rip, sparks fly. */
export function celebrate(title: string, sub: string): void {
  const el = document.createElement('div');
  el.className = 'cele';
  el.setAttribute('role', 'status');
  const claws = CLAWS.map((c, i) => `<path d="${c.fill}" style="--d:${(0.92 + i * 0.07).toFixed(2)}s"/>`).join('');
  el.innerHTML = `
    <canvas class="cele-fx" aria-hidden="true"></canvas>
    <div class="cele-core">
      <div class="cele-mark" aria-hidden="true">
        <i class="cele-halo"></i>
        <img src="${BASE}splash/emblem.webp" alt="" width="680" height="801" decoding="async">
        <svg class="cele-claws" viewBox="0 0 100 100">${claws}</svg>
      </div>
      <p class="cele-k">${sub}</p>
      <h2 class="cele-t">${title}</h2>
      <p class="cele-w">Misiune îndeplinită</p>
    </div>
    <p class="cele-tap">Atinge ca să închizi</p>`;
  document.body.appendChild(el);
  const close = (): void => {
    if (el.classList.contains('out')) return;
    el.classList.add('out');
    window.setTimeout(() => el.remove(), 520);
  };
  el.addEventListener('click', close);
  window.setTimeout(close, lite() ? 2600 : 4800);
  if (!lite()) window.setTimeout(() => sparks(el.querySelector('canvas') as HTMLCanvasElement, el), 560);
}

/** Red and gold sparks thrown from where the wolf lands, with a little gravity. Time-based, so 60 and 120 Hz match. */
function sparks(c: HTMLCanvasElement, host: HTMLElement): void {
  const x = c.getContext('2d');
  if (!x) return;
  const dpr = Math.min(2, devicePixelRatio || 1);
  const W = (c.width = Math.round(innerWidth * dpr));
  const H = (c.height = Math.round(innerHeight * dpr));
  const cx = W / 2;
  const cy = H * 0.36;
  const COLORS = ['#ff4433', '#f2b544', '#ffd98c', '#d10f1d', '#fff1e6'];
  const ps = Array.from({ length: 120 }, () => {
    const a = Math.random() * Math.PI * 2;
    const v = (220 + Math.random() * 760) * dpr;
    return { vx: Math.cos(a) * v, vy: Math.sin(a) * v - 260 * dpr, r: (1 + Math.random() * 2.4) * dpr, c: COLORS[Math.floor(Math.random() * COLORS.length)], life: 0.7 + Math.random() * 0.8 };
  });
  const G = 900 * dpr;
  let t0 = 0;
  const draw = (t: number): void => {
    if (!t0) t0 = t;
    const s = (t - t0) / 1000;
    x.clearRect(0, 0, W, H);
    x.globalCompositeOperation = 'lighter';
    let alive = 0;
    for (const p of ps) {
      const k = s / p.life;
      if (k >= 1) continue;
      alive++;
      // drag folded into the travelled distance: v·(1 − e^(−3s))/3
      const d = (1 - Math.exp(-3 * s)) / 3;
      x.globalAlpha = 1 - k * k;
      x.fillStyle = p.c;
      x.beginPath();
      x.arc(cx + p.vx * d, cy + p.vy * d + 0.5 * G * s * s, p.r * (1 - k * 0.6), 0, 6.283);
      x.fill();
    }
    if (alive && host.isConnected) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}
