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
  const claws = CLAWS.map((c) => `<path d="${c.fill}"/>`).join('');
  const r = rounded ? size * 0.22 : 0;
  const u = size / 512;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<defs>
  <radialGradient id="bg" cx="62%" cy="34%" r="80%"><stop offset="0" stop-color="#22330a"/><stop offset=".38" stop-color="#0b1105"/><stop offset=".75" stop-color="#030402"/><stop offset="1" stop-color="#000"/></radialGradient>
  <radialGradient id="halo" cx="58%" cy="44%" r="42%"><stop offset="0" stop-color="#C7FE51" stop-opacity=".14"/><stop offset="1" stop-color="#C7FE51" stop-opacity="0"/></radialGradient>
  <linearGradient id="cl" x1="0" y1="0" x2=".55" y2="1"><stop offset="0" stop-color="#F4FFD0"/><stop offset=".3" stop-color="#D6FF6E"/><stop offset=".62" stop-color="#C7FE51"/><stop offset="1" stop-color="#6FA514"/></linearGradient>
  <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${(7 * u).toFixed(1)}" result="b"/><feColorMatrix in="b" values="0 0 0 0 .78  0 0 0 0 1  0 0 0 0 .32  0 0 0 .55 0"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="shade" x="-10%" y="-10%" width="120%" height="120%"><feOffset dy="${(3 * u).toFixed(1)}"/><feGaussianBlur stdDeviation="${(2.5 * u).toFixed(1)}"/><feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 .1  0 0 0 0 0  0 0 0 .55 0"/></filter>
</defs>
<rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
${dust(60, 7, size)}
<circle cx="${size * 0.56}" cy="${size * 0.47}" r="${size * 0.42}" fill="url(#halo)"/>
<g transform="translate(${off.toFixed(2)} ${off.toFixed(2)}) scale(${k.toFixed(4)})">
  <g filter="url(#glow)" fill="url(#cl)">${claws}</g>
  <g filter="url(#shade)" fill="#000">${claws}</g>
</g>
<rect width="${size}" height="${size}" rx="${r}" fill="url(#rim)" opacity=".3"/>
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
