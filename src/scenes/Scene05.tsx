// Scene05 (31.0–39.0 s, T) — 龙井. The bridge arch rises, flattens into a rim, and becomes a celadon cup
// (the ring is the rim, drawn by Film.tsx). A tea leaf falls in; steam rises; the cup's shoulder turns
// into a mountain range, so the "mountain" is literally in the cup.
import React from 'react';
import {Canvas, EASE, mix, prog, rand} from '../lib/motion';
import {COLOR, T} from '../spec';
import {CUP, crackle, cupBody, hill, stroke} from '../lib/film';
import {InkPath, Mist, Slug} from '../lib/typo';

const BODY = cupBody();
const CRACKLE = crackle(17, 14);
// the mountain that lives inside the cup's rim: a small ridge with a single pagoda-less peak
const INNER_HILL = hill(CUP.cx - 156, CUP.cx + 156, CUP.rimY + 2, [[CUP.cx - 62, 66, 52], [CUP.cx + 18, 92, 44], [CUP.cx + 92, 54, 40]], 26, 96);
const INNER_REFL = hill(CUP.cx - 156, CUP.cx + 156, CUP.rimY + 30, [[CUP.cx - 60, 30, 56], [CUP.cx + 20, 40, 46], [CUP.cx + 94, 24, 42]], 12, 96);
const TABLE = `M0 838 L1920 838 L1920 1080 L0 1080 Z`;

