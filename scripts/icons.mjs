// Renders the app icons from the ink wolf (public/art/wolf.webp, made by scripts/art.mjs): node scripts/icons.mjs
// Paper-white wolf on black, so it stands out on a home screen.
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const INK = { r: 13, g: 13, b: 13 };
const PAPER = [243, 241, 236];

/** scale: how much of the canvas height the wolf occupies (maskable icons need a safe zone). */
async function icon(size, scale) {
  const h = Math.round(size * scale);
  const { data, info } = await sharp('public/art/wolf.webp').resize({ height: h }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = info.width * info.height;
  const rgba = Buffer.alloc(px * 4);
  for (let i = 0; i < px; i++) {
    rgba[i * 4] = PAPER[0];
    rgba[i * 4 + 1] = PAPER[1];
    rgba[i * 4 + 2] = PAPER[2];
    rgba[i * 4 + 3] = data[i * 4 + 3];
  }
  const wolf = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: { ...INK, alpha: 1 } } })
    .composite([{ input: wolf, left: Math.round((size - info.width) / 2 + size * 0.03), top: Math.round((size - info.height) / 2) }])
    .png();
}

const out = [
  ['public/icon-512.png', 512, 0.8],
  ['public/icon-192.png', 192, 0.8],
  ['public/apple-touch-icon.png', 180, 0.78],
  ['public/icon-maskable-512.png', 512, 0.6],
  ['public/favicon-32.png', 32, 0.9],
];
for (const [file, size, scale] of out) {
  await (await icon(size, scale)).toFile(file);
  console.log('wrote', file);
}
const b64 = (await (await icon(512, 0.8)).toBuffer()).toString('base64');
writeFileSync('public/icon.svg', `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" viewBox="0 0 512 512"><clipPath id="r"><rect width="512" height="512" rx="112"/></clipPath><image clip-path="url(#r)" width="512" height="512" xlink:href="data:image/png;base64,${b64}"/></svg>`);
console.log('wrote public/icon.svg');
