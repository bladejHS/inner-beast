// Key poses for the 3D athlete, for every exercise that has no mobility figure in poses.ts.
// Same angle system as poses.ts; box = [centre x, half width, top y].

import { POSES, type Fig, type Pose } from './poses.ts';
import { exerciseById } from './workouts.ts';

export interface Fig3 extends Fig {
  box?: [number, number, number];
}

type A = Pose['a'];
type L = Pose['l'];
const both = (u: number, f: number): A => [[u, f], [u, f]];
const mirror = (u: number, f: number): A => [[u, f], [-u, -f]];
const GUARD: A = [[25, 165], [40, 170]];
const STANCE: L = [[12, -4], [-14, -8]];
const STAND: Pose = { p: [50, 46], t: 180, a: both(2, 2), l: both(0, 0) };
const BOX: Pose = { p: [50, 47], t: 172, h: 178, a: GUARD, l: STANCE };

const PLANK: Pose = { p: [52, 65], t: -114, h: -110, a: both(-3, -3), l: both(66, 66) };
const PUSH_DOWN: Pose = { p: [50, 72], t: -100, h: -96, a: both(50, -75), l: both(80, 80) };
const pushup: Fig3 = { k: [PLANK, PUSH_DOWN] };
const clap: Fig3 = { k: [PUSH_DOWN, { ...PLANK, p: [52, 58], t: -118, a: both(-20, -70) }, { ...PLANK, p: [52, 58], t: -118, a: both(-5, -5), l: both(58, 58) }] };
const incline: Fig3 = {
  box: [28, 11, 60],
  k: [
    { p: [58, 56], t: -125, h: -115, a: both(-20, -20), l: both(48, 48) },
    { p: [55, 60], t: -112, h: -105, a: both(45, -80), l: both(55, 55) },
  ],
};
const decline: Fig3 = {
  box: [84, 12, 60],
  k: [
    { p: [50, 58], t: -106, h: -100, a: both(-15, -15), l: both(88, 88) },
    { p: [48, 63], t: -92, h: -88, a: both(45, -55), l: both(95, 95) },
  ],
};
const archer: Fig3 = { k: [PLANK, { ...PUSH_DOWN, p: [50, 70], a: [[50, -75], [-40, -60]] }] };
const planche: Fig3 = { k: [{ ...PLANK, t: -104, p: [44, 65], a: both(14, 14) }, { ...PUSH_DOWN, p: [44, 72], a: both(62, -60) }] };
const pike: Fig3 = {
  k: [
    { p: [50, 40], t: -28, h: -10, a: both(-30, -30), l: both(32, 32) },
    { p: [50, 45], t: -48, h: -30, a: both(38, -38), l: both(30, 30) },
  ],
};
const handstand: Fig3 = {
  wall: 72,
  k: [
    { p: [62, 30], t: 0, h: 0, a: both(0, 0), l: both(172, 172) },
    { p: [62, 40], t: 8, h: 8, a: both(46, -20), l: both(168, 168) },
  ],
};
const dipBars: Fig3 = {
  box: [50, 7, 50],
  k: [
    { p: [50, 49], t: 178, a: both(0, 0), l: both(10, -60) },
    { p: [51, 60], t: 165, h: 175, a: both(-55, 25), l: both(15, -55) },
  ],
};
const benchDip: Fig3 = {
  box: [32, 10, 56],
  k: [
    { p: [41, 54], t: 176, a: both(-8, -8), l: both(88, 0) },
    { p: [41, 66], t: 170, a: both(-60, 16), l: both(80, 8) },
  ],
};
const hollow: Fig3 = {
  k: [
    { p: [50, 74], t: -74, h: -82, a: both(-82, -82), l: both(76, 76) },
    { p: [50, 73], t: -68, h: -78, a: both(-96, -96), l: both(70, 70) },
  ],
};
const tuck: Fig3 = { k: [{ p: [50, 74], t: -70, h: -80, a: both(30, 40), l: both(150, 20) }, { p: [50, 74], t: -66, h: -76, a: both(35, 45), l: both(158, 15) }] };
const HANG: Pose = { p: [50, 50], t: 180, a: mirror(176, 180), l: mirror(3, 0) };
const pullup: Fig3 = { front: true, floor: false, bar: 3, k: [HANG, { ...HANG, p: [50, 42], a: mirror(115, 170) }] };
const negative: Fig3 = { ...pullup, slow: true, k: [pullup.k[1], HANG] };
const hang: Fig3 = { ...pullup, slow: true, k: [HANG, { ...HANG, p: [50, 49] }] };
const SIDE_HANG: Pose = { p: [50, 50], t: 180, a: both(180, 180), l: both(0, 0) };
const kneeRaise: Fig3 = { floor: false, bar: 3, k: [SIDE_HANG, { ...SIDE_HANG, t: 176, l: both(100, 8) }] };
const legRaise: Fig3 = { ...kneeRaise, k: [SIDE_HANG, { ...SIDE_HANG, t: 170, l: both(88, 88) }] };
const toesBar: Fig3 = { ...kneeRaise, k: [SIDE_HANG, { ...SIDE_HANG, p: [46, 38], t: 150, l: both(150, 165) }] };
const lyingRaise: Fig3 = { k: [{ p: [50, 74], t: -90, h: -90, a: both(-3, 88), l: both(86, 86) }, { p: [50, 74], t: -90, h: -90, a: both(-3, 88), l: both(170, 172) }] };
const invRow: Fig3 = {
  bar: 44,
  k: [
    { p: [52, 66], t: -112, h: -105, a: both(170, 175), l: both(62, 62) },
    { p: [50, 58], t: -100, h: -95, a: both(68, 200), l: both(68, 68) },
  ],
};
const trxRow: Fig3 = {
  k: [
    { p: [58, 56], t: -152, h: -140, a: both(-110, -110), l: both(30, 30) },
    { p: [50, 50], t: -170, h: -160, a: both(40, -125), l: both(14, 14) },
  ],
};
const WIDE = mirror(5, 4) as L;
const ytw: Fig3 = {
  front: true,
  k: [
    { ...STAND, l: WIDE, a: mirror(150, 150) },
    { ...STAND, l: WIDE, a: mirror(90, 90) },
    { ...STAND, l: WIDE, a: mirror(60, 130) },
  ],
};
const curl: Fig3 = { k: [{ ...STAND, a: both(4, 4) }, { ...STAND, a: both(4, 150) }] };
const facePull: Fig3 = { front: true, k: [{ ...STAND, l: WIDE, a: mirror(60, 60) }, { ...STAND, l: WIDE, a: mirror(95, 165) }] };
const apart: Fig3 = { front: true, k: [{ ...STAND, l: WIDE, a: mirror(100, 170) }, { ...STAND, l: WIDE, a: mirror(90, 90) }] };
const lunge: Fig3 = {
  k: [
    { ...STAND, a: both(0, 90) },
    { p: [50, 58], t: 178, a: both(0, 90), l: [[70, 0], [-30, -92]] },
  ],
};
const calf: Fig3 = { k: [STAND, { ...STAND, p: [50, 41] }] };
const squat: Fig3 = {
  k: [
    { ...STAND, a: both(90, 90) },
    { p: [44, 62], t: 150, h: 170, a: both(90, 90), l: both(82, -22) },
  ],
};
const jumpSquat: Fig3 = { k: [squat.k[1], { ...STAND, p: [50, 36], a: both(-30, -20), l: both(-3, -6) }] };
const wallSit: Fig3 = { wall: 28, slow: true, k: [{ p: [36, 62], t: 180, a: both(3, 90), l: both(90, 0) }, { p: [36, 62.4], t: 180, a: both(3, 86), l: both(90, 0) }] };
const rope: Fig3 = { front: true, k: [{ ...STAND, l: mirror(4, 3), a: mirror(28, 95) }, { ...STAND, p: [50, 41], l: mirror(3, 2), a: mirror(36, 100) }] };
const ladder: Fig3 = {
  k: [
    { p: [50, 48], t: 170, a: GUARD, l: [[28, -8], [-18, -40]] },
    { p: [50, 48], t: 170, a: [GUARD[1], GUARD[0]], l: [[-18, -40], [28, -8]] },
  ],
};
const rowMachine: Fig3 = {
  box: [50, 24, 72],
  k: [
    { p: [46, 67], t: 165, h: 175, a: both(82, 90), l: both(125, 20) },
    { p: [32, 67], t: 200, h: 188, a: both(42, 140), l: both(90, 80) },
  ],
};
const jog: Fig3 = {
  k: [
    { p: [50, 47], t: 172, h: 176, a: [[-35, 50], [35, 110]], l: [[35, -18], [-22, -70]] },
    { p: [50, 45], t: 172, h: 176, a: [[35, 110], [-35, 50]], l: [[-22, -70], [35, -18]] },
  ],
};
const walk: Fig3 = {
  k: [
    { ...STAND, a: [[-20, -5], [20, 30]], l: [[22, 8], [-20, -30]] },
    { ...STAND, a: [[20, 30], [-20, -5]], l: [[-20, -30], [22, 8]] },
  ],
};
const seated = (a: A, l: L, t = -160): Pose => ({ p: [50, 72], t, a, l });
const seatedRaise: Fig3 = { k: [seated(both(-30, -30), both(84, 84)), seated(both(-30, -30), both(120, 120))] };
const vTouch: Fig3 = { k: [seated(both(80, 85), both(120, 120), -150), seated(both(95, 110), [[140, 140], [105, 105]], -140)] };
const twists: Fig3 = { front: true, k: [{ p: [50, 70], t: 165, a: [[50, 130], [10, 90]], l: mirror(60, 80) }, { p: [50, 70], t: 195, a: [[-10, -90], [-50, -130]], l: mirror(60, 80) }] };
const situp: Fig3 = { k: [{ p: [50, 74], t: -90, h: -90, a: both(-90, -90), l: both(130, 30) }, seated(both(175, 178), both(130, 30), 178)] };
const overBall: Fig3 = { front: true, k: [{ p: [50, 72], t: 180, a: mirror(30, 30), l: [[50, 60], [40, 50]] }, { p: [50, 72], t: 180, a: mirror(30, 30), l: [[-40, -50], [-50, -60]] }] };
const plank: Fig3 = { slow: true, k: [{ p: [52, 70], t: -102, h: -98, a: both(0, -90), l: both(79, 79) }, { p: [52, 69.5], t: -102, h: -98, a: both(0, -90), l: both(79, 79) }] };
const highPlank: Fig3 = { slow: true, k: [PLANK, { ...PLANK, p: [52, 64.5] }] };
const weightHold: Fig3 = { k: [seated(both(60, 150), both(120, 110)), seated(both(170, 178), both(120, 110))] };

