// The splash picture, the title lettering and the day banners, from the PNGs on the Desktop: node scripts/photos.mjs [srcDir]
// The banners come cut out of one 2 × 4 sheet (thin grey lines between the panels).
import sharp from 'sharp';
import { mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = process.argv[2] || 'C:/Users/Andrei PC/Desktop';
const SHEET = 'Dezlănțuie fiara interioară (1).png';

// Panel edges on the sheet, measured from the separator lines; 3 px kept off each edge.
const COLS = [[0, 836], [838, 1672]];
const ROWS = [[0, 262], [264, 497], [499, 716], [718, 940]];
// day index (Mon = 0) -> [row, col] on the sheet; [0, 0] "Unleash your inner beast" stays out, the splash says it.
const DAYS = [
  [3, 0], // Combat Training: hard work beats talent (boxer)
  [0, 1], // Push Training: discipline builds freedom
  [1, 0], // Off Day: better than yesterday (the walker in the mountains)
  [1, 1], // Combat Training II: no excuses
  [2, 0], // Pull Training: small steps, big results
  [3, 1], // Mobility & Meditation: same you but stronger
  [2, 1], // Leg Day: pain today, power tomorrow (the runner)
];

mkdirSync('public/splash', { recursive: true });
mkdirSync('public/days', { recursive: true });

// the splash emblem (the metal wolf)
const EMBLEM = readdirSync(SRC).find((f) => f.startsWith('03cOMVLNqlRo6FOaFVCXo5UBf7wrFHUf'));
if (EMBLEM) await sharp(join(SRC, EMBLEM)).resize({ width: 640 }).webp({ quality: 86 }).toFile('public/splash/emblem.webp');

for (const [i, [r, c]] of DAYS.entries()) {
  const [x0, x1] = COLS[c];
  const [y0, y1] = ROWS[r];
  await sharp(join(SRC, SHEET))
    .extract({ left: x0 + 3, top: y0 + 3, width: x1 - x0 - 6, height: y1 - y0 - 6 })
    .webp({ quality: 78 })
    .toFile(`public/days/${i}.webp`);
}
console.log('splash + 7 day banners written');

// The app's background: the wolf in the dark red fog, kept sharp.
await sharp('C:/Users/Andrei PC/Downloads/Lup în ceață roșie întunecată.png')
  .resize({ width: 900 })
  .webp({ quality: 76 })
  .toFile('public/splash/app-bg.webp');
