// The mark for each rank (public/ui/rank): Rookie the mark, Athlete a second rim, Hybrid a taller flame, Elite a white
// rim and a star, Forged in a fire. node scripts/ranks-art.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { svg } from './forge.mjs';

mkdirSync('public/ui/rank', { recursive: true });
for (let r = 0; r < 5; r++) {
  await sharp(Buffer.from(svg({ px: 680, w: 680, h: 801, size: 'large', bg: false, k: 0.92, rank: r }))).webp({ quality: 88, alphaQuality: 100 }).toFile(`public/ui/rank/wolf-${r}.webp`);
  await sharp(Buffer.from(svg({ px: 192, size: 'medium', bg: false, k: 0.98, rank: r }))).webp({ quality: 92, alphaQuality: 100 }).toFile(`public/ui/rank/badge-${r}.webp`);
}
console.log('wrote public/ui/rank/wolf-0..4.webp, badge-0..4.webp');
