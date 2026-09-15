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

// 4 Authoritative Infinity Castle Scene Plates in 3D Space (01 -> 02 -> 03 -> 06)
// Positioned with overlapping spatial proximity so the camera travels continuously
export const SCENE_PLATES_DATA: ScenePlateAnchor[] = [
  {
    id: 'entrance',
    number: '01',
    name: 'ENTRANCE',
    japanese: '無限城 // 門',
    subtitle: 'THE GATES OF ETERNAL NIGHT',
    texturePath: '/assets/castle/01-entrance.webp',
    position: [0, 0, -20],
    rotation: [0, 0, 0],
    scale: [36, 20.25, 1],
    scrollStart: 0.00,
    scrollPeak: 0.08,
    scrollEnd: 0.32,
  },
  {
    id: 'main-hall',
    number: '02',
    name: 'MAIN CASTLE HALL',
    japanese: '本殿 // 階層',
    subtitle: 'DIMENSIONAL FOLD',
    texturePath: '/assets/castle/02-main-hall.webp',
    position: [2, -3, -50],
    rotation: [0.02, -0.05, 0.01],
    scale: [40, 22.5, 1],
    scrollStart: 0.22,
    scrollPeak: 0.40,
    scrollEnd: 0.62,
  },
  {
    id: 'infinite-corridor',
    number: '03',
    name: 'INFINITE CORRIDOR',
    japanese: '無限廊下 // 刻',
    subtitle: 'THE ENDLESS PERSPECTIVE',
    texturePath: '/assets/castle/03-infinite-corridor.webp',
    position: [-4, 2, -80],
    rotation: [-0.01, 0.06, -0.01],
    scale: [42, 23.6, 1],
    scrollStart: 0.52,
    scrollPeak: 0.70,
    scrollEnd: 0.90,
  },
  {
    id: 'demon-chamber',
    number: '04',
    name: 'ENDLESS DEMON CHAMBER',
    japanese: '終焉 // 玉座',
    subtitle: 'THE INNER SANCTUM',
    texturePath: '/assets/castle/06-demon-chamber.webp',
    position: [0, 0, -110],
    rotation: [0, 0, 0],
    scale: [48, 27, 1],
    scrollStart: 0.80,
    scrollPeak: 0.95,
    scrollEnd: 1.00,
  },
];

export const CASTLE_FRAME_COUNT = SCENE_PLATES_DATA.length;

// Continuous 3D Camera Waypoints matching the 4 plates
export const CAMERA_PATH = [
  // 0.00: Gazing at Entrance
  { pos: new THREE.Vector3(0, 0, 0), look: new THREE.Vector3(0, 0, -20) },
  // 0.12: Approaching Entrance Gate
  { pos: new THREE.Vector3(0, 0, -12), look: new THREE.Vector3(0, 0, -28) },
  // 0.25: Passing through gate, Main Hall looms
  { pos: new THREE.Vector3(1, -1.5, -28), look: new THREE.Vector3(2, -3, -50) },
  // 0.38: Moving through Main Hall
  { pos: new THREE.Vector3(2, -3, -40), look: new THREE.Vector3(2, -3, -56) },
  // 0.52: Turning into Infinite Corridor
  { pos: new THREE.Vector3(-1, 0, -58), look: new THREE.Vector3(-4, 2, -80) },
  // 0.68: Accelerating forward along corridor
  { pos: new THREE.Vector3(-4, 2, -70), look: new THREE.Vector3(-4, 2, -86) },
  // 0.82: Exiting corridor, Demon Chamber emerges
  { pos: new THREE.Vector3(-1, 0.5, -88), look: new THREE.Vector3(0, 0, -110) },
  // 0.92: Approaching Demon Chamber throne
  { pos: new THREE.Vector3(0, 0, -96), look: new THREE.Vector3(0, 0, -115) },
  // 1.00: Arriving and settled inside Demon Chamber
  { pos: new THREE.Vector3(0, 0, -98), look: new THREE.Vector3(0, 0, -120) },
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
