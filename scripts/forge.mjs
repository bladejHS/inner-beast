// The ZENITH mark (2026-11-21; the user: "logo-ul ... ceva spectaculos, extraordinar și impresionant").
// A faceted ice-blue peak rises off a glowing horizon; on its tip burns a star, the zenith, its long ray reaching the
// rim. Around it a dial ring with ticks every 15° (the clock you train against), lit from the upper left. The peak is
// cut like a crystal: four facets, light on the left, shade on the right, a white edge where they meet. A second,
// smaller peak inside the first is the running half under the lifting half.
// Vector geometry on a 240 grid, symmetric. Sizes: large (opening, celebration), medium (icons, tab bar), small (16-32
// px: flat shapes, no glow). Ranks (public/ui/rank, ranks-art.mjs): 0 the mark, 1 an inner ring, 2 the star's rays
// and sparks, 3 a platinum dial and a second star, 4 the whole mark in a blue aura.
// The file keeps its old name so icons.mjs, ranks-art.mjs and startup.mjs need no change.

const C = 120;
const P = (a) => a.map(([x, y]) => `${+x.toFixed(2)},${+y.toFixed(2)}`).join(' ');
const mir = ([x, y]) => [2 * C - x, y];

// the peak: apex, feet on the horizon, the notch under it; split down the middle into a lit and a shaded side
const APEX = [120, 50], FOOT = [34, 190], NOTCH = [120, 122], INFOOT = [80, 190];
// the inner peak, lower and narrower
const A2 = [120, 132], F2 = [92, 182], N2 = [120, 160];

function star(cx, cy, r, w = 0.16) {
  const k = r * w;
  return `M${cx} ${cy - r}L${cx + k} ${cy - k}L${cx + r} ${cy}L${cx + k} ${cy + k}L${cx} ${cy + r}L${cx - k} ${cy + k}L${cx - r} ${cy}L${cx - k} ${cy - k}Z`;
}

