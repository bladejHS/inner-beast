// Renders every key pose of the mobility illustrations into one contact sheet: node scripts/figcheck.mjs out.jpg
import sharp from 'sharp';
import { POSES } from '../src/data/poses.ts';
import { figureSvg } from '../src/ui/figures.ts';

const tiles = [];
for (const [n, fig] of Object.entries(POSES)) {
  for (let k = 0; k < fig.k.length; k++) {
    const svg = figureSvg(fig, k).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="168" ').replace(/currentColor/g, '#111');
    const png = await sharp(Buffer.from(svg)).flatten({ background: '#f3f1ec' }).png().toBuffer();
    const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="16"><text x="3" y="12" font-size="11" font-family="Arial">${n.replace('&', 'and').replace("'", '').slice(0, 26)} ${k}</text></svg>`);
    tiles.push(await sharp({ create: { width: 200, height: 184, channels: 3, background: '#fff' } }).composite([{ input: label, top: 0, left: 0 }, { input: png, top: 16, left: 0 }]).png().toBuffer());
  }
}
const cols = 8;
const rows = Math.ceil(tiles.length / cols);
await sharp({ create: { width: cols * 202, height: rows * 186, channels: 3, background: '#999' } })
  .composite(tiles.map((t, i) => ({ input: t, left: (i % cols) * 202, top: Math.floor(i / cols) * 186 })))
  .jpeg({ quality: 80 })
  .toFile(process.argv[2] || 'figs.jpg');
console.log(tiles.length, rows);
