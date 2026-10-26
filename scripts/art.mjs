// Turns the ink drawings from Desktop\photo into alpha masks: node scripts/art.mjs [srcDir]
// Each picture becomes black ink on transparency (darkness = opacity), so the app can paint it
// in any colour through CSS mask-image and it sits cleanly on paper or on black.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = process.argv[2] || 'C:/Users/Andrei PC/Desktop/photo';
const OUT = 'public/art';

// name: [file, max edge in px, white point, black point, optional crop {left, top, width, height}]
const ART = {
  wolf: ['cbc7c0affc9e40f99f744c935b26c20d.jpg', 900, 196, 30, { left: 120, top: 30, width: 392, height: 482 }],
  claws: ['db904f92a5b85dee7a53a13a4028a99d.jpg', 700, 235, 60],
  fighter: ['03ee0c9327f521de71ac1fbef68fc5bb.jpg', 900, 230, 50],
  strength: ['b1be6056b8c7e5dd40c5001c4da1d0d2.jpg', 900, 238, 40],
  norisk: ['63fd3097f2f57ddfb2ac0766536015cb.jpg', 800, 230, 40],
  trust: ['descărcare (2).png', 800, 235, 40],
  boxer: ['31b8261aef979c40e7abeb28a367f604.jpg', 800, 225, 60],
  atlas: ['8d0c6df74c82a501d3ac892f01d7c845.jpg', 800, 225, 50, { left: 150, top: 255, width: 300, height: 630 }],
  eyes: ['46fd93da904acfc36b1ccc0c06635229.jpg', 900, 215, 40],
  why: ['847af5c6a2822eafa1950a239e673481.jpg', 900, 235, 60],
  heart: ['f15a5897f610082e2f90e21e8ee60bd5.jpg', 700, 225, 50],
  angel: ['9ca3af225cecb6ae99f85b30cf4edd28.jpg', 900, 235, 40],
  masks: ['eebb4cf77da4d668615c998e8ff53538.jpg', 700, 225, 50],
  jester: ['65ed69b62085c5a9a738f2964a3d6c2d.jpg', 700, 225, 50],
  peek: ['55882412a4d27b0cac8b4b5c1304baef.jpg', 600, 225, 50],
  sharks: ['d07d6b14f837fe5f5e63b150cca75d7d.jpg', 800, 240, 70],
};

mkdirSync(OUT, { recursive: true });

for (const [name, [file, max, white, black, crop]] of Object.entries(ART)) {
  // PNGs with transparency get flattened on white first, so "no ink" reads as paper.
  let img = sharp(join(SRC, file)).flatten({ background: '#ffffff' });
  if (crop) img = sharp(await img.toBuffer()).extract(crop);
  const flat = await img.grayscale().toBuffer();
  const trimmed = await sharp(flat).trim({ background: '#ffffff', threshold: 18 }).toBuffer();
  const { data, info } = await sharp(trimmed)
    .resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px = info.width * info.height;
  const rgba = Buffer.alloc(px * 4);
  for (let i = 0; i < px; i++) {
    const g = data[i * info.channels];
    const a = Math.max(0, Math.min(1, (white - g) / (white - black)));
    rgba[i * 4 + 3] = Math.round(Math.pow(a, 0.9) * 255);
  }
  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .webp({ quality: 82, alphaQuality: 90, effort: 6 })
    .toFile(join(OUT, `${name}.webp`));
  console.log(`${name}.webp ${info.width}x${info.height}`);
}
