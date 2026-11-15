// The Inner Beast mark, "Umbra" (picked 2026-11-08 from three directions after the logo review): a dark faceted
// wolf's head, only its rim catching the light and its eyes burning red. Vector geometry on a 240 grid, symmetric
// (the right half is drawn, the left is its mirror), in three optical sizes: the large one for the opening and the
// celebration, the medium one for the app icons and the tab bar, the small one for the favicon and the header. The
// smaller it is, the lighter the head, the thicker the rim and the bigger the eyes, so the wolf still reads at 16 px.

const C = 120;
const mir = ([x, y]) => [2 * C - x, y];
const d = (a) => 'M' + a.map(([x, y]) => `${+x.toFixed(2)} ${+y.toFixed(2)}`).join('L') + 'Z';

// the silhouette, clockwise from the dip between the ears to the chin. A wolf, not a fox: ears wide at the base,
// a mane that flares under them, a long muzzle ending in a real nose.
const R = [
  [120, 66], [140, 62], [174, 26], [190, 86], [210, 108], [197, 118], [214, 146], [186, 156], [160, 190], [146, 212], [132, 226], [120, 230],
];
const OUTLINE = [...R, ...R.slice(1, -1).reverse().map(mir)];
const [S0, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11] = R;
const F1 = [120, 102], F2 = [154, 90], EI = [126, 122], EO = [168, 100], C1 = [176, 124], M1 = [140, 152], M2 = [120, 160];
const N0 = [120, 192], N1 = [138, 194], N2 = [130, 211], N3 = [120, 213];

// facets and their tone (0 lightest), painted like a grey wolf's face: dark saddle and brow, lighter cheeks and
// muzzle, dark nose; the left half one tone darker, lit from the upper right
const FACETS = [
  [[S0, S1, F2, F1], 2], [[S1, S2, S3, F2], 2], [[F1, F2, EO, EI], 3], [[S3, S4, S5, C1, EO, F2], 1], [[S5, S6, S7, C1], 0],
  [[EI, EO, C1, M1], 0], [[C1, S7, S8, M1], 1], [[F1, EI, M1, M2], 1], [[M2, M1, S8, S9, N2, N1, N0], 0], [[N0, N1, N2, N3], 4],
  [[N3, N2, S9, S10, S11], 2],
];
const DIAMOND = [[120, 72], [131, 87], [120, 101]];
const EYE = [EI, EO, [158, 114]];
const EAR_IN = [[151, 61], [172, 38], [182, 75]];

const pair = (poly) => [poly, poly.map(mir).reverse()];
const centre = (poly) => [poly.reduce((s, p) => s + p[0], 0) / poly.length, poly.reduce((s, p) => s + p[1], 0) / poly.length];
const grow = (poly, k) => { const [cx, cy] = centre(poly); return poly.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]); };

export const OUTLINE_D = d(OUTLINE);

const SIZES = {
  // tones from the lit side, rim width and strength, eye scale and glow, the red halo behind the head
  large: { tones: ['#2a303d', '#212632', '#191d27', '#12151d', '#0b0d12'], gap: 1.6, rim: 2.4, rimA: 0.75, eye: 1, glow: 8, halo: 0.5 },
  medium: { tones: ['#363d4c', '#2b313e', '#222733', '#1a1e28', '#12151c'], gap: 0, rim: 4.6, rimA: 0.9, eye: 1.08, glow: 7, halo: 0.75 },
  small: { tones: null, fill: '#232835', gap: 0, rim: 9, rimA: 1, eye: 1.3, glow: 5, halo: 0.9 },
};

/** 2026-11-15, the user: "la inner beast pune-i o bandană de luptător ninja". A red fighter's headband across the brow,
 *  above the eyes, knotted on the right with two tails flying out. Drawn over the head, on the same 240 grid. */
