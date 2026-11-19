// film.tsx — this film's own builders (one per element ledger row, tagged E##).
// motion.tsx is style-neutral; everything here is designed for THIS film:
// rice paper, ink washes, one red, and a single ring that travels the whole 60 s.
import React from 'react';
import {Body, Character, Pose, Pt, mix, rand, rig} from './motion';
import {COLOR, SERIF, WATER} from '../spec';

// ---------------- E01 the ring: 96 points, one object through every identity ----------------
export const RING_N = 96;

// Closed ellipse as 96 points, starting at angle 0 (+x) and running clockwise on screen.
export const ell = (cx: number, cy: number, rx: number, ry: number, rot = 0): Pt[] =>
  Array.from({length: RING_N}, (_, i) => {
    const a = rot + (i / RING_N) * Math.PI * 2;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as Pt;
  });

// Rounded square as 96 points, sampled by the SAME angle parameter as `ell`, so a disc → seal morph
// keeps point correspondence and never spins. n = 2 is a circle, n = 8 a square with soft corners.
export const squircle = (cx: number, cy: number, half: number, n = 8, deg = 0): Pt[] => {
  const k = (deg * Math.PI) / 180, c = Math.cos(k), s = Math.sin(k);
  return Array.from({length: RING_N}, (_, i) => {
    const a = (i / RING_N) * Math.PI * 2;
    const ca = Math.abs(Math.cos(a)), sa = Math.abs(Math.sin(a));
    const r = half / Math.pow(Math.pow(ca, n) + Math.pow(sa, n), 1 / n);
    const x = r * Math.cos(a), y = r * Math.sin(a);
    return [cx + x * c - y * s, cy + x * s + y * c] as Pt;
  });
};

export const SEAL = {cx: 960, cy: 380, half: 136, deg: -2.0};  // E12

// The tide bore's crest position at t (shared by the ring and scene 7).
export const crestX = (t: number) => {
  const p = Math.max(0, Math.min(1, (t - 47.0) / 5.4));
  return mix(630, 1740, Math.pow(p, 0.86));
};

type RingKey = {at: number; dur: number; pts: Pt[]};
// R01 / X01…X08 — one ring, in order: ripple → lake → sun → moon → bridge arch → cup rim → silk mouth
// → tide curl → the seal. Every row is the SAME 96 points, morphed; nothing is swapped or faded in.
export const RING_KEYS: RingKey[] = [
  {at: 0.10, dur: 0.01, pts: ell(960, WATER, 2.5, 2.5)},
  {at: 1.05, dur: 0.30, pts: ell(960, WATER, 10, 10)},
  {at: 3.30, dur: 2.20, pts: ell(960, WATER, 436, 120)},
  {at: 5.30, dur: 1.90, pts: ell(1112, 610, 196, 172)},
  {at: 6.45, dur: 1.20, pts: ell(1340, 520, 118, 118)},
  {at: 10.40, dur: 3.60, pts: ell(1340, 546, 118, 118)},
  {at: 14.10, dur: 0.90, pts: ell(1340, 618, 112, 112)},
  {at: 16.70, dur: 1.60, pts: ell(1178, 636, 104, 104)},
  {at: 17.90, dur: 1.50, pts: ell(960, 300, 112, 112)},
  {at: 22.30, dur: 1.20, pts: ell(960, 300, 112, 112)},
  {at: 23.50, dur: 1.50, pts: ell(960, WATER, 210, 210)},
  {at: 30.50, dur: 1.00, pts: ell(960, WATER, 210, 210)},
  {at: 31.70, dur: 1.30, pts: ell(700, 516, 168, 44)},
  {at: 37.50, dur: 0.90, pts: ell(700, 516, 168, 44)},
  {at: 39.30, dur: 1.60, pts: ell(700, 516, 198, 26)},
  {at: 45.50, dur: 0.90, pts: ell(700, 516, 198, 26)},
  {at: 47.10, dur: 1.20, pts: ell(crestX(47.1) + 40, 594, 74, 74)},
  {at: 48.90, dur: 1.90, pts: ell(crestX(48.9) + 26, 592, 78, 78)},
  {at: 50.70, dur: 1.80, pts: ell(crestX(50.7) + 18, 592, 80, 80)},
  {at: 52.40, dur: 1.30, pts: ell(crestX(52.4) + 14, 588, 72, 72)},
  {at: 54.10, dur: 1.45, pts: squircle(SEAL.cx, SEAL.cy, SEAL.half, 8, SEAL.deg)},
];

