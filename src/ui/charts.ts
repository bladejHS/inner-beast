// Tiny SVG charts.

import { esc } from '../logic/util.ts';

/** Line of values, last point marked. Higher is better unless `invert`. */
export function spark(values: number[], invert = false): string {
  if (values.length < 2) return '<svg class="spark" viewBox="0 0 100 44"></svg>';
  const w = 100;
  const h = 44;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (w - 8) + 4;
    const n = (v - lo) / span;
    const y = 6 + (invert ? n : 1 - n) * (h - 12);
    return [x, y];
  });
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.2" vector-effect="non-scaling-stroke"/><circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="3" fill="currentColor"/></svg>`;
}

/** Vertical bars with labels; values at or above `goal` are lime, under it red. */
export function bars(items: Array<{ v: number; label: string }>, goal?: number, floor = 1): string {
  const max = Math.max(goal ?? 0, floor, ...items.map((i) => i.v));
  return `<div class="bars">${items
    .map((i) => {
      const cls = goal === undefined ? 'ok' : i.v >= goal ? 'ok' : i.v > 0 ? 'low' : '';
      return `<div><i class="${cls}" style="height:${((i.v / max) * 100).toFixed(1)}%"></i><span>${esc(i.label)}</span></div>`;
    })
    .join('')}</div>`;
}

/** Circular progress ring (0..1). */
export function ring(frac: number, inner: string, stroke = 10): string {
  const r = 50 - stroke / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(1, frac)));
  return `<div class="ring"><svg viewBox="0 0 100 100"><circle class="trk" cx="50" cy="50" r="${r}" stroke-width="${stroke}"/><circle class="val" cx="50" cy="50" r="${r}" stroke-width="${stroke}" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}"/></svg><div class="in">${inner}</div></div>`;
}
