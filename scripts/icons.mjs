// Renders the app icons from the claw geometry: node scripts/icons.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { CLAWS } from '../src/ui/claws.ts';

const LIME = '#C7FE51';

// Fixed pseudo-random dust so the icon is identical on every build.
function dust(n, seed, size) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  let out = '';
  for (let i = 0; i < n; i++) {
    const r = rnd() < 0.85 ? 0.9 + rnd() * 1.2 : 2 + rnd() * 1.6;
    out += `<circle cx="${(rnd() * size).toFixed(1)}" cy="${(rnd() * size).toFixed(1)}" r="${((r * size) / 512).toFixed(2)}" fill="#fff" opacity="${(0.15 + rnd() * 0.45).toFixed(2)}"/>`;
  }
  return out;
}

/** scale: how much of the canvas the claws occupy (maskable icons need a safe zone). */
function iconSvg(size, scale = 0.8, rounded = false) {
  const off = (size * (1 - scale)) / 2;
  const k = (size * scale) / 100;
  const claws = CLAWS.map((c) => `<path d="${c.fill}" fill="${LIME}"/>`).join('');
  const r = rounded ? size * 0.22 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<defs><radialGradient id="g" cx="50%" cy="46%" r="60%"><stop offset="0" stop-color="#1c2408"/><stop offset="0.55" stop-color="#050505"/><stop offset="1" stop-color="#000"/></radialGradient>
<filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${(size / 160).toFixed(1)}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="${size}" height="${size}" rx="${r}" fill="url(#g)"/>
${dust(70, 7, size)}
<g filter="url(#glow)" transform="translate(${off.toFixed(2)} ${off.toFixed(2)}) scale(${k.toFixed(4)})">${claws}</g>
</svg>`;
}

const out = [
  ['public/icon-512.png', 512, 0.8],
  ['public/icon-192.png', 192, 0.8],
  ['public/apple-touch-icon.png', 180, 0.78],
  ['public/icon-maskable-512.png', 512, 0.58],
  ['public/favicon-32.png', 32, 0.92],
];
for (const [file, size, scale] of out) {
  await sharp(Buffer.from(iconSvg(size, scale))).png().toFile(file);
  console.log('wrote', file);
}
writeFileSync('public/icon.svg', iconSvg(512, 0.8, true));
console.log('wrote public/icon.svg');
