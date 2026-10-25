import { defineConfig, type Plugin } from 'vite';
import { CLAWS } from './src/ui/claws.ts';

// The opening animation lives in index.html so it shows on the very first paint.
// Its claw marks come from the same geometry as the icon and the logo.
function splashClaws(): Plugin {
  const masks = CLAWS.map(
    (c, i) =>
      `<mask id="cm${i}" maskUnits="userSpaceOnUse"><path class="cl-reveal" style="--l:${c.len + 4};--d:${i * 90}ms" d="${c.center}" stroke="#fff" stroke-width="16" fill="none" stroke-linecap="round"/></mask>`,
  ).join('');
  const paths = CLAWS.map((c, i) => `<path d="${c.fill}" mask="url(#cm${i})"/>`).join('');
  const svg = `<svg class="sp-claws" viewBox="0 0 100 100" aria-hidden="true"><defs>${masks}</defs><g fill="#C7FE51">${paths}</g></svg>`;
  return {
    name: 'splash-claws',
    transformIndexHtml: (html) => html.replace('<!--CLAWS-->', svg),
  };
}

// Served from https://bladejhs.github.io/inner-beast/
export default defineConfig({
  base: '/inner-beast/',
  plugins: [splashClaws()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
  },
});
