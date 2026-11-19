// rough.ts — hand-drawn edge quality without SVG filters: displace path points deterministically.
// A brush edge is a low-frequency wobble plus a little per-point noise, so it reads as a hand, not static.
import {Pt, rand, toPath} from './motion';

// Smooth low-frequency displacement along the normal of a polyline.
export const jitter = (pts: Pt[], amp: number, seed: number, closed = true): Pt[] => {
  const n = pts.length;
  return pts.map(([x, y], i) => {
    const prev = pts[(i - 1 + n) % n], next = pts[(i + 1) % n];
    const tx = next[0] - prev[0], ty = next[1] - prev[1];
    const L = Math.hypot(tx, ty) || 1;
    const nx = -ty / L, ny = tx / L;
    // two octaves of deterministic wobble around the loop, so the seam closes
    const u = (i / n) * Math.PI * 2;
    const w = Math.sin(u * 3 + seed) * 0.55 + Math.sin(u * 7 + seed * 2.3) * 0.3 + Math.sin(u * 13 + seed * 0.7) * 0.15;
    const d = amp * w;
    return [x + nx * d, y + ny * d] as Pt;
  });
};

// Resample a path polyline to `n` points, then roughen it. For open strokes.
export const roughOpen = (pts: Pt[], amp: number, seed: number): Pt[] =>
  pts.map(([x, y], i) => {
    const prev = pts[Math.max(0, i - 1)], next = pts[Math.min(pts.length - 1, i + 1)];
    const tx = next[0] - prev[0], ty = next[1] - prev[1];
    const L = Math.hypot(tx, ty) || 1;
    const w = Math.sin(i * 1.7 + seed) * 0.6 + Math.sin(i * 0.6 + seed * 3.1) * 0.4;
    return [x + (-ty / L) * amp * w, y + (tx / L) * amp * w] as Pt;
  });

// A sprayed speck field inside a shape's bbox — used for ink spatter, never as texture wallpaper.
export const speckle = (n: number, x0: number, y0: number, x1: number, y1: number, seed: number, rMin = 0.7, rMax = 2.6) =>
  Array.from({length: n}, (_, i) => {
    const a = rand(seed + i * 1.7), b = rand(seed + i * 2.9), c = rand(seed + i * 4.3);
    return {x: x0 + (x1 - x0) * a, y: y0 + (y1 - y0) * b, r: rMin + (rMax - rMin) * c};
  });

export const pathOf = (pts: Pt[], closed = true) => toPath(pts, closed);
