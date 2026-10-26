// Key poses for the mobility illustrations (rendered by src/ui/figures.ts).
// p = pelvis [x, y] in a 100 × 84 box (floor at y 78); t = torso direction; tl = torso length (foreshortening);
// h = head direction; c = spine bend; a = arms [[upper, fore], [upper, fore]]; l = legs [[thigh, shin], [thigh, shin]].
// Angles: 0 = down, 90 = right, 180 = up, -90 = left. Arm/leg 0 is the near one.

export interface Pose {
  p: [number, number];
  t: number;
  tl?: number;
  h?: number;
  c?: number;
  a: [[number, number], [number, number]];
  l: [[number, number], [number, number]];
}

export interface Fig {
  k: Pose[];
  front?: boolean;
  floor?: boolean;
  wall?: number;
  bar?: number;
  stick?: boolean;
  slow?: boolean;
  alt?: string;
}

type A = [[number, number], [number, number]];
const both = (u: number, f: number): A => [[u, f], [u, f]];
const mirror = (u: number, f: number): A => [[u, f], [-u, -f]];

const STAND: Pose = { p: [50, 46], t: 180, a: both(0, 0), l: both(0, 0) };
const FRONT_STAND: Pose = { p: [50, 46], t: 180, a: mirror(8, 4), l: mirror(5, 4) };
// on all fours, facing left: hands under shoulders, knees under hips
const QUAD: Pose = { p: [62, 62], t: -107, h: -100, a: both(0, 0), l: both(0, 90) };
// plank on hands, facing left
const PLANK: Pose = { p: [52, 65], t: -114, h: -110, a: both(-3, -3), l: both(66, 66) };
const GUARD: A = [[25, 165], [40, 170]];

