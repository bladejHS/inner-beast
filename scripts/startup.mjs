// iPhone launch images (apple-touch-startup-image): the black of the opening with the wolf stood dim in the middle, one
// PNG per device size, so the home-screen app opens straight into the Forge instead of a white or empty screen.
// usage: node scripts/startup.mjs <mark.webp> <out dir> [bg hex]   → writes start-<w>x<h>.png and prints the <link> tags
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [mark, out, bg = '#05060a'] = process.argv.slice(2);
// [css width, css height, scale]; portrait only (a home-screen app starts in portrait)
const SIZES = [
  [440, 956, 3], [402, 874, 3], [430, 932, 3], [393, 852, 3], [390, 844, 3], [375, 812, 3],
  [428, 926, 3], [414, 896, 3], [414, 896, 2], [375, 667, 2], [414, 736, 3],
];
mkdirSync(out, { recursive: true });
const links = [];
for (const [w, h, s] of SIZES) {
  const W = w * s, H = h * s;
  const mw = Math.round(W * 0.22);
  const wolf = await sharp(mark).resize({ width: mw }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // the wolf at 30 % so it reads as the dark before the sparks, not as the finished mark
  const dim = Buffer.from(wolf.data);
  for (let i = 3; i < dim.length; i += 4) dim[i] = Math.round(dim[i] * 0.3);
  const wolfPng = await sharp(dim, { raw: wolf.info }).png().toBuffer();
  const file = `start-${W}x${H}.png`;
  await sharp({ create: { width: W, height: H, channels: 3, background: bg } })
    .composite([{ input: wolfPng, left: Math.round((W - mw) / 2), top: Math.round(H * 0.42 - (wolf.info.height) / 2) }])
    .png({ compressionLevel: 9, palette: true, colors: 64 })
    .toFile(join(out, file));
  links.push(`<link rel="apple-touch-startup-image" media="(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${s}) and (orientation: portrait)" href="splash/${file}">`);
}
console.log(links.join('\n'));
