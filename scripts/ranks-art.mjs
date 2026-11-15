// The wolf for each rank (2026-11-16, the user: the wolf evolves with the rank): Recrut the headband, Luptător a
// wider band, Veteran a scar and burning eyes, Campion a gold band and armour, Bestia in a fire. node scripts/ranks-art.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { svg } from './mark.mjs';

mkdirSync('public/ui/rank', { recursive: true });
for (let r = 0; r < 5; r++) {
  await sharp(Buffer.from(svg({ px: 680, w: 680, h: 801, size: 'large', bg: false, k: 1.15, rank: r }))).webp({ quality: 88, alphaQuality: 100 }).toFile(`public/ui/rank/wolf-${r}.webp`);
  await sharp(Buffer.from(svg({ px: 192, size: 'medium', bg: false, k: 0.98, rank: r }))).webp({ quality: 92, alphaQuality: 100 }).toFile(`public/ui/rank/badge-${r}.webp`);
}
console.log('wrote public/ui/rank/wolf-0..4.webp, badge-0..4.webp');