export const Scene05: React.FC<{t: number}> = ({t}) => {
  if (t < T.s5 - 0.8 || t > T.s6 + 1.0) return null;
  const enter = Math.max(0, t - T.s5);
  const cupIn = Math.min(1, enter / 1.5);
  const teaIn = Math.min(1, Math.max(0, (enter - 1.1) / 1.6));
  const steam = Math.min(1, Math.max(0, (enter - 1.5) / 1.4));
  const leafIn = Math.min(1, Math.max(0, (enter - 1.6) / 2.4));

  // three tea leaves, falling on a slow spiral into the surface
  const leaves = [0, 1, 2].map((i) => {
    const u = Math.max(0, Math.min(1, (enter - 1.4 - i * 0.42) / 2.6));
    const sway = Math.sin(u * 5.2 + i * 2.1) * 46;
    const x = CUP.cx - 30 + i * 34 + sway;
    const y = mix(140, CUP.rimY + 14 + i * 6, Math.pow(u, 1.5));
    const rot = u * 300 + i * 80;
    return {x, y, rot, o: u > 0 && u < 1 ? 1 : 0, u};
  });

  return (
    <>
      <Canvas>
        <rect width={1920} height={1080} fill={COLOR.paper} />
        <rect width={1920} height={1080} fill="#F6F1E6" opacity={0.7} />
        {/* a single cool band at the top: the room's window light, drawn flat */}
        <rect width={1920} height={230} fill={COLOR.paperLt} opacity={0.75} />

        {/* E02 — a tea-shrub branch across the top right, leaves as flat ink shapes */}
        <g opacity={0.62} filter="url(#s5ink)">
          <path d={stroke(1520, -20, 1330, 210, 9, 3, 26)} fill={COLOR.ink} opacity={0.7} />
          <path d={stroke(1640, -10, 1560, 130, 6, 2, -14)} fill={COLOR.ink} opacity={0.5} />
          {Array.from({length: 9}, (_, i) => {
            const u = i / 8, bx = mix(1520, 1330, u) + Math.sin(u * 3.1) * 26, by = mix(-6, 208, u);
            const a = -34 + (i % 3) * 46 + u * 24;
            return <ellipse key={i} cx={bx} cy={by} rx={22} ry={8} fill={COLOR.ink} opacity={0.5}
              transform={`rotate(${a} ${bx} ${by})`} />;
          })}
        </g>
        {/* the same branch's shadow on the table, softer */}
        <g opacity={0.1}>
          <path d={stroke(1520, 820, 1290, 1010, 12, 4, 26)} fill={COLOR.ink} />
        </g>

        {/* table: a flat ink plane, with one hairline for its edge */}
        <path d={TABLE} fill={COLOR.tea} opacity={0.1} />
        <path d="M0 838 L1920 838" stroke={COLOR.tea} strokeWidth={1} opacity={0.2} />
        <path d={stroke(150, 872, 830, 866, 2.6, 3.4, 2)} fill={COLOR.tea} opacity={0.16} />

        {/* the cup's shadow, cast right (one light direction, upper left) */}
        <ellipse cx={CUP.cx + 52} cy={CUP.baseY + 6} rx={CUP.footRx + 44} ry={17} fill={COLOR.ink} opacity={0.16 * cupIn} />

        {/* E05 the cup: celadon body, crackle glaze, a paler foot ring */}
        <g opacity={cupIn}>
          <InkPath d={BODY} fill={COLOR.celadon} opacity={0.92} filter="s5ink" />
          <InkPath d={BODY} fill={COLOR.celadonLt} opacity={0.3} />
          {/* one shade side: the right third of the body */}
          <path d={`M${CUP.cx + 52} ${CUP.rimY + 6} L${CUP.cx + CUP.rx - 4} ${CUP.rimY + 6} L${CUP.cx + CUP.footRx * 1.1} ${CUP.baseY - 4} L${CUP.cx + 34} ${CUP.baseY - 4} Z`}
            fill={COLOR.ink} opacity={0.12} />
          {/* foot ring */}
          <path d={`M${CUP.cx - CUP.footRx} ${CUP.baseY - 2} Q${CUP.cx} ${CUP.baseY + 20} ${CUP.cx + CUP.footRx} ${CUP.baseY - 2} L${CUP.cx + CUP.footRx} ${CUP.baseY + 10} Q${CUP.cx} ${CUP.baseY + 34} ${CUP.cx - CUP.footRx} ${CUP.baseY + 10} Z`}
            fill={COLOR.celadon} opacity={0.8} />
          {CRACKLE.map((d, i) => <path key={i} d={d} stroke={COLOR.ink} strokeWidth={0.85} fill="none" opacity={0.22} />)}
          {/* the tea surface breathes: two slow elliptical rings */}
          {[0, 1].map((i) => (
            <ellipse key={i} cx={CUP.cx + Math.sin(t * 0.5 + i) * 6} cy={CUP.rimY + 6}
              rx={(CUP.rx - 44) * (0.7 + 0.28 * i)} ry={(CUP.ry - 14) * (0.7 + 0.2 * i)}
              fill="none" stroke={COLOR.paperLt} strokeWidth={1.2} opacity={0.16 - i * 0.05} />
          ))}
          {/* tea inside, revealed by the leaf-fall */}
          <ellipse cx={CUP.cx} cy={CUP.rimY + 6} rx={CUP.rx - 6} ry={CUP.ry - 5} fill={COLOR.tea} opacity={0.5 * teaIn} />
          <ellipse cx={CUP.cx} cy={CUP.rimY + 4} rx={CUP.rx - 34} ry={CUP.ry - 15} fill={COLOR.paper} opacity={0.12 * teaIn} />
          {/* the mountain inside the cup (E05): reflected in the tea, so it sits above the liquor */}
          <g opacity={0.94 * teaIn}>
            <clipPath id="cupRim"><ellipse cx={CUP.cx} cy={CUP.rimY + 4} rx={CUP.rx - 8} ry={CUP.ry - 7} /></clipPath>
            <g clipPath="url(#cupRim)">
              {/* the liquor */}
              <ellipse cx={CUP.cx} cy={CUP.rimY + 6} rx={CUP.rx} ry={CUP.ry} fill="#B0894E" />
              {/* the mountain it mirrors, sitting on the far rim */}
              <InkPath d={INNER_HILL} fill="#2C4A3F" opacity={0.96} />
              <InkPath d={INNER_REFL} fill="#2C4A3F" opacity={0.42} />
              {/* water line and a couple of glints */}
              <rect x={CUP.cx - CUP.rx} y={CUP.rimY + 28} width={CUP.rx * 2} height={1.4} fill={COLOR.paperLt} opacity={0.4} />
              {[0, 1, 2].map((k) => (
                <rect key={k} x={CUP.cx - 96 + k * 82} y={CUP.rimY + 38 + k * 9} width={52 - k * 12} height={1.6} rx={1} fill={COLOR.paperLt} opacity={0.32} />
              ))}
            </g>
          </g>
          {leaves.map((l, i) => l.o ? (
            <ellipse key={i} cx={l.x} cy={l.y} rx={13} ry={4.6} fill={COLOR.ink} opacity={0.7}
              transform={`rotate(${l.rot} ${l.x} ${l.y})`} />
          ) : null)}
        </g>

        {/* steam: two rising dry strokes per plume, drifting and thinning */}
        <g opacity={steam} filter="url(#s5ink)">
          {[0, 1, 2, 3].map((i) => {
            const ph = (t * 0.34 + i * 0.27) % 1;
            const x = CUP.cx - 90 + i * 58 + Math.sin(ph * 6.4 + i) * 34;
            const y0 = CUP.rimY - 12 - ph * 300;
            const len = 128 * (1 - ph * 0.3);
            return <path key={i} d={stroke(x, y0, x + Math.sin(ph * 4.1 + i) * 38, y0 - len, 15, 3, 26)} fill={COLOR.paperLt} opacity={0.5 * (1 - ph)} />;
          })}
        </g>
        <Mist t={t} y={430} count={3} opacity={0.09} seed={171} speed={7} width={420} />
      </Canvas>

      <Slug num="05" cn="龙井" en="LONGJING TEA" t={t} start={T.s5 + 1.0} color={COLOR.tea} />
      <div style={{position: 'absolute', left: 150, top: 236, fontFamily: 'Songti SC, serif', color: COLOR.ink,
        fontSize: 96, letterSpacing: '0.16em', fontWeight: 400, lineHeight: 1.2,
        opacity: Math.max(0, Math.min(1, (t - T.s5 - 1.3) / 1.4))}}>
        一盏青山
      </div>
    </>
  );
};
