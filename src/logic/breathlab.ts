// Breathwork Lab: four modes, each a breathing pattern repeated for the chosen minutes.
// Sequences use the same Phase model as the other timers (in / hold / out).

import type { Phase } from './seq.ts';

export type LabMode = 'reset' | 'tactical' | 'recovery' | 'advanced';

export interface LabDef {
  id: LabMode;
  code: string;
  name: string;
  /** Pattern, shown in the list, e.g. "4 · 4 · 4 · 4". */
  pattern: string;
  purpose: string;
  when: string;
  steps: string[];
  mins: number[];
  rec: number;
}

export const LAB: LabDef[] = [
  {
    id: 'reset', code: '01', name: 'RESET', pattern: '2 + 1 · 6',
    purpose: 'Coboară pulsul și panica în 1–2 minute. Suspinul fiziologic: două inspirații, o expirație lungă.',
    when: 'Între runde, după un schimb greu, când simți că pierzi controlul.',
    steps: ['Inspiri pe nas, adânc, 2 secunde.', 'Încă o inspirație scurtă peste, 1 secundă, ca să umpli plămânii complet.', 'Expiri lent pe gură, 6 secunde, până la capăt.'],
    mins: [1, 3, 5], rec: 3,
  },
  {
    id: 'tactical', code: '02', name: 'TACTICAL', pattern: '4 · 4 · 4 · 4',
    purpose: 'Box breathing: calm și focus sub presiune. Mintea limpede, corpul gata.',
    when: 'Înainte de sparring sau meci, înainte de o rundă grea, oricând trebuie să decizi la rece.',
    steps: ['Inspiri pe nas, 4 secunde.', 'Ții aerul, 4 secunde.', 'Expiri, 4 secunde.', 'Ții cu plămânii goi, 4 secunde.'],
    mins: [3, 5, 8], rec: 5,
  },
  {
    id: 'recovery', code: '03', name: 'RECOVERY', pattern: '4 · 8',
    purpose: 'Expirația dublă față de inspirație trece corpul în modul de refacere după efort.',
    when: 'Imediat după antrenament, seara înainte de somn.',
    steps: ['Întins pe spate sau așezat, umerii relaxați.', 'Inspiri pe nas, 4 secunde, în burtă.', 'Expiri lent pe nas sau pe gură, 8 secunde.'],
    mins: [5, 10, 15], rec: 10,
  },
  {
    id: 'advanced', code: '04', name: 'ADVANCED', pattern: '5 · 5 · 5 · 5→20',
    purpose: 'Toleranță la CO₂: box breathing lung, cu pauza pe gol care crește treptat. Antrenează rezistența la senzația de sufocare din runde.',
    when: 'În zilele fără antrenament greu, așezat, cu stomacul gol. Nu înainte de efort maxim.',
    steps: ['Inspiri 5 secunde, ții 5, expiri 5.', 'Ții cu plămânii goi; pauza crește de la 5 la 20 de secunde pe parcurs.', 'Dacă disconfortul devine panică, respiri normal un ciclu și continui.'],
    mins: [5, 8, 12], rec: 8,
  },
];

export function labDef(id: string | undefined): LabDef {
  return LAB.find((m) => m.id === id) ?? LAB[0];
}

const cycleOf = (mode: LabMode, i: number): Array<[Phase['kind'], number, string]> => {
  switch (mode) {
    case 'reset':
      return [['in', 2, 'Inspiră pe nas'], ['in', 1, 'Încă puțin, sus'], ['out', 6, 'Expiră lung pe gură']];
    case 'tactical':
      return [['in', 4, 'Inspiră'], ['hold', 4, 'Ține plin'], ['out', 4, 'Expiră'], ['hold', 4, 'Ține gol']];
    case 'recovery':
      return [['in', 4, 'Inspiră în burtă'], ['out', 8, 'Expiră lent']];
    case 'advanced':
      return [['in', 5, 'Inspiră'], ['hold', 5, 'Ține plin'], ['out', 5, 'Expiră'], ['hold', Math.min(20, 5 + Math.floor(i / 2) * 3), 'Ține gol']];
  }
};

/** Whole cycles filling about `minutes`; each phase carries its cycle number. */
export function labSeq(mode: LabMode, minutes: number, prep = 5): Phase[] {
  const out: Phase[] = [];
  if (prep > 0) out.push({ kind: 'prep', sec: prep, label: 'Așază-te. Umerii jos.' });
  const target = minutes * 60;
  const cycles: Array<Array<[Phase['kind'], number, string]>> = [];
  let t = 0;
  for (let i = 0; t < target - 1; i++) {
    const c = cycleOf(mode, i);
    cycles.push(c);
    t += c.reduce((s, [, sec]) => s + sec, 0);
  }
  cycles.forEach((c, i) => c.forEach(([kind, sec, label]) => out.push({ kind, sec, label, round: i + 1, rounds: cycles.length })));
  return out;
}
