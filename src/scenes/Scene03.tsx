// Scene03 (15.0–23.0 s, T) — night falls; the sun's disc washes out and returns as the full moon,
// which crosses to hang over 三潭印月. Three stone lanterns rise out of the water and print moons.
import React from 'react';
import {Canvas} from '../lib/motion';
import {COLOR, T, WATER} from '../spec';
import {ell, hill, rippleLines, stroke} from '../lib/film';
import {InkPath, Mist, Slug} from '../lib/typo';

const NIGHT_RIDGE = hill(-60, 1980, 742, [[300, 128, 200], [700, 66, 180], [1120, 104, 220], [1560, 142, 210], [1820, 78, 160]], 300);
const ISLE = `M0 754 Q240 738 470 748 Q700 758 900 742 Q1150 724 1380 746 Q1650 768 1920 752 L1920 800 L0 800 Z`;

// E10 — a stone lantern in the water: three spheres on a pagoda base, each holding a lit window.
const lantern = (x: number, y: number, s: number, lit: number, t: number) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-26 0 Q-24 -26 -14 -34 L14 -34 Q24 -26 26 0 Z" fill={COLOR.stone} opacity={0.9} />
    <rect x={-4} y={-46} width={8} height={14} fill={COLOR.stone} />
    {[0, 1, 2].map((k) => {
      const cy = -66 - k * 26;
      return (
        <g key={k}>
          <circle cx={0} cy={cy} r={15 - k * 1.4} fill={COLOR.stone} opacity={0.92} />
          <circle cx={0} cy={cy} r={6.2 - k * 0.5} fill={COLOR.paperLt} opacity={0.55 + 0.35 * lit * (0.82 + 0.18 * Math.sin(t * 2.4 + cy * 0.35))} />
        </g>
      );
    })}
    <path d="M0 -128 L0 -142" stroke={COLOR.stone} strokeWidth={5} strokeLinecap="round" />
  </g>
);

export const Scene03: React.FC<{t: number}> = ({t}) => {
  if (t < T.s3 - 0.6 || t > T.s4 + 1.0) return null;
  const enter = Math.max(0, t - T.s3);
  const night = Math.min(1, enter / 2.6);                 // the paper darkens to dusk-blue ink
  const lanternOn = Math.min(1, Math.max(0, (enter - 2.2) / 1.8));
  const moonglow = Math.min(1, Math.max(0, (enter - 1.9) / 1.4));

  // the moon's reflection drifts left beneath the moon
  const reflX = 960;

  return (
    <>
      <Canvas>
        <rect width={1920} height={1080} fill={COLOR.paper} />
        {/* S02 night: a single ink panel that deepens, never a gradient */}
        <rect width={1920} height={1080} fill="#2B3A44" opacity={night * 0.9} />
        <rect width={1920} height={1080} fill="#1C2A33" opacity={Math.max(0, night - 0.55) * 0.8} />

        {/* paper texture shows through the wash: a few lighter fibres */}
        <g opacity={0.12}>
          {Array.from({length: 26}, (_, i) => (
            <rect key={i} x={((i * 263) % 1920)} y={((i * 131) % 1080)} width={40 + (i % 7) * 26} height={1.4} fill={COLOR.paperLt} />
          ))}
        </g>

        <InkPath d={NIGHT_RIDGE} fill="#0F171C" opacity={0.68} filter="s3ink" />
        <InkPath d={ISLE} fill="#0D1418" opacity={0.8} />

        {/* thin cloud bands crossing the moon — a slow, continuous move so the night is never frozen */}
        <g opacity={moonglow}>
          {[0, 1, 2].map((i) => {
            const travel = ((t * 30 + i * 430) % 1900) - 300;
            return (
              <path key={i} d={stroke(travel, 236 + i * 62, travel + 620, 232 + i * 62, 16, 6, 5)}
                fill={COLOR.paperLt} opacity={(0.2 - i * 0.045) * (0.35 + 0.65 * moonglow)} />
            );
          })}
        </g>

        {/* the moon's glow-free halo: three hard rings, thin, so light stays drawn as shape */}
        <g opacity={moonglow}>
          {[1, 2, 3].map((k) => (
            <circle key={k} cx={960} cy={300} r={112 + k * 26} fill="none" stroke={COLOR.paperLt} strokeWidth={1.2}
              opacity={0.16 / k} />
          ))}
        </g>

        {/* the moon's reflection on the water: a wide soft ellipse and its broken column */}
        <g opacity={moonglow * 0.75}>
          <ellipse cx={reflX} cy={WATER + 118} rx={148} ry={26} fill={COLOR.paperLt} opacity={0.13} />
          {Array.from({length: 11}, (_, i) => {
            const u = i / 10;
            const w = 132 - u * 72 + Math.sin(t * 1.6 + i * 0.9) * 14;
            return <rect key={i} x={reflX - w / 2} y={716 + u * 264} width={w} height={3.2 - u * 1.5} rx={2}
              fill={COLOR.paperLt} opacity={0.34 - u * 0.24} />;
          })}
        </g>

        {rippleLines(714, 1040, 15, 0, 1920, 71, 0.9).map((r, i) => (
          <path key={i} d={r.d} stroke={COLOR.paperLt} strokeWidth={1.2} fill="none" opacity={r.o * 0.5} />
        ))}
        {/* broken moonlight: short glints travelling across the lake */}
        <g>
          {Array.from({length: 10}, (_, i) => {
            const x = ((t * 62 + i * 232) % 2100) - 90;
            const y = 730 + ((i * 71) % 270);
            const w = 22 + ((i * 37) % 46);
            return <rect key={i} x={x} y={y} width={w} height={2.2} rx={1} fill={COLOR.paperLt}
              opacity={(0.32 + 0.2 * Math.sin(t * 2.2 + i)) * Math.min(1, lanternOn * 1.2 + 0.2)} />;
          })}
        </g>

        {/* water, then the three lanterns standing in it, back to front */}
        <g opacity={lanternOn}>
          {[[760, 782, 0.94], [1030, 800, 1.06], [1290, 776, 0.88]].map(([x, y, s], i) => (
            <g key={i}>{lantern(x as number, y as number, s as number, lanternOn, t)}</g>
          ))}
          {/* their reflections: three short broken columns */}
          {[[760, 782], [1030, 800], [1290, 776]].map(([x, y], i) => (
            <g key={i} opacity={0.3}>
              {[0, 1, 2, 3].map((k) => <rect key={k} x={(x as number) - 12 + k * 2} y={(y as number) + 8 + k * 18} width={22 - k * 3} height={3} fill={COLOR.paperLt} opacity={0.5 - k * 0.1} />)}
            </g>
          ))}
        </g>

        <Mist t={t} y={700} count={4} opacity={0.13} seed={91} speed={5} width={640} />
        <Mist t={t} y={770} count={3} opacity={0.09} seed={113} speed={9} width={520} />
      </Canvas>

      <Slug num="03" cn="三潭印月" en="THREE POOLS" t={t} start={T.s3 + 1.2} color={COLOR.paperLt} />
      <div style={{position: 'absolute', left: 150, top: 214, fontFamily: 'Songti SC, serif', color: COLOR.paperLt,
        fontSize: 100, letterSpacing: '0.14em', fontWeight: 400,
        opacity: Math.max(0, Math.min(1, (t - T.s3 - 1.6) / 1.4))}}>
        月到天心
      </div>
    </>
  );
};
