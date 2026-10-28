// "Mai mult": the secondary sections, so the bottom bar keeps five destinations.

import { ic } from '../icons.ts';
import { top } from './shared.ts';

/** Tabs that live behind "Mai mult" (the bar marks it as current while one of them is open). */
export const MORE_TABS: readonly string[] = ['nutri', 'mind', 'alex'];

const LINKS: Array<{ a: string; k?: string; icon: string; t: string; s: string }> = [
  { a: 'tab', k: 'nutri', icon: 'bowl', t: 'Nutriție', s: 'Ținta zilei, mesele notate, tactica și necesarul' },
  { a: 'tab', k: 'mind', icon: 'mind', t: 'Minte', s: 'Wim Hof, respirație, duș alternativ, mobilitate, victorii' },
  { a: 'tab', k: 'alex', icon: 'mask', t: 'Alex', s: 'Combinațiile, sfaturile și rutinele lui Alex Hanma' },
  { a: 'settings', icon: 'gear', t: 'Setări', s: 'Sunet, runde, calendar, copia datelor' },
];

export function moreHtml(): string {
  return `${top()}<h1 class="stack mid">Mai mult</h1>
    <div class="more">${LINKS.map((l) => `<button class="more-r" data-a="${l.a}"${l.k ? ` data-k="${l.k}"` : ''}><span class="more-i">${ic(l.icon)}</span><span class="more-t"><b>${l.t}</b><span>${l.s}</span></span>${ic('chev')}</button>`).join('')}</div>`;
}
