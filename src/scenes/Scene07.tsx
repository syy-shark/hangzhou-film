// Scene07 (46.5–53.5 s, T) — 钱塘江. The silk's leading edge stands up and becomes the bore's lip, which
// travels right as the tide; 六和塔 stands on the bank above it. The ring rides at the crest.
// Layer order back→front: sky · far band · far bank · river · bore · near bank · tower.
import React from 'react';
import {Canvas, EASE, mix, prog, rand} from '../lib/motion';
import {COLOR, T} from '../spec';
import {crestX, finial, hill, pagoda, rippleLines, stroke, tideFoam, tideLip} from '../lib/film';
import {InkPath, Mist, Slug} from '../lib/typo';

const FAR_BANK = hill(-160, 2080, 592, [[300, 44, 240], [980, 32, 260], [1520, 50, 220]], 22);
const NEAR_BANK = hill(-160, 2080, 936, [[180, 26, 220], [1150, 20, 260], [1760, 30, 240]], 300);
const TOWER = pagoda(1612, 936, 236, 7, 25);
const TOWER_TOP = finial(1612, TOWER.top, 29);

export const Scene07: React.FC<{t: number}> = ({t}) => {
  if (t < T.s7 - 0.8 || t > T.s8 + 1.2) return null;
  const enter = Math.max(0, t - T.s7);
  const ink = Math.min(1, enter / 1.1);
  const crest = crestX(t);
  const lip = tideLip(t);
  const foam = tideFoam(t);
  const surge = Math.max(0, Math.min(1, (t - 47.0) / 1.6));
  // spray only where the lip is steep, always deterministic in t
  const spray = Array.from({length: 18}, (_, i) => {
    const r = rand(17 + i * 2.7), r2 = rand(43 + i * 1.9);
    const d = 26 + r2 * 96;
    return {x: crest + 8 + Math.cos(-0.4 - r * 1.1) * d * 0.8, y: 528 + Math.sin(-0.4 - r * 1.1) * d, r: 2 + r * 3.2, o: (0.25 + r2 * 0.5) * surge};
  });

  return (
    <>
      <Canvas>
        <rect width={1920} height={1080} fill={COLOR.paper} />
        <rect width={1920} height={430} fill={COLOR.paperLt} opacity={0.72} />

        <InkPath d={FAR_BANK} fill={COLOR.inkMid} opacity={0.3} />

        {/* the river: one flat plane, paler than the banks */}
        <rect y={598} width={1920} height={300} fill={COLOR.paperLt} opacity={0.55} />
        {rippleLines(636, 880, 13, -40, 1960, 193, 1.35).map((r, i) => (
          <path key={i} d={r.d} stroke={COLOR.ink} strokeWidth={1.6} fill="none" opacity={r.o * 0.8} />
        ))}

        {/* E07 the bore */}
        <g opacity={ink}>
          <InkPath d={lip} fill={COLOR.ink} opacity={0.82} />
          {/* the face catches light: a paler wash on the forward third */}
          <path d={lip} fill={COLOR.paperLt} opacity={0.1} />
          {foam.map((f, i) => (
            <path key={i} d={f.d} stroke={COLOR.paperLt} strokeWidth={f.w} strokeLinecap="round" fill="none" opacity={f.o} />
          ))}
          {spray.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={COLOR.paperLt} opacity={s.o * 0.85} />)}
          {/* the trough behind the lip: dark strokes pulling left */}
          {Array.from({length: 7}, (_, i) => {
            const y = 620 + i * 26;
            const x1 = Math.max(-40, crest - 880 - i * 26);
            return <path key={i} d={stroke(x1, y, crest - 30, y + 8, 1.6 + i * 0.24, 0.8, 4)} fill={COLOR.ink} opacity={0.13 - i * 0.01} />;
          })}
        </g>

        {/* near bank: a long dark shelf across the bottom, the tower standing on it */}
        <InkPath d={NEAR_BANK} fill={COLOR.ink} opacity={0.88} />
        <g opacity={0.94}>
          {/* the tower sits on the shelf, so it is drawn in ink against the pale river */}
          {TOWER.bodies.map((d, i) => <InkPath key={`b${i}`} d={d} fill={COLOR.ink} opacity={0.94} />)}
          {TOWER.roofs.map((d, i) => <InkPath key={`r${i}`} d={d} fill={COLOR.ink} opacity={0.98} />)}
          <InkPath d={TOWER_TOP.spire} fill={COLOR.ink} />
          {TOWER_TOP.rings.map((d, i) => <path key={`f${i}`} d={d} stroke={COLOR.ink} strokeWidth={3} fill="none" />)}
          {TOWER.windows.map(([x, y], i) => <circle key={`w${i}`} cx={x} cy={y} r={2.6} fill={COLOR.paperLt} opacity={0.8} />)}
        </g>

        <Mist t={t} y={566} count={4} opacity={0.13} seed={233} speed={9} width={760} />
      </Canvas>

      <Slug num="07" cn="钱塘" en="QIANTANG" t={t} start={T.s7 + 1.1} color={COLOR.inkMid} />
      <div style={{position: 'absolute', left: 150, top: 196, fontFamily: "'Songti SC', serif", color: COLOR.ink,
        fontSize: 94, letterSpacing: '0.1em', fontWeight: 400, lineHeight: 1.3,
        opacity: Math.max(0, Math.min(1, (t - T.s7 - 1.3) / 1.4))}}>
        潮来，<br />天地一线
      </div>
    </>
  );
};
