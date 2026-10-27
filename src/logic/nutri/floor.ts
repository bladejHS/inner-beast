// Safety floors shared by the nutrition logic (ported from zece-app's coach guardrails).

export type Sex = 'm' | 'f';

/** The app never proposes less than this per day. */
export const KCAL_FLOOR: Record<Sex, number> = { f: 1600, m: 2000 };

/** Tier 3: supplements the app blocks (hormones, extreme stimulants, diuretics, "cutting" products). Text without diacritics, lower case. */
export const BLOCKED_RE = /test(osteron)? ?booster|tribulus|fat ?burner|arzat|efedrin|ephedrin|yohimbin|dmaa|dnp|clenbuterol|sarm|prohormon|steroiz|steroid|anabolizant|diuretic|furosemid|t3 |hormon/;
