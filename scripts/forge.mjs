// The HYBRID FORGE crest (2026-11-20, second version; the user: "refă logo-ul cu totul ... ceva spectaculos").
// A faceted gunmetal crest, lit from the upper left with a polished steel rim, holds a monogram forged in gold: two
// beveled ingots make the H, the bar between them is a barbell, and where the bar meets the middle the metal is
// white-hot and a flame rises out of it. A speed chevron under the H stands for the running half. Gold is kept to the
// monogram, the steel carries the rest (the user found the all-yellow look tiring).
// Vector geometry on a 240 grid, symmetric. Sizes: large (opening, celebration), medium (icons, tab bar), small (16–32
// px: flat shapes, no bevels). Ranks (public/ui/rank, ranks-art.mjs): 0 the crest, 1 a gold inner rim, 2 a taller
// flame with sparks, 3 a platinum rim and a star, 4 the crest in a fire.

const C = 120;
const mir = ([x, y]) => [2 * C - x, y];
const P = (a) => a.map(([x, y]) => `${+x.toFixed(2)},${+y.toFixed(2)}`).join(' ');
const scale = (pts, k, cx = C, cy = 118) => pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);

// the crest, clockwise from the top
const R = [[120, 12], [200, 40], [212, 124], [120, 230]];
const CREST = [...R, ...R.slice(1, -1).reverse().map(mir)];
const CEN = [120, 118];
// facet tones: light from the upper left
const FACE = ['#2e2d2a', '#222120', '#171716', '#0f0f0f', '#1c1b1a', '#282725'];

// the H: two ingots, beveled; front face and the two side bevels
const ING = { x0: 58, x1: 98, y0: 62, y1: 178, b: 8 };
function ingot(left) {
  const { x0, x1, y0, y1, b } = ING;
  const f = [[x0 + b, y0 + b], [x1 - b, y0 + b], [x1 - b, y1 - b], [x0 + b, y1 - b]];
  const outer = [[x0, y0 + b * 1.6], [x0 + b * 1.6, y0], [x1 - b * 1.6, y0], [x1, y0 + b * 1.6], [x1, y1 - b * 1.6], [x1 - b * 1.6, y1], [x0 + b * 1.6, y1], [x0, y1 - b * 1.6]];
  const m = left ? (p) => p : (p) => p.map(mir);
  return { face: m(f), outer: m(outer) };
}

