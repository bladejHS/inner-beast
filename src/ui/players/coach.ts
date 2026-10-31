// Camera coach: pose tracking on the device. Video is never stored or sent anywhere.

import { angle, bodyLine, foldAngle, GuardTracker, L, nearSide, RepCounter, seen, splitAngle, type Pt } from '../../logic/coach.ts';
import { makeEntry } from '../../logic/store.ts';
import { esc, mmss } from '../../logic/util.ts';
import { buzz, say, sfx, unlock } from '../audio.ts';
import { addEntry, ctx, mountPlayer, ovEl, save, toast, type Player } from '../ctx.ts';
import { chrome, setText } from './common.ts';

type Mode = 'box' | 'pushups' | 'squats' | 'pullups' | 'split' | 'fold';

const MODES: Array<{ k: Mode; name: string; how: string }> = [
  { k: 'box', name: 'Shadow Boxing', how: 'Stai la 45° față de cameră, cu tot trunchiul în cadru. Loviturile drepte spre cameră se văd mai greu.' },
  { k: 'pushups', name: 'Push-ups', how: 'Telefonul pe sol, în lateral, la 2 metri. Trebuie să se vadă din cap până în glezne.' },
  { k: 'squats', name: 'Squats', how: 'Telefonul la nivelul șoldului, în lateral sau la 45°, la 2–3 metri.' },
  { k: 'pullups', name: 'Pull-ups', how: 'Telefonul sub bară, în fața ta, cu brațele și umerii în cadru.' },
  { k: 'split', name: 'Middle Split', how: 'Față în cameră, picioarele în sfoară. Măsoară unghiul dintre picioare.' },
  { k: 'fold', name: 'Seated Forward Fold', how: 'Așezat, lateral față de cameră. Măsoară cât de aproape ajunge trunchiul de coapse.' },
];
const BONES: Array<[number, number]> = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28]];

type Pose = import('@mediapipe/tasks-vision').PoseLandmarker;
let posePromise: Promise<Pose> | null = null;

export function loadPose(): Promise<Pose> {
  posePromise ??= (async () => {
    const { PoseLandmarker } = await import('@mediapipe/tasks-vision');
    const base = new URL(`${import.meta.env.BASE_URL}pose/`, location.href).href;
    const wasm = { wasmLoaderPath: `${base}wasm/vision_wasm_internal.js`, wasmBinaryPath: `${base}wasm/vision_wasm_internal.wasm` };
    const make = (delegate: 'GPU' | 'CPU'): Promise<Pose> =>
      PoseLandmarker.createFromOptions(wasm, { baseOptions: { modelAssetPath: `${base}pose_landmarker_lite.task`, delegate }, runningMode: 'VIDEO', numPoses: 1 });
    return make('GPU').catch(() => make('CPU'));
  })().catch((e: unknown) => {
    posePromise = null;
    throw e;
  });
  return posePromise;
}

class CoachPlayer implements Player {
  st: 'pick' | 'load' | 'run' | 'done' = 'pick';
  mode = MODES[0];
  stream: MediaStream | null = null;
  raf = 0;
  t0 = 0;
  lastVideo = -1;
  reps = new RepCounter(150, 100);
  guard = new GuardTracker();
  best = 0;
  hold: number[] = [];
  warned: Record<string, number> = {};
  warns: Record<string, number> = {};
  saved = false;
  summary = '';

  constructor() {
    this.render();
  }

