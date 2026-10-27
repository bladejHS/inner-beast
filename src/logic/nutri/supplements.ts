/* Suplimentele pe niveluri de dovezi:
   Tier 1 — dovezi puternice și siguranță bună; Tier 2 — dovezi moderate sau doar în anumite situații;
   Tier 3 — blocate în aplicație (fără beneficiu dovedit sau cu risc: hormoni, stimulente, diuretice, „cutting" extrem). */
import { BLOCKED_RE } from './floor.ts';

export type Tier = 1 | 2 | 3;

export interface Supplement {
  id: string;
  name: string;
  tier: 1 | 2;
  dose: string;
  /** Eticheta scurtă a nivelului de dovezi. */
  evidence: string;
  /** Pentru ce fel de antrenament contează. */
  when?: string;
}

/* v23: strict după Layne Norton (canalele lui de YouTube): doar ce recomandă el. Beta-alanina, nitrații și bicarbonatul au ieșit. */
export const SUPPLEMENTS: readonly Supplement[] = [
  { id: 'creatina', name: 'Creatină monohidrat', tier: 1, evidence: 'Norton: da, și în cut', dose: '3–5 g pe zi, oricând, și în zilele libere (sau încărcare 20 g pe zi, 5–7 zile). În deficit e poate chiar mai utilă: apa reținută e în mușchi, nu grăsime.' },
  { id: 'cafeina', name: 'Cafeină', tier: 1, evidence: 'Norton: da', dose: '150–250 mg pe zi, constant; la sesiunile cheie până la 6 mg/kg, cu ~45 de minute înainte și departe de somn. Merge și dacă bei cafea zilnic.', when: 'sesiuni cheie' },
  { id: 'proteina', name: 'Proteină din zer', tier: 1, evidence: 'Norton: mâncare comodă', dose: 'Doar ca să ajungi la ținta zilei și la 30–50 g pe masă; nu e magică, contează totalul și distribuția pe 3–5 mese.' },
  { id: 'vitd', name: 'Vitamina D3 (+ calciu din mâncare)', tier: 1, evidence: 'Norton: dacă ai deficit', dose: '1000–2000 UI pe zi toamna și iarna, ideal după analiză. Cu calciu și forță, protejează oasele când mănânci multe proteine.' },
  { id: 'electroliti', name: 'Sodiu (sare)', tier: 1, evidence: 'Norton: nu-l restricționa', dose: 'Sportivii pierd sodiu prin transpirație; doar 5–10% dintre oameni sunt sensibili la sare. Sare normală în mâncare, mai multă în zilele cu transpirație multă, și apă multă.' },
  { id: 'omega3', name: 'Omega-3 (EPA + DHA)', tier: 2, evidence: 'Norton: în deficit mare', dose: '1–2 g pe zi. În deficitele mari, alături de proteina mare, poate limita pierderea de masă slabă.' },
  { id: 'melatonina', name: 'Melatonină', tier: 2, evidence: 'Norton: opțional, pentru somn', dose: '3–10 mg seara, dacă adormi greu. Întâi rutina: aceeași oră, cameră întunecată la 19–21 °C, fără ecran înainte.' },
];

/** Ce spune Norton că NU merită (nu e periculos, doar inutil). */
export const USELESS: readonly { name: string; why: string }[] = [
  { name: 'BCAA / EAA', why: 'Cu proteina zilei atinsă și distribuită pe mese nu adaugă nimic; leucina singură nu construiește mușchi.' },
  { name: 'Glutamină', why: 'E captată de intestin; nu crește masa musculară.' },
  { name: 'L-carnitină', why: 'Nu arde mai multă grăsime: oxidarea grăsimilor e decisă de bilanțul energetic.' },
];

/** Exemple de ce blochează aplicația (explicate, nu recomandate). */
export const BLOCKED: readonly { name: string; why: string }[] = [
  { name: 'Test boosters (tribulus și altele)', why: 'Nu cresc testosteronul în mod relevant la oamenii sănătoși; unele conțin substanțe interzise nedeclarate.' },
  { name: 'Arzătoare de grăsimi', why: 'Stimulente în doze mari (efedrină, yohimbină, DMAA): risc cardiac, fără efect real pe compoziția corporală.' },
  { name: 'Prohormoni, SARMs, steroizi', why: 'Substanțe hormonale cu risc pentru inimă, ficat și fertilitate; interzise în sport.' },
  { name: 'Diuretice și „tăiere" de apă extremă', why: 'Deshidratarea scade forța, crește riscul de accidentare și de leziuni la cap în sporturile de contact.' },
  { name: 'Diete sub pragul sigur', why: 'Sub 1600 kcal pe zi (femei) sau 2000 kcal pe zi (bărbați), aplicația nu propune ținte.' },
];

/** Nivelul unui supliment după nume: cele din listă au nivelul lor; ce pică filtrul Tier 3 e blocat; restul e necunoscut (null). */
export function tierOf(name: string): Tier | null {
  const n = name.trim().toLowerCase();
  const known = SUPPLEMENTS.find((s) => s.name.toLowerCase() === n || s.id === n);
  if (known) return known.tier;
  return BLOCKED_RE.test(n.normalize('NFD').replace(/[̀-ͯ]/g, '')) ? 3 : null;
}