export const POSES: Record<string, Fig> = {
  'Jumping Jacks': {
    front: true,
    k: [
      { ...FRONT_STAND },
      { p: [50, 43], t: 180, a: mirror(150, 165), l: mirror(18, 18) },
    ],
  },
  'Arm Circles': {
    front: true,
    k: [
      { ...FRONT_STAND, a: mirror(60, 70) },
      { ...FRONT_STAND, a: mirror(95, 100) },
      { ...FRONT_STAND, a: mirror(130, 125) },
    ],
  },
  'Shoulder Rolls': {
    k: [
      { ...STAND, a: both(4, 0) },
      { ...STAND, p: [50, 45], a: both(-10, -6) },
    ],
  },
  'Shoulder Dislocates': {
    stick: true,
    slow: true,
    k: [
      { ...STAND, a: [[55, 55], [62, 62]] },
      { ...STAND, a: [[178, 178], [182, 182]] },
      { ...STAND, a: [[-125, -125], [-118, -118]] },
    ],
  },
  'Scapular Push-ups': {
    k: [{ ...PLANK }, { ...PLANK, p: [52, 66.5], t: -112, c: 2 }],
  },
  'Scapular Pulls': {
    front: true,
    floor: false,
    bar: 3,
    k: [
      { p: [50, 50], t: 180, a: mirror(176, 180), l: mirror(3, 0) },
      { p: [50, 48], t: 180, a: mirror(170, 178), l: mirror(3, 0) },
    ],
  },
  'Cross-body Shoulder Stretch': {
    front: true,
    k: [
      { ...FRONT_STAND, a: [[-75, -88], [-20, -120]] },
      { ...FRONT_STAND, a: [[-82, -92], [-25, -128]] },
    ],
  },
  'Doorway Chest Stretch': {
    wall: 37,
    k: [
      { p: [50, 46], t: 180, a: [[-90, 180], [-60, 10]], l: [[12, -4], [-12, -6]] },
      { p: [54, 47], t: 172, a: [[-100, 180], [-60, 10]], l: [[16, -2], [-8, -10]] },
    ],
  },
  'Lat Stretch': {
    wall: 15,
    k: [
      { p: [60, 46], t: -115, h: -105, a: both(-95, -92), l: both(-8, -4) },
      { p: [64, 47], t: -102, h: -95, a: both(-92, -90), l: both(-14, -8) },
    ],
  },
  'Overhead Triceps Stretch': {
    front: true,
    k: [
      { ...FRONT_STAND, a: [[160, -40], [-150, 120]] },
      { ...FRONT_STAND, a: [[165, -30], [-155, 115]] },
    ],
  },
  'Wrist Circles': {
    front: true,
    k: [
      { ...FRONT_STAND, a: mirror(25, 150) },
      { ...FRONT_STAND, a: mirror(30, 120) },
      { ...FRONT_STAND, a: mirror(20, 175) },
    ],
  },
  'Neck Mobility': {
    front: true,
    k: [
      { ...FRONT_STAND, h: 145 },
      { ...FRONT_STAND, h: 180 },
      { ...FRONT_STAND, h: 215 },
    ],
  },
  'Neck Stretch': {
    front: true,
    slow: true,
    k: [
      { ...FRONT_STAND, h: 180, a: [[165, -140], [-8, -4]] },
      { ...FRONT_STAND, h: 150, a: [[160, -120], [-8, -4]] },
    ],
  },
  'Cat-Cow': {
    slow: true,
    k: [
      { ...QUAD, c: -6, h: -45 },
      { ...QUAD, c: 5, h: -145 },
    ],
  },
  'Thoracic Rotations': {
    k: [
      { ...QUAD, a: [[-30, 160], [0, 0]], h: -60 },
      { ...QUAD, a: [[-170, 30], [0, 0]], h: -150 },
    ],
  },
  "World's Greatest Stretch": {
    slow: true,
    k: [
      { p: [45, 57], t: 100, h: 95, a: both(4, 0), l: [[70, 0], [-50, -50]] },
      { p: [45, 57], t: 108, h: 160, a: [[178, 178], [4, 0]], l: [[70, 0], [-50, -50]] },
    ],
  },
  'Hip Flexor Stretch': {
    k: [
      { p: [48, 62], t: 180, a: [[35, -60], [35, -60]], l: [[90, 0], [-20, -90]] },
      { p: [52, 63], t: 176, a: [[35, -60], [35, -60]], l: [[96, -4], [-34, -90]] },
    ],
  },
  'Hamstring Stretch': {
    slow: true,
    k: [
      { ...STAND, t: 150, a: both(10, 5) },
      { ...STAND, t: 40, h: 30, a: both(-8, -8) },
    ],
  },
  'Deep Squat Hold': {
    k: [
      { p: [46.5, 66.5], t: 162, a: [[55, 140], [55, 140]], l: both(101, -8) },
      { p: [46.5, 67.5], t: 158, a: [[60, 135], [60, 135]], l: both(103, -8) },
    ],
  },
  'Leg Swings (front-back)': {
    wall: 26,
    k: [
      { ...STAND, a: [[-90, -90], [0, 0]], l: [[55, 55], [0, 0]] },
      { ...STAND, a: [[-90, -90], [0, 0]], l: [[-35, -35], [0, 0]] },
    ],
  },
  'Leg Swings': {
    wall: 26,
    k: [
      { ...STAND, a: [[-90, -90], [0, 0]], l: [[55, 55], [0, 0]] },
      { ...STAND, a: [[-90, -90], [0, 0]], l: [[-35, -35], [0, 0]] },
    ],
  },
  'Leg Swings (side)': {
    front: true,
    k: [
      { ...FRONT_STAND, a: mirror(35, 30), l: [[38, 38], [-3, -3]] },
      { ...FRONT_STAND, a: mirror(35, 30), l: [[-22, -22], [-3, -3]] },
    ],
  },
  'Hip Circles': {
    front: true,
    k: [
      { p: [46, 46], t: 186, a: [[40, -70], [-40, 70]], l: [[8, 6], [-2, -4]] },
      { p: [50, 47], t: 180, a: [[40, -70], [-40, 70]], l: mirror(5, 4) },
      { p: [54, 46], t: 174, a: [[40, -70], [-40, 70]], l: [[2, 4], [-8, -6]] },
    ],
  },
  '90/90 Hip Switches': {
    front: true,
    k: [
      { p: [50, 74], t: 180, a: mirror(28, 18), l: [[70, -30], [45, -60]] },
      { p: [50, 74], t: 180, a: mirror(28, 18), l: [[-45, 60], [-70, 30]] },
    ],
  },
  'Pigeon Stretch': {
    slow: true,
    k: [
      { p: [52, 74], t: 175, a: both(12, 0), l: [[95, -90], [-85, -90]] },
      { p: [52, 75], t: 102, h: 95, a: both(95, 92), l: [[95, -90], [-85, -90]] },
    ],
  },
  'Couch Stretch': {
    wall: 31,
    slow: true,
    k: [
      { p: [40, 62], t: 158, a: [[60, 30], [60, 30]], l: [[90, 0], [-30, 180]] },
      { p: [40, 62], t: 180, a: [[45, 10], [45, 10]], l: [[90, 0], [-30, 180]] },
    ],
  },
  'Lizard Stretch': {
    slow: true,
    k: [
      { p: [46, 62], t: 105, h: 100, a: both(10, 2), l: [[95, -5], [-35, -90]] },
      { p: [47, 64], t: 96, h: 92, a: both(25, -20), l: [[100, -5], [-40, -90]] },
    ],
  },
  'Frog Stretch': {
    slow: true,
    k: [
      { p: [60, 62], t: -102, h: -95, a: both(5, -90), l: both(0, 90) },
      { p: [66, 64], t: -98, h: -92, a: both(-15, -90), l: both(-8, 90) },
    ],
  },
  'Cossack Squats': {
    front: true,
    slow: true,
    k: [
      { p: [55, 66], t: 175, a: mirror(25, 150), l: [[105, 7], [-67, -67]] },
      { p: [50, 58], t: 180, a: mirror(25, 150), l: [[48, 48], [-48, -48]] },
      { p: [45, 66], t: 185, a: mirror(25, 150), l: [[67, 67], [-105, -7]] },
    ],
  },
  'Side-to-Side Shifts': {
    front: true,
    k: [
      { p: [55, 62], t: 178, a: mirror(25, 150), l: [[95, 10], [-62, -62]] },
      { p: [50, 58], t: 180, a: mirror(25, 150), l: [[48, 48], [-48, -48]] },
      { p: [45, 62], t: 182, a: mirror(25, 150), l: [[62, 62], [-95, -10]] },
    ],
  },
  'Dagestan Hip Shifts': {
    front: true,
    slow: true,
    k: [
      { p: [56, 60], t: 180, tl: 0.55, a: mirror(6, 0), l: [[100, 8], [-62, -62]] },
      { p: [50, 56], t: 180, tl: 0.55, a: mirror(6, 0), l: [[52, 52], [-52, -52]] },
      { p: [44, 60], t: 180, tl: 0.55, a: mirror(6, 0), l: [[62, 62], [-100, -8]] },
    ],
  },
  'Straddle Sink': {
    front: true,
    slow: true,
    k: [
      { p: [50, 66], t: 180, tl: 0.6, a: mirror(8, 0), l: mirror(68, 68) },
      { p: [50, 70], t: 180, tl: 0.6, a: mirror(14, 6), l: mirror(76, 76) },
    ],
  },
  'Seated Hamstring Stretch': {
    slow: true,
    k: [
      { p: [38, 76], t: 168, a: both(55, 45), l: both(90, 90) },
      { p: [38, 76], t: 108, h: 100, a: both(100, 95), l: both(90, 90) },
    ],
  },
  'Butterfly Stretch': {
    front: true,
    slow: true,
    k: [
      { p: [50, 71], t: 180, a: mirror(14, -8), l: [[65, -100], [-65, 100]] },
      { p: [50, 71], t: 180, a: mirror(14, -8), l: [[76, -98], [-76, 98]] },
    ],
  },
  'Calf Stretch': {
    wall: 87,
    k: [
      { p: [52, 47], t: 150, a: both(100, 100), l: [[15, -10], [-25, -25]] },
      { p: [54, 48], t: 140, a: both(105, 105), l: [[20, -10], [-27, -27]] },
    ],
  },
  'Thread the Needle': {
    slow: true,
    k: [
      { ...QUAD, a: [[-170, -170], [0, 0]], h: -150 },
      { ...QUAD, p: [62, 63], t: -100, a: [[60, 80], [5, 0]], h: -60 },
    ],
  },
  'Open Book Stretch': {
    slow: true,
    k: [
      { p: [64, 74], t: -90, h: -90, a: [[180, 180], [180, 180]], l: both(150, 90) },
      { p: [64, 74], t: -90, h: -60, a: [[180, 180], [-120, -100]], l: both(150, 90) },
    ],
  },
  "Child's Pose": {
    slow: true,
    k: [
      { p: [40, 70], t: 82, h: 85, a: both(95, 90), l: both(65, -90) },
      { p: [40, 69], t: 78, h: 82, a: both(98, 92), l: both(65, -90) },
    ],
  },
  'Cobra Stretch': {
    slow: true,
    k: [
      { p: [55, 75], t: -100, h: -95, a: both(20, -60), l: both(88, 90) },
      { p: [55, 75], t: -130, h: -150, a: both(5, 0), l: both(88, 90) },
    ],
  },
  'Sleeper Stretch': {
    slow: true,
    k: [
      { p: [62, 74], t: -90, h: -90, a: [[180, 180], [90, 90]], l: both(70, 0) },
      { p: [62, 74], t: -90, h: -90, a: [[180, 110], [90, 90]], l: both(70, 0) },
    ],
  },
  'Torso Twists': {
    front: true,
    k: [
      { ...FRONT_STAND, a: [[95, 95], [-30, -120]] },
      { ...FRONT_STAND, a: [[30, 120], [-95, -95]] },
    ],
  },
  'Wrist & Ankle Circles': {
    front: true,
    k: [
      { ...FRONT_STAND, a: mirror(25, 150), l: [[5, 4], [-25, 30]] },
      { ...FRONT_STAND, a: mirror(30, 120), l: [[5, 4], [-30, 60]] },
    ],
  },
  'Loose Shadow Boxing': {
    k: [
      { p: [48, 47], t: 175, a: GUARD, l: [[18, 6], [-18, -14]] },
      { p: [50, 47], t: 168, a: [[93, 92], [40, 170]], l: [[20, 6], [-16, -14]] },
    ],
  },
  'Straddle Dive': {
    slow: true,
    k: [
      { p: [56, 50], t: -68, h: -30, a: both(-12, -5), l: both(30, 30) },
      { p: [50, 66], t: -88, h: -85, a: both(15, -15), l: both(76, 76) },
      { p: [52, 71], t: -120, h: -140, a: both(0, 0), l: both(80, 80) },
    ],
  },
  'Middle Split Reach': {
    front: true,
    slow: true,
    k: [
      { p: [50, 75], t: 180, a: mirror(28, 12), l: mirror(90, 90) },
      { p: [50, 75], t: 180, tl: 0.55, a: [[160, 175], [-10, 0]], l: mirror(90, 90) },
      { p: [50, 75], t: 180, tl: 0.55, a: [[10, 0], [-160, -175]], l: mirror(90, 90) },
    ],
  },
  'Straddle Side Bend': {
    front: true,
    slow: true,
    k: [
      { p: [50, 73], t: 180, a: mirror(30, 15), l: mirror(80, 80) },
      { p: [50, 73], t: 125, h: 115, a: [[95, 95], [110, 100]], l: mirror(80, 80) },
      { p: [50, 73], t: 180, a: mirror(30, 15), l: mirror(80, 80) },
      { p: [50, 73], t: -125, h: -115, a: [[-110, -100], [-95, -95]], l: mirror(80, 80) },
    ],
  },
  'Wide Stance Hold': {
    front: true,
    k: [
      { p: [50, 53], t: 180, a: mirror(30, 150), l: mirror(55, -10) },
      { p: [50, 55], t: 180, a: mirror(30, 150), l: mirror(60, -12) },
    ],
  },
  'Middle Split Lean': {
    front: true,
    slow: true,
    k: [
      { p: [50, 77], t: 180, a: mirror(30, 15), l: mirror(88, 88) },
      { p: [50, 77], t: 180, tl: 0.55, a: mirror(12, 0), l: mirror(88, 88) },
    ],
  },
  'Split Push-up Hold': {
    front: true,
    k: [
      { p: [50, 76], t: 180, tl: 0.7, a: mirror(18, 0), l: mirror(86, 86) },
      { p: [50, 70], t: 180, tl: 0.7, a: mirror(4, 0), l: mirror(78, 78) },
    ],
  },
};
