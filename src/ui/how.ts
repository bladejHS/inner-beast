// "Cum se face": the step-by-step explanation of an exercise, as a collapsible box.
// Screens re-render often, so the open/closed state is remembered per exercise.

import { HOW, VAR_NOTES } from '../data/howto.ts';
import { esc } from '../logic/util.ts';

const openKeys = new Set<string>();
const closedKeys = new Set<string>();

document.addEventListener(
  'toggle',
  (ev) => {
    const el = ev.target as HTMLElement;
    const k = el instanceof HTMLDetailsElement ? el.dataset.how : undefined;
    if (!k) return;
    const open = (el as HTMLDetailsElement).open;
    (open ? openKeys : closedKeys).add(k);
    (open ? closedKeys : openKeys).delete(k);
  },
  true,
);

/** key: workout exercise id or display name; variation: the chosen variation, if any. */
export function howHtml(key: string, variation?: string, opts: { open?: boolean; title?: string } = {}): string {
  const h = HOW[key];
  if (!h) return '';
  const note = variation ? VAR_NOTES[variation] : undefined;
  const open = openKeys.has(key) || (opts.open && !closedKeys.has(key));
  return `<details class="how" data-how="${esc(key)}" ${open ? 'open' : ''}>
    <summary>${esc(opts.title ?? 'Cum se face')}</summary>
    <div class="how-body">
      <ol>${h.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      ${note ? `<p class="how-v"><b>${esc(variation ?? '')}:</b> ${esc(note)}</p>` : ''}
      ${h.mistake ? `<p class="how-x"><b>Atenție</b>${esc(h.mistake)}</p>` : ''}
    </div>
  </details>`;
}

export function hasHow(key: string): boolean {
  return key in HOW;
}
