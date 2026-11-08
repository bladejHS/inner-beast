// Renders every picture of the Inner Beast mark from its vector geometry (scripts/mark.mjs): node scripts/icons.mjs
// The mark is "Umbra", picked on 2026-11-08 from three directions after a logo review run on Paul Rand's and
// Chermayeff & Geismar & Haviv's tests (simple, appropriate, distinctive, memorable, scalable) and Michael Flarup's
// five aspects of an app icon: a dark wolf's head under a cold spotlight, its rim catching the light, a red light
// behind it and the eyes burning. It replaces the raster low-poly wolf, which could not be reduced to one colour and
// turned into a blot at 29 px. Each picture uses the optical size it is seen at: medium for the app icons and the tab
// bar, small for the browser tab and the header, large for the opening and the celebration.
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { svg } from './mark.mjs';

const png = (s) => sharp(Buffer.from(s));

const icons = [
  // file, pixels, optical size, how much of the canvas the head takes
  ['public/icon-512.png', 512, 'medium', 0.76],
  ['public/icon-192.png', 192, 'medium', 0.76],
  ['public/apple-touch-icon.png', 180, 'medium', 0.76],
  ['public/icon-maskable-512.png', 512, 'medium', 0.56], // inside the 80 % circle Android may cut to
  ['public/favicon-32.png', 32, 'small', 0.86],
];
for (const [file, px, size, k] of icons) {
  await png(svg({ px, size, k })).png().toFile(file);
  console.log('wrote', file);
}

// the browser tab: the real vector, rounded like the app icon
writeFileSync('public/icon.svg', svg({ px: 512, size: 'small', k: 0.84, rx: 52 }));
console.log('wrote public/icon.svg');

// the header (30 px) and the tab bar's hexagon (40 px): the head alone, no field
writeFileSync('public/ui/mark.svg', svg({ px: 60, size: 'small', bg: false, k: 0.98 }));
await png(svg({ px: 192, size: 'medium', bg: false, k: 0.98 })).webp({ quality: 92, alphaQuality: 100 }).toFile('public/ui/mark-badge.webp');
console.log('wrote public/ui/mark.svg, public/ui/mark-badge.webp');

// the opening and the celebration: the large head on the 680 × 801 canvas the pages already reserve
await png(svg({ px: 680, w: 680, h: 801, size: 'large', bg: false, k: 1.15 })).webp({ quality: 90, alphaQuality: 100 }).toFile('public/splash/umbra.webp');
console.log('wrote public/splash/umbra.webp');