// the ring's own opacity: it goes out with the sun, comes back as the moon
const RING_OP: [number, number][] = [
  [0.70, 0], [1.02, 1], [14.55, 1], [15.30, 0], [16.40, 0], [16.78, 0.92], [17.60, 1], [60, 1],
];

export const lerpKeys = (keys: [number, number][], t: number) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i], [t0, v0] = keys[i - 1];
    if (t <= t1) {
      const p = (t - t0) / (t1 - t0 || 1);
      return mix(v0, v1, 1 - Math.pow(1 - p, 2.4));
    }
  }
  return keys[keys.length - 1][1];
};

export const ringGeom = (t: number): {pts: Pt[]; op: number} => {
  let cur = RING_KEYS[0].pts;
  for (let i = 1; i < RING_KEYS.length; i++) {
    const k = RING_KEYS[i];
    const p = Math.max(0, Math.min(1, (t - (k.at - k.dur)) / k.dur));
    if (p <= 0) break;
    const e = 1 - Math.pow(1 - p, 2.6);
    cur = cur.map(([x, y], j) => [mix(x, k.pts[j][0], e), mix(y, k.pts[j][1], e)] as Pt);
  }
  return {pts: cur, op: lerpKeys(RING_OP, t)};
};

// R01 look per segment; each row hard-turns at its `at`.
type RingStyle = {fill: string; stroke: string; sw: number};
export const ringStyle = (t: number): RingStyle => {
  if (t < 5.30) return {fill: '#00000000', stroke: COLOR.ink, sw: 2.6};              // ripple
  if (t < 6.45) return {fill: `${COLOR.seal}26`, stroke: COLOR.seal, sw: 2.0};        // ink reddens
  if (t < 14.60) return {fill: `${COLOR.seal}8A`, stroke: COLOR.seal, sw: 2.4};       // the sun
  if (t < 16.60) return {fill: '#00000000', stroke: COLOR.paperLt, sw: 2.2};
  if (t < 23.20) return {fill: COLOR.paperLt, stroke: COLOR.ink, sw: 2.6};            // the moon
  if (t < 31.40) return {fill: '#00000000', stroke: COLOR.stone, sw: 7};              // arch coping
  if (t < 38.90) return {fill: '#00000000', stroke: `${COLOR.celadon}E6`, sw: 4.5};   // cup rim
  if (t < 46.20) return {fill: '#00000000', stroke: `${COLOR.ink}8C`, sw: 2.4};       // silk mouth
  if (t < 52.40) return {fill: '#00000000', stroke: COLOR.paperLt, sw: 5};            // tide lip
  if (t < 54.40) return {fill: '#00000000', stroke: COLOR.ink, sw: 3};
  return {fill: COLOR.seal, stroke: COLOR.seal, sw: 2};                               // the seal
};

// ---------------- E02 ink marks & washes ----------------
// Closed terrain silhouette, hand-cut. The feet run past the frame edges and below its bottom, so a
// layer never shows its own bounding box — the next layer (or the frame) always covers the join.
export const hill = (x0: number, x1: number, baseY: number, peaks: [number, number, number][], down = 1200, n = 132): string => {
  const top: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const x = mix(x0, x1, i / (n - 1));
    let y = baseY;
    for (const [px, ph, pw] of peaks) y -= ph * Math.exp(-(((x - px) / pw) ** 2));
    top.push([x, y]);
  }
  const rough = top.map(([x, y], i) => {
    const u = i / (n - 1);
    const w = Math.sin(u * 19 + x0 * 0.004) * 0.62 + Math.sin(u * 43 + 1.7) * 0.38;
    return [x, y + w * 2.1] as Pt;
  });
  const d = rough.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  // close down-and-out: left/right beyond the frame, bottom past 1080
  return `${d} L${x1} ${baseY + down} L${x0} ${baseY + down} Z`;
};