function accessory(id, rank = 0) {
  const ink = 'stroke="#05060a" stroke-width="1.8" stroke-linejoin="round"';
  const gold = rank >= 3;
  const band = rank >= 1
    // Luptător and up (2026-11-16): a wider band, longer tails
    ? { tail1: 'M203 91Q222 79 233 66L238 80Q225 93 205 101Z', tail2: 'M202 99Q221 110 231 133L218 138Q212 117 199 105Z', band: 'M43 86Q120 58 197 86L199 108Q120 80 41 108Z', hl: 'M58 87Q120 66 182 87', knot: 'M189 82L206 85L208 107L191 111Z' }
    : { tail1: 'M203 93Q222 82 236 70L238 83Q224 95 205 101Z', tail2: 'M202 99Q220 108 231 128L219 133Q212 115 199 105Z', band: 'M45 90Q120 64 195 90L197 105Q120 80 43 105Z', hl: 'M60 91Q120 71 181 91', knot: 'M190 87L205 89L207 105L192 108Z' };
  const top = gold ? ['#ffe6a6', '#e5b04a', '#8a5a12'] : ['#ff4a5e', '#e5102c', '#8a0a19'];
  return `<defs><linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top[0]}"/><stop offset=".5" stop-color="${top[1]}"/><stop offset="1" stop-color="${top[2]}"/></linearGradient></defs>
  <path d="${band.tail1}" fill="url(#${id}b)" ${ink}/>
  <path d="${band.tail2}" fill="${gold ? '#b8852a' : '#b50c22'}" ${ink}/>
  <path d="${band.band}" fill="url(#${id}b)" ${ink}/>
  <path d="${band.hl}" fill="none" stroke="${gold ? '#fff3cf' : '#ffb3bb'}" stroke-opacity=".5" stroke-width="1.6" stroke-linecap="round"/>
  <path d="${band.knot}" fill="${gold ? '#c99a3c' : '#c00b24'}" ${ink}/>
  ${rank >= 2 ? scar() : ''}`;
}

/** Veteran and up: three claw marks across the left eye, healed pale over the dark fur. */
function scar() {
  return [['M70 108L90 150', 0], ['M80 104L100 146', 0], ['M90 104L106 138', 0]].map(([p]) => `<path d="${p}" fill="none" stroke="#05060a" stroke-width="5.5" stroke-linecap="round"/><path d="${p}" fill="none" stroke="#e59aa4" stroke-width="2.4" stroke-linecap="round"/>`).join('');
}

/** Campion and up: the rim turns gold and a gold medallion with a star sits on the band. */
function armour(id) {
  return `<defs><linearGradient id="${id}au" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c2"/><stop offset=".45" stop-color="#e2ad48"/><stop offset="1" stop-color="#8a5a12"/></linearGradient></defs>
  <path d="${OUTLINE_D}" fill="none" stroke="url(#${id}au)" stroke-width="4.2" stroke-linejoin="round"/>
  <circle cx="120" cy="80" r="11" fill="url(#${id}au)" stroke="#05060a" stroke-width="1.8"/>
  <path d="M120 72.5l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7Z" fill="#fff6dc" stroke="#7a4f10" stroke-width=".8"/>`;
}

/** Bestia: the head stands in a fire, behind it. */
function aura(id) {
  const tongues = [[120, 22, 26], [84, 34, 22], [156, 34, 22], [52, 70, 20], [188, 70, 20], [36, 120, 18], [204, 120, 18], [50, 170, 16], [190, 170, 16]];
  return `<defs><radialGradient id="${id}fi" cx=".5" cy=".55" r=".55"><stop offset=".45" stop-color="#ffd27a"/><stop offset=".7" stop-color="#ff7a1f"/><stop offset="1" stop-color="#e5102c" stop-opacity="0"/></radialGradient>
    <filter id="${id}fb" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter></defs>
  <g filter="url(#${id}fb)" opacity=".95"><ellipse cx="120" cy="136" rx="104" ry="112" fill="url(#${id}fi)"/>
  ${tongues.map(([x, y, w]) => `<path d="M${x - w / 2} ${y + 40}Q${x - w / 3} ${y + 10} ${x} ${y}Q${x + w / 3} ${y + 12} ${x + w / 2} ${y + 40}Z" fill="#ff9a2e"/>`).join('')}</g>`;
}

