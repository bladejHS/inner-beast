// Show pieces: the short round-start cut and the full-screen "day done" celebration.
// Everything is skipped when the phone asks for reduced motion.

import { CLAWS, rake } from './claws.ts';

const reduced = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;
const BASE = import.meta.env.BASE_URL;

/** "RUNDA 2": slams onto the timer with a gong ring. */
export function slam(text: string, sub = ''): void {
  if (reduced()) return;
  // on body, not in the player: the player re-renders right after the phase change
  const el = document.createElement('div');
  el.className = 'slam';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `${rake('slam-rake')}<i class="gong"></i><i class="gong g2"></i><b>${text}</b>${sub ? `<span>${sub}</span>` : ''}`;
  document.body.appendChild(el);
  // take the colour of the phase that is starting
  window.setTimeout(() => {
    const pl = document.querySelector('.pl');
    if (!pl) return;
    const cs = getComputedStyle(pl);
    el.style.color = cs.color;
    el.style.setProperty('--bg', cs.backgroundColor);
  }, 0);
  window.setTimeout(() => el.remove(), 1500);
}

/** Full-screen celebration when the last block of the day is done: ink floods, the wolf, the claws, the words. */
export function celebrate(title: string, sub: string): void {
  const el = document.createElement('div');
  el.className = 'cele';
  el.setAttribute('role', 'status');
  const claws = CLAWS.map((c, i) => `<path d="${c.fill}" style="--d:${0.75 + i * 0.08}s"/>`).join('');
  el.innerHTML = `
    <canvas class="cele-ink"></canvas>
    <div class="cele-mark"><i class="art cele-wolf" style="--m:url(${BASE}art/wolf.webp);--ar:.8133" aria-hidden="true"></i>
    <svg class="cele-claws" viewBox="0 0 100 100" aria-hidden="true">${claws}</svg></div>
    <p class="cele-k">${sub}</p>
    <h2 class="cele-t">${title}</h2>
    <p class="cele-tap">Atinge ca să închizi</p>`;
  document.body.appendChild(el);
  const close = () => {
    el.classList.add('out');
    window.setTimeout(() => el.remove(), 500);
  };
  el.addEventListener('click', close);
  window.setTimeout(close, reduced() ? 2200 : 4200);
  if (reduced()) return;
  // ink splatter thrown from the centre
  const c = el.querySelector('canvas') as HTMLCanvasElement;
  const x = c.getContext('2d');
  if (!x) return;
  const dpr = Math.min(2, devicePixelRatio || 1);
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  const ink = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim() || '#fff';
  const drops = Array.from({ length: 70 }, () => ({ a: Math.random() * 6.283, v: 0.25 + Math.random() * 0.9, r: 1 + Math.pow(Math.random(), 3) * 12 }));
  const t0 = performance.now();
  const draw = (t: number) => {
    const k = Math.min(1, (t - t0) / 900);
    const e = 1 - Math.pow(1 - k, 3);
    x.clearRect(0, 0, c.width, c.height);
    x.fillStyle = ink;
    const cx = c.width / 2;
    const cy = c.height * 0.38;
    const R = Math.hypot(c.width, c.height) * 0.42;
    for (const d of drops) {
      x.beginPath();
      x.arc(cx + Math.cos(d.a) * d.v * R * e, cy + Math.sin(d.a) * d.v * R * e, d.r * dpr * (0.4 + e), 0, 6.283);
      x.fill();
    }
    if (k < 1 && el.isConnected) requestAnimationFrame(draw);
  };
  window.setTimeout(() => requestAnimationFrame(draw), 380);
}