  render(): void {
    const el = ovEl();
    if (this.st === 'pick') {
      el.innerHTML = chrome('Antrenor cu camera', `<h1 class="pl-h">Antrenor cu camera</h1>
        <p class="pl-sub">Îți urmărește corpul și te corectează cu voce. Imaginea rămâne pe telefon și nu se salvează.</p>
        <div class="more" style="margin:8px 0 14px">${MODES.map((m) => `<button class="more-r" data-a="p:mode" data-k="${m.k}"><span class="more-t"><b>${esc(m.name)}</b><span>${esc(m.how)}</span></span></button>`).join('')}</div>
        <p class="small dim">Prima pornire descarcă modelul, circa 15 MB, apoi merge și fără internet. Lumina bună contează mult.</p>`);
    } else if (this.st === 'load') {
      el.innerHTML = chrome(this.mode.name, `<h1 class="pl-h">Pornesc camera</h1><p class="pl-sub">${esc(this.mode.how)}</p>`, { center: true });
    } else if (this.st === 'run') {
      const m = this.mode.k;
      const box = m === 'box';
      const meas = m === 'split' || m === 'fold';
      el.innerHTML = chrome(this.mode.name, `<div class="cam"><video id="cam-v" playsinline muted></video><canvas id="cam-c"></canvas>
          <div class="cam-n"><b id="cam-a">0</b><span>${box ? 'lovituri' : meas ? 'grade' : 'repetări'}</span></div>
          ${box ? '<div class="cam-g"><b id="cam-b">0%</b><span>gardă</span></div>' : ''}
          <div class="cam-m" id="cam-m" aria-live="polite">Intră în cadru</div></div>
        <p class="small dim" style="text-align:center"><span id="cam-t">0:00</span></p>
        <button class="btn" data-a="p:stop">Termină</button>`);
    } else {
      el.innerHTML = chrome(this.mode.name, `<h1 class="pl-h done-h">Gata.</h1><p class="lead">${esc(this.summary)}</p><button class="btn" data-a="p:close">Închide</button>`);
    }
  }