const shadow = (...k: Pose[]): Fig3 => ({ k: [BOX, ...k] });
const JAB: A = [[88, 90], GUARD[1]];
const CROSS: A = [GUARD[0], [88, 90]];
const jab = shadow({ ...BOX, a: JAB });
const cross = shadow({ ...BOX, p: [52, 47], t: 160, a: CROSS, l: [[18, -2], [-18, -12]] });
const hook = shadow({ ...BOX, t: 165, a: [[80, 150], GUARD[1]] });
const uppercut = shadow({ ...BOX, p: [50, 50], t: 175, a: [[35, 175], GUARD[1]], l: [[20, -14], [-20, -14]] }, { ...BOX, p: [50, 46], a: [[60, 170], GUARD[1]] });
const overhand = shadow({ ...BOX, t: 156, a: [GUARD[0], [150, 70]] });
const SLIP: Pose = { ...BOX, p: [47, 49], t: 160, h: 165, l: [[10, -14], [-16, -20]] };
const WEAVE: Pose = { ...BOX, p: [50, 55], t: 140, h: 160, l: [[34, -24], [-30, -14]] };
const slip = shadow(SLIP);
const weave = shadow(WEAVE, { ...BOX, p: [50, 47], t: 180 });
const steps: Fig3 = { k: [BOX, { ...BOX, p: [54, 46], l: [[20, -2], [-8, -6]] }, BOX, { ...BOX, p: [46, 46], l: [[6, -2], [-22, -10]] }] };
const legSwitch: Fig3 = { k: [BOX, { ...BOX, p: [50, 42], l: both(2, 0) }, { ...BOX, a: [GUARD[1], GUARD[0]], l: [STANCE[1], STANCE[0]] }] };
const combo = shadow({ ...BOX, a: JAB }, BOX, { ...BOX, t: 160, a: CROSS });

