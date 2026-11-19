// ring.ts — the ring's public surface, so Film.tsx and the scenes share one implementation.
export {ringGeom, ringStyle, SEAL} from './film';
import {Pt, toPath} from './motion';
import {lerpKeys} from './film';

export const toPathOf = (pts: Pt[]) => toPath(pts, true);

// The waterline mask: the ring sinks behind the water in scenes 4 and 5.
export const waterClipOf = (t: number) => lerpKeys([[0, 0], [22.9, 0], [23.65, 300], [31.35, 300], [32.5, 0], [60, 0]], t);
