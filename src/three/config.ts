import * as THREE from 'three';

export interface ScenePlateAnchor {
  id: string;
  number: string;
  name: string;
  japanese: string;
  subtitle: string;
  texturePath: string;
  // 3D placement
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  // Timeline window (0.0 to 1.0)
  scrollStart: number;
  scrollPeak: number;
  scrollEnd: number;
}

// 6 Authoritative Infinity Castle Scene Plates in 3D Space
// Positioned with overlapping spatial proximity so the camera travels continuously
export const SCENE_PLATES_DATA: ScenePlateAnchor[] = [
  {
    id: 'entrance',
    number: '01',
    name: 'ENTRANCE',
    japanese: '無限城 // 門',
    subtitle: 'THE GATES OF ETERNAL NIGHT',
    texturePath: '/assets/castle/01-entrance.png',
    position: [0, 0, -20],
    rotation: [0, 0, 0],
    scale: [36, 20.25, 1],
    scrollStart: 0.00,
    scrollPeak: 0.06,
    scrollEnd: 0.22,
  },
  {
    id: 'main-hall',
    number: '02',
    name: 'MAIN CASTLE HALL',
    japanese: '本殿 // 階層',
    subtitle: 'DIMENSIONAL FOLD',
    texturePath: '/assets/castle/02-main-hall.png',
    position: [2, -3, -50],
    rotation: [0.02, -0.05, 0.01],
    scale: [40, 22.5, 1],
    scrollStart: 0.15,
    scrollPeak: 0.26,
    scrollEnd: 0.42,
  },
  {
    id: 'infinite-corridor',
    number: '03',
    name: 'INFINITE CORRIDOR',
    japanese: '無限廊下 // 刻',
    subtitle: 'THE ENDLESS PERSPECTIVE',
    texturePath: '/assets/castle/03-infinite-corridor.png',
    position: [-4, 2, -80],
    rotation: [-0.01, 0.06, -0.01],
    scale: [42, 23.6, 1],
    scrollStart: 0.35,
    scrollPeak: 0.46,
    scrollEnd: 0.62,
  },
  {
    id: 'floating-staircase',
    number: '04',
    name: 'FLOATING STAIRCASE',
    japanese: '浮遊階段 // 雫',
    subtitle: 'ZERO-GRAVITY ASCENSION',
    texturePath: '/assets/castle/04-floating-staircase.png',
    position: [4, 10, -112],
    rotation: [0.06, -0.04, 0.02],
    scale: [44, 24.75, 1],
    scrollStart: 0.55,
    scrollPeak: 0.66,
    scrollEnd: 0.80,
  },
  {
    id: 'vertical-void',
    number: '05',
    name: 'VERTICAL VOID',
    japanese: '虚空 // 階梯',
    subtitle: 'THE ABYSSAL SHAFT',
    texturePath: '/assets/castle/05-vertical-void.png',
    position: [-2, -10, -145],
    rotation: [-0.10, 0.02, -0.01],
    scale: [48, 27, 1],
    scrollStart: 0.73,
    scrollPeak: 0.83,
    scrollEnd: 0.94,
  },
  {
    id: 'demon-chamber',
    number: '06',
    name: 'ENDLESS DEMON CHAMBER',
    japanese: '終焉 // 玉座',
    subtitle: 'THE INNER SANCTUM',
    texturePath: '/assets/castle/06-demon-chamber.png',
    position: [0, 0, -178],
    rotation: [0, 0, 0],
    scale: [50, 28.1, 1],
    scrollStart: 0.87,
    scrollPeak: 0.96,
    scrollEnd: 1.00,
  },
];

// Continuous 3D Camera Waypoints matching the plates
export const CAMERA_PATH = [
  // 0.00: Gazing at Entrance
  { pos: new THREE.Vector3(0, 0, 0), look: new THREE.Vector3(0, 0, -20) },
  // 0.10: Approaching Entrance Gate
  { pos: new THREE.Vector3(0, 0, -12), look: new THREE.Vector3(0, 0, -28) },
  // 0.20: Passing through gate, Main Hall looms
  { pos: new THREE.Vector3(1, -1.5, -28), look: new THREE.Vector3(2, -3, -50) },
  // 0.30: Moving through Main Hall
  { pos: new THREE.Vector3(2, -3, -40), look: new THREE.Vector3(2, -3, -56) },
  // 0.40: Turning into Infinite Corridor
  { pos: new THREE.Vector3(-1, 0, -58), look: new THREE.Vector3(-4, 2, -80) },
  // 0.50: Accelerating forward along corridor
  { pos: new THREE.Vector3(-4, 2, -70), look: new THREE.Vector3(-4, 2, -86) },
  // 0.60: Tilting up towards Floating Staircase
  { pos: new THREE.Vector3(0, 6, -90), look: new THREE.Vector3(4, 10, -112) },
  // 0.70: Ascending Staircase
  { pos: new THREE.Vector3(4, 10, -102), look: new THREE.Vector3(4, 10, -118) },
  // 0.80: Peering down into Vertical Void
  { pos: new THREE.Vector3(1, -2, -125), look: new THREE.Vector3(-2, -10, -145) },
  // 0.90: Descending through Void towards Demon Chamber
  { pos: new THREE.Vector3(-2, -8, -137), look: new THREE.Vector3(0, 0, -178) },
  // 1.00: Arriving and settled inside Demon Chamber
  { pos: new THREE.Vector3(0, 0, -162), look: new THREE.Vector3(0, 0, -188) },
];

export const CAM_POS_SPLINE = new THREE.CatmullRomCurve3(
  CAMERA_PATH.map((p) => p.pos),
  false,
  'catmullrom',
  0.4
);

export const CAM_LOOK_SPLINE = new THREE.CatmullRomCurve3(
  CAMERA_PATH.map((p) => p.look),
  false,
  'catmullrom',
  0.4
);
