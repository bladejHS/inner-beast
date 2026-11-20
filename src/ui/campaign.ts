// The 12-week loop as a campaign map, since 2026-11-20 on the Hybrid365 progression (the user: "actualizează harta
// conform progresului din hybrid365"): three chapters of four weeks, Bază 4×6′, Volum 5×6′, Ritm 5×7′ with 60″ jogs;
// under every week its long run (60 → 90 min, five more each week, the 4th week lighter with the tests). Weeks behind
// are lit, the mark stands on this week, the road ahead is dashed.

import { wolfBadge } from './rankart.ts';
import { CYCLE_WEEKS, CYCLES, hybridWeek } from '../logic/progress.ts';
import { esc } from '../logic/util.ts';

const W = 340, ROW = [78, 194, 310], COLS = [44, 128, 212, 296];

/** Where week i (0–11) stands on the map. */
function node(i: number): [number, number] {
  const r = Math.floor(i / CYCLE_WEEKS), k = i % CYCLE_WEEKS;
  return [r % 2 === 0 ? COLS[k]! : COLS[CYCLE_WEEKS - 1 - k]!, ROW[r]!];
}

/** The road from week i to week i + 1: straight on a row, a bend at the end of it. */
function road(i: number): string {
  const [x0, y0] = node(i), [x1, y1] = node(i + 1);
  if (y0 === y1) return `M${x0} ${y0}H${x1}`;
  const out = x0 > W / 2 ? 34 : -34;
  return `M${x0} ${y0}C${x0 + out} ${y0} ${x1 + out} ${y1} ${x1} ${y1}`;
}

/** `pos`: this week in the loop, 0–11; -1 before it starts. `lap`: which time round the loop. */
export function campaignSvg(pos: number, lap: number): string {
  const n = CYCLES.length * CYCLE_WEEKS;
  const roads = Array.from({ length: n - 1 }, (_, i) => `<path class="cp-r ch-${CYCLES[Math.floor((i + 1) / CYCLE_WEEKS)]!.id}${i + 1 <= pos ? ' ok' : ''}" d="${road(i)}"/>`).join('');
  const titles = CYCLES.map((c, r) => `<text class="cp-t ch-${c.id}${pos >= 0 && Math.floor(pos / CYCLE_WEEKS) === r ? ' on' : ''}" ${r > 0 && r % 2 === 0 ? `x="${W - 20}" text-anchor="end"` : 'x="20"'} y="${ROW[r]! - 34}"><tspan class="cp-id">${c.id}</tspan> ${esc(c.name)} · <tspan class="cp-thr">${esc(c.thr)}</tspan></text>`).join('');
  const nodes = Array.from({ length: n }, (_, i) => {
    const [x, y] = node(i);
    const camp = (i + 1) % CYCLE_WEEKS === 0;
    const st = i < pos ? 'ok' : i === pos ? 'now' : '';
    const ch = CYCLES[Math.floor(i / CYCLE_WEEKS)]!.id;
    const label = camp ? 'T' : String((i % CYCLE_WEEKS) + 1);
    return `<g class="cp-n ch-${ch} ${st}${camp ? ' camp' : ''}" style="--i:${i}">
      ${camp ? `<rect x="${x - 15}" y="${y - 15}" width="30" height="30" rx="7" transform="rotate(45 ${x} ${y})"/>` : `<circle cx="${x}" cy="${y}" r="15"/>`}
      ${st === 'ok' ? `<path class="cp-ck" d="M${x - 6} ${y}l4 4 8-9"/>` : st === 'now' ? '' : `<text x="${x}" y="${y + 5}">${label}</text>`}
      <text class="cp-s" x="${x}" y="${y + 34}">${hybridWeek(i).long}′</text>
    </g>`;
  }).join('');
  let wolf = '';
  if (pos >= 0) {
    const [x, y] = node(pos);
    wolf = `<g class="cp-me"><circle class="cp-pulse" cx="${x}" cy="${y}" r="22"/><circle class="cp-pulse two" cx="${x}" cy="${y}" r="22"/>
      <circle class="cp-medal" cx="${x}" cy="${y}" r="20"/><image href="${wolfBadge()}" x="${x - 15}" y="${y - 17}" width="30" height="35"/></g>`;
  }
  return `<svg class="camp" viewBox="0 0 ${W} 350" role="img" aria-label="${pos < 0 ? 'Campania începe luni' : `Săptămâna ${pos + 1} din 12${lap > 1 ? `, turul ${lap}` : ''}`}">
    ${titles}${roads}${nodes}${wolf}
  </svg>`;
}