let n = 0;
/** The mark's body on the 240 grid; `id` keeps the gradient and filter names apart when several sit in one page. */
export function umbra(size = 'medium', id = `u${++n}`, rank = 0) {
  const o = SIZES[size];
  const face = o.tones
    ? FACETS.flatMap(([poly, t]) => pair(poly).map((p, side) => {
        const c = o.tones[Math.min(t + side, o.tones.length - 1)];
        return `<path d="${d(p)}" fill="${c}"${o.gap ? '' : ` stroke="${c}" stroke-width=".7" stroke-linejoin="round"`}/>`;
      })).join('') +
      (o.gap ? FACETS.flatMap(([poly]) => pair(poly)).map((p) => `<path d="${d(p)}" fill="none" stroke="#05060a" stroke-width="${o.gap}" stroke-linejoin="round"/>`).join('') : '') +
      pair(DIAMOND).map((p, i) => `<path d="${d(p)}" fill="${o.tones[i]}"/>`).join('') +
      pair(EAR_IN).map((p) => `<path d="${d(p)}" fill="${o.tones[4]}"/>`).join('')
    : `<path d="${OUTLINE_D}" fill="${o.fill}"/>` + pair(EAR_IN).map((p) => `<path d="${d(p)}" fill="#11141b"/>`).join('');
  const eyes = pair(EYE).map((e) => grow(e, o.eye));
  return `<defs>
    <linearGradient id="${id}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe4ee"/><stop offset=".55" stop-color="#8d97aa"/><stop offset="1" stop-color="#4a5266"/></linearGradient>
    <filter id="${id}h" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
    <filter id="${id}g" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="${o.glow}"/></filter>
  </defs>
  ${rank >= 4 ? aura(id) : ''}
  <path d="${OUTLINE_D}" fill="#e5102c" opacity="${o.halo}" filter="url(#${id}h)"/>
  ${face}
  <path d="${OUTLINE_D}" fill="none" stroke="url(#${id}r)" stroke-opacity="${o.rimA}" stroke-width="${o.rim}" stroke-linejoin="round"/>
  <g filter="url(#${id}g)">${eyes.map((e) => `<path d="${d(e)}" fill="#ff2944"/>`).join('')}</g>
  ${eyes.map((e) => `<path d="${d(e)}" fill="#ff2944"/>`).join('')}
  ${eyes.map((e) => `<path d="${d(grow(e, 0.42))}" fill="#ffa3ad" opacity=".85"/>`).join('')}
  ${rank >= 2 ? `<g filter="url(#${id}g)" opacity=".9">${eyes.map((e) => `<path d="${d(grow(e, 1.5))}" fill="#ff5a6e"/>`).join('')}</g>` : ''}
  ${accessory(id, rank)}
  ${rank >= 3 ? armour(id) : ''}`;
}

/** The icon's field: steel black under a cold spotlight, a red light behind the head, darker at the bottom. */
export function field(id = `f${++n}`) {
  return `<defs><radialGradient id="${id}s" cx=".5" cy=".02" r=".85"><stop offset="0" stop-color="#9fb0cf" stop-opacity=".36"/><stop offset=".55" stop-color="#1b2130" stop-opacity=".45"/><stop offset="1" stop-color="#05060a" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}r" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e5102c" stop-opacity=".5"/><stop offset=".6" stop-color="#6e0715" stop-opacity=".26"/><stop offset="1" stop-color="#05060a" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient></defs>
    <rect width="240" height="240" fill="#05060a"/><rect width="240" height="240" fill="url(#${id}s)"/><circle cx="120" cy="132" r="112" fill="url(#${id}r)"/><rect width="240" height="240" fill="url(#${id}v)"/>`;
}

/** A whole SVG: the field (or none) and the head at `k` of the canvas, nudged down a little. */
export function svg({ px, size = 'medium', bg = true, k = 0.76, rx = 0, w = px, h = px, rank = 0 }) {
  const body = `<g transform="translate(120 ${122 + (h / w - 1) * 120}) scale(${k}) translate(-120 -128)">${umbra(size, undefined, rank)}</g>`;
  const vb = `0 0 240 ${(240 * h) / w}`;
  const clip = rx ? `<clipPath id="cl"><rect width="240" height="${(240 * h) / w}" rx="${rx}"/></clipPath>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb}">${clip}<g${rx ? ' clip-path="url(#cl)"' : ''}>${bg ? field() : ''}${body}</g></svg>`;
}