let n = 0;
export function forge(size = 'medium', id = `m${++n}`, rank = 0) {
  const small = size === 'small', large = size === 'large';
  const plat = rank >= 3;
  const ticks = small ? '' : Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
    const big = i % 6 === 0, r0 = big ? 88 : 92, r1 = 99;
    if (i === 0) return '';
    return `<line x1="${(C + Math.cos(a) * r0).toFixed(2)}" y1="${(C + Math.sin(a) * r0).toFixed(2)}" x2="${(C + Math.cos(a) * r1).toFixed(2)}" y2="${(C + Math.sin(a) * r1).toFixed(2)}" stroke="${big ? '#e3ecf8' : '#7f9cc4'}" stroke-opacity="${big ? 0.9 : 0.55}" stroke-width="${big ? 2.4 : 1.3}" stroke-linecap="round"/>`;
  }).join('');
  // the four facets of each side of the big peak
  const L1 = [APEX, FOOT, INFOOT, NOTCH];
  const midL = [(APEX[0] + FOOT[0]) / 2, (APEX[1] + FOOT[1]) / 2], midLi = [(NOTCH[0] + INFOOT[0]) / 2, (NOTCH[1] + INFOOT[1]) / 2];
  const LA = [APEX, midL, midLi, NOTCH], LB = [midL, FOOT, INFOOT, midLi];
  const sparks = rank >= 2 && !small ? [[58, 70, 4], [186, 84, 3.2], [72, 120, 2.6], [170, 136, 2.4]].map(([x, y, r]) => `<path d="${star(x, y, r * 2, 0.22)}" fill="#eaf2fc" filter="url(#${id}gl)"/><path d="${star(x, y, r * 2, 0.22)}" fill="#ffffff"/>`).join('') : '';
  return `<defs>
    <linearGradient id="${id}rim" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="${plat ? '#ffffff' : '#e6eef8'}"/><stop offset=".4" stop-color="${plat ? '#cfd8e6' : '#7f9cc4'}"/><stop offset=".75" stop-color="${plat ? '#8a95a8' : '#34506f'}"/><stop offset="1" stop-color="${plat ? '#dfe6f0' : '#9db8dc'}"/></linearGradient>
    <radialGradient id="${id}disc" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="#1a2a40"/><stop offset=".55" stop-color="#0c1320"/><stop offset="1" stop-color="#05070c"/></radialGradient>
    <linearGradient id="${id}la" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#cfe0f6"/><stop offset="1" stop-color="#86a9d6"/></linearGradient>
    <linearGradient id="${id}lb" x1="0" y1="0" x2=".2" y2="1"><stop offset="0" stop-color="#a9c4e8"/><stop offset="1" stop-color="#557bb0"/></linearGradient>
    <linearGradient id="${id}ra" x1="1" y1="0" x2=".7" y2="1"><stop offset="0" stop-color="#7c9ccb"/><stop offset="1" stop-color="#2f4b72"/></linearGradient>
    <linearGradient id="${id}rb" x1="1" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#4b6b98"/><stop offset="1" stop-color="#1b2c45"/></linearGradient>
    <linearGradient id="${id}in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#9fbde6"/></linearGradient>
    <linearGradient id="${id}hz" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9fc0ec" stop-opacity="0"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#9fc0ec" stop-opacity="0"/></linearGradient>
    <linearGradient id="${id}ray" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#bcd3f2" stop-opacity="0"/></linearGradient>
    <radialGradient id="${id}glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff"/><stop offset=".2" stop-color="#d7e6fa"/><stop offset=".5" stop-color="#7fa6dc" stop-opacity=".55"/><stop offset="1" stop-color="#3f6aa8" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}aura" cx=".5" cy=".5" r=".5"><stop offset=".6" stop-color="#9cc0f2" stop-opacity=".7"/><stop offset=".82" stop-color="#4f86d6" stop-opacity=".45"/><stop offset="1" stop-color="#1f4f96" stop-opacity="0"/></radialGradient>
    <clipPath id="${id}cl"><circle cx="120" cy="120" r="${small ? 104 : 86}"/></clipPath>
    <filter id="${id}gl" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="${small ? 2 : large ? 6 : 4.5}"/></filter>
    <filter id="${id}big" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="12"/></filter>
  </defs>
  ${rank >= 4 ? `<g filter="url(#${id}big)"><circle cx="120" cy="120" r="122" fill="url(#${id}aura)"/></g>` : ''}
  <circle cx="120" cy="126" r="108" fill="#000" opacity=".5" filter="url(#${id}gl)"/>
  <circle cx="120" cy="120" r="${small ? 112 : 104}" fill="url(#${id}disc)"/>
  <circle cx="120" cy="120" r="${small ? 108 : 101}" fill="none" stroke="url(#${id}rim)" stroke-width="${small ? 10 : 5}"/>
  ${small ? '' : `<circle cx="120" cy="120" r="${rank >= 1 ? 84 : 86}" fill="none" stroke="${rank >= 1 ? '#9db8dc' : '#3b5679'}" stroke-opacity="${rank >= 1 ? 0.8 : 0.6}" stroke-width="${rank >= 1 ? 1.6 : 1}"/>`}
  ${ticks}
  <g clip-path="url(#${id}cl)">
    ${small ? '' : `<ellipse cx="120" cy="190" rx="90" ry="14" fill="#7fa6dc" opacity=".35" filter="url(#${id}gl)"/>`}
    ${small
      ? `<polygon points="${P([APEX, FOOT, INFOOT, NOTCH, mir(INFOOT), mir(FOOT)])}" fill="#bcd3f2"/>`
      : `<polygon points="${P(LA)}" fill="url(#${id}la)"/><polygon points="${P(LB)}" fill="url(#${id}lb)"/>
         <polygon points="${P(LA.map(mir))}" fill="url(#${id}ra)"/><polygon points="${P(LB.map(mir))}" fill="url(#${id}rb)"/>
         <path d="M${APEX[0]} ${APEX[1]}L${NOTCH[0]} ${NOTCH[1]}" stroke="#ffffff" stroke-opacity=".75" stroke-width="1.2"/>
         <path d="M${APEX[0]} ${APEX[1]}L${FOOT[0]} ${FOOT[1]}" stroke="#ffffff" stroke-opacity=".8" stroke-width="1.6"/>
         <path d="M${midL[0]} ${midL[1]}L${midLi[0]} ${midLi[1]}" stroke="#ffffff" stroke-opacity=".35" stroke-width="1"/>
         <path d="M${mir(midL)[0]} ${mir(midL)[1]}L${mir(midLi)[0]} ${mir(midLi)[1]}" stroke="#0b1424" stroke-opacity=".5" stroke-width="1"/>`}
    <polygon points="${P([A2, F2, [104, 182], N2, mir([104, 182]), mir(F2)])}" fill="${small ? '#ffffff' : `url(#${id}in)`}" opacity="${small ? 1 : 0.95}"/>
    ${small ? '' : `<rect x="20" y="189" width="200" height="2.4" fill="url(#${id}hz)"/>`}
  </g>
  ${small ? '' : `<rect x="119" y="${rank >= 2 ? 6 : 14}" width="2" height="${APEX[1] - (rank >= 2 ? 6 : 14)}" fill="url(#${id}ray)" opacity=".9"/>`}
  <g filter="url(#${id}gl)" opacity="${small ? 0.6 : 1}"><circle cx="${APEX[0]}" cy="${APEX[1]}" r="${small ? 16 : 22}" fill="url(#${id}glow)"/></g>
  <path d="${star(APEX[0], APEX[1], small ? 20 : rank >= 2 ? 30 : 24, small ? 0.22 : 0.13)}" fill="#ffffff"/>
  ${small ? '' : `<path d="${star(APEX[0], APEX[1], rank >= 2 ? 15 : 12, 0.2)}" fill="#ffffff" transform="rotate(45 ${APEX[0]} ${APEX[1]})" opacity=".7"/>`}
  ${sparks}
  ${plat && !small ? `<path d="${star(120, 214, 8, 0.25)}" fill="#ffffff"/>` : ''}`;
}

/** The icon's field: night blue, a soft light rising behind the mark, a cooler light from above. */
export function field(id = `f${++n}`) {
  return `<defs><radialGradient id="${id}s" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="#9fb6d6" stop-opacity=".22"/><stop offset=".6" stop-color="#0d1420" stop-opacity=".3"/><stop offset="1" stop-color="#05070c" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}r" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#5f8cc8" stop-opacity=".35"/><stop offset=".55" stop-color="#1b2c45" stop-opacity=".3"/><stop offset="1" stop-color="#05070c" stop-opacity="0"/></radialGradient></defs>
    <rect width="240" height="240" fill="#05070c"/><rect width="240" height="240" fill="url(#${id}s)"/><rect width="240" height="240" fill="url(#${id}r)"/>`;
}

/** A whole SVG: the field (or none) and the mark at `k` of the canvas. */
export function svg({ px, size = 'medium', bg = true, k = 0.76, rx = 0, w = px, h = px, rank = 0 }) {
  const body = `<g transform="translate(120 ${120 + (h / w - 1) * 120}) scale(${k}) translate(-120 -120)">${forge(size, undefined, rank)}</g>`;
  const vb = `0 0 240 ${(240 * h) / w}`;
  const clip = rx ? `<clipPath id="cl"><rect width="240" height="${(240 * h) / w}" rx="${rx}"/></clipPath>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb}">${clip}<g${rx ? ' clip-path="url(#cl)"' : ''}>${bg ? field() : ''}${body}</g></svg>`;
}