let n = 0;
export function forge(size = 'medium', id = `m${++n}`, rank = 0) {
  const small = size === 'small';
  const L = ingot(true), Rg = ingot(false);
  const tall = rank >= 2 ? 1.16 : 1;
  const fy = (y) => 120 - (120 - y) * tall;
  const flameO = `M120 ${fy(26)}C129 ${fy(44)} 141 ${fy(55)} 140 ${fy(76)}C146 ${fy(70)} 148 ${fy(62)} 147 ${fy(52)}C159 ${fy(65)} 161 84 153 99C147 109 135 113 120 113C105 113 93 109 87 99C79 84 81 ${fy(65)} 93 ${fy(52)}C92 ${fy(62)} 94 ${fy(70)} 100 ${fy(76)}C99 ${fy(55)} 111 ${fy(44)} 120 ${fy(26)}Z`;
  const flameI = `M120 ${fy(56)}C127 ${fy(68)} 135 77 133 92C131 102 126 107 120 107C114 107 109 102 107 92C105 77 113 ${fy(68)} 120 ${fy(56)}Z`;
  const rimTop = rank >= 3 ? '#ffffff' : '#f3f1ea', rimMid = rank >= 3 ? '#d9dde6' : '#9b9890', rimLow = rank >= 3 ? '#8f96a6' : '#3c3a36';
  const facets = CREST.map((p, i) => `<polygon points="${P([CEN, p, CREST[(i + 1) % CREST.length]])}" fill="${FACE[i % FACE.length]}"/>`).join('');
  const sparks = rank >= 2 && !small ? [[86, 40, 5], [158, 50, 4], [100, 22, 3.5], [146, 28, 3]].map(([x, y, r]) => `<path d="M${x} ${y - r * 2}L${x + r * 0.5} ${y - r * 0.5}L${x + r * 2} ${y}L${x + r * 0.5} ${y + r * 0.5}L${x} ${y + r * 2}L${x - r * 0.5} ${y + r * 0.5}L${x - r * 2} ${y}L${x - r * 0.5} ${y - r * 0.5}Z" fill="#fff4d6" filter="url(#${id}gl)"/>`).join('') : '';
  return `<defs>
    <linearGradient id="${id}rim" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="${rimTop}"/><stop offset=".45" stop-color="${rimMid}"/><stop offset="1" stop-color="${rimLow}"/></linearGradient>
    <linearGradient id="${id}au" x1="0" y1="0" x2=".2" y2="1"><stop offset="0" stop-color="#f3e6bd"/><stop offset=".26" stop-color="#d5b45d"/><stop offset=".6" stop-color="#b89443"/><stop offset=".85" stop-color="#80652d"/><stop offset="1" stop-color="#44351b"/></linearGradient>
    <linearGradient id="${id}aul" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ead39a"/><stop offset="1" stop-color="#b89443"/></linearGradient>
    <linearGradient id="${id}aud" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#80652d"/><stop offset="1" stop-color="#44351b"/></linearGradient>
    <linearGradient id="${id}bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#c9c8c2"/><stop offset="1" stop-color="#55534e"/></linearGradient>
    <linearGradient id="${id}fo" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#c8742a"/><stop offset=".55" stop-color="#dfa14a"/><stop offset="1" stop-color="#ecd08a" stop-opacity=".9"/></linearGradient>
    <linearGradient id="${id}fi" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f6ead0"/><stop offset="1" stop-color="#e2c27c"/></linearGradient>
    <radialGradient id="${id}hot" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="#f1dca6"/><stop offset=".55" stop-color="#c8842e" stop-opacity=".6"/><stop offset="1" stop-color="#80652d" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}fire" cx=".5" cy=".6" r=".55"><stop offset=".55" stop-color="#ffcf6a"/><stop offset=".78" stop-color="#ff7a1a"/><stop offset="1" stop-color="#c03a00" stop-opacity="0"/></radialGradient>
    <filter id="${id}gl" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="${small ? 2 : 5}"/></filter>
    <filter id="${id}big" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  ${rank >= 4 ? `<g filter="url(#${id}big)" opacity=".95"><ellipse cx="120" cy="128" rx="118" ry="122" fill="url(#${id}fire)"/></g>` : ''}
  <polygon points="${P(scale(CREST, 1.02))}" fill="#000" opacity=".55" filter="url(#${id}gl)" transform="translate(0 6)"/>
  ${small ? `<polygon points="${P(CREST)}" fill="#1b1b1b"/>` : facets}
  <polygon points="${P(CREST)}" fill="none" stroke="url(#${id}rim)" stroke-width="${small ? 14 : 7}" stroke-linejoin="miter"/>
  ${!small ? `<polygon points="${P(scale(CREST, 0.885))}" fill="none" stroke="${rank >= 1 ? '#b89443' : '#000'}" stroke-opacity="${rank >= 1 ? 0.85 : 0.5}" stroke-width="${rank >= 1 ? 2.4 : 2}" stroke-linejoin="miter"/>` : ''}
  ${!small ? `<path d="M40 46L120 18L200 46" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="1.6"/>` : ''}
  <g filter="url(#${id}gl)" opacity="${small ? 0.5 : 0.85}"><circle cx="120" cy="114" r="${small ? 26 : 38}" fill="url(#${id}hot)"/></g>
  <path d="${flameO}" fill="url(#${id}fo)"/>
  ${small ? '' : `<path d="${flameI}" fill="url(#${id}fi)"/>`}
  <rect x="${small ? 90 : 96}" y="111" width="${small ? 60 : 48}" height="${small ? 16 : 12}" rx="2" fill="url(#${id}bar)"/>
  ${small ? '' : `<rect x="96" y="108" width="5" height="18" rx="1.5" fill="#d9d7d0"/><rect x="139" y="108" width="5" height="18" rx="1.5" fill="#d9d7d0"/>`}
  ${small
    ? `<rect x="56" y="58" width="42" height="124" rx="4" fill="#b89443"/><rect x="142" y="58" width="42" height="124" rx="4" fill="#b89443"/>`
    : [L, Rg].map((g, i) => `<polygon points="${P(g.outer)}" fill="url(#${id}${i ? 'aud' : 'aul'})"/><polygon points="${P(g.face)}" fill="url(#${id}au)"/><polygon points="${P(g.face)}" fill="none" stroke="#fff6dc" stroke-opacity=".35" stroke-width="1"/>`).join('')}
  ${small ? '' : `<path d="M68 72L68 160" stroke="#fffaf0" stroke-opacity=".55" stroke-width="2.6" stroke-linecap="round"/><path d="M151 72L151 118" stroke="#fffaf0" stroke-opacity=".3" stroke-width="2" stroke-linecap="round"/>`}
  <g filter="url(#${id}gl)" opacity=".9"><circle cx="120" cy="117" r="${small ? 7 : 9}" fill="#fff8e8"/></g>
  <path d="M${small ? 92 : 96} 190L120 ${small ? 212 : 206}L${small ? 148 : 144} 190" fill="none" stroke="${small ? '#b89443' : `url(#${id}au)`}" stroke-width="${small ? 12 : 8}" stroke-linecap="square" stroke-linejoin="miter"/>
  ${sparks}
  ${rank >= 3 ? `<path d="M120 ${small ? 20 : 24}l3.6 7.4 8.2 1.2-5.9 5.8 1.4 8.1-7.3-3.8-7.3 3.8 1.4-8.1-5.9-5.8 8.2-1.2Z" fill="#ffffff"/>` : ''}`;
}

/** The icon's field: charcoal, a warm glow rising from below the crest, a cool light from above. */
export function field(id = `f${++n}`) {
  return `<defs><radialGradient id="${id}s" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="#c9ccd4" stop-opacity=".22"/><stop offset=".6" stop-color="#16171b" stop-opacity=".3"/><stop offset="1" stop-color="#0a0a0b" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}r" cx=".5" cy=".62" r=".55"><stop offset="0" stop-color="#b89443" stop-opacity=".26"/><stop offset=".55" stop-color="#44351b" stop-opacity=".22"/><stop offset="1" stop-color="#070707" stop-opacity="0"/></radialGradient></defs>
    <rect width="240" height="240" fill="#070707"/><rect width="240" height="240" fill="url(#${id}s)"/><rect width="240" height="240" fill="url(#${id}r)"/>`;
}

/** A whole SVG: the field (or none) and the crest at `k` of the canvas. */
export function svg({ px, size = 'medium', bg = true, k = 0.76, rx = 0, w = px, h = px, rank = 0 }) {
  const body = `<g transform="translate(120 ${120 + (h / w - 1) * 120}) scale(${k}) translate(-120 -121)">${forge(size, undefined, rank)}</g>`;
  const vb = `0 0 240 ${(240 * h) / w}`;
  const clip = rx ? `<clipPath id="cl"><rect width="240" height="${(240 * h) / w}" rx="${rx}"/></clipPath>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb}">${clip}<g${rx ? ' clip-path="url(#cl)"' : ''}>${bg ? field() : ''}${body}</g></svg>`;
}
