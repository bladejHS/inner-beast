// The HYBRID FORGE mark (2026-11-20, the user: "elimină logo-ul cu lupul, vreau altceva"; the app renamed from Inner
// Beast). A barbell seen from the front reads as an H (two plates and the bar), set in a forged hexagon (a nut, a
// bolt head: the forge), and a flame rises out of the bar: strength forged by the work. Yellow on black, the colours
// of the Hybrid365 plan. Vector geometry on a 240 grid, symmetric. Rank variants (public/ui/rank, ranks-art.mjs):
// 0 the mark, 1 a second rim, 2 a taller flame with glow, 3 a white rim and a star, 4 the hexagon in a fire.

const Y = '#f5c211', YH = '#ffd43b', YD = '#a37e05', INK = '#0a0a0a';

const hex = (r, cx = 120, cy = 120) => Array.from({ length: 6 }, (_, i) => {
  const a = ((i * 60 - 90) * Math.PI) / 180;
  return `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
}).join(' ');

let n = 0;
/** The mark on the 240 grid. `size`: 'small' drops the fine details so it reads at 16 px. */
export function forge(size = 'medium', id = `m${++n}`, rank = 0) {
  const small = size === 'small';
  const flameTall = rank >= 2 ? 1.18 : 1;
  const rim = rank >= 3 ? '#ffffff' : Y;
  const flame = `M120 ${(110 - 52 * flameTall).toFixed(1)}C136 ${(110 - 34 * flameTall).toFixed(1)} 142 96 129 108C128 100 124 95 120 91C116 95 112 100 111 108C98 96 104 ${(110 - 34 * flameTall).toFixed(1)} 120 ${(110 - 52 * flameTall).toFixed(1)}Z`;
  return `<defs>
    <linearGradient id="${id}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${YH}"/><stop offset=".55" stop-color="${Y}"/><stop offset="1" stop-color="${YD}"/></linearGradient>
    <linearGradient id="${id}f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${Y}"/><stop offset=".6" stop-color="#ffe9a0"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
    <filter id="${id}g" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${small ? 3 : 6}"/></filter>
    <radialGradient id="${id}fi" cx=".5" cy=".55" r=".55"><stop offset=".5" stop-color="#ffd27a"/><stop offset=".75" stop-color="#ff9a1f"/><stop offset="1" stop-color="#f5c211" stop-opacity="0"/></radialGradient>
  </defs>
  ${rank >= 4 ? `<g filter="url(#${id}g)" opacity=".9"><circle cx="120" cy="124" r="112" fill="url(#${id}fi)"/></g>` : ''}
  <polygon points="${hex(104)}" fill="${INK}"/>
  <polygon points="${hex(98)}" fill="none" stroke="${rim}" stroke-width="${small ? 14 : 10}" stroke-linejoin="round"/>
  ${rank >= 1 && !small ? `<polygon points="${hex(84)}" fill="none" stroke="${Y}" stroke-opacity=".45" stroke-width="2.5" stroke-linejoin="round"/>` : ''}
  <g>
    <rect x="56" y="62" width="30" height="116" rx="6" fill="url(#${id}p)"/>
    <rect x="154" y="62" width="30" height="116" rx="6" fill="url(#${id}p)"/>
    ${small ? '' : `<rect x="88" y="90" width="9" height="60" rx="3" fill="${Y}"/><rect x="143" y="90" width="9" height="60" rx="3" fill="${Y}"/>`}
    <rect x="${small ? 84 : 95}" y="111" width="${small ? 72 : 50}" height="18" rx="3" fill="#f6f5f0"/>
  </g>
  ${rank >= 2 ? `<path d="${flame}" fill="${YH}" filter="url(#${id}g)" opacity=".8"/>` : ''}
  <path d="${flame}" fill="url(#${id}f)"/>
  ${rank >= 3 ? `<path d="M120 ${small ? 186 : 180}l4.2 8.6 9.5 1.4-6.9 6.7 1.6 9.4-8.4-4.4-8.4 4.4 1.6-9.4-6.9-6.7 9.5-1.4Z" fill="#ffffff"/>` : ''}`;
}

/** The icon's field: black, a warm light from above, the yellow glow behind the mark. */
export function field(id = `f${++n}`) {
  return `<defs><radialGradient id="${id}s" cx=".5" cy=".02" r=".9"><stop offset="0" stop-color="#d8d2bd" stop-opacity=".22"/><stop offset=".55" stop-color="#1a1812" stop-opacity=".4"/><stop offset="1" stop-color="#080808" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}r" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f5c211" stop-opacity=".38"/><stop offset=".6" stop-color="#4d3c04" stop-opacity=".22"/><stop offset="1" stop-color="#080808" stop-opacity="0"/></radialGradient></defs>
    <rect width="240" height="240" fill="#080808"/><rect width="240" height="240" fill="url(#${id}s)"/><circle cx="120" cy="124" r="112" fill="url(#${id}r)"/>`;
}

/** A whole SVG: the field (or none) and the mark at `k` of the canvas. */
export function svg({ px, size = 'medium', bg = true, k = 0.76, rx = 0, w = px, h = px, rank = 0 }) {
  const body = `<g transform="translate(120 ${120 + (h / w - 1) * 120}) scale(${k}) translate(-120 -120)">${forge(size, undefined, rank)}</g>`;
  const vb = `0 0 240 ${(240 * h) / w}`;
  const clip = rx ? `<clipPath id="cl"><rect width="240" height="${(240 * h) / w}" rx="${rx}"/></clipPath>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb}">${clip}<g${rx ? ' clip-path="url(#cl)"' : ''}>${bg ? field() : ''}${body}</g></svg>`;
}
