// Imported activities (Endurain's idea, written for this offline app): GPX and TCX files become
// a compact record with distance, climb, pace, heart rate, km splits and a route, kept on the device.

import { haversine, simplify } from './geo.ts';

export interface Activity {
  id: string;
  name: string;
  sport: string;
  date: string;
  ts: number;
  dur: number;
  m: number;
  gain: number;
  hr?: number;
  hrMax?: number;
  splits: number[];
  route: Array<[number, number]>;
  gear?: string;
}

export interface Gear {
  id: string;
  name: string;
  /** Distance already on it before it was added. */
  base: number;
  limit: number;
  retired?: boolean;
}

interface Pt {
  lat: number;
  lon: number;
  t: number;
  ele?: number;
  hr?: number;
}

const attr = (s: string, a: string): number => Number(new RegExp(`${a}="([^"]+)"`).exec(s)?.[1]);
const tag = (s: string, re: string): string | undefined => new RegExp(`<(?:\\w+:)?${re}[^>]*>\\s*([^<]+?)\\s*<`).exec(s)?.[1];

function gpxPoints(x: string): Pt[] {
  const out: Pt[] = [];
  for (const m of x.matchAll(/<trkpt\b([^>]*)>([\s\S]*?)<\/trkpt>/g)) {
    const t = Date.parse(tag(m[2], 'time') ?? '');
    const ele = Number(tag(m[2], 'ele'));
    const hr = Number(tag(m[2], 'hr'));
    out.push({ lat: attr(m[1], 'lat'), lon: attr(m[1], 'lon'), t, ele: ele || undefined, hr: hr || undefined });
  }
  return out;
}

function tcxPoints(x: string): Pt[] {
  const out: Pt[] = [];
  for (const m of x.matchAll(/<Trackpoint>([\s\S]*?)<\/Trackpoint>/g)) {
    const lat = Number(tag(m[1], 'LatitudeDegrees'));
    const lon = Number(tag(m[1], 'LongitudeDegrees'));
    if (!lat && !lon) continue;
    const hrBlock = /<HeartRateBpm[^>]*>([\s\S]*?)<\/HeartRateBpm>/.exec(m[1])?.[1] ?? '';
    const ele = Number(tag(m[1], 'AltitudeMeters'));
    out.push({ lat, lon, t: Date.parse(tag(m[1], 'Time') ?? ''), ele: ele || undefined, hr: Number(tag(hrBlock, 'Value')) || undefined });
  }
  return out;
}

const SPORTS: Array<[RegExp, string]> = [[/run/i, 'Alergare'], [/bik|cycl|ride/i, 'Ciclism'], [/walk|hik/i, 'Mers'], [/swim/i, 'Înot']];

/** Parses a GPX or TCX file; returns null when it holds no timed track. */
export function parseActivity(xml: string, fileName: string, id: string): Activity | null {
  const tcx = /<TrainingCenterDatabase/.test(xml);
  const pts = (tcx ? tcxPoints(xml) : gpxPoints(xml)).filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon) && Number.isFinite(p.t));
  if (pts.length < 2) return null;
  const sportRaw = (tcx ? /<Activity Sport="([^"]+)"/.exec(xml)?.[1] : tag(xml, 'type')) ?? fileName;
  const sport = SPORTS.find(([re]) => re.test(sportRaw))?.[1] ?? 'Alergare';
  let m = 0, gain = 0, nextKm = 1000, lastSplit = pts[0].t;
  let ele = pts[0].ele;
  const splits: number[] = [];
  for (let i = 1; i < pts.length; i++) {
    m += haversine(pts[i - 1], pts[i]);
    const e = pts[i].ele;
    // 3 m dead band: GPS altitude noise must not count as climbing
    if (e !== undefined) {
      if (ele === undefined || e < ele) ele = e;
      else if (e - ele >= 3) {
        gain += e - ele;
        ele = e;
      }
    }
    if (m >= nextKm) {
      splits.push(Math.round((pts[i].t - lastSplit) / 1000));
      lastSplit = pts[i].t;
      nextKm += 1000;
    }
  }
  const hrs = pts.flatMap((p) => (p.hr ? [p.hr] : []));
  const first = new Date(pts[0].t);
  const pad = (n: number): string => String(n).padStart(2, '0');
  const name = tag(xml, 'name') ?? fileName.replace(/\.\w+$/, '');
  return {
    id, name, sport, ts: pts[0].t,
    date: `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}`,
    dur: Math.round((pts[pts.length - 1].t - pts[0].t) / 1000),
    m: Math.round(m), gain: Math.round(gain),
    hr: hrs.length ? Math.round(hrs.reduce((s, v) => s + v, 0) / hrs.length) : undefined,
    hrMax: hrs.length ? Math.max(...hrs) : undefined,
    splits, route: simplify(pts, 25).slice(0, 400),
  };
}

export function gearMeters(g: Gear, list: Activity[]): number {
  return g.base + list.filter((a) => a.gear === g.id).reduce((s, a) => s + a.m, 0);
}