  async begin(): Promise<void> {
    this.st = 'load';
    this.render();
    try {
      const [stream, pose] = await Promise.all([
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false }),
        loadPose(),
      ]);
      if (ctx.player !== this) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      this.stream = stream;
      this.st = 'run';
      this.render();
      const v = document.getElementById('cam-v') as HTMLVideoElement;
      v.srcObject = stream;
      await v.play();
      this.t0 = performance.now();
      this.loop(pose, v);
    } catch (e) {
      this.stopCam();
      toast((e as Error).name === 'NotAllowedError' ? 'Ai nevoie de acces la cameră. Îl dai din setările browserului.' : 'Nu am putut porni camera sau modelul.');
      this.st = 'pick';
      this.render();
    }
  }

  loop(pose: Pose, v: HTMLVideoElement): void {
    const c = document.getElementById('cam-c') as HTMLCanvasElement;
    const g = c.getContext('2d') as CanvasRenderingContext2D;
    const frame = (): void => {
      this.raf = requestAnimationFrame(frame);
      if (v.readyState < 2 || v.currentTime === this.lastVideo) return;
      this.lastVideo = v.currentTime;
      const now = performance.now();
      const t = (now - this.t0) / 1000;
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      const lm = pose.detectForVideo(v, now).landmarks[0] as Pt[] | undefined;
      setText('cam-t', mmss(t));
      if (!lm) return this.msg('Nu te văd');
      g.strokeStyle = '#fff';
      g.lineWidth = 4;
      g.beginPath();
      for (const [a, b] of BONES) {
        g.moveTo(lm[a].x * c.width, lm[a].y * c.height);
        g.lineTo(lm[b].x * c.width, lm[b].y * c.height);
      }
      g.stroke();
      this.step(lm, t);
    };
    frame();
  }

  msg(s: string): void {
    setText('cam-m', s);
  }

  /** Spoken correction, at most once every 5 s per kind. */
  warn(k: string, text: string, t: number): void {
    if (t - (this.warned[k] ?? -9) < 5) return;
    this.warned[k] = t;
    this.warns[k] = (this.warns[k] ?? 0) + 1;
    this.msg(text);
    sfx.beep();
    buzz(120);
    say(text, 'ro');
  }

  step(lm: Pt[], t: number): void {
    const k = this.mode.k;
    if (k === 'box') {
      if (!seen(lm, [11, 12, 13, 14, 15, 16, 23, 24], 0.4)) return this.msg('Intră cu tot trunchiul în cadru');
      const ev = this.guard.feed(lm, t);
      if (ev.drop) this.warn('guard', 'Garda sus!', t);
      else if (ev.punch) this.msg('Bun');
      setText('cam-a', String(this.guard.punches));
      setText('cam-b', `${this.guard.guardPct}%`);
      return;
    }
    const s = nearSide(lm);
    if (k === 'split') {
      if (!seen(lm, [23, 24, 27, 28])) return this.msg('Trebuie să văd șoldurile și gleznele');
      return this.record(splitAngle(lm), true);
    }
    if (k === 'fold') {
      if (!seen(lm, [L.sh[s], L.hip[s], L.kn[s]])) return this.msg('Trebuie să văd umărul, șoldul și genunchiul');
      return this.record(foldAngle(lm, s), false);
    }
    const ids = k === 'squats' ? [L.hip[s], L.kn[s], L.an[s]] : [L.sh[s], L.el[s], L.wr[s]];
    if (!seen(lm, ids)) return this.msg('Nu văd bine articulațiile');
    const ev = this.reps.feed(angle(lm[ids[0]], lm[ids[1]], lm[ids[2]]), t);
    if (k === 'pushups' && seen(lm, [L.hip[s], L.an[s]]) && bodyLine(lm, s) < 150) this.warn('hips', 'Corpul drept', t);
    if (ev === 'shallow') this.warn('depth', k === 'pullups' ? 'Urcă mai sus' : 'Mai jos', t);
    if (ev === 'rep') {
      setText('cam-a', String(this.reps.reps));
      sfx.tick();
      this.msg('Bun');
      say(String(this.reps.reps), 'ro');
      if (this.reps.slowed) this.warn('slow', 'Viteza a scăzut', t);
    }
  }

  /** A pose must hold for 15 frames, so one glitched frame can't set the record. */
  record(a: number, high: boolean): void {
    this.hold.push(a);
    if (this.hold.length > 15) this.hold.shift();
    const v = high ? Math.min(...this.hold) : Math.max(...this.hold);
    if (this.hold.length === 15 && (!this.best || (high ? v > this.best : v < this.best))) this.best = Math.round(v);
    setText('cam-a', String(Math.round(a)));
    this.msg(this.best ? `Cel mai bun azi: ${this.best}°` : 'Ține poziția');
  }

  stopCam(): void {
    cancelAnimationFrame(this.raf);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }

  finish(): void {
    this.stopCam();
    const k = this.mode.k;
    const measure = k === 'split' || k === 'fold';
    const data: Record<string, unknown> = { mode: k, warns: this.warns };
    if (k === 'box') {
      const g = this.guard;
      const full = g.perMin.slice(0, -1); // the last minute is partial
      const low = full.length > 1 ? full.indexOf(Math.min(...full)) + 1 : 0;
      Object.assign(data, { punches: g.punches, guard: g.guardPct, perMin: g.perMin, drops: g.drops });
      this.summary = `${g.punches} lovituri, gardă sus ${g.guardPct}% din timp, ${g.drops} avertismente.${low ? ` Ritmul a fost cel mai slab în minutul ${low}.` : ''}`;
    } else if (measure) {
      const prev = ctx.S.log.filter((e) => e.kind === 'coach' && e.data.mode === k).map((e) => Number(e.data.angle));
      const rec = prev.length ? (k === 'split' ? Math.max(...prev) : Math.min(...prev)) : undefined;
      data.angle = this.best;
      this.summary = this.best ? `Azi ${this.best}°${rec !== undefined ? `, recordul de până acum ${rec}°` : ''}. Compară doar măsurători făcute din același unghi.` : 'Nu am prins o măsurătoare stabilă.';
    } else {
      const r = this.reps;
      Object.assign(data, { reps: r.reps, shallow: r.shallow });
      this.summary = `${r.reps} repetări complete${r.shallow ? `, ${r.shallow} incomplete` : ''}.${r.slowed ? ' Viteza a scăzut spre final.' : ''}`;
    }
    const got = k === 'box' ? this.guard.punches : measure ? this.best : this.reps.reps;
    if (got && !this.saved) {
      addEntry(makeEntry({ kind: 'coach', name: `Camera: ${this.mode.name}`, dur: (performance.now() - this.t0) / 1000, data }));
      save();
      this.saved = true;
    }
    this.st = 'done';
    this.render();
  }

  act(a: string, el: HTMLElement): void {
    if (a === 'p:mode') {
      unlock();
      this.mode = MODES.find((m) => m.k === el.dataset.k) ?? MODES[0];
      void this.begin();
    } else if (a === 'p:stop') this.finish();
  }

  destroy(): void {
    this.stopCam();
  }
}

export function openCoach(): void {
  mountPlayer(new CoachPlayer());
}