// Water lines, thinning with distance. Smoothed with quadratic midpoints so a low-contrast line never
// reads as a row of blocks.
export const rippleLines = (y0: number, y1: number, count: number, x0: number, x1: number, seed: number, amp = 1): {d: string; o: number}[] =>
  Array.from({length: count}, (_, i) => {
    const u = count === 1 ? 0 : i / (count - 1), y = mix(y0, y1, Math.pow(u, 1.4));
    const inset = mix(0, 210, u);
    const wob = (1.8 + u * 4.2) * amp;
    const n = 16, pts: Pt[] = [];
    for (let k = 0; k <= n; k++) {
      const x = mix(x0 + inset, x1 - inset, k / n);
      pts.push([x, y + Math.sin(k * 0.78 + rand(seed + i * 3.7) * 6.283) * wob]);
    }
    // Catmull-ish smoothing via quadratic midpoints
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let k = 1; k < n; k++) {
      const mx = (pts[k][0] + pts[k + 1][0]) / 2, my = (pts[k][1] + pts[k + 1][1]) / 2;
      d += ` Q${pts[k][0].toFixed(1)} ${pts[k][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
    }
    return {d, o: mix(0.3, 0.045, u)};
  });

// A tapered brush stroke along a line (optionally bowed) — mist, steam, distant ridges, branches.
export const stroke = (x0: number, y0: number, x1: number, y1: number, w0: number, w1: number, bow = 0, n = 24): string => {
  const tx = x1 - x0, ty = y1 - y0, L = Math.hypot(tx, ty) || 1;
  const nx = -ty / L, ny = tx / L;
  const at = (u: number): Pt => [mix(x0, x1, u), mix(y0, y1, u) + Math.sin(u * Math.PI) * bow];
  const wAt = (u: number) => (mix(w0, w1, u) / 2) * Math.sin(Math.min(1, Math.max(0, u)) * Math.PI) ** 0.35;
  const up: Pt[] = [], dn: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, [x, y] = at(u), w = wAt(u);
    up.push([x + nx * w, y + ny * w]);
    dn.push([x - nx * w, y - ny * w]);
  }
  const pts = [...up, ...dn.reverse()];
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let k = 1; k < pts.length; k++) {
    const mx = (pts[k][0] + pts[(k + 1) % pts.length][0]) / 2;
    const my = (pts[k][1] + pts[(k + 1) % pts.length][1]) / 2;
    d += ` Q${pts[k][0].toFixed(1)} ${pts[k][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  return d + ' Z';
};

// ---------------- E03 the pagoda ----------------
export const pagoda = (cx: number, baseY: number, h: number, tiers: number, w: number) => {
  const th = h / tiers, bodies: string[] = [], roofs: string[] = [], windows: Pt[] = [];
  for (let i = 0; i < tiers; i++) {
    const yb = baseY - i * th, yt = yb - th * 0.58;
    const wi = w * (1 - 0.3 * (i / Math.max(1, tiers - 1)));
    const wr = wi * 1.24, rh = th * 0.52;
    bodies.push(`M${cx - wi} ${yb} L${cx - wi * 0.9} ${yt} L${cx + wi * 0.9} ${yt} L${cx + wi} ${yb} Z`);
    roofs.push(`M${cx - wr} ${yt + rh * 0.24} Q${cx - wr * 0.5} ${yt - rh * 0.06} ${cx - wi * 0.28} ${yt - rh} L${cx + wi * 0.28} ${yt - rh} Q${cx + wr * 0.5} ${yt - rh * 0.06} ${cx + wr} ${yt + rh * 0.24} Z`);
    if (i > 0) windows.push([cx, yb - th * 0.3]);
  }
  return {bodies, roofs, windows, top: baseY - h};
};

export const finial = (cx: number, y: number, h: number) => ({
  spire: `M${cx - 2.4} ${y + 6} L${cx - 1.3} ${y - h} L${cx + 1.3} ${y - h} L${cx + 2.4} ${y + 6} Z`,
  rings: [0.3, 0.54, 0.78].map((u) => `M${cx - 10 * (1 - u * 0.55)} ${y - h * u} Q${cx} ${y - h * u - 8} ${cx + 10 * (1 - u * 0.55)} ${y - h * u}`),
});

// ---------------- E04 the broken bridge ----------------
export const BRIDGE = {x0: 520, x1: 1400, cx: 960, endY: 700, apexY: 462, r: 210};
export const deckY = (x: number): number => {
  const u = Math.max(-1, Math.min(1, (x - BRIDGE.cx) / ((BRIDGE.x1 - BRIDGE.x0) / 2)));
  const k = Math.cos(Math.abs(u) * Math.PI / 2);
  return BRIDGE.endY - (BRIDGE.endY - BRIDGE.apexY) * Math.pow(Math.max(0, k), 1.2);
};
export const bridgeSolid = (): string => {
  const top: Pt[] = [];
  for (let i = 0; i <= 96; i++) {
    const x = mix(BRIDGE.x0, BRIDGE.x1, i / 96);
    top.push([x, deckY(x)]);
  }
  const deck = top.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  // Spandrel: the deck, then down each abutment to the waterline only — the bridge sits IN the lake,
  // its feet hidden by the reflection, so there is no slab hanging below the water.
  const outer = `${deck} L${BRIDGE.x1} ${WATER + 6} L${BRIDGE.x0} ${WATER + 6} Z`;
  const arch: Pt[] = [];
  for (let i = 0; i <= 64; i++) {
    const a = Math.PI - (i / 64) * Math.PI;
    arch.push([BRIDGE.cx + BRIDGE.r * Math.cos(a), WATER - BRIDGE.r * Math.sin(a)]);
  }
  const hole = arch.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + ' Z';
  return `${outer} ${hole}`;
};

// The course lines of the stone: thin arcs parallel to the deck, so the mass reads as masonry.
export const bridgeCourses = (count = 5): string[] =>
  Array.from({length: count}, (_, k) => {
    const off = 16 + k * 22, n = 60, pts: Pt[] = [];
    for (let i = 0; i <= n; i++) {
      const x = mix(BRIDGE.x0 + 30, BRIDGE.x1 - 30, i / n);
      const y = deckY(x) + off;
      const dx = Math.abs(x - BRIDGE.cx);
      if (dx < BRIDGE.r + 8) continue;
      pts.push([x, y]);
    }
    return pts.length > 1 ? pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') : '';
  }).filter(Boolean);

export const balustrade = () => {
  const posts: {x: number; y: number; h: number}[] = [];
  for (let x = BRIDGE.x0 + 30; x <= BRIDGE.x1 - 30; x += 44) posts.push({x, y: deckY(x), h: 78});
  return posts;
};

// ---------------- E05 the celadon cup ----------------
export const CUP = {cx: 700, rimY: 516, rx: 168, ry: 44, baseY: 806, footRx: 86};
export const cupBody = (): string => {
  const l: Pt[] = [], r: Pt[] = [];
  for (let i = 0; i <= 44; i++) {
    const u = i / 44;
    const x = CUP.rx * (1 - 0.44 * Math.pow(u, 1.75));
    const y = mix(CUP.rimY, CUP.baseY, u);
    l.push([CUP.cx - x, y]);
    r.push([CUP.cx + x, y]);
  }
  const down = l.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return `${down} ${r.reverse().map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')} Z`;
};
// 冰裂纹 crackle: short irregular segments over the glaze.
export const crackle = (seed: number, n = 13): string[] =>
  Array.from({length: n}, (_, i) => {
    const a = rand(seed + i * 1.7) * Math.PI * 2, len = 30 + rand(seed + i * 2.3) * 58;
    const cx = CUP.cx + (rand(seed + i * 3.1) - 0.5) * 250, cy = CUP.rimY + 56 + rand(seed + i * 4.9) * 170;
    const x2 = cx + Math.cos(a) * len, y2 = cy + Math.sin(a) * len * 0.55;
    const mx = (cx + x2) / 2 + Math.cos(a + 1.5) * 10, my = (cy + y2) / 2 + Math.sin(a + 1.5) * 7;
    return `M${cx.toFixed(1)} ${cy.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  });

// ---------------- E06 the silk ribbon ----------------
export const SILK = {x0: 700, x1: 2120, y0: 504};
// A folded silk band: the spine undulates gently while the band narrows to the right.
export const spineY = (u: number) => SILK.y0 - 120 * u + 54 * Math.sin(u * 3.9 + 0.25) + 14 * Math.sin(u * 9.7 + 1.1);
export const spineW = (u: number) => 250 - 92 * u + 40 * Math.sin(u * 4.6 + 0.6);
// The band is built cross-section by cross-section. Section u appears at time `birth + u * growth`, and each
// section TRAVELS right as the cloth feeds out of the mouth — so the morph is real, not a reveal.
export const silkReveal = (t: number, start: number, dur: number) =>
  Math.max(0, Math.min(1, (t - start) / dur));
export const silkBand = (p: number): string => {
  if (p <= 0.002) return '';
  const n = 44, top: Pt[] = [], bot: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = mix(SILK.x0, SILK.x1, u);
    const y = spineY(u * p), w = spineW(u * p) / 2;
    const dy = (spineY(Math.min(1, u * p + 0.02)) - spineY(Math.max(0, u * p - 0.02)));
    const L = Math.hypot((SILK.x1 - SILK.x0) * 0.02, dy) || 1;
    top.push([x, y + (-dy / L) * w]);
    bot.push([x, y + (dy / L) * w]);
  }
  return top.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
    + [...bot.reverse()].map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join('') + ' Z';
};
export const silkFolds = (p: number, count = 6): string[] =>
  Array.from({length: count}, (_, k) => {
    const off = (k / (count - 1) - 0.5) * 1.28;
    const n = 34, pts: Pt[] = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, x = mix(SILK.x0, SILK.x1, u), w = spineW(u * p) / 2;
      pts.push([x, spineY(u * p) + off * w * (0.9 + 0.1 * Math.sin(u * 9.3 + k * 1.7))]);
    }
    return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  });

// ---------------- E07 the tide bore ----------------
// A wall of water: a steep face just behind the crest, falling away backwards, and a churned tail.
// `crestX` is the ring's x, so the bore's lip and the ring are always the same edge.
export const tideLip = (t: number): string => {
  const x = crestX(t);
  const back = x - 980;
  const n = 56, pts: Pt[] = [];
  // A bore is a thin wall, not a hill: the back of the wave is nearly flat at water level, the face
  // rears up over the last fifth, and the crest is the rightmost point.
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const xx = mix(back, x, u);
    const body = 614 - 26 * Math.pow(u, 2.6);
    const face = 104 * Math.pow(Math.max(0, (u - 0.78) / 0.22), 2.4);
    pts.push([xx, body - face]);
  }
  const lip = pts.map(([xx, yy], i) => `${i ? 'L' : 'M'}${xx.toFixed(1)} ${yy.toFixed(1)}`).join(' ');
  // the crest throws forward and breaks, then the face drops vertically into the trough
  return `${lip} C${x + 34} ${pts[n][1] + 10} ${x + 58} ${pts[n][1] + 40} ${x + 40} 640 L${x + 34} 706 L${back} 706 Z`;
};

// The white water along the crest: a band of foam that rides the lip.
export const tideFoam = (t: number): {d: string; w: number; o: number}[] => {
  const x = crestX(t);
  return Array.from({length: 26}, (_, i) => {
    const u = i / 25;
    const xx = mix(x - 560, x + 12, u);
    const yy = 614 - 26 * Math.pow(u, 2.6) - 104 * Math.pow(Math.max(0, (u - 0.78) / 0.22), 2.4);
    const len = 16 + 30 * Math.sin(u * 9.1 + 1.3) ** 2;
    return {d: `M${xx.toFixed(1)} ${(yy - 3).toFixed(1)} L${(xx + len).toFixed(1)} ${(yy - 1).toFixed(1)}`, w: 3 + 3 * u, o: 0.25 + 0.55 * u};
  });
};

// ---------------- E08 the boat ----------------
export const Boat: React.FC<{x: number; y: number; s?: number; t: number; pole?: boolean}> = ({x, y, s = 1, t, pole = true}) => {
  const pose: Pose = {
    x: 58, y: -14, facing: 1, lean: 2, head: -3, mood: 'calm', look: 0,
    armL: [22, 14], armR: [148, 26], legL: [8, 6], legR: [-6, 4],
  };
  const hand = rig(BOATMAN, pose).armR.hand;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* hull: a shallow crescent with a raised stern */}
      <path d="M-112 -6 Q-96 30 0 32 Q96 30 112 -6 Q88 6 0 8 Q-88 6 -112 -6 Z" fill={COLOR.ink} />
      <path d="M-112 -6 Q-126 -22 -118 -34" stroke={COLOR.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M112 -6 Q124 -20 116 -30" stroke={COLOR.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* reed canopy */}
      <path d="M-42 2 Q-40 -48 4 -54 Q46 -50 52 2 Z" fill={`${COLOR.ink}E0`} />
      <path d="M-42 2 Q-40 -48 4 -54 Q46 -50 52 2" stroke={COLOR.tea} strokeWidth={2} fill="none" opacity={0.5} />
      {/* boatman + pole */}
      <g transform="translate(-6 6)">
        <Character body={BOATMAN} pose={pose} />
        {pole && (
          <path d={`M${hand[0]} ${hand[1]} L${hand[0] - 250} ${hand[1] + 210}`} stroke={COLOR.ink} strokeWidth={4.5} strokeLinecap="round" />
        )}
      </g>
    </g>
  );
};

// The boatman's rig, exported so the pole can be drawn behind him.
export const BOATMAN: Body = {
  torso: [44, 88], head: [29, 35], upperArm: 37, foreArm: 33, thigh: 41, shin: 39,
  limb: 11, hand: 8.5, foot: 16, neck: 5,
  color: {body: COLOR.ink, head: '#E7DBC7', limb: COLOR.ink, line: COLOR.ink, shoe: COLOR.ink},
  parts: {
    head: (o) => (
      <g>
        <ellipse cx={o.x} cy={o.y} rx={o.w * 0.46} ry={o.h * 0.5} fill={o.color} />
        <path d={`M${o.x - o.w * 1.7} ${o.y - o.h * 0.2} Q${o.x} ${o.y - o.h * 1.5} ${o.x + o.w * 1.7} ${o.y - o.h * 0.2} Z`} fill={COLOR.ink} />
        <path d={`M${o.x - o.w * 1.7} ${o.y - o.h * 0.2} L${o.x + o.w * 1.7} ${o.y - o.h * 0.2}`} stroke={COLOR.tea} strokeWidth={1.6} opacity={0.65} />
      </g>
    ),
    torso: (o) => (
      <g>
        <path d={`M${o.x - o.w * 0.4} ${o.y - o.h * 0.5} L${o.x + o.w * 0.4} ${o.y - o.h * 0.5} L${o.x + o.w * 0.72} ${o.y + o.h * 0.5} L${o.x - o.w * 0.72} ${o.y + o.h * 0.5} Z`} fill={o.color} />
        <path d={`M${o.x - o.w * 0.04} ${o.y - o.h * 0.44} L${o.x + o.w * 0.12} ${o.y + o.h * 0.44}`} stroke={COLOR.paper} strokeWidth={2.2} opacity={0.45} />
      </g>
    ),
    limb: (o) => <path d={`M${o.a[0]} ${o.a[1]} L${o.b[0]} ${o.b[1]}`} stroke={o.color} strokeWidth={o.w0} strokeLinecap="round" />,
  },
  face: (o) => (
    <g opacity={0.9}>
      <circle cx={o.x + 5} cy={o.y + 1} r={1.8} fill={COLOR.ink} />
      <path d={`M${o.x + 10} ${o.y + 10} q3 1.6 5.5 -0.6`} stroke={COLOR.ink} strokeWidth={1.3} fill="none" />
    </g>
  ),
};

// ---------------- E09 the visitor on the bridge ----------------
export const VISITOR: Body = {
  torso: [42, 86], head: [31, 36], upperArm: 35, foreArm: 31, thigh: 43, shin: 41,
  limb: 13, hand: 8, foot: 17, neck: 4,
  color: {body: '#3F464B', head: '#E9DDC9', limb: '#3F464B', line: COLOR.ink, shoe: '#221E1A'},
  parts: {
    torso: (o) => (
      <g>
        <path d={`M${o.x - o.w * 0.44} ${o.y - o.h * 0.5} Q${o.x} ${o.y - o.h * 0.64} ${o.x + o.w * 0.44} ${o.y - o.h * 0.5} L${o.x + o.w * 0.58} ${o.y + o.h * 0.5} L${o.x - o.w * 0.58} ${o.y + o.h * 0.5} Z`} fill={o.color} />
        <path d={`M${o.x - o.w * 0.4} ${o.y - o.h * 0.26} L${o.x + o.w * 0.42} ${o.y - o.h * 0.22}`} stroke={COLOR.seal} strokeWidth={6} opacity={0.8} />
      </g>
    ),
    limb: (o) => <path d={`M${o.a[0]} ${o.a[1]} L${o.b[0]} ${o.b[1]}`} stroke={o.color} strokeWidth={o.w0} strokeLinecap="round" />,
  },
  face: (o) => (
    <g opacity={0.9}>
      <circle cx={o.x + 5} cy={o.y + 1} r={1.8} fill={COLOR.ink} />
      <path d={`M${o.x + 3} ${o.y + 12} q4 1.8 6.6 -1.2`} stroke={COLOR.ink} strokeWidth={1.3} fill="none" />
    </g>
  ),
};

// Paper umbrella, given the hand point.
export const umbrella = (at: Pt, r: number, tilt: number) => {
  const [x, y] = at, top = y - r * 1.2;
  return (
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <path d={`M${x - r} ${y} Q${x - r * 0.62} ${top} ${x} ${top} Q${x + r * 0.62} ${top} ${x + r} ${y} Z`} fill={COLOR.paperLt} stroke={COLOR.ink} strokeWidth={2.4} />
      {[-0.74, -0.4, 0, 0.4, 0.74].map((u, i) => (
        <path key={i} d={`M${x} ${top} Q${x + r * u * 0.6} ${y - r * 0.4} ${x + r * u} ${y - r * 0.08}`} stroke={COLOR.ink} strokeWidth={1.3} fill="none" opacity={0.7} />
      ))}
      <path d={`M${x} ${top} L${x} ${y + r * 0.66}`} stroke={COLOR.ink} strokeWidth={2.6} />
    </g>
  );
};

export const SERIF_STACK = SERIF;

// ---------------- E13 typography components (one family, one tracking policy) ----------------
import {progress} from './typo';
export {VText, Label, Slug, InkPath, Mist} from './typo';
