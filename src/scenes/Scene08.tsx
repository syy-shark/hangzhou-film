// Scene08 (53.5–60.0 s, T) — the film closes as a red seal on paper: 杭州.
// The seal IS the ring (drawn by Film.tsx, which also knocks out the two characters); this scene supplies
// the paper, the seal's shadow, and the naming block underneath.
import React from 'react';
import {Canvas, EASE, prog} from '../lib/motion';
import {COLOR, COPY, T} from '../spec';
import {SEAL, hill, rippleLines} from '../lib/film';
import {InkPath} from '../lib/typo';

const FAR = hill(-160, 2080, 812, [[380, 44, 260], [1120, 26, 240], [1620, 50, 220]], 26);

export const Scene08: React.FC<{t: number}> = ({t}) => {
  if (t < T.s8 - 0.7 || t > T.end) return null;
  const paper = prog(t, T.s8 - 0.6, 1.8, EASE.smooth);
  const stamp = prog(t, T.stamp, 0.32, EASE.in);
  const title = prog(t, T.stamp + 0.55, 1.3, EASE.smooth);
  const line1 = prog(t, T.stamp + 1.05, 1.2, EASE.smooth);
  const line2 = prog(t, T.stamp + 1.35, 1.2, EASE.smooth);
  const credit = prog(t, T.stamp + 1.75, 1.2, EASE.smooth);
  const fadeOut = 1 - prog(t, T.end - 0.45, 0.45, EASE.smooth);

  const s = 1 - 0.012 * stamp;                 // a 1.2% press as the seal lands
  const half = SEAL.half * s;

  return (
    <>
      {/* paper + the last of the river, behind the seal */}
      <Canvas style={{opacity: fadeOut}}>
        <rect width={1920} height={1080} fill={COLOR.paper} />
        {/* a very slow paper drift, so the frame is never a static photograph */}
        <ellipse cx={960 + Math.sin(t * 0.33) * 260} cy={420 + Math.cos(t * 0.24) * 90} rx={900} ry={470}
          fill={COLOR.paperLt} opacity={0.1} />
        <rect width={1920} height={1080} fill={COLOR.paperLt} opacity={0.42 + paper * 0.2} />
        <g opacity={0.4 * (1 - paper * 0.5)}>
          <InkPath d={FAR} fill={COLOR.inkMid} opacity={0.2} />
          {rippleLines(806, 900, 6, 80, 1840, 277, 0.9).map((r, i) => (
            <path key={i} d={r.d} stroke={COLOR.ink} strokeWidth={1.3} fill="none" opacity={r.o * 0.5} />
          ))}
        </g>
        {/* the paper itself breathes: a barely-there wash travelling across it */}
        <ellipse cx={960 + Math.sin((t - T.s8) * 0.4) * 120} cy={520} rx={820} ry={520}
          fill={COLOR.paperLt} opacity={0.12 + 0.05 * Math.sin((t - T.s8) * 0.55)} />

        {/* dust settling after the stamp: a few slow motes in the light */}
        {stamp > 0 && Array.from({length: 14}, (_, i) => {
          const r = ((i * 61) % 97) / 97, r2 = ((i * 37) % 89) / 89;
          const dy = ((t - (T.s8 + 0.4)) * (26 + r * 34)) % 340;
          return <circle key={i} cx={340 + r * 1240} cy={SEAL.cy - 150 + r2 * 300 + dy} r={1.1 + r2 * 1.6}
            fill={COLOR.ink} opacity={Math.max(0, 0.3 * (1 - dy / 320))} />;
        })}

        {/* the seal's shadow: a hard offset, no blur, like a real stamp on paper */}
        <g opacity={0.12 * stamp}>
          <rect x={SEAL.cx - half + 10} y={SEAL.cy - half + 12} width={half * 2} height={half * 2} rx={6}
            fill={COLOR.ink} transform={`rotate(${SEAL.deg} ${SEAL.cx} ${SEAL.cy})`} />
        </g>
      </Canvas>

      {/* the naming block, in HTML so the type sets properly */}
      <div style={{position: 'absolute', left: 0, right: 0, top: SEAL.cy + SEAL.half + 74, textAlign: 'center',
        opacity: fadeOut}}>
        <div style={{fontFamily: "'Songti SC', serif", fontSize: 34, letterSpacing: '1.05em',
          color: COLOR.ink, paddingLeft: '1.05em', opacity: title}}>
          {COPY.s8.latin}
        </div>
        <div style={{marginTop: 16, fontFamily: "'PingFang SC', sans-serif", fontSize: 18, letterSpacing: '0.62em',
          color: COLOR.inkMid, paddingLeft: '0.62em', opacity: credit}}>
          {COPY.s8.sub}
        </div>
        <div style={{marginTop: 42, display: 'flex', justifyContent: 'center', gap: '0.5em',
          fontFamily: "'Songti SC', serif", fontSize: 60, letterSpacing: '0.3em', color: COLOR.ink}}>
          <span style={{opacity: line1}}>{COPY.s8.line[0]}</span>
          <span style={{opacity: line2}}>{COPY.s8.line[1]}</span>
        </div>
        <div style={{marginTop: 40, marginLeft: 'auto', marginRight: 'auto', width: 268, height: 1.2,
          background: COLOR.ink, opacity: credit * 0.3}} />
        <div style={{marginTop: 18, fontFamily: "'PingFang SC', sans-serif", fontSize: 16, letterSpacing: '0.5em',
          color: COLOR.inkMid, paddingLeft: '0.5em', opacity: credit * 0.85}}>
          北纬 30°16′ · 东经 120°09′
        </div>
      </div>
    </>
  );
};
