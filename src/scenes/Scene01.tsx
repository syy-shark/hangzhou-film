// Scene01 (0–7.0 s, T) — one ink drop falls into still water and the frame becomes a lake.
// The drop, the crown and the ripple are the opens; the ring (Film.tsx) is the ripple's first circle.
// Layer order back→front: sky · far ridge · mid ridge · shore · water · mist · drop/crown.
import React from 'react';
import {Canvas, EASE, prog} from '../lib/motion';
import {COLOR, COPY, T, WATER} from '../spec';
import {hill, rippleLines, stroke} from '../lib/film';
import {InkPath, Label} from '../lib/typo';

const RIDGE_FAR = hill(-160, 2080, 596, [[420, 88, 250], [880, 118, 210], [1330, 62, 230], [1740, 96, 200]], 24);
const RIDGE_MID = hill(-160, 2080, 668, [[240, 96, 220], [660, 148, 190], [1080, 74, 210], [1520, 112, 200], [1900, 82, 190]], 24);
const SHORE = hill(-160, 2080, 700, [[300, 26, 260], [1200, 18, 300], [1720, 30, 240]], 380);

export const Scene01: React.FC<{t: number}> = ({t}) => {
  if (t > T.s2 + 0.9) return null;
  const drop = prog(t, 0.28, 0.66, EASE.in);
  const landed = t >= T.drop;
  const hit = prog(t, T.drop, 1.1, EASE.out);
  const ridge = prog(t, 1.1, 2.6, EASE.smooth);
  const shore = prog(t, 2.1, 2.4, EASE.smooth);
  const caption = prog(t, 3.0, 1.5, EASE.smooth);
  const ripples = rippleLines(714, 1040, 13, -40, 1960, 5, 0.8);

  return (
    <>
      <Canvas>
        <rect width={1920} height={1080} fill={COLOR.paper} />
        <rect width={1920} height={410} fill={COLOR.paperLt} opacity={0.62} />

        <g opacity={ridge}>
          <InkPath d={RIDGE_FAR} fill={COLOR.inkMid} opacity={0.24} />
        </g>
        <g opacity={ridge * 0.9}>
          <InkPath d={RIDGE_MID} fill={COLOR.inkMid} opacity={0.4} />
        </g>
        <g opacity={shore}>
          <InkPath d={SHORE} fill={COLOR.ink} opacity={0.8} />
        </g>

        {/* water: paler than the sky, with ripples radiating from the impact point */}
        <rect y={WATER} width={1920} height={380} fill={COLOR.paperLt} opacity={0.34} />
        <g opacity={Math.min(1, hit * 1.6)}>
          {ripples.map((r, i) => (
            <path key={i} d={r.d} stroke={COLOR.ink} strokeWidth={1.5} fill="none" opacity={r.o * 0.75} />
          ))}
        </g>

        {/* the impact wash: a widening stain just under the surface, not a cover over the frame */}
        <g opacity={hit}>
          <ellipse cx={960} cy={704} rx={34 + 250 * Math.pow(hit, 0.72)} ry={9 + 84 * Math.pow(hit, 0.72)}
            fill={COLOR.paperLt} opacity={0.85} />
          <ellipse cx={960} cy={706} rx={24 + 196 * Math.pow(hit, 0.72)} ry={7 + 62 * Math.pow(hit, 0.72)}
            fill={COLOR.celadon} opacity={0.12} />
        </g>



        {/* the falling drop: a lens that stretches as it falls, gone at the impact */}
        {!landed && (
          <ellipse cx={960} cy={-30 + (WATER + 30) * drop} rx={8.5 - 3 * drop} ry={12 + 15 * drop} fill={COLOR.ink} />
        )}
        {/* the crown: six short spikes leaving the impact point, then a single falling column */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const p = prog(t, T.drop + i * 0.04, 0.62, EASE.out);
          const a = -Math.PI / 2 + (i - 2.5) * 0.44;
          const r = 9 + 58 * p;
          return p > 0 && p < 1 ? (
            <line key={i} x1={960 + Math.cos(a) * 7} y1={WATER + Math.sin(a) * 7 * 0.32}
              x2={960 + Math.cos(a) * r} y2={WATER + Math.sin(a) * r * 0.32}
              stroke={COLOR.ink} strokeWidth={2.6 * (1 - p)} opacity={0.72 * (1 - p)} strokeLinecap="round" />
          ) : null;
        })}
        {/* the shore's wet edge */}
        <path d={stroke(20, 701, 1900, 698, 1.2, 2.8, 3)} fill={COLOR.ink} opacity={0.3 * shore} />
      </Canvas>

      <div style={{position: 'absolute', left: 0, right: 0, top: 76, textAlign: 'center', opacity: caption}}>
        <Label text={`${COPY.coord[0]}    ${COPY.coord[1]}`} x={960} y={0} size={21} tracking={0.42}
          color={COLOR.inkMid} anchor="middle" />
      </div>
    </>
  );
};