const BASE: Record<string, Fig3> = {
  'Explosive Push-ups': clap, 'Incline Explosive Push-ups': { ...incline, k: [incline.k[1], { ...incline.k[0], p: [62, 50] }] },
  'Clap Push-ups': clap, 'Superman Push-ups': { k: [PUSH_DOWN, { ...PLANK, p: [50, 54], t: -95, a: both(-92, -92), l: both(84, 84) }] },
  'Push-ups': pushup, 'Push-up Burnout': pushup, 'Max Push-ups': pushup, 'Incline Push-ups': incline, 'Decline Push-ups': decline, 'Archer Push-ups': archer, 'Pseudo Planche Push-ups': planche,
  Dips: dipBars, 'Parallel Bar Dips': dipBars, 'Weighted Dips': dipBars, 'Negative Dips': { ...dipBars, slow: true }, 'Bench Dips': benchDip,
  'Pike Push-ups': pike, 'Elevated Pike Push-ups': pike, 'Wall Handstand Push-up Negatives': { ...handstand, slow: true }, 'Wall Handstand Push-ups': handstand,
  'Diamond Push-ups': pushup, 'Incline Diamond Push-ups': incline, 'Decline Diamond Push-ups': decline,
  'Hollow Body Hold': hollow, 'Tuck Hollow Hold': tuck, 'Hollow Body Rocks': { k: [{ ...hollow.k[0], t: -60, l: both(82, 82) }, { ...hollow.k[0], t: -84, l: both(62, 62) }] },
  'Pull-up EMOM': pullup, 'Pull-ups': pullup, 'Chin-ups': pullup, 'Weighted Pull-ups': pullup, 'Weighted Chin-ups': pullup, 'Band-assisted Pull-ups': pullup, 'Band-assisted Chin-ups': pullup,
  'Negative Pull-ups': negative, 'Negative Chin-ups': negative,
  'Inverted Rows': invRow, 'Inverted Rows (high bar)': invRow, 'Feet-elevated Inverted Rows': invRow, 'Archer Rows': invRow,
  'Y-T-W Raises': ytw, 'Band Y-T-W Raises': ytw, 'TRX Y-T-W Raises': ytw, 'TRX Rows': trxRow, 'TRX Rows (upright)': trxRow, 'TRX Rows (feet elevated)': trxRow, 'TRX Single-arm Rows': trxRow,
  'Hammer Curls': curl, 'Bodyweight Biceps Curls': trxRow, 'Band Hammer Curls': curl, 'Dumbbell Hammer Curls': curl,
  'Face Pulls': facePull, 'Band Face Pulls': facePull, 'TRX Face Pulls': facePull, 'TRX Rear Delt Flys': apart, 'Band Pull-Aparts': apart,
  'Hanging Knee Raises': kneeRaise, 'Lying Leg Raises': lyingRaise, 'Hanging Leg Raises': legRaise, 'Toes-to-Bar': toesBar,
  'Dead Hang': hang, 'Active Hang': hang, 'One-arm Assisted Hang': hang,
  Lunges: lunge, 'Reverse Lunges': lunge, 'Forward Lunges': lunge, 'Walking Lunges': lunge, 'Weighted Walking Lunges': lunge,
  'Calf Raises': calf, 'Single-leg Calf Raises': calf,
  Squats: squat, 'Jumping Squats': jumpSquat, 'Wall Sit': wallSit,
  Jogging: jog, 'Walk (10K Steps)': walk, 'Jumping Rope': rope, 'Agility Ladder': ladder, 'Machine Row': rowMachine,
  'Shadow Boxing': combo, 'Easy Shadow Boxing': combo, 'Heavy Bag Training': combo, 'Jabs with Slips & Pulls': shadow({ ...BOX, a: JAB }, SLIP),
  'Two Steps Forward, Two Back': steps, Footwork: steps, 'Four Straight Punches': combo,
  Jab: jab, Cross: cross, Hook: hook, Uppercut: uppercut, Overhand: overhand,
  'Gazelle Punch': { k: [{ ...BOX, p: [50, 56], t: 150, l: [[35, -24], [-30, -14]] }, { ...BOX, p: [54, 40], t: 170, a: [[100, 110], GUARD[1]], l: [[6, 2], [-18, -24]] }] },
  'Check Hook': shadow({ ...BOX, p: [46, 47], a: [[80, 150], GUARD[1]], l: [[-4, -6], [-24, -10]] }),
  'Slip & Roll': weave, 'Zig-Zag Slips': { k: [SLIP, { ...SLIP, p: [53, 49], t: 190, h: 185 }] }, Weaves: weave, Slip: slip,
  'Slip-Roll Uppercut': shadow(SLIP, WEAVE, { ...BOX, a: [[35, 175], GUARD[1]] }), 'Weave + Hook': shadow(WEAVE, { ...BOX, a: [[80, 150], GUARD[1]] }),
  'Slip In Slip Out': { k: [BOX, { ...SLIP, p: [54, 49] }, { ...SLIP, p: [46, 49], t: 190 }] }, 'Leg Switch': legSwitch, 'Twist 180 + Punching': shadow({ ...BOX, t: 165, l: both(4, 0) }, { ...BOX, a: CROSS }),
  'Seated Leg Raises': seatedRaise, 'Touch Your Foot': vTouch, 'Ball Twists': twists, 'Ball Sit-up Press': situp, 'Leg Raises with Ball': lyingRaise, 'Legs Over Ball': overBall,
  Plank: plank, 'High Plank': highPlank, 'Seated Weight Hold': weightHold,
  'Cross-body Shoulder Stretch': { slow: true, k: [{ ...STAND, a: [[80, 80], [2, 150]] }, { ...STAND, a: [[92, 92], [8, 140]] }] },
};

/** The figure for a workout id, a display name or a variation; a known variation wins over the base exercise. */
export function fig3d(name: string, variation?: string): Fig3 | undefined {
  const of = (k: string): Fig3 | undefined => BASE[k] ?? POSES[k];
  return (variation ? of(variation) : undefined) ?? of(name) ?? of(exerciseById(name)?.name ?? '');
}
