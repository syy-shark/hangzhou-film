// Scene02 (7.0–15.0 s, T) — the lake at dusk: three ink ridges, Leifeng on the far shore, a boat crossing.
// E02 ridges · E03 pagoda · E08 boat. The ring here is the setting sun (drawn by Film.tsx).
// Layer order back→front: sky · far ridge · mid ridge · far shore · water · near bank · boat.
import React from 'react';
import {Canvas} from '../lib/motion';
import {COLOR, COPY, T, WATER} from '../spec';
import {Boat, finial, hill, pagoda, rippleLines, stroke} from '../lib/film';
import {InkPath, Mist, Slug} from '../lib/typo';

// Every closed terrain runs past the frame edges and under the bottom, so no layer shows its own box.
const RIDGE_FAR  = hill(-160, 2080, 640, [[300, 96, 230], [700, 132, 200], [1080, 78, 220], [1480, 124, 210], [1820, 74, 180]], 90);
const RIDGE_MID  = hill(-160, 2080, 686, [[210, 132, 210], [560, 172, 170], [880, 84, 190], [1260, 148, 200], [1660, 104, 210], [1960, 138, 180]], 34);
const PAGODA = pagoda(1580, 646, 244, 6, 32);
const FIN = finial(1580, PAGODA.top, 40);
const PAGODA2 = pagoda(1218, 636, 150, 4, 20);
const FIN2 = finial(1218, PAGODA2.top, 23);
const FAR_SHORE = hill(-160, 2080, 700, [[420, 36, 260], [1500, 30, 300]], 18);
// near bank: a low ink mass in the bottom-left corner, its crest running off the left edge
const NEAR_BANK = 'M-160 1080 L-160 934 Q30 918 122 948 Q178 966 190 1080 Z';

export const Scene02: React.FC<{t: number}> = ({t}) => {
  if (t < T.s2 - 0.4 || t > T.s3 + 1.0) return null;
  const enter = Math.max(0, t - T.s2);
  const dusk = Math.min(1, enter / 8);
  const boatX = 452 + enter * 50;
  const boatY = 806 + Math.sin(enter * 0.55) * 7;
  const sunRefl = 1 - Math.max(0, (enter - 3.2) / 4.4);

  return (
    <>
      <Canvas>
        <rect width={1920} height={1080} fill={COLOR.paper} />
        {/* sky: one paler panel high up, one warmer band at the horizon. Flat panels, not a gradient. */}
        <rect width={1920} height={392} fill={COLOR.paperLt} opacity={0.7} />
        <rect y={392} width={1920} height={230} fill="#F7F0E2" opacity={0.9} />

        {/* three ridges, far to near, each a single flat tone (atmospheric perspective by value) */}
        <InkPath d={RIDGE_FAR} fill={COLOR.inkMid} opacity={0.26} />
        <InkPath d={RIDGE_MID} fill={COLOR.inkMid} opacity={0.44} />

        {/* 雷峰塔 on the far shore, then the small 保俶塔 on the ridge to its left */}
        <g opacity={0.62}>
          {PAGODA2.bodies.map((d, i) => <InkPath key={`b2${i}`} d={d} fill={COLOR.ink} opacity={0.75} />)}
          {PAGODA2.roofs.map((d, i) => <InkPath key={`r2${i}`} d={d} fill={COLOR.ink} opacity={0.8} />)}
          <InkPath d={FIN2.spire} fill={COLOR.ink} />
        </g>
        <g opacity={0.9}>
          <path d="M1502 648 Q1580 630 1660 648 L1660 700 L1502 700 Z" fill={COLOR.ink} opacity={0.5} />
          {PAGODA.bodies.map((d, i) => <InkPath key={`b${i}`} d={d} fill={COLOR.ink} opacity={0.92} />)}
          {PAGODA.roofs.map((d, i) => <InkPath key={`r${i}`} d={d} fill={COLOR.ink} opacity={0.96} />)}
          <InkPath d={FIN.spire} fill={COLOR.ink} />
          {FIN.rings.map((d, i) => <path key={`f${i}`} d={d} stroke={COLOR.ink} strokeWidth={3} fill="none" />)}
          {PAGODA.windows.map(([x, y], i) => <circle key={`w${i}`} cx={x} cy={y} r={3.2} fill={COLOR.paperLt} opacity={0.85} />)}
        </g>

        <InkPath d={FAR_SHORE} fill={COLOR.ink} opacity={0.58} />

        {/* the sun's reflection: a broken column of horizontal dashes */}
        <g opacity={0.62 * sunRefl}>
          {Array.from({length: 14}, (_, i) => {
            const u = i / 13;
            const w = 132 - u * 62 + Math.sin(enter * 2.1 + i) * 17;
            return <rect key={i} x={1112 - w / 2} y={700 + u * 330} width={w} height={3.8 - u * 1.7} rx={2}
              fill={COLOR.seal} opacity={0.52 - u * 0.36} />;
          })}
        </g>

        {/* water: a paler plane than the sky, so the lake reads as its own material */}
        <rect y={700} width={1920} height={380} fill={COLOR.paperLt} opacity={0.62} />
        <rect y={700} width={1920} height={380} fill={COLOR.celadon} opacity={0.07} />

        {/* water: ripples thinning out towards the bottom, over the paper itself */}
        {rippleLines(716, 1050, 15, 0, 1920, 5, 0.9).map((r, i) => (
          <path key={i} d={r.d} stroke={COLOR.ink} strokeWidth={1.4} fill="none" opacity={r.o} />
        ))}

        <InkPath d={NEAR_BANK} fill={COLOR.ink} opacity={0.6} />

        <Mist t={t} y={668} count={5} opacity={0.16} seed={23} speed={6} width={720} />
        <Mist t={t} y={742} count={3} opacity={0.1} seed={57} speed={11} width={520} />

        <Boat x={boatX} y={boatY} t={t} s={0.94} />
        <g opacity={0.34}>
          <path d={stroke(boatX - 112, boatY + 24, boatX - 296, boatY + 42, 3, 0.6, 6)} fill={COLOR.ink} />
          <path d={stroke(boatX - 112, boatY + 28, boatX - 330, boatY + 60, 2.4, 0.4, -8)} fill={COLOR.ink} />
        </g>
      </Canvas>

      <Slug num="02" cn="西湖" en="WEST LAKE" t={t} start={T.s2 + 0.9} />
      <div style={{position: 'absolute', right: 158, top: 236, textAlign: 'right', fontFamily: "'Songti SC', serif",
        fontSize: 96, lineHeight: 1.2, color: COLOR.ink, letterSpacing: '0.12em', fontWeight: 400,
        opacity: Math.max(0, Math.min(1, (t - T.s2 - 1.4) / 1.4)),
        transform: `translateX(${Math.max(0, (1 - (t - T.s2 - 1.4) / 1.4)) * 20}px)`}}>
        一湖烟水
      </div>
    </>
  );
};
