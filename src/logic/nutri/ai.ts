// AI meal estimates (photo or text) and the weekly review, with the user's own Anthropic key.
// The SDK is loaded only when one of these runs, so the rest of the app stays small and works offline.

import type Anthropic from '@anthropic-ai/sdk';

export const AI_MODEL = 'claude-opus-5-5';

export interface MealEstimate {
  name: string;
  items: Array<{ food: string; grams: number; kcal: number }>;
  kcal: number;
  p: number;
  c: number;
  g: number;
  conf: string;
  note: string;
}

const MEAL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'items', 'kcal', 'protein_g', 'carbs_g', 'fat_g', 'confidence', 'note'],
  properties: {
    name: { type: 'string', description: 'Numele scurt al mesei, în română.' },
    items: {
      type: 'array',
      items: { type: 'object', additionalProperties: false, required: ['food', 'grams', 'kcal'], properties: { food: { type: 'string' }, grams: { type: 'number' }, kcal: { type: 'number' } } },
    },
    kcal: { type: 'number' },
    protein_g: { type: 'number' },
    carbs_g: { type: 'number' },
    fat_g: { type: 'number' },
    confidence: { type: 'string', enum: ['mică', 'medie', 'mare'] },
    note: { type: 'string', description: '1–2 propoziții: ce e incert (ulei, sosuri, porții ascunse).' },
  },
};
const PHOTO_PROMPT =
  'Estimează conținutul nutrițional al mesei din poză. Identifică fiecare aliment vizibil și cantitatea aproximativă în grame, folosind farfuria, tacâmurile sau mâna ca reper. Totalurile trebuie să fie suma alimentelor. Include uleiul sau sosul probabil folosit dacă e vizibil. Dacă poza nu arată mâncare, întoarce o listă goală, 0 la toate valorile și explică în note. Răspunde în română.';
const TEXT_PROMPT =
  'Estimează conținutul nutrițional al mesei descrise mai jos (în română, poate fi dictată, cu greșeli). Identifică fiecare aliment și cantitatea; dacă lipsește, folosește o porție obișnuită și spune asta în note. Totalurile sunt suma alimentelor. Răspunde în română.\n\nMasa: ';

let sdk: Promise<typeof import('@anthropic-ai/sdk')> | null = null;
async function client(key: string): Promise<Anthropic> {
  sdk ??= import('@anthropic-ai/sdk');
  const { default: A } = await sdk;
  // the key belongs to the person using the app and stays on their phone; there is no server in between
  return new A({ apiKey: key, dangerouslyAllowBrowser: true, maxRetries: 2 });
}

/** A readable Romanian message for any failure. */
export async function aiErrText(e: unknown): Promise<string> {
  if (!navigator.onLine) return 'Nu ai internet. Încearcă din nou când ești online.';
  if (e instanceof Error && e.message === '__refuz') return 'Modelul a refuzat cererea.';
  if (e instanceof SyntaxError) return 'Răspunsul nu a putut fi citit. Mai încearcă o dată.';
  const { default: A } = await (sdk ?? import('@anthropic-ai/sdk'));
  if (e instanceof A.AuthenticationError) return 'Cheia API nu e bună. Verific-o în Necesar → Antrenor AI.';
  if (e instanceof A.PermissionDeniedError) return 'Cheia nu are acces la model.';
  if (e instanceof A.RateLimitError) return 'Prea multe cereri acum. Mai încearcă peste un minut.';
  if (e instanceof A.APIConnectionError) return 'Nu ajung la Anthropic. Verifică internetul.';
  if (e instanceof A.APIError) return (e.status ?? 0) >= 500 ? 'Serviciul e ocupat acum. Mai încearcă puțin mai târziu.' : `Cererea a eșuat (${e.status}).`;
  return 'Ceva n-a mers. Mai încearcă.';
}

async function structured(key: string, content: Anthropic.Beta.Messages.BetaContentBlockParam[]): Promise<MealEstimate> {
  const c = await client(key);
  const msg = await c.beta.messages.create({
    model: AI_MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: MEAL_SCHEMA } },
    messages: [{ role: 'user', content }],
  });
  if (msg.stop_reason === 'refusal') throw new Error('__refuz');
  const txt = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
  const r = JSON.parse(txt) as Record<string, unknown>;
  return {
    name: String(r.name || 'Masă').slice(0, 80),
    items: Array.isArray(r.items) ? (r.items as MealEstimate['items']) : [],
    kcal: Math.round(+(r.kcal as number) || 0),
    p: Math.round(+(r.protein_g as number) || 0),
    c: Math.round(+(r.carbs_g as number) || 0),
    g: Math.round(+(r.fat_g as number) || 0),
    conf: String(r.confidence || ''),
    note: String(r.note || ''),
  };
}

export function estimatePhoto(key: string, jpegB64: string, hint: string): Promise<MealEstimate> {
  return structured(key, [
    { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: jpegB64 } },
    { type: 'text', text: PHOTO_PROMPT + (hint ? `\n\nDetalii de la utilizator: ${hint}` : '') },
  ]);
}

export function estimateText(key: string, text: string): Promise<MealEstimate> {
  return structured(key, [{ type: 'text', text: TEXT_PROMPT + text }]);
}

/** The weekly review: the averages go in, a short plain-text analysis comes back. */
export async function weekReview(key: string, facts: string): Promise<string> {
  const c = await client(key);
  const msg = await c.beta.messages.create({
    model: AI_MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium' },
    system:
      'Ești antrenorul de nutriție din aplicația Inner Beast. Nutriția urmează Layne Norton: ritm de 0,4–0,8% din greutate pe săptămână la cut, niciodată peste 1%; proteina pe masa slabă; schimbi ceva abia după 2 săptămâni la rând sub jumătate din ritm, cu 100–200 kcal sau mai mulți pași. Nu propui niciodată sub 2000 kcal pe zi pentru bărbați sau 1600 pentru femei, nici suplimente fără dovezi. Răspunzi în română, scurt (cel mult 120 de cuvinte), fără titluri, fără markdown.',
    messages: [{ role: 'user', content: facts }],
  });
  if (msg.stop_reason === 'refusal') throw new Error('__refuz');
  return msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim();
}

/** Photo → JPEG base64, at most 1024 px on the long edge. */
export async function photoB64(file: Blob): Promise<{ url: string; data: string }> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const k = Math.min(1, 1024 / Math.max(bmp.width, bmp.height));
  const cv = document.createElement('canvas');
  cv.width = Math.max(1, Math.round(bmp.width * k));
  cv.height = Math.max(1, Math.round(bmp.height * k));
  cv.getContext('2d')!.drawImage(bmp, 0, 0, cv.width, cv.height);
  bmp.close();
  const url = cv.toDataURL('image/jpeg', 0.8);
  return { url, data: url.split(',')[1] };
}
