import test from 'node:test';
import assert from 'node:assert/strict';
import { parseActivity } from './activities.ts';
import { charge, cleanRr, effort, parseHrm, rmssd, zone } from './monitor.ts';
import { fig3d } from '../data/poses3d.ts';
import { HOW } from '../data/howto.ts';
import { WORKOUTS } from '../data/workouts.ts';
import { ROUTINES } from '../data/routines.ts';

test('every exercise, variation and routine move has a 3D figure', () => {
  const missing: string[] = [];
  for (const k of Object.keys(HOW)) if (k !== 'Cold & Warm Showers' && !fig3d(k)) missing.push(k);
  for (const w of WORKOUTS) for (const e of w.ex) for (const v of [e.name, ...e.vars]) if (!fig3d(e.id, v) || !fig3d(v) && !fig3d(e.id)) missing.push(v);
  for (const r of ROUTINES) for (const m of r.moves) if (!fig3d(m.name)) missing.push(m.name);
  assert.deepEqual(missing, []);
});

test('GPX: distance, time, climb, heart rate', () => {
  const pt = (lat: number, s: number, ele: number): string => `<trkpt lat="${lat}" lon="25"><ele>${ele}</ele><time>2026-10-01T08:00:${String(s).padStart(2, '0')}Z</time><extensions><gpxtpx:hr>150</gpxtpx:hr></extensions></trkpt>`;
  const a = parseActivity(`<gpx><trk><name>Test</name><type>running</type><trkseg>${pt(45, 0, 100)}${pt(45.001, 30, 110)}</trkseg></trk></gpx>`, 'x.gpx', 'i');
  assert.ok(a);
  assert.equal(a.name, 'Test');
  assert.equal(a.sport, 'Alergare');
  assert.equal(a.dur, 30);
  assert.ok(Math.abs(a.m - 111) < 2);
  assert.equal(a.gain, 10);
  assert.equal(a.hr, 150);
});

test('TCX is read and empty files are refused', () => {
  const tp = (lat: number, s: number): string => `<Trackpoint><Time>2026-10-01T08:00:${String(s).padStart(2, '0')}Z</Time><Position><LatitudeDegrees>${lat}</LatitudeDegrees><LongitudeDegrees>25</LongitudeDegrees></Position><HeartRateBpm><Value>140</Value></HeartRateBpm></Trackpoint>`;
  const a = parseActivity(`<TrainingCenterDatabase><Activity Sport="Biking">${tp(45, 0)}${tp(45.01, 40)}</Activity></TrainingCenterDatabase>`, 'b.tcx', 'i');
  assert.equal(a?.sport, 'Ciclism');
  assert.equal(a?.hr, 140);
  assert.equal(parseActivity('<gpx></gpx>', 'e.gpx', 'i'), null);
});

test('heart-rate packet with R-R intervals', () => {
  const v = new DataView(new Uint8Array([0x10, 60, 0, 4, 0, 2]).buffer);
  const r = parseHrm(v);
  assert.equal(r.hr, 60);
  assert.deepEqual(r.rr, [1000, 500]);
});

test('HRV, zones, effort, charge', () => {
  assert.deepEqual(cleanRr([800, 810, 1500, 820, 100]), [800, 810, 820]);
  assert.equal(rmssd([800, 810]), null);
  const rr = Array.from({ length: 40 }, (_, i) => (i % 2 ? 800 : 840));
  assert.ok(Math.abs((rmssd(rr) as number) - 40) < 1.5);
  assert.equal(zone(100, 60, 190), 0);
  assert.equal(zone(190, 60, 190), 5);
  assert.equal(effort(7200), 100);
  const past = [50, 52, 48, 51, 49].map((r) => ({ rmssd: r, rhr: 55 }));
  assert.equal(charge({ rmssd: 50, rhr: 55 }, past.slice(0, 3)), null);
  assert.ok((charge({ rmssd: 70, rhr: 50 }, past) as number) > 80);
  assert.ok((charge({ rmssd: 30, rhr: 65 }, past) as number) < 20);
});
