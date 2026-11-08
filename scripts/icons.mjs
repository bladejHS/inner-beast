// Renders the app icons from the wolf emblem (public/splash/emblem.webp): node scripts/icons.mjs
// Design (2026-11-07), after Apple's app icon guidelines, web.dev on maskable icons and Michael Flarup's five aspects
// (scalability, recognisability, consistency, uniqueness, no words): one object, the app's own low-poly wolf from the
// opening and the tab bar; a steel-black field under a cold spotlight, lit red from behind (Broadcast, 2026-11-08); a red rim around the head so its outline holds at
// 40 px on any wallpaper; the eyes lit, the mark that survives at the smallest sizes. No text, no thin lines.
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const EMBLEM = 'public/splash/emblem.webp';

const svg = (body, w, h) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);

/** Steel black under a cold spotlight, a red light from behind the head, darker at the bottom (Broadcast, 2026-11-08). */
function background(size) {
  return svg(`<defs>
    <radialGradient id="s" cx="0.5" cy="0.05" r="0.75"><stop offset="0" stop-color="#9fb0cf" stop-opacity=".42"/><stop offset="0.5" stop-color="#1b2130" stop-opacity=".5"/><stop offset="1" stop-color="#05060a" stop-opacity="0"/></radialGradient>
    <radialGradient id="g" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#e5102c" stop-opacity=".55"/><stop offset="0.6" stop-color="#6e0715" stop-opacity=".35"/><stop offset="1" stop-color="#05060a" stop-opacity="0"/></radialGradient>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
  </defs><rect width="${size}" height="${size}" fill="#05060a"/><rect width="${size}" height="${size}" fill="url(#s)"/><rect width="${size}" height="${size}" fill="url(#g)"/><rect width="${size}" height="${size}" fill="url(#v)"/>`, size, size);
}

/** The emblem's alpha as one solid colour. */
async function silhouette(h, rgb) {
  const { data, info } = await sharp(EMBLEM).resize({ height: h }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    out[i * 4] = rgb[0];
    out[i * 4 + 1] = rgb[1];
    out[i * 4 + 2] = rgb[2];
    out[i * 4 + 3] = data[i * 4 + 3];
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

/** The emblem's red eyes, brightened: a soft halo and a sharper core. */
async function eyes(h, glow) {
  const { data, info } = await sharp(EMBLEM).resize({ height: h }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2], a = data[i * 4 + 3];
    if (a > 120 && r > 150 && g < 110 && b < 110 && r - g > 90) {
      out[i * 4] = 255;
      out[i * 4 + 1] = Math.min(255, 70 + (r - 150));
      out[i * 4 + 2] = 60;
      out[i * 4 + 3] = 255;
    }
  }
  const base = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  return {
    halo: await sharp(base).blur(glow).png().toBuffer(),
    core: await sharp(base).blur(Math.max(0.5, glow / 6)).png().toBuffer(),
  };
}

/** scale: how much of the canvas height the head takes (maskable icons keep it inside the 80 % circle). */
async function icon(size, scale) {
  const h = Math.round(size * scale);
  const head = await sharp(EMBLEM).resize({ height: h }).png().toBuffer();
  const { width: w } = await sharp(head).metadata();
  const x = Math.round((size - w) / 2);
  const y = Math.round((size - h) / 2 + size * 0.015);
  const rim = await silhouette(h, [255, 41, 68]);
  const e = await eyes(h, Math.max(0.6, size * 0.02));
  return sharp(background(size))
    .composite([
      { input: await sharp(rim).blur(Math.max(0.5, size * 0.03)).png().toBuffer(), left: x, top: y, blend: 'screen' },
      { input: await sharp(rim).blur(Math.max(0.3, size * 0.008)).png().toBuffer(), left: x, top: y, blend: 'screen' },
      { input: head, left: x, top: y },
      { input: e.halo, left: x, top: y, blend: 'screen' },
      { input: e.core, left: x, top: y, blend: 'screen' },
    ])
    .png();
}

const out = [
  ['public/icon-512.png', 512, 0.78],
  ['public/icon-192.png', 192, 0.78],
  ['public/apple-touch-icon.png', 180, 0.76],
  ['public/icon-maskable-512.png', 512, 0.58],
  ['public/favicon-32.png', 32, 0.86],
];
for (const [file, size, scale] of out) {
  await (await icon(size, scale)).toFile(file);
  console.log('wrote', file);
}
// the tab icon only shows at 16-32 px: a 192 px picture inside keeps the file small
const b64 = (await (await icon(192, 0.8)).toBuffer()).toString('base64');
writeFileSync('public/icon.svg', `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" viewBox="0 0 512 512"><clipPath id="r"><rect width="512" height="512" rx="112"/></clipPath><image clip-path="url(#r)" width="512" height="512" xlink:href="data:image/png;base64,${b64}"/></svg>`);
console.log('wrote public/icon.svg');
