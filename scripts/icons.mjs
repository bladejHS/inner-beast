// Renders every picture of the HYBRID FORGE mark from its vector geometry (scripts/forge.mjs): node scripts/icons.mjs
// Since 2026-11-20 the mark is the barbell H in a forged hexagon with a flame (the wolf "Umbra" was retired with the
// name Inner Beast). Each picture uses the optical size it is seen at: medium for the app icons and the tab bar,
// small for the browser tab and the header, large for the opening and the celebration.
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { svg } from './forge.mjs';

const png = (s) => sharp(Buffer.from(s));

const icons = [
  // file, pixels, optical size, how much of the canvas the head takes
  ['public/icon-512.png', 512, 'medium', 0.88],
  ['public/icon-192.png', 192, 'medium', 0.88],
  ['public/apple-touch-icon.png', 180, 'medium', 0.88],
  ['public/icon-maskable-512.png', 512, 'medium', 0.68], // inside the 80 % circle Android may cut to
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
await png(svg({ px: 680, w: 680, h: 801, size: 'large', bg: false, k: 0.92 })).webp({ quality: 90, alphaQuality: 100 }).toFile('public/splash/umbra.webp');
console.log('wrote public/splash/umbra.webp');
